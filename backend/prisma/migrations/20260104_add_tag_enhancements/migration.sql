-- AlterTable: Add admin-friendly fields to tags table
-- This migration adds:
-- 1. parentTagId for hierarchical tag relationships (e.g., goals → wellness focus)
-- 2. sortOrder for controlling display order
-- 3. isActive for soft delete / enable-disable functionality

-- Add parentTagId column (nullable, references tags.id)
ALTER TABLE "tags" ADD COLUMN "parent_tag_id" UUID;

-- Add sortOrder column (nullable)
ALTER TABLE "tags" ADD COLUMN "sort_order" INTEGER;

-- Add isActive column (default true, not null)
ALTER TABLE "tags" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Add foreign key constraint for parent-child relationship
ALTER TABLE "tags" ADD CONSTRAINT "tags_parent_tag_id_fkey"
  FOREIGN KEY ("parent_tag_id") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add indexes for performance
CREATE INDEX "tags_parent_tag_id_idx" ON "tags"("parent_tag_id");
CREATE INDEX "tags_is_active_idx" ON "tags"("is_active");

-- Comment for documentation
COMMENT ON COLUMN "tags"."parent_tag_id" IS 'Optional parent tag ID for hierarchical relationships (e.g., wellness goals → wellness focus)';
COMMENT ON COLUMN "tags"."sort_order" IS 'Admin-friendly field to control display order in UI';
COMMENT ON COLUMN "tags"."is_active" IS 'Admin-friendly soft delete flag - false = hidden from users';
