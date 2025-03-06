import { setupEnvironment } from "@/actions/ setupEnvironment";
import Image from "next/image";

export default function Home() {
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

        <div className="w-full max-w-xl bg-[#111111] rounded-lg p-5 mb-12 border border-stone-800 shadow-lg relative">
          <div className="flex items-center">
            <textarea
              placeholder="Ask Fireman to create a blog about ..."
              className="bg-transparent w-full outline-none text-gray-300 resize-none h-24 p-2"
            />
            <button
              onClick={setupEnvironment}
              className="absolute right-5 bottom-5 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors"
            >
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

        {/* Quick Start Options */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 max-w-2xl mx-auto">
          {[
            "Build Todo Application",
            "Music Player",
            "Blog Website",
            "SAAS Dashboard",
          ].map((item) => (
            <button
              key={item}
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
