# Firebase Native Config Setup Instructions

## ⚠️ IMPORTANT: Replace Placeholder Config Files

The files `google-services.json` and `GoogleService-Info.plist` currently contain PLACEHOLDER values.

You MUST download the actual config files from your Firebase Console for production use.

## Steps to Get Real Config Files:

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com/project/yogashna/settings/general

### 2. Download Android Config (google-services.json)
- Scroll to "Your apps" section
- Find or add Android app with package name: `com.dugmates.yogashna`
- Click the Android app
- Download `google-services.json`
- Replace the placeholder file at root: `google-services.json`

### 3. Download iOS Config (GoogleService-Info.plist)
- Find or add iOS app with bundle ID: `com.dugmates.yogashna`
- Click the iOS app
- Download `GoogleService-Info.plist`
- Replace the placeholder file at root: `GoogleService-Info.plist`

### 4. Verify Keys
Ensure these values match in both files:
- Project ID: `yogashna`
- Package/Bundle ID: `com.dugmates.yogashna`
- API Key: Should match your Firebase project

## Why These Are Needed:

React Native Firebase requires native config files to initialize properly. The placeholder files allow the build to succeed, but **phone authentication will NOT work** until you replace them with real files from Firebase Console.

## After Replacing:

1. Clean and rebuild:
   ```bash
   rm -rf android/build android/.gradle ios/build
   npx expo prebuild --clean
   npx expo run:android  # or npx expo run:ios
   ```

2. Test phone authentication - it should work without any reCAPTCHA logs.

---

**Current Status:** Placeholder files created ✅
**Action Required:** Download and replace with real Firebase config files ⚠️
