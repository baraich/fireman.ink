import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";

export default async function Header() {
  const session = await getServerSession();

  return (
    <header className="flex justify-between items-center p-5 md:px-8 lg:px-12 border-b border-stone-800 top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md">
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
        {session == null || (session != null && session.user == null) ? (
          <>
            <Link href={"/signin"}>
              <button className="px-5 py-3 rounded-full border-2 border-stone-700/40 hover:bg-gray-900 hover:cursor-pointer transition-colors text-sm font-medium">
                Sign In
              </button>
            </Link>
            <Link href={"/signup"}>
              <button className="px-5 cursor-pointer py-3 rounded-full bg-white text-black hover:bg-gray-200 transform-colors text-sm font-medium">
                Sign Up
              </button>
            </Link>
          </>
        ) : (
          <div className="w-8 h-8 hover:cursor-not-allowed rounded-full bg-gradient-to-br from-blue-500 via-green-500 to-purple-500 flex items-center justify-center mr-3">
            <span className="text-white font-bold">G</span>
          </div>
        )}
      </div>
    </header>
  );
}
