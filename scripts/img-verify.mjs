import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const TARGET = path.resolve("assets/img/_optimized");
const IMAGE_ROOT = path.resolve("assets/img");
const PAGES = [
  "index.html", "menu.html", "galeria.html", "cookies.html",
  "polityka-prywatnosci.html", "regulamin.html", "404.html", "offline.html"
];
const FORMATS = new Map([
  [".jpg", "jpeg"], [".jpeg", "jpeg"], [".png", "png"],
  [".webp", "webp"], [".avif", "avif"]
]);

function isInside(root, file) {
  const relative = path.relative(root, file);
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

function display(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function report(errors, references, category, message) {
  for (const ref of references) {
    errors.push(`${ref.page}:${ref.line} ${ref.attribute}="${ref.url}${ref.descriptor ? ` ${ref.descriptor}` : ""}" [${category}] ${message}`);
  }
}

// Follow srcset's URL/descriptor boundaries, so commas inside data URLs do not
// turn their payload into a spurious local candidate. Descriptorless URLs may
// end in a separating comma, while descriptors terminate at the next comma.
function parseSrcset(value) {
  const candidates = [];
  let cursor = 0;
  while (cursor < value.length) {
    while (cursor < value.length && /[\s,]/.test(value[cursor])) cursor += 1;
    if (cursor === value.length) break;
    const start = cursor;
    while (cursor < value.length && !/\s/.test(value[cursor])) cursor += 1;
    let url = value.slice(start, cursor);
    let descriptor = "";
    if (url.endsWith(",")) {
      url = url.replace(/,+$/, "");
    } else {
      const descriptorStart = cursor;
      while (cursor < value.length && value[cursor] !== ",") cursor += 1;
      descriptor = value.slice(descriptorStart, cursor).trim();
      if (cursor < value.length) cursor += 1;
    }
    candidates.push({ url, descriptor, offset: start });
  }
  return candidates;
}

function decodeEntities(value) {
  const named = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">" };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, code) => {
    if (!code.startsWith("#")) return named[code.toLowerCase()];
    const number = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return number > 0 && number <= 0x10ffff ? String.fromCodePoint(number) : entity;
  });
}

async function collectReferences(errors) {
  const files = new Map();
  for (const page of PAGES) {
    let html;
    try {
      html = await fs.readFile(path.join(ROOT, page), "utf8");
    } catch (err) {
      errors.push(`${page}:1 [page] ${err.message}`);
      continue;
    }
    // Mask non-markup without changing offsets or line numbers. Only exact src
    // and srcset attributes are read, not data-src or strings in inline scripts.
    const markup = html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
      (block) => block.replace(/[^\n]/g, " "));
    const tags = /<[a-z][\w:-]*(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
    for (const tag of markup.matchAll(tags)) {
      const attributes = /([^\s"'<>/=]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
      for (const attr of tag[0].matchAll(attributes)) {
        const attribute = attr[1].toLowerCase();
        if (!["src", "srcset"].includes(attribute) || !attr[2]) continue;
        const value = attr[3] ?? attr[4] ?? attr[5] ?? "";
        const valueStart = tag.index + attr.index + attr[0].length - attr[2].length +
          (/^["']/.test(attr[2]) ? 1 : 0);
        const candidates = attribute === "srcset" ? parseSrcset(value) : [{ url: value.trim(), descriptor: "", offset: 0 }];
        for (const candidate of candidates) {
          const url = decodeEntities(candidate.url);
          if (!url || /^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(url)) continue;
          const ref = { page, attribute, url, descriptor: candidate.descriptor,
            line: html.slice(0, valueStart + candidate.offset).split("\n").length };
          let clean;
          try {
            clean = decodeURIComponent(url.split(/[?#]/, 1)[0]);
          } catch {
            report(errors, [ref], "path", "Invalid URL encoding.");
            continue;
          }
          if (!FORMATS.has(path.extname(clean).toLowerCase())) continue;
          // Backslashes and encoded separators must not hide traversal on Windows.
          const file = clean.startsWith("/") ? path.resolve(ROOT, `.${clean}`) :
            path.resolve(path.dirname(path.join(ROOT, page)), clean);
          if (!isInside(ROOT, file)) {
            report(errors, [ref], "path", "Raster path escapes the project root.");
            continue;
          }
          if (!files.has(file)) files.set(file, []);
          files.get(file).push(ref);
        }
      }
    }
  }
  return files;
}

async function decode(file, realRoot) {
  try {
    const realFile = await fs.realpath(file);
    if (!isInside(realRoot, realFile)) throw new Error("Image symlink escapes the project root.");
    const image = sharp(realFile, { failOn: "warning", pages: -1 });
    const metadata = await image.metadata();
    // Raw output forces full pixel decoding; retain only dimensions, not buffers.
    const { info } = await image.raw().toBuffer({ resolveWithObject: true });
    const format = metadata.format === "heif" && metadata.compression === "av1" ? "avif" : metadata.format;
    const expected = FORMATS.get(path.extname(file).toLowerCase());
    if (format !== expected) {
      return { category: "format", error: `${display(file)}: expected ${expected}, actual ${format}${metadata.compression ? ` (${metadata.compression})` : ""}.` };
    }
    return { width: info.width, height: info.pageHeight ?? info.height };
  } catch (err) {
    return { category: "decode/path", error: `${display(file)}: ${err.message}` };
  }
}

async function findOriginal(file, realRoot) {
  const relative = path.relative(TARGET, file);
  const directory = path.join(IMAGE_ROOT, path.dirname(relative));
  if (!isInside(realRoot, await fs.realpath(directory))) {
    throw new Error("Original directory symlink escapes the project root.");
  }
  const basename = path.parse(file).name;
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries.filter((entry) => !entry.isDirectory() && path.parse(entry.name).name === basename &&
    [".jpg", ".jpeg", ".png"].includes(path.extname(entry.name).toLowerCase()))
    .map((entry) => path.join(directory, entry.name));
}

async function walk(dir, count) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, count);
      continue;
    }
    count.value += 1;
  }
}

async function run() {
  try {
    const stat = await fs.stat(TARGET);
    if (!stat.isDirectory()) {
      console.log("assets/img/_optimized exists but is not a directory.");
      process.exitCode = 1;
      return;
    }
  } catch {
    console.log("assets/img/_optimized missing.");
    process.exitCode = 1;
    return;
  }

  const realRoot = await fs.realpath(ROOT);
  if (!isInside(realRoot, await fs.realpath(TARGET))) {
    throw new Error("assets/img/_optimized symlink escapes the project root.");
  }
  const counter = { value: 0 };
  await walk(TARGET, counter);
  console.log(`assets/img/_optimized files: ${counter.value}`);

  const errors = [];
  const files = await collectReferences(errors);
  const decoded = new Map();
  // Sequential decoding bounds memory to one image and caches only small results.
  async function getDecoded(file) {
    if (!decoded.has(file)) decoded.set(file, await decode(file, realRoot));
    return decoded.get(file);
  }
  let validated = 0;
  let comparisons = 0;
  let widths = 0;
  let densities = 0;
  for (const [file, references] of files) {
    const image = await getDecoded(file);
    if (image.error) {
      report(errors, references, image.category, image.error);
      continue;
    }
    validated += 1;
    for (const ref of references) {
      if (!ref.descriptor) continue;
      if (/^\d+w$/.test(ref.descriptor) && Number(ref.descriptor.slice(0, -1)) > 0 &&
        Number.isFinite(Number(ref.descriptor.slice(0, -1)))) {
        widths += 1;
        const expected = Number(ref.descriptor.slice(0, -1));
        if (image.width !== expected) {
          report(errors, [ref], "srcset width", `${display(file)}: expected ${expected}px, actual ${image.width}px.`);
        }
      } else if (/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?x$/i.test(ref.descriptor) &&
        Number(ref.descriptor.slice(0, -1)) > 0 && Number.isFinite(Number(ref.descriptor.slice(0, -1)))) {
        densities += 1;
      } else {
        report(errors, [ref], "srcset descriptor", `Invalid descriptor "${ref.descriptor}" for ${display(file)}.`);
      }
    }
    if (isInside(TARGET, file) && [".avif", ".webp"].includes(path.extname(file).toLowerCase())) {
      try {
        const originals = await findOriginal(file, realRoot);
        if (originals.length !== 1) {
          report(errors, references, "original mapping", `${display(file)}: expected one JPEG/PNG original, found ${originals.length}${originals.length ? ` (${originals.map(display).join(", ")})` : ""}.`);
          continue;
        }
        const original = await getDecoded(originals[0]);
        if (original.error) {
          report(errors, references, `original ${original.category}`, original.error);
          continue;
        }
        comparisons += 1;
        if (image.width !== original.width || image.height !== original.height) {
          report(errors, references, "dimensions", `${display(file)}: expected ${original.width}x${original.height} from ${display(originals[0])}, actual ${image.width}x${image.height}.`);
        }
      } catch (err) {
        report(errors, references, "original mapping", `${display(file)}: ${err.message}`);
      }
    }
  }
  console.log(`Referenced raster images decoded with matching formats: ${validated}/${files.size}`);
  console.log(`Optimized/original dimension comparisons: ${comparisons}`);
  console.log(`srcset descriptors: ${widths} width checks, ${densities} density descriptors (not pixel widths)`);
  if (errors.length) {
    console.error("IMG VERIFY: FAIL");
    errors.forEach((error) => console.error(error));
    console.error(`Total image errors: ${errors.length}`);
    process.exitCode = 1;
  } else {
    console.log("IMG VERIFY: PASS");
  }
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
