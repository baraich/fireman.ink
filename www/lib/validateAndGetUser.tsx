import { db } from "@/db/drizzle";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";

/*
 * Validates the user session and retrieves user data
 * @returns User object if valid, throws error if unauthorized
 */
export const validateAndGetUser = async () => {
  const session = await getServerSession();

  if (!session || !session.user || !session.user.email) {
    throw new Error("Unauthorized");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
};
