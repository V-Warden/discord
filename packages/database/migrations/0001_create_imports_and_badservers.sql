CREATE TYPE "public"."server_type" AS ENUM('CHEATING', 'LEAKING', 'RESELLING', 'ADVERTISING', 'OTHER');--> statement-breakpoint
CREATE TABLE "bad_servers" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"old_names" text[],
	"type" "server_type" NOT NULL,
	"invite" varchar,
	"reason" varchar DEFAULT 'None provided',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3),
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
CREATE TABLE "imports" (
	"id" bigint,
	"server_id" bigint,
	"roles" text[],
	"type" "user_type",
	"appealed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3),
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
ALTER TABLE "imports" ADD CONSTRAINT "imports_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "imports" ADD CONSTRAINT "imports_server_id_bad_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."bad_servers"("id") ON DELETE restrict ON UPDATE restrict;