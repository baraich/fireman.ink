"use client";

import Link from "next/link";

export default function SignIn() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-28">
      <div className="w-full max-w-lg backdrop-grayscale-50 bg-stone-900/40 p-8 rounded-xl shadow ring ring-stone-700">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3">Sign in to Fireman</h1>
          <p className="text-gray-400 text-lg">
            Enter your credentials to access your account.
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@domain.tld"
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-gray-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <Link
                href="#"
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-gray-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Don&quot;t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
