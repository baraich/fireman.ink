import { db } from "@/db/drizzle";
import { users } from "@/db/schema/users";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { genSaltSync, hashSync } from "bcrypt-edge";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 32;

const signUpSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, {
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    })
    .max(PASSWORD_MAX_LENGTH, {
      message: `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`,
    }),
});

interface SignUpData {
  name: string;
  email: string;
  password: string;
}

interface ApiResponse {
  status: "OK" | "error";
  userId?: string;
  error?: string;
}

const hashPassword = (password: string): string => {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
};

const createUser = async (data: SignUpData) => {
  const hashedPassword = hashPassword(data.password);

  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    })
    .returning();

  return user;
};

const formatZodErrors = (error: ZodError) => {
  return error.issues.map((issue) => ({
    [issue.path[0]]: issue.message,
  }));
};

export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);

    const user = await createUser(validatedData);

    if (!user?.id) {
      throw new Error("Failed to create user");
    }

    return NextResponse.json(
      {
        status: "OK",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = formatZodErrors(error);
      const errorMessage = Object.values(errors.shift() || {}).shift();

      if (errorMessage)
        return NextResponse.json(
          {
            status: "error",
            error: errorMessage,
          },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        status: "error",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
