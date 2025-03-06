import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
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
  );
}
