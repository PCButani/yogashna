# Exact Code Changes - Firebase Migration

## File: package.json

### REMOVED:
```json
"expo-firebase-recaptcha": "^2.3.1",
"firebase": "^12.7.0",
```

### REMOVED (scripts):
```json
"postinstall": "node scripts/patch-expo-firebase-core.js"
```

### ADDED:
```json
"@react-native-firebase/app": "^21.8.1",
"@react-native-firebase/auth": "^21.8.1",
```

---

## File: app.json

### ADDED to plugins array:
```json
"plugins": [
  "expo-video",
  "@react-native-community/datetimepicker",
  "@react-native-firebase/app"  // ← NEW
]
```

---

## File: src/config/firebase.ts

### BEFORE (entire file):
```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUeVmyZ6UGbdfO3Y4ZBlnrMHd7o6DfRKI",
  authDomain: "yogashna.firebaseapp.com",
  projectId: "yogashna",
  storageBucket: "yogashna.firebasestorage.app",
  messagingSenderId: "192332349396",
  appId: "1:192332349396:web:9c87170d6b0ff22dcce041",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

### AFTER (entire file):
```typescript
// Native Firebase for React Native
// Uses @react-native-firebase/auth for phone authentication
import auth from '@react-native-firebase/auth';

export { auth };
export default auth;
```

---

## File: src/screens/Auth/AuthEntryScreen.tsx

### IMPORTS - BEFORE:
```typescript
import React, { useMemo, useState, useRef } from "react";
import { auth } from "../../config/firebase";
import { signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import app from "../../config/firebase";
```

### IMPORTS - AFTER:
```typescript
import React, { useMemo, useState } from "react";
import auth from "@react-native-firebase/auth";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
```

### TYPE - BEFORE:
```typescript
let globalConfirmationResult: ConfirmationResult | null = null;
```

### TYPE - AFTER:
```typescript
let globalConfirmationResult: FirebaseAuthTypes.ConfirmationResult | null = null;
```

### REMOVED ref:
```typescript
// ❌ REMOVED
const recaptchaVerifier = useRef<any>(null);
```

### SEND OTP - BEFORE:
```typescript
if (!recaptchaVerifier.current) {
  throw new Error("RecaptchaVerifier not initialized");
}

const confirmationResult = await signInWithPhoneNumber(
  auth,
  phoneNumber,
  recaptchaVerifier.current
);
```

### SEND OTP - AFTER:
```typescript
// Native Firebase - no reCAPTCHA needed!
const confirmationResult = await auth().signInWithPhoneNumber(phoneNumber);
```

### JSX - REMOVED:
```typescript
{/* ❌ REMOVED */}
<FirebaseRecaptchaVerifierModal
  ref={recaptchaVerifier}
  firebaseConfig={app.options}
  attemptInvisibleVerification={true}
/>
```

---

## File: src/screens/Auth/OtpVerifyScreen.tsx

### IMPORTS - BEFORE:
```typescript
import { getConfirmationResult } from "./AuthEntryScreen";
```

### IMPORTS - AFTER:
```typescript
import { getConfirmationResult } from "./AuthEntryScreen";
import auth from "@react-native-firebase/auth";
```

### LOGOUT - BEFORE:
```typescript
const { auth } = require("../../config/firebase");
await auth.signOut();
```

### LOGOUT - AFTER:
```typescript
await auth().signOut();
```

---

## NEW Files Created

### 1. google-services.json (root)
- Placeholder Android Firebase config
- **Must replace with real file from Firebase Console**

### 2. GoogleService-Info.plist (root)
- Placeholder iOS Firebase config
- **Must replace with real file from Firebase Console**

### 3. Documentation Files
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Complete guide
- [QUICK_START.md](QUICK_START.md) - Quick commands
- [FIREBASE_CONFIG_INSTRUCTIONS.md](FIREBASE_CONFIG_INSTRUCTIONS.md) - Config setup
- [MIGRATION_COMMANDS.sh](MIGRATION_COMMANDS.sh) - Shell script
- [CODE_CHANGES.md](CODE_CHANGES.md) - This file

---

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Firebase Package** | `firebase` (Web SDK) | `@react-native-firebase/auth` (Native) |
| **RecaptchaVerifier** | Required | ❌ Not needed |
| **Import Style** | `import { auth } from "../../config/firebase"` | `import auth from "@react-native-firebase/auth"` |
| **Phone Auth Call** | `signInWithPhoneNumber(auth, phone, verifier)` | `auth().signInWithPhoneNumber(phone)` |
| **Logout** | `auth.signOut()` | `auth().signOut()` |
| **Config Files** | JS config object only | Native JSON/plist files |
| **Dependencies** | 3 (firebase + recaptcha + web) | 2 (app + auth native) |

---

## Key Benefits

✅ **No more reCAPTCHA** - Native verification
✅ **No web SDK overhead** - Smaller bundle size
✅ **Enterprise-grade** - Production-ready native auth
✅ **Better performance** - Native modules
✅ **Simpler code** - Fewer dependencies
✅ **iOS & Android support** - True cross-platform

---

**Total Files Modified:** 5
**Total Files Created:** 7
**Lines of Code Removed:** ~50
**Lines of Code Added:** ~20
**Net Reduction:** -30 lines (simpler codebase!)
