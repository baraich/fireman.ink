"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { z } from "zod";

const signUpSchema = z.object({
  email: z
    .string()
    .email("Email must be a valid email format, e.g. 'email@example.com'"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(
      32,
      "Oh! What are you doing? Don't write a letter here, maximum allowed characters are 32."
    ),
  c_password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(
      32,
      "Oh! What are you doing? Don't write a letter here, maximum allowed characters are 32."
    ),
});

export default function SignUp() {
  const [error, setError] = useState<string>("");

  const handleSubmit = async function (event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const payload = Object.fromEntries(formData);

    try {
      const data = signUpSchema.parse(payload);
      if (data.password !== data.c_password) {
        setError("Passwords do not match!");
        return;
      }

      const signUpRequest = await fetch("/api/v1/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const signInResponse = await signUpRequest.json();
      if (signInResponse?.status === "OK") {
        const { ok } = (await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: true,
        })) as { ok: boolean };
        if (ok) {
          if (typeof window !== "undefined") window.location.href = "/";
          return;
        } else return;
      }

      if (signInResponse?.status === "error") {
        const errors = Object.values((signInResponse?.error as string[]) || []);
        setError(errors[0] || "Failed to create account! Please try again.");
      } else setError("Failed to create account! Please try again.");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((issue) => issue.message);
        setError(issues.shift() || "");
      } else console.log(error);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 md:py-28">
      <div className="w-full max-w-lg backdrop-grayscale-50 bg-stone-900/40 p-8 rounded-xl shadow ring ring-stone-700">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-3">Sign up to Fireman</h1>
          <p className="text-gray-400 text-lg">
            Enter your credentials to create you account.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-md text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="c_password"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
            </div>
            <input
              id="c_password"
              name="c_password"
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
            Sign Up
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Already Have an Account{" "}
          <Link
            href="/signin"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
