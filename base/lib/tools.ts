import { db } from "@/db/drizzle";
import { projects } from "@/db/schema/projects";
import { tool } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ProjectManager } from "./manager/docker";

const projectManager = new ProjectManager();
export const tools = {
  getProjectStructure: tool({
    description: "Gives the information about the Laravel project's structure",
    parameters: z.object({ projectId: z.string().describe("Project Id") }),
    execute: async ({ projectId }) => {
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (!project) {
        return "Failed to find the project! DO NOT START FROM SCRATCH, AND POLIETLY TELL THE USER THAT THE PROEJCT IS NOT FOUND AND THEY NEED TO DELTE THIS PROJECT AND START OVER. AGAIN DO NOT START FROM SCRATCH RATHER FAIL GRACEFULLY. DO NOT ASK THEM IF THEY PROVIDED THE CORRECT DETAILS, JUST SAY PLEASE START OVER AND DELETE THIS THREAD.";
      }
      const container = projectManager.getContainer(
        // "654855b0e2eacc1e90e17d2dccfd126cbe62c0855e88db9208ba2a2c73e18d31"
        project.containerId
      );
      if (!container) {
        return "Failed to find the project! DO NOT START FROM SCRATCH, AND POLIETLY TELL THE USER THAT THE PROEJCT IS NOT FOUND AND THEY NEED TO DELTE THIS PROJECT AND START OVER. AGAIN DO NOT START FROM SCRATCH RATHER FAIL GRACEFULLY. DO NOT ASK THEM IF THEY PROVIDED THE CORRECT DETAILS, JUST SAY PLEASE START OVER AND DELETE THIS THREAD.";
      }

      const command = await container.exec({
        Cmd: ["tree", "-L", "3", "/var/www/html"],
        AttachStdout: true,
        AttachStderr: true,
      });
      const stream = await command.start({});

      let output = "";
      stream.on("data", (chunk) => {
        output += chunk.toString();
      });

      return new Promise((resolve, reject) => {
        stream.on("end", () => resolve(output));
        stream.on("error", (err) => reject(err));
      });
    },
  }),
};
