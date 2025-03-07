"use client";

import { Project } from "@/db/schema/projects";
import axios from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

/*
 * Constants from W3C SVG namespace specification
 * SVG namespace: http://www.w3.org/2000/svg as defined in SVG 1.0 Specification
 */
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

/*
 * Date formatting options for consistent display
 */
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

/*
 * Formats a date string into a readable format
 * @param dateString - Date object or string to format
 * @returns Formatted date string
 */
const formatDate = (dateString: Date): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", DATE_FORMAT_OPTIONS);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

/*
 * ProjectCard component for displaying individual project information
 * @param project - Project data from database schema
 */
export default function ProjectCard(project: Project) {
  /*
   * State for tracking deletion status
   */
  const [deletingProject, setDeletingProject] = useState<boolean>(false);

  /*
   * Handles project deletion
   * Note: Implementation is incomplete in original code
   */
  const handleDelete = async () => {
    setDeletingProject(true);
    try {
      const response = await axios.post(
        "/api/v1/deleteProject",
        {
          projectId: project.id,
        },
        { withCredentials: true }
      );
      const projectDeleteResponse = z.object({
        status: z.boolean(),
      });
      const { status } = projectDeleteResponse.parse(response.data);
      if (status) {
        toast.success("Project deleted successfully.", {
          richColors: true,
        });
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Cannot delete project, please try again later.", {
        richColors: true,
      });
    } finally {
      setDeletingProject(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg truncate">{project.name}</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description || "No description available"}
        </p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            Created: {project.createdAt ? formatDate(project.createdAt) : "N/A"}
          </span>
        </div>
      </div>
      <div className="border-t border-gray-800 p-3 flex justify-between items-center">
        <Link href={`/&/${project.id}`}>
          <button className="px-3 py-1.5 bg-stone-800 cursor-pointer hover:bg-stone-700 rounded text-xs font-medium transition-colors">
            Open Editor
          </button>
        </Link>
        <button
          disabled={deletingProject}
          onClick={handleDelete}
          className="p-1.5 text-gray-400 hover:cursor-pointer hover:text-red-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Delete project"
        >
          {deletingProject ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            <svg
              xmlns={SVG_NAMESPACE}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
