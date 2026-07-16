import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, ".env.local");
const dataDir = path.join(projectRoot, "data");

const requiredKeys = [
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
  "ADMIN_SECRET",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_SITE_URL",
];

const recommendedKeys = [
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
];

function parseEnv(contents) {
  const map = new Map();

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    map.set(key, value);
  }

  return map;
}

function fail(message) {
  console.error(`ERROR: ${message}`);
}

function warn(message) {
  console.warn(`WARN: ${message}`);
}

function ok(message) {
  console.log(`OK: ${message}`);
}

let hasError = false;

if (!fs.existsSync(envPath)) {
  fail(".env.local not found in project root.");
  hasError = true;
} else {
  ok(".env.local exists");

  const envMap = parseEnv(fs.readFileSync(envPath, "utf8"));

  for (const key of requiredKeys) {
    const value = envMap.get(key);
    if (!value) {
      fail(`${key} is missing or empty in .env.local`);
      hasError = true;
      continue;
    }

    if (key === "ADMIN_SECRET" && value === "replace-with-a-long-random-secret") {
      fail("ADMIN_SECRET is still using the default placeholder value.");
      hasError = true;
      continue;
    }

    ok(`${key} is set`);
  }

  for (const key of recommendedKeys) {
    const value = envMap.get(key);
    if (!value) {
      warn(`${key} is empty (this may be expected until webhook/public key setup is complete).`);
    } else {
      ok(`${key} is set`);
    }
  }

  const siteUrl = envMap.get("NEXT_PUBLIC_SITE_URL") ?? "";
  if (siteUrl && !/^https?:\/\//.test(siteUrl)) {
    fail("NEXT_PUBLIC_SITE_URL must start with http:// or https://");
    hasError = true;
  }
}

if (!fs.existsSync(dataDir)) {
  fail("data directory is missing.");
  hasError = true;
} else {
  ok("data directory exists");
}

if (hasError) {
  console.error("\nLocal config verification failed.");
  process.exit(1);
}

console.log("\nLocal config verification passed.");
