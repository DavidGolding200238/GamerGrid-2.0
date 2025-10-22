import { access } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const requiredPaths = [
  ["dist/backend/src/server.js", "Compiled server entry"],
  [".platform/nginx/conf.d/upload.conf", "Nginx upload config"],
  ["package.json", "package manifest"],
  ["package-lock.json", "lockfile"],
  ["Procfile", "Procfile"],
];

let ok = true;

for (const [relativePath, description] of requiredPaths) {
  const fullPath = path.join(rootDir, relativePath);
  try {
    await access(fullPath);
    console.log(`✔ ${description} found at ${relativePath}`);
  } catch {
    ok = false;
    console.error(`✖ Missing ${description}: ${relativePath}`);
  }
}

if (!ok) {
  console.error("Bundle check failed.");
  process.exitCode = 1;
} else {
  console.log("Bundle check passed.");
}
