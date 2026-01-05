-- AlterTable: Drop heroImageR2Key column
ALTER TABLE "program_templates" DROP COLUMN "heroImageR2Key";

-- AlterTable: Make heroImageKey NOT NULL
ALTER TABLE "program_templates" ALTER COLUMN "heroImageKey" SET NOT NULL;

-- AlterTable: Make defaultMinutesPerDay NOT NULL
ALTER TABLE "program_templates" ALTER COLUMN "defaultMinutesPerDay" SET NOT NULL;

-- AlterTable: Make benefits NOT NULL
ALTER TABLE "program_templates" ALTER COLUMN "benefits" SET NOT NULL;

-- AlterTable: Make primaryGoal NOT NULL
ALTER TABLE "program_templates" ALTER COLUMN "primaryGoal" SET NOT NULL;

-- AlterTable: Make focusArea NOT NULL
ALTER TABLE "program_templates" ALTER COLUMN "focusArea" SET NOT NULL;

-- AlterTable: Make recommendedLevel NOT NULL
ALTER TABLE "program_templates" ALTER COLUMN "recommendedLevel" SET NOT NULL;

-- AlterTable: Make categoryRecipe NOT NULL
ALTER TABLE "program_templates" ALTER COLUMN "categoryRecipe" SET NOT NULL;

-- AlterTable: Make libraryRhythm NOT NULL
ALTER TABLE "program_templates" ALTER COLUMN "libraryRhythm" SET NOT NULL;
