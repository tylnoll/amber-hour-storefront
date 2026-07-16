CREATE TABLE "blocked_signups" (
	"kind" text,
	"value" text,
	"created_at" text NOT NULL,
	CONSTRAINT "blocked_signups_pkey" PRIMARY KEY("kind","value")
);
--> statement-breakpoint
CREATE TABLE "customer_profiles" (
	"id" text PRIMARY KEY,
	"email" text NOT NULL UNIQUE,
	"display_name" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"last_login_at" text,
	"created_ip" text DEFAULT '' NOT NULL,
	"created_ip_source" text,
	"last_ip" text,
	"last_ip_source" text,
	"points_adjustment" integer DEFAULT 0 NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text
);
