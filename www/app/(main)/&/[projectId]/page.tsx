import Browser from "@/components/Browser";
import { db } from "@/db/drizzle";
import { messages } from "@/db/schema/messages";
import { projects } from "@/db/schema/projects";
import { validateAndGetUser } from "@/lib/validateAndGetUser";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { toast } from "sonner";
import ChatIntefaceLoader from "@/components/ChatInterfaceLoader";

/*
 * Type definition for component props
 */
interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ q: string }>;
}

interface MessageInsert {
  type: "user";
  content: string;
  userId: string;
  projectId: string;
}

/*
 * Constants for routing and SVG namespace
 */
const LOGOUT_PATH = "/api/v1/logoutUser";

/*
 * Validates user authentication and retrieves user data
 * @param redirectPath - Path to redirect if authentication fails
 * @returns User object if authenticated
 */
const authenticateUser = async () => {
  try {
    return validateAndGetUser();
  } catch (error) {
    console.log(error);
    redirect(LOGOUT_PATH);
  }
};

/*
 * Fetches project data for the authenticated user
 * @param userId - ID of the authenticated user
 * @param projectId - ID of the project to fetch
 * @returns Project object or triggers notFound
 */
const fetchProject = async (userId: string, projectId: string) => {
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.id, projectId)))
    .limit(1)
    .execute();

  if (!project) {
    notFound();
  }

  return project;
};

/*
 * Fetches project messages or initializes conversation if none exist
 * @param message - Initial message data for new conversations
 * @returns Object containing messages and new conversation flag
 */
async function fetchProjectMessagesOrIfNoneUpsert(message: MessageInsert) {
  try {
    /*
     * Fetch existing messages
     */
    const conversation = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.userId, message.userId),
          eq(messages.projectId, message.projectId)
        )
      )
      .execute();

    /*
     * If no messages exist, start new conversation
     */
    if (conversation.length === 0) {
      const newMessages = await db
        .insert(messages)
        .values({
          type: message.type,
          content: message.content,
          userId: message.userId,
          projectId: message.projectId,
        })
        .returning();

      return { messages: newMessages, newConversation: true };
    }

    return { messages: conversation, newConversation: false };
  } catch (error) {
    /*
     * Handle database errors
     */
    console.error("Message fetch/insert error:", error);
    toast.error("Failed to fetch conversation, please try again later.");
    return { messages: [], newConversation: false };
  }
}

/*
 * ProjectPage component displaying project details and interaction UI
 * @param params - Dynamic route parameters including projectId
 */
export default async function ProjectPage({
  params,
  searchParams,
}: ProjectPageProps) {
  /*
   * Authenticate user and fetch project data
   */
  const user = await authenticateUser();
  const { projectId } = await params;
  const { q } = await searchParams;
  const project = await fetchProject(user.id, projectId);
  const { messages, newConversation } =
    await fetchProjectMessagesOrIfNoneUpsert({
      type: "user",
      content: q,
      userId: user.id,
      projectId: project.id,
    });

  return (
    <main className="flex-1 flex flex-col p-4 md:p-8 lg:max-w-screen">
      <div className="lg:min-w-6xl mx-auto w-full">
        <div className="flex justify-between gap-4">
          {/* Chat Interface */}
          <ChatIntefaceLoader
            messages={messages || []}
            userId={user.id}
            initials={user.name.charAt(0).toUpperCase()}
            projectId={projectId}
            q={q}
            newConversation={newConversation}
          />

          {/* Browser Window UI */}
          <div className="hidden xl:block max-h-[90vh] sticky top-5">
            <Browser
              address={
                process.env.DEV
                  ? `http://localhost:7680/api/proxy/${project.id}`
                  : `https://${project.id}.${
                      new URL(process.env.NEXTAUTH_URL!).host
                    }/`
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}
