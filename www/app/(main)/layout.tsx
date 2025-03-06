import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayoutProps({ children }: MainLayoutProps) {
  return (
    <div className="h-screen w-screen overflow-auto bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-5 md:px-8 lg:px-12 border-b border-stone-800 sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md">
        <Link href="/">
          <div className="flex items-center">
            <Image
              src={"/logo.svg"}
              alt="Fireman Logo"
              width={32}
              height={32}
              className="mr-2"
            />
            <span className="font-bold text-xl">fireman</span>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          <Link href={"/signin"}>
            <button className="px-5 py-3 rounded-full border-2 border-stone-700/40 hover:bg-gray-900 hover:cursor-pointer transition-colors text-sm font-medium">
              Sign In
            </button>
          </Link>
          <button className="px-5 cursor-pointer py-3 rounded-full bg-white text-black hover:bg-gray-200 transform-colors text-sm font-medium">
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className="p-8 border-t border-stone-800">
        <div className="container mx-auto px-6 max-w-6xl flex justify-between items-center">
          <Link href={"/"}>
            <div className="hidden md:flex items-center">
              <Image
                src="/logo.svg"
                alt="Fireman Logo"
                width={32}
                height={32}
                className="mr-2"
              />
              <span className="font-bold text-xl">fireman</span>
            </div>
          </Link>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">
              Terms & Conditions
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
