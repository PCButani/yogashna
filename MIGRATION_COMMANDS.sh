#!/bin/bash
# Firebase Migration Commands - Execute these in order

echo "=== STEP 1: Clean and Remove Web Firebase ==="
cd "/Users/apple/Library/CloudStorage/OneDrive-XpertnestSolutionsPrivateLimited/pradip.butani@xpertnestuk.onmicrosoft.com/Yoga App/yogashna"

# Remove old dependencies
npm uninstall firebase expo-firebase-recaptcha

echo ""
echo "=== STEP 2: Install Native Firebase ==="
npm install @react-native-firebase/app @react-native-firebase/auth

echo ""
echo "=== STEP 3: Clean Build Artifacts ==="
rm -rf node_modules
rm -rf android/build
rm -rf android/.gradle
rm -rf ios/build
rm -rf .expo
rm package-lock.json

echo ""
echo "=== STEP 4: Fresh Install ==="
npm install

echo ""
echo "=== STEP 5: Prebuild for Native Modules ==="
npx expo prebuild --clean

echo ""
echo "=== STEP 6: Build Android Dev Client ==="
npx expo run:android

echo ""
echo "✅ Migration complete! App should now use native Firebase auth."
