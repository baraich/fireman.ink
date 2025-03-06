import { config } from "dotenv";
import { Config } from "drizzle-kit";

config({ path: ".env" });
export default {
  schema: "./db/schema/",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
} satisfies Config;
