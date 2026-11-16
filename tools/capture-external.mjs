/** Capture GitHub evidence and the live GitHub Pages deployment for the blog. */
import path from 'node:path';
import { openBrowser } from './browser.mjs';

const images = path.resolve('docs/images');
const browser = await openBrowser({ port: 9476, width: 1440, height: 1400, deviceScaleFactor: 1.25 });
const errors = [];

async function capture(url, waitExpression, fileName, { settle = 2200, selector = null } = {}) {
  await browser.goto(url, { settle });
  if (selector) await browser.waitForSelector(selector, { timeout: 20000 });
  if (waitExpression) await browser.waitFor(waitExpression, { timeout: 25000 });
  await browser.sleep(1200);
  await browser.screenshot(path.join(images, fileName));
  console.log('captured', fileName);
}

try {
  await capture(
    'https://github.com/kaaJ4K/contact-book/commits/main',
    'document.body.innerText.includes("Commits on") || document.querySelectorAll(\'[data-testid="commit-row-item"]\').length > 2',
    'github-commits.png',
  );
  await capture(
    'https://github.com/kaaJ4K/contact-book/graphs/contributors',
    'document.body.innerText.includes("Contributions")',
    'github-contributors.png',
  );
  await capture(
    'https://github.com/kaaJ4K/contact-book/pull/1',
    'document.body.innerText.includes("Merged")',
    'github-pr.png',
  );
  await capture(
    'https://kaaj4k.github.io/contact-book/',
    null,
    'live-site.png',
    { selector: '[data-testid="contact-card"]', settle: 3000 },
  );
  console.log('errors:', browser.errors);
} catch (error) {
  console.error('CAPTURE FAILED:', error.message);
  console.error('errors:', browser.errors);
  process.exitCode = 1;
} finally {
  await browser.close();
}
