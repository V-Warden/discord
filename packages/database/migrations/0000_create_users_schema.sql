CREATE TYPE "public"."user_status" AS ENUM('APPEALED', 'BLACKLISTED', 'PERM_BLACKLISTED', 'WHITELISTED');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('OTHER', 'LEAKER', 'CHEATER', 'SUPPORTER', 'OWNER', 'BOT');--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"last_username" varchar NOT NULL,
	"appeals" integer DEFAULT 0 NOT NULL,
	"first_appeal" timestamp,
	"last_appeal" timestamp,
	"status" "user_status" DEFAULT 'BLACKLISTED' NOT NULL,
	"type" "user_type" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3)
);
