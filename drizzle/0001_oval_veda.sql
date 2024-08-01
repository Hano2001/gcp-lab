ALTER TABLE "payments" RENAME COLUMN "carId" TO "car_id";--> statement-breakpoint
ALTER TABLE "payments_outbox" RENAME COLUMN "carId" TO "car_id";