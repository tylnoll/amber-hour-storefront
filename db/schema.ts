import { boolean, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

export const customerProfiles = pgTable("customer_profiles", {
  id: text().primaryKey(),
  email: text().notNull().unique(),
  displayName: text("display_name").notNull(),
  phone: text().notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  lastLoginAt: text("last_login_at"),
  createdIp: text("created_ip").notNull().default(""),
  createdIpSource: text("created_ip_source"),
  lastIp: text("last_ip"),
  lastIpSource: text("last_ip_source"),
  pointsAdjustment: integer("points_adjustment").notNull().default(0),
  banned: boolean().notNull().default(false),
  banReason: text("ban_reason"),
});

export const blockedSignups = pgTable(
  "blocked_signups",
  {
    kind: text().notNull(),
    value: text().notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [primaryKey({ columns: [table.kind, table.value] })],
);
