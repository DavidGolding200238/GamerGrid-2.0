import archiver from "archiver";
import { createWriteStream, promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

function getTimestamp() {
  const now = new Date();
  const pad = (value) => value.toString().padStart(2, "0");
  const yyyy = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${yyyy}${MM}${dd}-${hh}${mm}${ss}`;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const deployDir = path.join(rootDir, "deploy");

const bundleName = `backend-eb-${getTimestamp()}-local`;
const zipPath = path.join(deployDir, `${bundleName}.zip`);

await fs.mkdir(deployDir, { recursive: true });

console.log(`Creating Elastic Beanstalk bundle: ${zipPath}`);

const archive = archiver("zip", { zlib: { level: 9 } });
const output = createWriteStream(zipPath);

archive.on("warning", (err) => {
  if (err.code === "ENOENT") {
    console.warn(err.message);
  } else {
    throw err;
  }
});

archive.on("error", (err) => {
  throw err;
});

output.on("close", () => {
  console.log(`Bundle created (${archive.pointer()} bytes).`);
});

archive.pipe(output);

const entries = [
  { src: ".platform", dest: ".platform", isDirectory: true },
  { src: "dist", dest: "dist", isDirectory: true },
  { src: "package.json", dest: "package.json", isDirectory: false },
  { src: "package-lock.json", dest: "package-lock.json", isDirectory: false },
  { src: "Procfile", dest: "Procfile", isDirectory: false },
];

for (const entry of entries) {
  const sourcePath = path.join(rootDir, entry.src);
  try {
    const stats = await fs.stat(sourcePath);
    if (entry.isDirectory && !stats.isDirectory()) {
      throw new Error(`${entry.src} was expected to be a directory`);
    }
    if (!entry.isDirectory && !stats.isFile()) {
      throw new Error(`${entry.src} was expected to be a file`);
    }
  } catch (err) {
    console.error(`Missing required bundle entry: ${entry.src}`);
    throw err;
  }

  if (entry.isDirectory) {
    archive.directory(sourcePath, entry.dest);
  } else {
    archive.file(sourcePath, { name: entry.dest });
  }
}

await archive.finalize();
