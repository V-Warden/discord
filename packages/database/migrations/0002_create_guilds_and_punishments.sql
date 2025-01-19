CREATE TYPE "public"."punishment_type" AS ENUM('BAN', 'KICK', 'WARN', 'ROLE');--> statement-breakpoint
CREATE TABLE "guilds" (
	"id" bigint,
	"name" varchar,
	"logChannelId" bigint,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3),
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE "punishments" (
	"id" bigint,
	"enabled" boolean DEFAULT false,
	"roleId" bigint,
	"unban" jsonb DEFAULT '{"enabled":false,"owner":false,"supporter":false,"cheater":false,"leaker":false,"other":false}'::jsonb,
	"owner" "punishment_type" DEFAULT 'BAN',
	"supporter" "punishment_type" DEFAULT 'KICK',
	"leaker" "punishment_type" DEFAULT 'WARN',
	"cheater" "punishment_type" DEFAULT 'WARN',
	"other" "punishment_type" DEFAULT 'WARN',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3),
	"created_by" bigint,
	"updated_by" bigint
);
