CREATE TABLE "roles_archive" (
	"user_id" bigint,
	"guild_id" bigint,
	"roles" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp (3),
	"created_by" bigint,
	"updated_by" bigint
);
--> statement-breakpoint
ALTER TABLE "imports" DROP CONSTRAINT "imports_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "imports" ADD COLUMN "user_id" bigint;--> statement-breakpoint
ALTER TABLE "punishments" ADD COLUMN "guild_id" bigint;--> statement-breakpoint
ALTER TABLE "imports" ADD CONSTRAINT "imports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "imports" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "punishments" DROP COLUMN "id";