# Firebase Web SDK → Native Firebase Migration Guide

## 📋 Summary of Changes

Successfully migrated from Firebase Web SDK to @react-native-firebase for enterprise-grade, native Phone OTP authentication.

### ✅ Completed Tasks

1. **Removed Web Firebase Dependencies**
   - ❌ Removed `firebase` (Web SDK v12.7.0)
   - ❌ Removed `expo-firebase-recaptcha`
   - ✅ Added `@react-native-firebase/app` (v21.8.1)
   - ✅ Added `@react-native-firebase/auth` (v21.8.1)

2. **Updated Configuration Files**
   - ✅ [package.json](package.json) - Updated dependencies
   - ✅ [app.json](app.json) - Added native Firebase plugin
   - ✅ [src/config/firebase.ts](src/config/firebase.ts) - Switched to native auth

3. **Updated Authentication Screens**
   - ✅ [src/screens/Auth/AuthEntryScreen.tsx](src/screens/Auth/AuthEntryScreen.tsx)
     - Uses `auth().signInWithPhoneNumber()` (no reCAPTCHA!)
     - Native Firebase types
   - ✅ [src/screens/Auth/OtpVerifyScreen.tsx](src/screens/Auth/OtpVerifyScreen.tsx)
     - Uses `confirmationResult.confirm(otp)`
     - Uses `auth().signOut()` for logout

4. **Created Firebase Config Files**
   - ⚠️ [google-services.json](google-services.json) - PLACEHOLDER (must replace)
   - ⚠️ [GoogleService-Info.plist](GoogleService-Info.plist) - PLACEHOLDER (must replace)

---

## 🚀 Execution Steps (Run These Commands)

### Step 1: Clean Project

```bash
cd "/Users/apple/Library/CloudStorage/OneDrive-XpertnestSolutionsPrivateLimited/pradip.butani@xpertnestuk.onmicrosoft.com/Yoga App/yogashna"

# Remove old build artifacts
rm -rf node_modules
rm -rf android/build
rm -rf android/.gradle
rm -rf android/app/build
rm -rf ios/build
rm -rf .expo
rm -rf package-lock.json
```

### Step 2: Install Dependencies

```bash
npm install
```

Expected output: Should install @react-native-firebase/app and @react-native-firebase/auth successfully.

### Step 3: Prebuild (Generate Native Projects)

```bash
npx expo prebuild --clean
```

This will:
- Generate native `android/` and `ios/` folders
- Copy `google-services.json` to `android/app/`
- Copy `GoogleService-Info.plist` to `ios/`
- Configure native Firebase modules

### Step 4: Build & Run Android Dev Client

```bash
# Start Metro bundler in one terminal
npm start

# In another terminal, build and run Android
npx expo run:android
```

This will:
- Build a new development client with native Firebase
- Install it on your Android emulator/device
- Launch the app

**Expected Build Time**: 5-10 minutes (first build with native modules)

---

## ⚠️ CRITICAL: Replace Firebase Config Files

The placeholder config files will allow the build to succeed, but **Phone OTP will NOT work** until you replace them with real files from Firebase Console.

### Download Real Config Files:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/yogashna/settings/general

2. **Android Config**
   - Find or add Android app: `com.dugmates.yogashna`
   - Download `google-services.json`
   - Replace: `google-services.json` (root directory)

3. **iOS Config**
   - Find or add iOS app: `com.dugmates.yogashna`
   - Download `GoogleService-Info.plist`
   - Replace: `GoogleService-Info.plist` (root directory)

4. **After Replacing, Rebuild**
   ```bash
   npx expo prebuild --clean
   npx expo run:android
   ```

---

## 🔍 Verification Steps

### 1. Build Verification
After running `npx expo run:android`, confirm:
- ✅ Build completes without errors
- ✅ App installs and launches
- ✅ No Metro bundler errors

### 2. Authentication Testing

**Test Phone OTP Flow:**

1. Navigate to Auth Entry screen
2. Enter phone number: `+919876543210` (or your test number)
3. Tap "Continue"

**Expected Console Logs (SUCCESS):**
```
📱 Sending OTP to: +919876543210
✅ OTP sent successfully
```

**❌ OLD LOGS (Should NOT appear):**
```
Failed to initialize reCAPTCHA Enterprise config
auth/argument-error
```

4. Enter received OTP
5. Tap "Verify"

**Expected Console Logs (SUCCESS):**
```
🔑 Verifying OTP: 123456
✅ OTP verified successfully
👤 User: [Firebase UID]
🎫 ID Token: [Long JWT token]
```

6. Verify token is displayed on success screen
7. Test logout button

### 3. Success Indicators

✅ **Migration Successful If:**
- No "reCAPTCHA" logs in console
- OTP is received on phone
- OTP verification works
- Token is generated and displayed
- No `auth/argument-error` errors
- Logout works correctly

❌ **Migration Failed If:**
- Still seeing reCAPTCHA logs
- `auth/argument-error` appears
- OTP not received
- Build fails with Firebase errors

---

## 📁 Files Changed Checklist

### Modified Files:
- ✅ [package.json](package.json)
- ✅ [app.json](app.json)
- ✅ [src/config/firebase.ts](src/config/firebase.ts)
- ✅ [src/screens/Auth/AuthEntryScreen.tsx](src/screens/Auth/AuthEntryScreen.tsx)
- ✅ [src/screens/Auth/OtpVerifyScreen.tsx](src/screens/Auth/OtpVerifyScreen.tsx)

### New Files:
- ⚠️ [google-services.json](google-services.json) - PLACEHOLDER
- ⚠️ [GoogleService-Info.plist](GoogleService-Info.plist) - PLACEHOLDER
- ℹ️ [FIREBASE_CONFIG_INSTRUCTIONS.md](FIREBASE_CONFIG_INSTRUCTIONS.md)
- ℹ️ [MIGRATION_COMMANDS.sh](MIGRATION_COMMANDS.sh)
- ℹ️ [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) (this file)

### Removed Dependencies:
- ❌ `firebase` (Web SDK)
- ❌ `expo-firebase-recaptcha`
- ❌ Postinstall script

---

## 🐛 Troubleshooting

### Issue: "Cannot find module @react-native-firebase/auth"

**Solution:**
```bash
rm -rf node_modules
npm install
npx expo prebuild --clean
npx expo run:android
```

### Issue: Build fails with "google-services.json not found"

**Solution:**
The placeholder file should work for build. If it fails:
1. Ensure `google-services.json` exists in root directory
2. Run `npx expo prebuild --clean` to copy it to `android/app/`

### Issue: OTP not received

**Causes:**
1. Using placeholder config files (not real Firebase config)
2. Firebase project doesn't have Phone Auth enabled
3. Test phone number not whitelisted

**Solution:**
1. Replace placeholder config files with real ones from Firebase Console
2. Enable Phone Auth in Firebase Console: Authentication → Sign-in method → Phone
3. For testing without SMS, add test phone numbers in Firebase Console

### Issue: Metro bundler errors

**Solution:**
```bash
# Kill all Metro instances
killall node

# Clear Metro cache
npx expo start --clear
```

### Issue: Android build fails

**Solution:**
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
npx expo run:android
```

---

## 📊 Code Changes Summary

### Before (Web SDK):
```typescript
import { signInWithPhoneNumber } from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

// Required reCAPTCHA
const confirmationResult = await signInWithPhoneNumber(
  auth,
  phoneNumber,
  recaptchaVerifier.current
);
```

### After (Native Firebase):
```typescript
import auth from "@react-native-firebase/auth";

// No reCAPTCHA needed!
const confirmationResult = await auth().signInWithPhoneNumber(phoneNumber);
```

---

## ✅ Final Checklist

Before considering migration complete:

- [ ] Run `npm install` successfully
- [ ] Run `npx expo prebuild --clean` successfully
- [ ] Run `npx expo run:android` successfully
- [ ] App launches without errors
- [ ] Can enter phone number and request OTP
- [ ] No reCAPTCHA logs in console
- [ ] OTP received on phone
- [ ] OTP verification works
- [ ] Token displayed on success screen
- [ ] Logout works
- [ ] Replace placeholder Firebase config files with real ones
- [ ] Test again after replacing config files

---

## 📞 Support

If you encounter issues:
1. Check console logs for error codes
2. Verify Firebase Console settings (Phone Auth enabled)
3. Ensure real Firebase config files are in place
4. Check Firebase project quota (SMS limits)

---

**Migration Prepared By:** Claude Code
**Date:** 2026-01-09
**Target Environment:** Expo Dev Client + React Native 0.81.5
**Firebase Version:** @react-native-firebase v21.8.1
