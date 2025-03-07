import { getCsrfToken } from "next-auth/react";
import Link from "next/link";
import { SignInForm } from "./_components/SignInForm";

export default async function SignIn() {
  const csrfToken = await getCsrfToken();

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-28">
      <div className="w-full max-w-lg backdrop-grayscale-50 bg-stone-900/40 p-8 rounded-xl shadow ring ring-stone-700">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3">Sign in to Fireman</h1>
          <p className="text-gray-400 text-lg">
            Enter your credentials to access your account.
          </p>
        </div>

        <SignInForm csrfToken={csrfToken || ""} />

        <div className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{" "}
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
