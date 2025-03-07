import { sql } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { projects } from "./projects";

export type Message = typeof messages.$inferSelect;
export const messages = pgTable("messages", {
  id: text("id")
    .$default(() => sql`gen_random_uuid()`)
    .primaryKey(),

  userId: text("user_id").references(() => users.id),
  projectId: text("project_id").references(() => projects.id),

  type: text("message_type").notNull(),
  tool_heading: text("message_heading"),
  tool_steps: text("message_steps"),
  content: text("message_content").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdateFn(() => sql`now()`),
});
