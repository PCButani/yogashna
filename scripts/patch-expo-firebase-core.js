const fs = require("fs");
const path = require("path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-firebase-core",
  "android",
  "build.gradle"
);

if (!fs.existsSync(target)) {
  console.log("[patch-expo-firebase-core] build.gradle not found, skipping.");
  process.exit(0);
}

const original = fs.readFileSync(target, "utf8");
const from = "classifier = 'sources'";
const to = "archiveClassifier.set('sources')";

if (!original.includes(from)) {
  console.log("[patch-expo-firebase-core] classifier line not found, skipping.");
  process.exit(0);
}

const updated = original.replace(from, to);

if (updated === original) {
  console.log("[patch-expo-firebase-core] No change needed.");
  process.exit(0);
}

fs.writeFileSync(target, updated);
console.log("[patch-expo-firebase-core] Patched androidSourcesJar classifier.");
