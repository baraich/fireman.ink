// src/server.ts
import express, { Request, Response } from "express";
import { config } from "dotenv";
import { ProjectManager } from "@/lib/manager/docker";
import { db } from "./db/drizzle";
import { projects } from "./db/schema/projects";
import { eq } from "drizzle-orm";
import { createProxyMiddleware } from "http-proxy-middleware";
import { defaultFiremanAgent } from "./lib/completition";

/*
 * Constants for server configuration
 */
const DEFAULT_PORT = 7680;
const ENV_FILE_PATH = ".env";
const CONTAINER_PORT = "80/tcp";

/*
 * Type definition for project creation response
 */
interface ProjectCreationResponse {
  container: {
    port: number;
    containerId: string;
  };
  projectId: string;
}

/*
 * Type definition for proxy route parameters
 */
interface ProxyParams {
  projectId: string;
}

/*
 * Configure dotenv to load environment variables
 */
config({ path: ENV_FILE_PATH });

/*
 * Initialize Express application and ProjectManager
 */
const app = express();
app.use(express.json());
const projectManager = new ProjectManager();

/*
 * Route handler for creating a new project
 * POST /api/create_project
 */
app.post(
  "/api/create_project",
  async (_request: Request, response: Response) => {
    try {
      /*
       * Create new project container
       */
      const container = await projectManager.createProject();

      /*
       * Send successful response with container details
       */
      const responseData: ProjectCreationResponse = {
        container: {
          port: container.port,
          containerId: container.containerId,
        },
        projectId: container.containerId,
      };

      response.json(responseData);
    } catch (error) {
      /*
       * Handle errors during project creation
       */
      console.error("Project creation error:", error);
      response.status(500).json({
        error:
          "Failed to create project: " +
          (error instanceof Error ? error.message : "Unknown error"),
      });
    }
  }
);

/**
 * Route handler for delete a project
 * POST /api/delete_project
 */
app.post("/api/delete_project", async (request, response) => {
  try {
    const { containerId } = request.body;
    if (!containerId || typeof containerId !== "string") {
      response.status(400).json({
        message:
          "Invalid request: containerId is required and must be a string",
      });
      return;
    }

    await projectManager.deleteContainer(containerId);
    response.json({ ok: true, message: "Container deleted!" });
  } catch (error) {
    /*
     * Handle errors during container deletion
     */
    console.error("Error deleting container:", error);
    const errorMessage =
      error instanceof Error
        ? `Failed to delete container: ${error.message}`
        : "Unknown error occurred while deleting container";

    response.status(500).json({
      message: errorMessage,
    });
  }
});

/*
 * Route handler for sending messages to Fireman agent
 * POST /api/send_message
 * @param request - Express Request object containing message content
 * @param response - Express Response object for streaming response
 */
app.post("/api/send_message", async (request, response) => {
  try {
    /*
     * Extract content from request body
     */
    const { content } = request.body;
    if (!content || typeof content !== "string") {
      response.status(400).json({
        error: "Invalid request: content is required and must be a string",
      });
      return;
    }

    /*
     * Create a ReadableStream for the thinking process
     */
    const stream = new ReadableStream({
      async start(controller) {
        let subscriptionActive = true;

        /*
         * Subscribe to the 'thinking' event and stream updates
         */
        defaultFiremanAgent.subscribe("thinking", (thought: string) => {
          if (subscriptionActive) {
            controller.enqueue(new TextEncoder().encode(thought));
          }
        });

        try {
          /*
           * Process the message
           */
          await defaultFiremanAgent.processMessage(content);
        } catch (error) {
          /*
           * Handle processing error within the stream
           */
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          controller.enqueue(
            new TextEncoder().encode(`Error: ${errorMessage}\n`)
          );
        } finally {
          /*
           * Cleanup subscription and close stream
           */
          subscriptionActive = false;
          controller.close();
        }
      },
    });

    /*
     * Set response headers for streaming
     */
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.setHeader("Transfer-Encoding", "chunked");

    /*
     * Pipe the stream to the response
     */
    stream
      .pipeTo(
        new WritableStream({
          write(chunk) {
            response.write(chunk);
          },
          close() {
            response.end();
          },
          abort(error) {
            console.error("Stream aborted:", error);
            response.status(500).send(`Stream error: ${error.message}`);
          },
        })
      )
      .catch((error) => {
        console.error("Pipe error:", error);
        if (!response.headersSent) {
          response.status(500).send(`Stream error: ${error.message}`);
        }
      });
  } catch (error) {
    /*
     * Handle initial setup errors before stream starts
     */
    console.error("Error in send_message setup:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    response
      .status(500)
      .json({ error: `Failed to process message: ${errorMessage}` });
  }
});

/*
 * Route handler for proxying requests to project containers
 * ALL /api/proxy/:projectId
 */
app.all("/api/proxy/:projectId", async (request, response) => {
  try {
    const { projectId } = request.params;

    /*
     * Fetch project details from database
     */
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)
      .execute();

    /*
     * Validate project existence
     */
    if (!project) {
      response.status(404).json({ error: "Project does not exist" });
      return;
    }

    /*
     * Get container instance
     */
    const container = projectManager.getContainer(project.containerId);
    if (!container) {
      response.status(404).json({ error: "Container not found" });
      return;
    }

    /*
     * Inspect container to get port information
     */
    const containerInfo = await container.inspect();
    const port =
      containerInfo.NetworkSettings.Ports[CONTAINER_PORT]?.[0]?.HostPort;

    if (!port) {
      response.status(500).json({ error: "Container port not available" });
      return;
    }

    /*
     * Configure and apply proxy middleware
     */
    const proxy = createProxyMiddleware({
      target: `http://localhost:${port}`,
      changeOrigin: true,
      selfHandleResponse: false,
      pathRewrite: {
        [`^/api/proxy/${projectId}`]: "/",
      },
    });

    proxy(request, response, (error) => {
      if (error) {
        response.status(500).json({ error: `Proxy Error: ${error.message}` });
      }
    });
  } catch (error) {
    /*
     * Handle container-related errors
     */
    console.error("Proxy error:", error);
    response.status(500).json({
      error: `Container Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
});

/*
 * Start the Express server
 */
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;
app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});
