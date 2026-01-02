import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // A) LANGUAGES
  // ============================================
  console.log('📚 Seeding languages...');

  const languageEn = await prisma.language.upsert({
    where: { code: 'en' },
    update: {},
    create: {
      code: 'en',
      name: 'English',
      isActive: true,
    },
  });

  const languageGu = await prisma.language.upsert({
    where: { code: 'gu' },
    update: {},
    create: {
      code: 'gu',
      name: 'Gujarati',
      isActive: true,
    },
  });

  const languageHi = await prisma.language.upsert({
    where: { code: 'hi' },
    update: {},
    create: {
      code: 'hi',
      name: 'Hindi',
      isActive: true,
    },
  });

  console.log(`✓ Languages: ${languageEn.code}, ${languageGu.code}, ${languageHi.code}`);

  // ============================================
  // B) TAG TYPES
  // ============================================
  console.log('🏷️  Seeding tag types...');

  const tagTypeGoal = await prisma.tagType.upsert({
    where: { code: 'goal' },
    update: {},
    create: {
      code: 'goal',
      label: 'Goal',
    },
  });

  const tagTypeStyle = await prisma.tagType.upsert({
    where: { code: 'style' },
    update: {},
    create: {
      code: 'style',
      label: 'Style',
    },
  });

  const tagTypeDurationBucket = await prisma.tagType.upsert({
    where: { code: 'duration_bucket' },
    update: {},
    create: {
      code: 'duration_bucket',
      label: 'Duration Bucket',
    },
  });

  const tagTypeLevel = await prisma.tagType.upsert({
    where: { code: 'level' },
    update: {},
    create: {
      code: 'level',
      label: 'Level',
    },
  });

  const tagTypeFocusArea = await prisma.tagType.upsert({
    where: { code: 'focus_area' },
    update: {},
    create: {
      code: 'focus_area',
      label: 'Focus Area',
    },
  });

  const tagTypeContraindication = await prisma.tagType.upsert({
    where: { code: 'contraindication' },
    update: {},
    create: {
      code: 'contraindication',
      label: 'Contraindication',
    },
  });

  const tagTypeSubCategory = await prisma.tagType.upsert({
    where: { code: 'sub_category' },
    update: {},
    create: {
      code: 'sub_category',
      label: 'Sub Category',
    },
  });

  console.log('✓ Tag types created');

  // ============================================
  // C) TAGS
  // ============================================
  console.log('🔖 Seeding tags...');

  // Goals
  const tagBackPain = await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeGoal.id, code: 'back_pain' } },
    update: {},
    create: {
      tagTypeId: tagTypeGoal.id,
      code: 'back_pain',
      label: 'Back Pain',
    },
  });

  const tagStressRelief = await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeGoal.id, code: 'stress_relief' } },
    update: {},
    create: {
      tagTypeId: tagTypeGoal.id,
      code: 'stress_relief',
      label: 'Stress Relief',
    },
  });

  // Focus Area
  const tagHealthSupport = await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeFocusArea.id, code: 'health_support' } },
    update: {},
    create: {
      tagTypeId: tagTypeFocusArea.id,
      code: 'health_support',
      label: 'Health Support',
    },
  });

  // Level
  const tagBeginner = await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeLevel.id, code: 'beginner' } },
    update: {},
    create: {
      tagTypeId: tagTypeLevel.id,
      code: 'beginner',
      label: 'Beginner',
    },
  });

  // Duration Buckets
  const tagDuration5to7 = await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeDurationBucket.id, code: '5_7_min' } },
    update: {},
    create: {
      tagTypeId: tagTypeDurationBucket.id,
      code: '5_7_min',
      label: '5-7 min',
    },
  });

  const tagDuration12to20 = await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeDurationBucket.id, code: '12_20_min' } },
    update: {},
    create: {
      tagTypeId: tagTypeDurationBucket.id,
      code: '12_20_min',
      label: '12-20 min',
    },
  });

  // Style
  const tagHatha = await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeStyle.id, code: 'hatha' } },
    update: {},
    create: {
      tagTypeId: tagTypeStyle.id,
      code: 'hatha',
      label: 'Hatha',
    },
  });

  // Sub Category
  const tagWarmUp = await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeSubCategory.id, code: 'warmup' } },
    update: {},
    create: {
      tagTypeId: tagTypeSubCategory.id,
      code: 'warmup',
      label: 'WarmUp',
    },
  });

  const tagMainPractice = await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeSubCategory.id, code: 'main_practice' } },
    update: {},
    create: {
      tagTypeId: tagTypeSubCategory.id,
      code: 'main_practice',
      label: 'MainPractice',
    },
  });

  console.log('✓ Tags created');

  // ============================================
  // D) VIDEOS
  // ============================================
  console.log('🎥 Seeding videos...');

  const video1 = await prisma.video.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Gentle Morning Warm-Up',
      descriptionShort: 'Start your day with gentle stretches to wake up your body',
      primaryCategory: 'YOGA',
      durationSec: 360,
      level: 'BEGINNER',
      intensity: 'LOW',
      strengthDemand: 'VERY_LIGHT',
      accessLevel: 'FREE',
      cloudflareStreamUid: 'cfstream-warmup-001',
      thumbnailR2Key: 'thumbnails/warmup-001.jpg',
      status: 'ACTIVE',
      version: 1,
    },
  });

  const video2 = await prisma.video.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Lower Back Relief Flow',
      descriptionShort: 'Gentle yoga flow targeting lower back tension and pain',
      primaryCategory: 'YOGA',
      durationSec: 720,
      level: 'BEGINNER',
      intensity: 'LOW',
      strengthDemand: 'LIGHT',
      accessLevel: 'SUBSCRIPTION',
      requiredEntitlementKey: 'premium_access',
      cloudflareStreamUid: 'cfstream-backpain-001',
      thumbnailR2Key: 'thumbnails/backpain-001.jpg',
      status: 'ACTIVE',
      version: 1,
    },
  });

  const video3 = await prisma.video.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Deep Breathing for Stress',
      descriptionShort: 'Pranayama practice to calm the mind and reduce stress',
      primaryCategory: 'BREATHING',
      durationSec: 480,
      level: 'ALL_LEVELS',
      intensity: 'LOW',
      strengthDemand: 'VERY_LIGHT',
      accessLevel: 'FREE',
      cloudflareStreamUid: 'cfstream-breathing-001',
      thumbnailR2Key: 'thumbnails/breathing-001.jpg',
      status: 'ACTIVE',
      version: 1,
    },
  });

  const video4 = await prisma.video.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Evening Relaxation',
      descriptionShort: 'Guided meditation to release tension and prepare for rest',
      primaryCategory: 'MEDITATION',
      durationSec: 600,
      level: 'ALL_LEVELS',
      intensity: 'LOW',
      strengthDemand: 'VERY_LIGHT',
      accessLevel: 'SUBSCRIPTION',
      requiredEntitlementKey: 'premium_access',
      cloudflareStreamUid: 'cfstream-meditation-001',
      thumbnailR2Key: 'thumbnails/meditation-001.jpg',
      status: 'ACTIVE',
      version: 1,
    },
  });

  const video5 = await prisma.video.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      name: 'Core Strengthening Practice',
      descriptionShort: 'Build core stability to support your back and posture',
      primaryCategory: 'YOGA',
      durationSec: 900,
      level: 'INTERMEDIATE',
      intensity: 'MEDIUM',
      strengthDemand: 'MODERATE',
      accessLevel: 'SUBSCRIPTION',
      requiredEntitlementKey: 'premium_access',
      cloudflareStreamUid: 'cfstream-core-001',
      thumbnailR2Key: 'thumbnails/core-001.jpg',
      status: 'ACTIVE',
      version: 1,
    },
  });

  const video6 = await prisma.video.upsert({
    where: { id: '00000000-0000-0000-0000-000000000006' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000006',
      name: 'Spinal Mobility Flow',
      descriptionShort: 'Improve flexibility and range of motion in your spine',
      primaryCategory: 'YOGA',
      durationSec: 780,
      level: 'BEGINNER',
      intensity: 'MEDIUM',
      strengthDemand: 'LIGHT',
      accessLevel: 'FREE',
      cloudflareStreamUid: 'cfstream-spine-001',
      thumbnailR2Key: 'thumbnails/spine-001.jpg',
      status: 'ACTIVE',
      version: 1,
    },
  });

  console.log('✓ Videos created');

  // ============================================
  // VIDEO TAGS
  // ============================================
  console.log('🔗 Linking video tags...');

  // Video 1 - Warm-Up
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video1.id, tagId: tagWarmUp.id } },
    update: {},
    create: { videoId: video1.id, tagId: tagWarmUp.id },
  });
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video1.id, tagId: tagBeginner.id } },
    update: {},
    create: { videoId: video1.id, tagId: tagBeginner.id },
  });
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video1.id, tagId: tagDuration5to7.id } },
    update: {},
    create: { videoId: video1.id, tagId: tagDuration5to7.id },
  });

  // Video 2 - Back Pain
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video2.id, tagId: tagBackPain.id } },
    update: {},
    create: { videoId: video2.id, tagId: tagBackPain.id },
  });
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video2.id, tagId: tagHealthSupport.id } },
    update: {},
    create: { videoId: video2.id, tagId: tagHealthSupport.id },
  });
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video2.id, tagId: tagDuration12to20.id } },
    update: {},
    create: { videoId: video2.id, tagId: tagDuration12to20.id },
  });
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video2.id, tagId: tagHatha.id } },
    update: {},
    create: { videoId: video2.id, tagId: tagHatha.id },
  });

  // Video 3 - Breathing
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video3.id, tagId: tagStressRelief.id } },
    update: {},
    create: { videoId: video3.id, tagId: tagStressRelief.id },
  });

  // Video 4 - Meditation
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video4.id, tagId: tagStressRelief.id } },
    update: {},
    create: { videoId: video4.id, tagId: tagStressRelief.id },
  });

  // Video 5 - Core
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video5.id, tagId: tagBackPain.id } },
    update: {},
    create: { videoId: video5.id, tagId: tagBackPain.id },
  });
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video5.id, tagId: tagHealthSupport.id } },
    update: {},
    create: { videoId: video5.id, tagId: tagHealthSupport.id },
  });

  // Video 6 - Spinal
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video6.id, tagId: tagBackPain.id } },
    update: {},
    create: { videoId: video6.id, tagId: tagBackPain.id },
  });
  await prisma.videoTag.upsert({
    where: { videoId_tagId: { videoId: video6.id, tagId: tagDuration12to20.id } },
    update: {},
    create: { videoId: video6.id, tagId: tagDuration12to20.id },
  });

  console.log('✓ Video tags linked');

  // ============================================
  // E) PROGRAM TEMPLATES
  // ============================================
  console.log('📋 Seeding program templates...');

  // Program 1: Back Pain Relief
  const program1 = await prisma.programTemplate.upsert({
    where: { id: '10000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'Back Pain Relief Program',
      sanskritTitle: 'Pṛṣṭha Śūla Nivāraṇa',
      subtitle: 'Gentle practice for a healthy spine',
      descriptionShort: 'A 3-day program designed to relieve back pain through targeted yoga flows',
      heroImageR2Key: 'programs/back-pain-hero.jpg',
      defaultDays: 3,
      defaultMinutesPerDay: 15,
      levelLabel: 'Beginner Friendly',
      accessLevel: 'SUBSCRIPTION',
      requiredEntitlementKey: 'premium_access',
      status: 'ACTIVE',
      version: 1,
    },
  });

  // Program 1 Sections
  await prisma.programTemplateSection.upsert({
    where: { id: '11000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '11000000-0000-0000-0000-000000000001',
      programTemplateId: program1.id,
      type: 'BENEFIT',
      sortOrder: 1,
      text: 'Reduces lower back tension and pain',
    },
  });

  await prisma.programTemplateSection.upsert({
    where: { id: '11000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '11000000-0000-0000-0000-000000000002',
      programTemplateId: program1.id,
      type: 'BENEFIT',
      sortOrder: 2,
      text: 'Improves spinal flexibility and posture',
    },
  });

  await prisma.programTemplateSection.upsert({
    where: { id: '11000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '11000000-0000-0000-0000-000000000003',
      programTemplateId: program1.id,
      type: 'SAFETY_NOTE',
      sortOrder: 1,
      text: 'Consult your doctor if you have severe or chronic back pain',
    },
  });

  // Program 1 Days
  const p1day1 = await prisma.programDay.upsert({
    where: { programTemplateId_dayNumber: { programTemplateId: program1.id, dayNumber: 1 } },
    update: {},
    create: {
      programTemplateId: program1.id,
      dayNumber: 1,
      title: 'Gentle Introduction',
      intent: 'Warm up the body and assess your current state',
    },
  });

  const p1day2 = await prisma.programDay.upsert({
    where: { programTemplateId_dayNumber: { programTemplateId: program1.id, dayNumber: 2 } },
    update: {},
    create: {
      programTemplateId: program1.id,
      dayNumber: 2,
      title: 'Deepen the Practice',
      intent: 'Target deeper layers of tension in the back',
    },
  });

  const p1day3 = await prisma.programDay.upsert({
    where: { programTemplateId_dayNumber: { programTemplateId: program1.id, dayNumber: 3 } },
    update: {},
    create: {
      programTemplateId: program1.id,
      dayNumber: 3,
      title: 'Strengthen & Release',
      intent: 'Build core strength while releasing remaining tension',
    },
  });

  // Program 1 Day Items
  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p1day1.id, orderIndex: 1 } },
    update: {},
    create: {
      programDayId: p1day1.id,
      orderIndex: 1,
      videoId: video1.id,
      sequenceRole: 'warmup',
    },
  });

  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p1day1.id, orderIndex: 2 } },
    update: {},
    create: {
      programDayId: p1day1.id,
      orderIndex: 2,
      videoId: video2.id,
      sequenceRole: 'main',
    },
  });

  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p1day2.id, orderIndex: 1 } },
    update: {},
    create: {
      programDayId: p1day2.id,
      orderIndex: 1,
      videoId: video6.id,
      sequenceRole: 'main',
    },
  });

  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p1day2.id, orderIndex: 2 } },
    update: {},
    create: {
      programDayId: p1day2.id,
      orderIndex: 2,
      videoId: video3.id,
      sequenceRole: 'cooldown',
    },
  });

  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p1day3.id, orderIndex: 1 } },
    update: {},
    create: {
      programDayId: p1day3.id,
      orderIndex: 1,
      videoId: video1.id,
      sequenceRole: 'warmup',
    },
  });

  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p1day3.id, orderIndex: 2 } },
    update: {},
    create: {
      programDayId: p1day3.id,
      orderIndex: 2,
      videoId: video5.id,
      sequenceRole: 'main',
    },
  });

  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p1day3.id, orderIndex: 3 } },
    update: {},
    create: {
      programDayId: p1day3.id,
      orderIndex: 3,
      videoId: video4.id,
      sequenceRole: 'cooldown',
    },
  });

  // Program 1 Tags
  await prisma.programTemplateTag.upsert({
    where: { programTemplateId_tagId: { programTemplateId: program1.id, tagId: tagBackPain.id } },
    update: {},
    create: { programTemplateId: program1.id, tagId: tagBackPain.id },
  });

  await prisma.programTemplateTag.upsert({
    where: { programTemplateId_tagId: { programTemplateId: program1.id, tagId: tagHealthSupport.id } },
    update: {},
    create: { programTemplateId: program1.id, tagId: tagHealthSupport.id },
  });

  console.log('✓ Program 1: Back Pain Relief');

  // Program 2: Stress Relief
  const program2 = await prisma.programTemplate.upsert({
    where: { id: '10000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '10000000-0000-0000-0000-000000000002',
      title: 'Stress Relief Journey',
      sanskritTitle: 'Tanāva Mukti Yātrā',
      subtitle: 'Find calm in your daily life',
      descriptionShort: 'A 3-day program combining breath, movement, and meditation to reduce stress',
      heroImageR2Key: 'programs/stress-relief-hero.jpg',
      defaultDays: 3,
      defaultMinutesPerDay: 12,
      levelLabel: 'All Levels',
      accessLevel: 'SUBSCRIPTION',
      requiredEntitlementKey: 'premium_access',
      status: 'ACTIVE',
      version: 1,
    },
  });

  // Program 2 Sections
  await prisma.programTemplateSection.upsert({
    where: { id: '12000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '12000000-0000-0000-0000-000000000001',
      programTemplateId: program2.id,
      type: 'BENEFIT',
      sortOrder: 1,
      text: 'Reduces anxiety and mental tension',
    },
  });

  await prisma.programTemplateSection.upsert({
    where: { id: '12000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '12000000-0000-0000-0000-000000000002',
      programTemplateId: program2.id,
      type: 'BENEFIT',
      sortOrder: 2,
      text: 'Improves sleep quality and emotional balance',
    },
  });

  await prisma.programTemplateSection.upsert({
    where: { id: '12000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '12000000-0000-0000-0000-000000000003',
      programTemplateId: program2.id,
      type: 'WHAT_YOU_NEED',
      sortOrder: 1,
      text: 'A quiet space where you can practice without interruption',
    },
  });

  // Program 2 Days
  const p2day1 = await prisma.programDay.upsert({
    where: { programTemplateId_dayNumber: { programTemplateId: program2.id, dayNumber: 1 } },
    update: {},
    create: {
      programTemplateId: program2.id,
      dayNumber: 1,
      title: 'Breathe & Release',
      intent: 'Learn foundational breathing techniques for stress relief',
    },
  });

  const p2day2 = await prisma.programDay.upsert({
    where: { programTemplateId_dayNumber: { programTemplateId: program2.id, dayNumber: 2 } },
    update: {},
    create: {
      programTemplateId: program2.id,
      dayNumber: 2,
      title: 'Move & Flow',
      intent: 'Release physical tension through gentle movement',
    },
  });

  const p2day3 = await prisma.programDay.upsert({
    where: { programTemplateId_dayNumber: { programTemplateId: program2.id, dayNumber: 3 } },
    update: {},
    create: {
      programTemplateId: program2.id,
      dayNumber: 3,
      title: 'Rest & Restore',
      intent: 'Deep relaxation to integrate the practice',
    },
  });

  // Program 2 Day Items
  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p2day1.id, orderIndex: 1 } },
    update: {},
    create: {
      programDayId: p2day1.id,
      orderIndex: 1,
      videoId: video3.id,
      sequenceRole: 'main',
    },
  });

  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p2day1.id, orderIndex: 2 } },
    update: {},
    create: {
      programDayId: p2day1.id,
      orderIndex: 2,
      videoId: video4.id,
      sequenceRole: 'cooldown',
    },
  });

  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p2day2.id, orderIndex: 1 } },
    update: {},
    create: {
      programDayId: p2day2.id,
      orderIndex: 1,
      videoId: video1.id,
      sequenceRole: 'warmup',
    },
  });

  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p2day2.id, orderIndex: 2 } },
    update: {},
    create: {
      programDayId: p2day2.id,
      orderIndex: 2,
      videoId: video6.id,
      sequenceRole: 'main',
    },
  });

  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p2day3.id, orderIndex: 1 } },
    update: {},
    create: {
      programDayId: p2day3.id,
      orderIndex: 1,
      videoId: video3.id,
      sequenceRole: 'main',
    },
  });

  await prisma.programDayItem.upsert({
    where: { programDayId_orderIndex: { programDayId: p2day3.id, orderIndex: 2 } },
    update: {},
    create: {
      programDayId: p2day3.id,
      orderIndex: 2,
      videoId: video4.id,
      sequenceRole: 'cooldown',
    },
  });

  // Program 2 Tags
  await prisma.programTemplateTag.upsert({
    where: { programTemplateId_tagId: { programTemplateId: program2.id, tagId: tagStressRelief.id } },
    update: {},
    create: { programTemplateId: program2.id, tagId: tagStressRelief.id },
  });

  console.log('✓ Program 2: Stress Relief Journey');

  console.log('✅ Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
