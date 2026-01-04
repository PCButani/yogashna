# Wellness Goals Seed Update

This document contains the updated wellness goal seed data that matches the mobile app UI labels exactly.

## Instructions

Replace the wellness goal section in `seed.ts` (after the 5 wellness focus definitions) with the code below.

## Updated Wellness Goals Seed

```typescript
  // ====================================================================
  // WELLNESS GOALS (mapped to wellness focuses)
  // ====================================================================

  // 1. Health Support Goals
  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'reduce_back_pain' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'reduce_back_pain',
      label: 'Back Pain Relief',
      parentTagId: wfHealthSupport.id,
      sortOrder: 1,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'stress_relief_health' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'stress_relief_health',
      label: 'Stress Relief',
      parentTagId: wfHealthSupport.id,
      sortOrder: 2,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'diabetes_support' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'diabetes_support',
      label: 'Diabetes Support',
      parentTagId: wfHealthSupport.id,
      sortOrder: 3,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'pcos_balance' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'pcos_balance',
      label: 'PCOS Balance',
      parentTagId: wfHealthSupport.id,
      sortOrder: 4,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'thyroid_support' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'thyroid_support',
      label: 'Thyroid Support',
      parentTagId: wfHealthSupport.id,
      sortOrder: 5,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'better_sleep_health' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'better_sleep_health',
      label: 'Better Sleep',
      parentTagId: wfHealthSupport.id,
      sortOrder: 6,
      isActive: true,
    },
  });

  // 2. Lifestyle & Habits Goals
  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'daily_routine' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'daily_routine',
      label: 'Daily Routine',
      parentTagId: wfLifestyleHabits.id,
      sortOrder: 1,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'better_sleep_lifestyle' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'better_sleep_lifestyle',
      label: 'Better Sleep',
      parentTagId: wfLifestyleHabits.id,
      sortOrder: 2,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'mindful_living' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'mindful_living',
      label: 'Mindful Living',
      parentTagId: wfLifestyleHabits.id,
      sortOrder: 3,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'discipline_consistency' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'discipline_consistency',
      label: 'Discipline & Consistency',
      parentTagId: wfLifestyleHabits.id,
      sortOrder: 4,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'energy_boost' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'energy_boost',
      label: 'Energy Boost',
      parentTagId: wfLifestyleHabits.id,
      sortOrder: 5,
      isActive: true,
    },
  });

  // 3. Fitness & Flexibility Goals
  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'weight_loss' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'weight_loss',
      label: 'Weight Loss',
      parentTagId: wfFitnessFlexibility.id,
      sortOrder: 1,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'strength_building' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'strength_building',
      label: 'Strength Building',
      parentTagId: wfFitnessFlexibility.id,
      sortOrder: 2,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'flexibility' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'flexibility',
      label: 'Flexibility',
      parentTagId: wfFitnessFlexibility.id,
      sortOrder: 3,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'posture_improvement' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'posture_improvement',
      label: 'Posture सुधार',
      parentTagId: wfFitnessFlexibility.id,
      sortOrder: 4,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'core_stability' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'core_stability',
      label: 'Core Stability',
      parentTagId: wfFitnessFlexibility.id,
      sortOrder: 5,
      isActive: true,
    },
  });

  // 4. Beginners & Mindfulness Goals
  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'beginner_friendly' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'beginner_friendly',
      label: 'Beginner Friendly',
      parentTagId: wfBeginnersMindfulness.id,
      sortOrder: 1,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'breathing_practice' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'breathing_practice',
      label: 'Breathing Practice',
      parentTagId: wfBeginnersMindfulness.id,
      sortOrder: 2,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'calm_mind' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'calm_mind',
      label: 'Calm Mind',
      parentTagId: wfBeginnersMindfulness.id,
      sortOrder: 3,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'anxiety_relief' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'anxiety_relief',
      label: 'Anxiety Relief',
      parentTagId: wfBeginnersMindfulness.id,
      sortOrder: 4,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'focus_clarity' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'focus_clarity',
      label: 'Focus & Clarity',
      parentTagId: wfBeginnersMindfulness.id,
      sortOrder: 5,
      isActive: true,
    },
  });

  // 5. Office Yoga Goals
  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'neck_shoulder_relief' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'neck_shoulder_relief',
      label: 'Neck & Shoulder Relief',
      parentTagId: wfOfficeYoga.id,
      sortOrder: 1,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'back_release' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'back_release',
      label: 'Back Release',
      parentTagId: wfOfficeYoga.id,
      sortOrder: 2,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'desk_stretching' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'desk_stretching',
      label: 'Desk Stretching',
      parentTagId: wfOfficeYoga.id,
      sortOrder: 3,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'stress_relief_office' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'stress_relief_office',
      label: 'Stress Relief',
      parentTagId: wfOfficeYoga.id,
      sortOrder: 4,
      isActive: true,
    },
  });

  await prisma.tag.upsert({
    where: { tagTypeId_code: { tagTypeId: tagTypeWellnessGoal.id, code: 'energy_at_work' } },
    update: {},
    create: {
      tagTypeId: tagTypeWellnessGoal.id,
      code: 'energy_at_work',
      label: 'Energy at Work',
      parentTagId: wfOfficeYoga.id,
      sortOrder: 5,
      isActive: true,
    },
  });
```

## Key Changes

1. **Exact UI Label Matching**: All labels now match the mobile app UI exactly (e.g., "Back Pain Relief" instead of "Reduce Back Pain & Improve Posture")

2. **Unique Codes for Duplicate Names**:
   - "Better Sleep" → `better_sleep_health` (Health Support) and `better_sleep_lifestyle` (Lifestyle & Habits)
   - "Stress Relief" → `stress_relief_health` (Health Support) and `stress_relief_office` (Office Yoga)

3. **Reduced from 36 to 26 goals**: Matches exactly what's shown in GoalsScreen.tsx

4. **Hindi/Sanskrit Support**: "Posture सुधार" preserved

## Next Steps

After updating seed.ts:
1. Run: `cd backend && npx prisma db push --accept-data-loss`
   (This will reset and recreate the schema)
2. Run: `npm run seed` or `npx prisma db seed`
3. Verify in Prisma Studio: `npx prisma studio`
