/**
 * End-to-end browser QA + assignment screenshots.
 * Run with: node tools/capture.mjs
 * Requires the static server at http://127.0.0.1:4173/ (npm run preview).
 */
import fs from 'node:fs';
import path from 'node:path';
import { openBrowser } from './browser.mjs';
import XLSX from 'xlsx-js-style';

const IMAGES = path.resolve('docs/images');
const DOWNLOADS = path.resolve('tools/downloads');
const SAMPLE = path.resolve('docs/samples/import-demo.xlsx');
fs.mkdirSync(IMAGES, { recursive: true });
fs.rmSync(DOWNLOADS, { recursive: true, force: true });
fs.mkdirSync(DOWNLOADS, { recursive: true });

const browser = await openBrowser({ port: 9470, width: 1440, height: 1000, deviceScaleFactor: 1.5 });
const results = {};
let failed = false;

const shot = async (name) => {
  await browser.screenshot(path.join(IMAGES, name));
  console.log('shot:', name);
};

const clearToasts = async () => {
  await browser.evaluate(`(() => {
    const buttons = [...document.querySelectorAll('.toast__close')];
    buttons.forEach((button) => button.click());
    return buttons.length;
  })()`);
  await browser.sleep(400);
};

const setViewport = async (width, height, mobile = false) => {
  await browser.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1.5,
    mobile,
  });
  await browser.sleep(350);
};

const cardCount = () =>
  browser.evaluate('document.querySelectorAll(\'[data-testid="contact-card"]\').length');

const pressEscape = () =>
  browser.evaluate(
    `window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`,
  );

try {
  await browser.goto('http://127.0.0.1:4173/', { settle: 1800 });
  await browser.waitForSelector('[data-testid="contact-card"]');
  results.initialCards = await cardCount();
  await clearToasts();
  await shot('01-home.png');

  // Bookmarks filter
  await browser.click('[data-testid="favorites-filter"]');
  await browser.waitFor('document.querySelector(\'[data-testid="page-title"]\').textContent.includes("收藏")');
  results.favoriteCards = await cardCount();
  if (results.favoriteCards !== 4) throw new Error('Favorites filter did not show 4 contacts');
  await shot('02-favorites.png');
  await browser.click('.nav-item');
  await browser.waitFor('document.querySelector(\'[data-testid="page-title"]\').textContent.includes("全部")');
  await browser.waitForSelector('[data-testid="contact-card"]');

  // Contact detail drawer (林晚 has phones, email, WeChat, address and a social handle)
  await browser.click('[data-testid="contact-card"]');
  await browser.waitForSelector('[data-testid="contact-detail"]');
  results.detailName = await browser.evaluate(
    'document.querySelector(\'[data-testid="contact-detail"] h2\').textContent',
  );
  await clearToasts();
  await shot('03-contact-detail.png');
  await pressEscape();
  await browser.waitFor('!document.querySelector("[data-testid=contact-detail]")');

  // Editor with a contact that demonstrates multiple methods
  await setViewport(1440, 1250);
  await browser.evaluate('document.querySelectorAll(\'[data-testid="contact-card"]\')[4].click()');
  await browser.waitForSelector('[data-testid="contact-detail"]');
  await browser.click('[data-testid="edit-contact"]');
  await browser.waitForSelector('[data-testid="contact-name-input"]');
  await browser.click('[data-testid="add-method"]');
  results.editorMethodRows = await browser.evaluate(
    'document.querySelectorAll(\'[data-testid="method-value-input"]\').length',
  );
  await clearToasts();
  await shot('04-editor.png');
  // Make sure the extra empty row doesn't block Cancel.
  await pressEscape();
  await browser.waitFor('!document.querySelector(".editor-modal")');
  await setViewport(1440, 1000);

  // Create, verify and delete a contact (CRUD)
  await browser.click('[data-testid="new-contact"]');
  await browser.waitForSelector('[data-testid="contact-name-input"]');
  await browser.setInput('[data-testid="contact-name-input"]', '测试联系人');
  await browser.setInput('[data-testid="method-value-input"]', '138 0000 0000');
  await browser.setInput('[data-testid="tags-input"]', '测试、自动化');
  await browser.click('[data-testid="save-contact"]');
  await browser.waitFor('document.body.innerText.includes("测试联系人")');
  results.afterCreateCards = await cardCount();
  if (results.afterCreateCards !== 13) throw new Error('Creating a contact failed');
  await browser.click('[data-testid="delete-contact"]');
  await browser.waitForSelector('[data-testid="confirm-dialog-ok"]');
  await browser.click('[data-testid="confirm-dialog-ok"]');
  await browser.waitFor('!document.querySelector("[data-testid=contact-detail]")');
  results.afterDeleteCards = await cardCount();
  if (results.afterDeleteCards !== 12) throw new Error('Deleting a contact failed');
  await clearToasts();

  // Excel import flow
  await browser.click('[data-testid="sidebar-import"]');
  await browser.waitForSelector('[data-testid="import-dropzone"]');
  await browser.setFiles('[data-testid="import-file-input"]', [SAMPLE]);
  await browser.waitForSelector('[data-testid="confirm-import"]', { timeout: 15000 });
  results.importPreview = await browser.evaluate(
    'document.querySelector(".import-modal").innerText.slice(0, 300)',
  );
  await clearToasts();
  await shot('05-import-preview.png');
  await browser.click('[data-testid="confirm-import"]');
  await browser.waitForSelector('[data-testid="import-done"]');
  results.importSummary = await browser.evaluate(
    'document.querySelector(\'[data-testid="import-done"]\').innerText.slice(0, 300)',
  );
  await clearToasts();
  await shot('06-import-result.png');
  await browser.evaluate(`(() => {
    const buttons = [...document.querySelectorAll('.modal__footer .button')];
    const button = buttons.find((item) => item.textContent.includes('完成'));
    if (button) button.click();
    return Boolean(button);
  })()`);
  await browser.waitFor('!document.querySelector(".import-modal")');
  results.afterImportCards = await cardCount();
  if (results.afterImportCards !== 16) throw new Error('Excel import did not produce 16 contacts');

  // Export as a real xlsx and verify its contents
  try {
    await browser.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOADS });
  } catch {
    await browser.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DOWNLOADS });
  }
  await clearToasts();
  await browser.click('[data-testid="export-button"]');
  await browser.waitForSelector('[data-testid="confirm-export"]');
  await shot('07-export.png');
  await browser.click('[data-testid="confirm-export"]');
  let exportFile = null;
  for (let i = 0; i < 60; i += 1) {
    await browser.sleep(250);
    exportFile = fs
      .readdirSync(DOWNLOADS)
      .find((name) => name.endsWith('.xlsx') && !name.startsWith('~$'));
    if (exportFile) break;
  }
  if (!exportFile) throw new Error('Excel download did not start');
  const exportPath = path.join(DOWNLOADS, exportFile);
  const workbook = XLSX.read(fs.readFileSync(exportPath), { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  results.exportFile = exportFile;
  results.exportRows = rows.length - 1;
  results.exportHeaders = rows[0];
  results.exportSample = rows[1];
  fs.copyFileSync(exportPath, path.resolve('docs/samples/export-demo.xlsx'));

  // Search filtering
  await clearToasts();
  await browser.setInput('[data-testid="search-input"]', '设计');
  await browser.sleep(350);
  results.searchCards = await cardCount();
  await shot('08-search.png');
  await browser.setInput('[data-testid="search-input"]', '');
  await browser.sleep(300);

  // Mobile layout + sidebar on a clean seeded book
  await browser.evaluate(`(() => {
    localStorage.removeItem('contact-atlas.book.v1');
    location.reload();
    return true;
  })()`);
  await browser.sleep(1600);
  await browser.waitForSelector('[data-testid="contact-card"]');
  await setViewport(390, 844, true);
  results.mobileCards = await cardCount();
  await clearToasts();
  await browser.evaluate('window.scrollTo(0, 0)');
  await shot('09-mobile.png');
  await browser.click('.mobile-menu-button');
  await browser.waitForSelector('.sidebar.is-open');
  await shot('10-mobile-menu.png');
  await pressEscape();
  await browser.waitFor('!document.querySelector(".sidebar.is-open")');

  results.errors = browser.errors;
  console.log('\nQA RESULT\n' + JSON.stringify(results, null, 2));
  if (browser.errors.length) {
    failed = true;
    console.error('\nConsole/runtime errors detected.');
  }
} catch (error) {
  failed = true;
  results.failure = error.message;
  console.error('\nQA FAILED:', error.message);
  console.error('Browser errors:', browser.errors);
  try {
    await browser.screenshot(path.resolve('tools/qa-failure.png'));
  } catch {
    // Ignore screenshot failure.
  }
} finally {
  await browser.close();
}

if (failed) process.exit(1);
