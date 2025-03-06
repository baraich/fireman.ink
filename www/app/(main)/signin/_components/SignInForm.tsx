"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import z from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .email("Email must be a valid email format, e.g. 'email@example.com'"),
  password: z
    .string()
    .max(
      32,
      "Oh! What are you doing? Don't write a letter here, maximum allowed characters are 32."
    ),
});

export const SignInForm = ({ csrfToken }: { csrfToken: string }) => {
  const [error, setError] = useState<string>("");

  const handleSubmit = async function (event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const payload = Object.fromEntries(formData);

    try {
      const data = loginSchema.parse(payload);

      const { error, ok } = (await signIn("credentials", {
        ...data,
        redirect: false,
      })) as { error: string | null; ok: boolean };

      if (error) {
        if (error == "CredentialsSignin")
          setError("Invalid email or password!");
        else setError("Internal Server Error: Please try again later.");
      }

      if (ok) if (typeof window !== "undefined") window.location.href = "/";
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((issue) => issue.message);
        setError(issues.shift() || "");
      } else console.log(error);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-md text-red-200 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="csrfToken" defaultValue={csrfToken} />
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
            name="email"
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
            name="password"
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
    </>
  );
};
