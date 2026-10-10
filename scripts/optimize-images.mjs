import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT_DIR = path.resolve("assets/img");
const OUT_DIR = path.resolve("assets/img/_optimized");
const CONCURRENCY = 4;
const WEBP_QUALITY = 80;
const WEBP_EFFORT = 4;
const AVIF_QUALITY = 50;
const AVIF_EFFORT = 4;

const args = process.argv.slice(2);
const wantsWebp = args.includes("--webp");
const wantsAvif = args.includes("--avif");
const makeWebp = wantsWebp || !wantsAvif;
const makeAvif = wantsAvif || !wantsWebp;

const sourceExts = new Set([".jpg", ".jpeg", ".png"]);

function parseSelection() {
  let source;
  let force = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--source") {
      if (source !== undefined) {
        throw new Error("--source may only be supplied once.");
      }
      const value = args[i + 1];
      if (!value || !value.trim() || value.startsWith("-")) {
        throw new Error("--source requires a path, e.g. assets/img/example.jpg.");
      }
      source = value;
      i += 1;
    } else if (arg === "--force") {
      if (force) {
        throw new Error("--force may only be supplied once.");
      }
      force = true;
    } else if (arg !== "--webp" && arg !== "--avif") {
      throw new Error(`Invalid argument: ${arg}. Use --webp, --avif, --source <path> or --force.`);
    }
  }

  if (force && source === undefined) {
    throw new Error("--force requires --source <path>.");
  }
  return { source, force };
}

function validateSourceBoundary(root, sourcePath) {
  const relative = path.relative(root, sourcePath);
  if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error("--source must be inside assets/img/.");
  }
  if (relative.split(path.sep).some((part) => part.toLowerCase() === "_optimized")) {
    throw new Error("--source must not be inside _optimized/.");
  }
}

async function resolveSource(source) {
  const sourcePath = path.resolve(source);
  validateSourceBoundary(ROOT_DIR, sourcePath);
  if (!sourceExts.has(path.extname(sourcePath).toLowerCase())) {
    throw new Error("--source must be a JPEG or PNG file (.jpg, .jpeg, .png).");
  }

  // Check parent directories too, so a symlink cannot hide a source outside the tree.
  let currentPath = process.cwd();
  let sourceStat;
  for (const part of path.relative(currentPath, sourcePath).split(path.sep)) {
    currentPath = path.join(currentPath, part);
    try {
      sourceStat = await fs.lstat(currentPath);
    } catch (err) {
      if (err.code === "ENOENT" || err.code === "ENOTDIR") {
        throw new Error(`--source must be an existing regular file: ${source}`);
      }
      throw err;
    }
    if (sourceStat.isSymbolicLink()) {
      throw new Error("--source must not contain symlinks.");
    }
  }
  if (!sourceStat.isFile()) {
    throw new Error("--source must be a regular file.");
  }

  const realRoot = await fs.realpath(ROOT_DIR);
  const realSource = await fs.realpath(sourcePath);
  validateSourceBoundary(realRoot, realSource);
  return sourcePath;
}

async function walk(dir, results) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_optimized") {
        continue;
      }
      await walk(fullPath, results);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (ext === ".webp" || ext === ".avif") {
      continue;
    }
    if (!sourceExts.has(ext)) {
      continue;
    }
    results.push(fullPath);
  }
}

async function needsWrite(srcStat, destPath) {
  try {
    const destStat = await fs.stat(destPath);
    return destStat.mtimeMs < srcStat.mtimeMs;
  } catch {
    return true;
  }
}

async function run() {
  const { source, force } = parseSelection();
  const sources = [];
  if (source !== undefined) {
    sources.push(await resolveSource(source));
  } else {
    await walk(ROOT_DIR, sources);
  }

  if (!makeWebp && !makeAvif) {
    console.log("No output formats selected.");
    return;
  }

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  const tasks = [];

  for (const srcPath of sources) {
    const srcStat = await fs.stat(srcPath);
    const relPath = path.relative(ROOT_DIR, srcPath);
    const outDir = path.join(OUT_DIR, path.dirname(relPath));
    const baseName = path.parse(relPath).name;

    if (makeWebp) {
      const destWebp = path.join(outDir, `${baseName}.webp`);
      if (force || await needsWrite(srcStat, destWebp)) {
        tasks.push(async () => {
          try {
            await fs.mkdir(outDir, { recursive: true });
            await sharp(srcPath)
              .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
              .toFile(destWebp);
            generated += 1;
          } catch (err) {
            errors += 1;
            console.error(`WebP failed: ${srcPath}`);
            console.error(err);
          }
        });
      } else {
        skipped += 1;
      }
    }

    if (makeAvif) {
      const destAvif = path.join(outDir, `${baseName}.avif`);
      if (force || await needsWrite(srcStat, destAvif)) {
        tasks.push(async () => {
          try {
            await fs.mkdir(outDir, { recursive: true });
            await sharp(srcPath)
              .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
              .toFile(destAvif);
            generated += 1;
          } catch (err) {
            errors += 1;
            console.error(`AVIF failed: ${srcPath}`);
            console.error(err);
          }
        });
      } else {
        skipped += 1;
      }
    }
  }

  let cursor = 0;
  async function worker() {
    while (cursor < tasks.length) {
      const task = tasks[cursor];
      cursor += 1;
      await task();
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, tasks.length || 1) },
    () => worker()
  );
  await Promise.all(workers);

  console.log(`Sources found: ${sources.length}`);
  console.log(`Outputs planned: ${tasks.length}`);
  console.log(`Generated: ${generated}`);
  console.log(`Skipped (up-to-date): ${skipped}`);
  console.log(`Errors: ${errors}`);

  if (errors > 0) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
