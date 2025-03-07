import express from "express";
import { config } from "dotenv";
import { ProjectManager } from "./lib/manager/docker";

/**
 * Configure dotenv to load environment variables from .env file.
 * The path option is used to specify the location of the environment file.
 */
config({ path: ".env" });

/**
 * Initializing the main express application.
 */
const app = express();
const projectManager = new ProjectManager();

app.post("/api/create_project", async (request, response) => {
  console.log("Creating Project");
  const container = await projectManager.createProject();

  response.json({
    container: {
      port: container.port,
      containerId: container.containerId,
    },
    projectId: container.containerId,
  });
});

/**
 * Starting the web server on a specified PORT.
 * Uses the PORT from the environment variable with a fallback to 7680.
 * Logs a confirmation message to the console when the server has started.
 */
app.listen(process.env.PORT || 7680, () => {
  console.log(`Server running on PORT: ${process.env.PORT}`);
});
