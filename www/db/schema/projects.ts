import { users } from "./users";
import { sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: text("id")
    .$default(() => sql`gen_random_uuid()`)
    .primaryKey(),

  userId: text("user_id").references(() => users.id),
  containerId: text("container_id").notNull(),

  name: text("name").notNull(),
  description: text("description").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdateFn(() => sql`now()`),
});
