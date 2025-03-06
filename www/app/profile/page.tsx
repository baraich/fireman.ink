import Footer from "@/components/Footer";
import Header from "@/components/Header";
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
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
// import { Line } from "react-chartjs-2";

// Register Chart.js components
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

export default async function Profile() {
  const session = await getServerSession();
  if (!session) return redirect("/signin");
  if (!session.user) return redirect("/signin");

  return (
    <div className="h-screen w-screen overflow-auto bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <Header useLogoutInPlaceOfUserIcon={true} />

      <main className="flex-1 flex flex-col px-6 py-12 md:py-16 max-w-6xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-gray-400">
            Manage your account and view token usage
          </p>
        </div>

        <div className="bg-[#111111] rounded-lg p-6 border border-gray-800 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 min-w-12 min-h-12 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-purple-500 flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">
                    {session.user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium">
                    <span className="text-orange-300 text-xs bg-stone-800/75 p-1 px-2">
                      Early Bird
                    </span>
                  </span>
                  <p className="text-gray-400 truncate">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end">
              <p className="text-sm text-gray-400 mb-1">Token Usage</p>
              <span>Comming Soon</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
