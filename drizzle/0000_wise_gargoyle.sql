CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carId" uuid NOT NULL,
	"amount" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments_outbox" (
	"id" serial PRIMARY KEY NOT NULL,
	"carId" uuid NOT NULL
);
