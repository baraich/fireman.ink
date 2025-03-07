import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { db } from "@/db/drizzle";
import { projects } from "@/db/schema/projects";
import { validateAndGetUser } from "@/lib/validateAndGetUser";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

/*
 * Register Chart.js components for potential future use
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/*
 * Constants for routing
 */
const SIGNIN_PATH = "/signin";

const formatDate = (dateString: Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/*
 * Validates user session and redirects if unauthorized
 * @returns User session data if authenticated
 */
const authenticateUser = async () => {
  const user = validateAndGetUser();
  if (!user) {
    return redirect(SIGNIN_PATH);
  }
  return user;
};

/*
 * Fetches user projects from the database
 * @param userEmail - User's email for project filtering
 * @returns Array of user's projects
 */
const fetchUserProjects = async (userId: string) => {
  try {
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId));
    return userProjects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

/*
 * Profile page component displaying user information and projects
 */
export default async function Profile() {
  /*
   * Authenticate user and fetch data
   */
  const user = await authenticateUser();
  const projects = await fetchUserProjects(user.id);

  return (
    <div className="h-screen w-screen overflow-auto bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <Header useLogoutInPlaceOfUserIcon={true} />

      <main className="flex-1 flex flex-col px-6 py-12 md:py-16 max-w-6xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-gray-400">
            Manage your projects and view token usage.
          </p>
        </div>

        <div className="bg-[#111111] rounded-lg p-6 border border-gray-800 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 min-w-12 min-h-12 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-purple-500 flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">
                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">
                    <span className="text-orange-300 text-xs bg-stone-800/75 p-1 px-2">
                      Early Bird
                    </span>
                  </span>
                  <p className="text-gray-400 truncate">
                    {user.email || "No email available"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <p className="text-sm text-gray-400 mb-1">Token Usage</p>
              <span>Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Projects Section - Placeholder for future implementation */}
        {projects.length > 0 && (
          <div className="bg-[#111111] rounded-lg p-6 border border-gray-800 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Your Projects</h2>

            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg truncate">
                      {project.name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Created: {formatDate(project.createdAt!)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-800 p-3 flex justify-between items-center">
                  <Link href={`/&/${project.id}`}>
                    <button className="px-3 py-1.5 bg-stone-800 cursor-pointer hover:bg-stone-700 rounded text-xs font-medium transition-colors">
                      Open Editor
                    </button>
                  </Link>
                  <button
                    className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors"
                    aria-label="Delete project"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
