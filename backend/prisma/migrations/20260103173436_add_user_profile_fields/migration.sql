-- AlterTable
ALTER TABLE "users" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "heightCm" INTEGER,
ADD COLUMN     "isOnboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "preferencesJson" JSONB,
ADD COLUMN     "primaryGoalId" TEXT,
ADD COLUMN     "weightKg" INTEGER,
ADD COLUMN     "wellnessFocusId" TEXT;
