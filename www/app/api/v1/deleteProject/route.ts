import { db } from "@/db/drizzle";
import { messages } from "@/db/schema/messages";
import { projects } from "@/db/schema/projects";
import { validateAndGetUser } from "@/lib/validateAndGetUser";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/*
 * Constants for API configuration
 */
const DELETE_PROJECT_WORKER_ENDPOINT = "/api/delete_project";
const WORKER_URL = process.env.INTERNAL_WORKER_URL;

/*
 * Interface for delete project request payload to worker
 */
interface DeleteProjectPayload {
  containerId: string;
}

/*
 * POST handler for deleting a project
 * @returns NextResponse with success or error status
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    /*
     * Validate and get authenticated user
     */
    const user = await validateAndGetUser();

    /*
     * Extract projectId from request body
     */
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    /*
     * Fetch project from database
     */
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.userId, user.id), eq(projects.id, projectId)))
      .limit(1);

    /*
     * Validate project existence
     */
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    /*
     * Send delete request to worker service
     */
    if (!WORKER_URL) {
      throw new Error("INTERNAL_WORKER_URL is not configured");
    }

    const payload: DeleteProjectPayload = { containerId: project.containerId };
    const workerResponse = await fetch(
      `${WORKER_URL}${DELETE_PROJECT_WORKER_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    /*
     * Check worker response
     */
    if (!workerResponse.ok) {
      throw new Error(`Worker failed with status: ${workerResponse.status}`);
    }

    await db.delete(messages).where(eq(messages.projectId, project.id));
    /**
     * Remove the project from the database.
     */
    await db
      .delete(projects)
      .where(and(eq(projects.id, project.id), eq(projects.userId, user.id)))
      .execute();

    /*
     * Return success response
     */
    return NextResponse.json(
      { status: true, message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    /*
     * Handle errors and return appropriate response
     */
    console.error("Error deleting project:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      { status: false, error: `Failed to delete project: ${errorMessage}` },
      { status: 500 }
    );
  }
}
