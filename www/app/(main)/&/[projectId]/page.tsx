"use client";
import {
  Check,
  ChevronDown,
  ChevronsLeftRightEllipsisIcon,
} from "lucide-react";
import { IBM_Plex_Mono } from "next/font/google";
import { useEffect } from "react";
import Prism from "prismjs";

import "prismjs/themes/prism-tomorrow.min.css";
import "prismjs/components/prism-properties";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400"],
  subsets: ["latin"],
});

export default function ProjectPage() {
  useEffect(function () {
    Prism.highlightAll();
  }, []);

  return (
    <main className="flex-1 flex flex-col p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-[#111111] rounded-lg border border-stone-800 shadow-lg flex flex-col h-full">
          {/* Messages Container */}
          <div className="flex-1 p-5 overflow-auto">
            <div className="space-y-6">
              {/* User Message */}
              <div className="bg-[#0d0d0d] rounded-lg p-4 border border-stone-800">
                <div className="flex items-center p-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-purple-500 flex items-center justify-center mr-3">
                    <span className="text-white font-bold">G</span>
                  </div>
                  <p className="text-gray-300 font-medium leading-7">
                    Build a todo application
                  </p>
                </div>
              </div>

              {/* Asssitant Message */}
              <div className="bg-[#161616] rounded-lg p-4 border border-stone-800">
                <div className="flex items-center p-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-blue-500 flex items-center justify-center mr-3">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <p className="text-gray-300 font-medium">Fireman</p>
                </div>
                <div className="pl-13 text-white leading-7">
                  <p>
                    I&apos;ll help you create a beautiful and functional todo
                    application with React and TypeScript. We&apos;ll include
                    features like adding, completing, and deleting todos, along
                    with a clean UI using Tailwind CSS.
                  </p>
                </div>
              </div>

              {/* Tool Message */}
              <div className="bg-stone-950 rounded-lg border border-stone-800 overflow-x-hidden">
                {/* Tool Header */}
                <div className="w-full border-b h-auto flex justify-between border-stone-800">
                  <p className="font-medium p-8 text-lg">
                    Create Todo Application
                  </p>
                  <div className="h-auto w-24 flex items-center hover:bg-stone-900 justify-center border-l-2 cursor-pointer border-stone-800">
                    <ChevronDown className="size-7" />
                  </div>
                </div>

                {/* Tool Content */}
                <div className="p-8">
                  <ul className="space-y-4">
                    <li>
                      <div className="flex gap-2">
                        <Check className="text-teal-600" />
                        <span>Create Inital Files</span>
                      </div>
                    </li>
                    <li>
                      <div className="flex gap-2">
                        <Check className="text-teal-600" />
                        <span>Install Dependanciees</span>
                      </div>
                    </li>
                    <li>
                      <div className="flex gap-2 flex-col">
                        <div className="flex gap-2">
                          <ChevronsLeftRightEllipsisIcon className="text-blue-300" />
                          <p>Starting Server</p>
                        </div>
                        <div>
                          <pre
                            tabIndex={0}
                            style={{
                              backgroundColor:
                                "var(--color-stone-800) !important",
                            }}
                            className="mt-2 p-4 rounded-lg bg-stone-800 language-properties"
                          >
                            <code
                              className={`language-properties`}
                              style={{
                                fontFamily:
                                  ibmPlexMono.style.fontFamily + " !important",
                              }}
                            >
                              {`php artisan serve`}
                            </code>
                          </pre>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="w-auto bg-[#0d0d0d] rounded-lg p-5 m-5 border border-stone-800 shadow-lg relative">
            <div className="flex items-center">
              <textarea
                placeholder="Ask Fireman to create a blog about ..."
                className="bg-transparent w-full outline-none text-gray-300 resize-none h-24 p-2"
              />
              <button className="absolute right-5 bottom-5 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
