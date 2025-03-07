"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { z, ZodError } from "zod";

const PASSWORD_MAX_LENGTH = 32;
const REDIRECT_URL = "/";

const loginSchema = z.object({
  email: z.string().email({
    message: "Email must be a valid email format, e.g. 'email@example.com'",
  }),
  password: z.string().max(PASSWORD_MAX_LENGTH, {
    message: `Maximum allowed characters are ${PASSWORD_MAX_LENGTH}`,
  }),
});

/*
 * Type definition for form props
 */
interface SignInFormProps {
  csrfToken: string;
}

/*
 * Type definition for sign-in response from NextAuth
 */
interface SignInResponse {
  error: string | null;
  ok: boolean;
}

/*
 * SignInForm component for handling user authentication
 * @param csrfToken - CSRF token for security
 */
export const SignInForm = ({ csrfToken }: SignInFormProps) => {
  /*
   * State for error messages
   */
  const [error, setError] = useState<string>("");

  /*
   * Handles form submission and authentication
   * @param event - Form submission event
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    /*
     * Extract form data
     */
    const formData = new FormData(event.target as HTMLFormElement);
    const payload = Object.fromEntries(formData);

    try {
      /*
       * Validate form data against schema
       */
      const data = loginSchema.parse(payload);

      /*
       * Attempt to sign in with credentials
       */
      const response = (await signIn("credentials", {
        ...data,
        redirect: false,
      })) as SignInResponse;

      /*
       * Handle authentication response
       */
      if (response.error) {
        setError(
          response.error === "CredentialsSignin"
            ? "Invalid email or password"
            : "Internal Server Error: Please try again later"
        );
        return;
      }

      if (response.ok && typeof window !== "undefined") {
        window.location.href = REDIRECT_URL;
      }
    } catch (error) {
      /*
       * Handle validation and unexpected errors
       */
      if (error instanceof ZodError) {
        const firstError = error.issues[0]?.message || "Validation error";
        setError(firstError);
      } else {
        console.error("Sign-in error:", error);
        setError("An unexpected error occurred");
      }
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
            required
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
              href="/forgot-password"
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
