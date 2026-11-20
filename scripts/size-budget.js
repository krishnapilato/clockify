// Fails the build when any shipped file, or any page's first load, grows past its budget.
// Sizes are gzip (what GitHub Pages serves), except fonts and audio, which are already compressed.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const KB = 1024;
const DIST = resolve(import.meta.dirname, "..", "dist");

/** Per-file limits by extension, plus a limit on the sum of all files of that kind. */
const BUDGETS = {
  ".html": { each: 1.75 * KB, total: 7.5 * KB },
  ".js": { each: 3.75 * KB, total: 7.5 * KB },
  ".css": { each: 6.25 * KB, total: 6.25 * KB },
  ".woff2": { each: 47 * KB, total: 47 * KB },
  ".svg": { each: KB, total: KB },
  ".txt": { each: 1.5 * KB, total: 2 * KB },
  ".wav": { each: 105 * KB, total: 105 * KB },
};

/** Everything a page needs before it is usable: HTML, CSS, JS, boot script and the font. */
const PAGE_BUDGET = 60 * KB;

const PRECOMPRESSED = new Set([".woff2", ".wav"]);

/** @type {(dir: string) => string[]} */
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const sizeOf = (path) => {
  const bytes = readFileSync(path);
  return PRECOMPRESSED.has(extname(path)) ? bytes.length : gzipSync(bytes, { level: 9 }).length;
};

const kb = (bytes) => `${(bytes / KB).toFixed(2)} kB`;

const files = walk(DIST);
const failures = [];
const rows = [];

for (const path of files) {
  const ext = extname(path);
  const budget = BUDGETS[ext];
  const name = relative(DIST, path).replaceAll("\\", "/");
  if (budget === undefined) {
    failures.push(`${name}: no budget for "${ext}" files`);
    continue;
  }
  const size = sizeOf(path);
  rows.push({ name, size, limit: budget.each });
  if (size > budget.each) {
    failures.push(`${name}: ${kb(size)} > ${kb(budget.each)}`);
  }
}

for (const [ext, { total }] of Object.entries(BUDGETS)) {
  const sum = files.filter((path) => extname(path) === ext).reduce((all, p) => all + sizeOf(p), 0);
  if (sum > total) {
    failures.push(`all ${ext} files: ${kb(sum)} > ${kb(total)}`);
  }
}

const fonts = files.filter((path) => extname(path) === ".woff2");
for (const page of files.filter((path) => extname(path) === ".html")) {
  const html = readFileSync(page, "utf8");
  const linked = [...html.matchAll(/(?:src|href)="\.?\/?([^"]+\.(?:js|css))"/g)].map((match) =>
    join(DIST, match[1]),
  );
  const total = [page, ...new Set(linked), ...fonts].reduce((all, path) => all + sizeOf(path), 0);
  const name = relative(DIST, page);
  rows.push({ name: `${name} (first load)`, size: total, limit: PAGE_BUDGET });
  if (total > PAGE_BUDGET) {
    failures.push(`${name} first load: ${kb(total)} > ${kb(PAGE_BUDGET)}`);
  }
}

for (const { name, size, limit } of rows) {
  const share = Math.round((size / limit) * 100);
  process.stdout.write(`${name.padEnd(48)} ${kb(size).padStart(10)} / ${kb(limit)}  ${share}%\n`);
}

if (failures.length > 0) {
  process.stderr.write(`\nSize budget exceeded:\n  ${failures.join("\n  ")}\n`);
  process.exit(1);
}
process.stdout.write("\nAll files are within budget.\n");
