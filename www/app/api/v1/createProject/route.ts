import { db } from "@/db/drizzle";
import { projects } from "@/db/schema/projects";
import { validateAndGetUser } from "@/lib/validateAndGetUser";
import { NextResponse } from "next/server";

/*
 * Constants for HTTP status codes and default values
 */
const STATUS_UNAUTHORIZED = 401;
const STATUS_INTERNAL_ERROR = 500;
const DEFAULT_PROJECT_NAME = "Untitled";
const DEFAULT_PROJECT_DESCRIPTION = "Laraval Application Boilerplate";

/*
 * Type definition for project creation response from internal worker
 */
interface WorkerProjectResponse {
  projectId: string;
  container: {
    containerId: string;
    port: number;
  };
}

/*
 * Creates a new project by calling the internal worker API
 * @returns Project details from worker response
 */
const createProjectInWorker = async (): Promise<WorkerProjectResponse> => {
  const url = `${process.env.INTERNAL_WORKER_URL}/api/create_project`;

  const response = await fetch(url, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      `Worker API request failed with status: ${response.status}`
    );
  }

  return response.json();
};

/*
 * Inserts project details into the database
 * @param userId - ID of the user creating the project
 * @param containerId - Container ID from worker response
 * @returns Created project record
 */
const saveProjectToDatabase = async (userId: string, containerId: string) => {
  const [project] = await db
    .insert(projects)
    .values({
      name: DEFAULT_PROJECT_NAME,
      userId,
      description: DEFAULT_PROJECT_DESCRIPTION,
      containerId,
    })
    .returning();

  return project;
};

/*
 * Handles POST requests to create a new project
 * @returns NextResponse with project details or error
 */
export async function POST(): Promise<NextResponse> {
  try {
    /*
     * Validate authentication and get user
     */
    const user = await validateAndGetUser();

    /*
     * Create project via worker API
     */
    const projectDetails = await createProjectInWorker();

    /*
     * Save project to database
     */
    const project = await saveProjectToDatabase(
      user.id,
      projectDetails.container.containerId
    );

    /*
     * Construct and return successful response
     */
    return NextResponse.json(
      {
        projectId: project.id,
        application: {
          port: projectDetails.container.port,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    /*
     * Handle errors and return appropriate response
     */
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: STATUS_UNAUTHORIZED }
      );
    }

    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: STATUS_INTERNAL_ERROR }
    );
  }
}
