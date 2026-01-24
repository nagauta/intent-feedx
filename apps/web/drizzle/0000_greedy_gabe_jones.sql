CREATE TABLE "keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"query" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "keywords_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tweets" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"snippet" text NOT NULL,
	"embed_success" boolean DEFAULT false NOT NULL,
	"embed_html" text,
	"author_name" text,
	"keyword" text NOT NULL,
	"search_date" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "tweets_url_unique" UNIQUE("url")
);
