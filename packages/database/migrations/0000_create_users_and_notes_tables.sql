CREATE TYPE "public"."user_status" AS ENUM('APPEALED', 'BLACKLISTED', 'PERM_BLACKLISTED', 'WHITELISTED');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('OTHER', 'LEAKER', 'CHEATER', 'SUPPORTER', 'OWNER', 'BOT');--> statement-breakpoint
CREATE TABLE "notes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3),
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigint PRIMARY KEY NOT NULL,
	"last_username" varchar NOT NULL,
	"appeals" integer DEFAULT 0 NOT NULL,
	"first_appeal" timestamp,
	"last_appeal" timestamp,
	"status" "user_status" DEFAULT 'BLACKLISTED' NOT NULL,
	"type" "user_type" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3),
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE restrict;