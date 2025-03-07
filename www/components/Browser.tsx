"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

interface BrowserProps {
  address: string;
}

const slideIn = (element: HTMLDivElement) => {
  setTimeout(() => element.classList.remove("hidden"), 1000);

  const timeline = gsap.timeline();
  timeline
    .set(element, {
      width: 0,
    })
    .to(element, {
      delay: 1,
      width: (1 - 700 / window.innerWidth) * window.innerWidth,
      duration: 0.8,
      ease: "easeInOut",
    });
};

export default function Browser(options: BrowserProps) {
  const browserContainerElementRef = useRef<HTMLDivElement>(null);

  useEffect(
    function () {
      if (!browserContainerElementRef.current) return;
      slideIn(browserContainerElementRef.current);
    },
    [browserContainerElementRef]
  );

  return (
    <div className="hidden" ref={browserContainerElementRef}>
      <div className="bg-[#111111] max-w-full rounded-lg overflow-hidden border border-stone-800 shadow-lg flex flex-col h-[90vh]">
        {/* Browser Header */}
        <div className="border-b border-stone-800 p-3 flex flex-col space-y-2">
          {/* Browser Controls */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>

          {/* Address Bar */}
          <div className="flex items-center bg-[#0d0d0d] rounded-md px-3 py-2 border border-stone-700">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            <span className="text-gray-300 w-full text-sm truncate">
              {options.address}
            </span>
            <a href={options.address} target="_blank">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 ml-2"
              >
                <path d="M18 15v3H6v-3"></path>
                <path d="M12 3v12"></path>
                <path d="M17 8l-5-5-5 5"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Browser Content (iframe) */}
        <div className="flex-1 bg-white">
          <iframe
            src={options.address}
            className="w-full h-screen border-none"
            title={options.address}
            sandbox="allow-same-origin allow-scripts"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
