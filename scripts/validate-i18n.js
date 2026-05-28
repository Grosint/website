#!/usr/bin/env node
/**
 * i18n Key Validation Script
 *
 * Scans HTML files for data-i18n / data-i18n-html attributes, extracts the HI
 * translation keys from js/i18n.js, and cross-references the two sets.
 *
 * Exit code 0 = clean, 1 = missing translations found.
 */

const fs = require('fs');
const path = require('path');

// ── Config ───────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');

const HTML_FILES = [
  'index.html',
  'about.html',
  'contact.html',
  'products/anveshak.html',
  'products/grosint.html',
  'products/drishti.html',
].map(f => path.join(ROOT, f));

const I18N_FILE = path.join(ROOT, 'js', 'i18n.js');

// JS files that may reference i18n keys programmatically (not via data-i18n
// attributes).  Keys found only in these files are considered valid usage and
// will not be reported as orphaned HI translations.
const JS_FILES = [
  'js/app.js',
  'js/anveshak-pipeline.js',
].map(f => path.join(ROOT, f)).filter(f => fs.existsSync(f));

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract all data-i18n and data-i18n-html attribute values from an HTML file.
 * Returns an array of { key, file } objects.
 */
function extractHTMLKeys(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const basename = path.relative(ROOT, filePath);
  const results = [];
  // Match data-i18n="key" and data-i18n-html="key" (single or double quotes)
  const re = /data-i18n(?:-html)?=["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    results.push({ key: m[1], file: basename });
  }
  return results;
}

/**
 * Parse the HI object from i18n.js and return the set of its keys.
 *
 * Strategy: read the file as text, locate the `const HI = {` block, then use a
 * regex to pull every quoted key from `'key.name': ...` lines.
 */
function extractHIKeys(filePath) {
  const src = fs.readFileSync(filePath, 'utf-8');
  const keys = new Set();

  // Match lines like:  'some.key': '...'  or  "some.key": "..."
  const re = /^\s*['"]([a-zA-Z0-9._-]+)['"]\s*:/gm;
  let m;
  while ((m = re.exec(src)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

/**
 * Scan JS source files for any literal references to known HI keys.
 * Returns the set of keys that appear somewhere in JS source strings.
 */
function extractJSKeyReferences(jsFiles, hiKeys) {
  const referenced = new Set();
  for (const filePath of jsFiles) {
    const src = fs.readFileSync(filePath, 'utf-8');
    for (const key of hiKeys) {
      if (src.includes(key)) {
        referenced.add(key);
      }
    }
  }
  return referenced;
}

// ── Main ─────────────────────────────────────────────────────────────────────

// 1. Collect HTML keys
const htmlEntries = []; // { key, file }[]
for (const file of HTML_FILES) {
  if (!fs.existsSync(file)) {
    console.error(`WARNING: HTML file not found: ${file}`);
    continue;
  }
  htmlEntries.push(...extractHTMLKeys(file));
}

const htmlKeySet = new Set(htmlEntries.map(e => e.key));

// Build a map: key -> list of files it appears in
const keyToFiles = new Map();
for (const { key, file } of htmlEntries) {
  if (!keyToFiles.has(key)) keyToFiles.set(key, new Set());
  keyToFiles.get(key).add(file);
}

// 2. Collect HI keys
if (!fs.existsSync(I18N_FILE)) {
  console.error(`ERROR: i18n file not found: ${I18N_FILE}`);
  process.exit(1);
}
const hiKeys = extractHIKeys(I18N_FILE);

// 3. Collect JS key references (keys used programmatically, not via data-i18n)
const jsReferenced = extractJSKeyReferences(JS_FILES, hiKeys);

// 4. Cross-reference
const missing = []; // keys in HTML but NOT in HI
for (const { key, file } of htmlEntries) {
  if (!hiKeys.has(key)) {
    // Deduplicate (same key may appear multiple times)
    if (!missing.some(m => m.key === key && m.file === file)) {
      missing.push({ key, file });
    }
  }
}

const orphaned = []; // keys in HI but NOT in any HTML file (and not in JS)
for (const key of [...hiKeys].sort()) {
  if (!htmlKeySet.has(key) && !jsReferenced.has(key)) {
    orphaned.push(key);
  }
}

const matched = [...hiKeys].filter(k => htmlKeySet.has(k) || jsReferenced.has(k)).length;

// ── Report ───────────────────────────────────────────────────────────────────

console.log('=== i18n Validation Report ===');
console.log(`HTML files scanned: ${HTML_FILES.length}`);
console.log(`Total data-i18n keys found: ${htmlKeySet.size}`);
console.log(`Total HI translation keys: ${hiKeys.size}`);
console.log('');

if (missing.length > 0) {
  console.log(`\u2717 MISSING TRANSLATIONS (keys in HTML but not in HI):`);
  // Deduplicate across files, group by key
  const deduped = new Map();
  for (const { key, file } of missing) {
    if (!deduped.has(key)) deduped.set(key, new Set());
    deduped.get(key).add(file);
  }
  for (const [key, files] of [...deduped.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  - ${key} (found in ${[...files].join(', ')})`);
  }
  console.log('');
}

if (orphaned.length > 0) {
  console.log(`\u2717 ORPHANED TRANSLATIONS (keys in HI but not in any HTML):`);
  for (const key of orphaned) {
    console.log(`  - ${key}`);
  }
  console.log('');
}

if (missing.length === 0 && orphaned.length === 0) {
  console.log(`\u2713 All keys validated: ${matched} matched`);
} else {
  console.log(`\u2713 Matched keys: ${matched}`);
}

// Exit with code 1 if there are missing translations
process.exit(missing.length > 0 ? 1 : 0);
