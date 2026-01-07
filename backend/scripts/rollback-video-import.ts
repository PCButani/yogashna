#!/usr/bin/env ts-node

/**
 * Rollback Video Import Script
 *
 * Deletes VideoAsset records that were imported via import-video-metadata.ts
 *
 * Usage:
 *   npx ts-node scripts/rollback-video-import.ts --date 2026_01_06 --confirm
 *   npx ts-node scripts/rollback-video-import.ts --all --confirm
 */

import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

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
  const isConfirmed = args.includes('--confirm');
  const dateArg = args.find(arg => arg.startsWith('--date='))?.split('=')[1];
  const isAll = args.includes('--all');

  try {
    await prisma.videoAsset.findFirst({ select: { id: true, tags: true } });
  } catch (error: any) {
    console.error('❌ Prisma validation failed: unable to read VideoAsset tags.');
    console.error(error?.message ?? error);
    await prisma.$disconnect();
    process.exit(1);
  }

  if (!isConfirmed) {
    console.error('❌ Error: You must specify --confirm to proceed');
    console.log('\nUsage:');
    console.log('  npx ts-node scripts/rollback-video-import.ts --date=2026_01_06 --confirm');
    console.log('  npx ts-node scripts/rollback-video-import.ts --all --confirm');
    process.exit(1);
  }

  if (!dateArg && !isAll) {
    console.error('❌ Error: You must specify either --date=YYYY_MM_DD or --all');
    process.exit(1);
  }

  console.log('============================================');
  console.log('🔙 ROLLBACK VIDEO IMPORT');
  console.log('============================================');
  console.log(`Mode: ${isAll ? 'Delete ALL imported videos' : `Delete videos from ${dateArg}`}`);
  console.log('');

  // Build filter
  const tagFilter = isAll
    ? { path: [], array_contains: ['excel_import'] }
    : { path: [], array_contains: [`import_date_${dateArg}`] };

  // Find matching videos
  console.log('🔍 Finding videos to delete...');
  const videosToDelete = await prisma.videoAsset.findMany({
    where: {
      tags: tagFilter,
    },
    select: {
      id: true,
      name: true,
      streamUid: true,
      tags: true,
    },
  });

  if (videosToDelete.length === 0) {
    console.log('✅ No videos found matching criteria');
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log(`\n⚠️  Found ${videosToDelete.length} videos to delete:\n`);
  videosToDelete.forEach((video, i) => {
    console.log(`  ${i + 1}. ${video.name} (${video.streamUid})`);
  });

  console.log('');
  const confirmed = await askConfirmation(`Are you sure you want to delete ${videosToDelete.length} videos?`);

  if (!confirmed) {
    console.log('❌ Rollback cancelled by user');
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log('\n🗑️  Deleting videos...');

  let deletedCount = 0;
  let errorCount = 0;

  for (const video of videosToDelete) {
    try {
      await prisma.videoAsset.delete({
        where: { id: video.id },
      });
      console.log(`  ✅ Deleted: ${video.name}`);
      deletedCount++;
    } catch (error: any) {
      console.log(`  ❌ Failed: ${video.name} - ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n============================================');
  console.log('📊 ROLLBACK SUMMARY');
  console.log('============================================');
  console.log(`Total Found:    ${videosToDelete.length}`);
  console.log(`✅ Deleted:     ${deletedCount}`);
  console.log(`❌ Errors:      ${errorCount}`);
  console.log('');
  console.log('✅ ROLLBACK COMPLETE');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
