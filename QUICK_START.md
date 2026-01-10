# 🚀 Quick Start: Run These Commands

## Execute in Terminal (macOS)

```bash
# Navigate to project
cd "/Users/apple/Library/CloudStorage/OneDrive-XpertnestSolutionsPrivateLimited/pradip.butani@xpertnestuk.onmicrosoft.com/Yoga App/yogashna"

# Step 1: Clean everything
rm -rf node_modules android/build android/.gradle android/app/build ios/build .expo package-lock.json

# Step 2: Install dependencies
npm install

# Step 3: Generate native projects with Firebase
npx expo prebuild --clean

# Step 4: Build and run Android
npx expo run:android
```

## Expected Timeline
- Clean: ~10 seconds
- Install: ~2-3 minutes
- Prebuild: ~1-2 minutes
- Android Build: ~5-10 minutes (first time)

## What Changed

| Before | After |
|--------|-------|
| `firebase` (Web SDK) | `@react-native-firebase/auth` (Native) |
| `expo-firebase-recaptcha` | ❌ Removed |
| reCAPTCHA required | ✅ No reCAPTCHA needed |
| `auth/argument-error` | ✅ Works natively |

## Test Phone OTP

1. Enter: `+919876543210` (or your number)
2. Check console for: `✅ OTP sent successfully`
3. ❌ Should NOT see: "reCAPTCHA" or "auth/argument-error"
4. Enter OTP → Verify → See token

## Files You Modified

- [package.json](package.json) - Swapped dependencies
- [app.json](app.json) - Added Firebase plugin
- [src/config/firebase.ts](src/config/firebase.ts) - Native Firebase import
- [src/screens/Auth/AuthEntryScreen.tsx](src/screens/Auth/AuthEntryScreen.tsx) - Native phone auth
- [src/screens/Auth/OtpVerifyScreen.tsx](src/screens/Auth/OtpVerifyScreen.tsx) - Native OTP verify

## ⚠️ IMPORTANT

The placeholder Firebase config files ([google-services.json](google-services.json), [GoogleService-Info.plist](GoogleService-Info.plist)) allow the build to work but **you must replace them with real files from Firebase Console** for production use.

See [FIREBASE_CONFIG_INSTRUCTIONS.md](FIREBASE_CONFIG_INSTRUCTIONS.md) for details.

## Troubleshooting

**Can't find module @react-native-firebase/auth?**
→ Run: `npm install && npx expo prebuild --clean && npx expo run:android`

**Build fails?**
→ Clean: `cd android && ./gradlew clean && cd .. && npx expo prebuild --clean`

**Metro errors?**
→ Clear: `killall node && npx expo start --clear`

---

✅ See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for full details
