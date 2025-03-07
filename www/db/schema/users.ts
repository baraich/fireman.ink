import { sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export type User = typeof users.$inferSelect;
export const users = pgTable("users", {
  id: text("id")
    .$default(() => sql`gen_random_uuid()`)
    .primaryKey(),

  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdateFn(() => sql`now()`),
});
