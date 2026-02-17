CREATE TABLE "profile_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_name" text NOT NULL,
	"followers_count" integer,
	"following_count" integer,
	"scraped_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
