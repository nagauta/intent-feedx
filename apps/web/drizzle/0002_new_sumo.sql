CREATE TABLE "contents" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"source_type" text NOT NULL,
	"title" text NOT NULL,
	"snippet" text NOT NULL,
	"author_name" text,
	"published_at" timestamp,
	"thumbnail_url" text,
	"source_metadata" jsonb,
	"keyword" text NOT NULL,
	"search_date" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "contents_url_unique" UNIQUE("url")
);
--> statement-breakpoint
ALTER TABLE "keywords" ADD COLUMN "sources" text[] DEFAULT '{"twitter"}' NOT NULL;