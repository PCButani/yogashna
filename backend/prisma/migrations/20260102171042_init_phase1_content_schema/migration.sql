-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('FREE', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "ProgramSectionType" AS ENUM ('BENEFIT', 'WHAT_YOU_NEED', 'SAFETY_NOTE');

-- CreateEnum
CREATE TYPE "VideoPrimaryCategory" AS ENUM ('YOGA', 'BREATHING', 'MEDITATION', 'KNOWLEDGE');

-- CreateEnum
CREATE TYPE "VideoLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ALL_LEVELS');

-- CreateEnum
CREATE TYPE "VideoIntensity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "VideoStrengthDemand" AS ENUM ('VERY_LIGHT', 'LIGHT', 'MODERATE', 'STRONG');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_templates" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "sanskritTitle" TEXT,
    "subtitle" TEXT,
    "descriptionShort" TEXT,
    "heroImageR2Key" TEXT,
    "defaultDays" INTEGER NOT NULL,
    "defaultMinutesPerDay" INTEGER,
    "levelLabel" TEXT,
    "accessLevel" "AccessLevel" NOT NULL,
    "requiredEntitlementKey" TEXT,
    "status" "ContentStatus" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_template_sections" (
    "id" UUID NOT NULL,
    "programTemplateId" UUID NOT NULL,
    "type" "ProgramSectionType" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_template_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_days" (
    "id" UUID NOT NULL,
    "programTemplateId" UUID NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT,
    "intent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_day_items" (
    "id" UUID NOT NULL,
    "programDayId" UUID NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "videoId" UUID NOT NULL,
    "sequenceRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_day_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "descriptionShort" TEXT,
    "primaryCategory" "VideoPrimaryCategory" NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "level" "VideoLevel" NOT NULL,
    "intensity" "VideoIntensity" NOT NULL,
    "strengthDemand" "VideoStrengthDemand" NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL,
    "requiredEntitlementKey" TEXT,
    "cloudflareStreamUid" TEXT,
    "thumbnailR2Key" TEXT,
    "status" "ContentStatus" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_types" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "tagTypeId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_tags" (
    "id" UUID NOT NULL,
    "videoId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_template_tags" (
    "id" UUID NOT NULL,
    "programTemplateId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_template_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_translations" (
    "id" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entity_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorite_programs" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "programTemplateId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_firebaseUid_key" ON "users"("firebaseUid");

-- CreateIndex
CREATE INDEX "program_templates_status_idx" ON "program_templates"("status");

-- CreateIndex
CREATE INDEX "program_templates_accessLevel_idx" ON "program_templates"("accessLevel");

-- CreateIndex
CREATE INDEX "program_template_sections_programTemplateId_type_sortOrder_idx" ON "program_template_sections"("programTemplateId", "type", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "program_days_programTemplateId_dayNumber_key" ON "program_days"("programTemplateId", "dayNumber");

-- CreateIndex
CREATE INDEX "program_day_items_programDayId_idx" ON "program_day_items"("programDayId");

-- CreateIndex
CREATE UNIQUE INDEX "program_day_items_programDayId_orderIndex_key" ON "program_day_items"("programDayId", "orderIndex");

-- CreateIndex
CREATE INDEX "videos_primaryCategory_idx" ON "videos"("primaryCategory");

-- CreateIndex
CREATE INDEX "videos_status_idx" ON "videos"("status");

-- CreateIndex
CREATE INDEX "videos_accessLevel_idx" ON "videos"("accessLevel");

-- CreateIndex
CREATE UNIQUE INDEX "tag_types_code_key" ON "tag_types"("code");

-- CreateIndex
CREATE INDEX "tags_tagTypeId_idx" ON "tags"("tagTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_tagTypeId_code_key" ON "tags"("tagTypeId", "code");

-- CreateIndex
CREATE INDEX "video_tags_videoId_idx" ON "video_tags"("videoId");

-- CreateIndex
CREATE INDEX "video_tags_tagId_idx" ON "video_tags"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "video_tags_videoId_tagId_key" ON "video_tags"("videoId", "tagId");

-- CreateIndex
CREATE INDEX "program_template_tags_programTemplateId_idx" ON "program_template_tags"("programTemplateId");

-- CreateIndex
CREATE INDEX "program_template_tags_tagId_idx" ON "program_template_tags"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "program_template_tags_programTemplateId_tagId_key" ON "program_template_tags"("programTemplateId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE INDEX "entity_translations_entityType_entityId_idx" ON "entity_translations"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "entity_translations_languageCode_idx" ON "entity_translations"("languageCode");

-- CreateIndex
CREATE UNIQUE INDEX "entity_translations_entityType_entityId_field_languageCode_key" ON "entity_translations"("entityType", "entityId", "field", "languageCode");

-- CreateIndex
CREATE INDEX "user_favorite_programs_userId_idx" ON "user_favorite_programs"("userId");

-- CreateIndex
CREATE INDEX "user_favorite_programs_programTemplateId_idx" ON "user_favorite_programs"("programTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_programs_userId_programTemplateId_key" ON "user_favorite_programs"("userId", "programTemplateId");

-- AddForeignKey
ALTER TABLE "program_template_sections" ADD CONSTRAINT "program_template_sections_programTemplateId_fkey" FOREIGN KEY ("programTemplateId") REFERENCES "program_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_days" ADD CONSTRAINT "program_days_programTemplateId_fkey" FOREIGN KEY ("programTemplateId") REFERENCES "program_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_day_items" ADD CONSTRAINT "program_day_items_programDayId_fkey" FOREIGN KEY ("programDayId") REFERENCES "program_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_day_items" ADD CONSTRAINT "program_day_items_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_tagTypeId_fkey" FOREIGN KEY ("tagTypeId") REFERENCES "tag_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_tags" ADD CONSTRAINT "video_tags_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_tags" ADD CONSTRAINT "video_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_template_tags" ADD CONSTRAINT "program_template_tags_programTemplateId_fkey" FOREIGN KEY ("programTemplateId") REFERENCES "program_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_template_tags" ADD CONSTRAINT "program_template_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_programs" ADD CONSTRAINT "user_favorite_programs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite_programs" ADD CONSTRAINT "user_favorite_programs_programTemplateId_fkey" FOREIGN KEY ("programTemplateId") REFERENCES "program_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
