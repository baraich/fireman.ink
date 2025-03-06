import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayoutProps({ children }: MainLayoutProps) {
  return (
    <div className="h-screen w-screen overflow-auto bg-[#0a0a0a] text-white flex flex-col">
      {/* Development Warning Banner */}
      <div className="bg-amber-900/80 border-b border-amber-700 p-4 text-center">
        <p className="text-amber-100 text-sm font-medium">
          <span className="font-bold mr-1">{"⚠️"} Development Preview:</span>
          This platform is in early development. Features may change and data
          isn&apos;t permanently stored. Google authentication coming soon.
        </p>
      </div>

      {/* Header */}
      <Header />

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
