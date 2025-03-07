import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { messages } from "@/db/schema/messages";

const sendMessageSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  new: z.boolean(),
  content: z.string(),
  history: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
    })
  ),
});

const WORKER_URL = process.env.INTERNAL_WORKER_URL;
const SEND_MESSAGE_ENDPOINT = "/api/send_message";

async function saveMessages(
  projectId: string,
  userId: string,
  userContent: string,
  assistantContent: string,
  saveUser: boolean
) {
  try {
    await db.insert(messages).values(
      saveUser
        ? [
            {
              projectId,
              userId,
              type: "user",
              content: userContent,
            },
            {
              projectId,
              userId,
              type: "assistant",
              content: assistantContent,
            },
          ]
        : [
            {
              projectId,
              userId,
              type: "assistant",
              content: assistantContent,
            },
          ]
    );
  } catch (error) {
    console.error("Error saving messages to database:", error);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);
    const { projectId, userId, content } = validatedData;

    // Validate worker URL configuration
    if (!WORKER_URL) {
      throw new Error("INTERNAL_WORKER_URL is not configured");
    }

    // Forward request to internal worker synchronously
    const workerResponse = await fetch(
      `${WORKER_URL}${SEND_MESSAGE_ENDPOINT}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: validatedData.content,
          history: validatedData.history,
        }),
      }
    );

    // Check if worker response is valid
    if (!workerResponse.ok) {
      throw new Error(`Worker responded with status: ${workerResponse.status}`);
    }

    // Get the complete response
    const responseData = await workerResponse.json();

    // Save messages to database
    await saveMessages(
      projectId,
      userId,
      content,
      responseData.message,
      !validatedData.new
    );

    // Return complete response
    return NextResponse.json(
      {
        message: responseData.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send message error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Failed to send message: ${errorMessage}` },
      { status: 500 }
    );
  }
}
