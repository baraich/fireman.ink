// src/server.ts
import express, { Request, Response } from "express";
import { config } from "dotenv";
import { ProjectManager } from "@/lib/manager/docker";
import { db } from "./db/drizzle";
import { projects } from "./db/schema/projects";
import { eq } from "drizzle-orm";
import { createProxyMiddleware } from "http-proxy-middleware";

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
      console.log("Creating Project");
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
