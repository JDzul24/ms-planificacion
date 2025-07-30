-- Update RoutineExercise table to use simple UUID primary key instead of composite key

-- First, drop the existing composite primary key
ALTER TABLE "routine_exercises" DROP CONSTRAINT "routine_exercises_pkey";

-- Add new UUID id column with default values for existing records
ALTER TABLE "routine_exercises" ADD COLUMN "id" CHAR(36) DEFAULT gen_random_uuid();

-- Update existing records to have proper UUIDs
UPDATE "routine_exercises" SET "id" = gen_random_uuid() WHERE "id" IS NULL;

-- Make the id column not null and set as primary key
ALTER TABLE "routine_exercises" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_pkey" PRIMARY KEY ("id");