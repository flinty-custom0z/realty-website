/**
 * Script to export code files from a project into a single Markdown file
 * **and** a ZIP archive for AI analysis.
 *
 * Skips build artifacts, images, and sensitive files.
 * 
 * Usage:
 *   1. npm i -D archiver   # first time only
 *   2. node export-code.js
 */

const fs       = require('fs');
const path     = require('path');
const archiver = require('archiver');

/* ────────────────────────────────
 *  Config
 * ──────────────────────────────── */

const CODE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', 
  '.prisma', '.graphql', '.sql', '.html', '.yml', '.yaml'
];

const SKIP_DIRECTORIES = [
  'node_modules', '.next', '.git', 'public/images',
  'build', 'coverage', '.cache', 'exports'
];

const SKIP_FILES = [
  '.env', '.env.local', '.env.development', '.env.production',
  '.DS_Store', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  '.gitignore', '.eslintcache', 'README.md', 'LICENSE'
];

const MAX_FILE_SIZE = 500 * 1024;   // 500 KB

/* ────────────────────────────────
 *  Prepare output paths
 * ──────────────────────────────── */

const exportDir = path.join(process.cwd(), 'exports');
if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

const now         = new Date();
const timestamp   = now.toISOString().replace(/[-:]/g, '').replace(/\..+/, '');       // 20250416T153012
const formattedTs = `${timestamp.slice(0, 8)}-${timestamp.slice(9, 15)}`;            // 20250416-153012

const mdFile  = path.join(exportDir, `project-code-export-${formattedTs}.md`);
const zipFile = path.join(exportDir, `project-code-export-${formattedTs}.zip`);

/* ────────────────────────────────
 *  Init markdown output
 * ──────────────────────────────── */

fs.writeFileSync(
  mdFile,
  `# Project Code Export\n\nGenerated: ${now.toISOString()}\n\n`
);

/* ────────────────────────────────
 *  Init ZIP archive
 * ──────────────────────────────── */

const zipStream = fs.createWriteStream(zipFile);
const archive   = archiver('zip', { zlib: { level: 9 } });

zipStream.on('close', () => {
  console.log(
    `\nZIP completed successfully → ${zipFile} (${archive.pointer()} bytes)`
  );
});
archive.on('warning', err => {
  if (err.code === 'ENOENT') console.warn(err);   // non‑critical
  else throw err;
});
archive.on('error', err => { throw err; });
archive.pipe(zipStream);

/* ────────────────────────────────
 *  Helpers
 * ──────────────────────────────── */

function appendToMarkdown(content) {
  fs.appendFileSync(mdFile, content);
}

function shouldSkipDirectory(relativePath) {
  return SKIP_DIRECTORIES.some(skip => relativePath.startsWith(skip));
}

function shouldSkipFile(file, ext) {
  return SKIP_FILES.includes(file) || !CODE_EXTENSIONS.includes(ext);
}

/* ────────────────────────────────
 *  Recursive walk
 * ──────────────────────────────── */

function walkDirectory(dir, rootDir) {
  for (const file of fs.readdirSync(dir)) {
    const filePath     = path.join(dir, file);
    const relativePath = path.relative(rootDir, filePath);
    const stats        = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      if (shouldSkipDirectory(relativePath)) continue;
      walkDirectory(filePath, rootDir);
      continue;
      }
      
    if (!stats.isFile()) continue;

      const ext = path.extname(file).toLowerCase();
    if (shouldSkipFile(file, ext)) continue;
      
      if (stats.size > MAX_FILE_SIZE) {
      appendToMarkdown(
        `\n\n# File: ${relativePath}\n\n[SKIPPED – FILE TOO LARGE: ${Math.round(
          stats.size / 1024
        )} KB]\n`
      );
      continue;
      }
      
      try {
      /* ─ Markdown ─ */
        const content = fs.readFileSync(filePath, 'utf8');
      const header  =
        `\n\n${'='.repeat(80)}\n` +
        `# File: ${relativePath}\n` +
        `${'='.repeat(80)}\n\n`;
      appendToMarkdown(header + content);

      /* ─ ZIP ─ */
      archive.file(filePath, { name: relativePath });
        
        console.log(`Added: ${relativePath}`);
    } catch (err) {
      console.error(`Error reading ${relativePath}: ${err.message}`);
      appendToMarkdown(
        `\n\n# File: ${relativePath}\n\n[ERROR READING FILE: ${err.message}]\n`
      );
      }
    }
}

/* ────────────────────────────────
 *  Run
 * ──────────────────────────────── */

console.log(`Starting export to:\n  ${mdFile}\n  ${zipFile}\n`);

try {
  walkDirectory(process.cwd(), process.cwd());
  console.log('\nMarkdown export finished. Finalising ZIP…');

  archive.finalize();   // async – “close” event logs success
} catch (err) {
  console.error(`Export failed: ${err.message}`);
  process.exit(1);
}
