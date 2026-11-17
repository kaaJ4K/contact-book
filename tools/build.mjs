/**
 * Small build script: bundles the React app and styles with esbuild, then
 * assembles a static site in dist/. No dev server, no framework build magic.
 *
 * Why esbuild directly? It keeps the build reproducible in ~0.2 s and allows
 * the project to be deployed to any static host, including GitHub Pages.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { renderBlogPage } from './blog-template.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const isWindows = process.platform === 'win32';
const platformPackage = `@esbuild/${process.platform}-${process.arch}`;
const bundledBin = path.join(
  ROOT,
  'node_modules',
  ...platformPackage.split('/'),
  isWindows ? 'esbuild.exe' : path.join('bin', 'esbuild'),
);
const fallbackBin = path.join(
  ROOT,
  'node_modules',
  'esbuild',
  'bin',
  isWindows ? 'esbuild.exe' : 'esbuild',
);

function resolveEsbuild() {
  if (fs.existsSync(bundledBin)) return bundledBin;
  if (fs.existsSync(fallbackBin)) return fallbackBin;
  console.error('esbuild was not found. Run `npm install` first.');
  process.exit(1);
}

function runEsbuild(args) {
  const result = spawnSync(resolveEsbuild(), args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });

runEsbuild([
  'src/main.jsx',
  '--bundle',
  '--outfile=dist/assets/app.js',
  '--minify',
  '--target=es2020',
  '--loader:.js=jsx',
  '--jsx=automatic',
  '--define:process.env.NODE_ENV="production"',
  '--log-level=warning',
]);

runEsbuild([
  'src/styles.css',
  '--bundle',
  '--outfile=dist/styles.css',
  '--minify',
  '--target=es2020',
  '--log-level=warning',
]);

const indexSource = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const productionIndex = indexSource
  .replace(
    /\s*<link rel="stylesheet"[^>]*>/g,
    '',
  )
  .replace(
    '<link rel="icon" type="image/svg+xml" href="./favicon.svg" />',
    '<link rel="icon" type="image/svg+xml" href="./favicon.svg" />\n    <link rel="stylesheet" href="./styles.css" />',
  )
  .replace(
    /<script type="module" src="\/src\/main\.jsx"><\/script>/,
    '<script type="module" src="./assets/app.js"></script>',
  );

fs.writeFileSync(path.join(DIST, 'index.html'), productionIndex, 'utf8');
fs.copyFileSync(path.join(ROOT, 'public', 'favicon.svg'), path.join(DIST, 'favicon.svg'));
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

// ---------------------------------------------------------------------------
// Blog: render the assignment Markdown to a styled static page under /blog/.
// ---------------------------------------------------------------------------
function slugifyHeading(text) {
  return String(text)
    .replace(/<[^>]*>/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

function addHeadingIds(html) {
  return html.replace(/<h([1-4])>(.*?)<\/h\1>/gs, (match, level, inner) => {
    const id = slugifyHeading(inner);
    return id ? `<h${level} id="${id}">${inner}</h${level}>` : match;
  });
}

function copyIfExists(source, targetDirectory) {
  if (!fs.existsSync(source)) return false;
  fs.mkdirSync(targetDirectory, { recursive: true });
  fs.cpSync(source, path.join(targetDirectory, path.basename(source)), { recursive: true });
  return true;
}

function buildBlog() {
  const markdownPath = path.join(ROOT, 'docs', 'blog.md');
  if (!fs.existsSync(markdownPath)) return false;
  const markdown = fs.readFileSync(markdownPath, 'utf8');
  const body = addHeadingIds(marked.parse(markdown, { gfm: true, breaks: false }));
  const blogDir = path.join(DIST, 'blog');
  fs.mkdirSync(blogDir, { recursive: true });
  fs.writeFileSync(
    path.join(blogDir, 'index.html'),
    renderBlogPage({
      title: 'Contact Atlas · Assignment Blog',
      body,
      markdownHref: './blog.md',
      appHref: '../',
      repoHref: 'https://github.com/kaaJ4K/contact-book',
    }),
    'utf8',
  );
  fs.copyFileSync(markdownPath, path.join(blogDir, 'blog.md'));
  const images = path.join(ROOT, 'docs', 'images');
  if (fs.existsSync(images)) fs.cpSync(images, path.join(blogDir, 'images'), { recursive: true });
  const samples = path.join(ROOT, 'docs', 'samples');
  if (fs.existsSync(samples)) fs.cpSync(samples, path.join(blogDir, 'samples'), { recursive: true });
  copyIfExists(path.join(ROOT, 'docs', 'demo.mp4'), blogDir);
  return true;
}

const blogBuilt = buildBlog();

const bundleBytes = fs.statSync(path.join(DIST, 'assets', 'app.js')).size;
const cssBytes = fs.statSync(path.join(DIST, 'styles.css')).size;
console.log(
  `Built dist/ → app.js ${(bundleBytes / 1024).toFixed(0)} KB, styles.css ${(cssBytes / 1024).toFixed(0)} KB${
    blogBuilt ? ' · blog page included' : ''
  }`,
);
