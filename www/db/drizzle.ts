import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const neonClient = neon(process.env.DB_URL!);
export const db = drizzle({ client: neonClient });
