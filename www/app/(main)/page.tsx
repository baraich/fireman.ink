"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { z, ZodError } from "zod";
import { toast } from "sonner";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const SIGNIN_PATH = "/signin";
const API_CREATE_PROJECT = "/api/v1/createProject";

/*
 * Schema for validating API response
 */
const projectResponseSchema = z.object({
  projectId: z.string(),
});

/*
 * Quick start options for project creation
 */
const QUICK_START_OPTIONS = [
  "Todo Application",
  "Music Player",
  "Blog Website",
  "SAAS Dashboard",
];

/*
 * Home page component serving as the main landing page
 */
export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [textAreaContent, setTextAreaContent] = useState<string>("");

  /*
   * Creates a new project via API call
   * Redirects to project page on success
   */
  const createProject = async () => {
    if (!session || !session.user) {
      redirect(SIGNIN_PATH);
      return;
    }

    setLoading(true);

    try {
      /*
       * Make API request to create project
       */
      const response = await axios.post(
        API_CREATE_PROJECT,
        {},
        {
          withCredentials: true,
        }
      );

      /*
       * Validate and parse response
       */
      const { projectId } = projectResponseSchema.parse(response.data);

      /*
       * Redirect to new project page
       */
      router.push(`/&/${projectId}?q=${textAreaContent}`);
    } catch (error) {
      /*
       * Handle errors with appropriate feedback
       */
      let errorMessage = "Failed to create project. Please try again later.";
      if (error instanceof ZodError) {
        errorMessage = "Invalid response from server";
      } else if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage, {
        richColors: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24 text-center">
        {/* Logo */}
        <div className="mb-10">
          <div className="w-24 h-24 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 rounded-full blur-xl opacity-50"></div>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="Fireman Logo"
                width={48}
                height={48}
                className="opacity-90"
              />
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
          Thoughts to App in seconds.
        </h1>

        {/* Subheading */}
        <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto">
          Fireman is your PHP-Laravel genius. Ignite your projects for free
          today.
        </p>

        {/* Project Creation Input */}
        <div className="w-full max-w-xl bg-[#111111] rounded-lg p-5 mb-12 border border-stone-800 shadow-lg relative">
          <div className="flex items-center">
            <textarea
              ref={textAreaRef}
              value={textAreaContent}
              onChange={(e) => setTextAreaContent(e.target.value)}
              placeholder="Ask Fireman to create a blog about ..."
              className="bg-transparent w-full outline-none text-gray-300 resize-none h-24 p-2"
            />
            <button
              disabled={loading}
              onClick={createProject}
              className="absolute right-5 bottom-5 hover:cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <svg
                  xmlns={SVG_NAMESPACE}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Quick Start Options */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 max-w-2xl mx-auto">
          {QUICK_START_OPTIONS.map((item) => (
            <button
              key={item}
              onClick={() => {
                setTextAreaContent(`Build a ${item} ...`);
                textAreaRef.current?.focus();
              }}
              className="px-5 py-2.5 bg-[#111111] rounded-full border border-stone-800 hover:bg-gray-900 transition-colors hover:cursor-pointer text-sm font-medium"
            >
              {item}
            </button>
          ))}
        </div>
      </main>
    </>
  );
}
