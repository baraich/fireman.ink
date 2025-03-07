// src/app/api/sendMessage/route.ts
import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { messages } from "@/db/schema/messages";

/*
 * Validation schema for send message request body
 */
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

/*
 * Constants for worker configuration
 */
const WORKER_URL = process.env.INTERNAL_WORKER_URL;
const SEND_MESSAGE_ENDPOINT = "/api/send_message";

/*
 * Creates a transform stream to capture the full assistant message and save to DB
 * @param projectId - Project ID for the message
 * @param userId - User ID for the message
 * @param userContent - Original user message content
 * @returns TransformStream that processes the worker response
 */
const createMessageSaverStream = (
  projectId: string,
  userId: string,
  userContent: string,
  saveUser: boolean
) => {
  let fullResponse = "";

  return new TransformStream({
    transform(chunk, controller) {
      /*
       * Accumulate the response chunks
       */
      fullResponse += new TextDecoder().decode(chunk);
      controller.enqueue(chunk);
    },
    async flush() {
      /*
       * Save both user and assistant messages to database when stream closes
       */
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
                  content: fullResponse,
                },
              ]
            : [
                {
                  projectId,
                  userId,
                  type: "assistant",
                  content: fullResponse,
                },
              ]
        );
      } catch (error) {
        console.error("Error saving messages to database:", error);
      }
    },
  });
};

/*
 * POST handler for sending messages to the internal worker
 * @param request - Incoming request object
 * @returns Streamed response from worker
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    /*
     * Parse and validate request body
     */
    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);
    const { projectId, userId, content } = validatedData;

    /*
     * Validate worker URL configuration
     */
    if (!WORKER_URL) {
      throw new Error("INTERNAL_WORKER_URL is not configured");
    }

    /*
     * Forward request to internal worker with streaming
     */
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

    /*
     * Check if worker response is valid
     */
    if (!workerResponse.ok) {
      throw new Error(`Worker responded with status: ${workerResponse.status}`);
    }

    /*
     * Ensure response body is streamable
     */
    const stream = workerResponse.body;
    if (!stream) {
      throw new Error("Worker response body is not streamable");
    }

    /*
     * Pipe the stream through our message saver
     */
    const messageSaverStream = createMessageSaverStream(
      projectId,
      userId,
      content,
      !validatedData.new
    );
    const finalStream = stream.pipeThrough(messageSaverStream);

    /*
     * Forward the streamed response back to client
     */
    return new NextResponse(finalStream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    /*
     * Handle validation and request errors
     */
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
