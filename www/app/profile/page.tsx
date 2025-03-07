import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
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
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
