/**
 * Reads dist/index.html and inlines all CSS and JS into a single index.html in mdist/.
 * Run after: npm run build
 * Usage: node scripts/build-mdist.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const distDir = path.join(__dirname, '..', 'dist');
const mdistDir = path.join(__dirname, '..', 'mdist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('Run "npm run build" first. dist/index.html not found.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Inline stylesheets: replace <link rel="stylesheet" href="/assets/..."> with <style>...</style>
html = html.replace(
  /<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gi,
  (match, href) => {
    const filePath = path.join(distDir, href.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      console.warn('CSS file not found:', filePath);
      return match;
    }
    const css = fs.readFileSync(filePath, 'utf8');
    return `<style>${css}</style>`;
  }
);

// Inline scripts: replace <script src="/assets/..."> with <script type="module">...</script>
html = html.replace(
  /<script([^>]*)\ssrc="([^"]+)"([^>]*)><\/script>/gi,
  (match, before, src, after) => {
    const filePath = path.join(distDir, src.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      console.warn('JS file not found:', filePath);
      return match;
    }
    const js = fs.readFileSync(filePath, 'utf8');
    const isModule = /type\s*=\s*["']module["']/i.test(before + after);
    return `<script type="${isModule ? 'module' : 'text/javascript'}">${js}</script>`;
  }
);

// Remove favicon link so the single file doesn't depend on external assets (optional)
html = html.replace(/<link\s+rel="icon"[^>]*>\s*/gi, '');

if (!fs.existsSync(mdistDir)) {
  fs.mkdirSync(mdistDir, { recursive: true });
}

fs.writeFileSync(path.join(mdistDir, 'index.html'), html, 'utf8');
console.log('mdist/index.html created (single-file build).');
