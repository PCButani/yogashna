-- CreateEnum
CREATE TYPE "YogaSubCategory" AS ENUM ('WARM_UP', 'MAIN_PRACTICE', 'MOBILITY', 'STRENGTH_STABILITY', 'RESTORATIVE', 'COOL_DOWN');

-- CreateEnum
CREATE TYPE "BreathingSubCategory" AS ENUM ('CALMING', 'BALANCING', 'ENERGISING');

-- CreateEnum
CREATE TYPE "MeditationSubCategory" AS ENUM ('GUIDED_RELAXATION', 'BREATH_AWARENESS', 'BODY_SCAN', 'MINDFULNESS', 'YOGA_NIDRA_SHORT');

-- CreateEnum
CREATE TYPE "SequenceRole" AS ENUM ('MANDATORY', 'ADJUSTABLE', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "DayType" AS ENUM ('GENTLE', 'BUILD', 'RESTORE');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PAID');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PROCESSED', 'IGNORED', 'FAILED');

-- AlterTable
ALTER TABLE "program_templates" ADD COLUMN     "benefits" JSONB,
ADD COLUMN     "categoryRecipe" JSONB,
ADD COLUMN     "focusArea" TEXT,
ADD COLUMN     "heroImageKey" TEXT,
ADD COLUMN     "libraryRhythm" JSONB,
ADD COLUMN     "primaryGoal" TEXT,
ADD COLUMN     "recommendedLevel" "VideoLevel",
ADD COLUMN     "safetyNotes" JSONB,
ADD COLUMN     "whatYouNeed" JSONB;

-- CreateTable
CREATE TABLE "video_assets" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "thumbnailKey" TEXT NOT NULL,
    "streamUid" TEXT NOT NULL,
    "primaryCategory" "VideoPrimaryCategory" NOT NULL,
    "yogaSubCategory" "YogaSubCategory",
    "breathingSubCategory" "BreathingSubCategory",
    "meditationSubCategory" "MeditationSubCategory",
    "level" "VideoLevel" NOT NULL,
    "intensity" "VideoIntensity" NOT NULL,
    "strengthDemand" "VideoStrengthDemand" NOT NULL,
    "focusAreas" JSONB NOT NULL,
    "goals" JSONB NOT NULL,
    "sequenceRole" "SequenceRole" NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "caloriesPerMin" DOUBLE PRECISION,
    "contraIndications" JSONB,
    "status" "ContentStatus" NOT NULL,
    "version" TEXT NOT NULL,
    "tags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_program_schedules" (
    "id" UUID NOT NULL,
    "programTemplateId" UUID NOT NULL,
    "generatedFromVersion" TEXT,
    "days" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_program_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_preferences" (
    "userId" UUID NOT NULL,
    "focusArea" TEXT NOT NULL,
    "primaryGoal" TEXT NOT NULL,
    "level" "VideoLevel" NOT NULL,
    "minutesPreference" INTEGER NOT NULL,
    "preferredTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_preferences_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "abhyasa_cycles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "programTemplateId" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "cycleDays" INTEGER NOT NULL DEFAULT 21,
    "minutesPreference" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abhyasa_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abhyasa_day_plans" (
    "id" UUID NOT NULL,
    "abhyasaCycleId" UUID NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "dayType" "DayType" NOT NULL,
    "totalDurationSec" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abhyasa_day_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist_items" (
    "id" UUID NOT NULL,
    "abhyasaDayPlanId" UUID,
    "videoAssetId" UUID NOT NULL,
    "primaryCategory" "VideoPrimaryCategory" NOT NULL,
    "yogaSubCategory" "YogaSubCategory",
    "breathingSubCategory" "BreathingSubCategory",
    "meditationSubCategory" "MeditationSubCategory",
    "sequenceRole" "SequenceRole" NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_program_enrollments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "programTemplateId" UUID NOT NULL,
    "status" "EnrollmentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_program_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "userId" UUID NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "entitlement" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "store" TEXT,
    "productId" TEXT,
    "environment" TEXT,
    "latestEventAt" TIMESTAMP(3),
    "rawRcPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "user_subscription_events" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "EventStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_subscription_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "video_assets_primaryCategory_idx" ON "video_assets"("primaryCategory");

-- CreateIndex
CREATE INDEX "video_assets_status_idx" ON "video_assets"("status");

-- CreateIndex
CREATE INDEX "video_assets_sequenceRole_idx" ON "video_assets"("sequenceRole");

-- CreateIndex
CREATE UNIQUE INDEX "library_program_schedules_programTemplateId_key" ON "library_program_schedules"("programTemplateId");

-- CreateIndex
CREATE INDEX "abhyasa_cycles_userId_idx" ON "abhyasa_cycles"("userId");

-- CreateIndex
CREATE INDEX "abhyasa_cycles_programTemplateId_idx" ON "abhyasa_cycles"("programTemplateId");

-- CreateIndex
CREATE INDEX "abhyasa_day_plans_abhyasaCycleId_idx" ON "abhyasa_day_plans"("abhyasaCycleId");

-- CreateIndex
CREATE INDEX "playlist_items_abhyasaDayPlanId_idx" ON "playlist_items"("abhyasaDayPlanId");

-- CreateIndex
CREATE INDEX "playlist_items_videoAssetId_idx" ON "playlist_items"("videoAssetId");

-- CreateIndex
CREATE INDEX "user_program_enrollments_userId_idx" ON "user_program_enrollments"("userId");

-- CreateIndex
CREATE INDEX "user_program_enrollments_programTemplateId_idx" ON "user_program_enrollments"("programTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "user_program_enrollments_userId_programTemplateId_key" ON "user_program_enrollments"("userId", "programTemplateId");

-- CreateIndex
CREATE INDEX "user_subscription_events_userId_idx" ON "user_subscription_events"("userId");

-- CreateIndex
CREATE INDEX "user_subscription_events_eventType_idx" ON "user_subscription_events"("eventType");

-- CreateIndex
CREATE INDEX "user_subscription_events_occurredAt_idx" ON "user_subscription_events"("occurredAt");

-- AddForeignKey
ALTER TABLE "library_program_schedules" ADD CONSTRAINT "library_program_schedules_programTemplateId_fkey" FOREIGN KEY ("programTemplateId") REFERENCES "program_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_preferences" ADD CONSTRAINT "practice_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abhyasa_cycles" ADD CONSTRAINT "abhyasa_cycles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abhyasa_cycles" ADD CONSTRAINT "abhyasa_cycles_programTemplateId_fkey" FOREIGN KEY ("programTemplateId") REFERENCES "program_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abhyasa_day_plans" ADD CONSTRAINT "abhyasa_day_plans_abhyasaCycleId_fkey" FOREIGN KEY ("abhyasaCycleId") REFERENCES "abhyasa_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_abhyasaDayPlanId_fkey" FOREIGN KEY ("abhyasaDayPlanId") REFERENCES "abhyasa_day_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_items" ADD CONSTRAINT "playlist_items_videoAssetId_fkey" FOREIGN KEY ("videoAssetId") REFERENCES "video_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_program_enrollments" ADD CONSTRAINT "user_program_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_program_enrollments" ADD CONSTRAINT "user_program_enrollments_programTemplateId_fkey" FOREIGN KEY ("programTemplateId") REFERENCES "program_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscription_events" ADD CONSTRAINT "user_subscription_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
