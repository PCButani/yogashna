#!/usr/bin/env ts-node

/**
 * Video Metadata Import Script
 *
 * Imports video metadata from Excel file into VideoAsset table.
 *
 * Usage:
 *   npx ts-node scripts/import-video-metadata.ts --dry-run   (validate only)
 *   npx ts-node scripts/import-video-metadata.ts --apply     (apply changes)
 */

import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

// ============================================
// TYPES
// ============================================

type ExcelRow = {
  videoId: string;
  title: string;
  shortTitle: string;
  description: string;
  instructorName: string;
  language: string;
  durationSec: number;
  difficulty: string;
  access: string;
  sequencingRole: string;
  intensity: string;
  goals: string;
  conditions: string;
  styles: string;
  focusAreas: string;
  equipment: string;
  contraindications: string;
  timeOfDay: string;
  visibilityStatus: string;
  releaseDate: string;
  cloudflareStreamUid: string;
  cloudflareHlsUrl: string;
  r2ThumbnailKey: string;
  r2PosterKey: string;
  captionsR2Key: string;
  notes: string;
};

type ValidationError = {
  row: number;
  field: string;
  message: string;
};

type ImportResult = {
  success: boolean;
  action: 'insert' | 'update' | 'skip';
  streamUid: string;
  title: string;
  error?: string;
};

// ============================================
// MAPPING FUNCTIONS
// ============================================

function mapDifficulty(excelDifficulty: string): string {
  const map: Record<string, string> = {
    'BEGINNER': 'BEGINNER',
    'INTERMEDIATE': 'INTERMEDIATE',
    'ALL_LEVELS': 'ALL_LEVELS',
    'ALL LEVELS': 'ALL_LEVELS',
  };
  return map[excelDifficulty.toUpperCase()] || 'ALL_LEVELS';
}

function mapIntensity(excelIntensity: string): string {
  const map: Record<string, string> = {
    'LOW': 'LOW',
    'MEDIUM': 'MEDIUM',
    'HIGH': 'HIGH',
  };
  return map[excelIntensity.toUpperCase()] || 'LOW';
}

function mapStrengthDemand(intensity: string): string {
  const map: Record<string, string> = {
    'LOW': 'VERY_LIGHT',
    'MEDIUM': 'LIGHT',
    'HIGH': 'MODERATE',
  };
  return map[intensity] || 'VERY_LIGHT';
}

function mapVisibilityToStatus(visibility: string): string {
  const map: Record<string, string> = {
    'DRAFT': 'INACTIVE',
    'PUBLISHED': 'ACTIVE',
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  return map[visibility.toUpperCase()] || 'INACTIVE';
}

function determinePrimaryCategoryAndSubs(
  styles: string,
  sequencingRole: string
): {
  primaryCategory: string;
  yogaSubCategory: string | null;
  breathingSubCategory: string | null;
  meditationSubCategory: string | null;
  sequenceRole: string;
} {
  const stylesUpper = styles.toUpperCase();
  const roleUpper = sequencingRole.toUpperCase();

  // BREATHING
  if (stylesUpper.includes('PRANAYAMA') || stylesUpper.includes('BREATHING')) {
    return {
      primaryCategory: 'BREATHING',
      yogaSubCategory: null,
      breathingSubCategory: 'BALANCING', // Default, could be refined
      meditationSubCategory: null,
      sequenceRole: 'ADJUSTABLE',
    };
  }

  // MEDITATION
  if (stylesUpper.includes('MEDITATION') || stylesUpper.includes('NIDRA')) {
    return {
      primaryCategory: 'MEDITATION',
      yogaSubCategory: null,
      breathingSubCategory: null,
      meditationSubCategory: stylesUpper.includes('NIDRA') ? 'YOGA_NIDRA_SHORT' : 'GUIDED_RELAXATION',
      sequenceRole: 'OPTIONAL',
    };
  }

  // YOGA (default)
  let yogaSubCategory = 'MAIN_PRACTICE'; // Default

  if (roleUpper.includes('WARMUP') || roleUpper.includes('WARM_UP')) {
    yogaSubCategory = 'WARM_UP';
  } else if (roleUpper.includes('COOLDOWN') || roleUpper.includes('COOL_DOWN')) {
    yogaSubCategory = 'COOL_DOWN';
  } else if (roleUpper.includes('MAIN') || roleUpper.includes('FLOW')) {
    yogaSubCategory = 'MAIN_PRACTICE';
  } else if (roleUpper.includes('RESTORE') || roleUpper.includes('RESTORATIVE')) {
    yogaSubCategory = 'RESTORATIVE';
  } else if (roleUpper.includes('MOBILITY')) {
    yogaSubCategory = 'MOBILITY';
  } else if (roleUpper.includes('STRENGTH') || roleUpper.includes('STABILITY')) {
    yogaSubCategory = 'STRENGTH_STABILITY';
  }

  return {
    primaryCategory: 'YOGA',
    yogaSubCategory,
    breathingSubCategory: null,
    meditationSubCategory: null,
    sequenceRole: yogaSubCategory === 'WARM_UP' ? 'MANDATORY' : 'ADJUSTABLE',
  };
}

function parseCommaSeparatedArray(value: string): string[] {
  if (!value || value.trim() === '') return [];
  return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
}

// ============================================
// VALIDATION
// ============================================

function validateRow(row: ExcelRow, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!row.title || row.title.trim() === '') {
    errors.push({ row: rowIndex, field: 'title', message: 'Title is required' });
  }

  if (!row.description || row.description.trim() === '') {
    errors.push({ row: rowIndex, field: 'description', message: 'Description is required' });
  }

  if (!row.cloudflareStreamUid || row.cloudflareStreamUid.trim() === '') {
    errors.push({ row: rowIndex, field: 'cloudflareStreamUid', message: 'Cloudflare Stream UID is required' });
  }

  if (!row.r2ThumbnailKey || row.r2ThumbnailKey.trim() === '') {
    errors.push({ row: rowIndex, field: 'r2ThumbnailKey', message: 'R2 Thumbnail Key is required' });
  }

  if (!row.durationSec || row.durationSec <= 0) {
    errors.push({ row: rowIndex, field: 'durationSec', message: 'Duration must be greater than 0' });
  }

  if (!row.difficulty || row.difficulty.trim() === '') {
    errors.push({ row: rowIndex, field: 'difficulty', message: 'Difficulty is required' });
  }

  if (!row.intensity || row.intensity.trim() === '') {
    errors.push({ row: rowIndex, field: 'intensity', message: 'Intensity is required' });
  }

  if (!row.styles || row.styles.trim() === '') {
    errors.push({ row: rowIndex, field: 'styles', message: 'Styles is required' });
  }

  if (!row.sequencingRole || row.sequencingRole.trim() === '') {
    errors.push({ row: rowIndex, field: 'sequencingRole', message: 'Sequencing Role is required' });
  }

  return errors;
}

// ============================================
// IMPORT LOGIC
// ============================================

async function processRow(
  row: ExcelRow,
  rowIndex: number,
  dryRun: boolean,
  importDate: string
): Promise<ImportResult> {
  const streamUid = row.cloudflareStreamUid.trim();

  // Check if exists
  const existing = await prisma.videoAsset.findFirst({
    where: { streamUid },
  });

  const categoryMapping = determinePrimaryCategoryAndSubs(row.styles, row.sequencingRole);

  const videoData = {
    name: row.title.trim(),
    shortDescription: row.description.trim(),
    thumbnailKey: row.r2ThumbnailKey.trim(),
    streamUid,
    primaryCategory: categoryMapping.primaryCategory as any,
    yogaSubCategory: categoryMapping.yogaSubCategory as any,
    breathingSubCategory: categoryMapping.breathingSubCategory as any,
    meditationSubCategory: categoryMapping.meditationSubCategory as any,
    level: mapDifficulty(row.difficulty) as any,
    intensity: mapIntensity(row.intensity) as any,
    strengthDemand: mapStrengthDemand(mapIntensity(row.intensity)) as any,
    focusAreas: parseCommaSeparatedArray(row.focusAreas),
    goals: parseCommaSeparatedArray(row.goals),
    sequenceRole: categoryMapping.sequenceRole as any,
    durationSec: row.durationSec,
    caloriesPerMin: null,
    contraIndications: parseCommaSeparatedArray(row.contraindications),
    status: mapVisibilityToStatus(row.visibilityStatus) as any,
    version: '1.0',
    tags: [
      'excel_import',
      `import_date_${importDate}`,
      ...(row.notes ? [`note:${row.notes.substring(0, 50)}`] : [])
    ],
  };

  if (dryRun) {
    return {
      success: true,
      action: existing ? 'update' : 'insert',
      streamUid,
      title: row.title,
    };
  }

  try {
    if (existing) {
      // UPDATE
      await prisma.videoAsset.update({
        where: { id: existing.id },
        data: videoData,
      });

      return {
        success: true,
        action: 'update',
        streamUid,
        title: row.title,
      };
    } else {
      // INSERT
      await prisma.videoAsset.create({
        data: videoData,
      });

      return {
        success: true,
        action: 'insert',
        streamUid,
        title: row.title,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      action: 'skip',
      streamUid,
      title: row.title,
      error: error.message,
    };
  }
}

// ============================================
// CLI HELPERS
// ============================================

function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// ============================================
// MAIN
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isApply = args.includes('--apply');

  if (!isDryRun && !isApply) {
    console.error('❌ Error: You must specify either --dry-run or --apply');
    console.log('\nUsage:');
    console.log('  npx ts-node scripts/import-video-metadata.ts --dry-run   (validate only)');
    console.log('  npx ts-node scripts/import-video-metadata.ts --apply     (apply changes)');
    process.exit(1);
  }

  const importDate = new Date().toISOString().split('T')[0].replace(/-/g, '_');
  const excelPath = path.resolve(__dirname, '../../..', 'Video_Metadata_Import_Template.xlsx');

  console.log('============================================');
  console.log('📊 VIDEO METADATA IMPORT');
  console.log('============================================');
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (no changes)' : '✍️  APPLY (will modify DB)'}`);
  console.log(`Excel: ${excelPath}`);
  console.log(`Import Date Tag: import_date_${importDate}`);
  console.log('');

  // Read Excel
  console.log('📖 Reading Excel file...');
  const workbook = XLSX.readFile(excelPath);
  const sheetName = 'Video_Metadata';

  if (!workbook.SheetNames.includes(sheetName)) {
    console.error(`❌ Sheet "${sheetName}" not found in Excel file`);
    process.exit(1);
  }

  const worksheet = workbook.Sheets[sheetName];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  console.log(`✅ Found ${rows.length} rows\n`);

  // Validate all rows
  console.log('🔍 Validating rows...');
  const allErrors: ValidationError[] = [];

  rows.forEach((row, index) => {
    const errors = validateRow(row, index + 1);
    allErrors.push(...errors);
  });

  if (allErrors.length > 0) {
    console.log(`\n❌ Found ${allErrors.length} validation errors:\n`);
    allErrors.forEach((err) => {
      console.log(`  Row ${err.row}, Field "${err.field}": ${err.message}`);
    });
    process.exit(1);
  }

  console.log('✅ All rows valid\n');

  // Confirm if apply mode
  if (isApply) {
    console.log('⚠️  WARNING: This will modify the database!');
    const confirmed = await askConfirmation('Continue with import?');
    if (!confirmed) {
      console.log('❌ Import cancelled by user');
      process.exit(0);
    }
    console.log('');
  }

  // Process rows
  console.log(`${isDryRun ? '🔍 Processing (dry-run)...' : '✍️  Importing...'}\n`);

  const results: ImportResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const result = await processRow(row, i + 1, isDryRun, importDate);
    results.push(result);

    const icon = result.success
      ? (result.action === 'insert' ? '✅ INSERT' : '🔄 UPDATE')
      : '❌ FAILED';

    console.log(`  ${icon} | ${result.title.substring(0, 50).padEnd(50)} | ${result.streamUid}`);
    if (result.error) {
      console.log(`         ↳ Error: ${result.error}`);
    }
  }

  // Summary
  console.log('\n============================================');
  console.log('📊 SUMMARY');
  console.log('============================================');

  const insertCount = results.filter(r => r.action === 'insert' && r.success).length;
  const updateCount = results.filter(r => r.action === 'update' && r.success).length;
  const skipCount = results.filter(r => r.action === 'skip' || !r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  console.log(`Total Rows:     ${rows.length}`);
  console.log(`✅ Inserted:    ${insertCount}`);
  console.log(`🔄 Updated:     ${updateCount}`);
  console.log(`⏭️  Skipped:     ${skipCount}`);
  console.log(`❌ Errors:      ${errorCount}`);
  console.log('');

  if (isDryRun) {
    console.log('🔍 DRY RUN COMPLETE - No changes were made to the database');
    console.log('\nTo apply these changes, run:');
    console.log('  npx ts-node scripts/import-video-metadata.ts --apply');
  } else {
    console.log('✅ IMPORT COMPLETE');
    console.log('\nTo rollback these changes, run:');
    console.log(`  npx ts-node scripts/rollback-video-import.ts --date ${importDate} --confirm`);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
