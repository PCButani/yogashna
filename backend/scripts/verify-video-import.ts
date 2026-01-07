#!/usr/bin/env ts-node

/**
 * Verify Video Import Script
 *
 * Displays imported VideoAsset records for verification
 *
 * Usage:
 *   npx ts-node scripts/verify-video-import.ts
 *   npx ts-node scripts/verify-video-import.ts --date 2026_01_07
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const dateArg = args.find(arg => arg.startsWith('--date='))?.split('=')[1];

  try {
    await prisma.videoAsset.findFirst({ select: { id: true, tags: true } });
  } catch (error: any) {
    console.error('❌ Prisma validation failed: unable to read VideoAsset tags.');
    console.error(error?.message ?? error);
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('============================================');
  console.log('🔍 VERIFY VIDEO IMPORT');
  console.log('============================================\n');

  // Build filter
  const tagFilter = dateArg
    ? { path: [], array_contains: [`import_date_${dateArg}`] }
    : { path: [], array_contains: ['excel_import'] };

  // Find imported videos
  const videos = await prisma.videoAsset.findMany({
    where: {
      tags: tagFilter,
    },
    select: {
      id: true,
      name: true,
      shortDescription: true,
      streamUid: true,
      thumbnailKey: true,
      primaryCategory: true,
      yogaSubCategory: true,
      breathingSubCategory: true,
      meditationSubCategory: true,
      level: true,
      intensity: true,
      strengthDemand: true,
      sequenceRole: true,
      durationSec: true,
      focusAreas: true,
      goals: true,
      contraIndications: true,
      status: true,
      version: true,
      tags: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (videos.length === 0) {
    console.log('❌ No imported videos found');
    if (dateArg) {
      console.log(`   Try running without --date to see all imports`);
    }
    await prisma.$disconnect();
    process.exit(0);
  }

  console.log(`✅ Found ${videos.length} imported videos\n`);

  videos.forEach((video, i) => {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📹 Video ${i + 1}/${videos.length}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`ID:               ${video.id}`);
    console.log(`Title:            ${video.name}`);
    console.log(`Description:      ${video.shortDescription}`);
    console.log(`Stream UID:       ${video.streamUid}`);
    console.log(`Thumbnail Key:    ${video.thumbnailKey}`);
    console.log(`Primary Category: ${video.primaryCategory}`);

    if (video.yogaSubCategory) {
      console.log(`Yoga Subcategory: ${video.yogaSubCategory}`);
    }
    if (video.breathingSubCategory) {
      console.log(`Breathing Sub:    ${video.breathingSubCategory}`);
    }
    if (video.meditationSubCategory) {
      console.log(`Meditation Sub:   ${video.meditationSubCategory}`);
    }

    console.log(`Sequence Role:    ${video.sequenceRole}`);
    console.log(`Level:            ${video.level}`);
    console.log(`Intensity:        ${video.intensity}`);
    console.log(`Strength Demand:  ${video.strengthDemand}`);
    console.log(`Duration:         ${video.durationSec}s (${Math.floor(video.durationSec / 60)}m ${video.durationSec % 60}s)`);
    console.log(`Status:           ${video.status}`);
    console.log(`Version:          ${video.version}`);
    console.log(`Goals:            ${JSON.stringify(video.goals)}`);
    console.log(`Focus Areas:      ${JSON.stringify(video.focusAreas)}`);

    if (video.contraIndications && (video.contraIndications as any[]).length > 0) {
      console.log(`Contraindications: ${JSON.stringify(video.contraIndications)}`);
    }

    console.log(`Tags:             ${JSON.stringify(video.tags)}`);
    console.log(`Created:          ${video.createdAt.toISOString()}`);
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY BY CATEGORY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const categoryCounts = videos.reduce((acc, v) => {
    acc[v.primaryCategory] = (acc[v.primaryCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`${category.padEnd(12)}: ${count} videos`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY BY STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const statusCounts = videos.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`${status.padEnd(12)}: ${count} videos`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY BY SEQUENCE ROLE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const roleCounts = videos.reduce((acc, v) => {
    acc[v.sequenceRole] = (acc[v.sequenceRole] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(roleCounts).forEach(([role, count]) => {
    console.log(`${role.padEnd(12)}: ${count} videos`);
  });

  console.log('');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
