# 🚨 START HERE - Firebase Migration Steps

## Current Error
```
PluginError: Failed to resolve plugin for module "@react-native-firebase/app"
```

**Cause:** Package not installed yet (just added to package.json)

---

## ✅ Follow These Steps (Copy & Paste)

### Step 1: Install Dependencies
```bash
cd "/Users/apple/Library/CloudStorage/OneDrive-XpertnestSolutionsPrivateLimited/pradip.butani@xpertnestuk.onmicrosoft.com/Yoga App/yogashna"

npm install
```

**Expected output:**
```
added 2 packages, removed 2 packages
@react-native-firebase/app@21.8.1
@react-native-firebase/auth@21.8.1
```

**Time:** ~2-3 minutes

---

### Step 2: Clean Build (Important!)
```bash
rm -rf android/build android/.gradle android/app/build ios/build .expo
```

**Why:** Remove old build artifacts that used Web Firebase

---

### Step 3: Prebuild (Generate Native Code)
```bash
npx expo prebuild --clean
```

**What this does:**
- Creates/updates `android/` and `ios/` folders
- Copies `google-services.json` to `android/app/`
- Copies `GoogleService-Info.plist` to `ios/`
- Configures native Firebase modules

**Expected output:**
```
✔ Created native directories
✔ Updated native configuration
```

**Time:** ~1-2 minutes

---

### Step 4: Build & Run Android
```bash
npx expo run:android
```

**What this does:**
- Builds a new development client with native Firebase
- Installs it on emulator/device
- Starts the app

**Expected output:**
```
BUILD SUCCESSFUL
Installing APK...
Starting Metro bundler...
```

**Time:** ~5-10 minutes (first build)

---

## 🎯 After Successful Build

Test the Phone OTP flow:

1. Enter phone: `+919876543210`
2. Check console logs:
   - ✅ Should see: `✅ OTP sent successfully`
   - ❌ Should NOT see: "reCAPTCHA" or "auth/argument-error"

---

## ⚠️ DO NOT Use These Commands (Yet)

❌ `npx expo start` - Won't work until native modules are built
❌ `npx expo start --tunnel` - Same issue
❌ `npm start` - Same issue

**Why:** Native Firebase requires native code to be compiled first.

**Use instead:** `npx expo run:android` (does everything in one command)

---

## 🐛 If npm install Fails

Try:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📊 Progress Tracker

- [ ] Step 1: `npm install` completed
- [ ] Step 2: Clean old builds
- [ ] Step 3: `npx expo prebuild --clean` completed
- [ ] Step 4: `npx expo run:android` completed
- [ ] Step 5: Test Phone OTP (no reCAPTCHA logs)
- [ ] Step 6: Replace Firebase config files (see FIREBASE_CONFIG_INSTRUCTIONS.md)

---

## 🆘 Need Help?

- **Full guide:** [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **Quick commands:** [QUICK_START.md](QUICK_START.md)
- **Troubleshooting:** See MIGRATION_GUIDE.md § "Troubleshooting"

---

**Next Action:** Run Step 1 (`npm install`)
