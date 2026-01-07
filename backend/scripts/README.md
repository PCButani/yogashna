# Video Metadata Import Scripts

This directory contains scripts for importing video metadata from Excel into the `VideoAsset` table.

## 📋 Overview

The import system processes an Excel file containing Cloudflare Stream UIDs, R2 image keys, and video metadata, then creates or updates `VideoAsset` records in the database.

## 🎯 What Gets Imported

The import targets the **`VideoAsset`** table (NOT the legacy `Video` table), which is used by the Abhyāsa cycle playlist generator.

### Critical Fields for Generator

The following fields are **required** for the Abhyāsa playlist generator to work:

| Field | Type | Purpose |
|-------|------|---------|
| `streamUid` | String | Cloudflare Stream UID (NOT full URL) |
| `thumbnailKey` | String | R2 key for thumbnail (NOT full URL) |
| `name` | String | Display title |
| `shortDescription` | String | Short description |
| `primaryCategory` | Enum | YOGA/BREATHING/MEDITATION/KNOWLEDGE |
| `yogaSubCategory` | Enum | Required if primaryCategory=YOGA |
| `breathingSubCategory` | Enum | Required if primaryCategory=BREATHING |
| `meditationSubCategory` | Enum | Required if primaryCategory=MEDITATION |
| `sequenceRole` | Enum | MANDATORY/ADJUSTABLE/OPTIONAL |
| `level` | Enum | BEGINNER/INTERMEDIATE/ALL_LEVELS |
| `intensity` | Enum | LOW/MEDIUM/HIGH |
| `strengthDemand` | Enum | VERY_LIGHT/LIGHT/MODERATE/STRONG |
| `durationSec` | Int | Duration in seconds |
| `focusAreas` | JSON Array | e.g., ["NECK", "SHOULDERS"] |
| `goals` | JSON Array | e.g., ["STRESS_RELIEF", "FLEXIBILITY"] |
| `status` | Enum | ACTIVE/INACTIVE |

### ⚠️ Important Notes

1. **Cloudflare URLs NOT Stored**
   - Only the Stream UID is stored (e.g., `522108d21d1c41e6b1789a0f3c92460e`)
   - HLS URLs are generated on-demand via Cloudflare SDK
   - The Excel `cloudflareHlsUrl` column is **ignored** during import

2. **R2 Keys NOT Full URLs**
   - Store R2 keys like `Yogashna image/pexels-chevanon-317155.jpg`
   - Full URLs are generated on-demand via R2 presigned URLs

## 📁 Files

### 1. `import-video-metadata.ts`

Main import script with validation and upsert logic.

**Features:**
- ✅ Validates all rows before any database writes
- ✅ Supports dry-run mode (no DB changes)
- ✅ Upserts by `streamUid` (insert new, update existing)
- ✅ Tags all imports with date for rollback tracking
- ✅ Confirms before applying changes

### 2. `rollback-video-import.ts`

Safely deletes imported videos by date tag.

**Features:**
- ✅ Delete videos from specific import date
- ✅ Delete all imported videos
- ✅ Requires explicit confirmation
- ✅ Shows what will be deleted before confirmation

### 3. `verify-video-import.ts`

Displays imported videos for verification.

**Features:**
- ✅ Lists all imported videos with full details
- ✅ Filter by import date
- ✅ Summary statistics by category, status, and role

## 🚀 Usage

### Step 1: Prepare Excel File

Ensure your Excel file:
- Is located at: `../../Video_Metadata_Import_Template.xlsx` (relative to backend/)
- Has a sheet named `Video_Metadata`
- Contains all required columns (see template)
- Has valid Cloudflare Stream UIDs
- Has valid R2 thumbnail keys

### Step 2: Dry Run (Validation Only)

```bash
cd backend
npx ts-node scripts/import-video-metadata.ts --dry-run
```

This will:
- ✅ Read and parse the Excel file
- ✅ Validate all rows
- ✅ Show what would be inserted/updated
- ❌ **NOT write to the database**

### Step 3: Apply Import

```bash
npx ts-node scripts/import-video-metadata.ts --apply
```

This will:
1. Parse and validate the Excel file
2. Ask for confirmation
3. Insert new videos or update existing videos by `streamUid`
4. Tag all imports with `excel_import` and `import_date_YYYY_MM_DD`
5. Display summary of inserted/updated/skipped videos

### Step 4: Verify Import

```bash
npx ts-node scripts/verify-video-import.ts
```

Or filter by date:

```bash
npx ts-node scripts/verify-video-import.ts --date=2026_01_07
```

### Step 5: Rollback (if needed)

To rollback a specific import:

```bash
npx ts-node scripts/rollback-video-import.ts --date=2026_01_07 --confirm
```

To rollback ALL imports:

```bash
npx ts-node scripts/rollback-video-import.ts --all --confirm
```

## 📊 Excel Column Mapping

| Excel Column | DB Field | Transform |
|--------------|----------|-----------|
| `title` | `name` | Direct |
| `description` | `shortDescription` | Direct |
| `cloudflareStreamUid` | `streamUid` | Direct (UID only) |
| `r2ThumbnailKey` | `thumbnailKey` | Direct (key only) |
| `durationSec` | `durationSec` | Direct (Int) |
| `difficulty` | `level` | Map: BEGINNER→BEGINNER, etc. |
| `intensity` | `intensity` | Direct: LOW/MEDIUM/HIGH |
| `sequencingRole` + `styles` | `primaryCategory` + subcategory + `sequenceRole` | Complex mapping |
| `goals` | `goals` | Parse CSV → JSON array |
| `focusAreas` | `focusAreas` | Parse CSV → JSON array |
| `contraindications` | `contraIndications` | Parse CSV → JSON array |
| `visibilityStatus` | `status` | DRAFT→INACTIVE, PUBLISHED→ACTIVE |
| `cloudflareHlsUrl` | ❌ **IGNORED** | Do not store |

### Category Mapping Logic

The script determines `primaryCategory` and subcategories based on `styles` and `sequencingRole`:

**BREATHING:**
- If `styles` contains "PRANAYAMA" or "BREATHING"
- Sets `primaryCategory = BREATHING`
- Sets `breathingSubCategory = BALANCING` (default)

**MEDITATION:**
- If `styles` contains "MEDITATION" or "NIDRA"
- Sets `primaryCategory = MEDITATION`
- Sets `meditationSubCategory = YOGA_NIDRA_SHORT` or `GUIDED_RELAXATION`

**YOGA (default):**
- All other cases
- Sets `primaryCategory = YOGA`
- Maps `sequencingRole` to `yogaSubCategory`:
  - WARMUP → WARM_UP
  - COOLDOWN → COOL_DOWN
  - MAIN/FLOW → MAIN_PRACTICE
  - RESTORE → RESTORATIVE
  - MOBILITY → MOBILITY
  - STRENGTH → STRENGTH_STABILITY

## 🔒 Safety Features

1. **Validation Before Import**
   - All rows validated before any DB writes
   - Script exits with errors if validation fails

2. **Dry-Run Mode**
   - Test import without modifying database
   - See exactly what will be inserted/updated

3. **Confirmation Prompt**
   - User must explicitly confirm before applying changes

4. **Import Tagging**
   - All imported videos tagged with:
     - `excel_import`
     - `import_date_YYYY_MM_DD`
   - Enables safe rollback by date

5. **Upsert by Stream UID**
   - No duplicate videos created
   - Re-running import updates existing records

## 🧪 Testing the Import

After importing, test the Abhyāsa generator:

```bash
# 1. Enroll in a program
curl -X POST http://localhost:3000/api/v1/me/program-enrollments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"programTemplateId":"10000000-0000-0000-0000-000000000002"}'

# 2. Generate Abhyāsa cycle
curl -X POST http://localhost:3000/api/v1/me/programs/10000000-0000-0000-0000-000000000002/abhyasa-cycles/generate \
  -H "Authorization: Bearer <token>"

# 3. Generate playlists for days 1-5
curl -X POST http://localhost:3000/api/v1/me/programs/10000000-0000-0000-0000-000000000002/abhyasa-cycle/playlist/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"fromDay":1,"toDay":21,"regenerate":false}'

# 4. Check day 1 playlist
curl http://localhost:3000/api/v1/me/programs/10000000-0000-0000-0000-000000000002/abhyasa-cycle/days/1 \
  -H "Authorization: Bearer <token>"
```

You should now see:
- ✅ Playlists generated for days 1-5
- ✅ `playlistItems` array populated with video assets
- ✅ `totalDurationSec` > 0

## 📝 Example Output

### Dry-Run Success

```
============================================
📊 VIDEO METADATA IMPORT
============================================
Mode: 🔍 DRY RUN (no changes)
Excel: /path/to/Video_Metadata_Import_Template.xlsx
Import Date Tag: import_date_2026_01_07

📖 Reading Excel file...
✅ Found 10 rows

🔍 Validating rows...
✅ All rows valid

🔍 Processing (dry-run)...

  ✅ INSERT | Warm-up: Neck & Shoulder Release | 522108d21d1c41e6b1789a0f3c92460e
  ✅ INSERT | Warm-up: Joint Mobility Flow     | d42aa3fdfb0bc13bfe0d6a32a7398708
  ...

============================================
📊 SUMMARY
============================================
Total Rows:     10
✅ Inserted:    10
🔄 Updated:     0
⏭️  Skipped:     0
❌ Errors:      0

🔍 DRY RUN COMPLETE - No changes were made to the database
```

### Apply Success

```
============================================
📊 VIDEO METADATA IMPORT
============================================
Mode: ✍️  APPLY (will modify DB)

⚠️  WARNING: This will modify the database!
Continue with import? (y/n): y

✍️  Importing...

  ✅ INSERT | Warm-up: Neck & Shoulder Release | 522108d21d1c41e6b1789a0f3c92460e
  ...

============================================
📊 SUMMARY
============================================
Total Rows:     10
✅ Inserted:    10
🔄 Updated:     0
⏭️  Skipped:     0
❌ Errors:      0

✅ IMPORT COMPLETE

To rollback these changes, run:
  npx ts-node scripts/rollback-video-import.ts --date 2026_01_07 --confirm
```

## 🐛 Troubleshooting

### Error: "Sheet 'Video_Metadata' not found"

The Excel file must have a sheet named exactly `Video_Metadata` (case-sensitive).

### Error: "Cloudflare Stream UID is required"

Ensure the `cloudflareStreamUid` column has valid UIDs for all rows.

### Error: "Duration must be greater than 0"

The `durationSec` column must contain positive integers.

### Generator still returns empty playlists

1. Verify videos were imported:
   ```bash
   npx ts-node scripts/verify-video-import.ts
   ```

2. Check video status is `ACTIVE`:
   - Imported videos with `visibilityStatus=DRAFT` become `status=INACTIVE`
   - Change to `PUBLISHED` in Excel and re-import

3. Check primaryCategory and subcategories are set correctly

## 📚 References

- Prisma Schema: `backend/prisma/schema.prisma` (lines 269-301)
- Generator Service: `backend/src/me/abhyasa-cycle.service.ts` (lines 726-793)
- Excel Template: `Video_Metadata_Import_Template.xlsx`
