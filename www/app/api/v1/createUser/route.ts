import { db } from "@/db/drizzle";
import { users } from "@/db/schema/users";
import { NextResponse } from "next/server";
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
});

export async function POST(request: Request) {
  try {
    const data = signUpSchema.parse(await request.json());
    const records = await db
      .insert(users)
      .values({
        email: data.email,
        password: data.password,
        username: data.email.split("@")?.[0] || "",
      })
      .returning()
      .execute();

    if (records.length > 0) {
      const user = records[0];
      if (user?.id) {
        return NextResponse.json({ status: "OK", userId: user.id });
      }
    }

    throw new Error("Failed to create user!");
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => ({
        [issue.path[0]]: issue.message,
      }));

      return NextResponse.json({
        status: "error",
        error: issues,
      });
    } else console.log(error);
    return NextResponse.json({ status: "error", error: null });
  }
}
