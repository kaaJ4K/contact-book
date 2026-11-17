/**
 * Records a narrated-by-captions product demo using CDP screencast frames.
 * Output: tools/demo-frames/*.jpg + tools/demo-frames/frames.txt
 * Encode with the ffmpeg command printed at the end.
 */
import fs from 'node:fs';
import path from 'node:path';
import { openBrowser } from './browser.mjs';

const OUT = path.resolve('tools/demo-frames');
const SAMPLE = path.resolve('docs/samples/import-demo.xlsx');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const browser = await openBrowser({ port: 9474, width: 1440, height: 900, deviceScaleFactor: 1 });
const frameFiles = [];
const frameTimes = [];
let frameSeq = 0;

const screenshot = async (fileName) => {
  const result = await browser.send('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
  fs.writeFileSync(path.join(OUT, fileName), Buffer.from(result.data, 'base64'));
};

const injectDemoUi = async () => {
  await browser.evaluate(`(() => {
    const style = document.createElement('style');
    style.textContent = \`
      #demo-cursor {
        position: fixed; left: 0; top: 0; z-index: 2147483000; width: 22px; height: 22px;
        margin: -11px 0 0 -11px; border-radius: 50%; border: 2px solid rgba(255,255,255,.92);
        background: rgba(31,51,46,.4); box-shadow: 0 2px 8px rgba(0,0,0,.35);
        pointer-events: none; transition: transform 260ms cubic-bezier(.2,.7,.3,1), opacity .2s ease;
        opacity: 0;
      }
      #demo-cursor.is-visible { opacity: 1; }
      #demo-cursor.is-clicking { animation: demo-click 420ms ease; }
      @keyframes demo-click {
        0% { box-shadow: 0 0 0 0 rgba(207,103,73,.55); }
        100% { box-shadow: 0 0 0 22px rgba(207,103,73,0); }
      }
      #demo-caption {
        position: fixed; left: 50%; bottom: 34px; z-index: 2147482900; transform: translateX(-50%);
        max-width: 720px; padding: 11px 20px 11px 38px; border-radius: 12px;
        background: rgba(23,41,35,.9); color: #f7f0e3; font-family: "Segoe UI","Microsoft YaHei",sans-serif;
        font-size: 14px; letter-spacing: .02em; box-shadow: 0 14px 32px -18px rgba(0,0,0,.6);
        opacity: 0; pointer-events: none; backdrop-filter: blur(8px);
      }
      #demo-caption::before {
        content: ""; position: absolute; left: 17px; top: 50%; width: 7px; height: 7px; margin-top: -3.5px;
        border-radius: 50%; background: #e5a84f; box-shadow: 0 0 0 4px rgba(229,168,79,.13);
      }
      #demo-caption.is-in { animation: caption-in 360ms ease both; }
      @keyframes caption-in { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
      #demo-intro {
        position: fixed; inset: 0; z-index: 2147483100; display: grid; place-items: center;
        background: radial-gradient(circle at 72% 20%, rgba(229,168,79,.16), transparent 30rem), linear-gradient(160deg,#223a32,#14251f);
        color: #f7f0e3; font-family: "Segoe UI","Microsoft YaHei",sans-serif; transition: opacity .5s ease;
      }
      #demo-intro.is-leaving { opacity: 0; }
      .demo-intro__inner { text-align: center; animation: intro-rise .8s cubic-bezier(.2,.7,.3,1) both; }
      @keyframes intro-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      .demo-intro__kicker { font-family: "Cascadia Mono",monospace; font-size: 11px; letter-spacing: .32em; color: #e5a84f; }
      .demo-intro__title { margin: 16px 0 8px; font-family: "Palatino Linotype","Songti SC",serif; font-size: 56px; font-weight: 500; letter-spacing: .06em; }
      .demo-intro__line { width: 92px; height: 2px; margin: 20px auto; background: linear-gradient(90deg,#e5a84f,#cf6749); }
      .demo-intro__sub { color: rgba(247,240,227,.6); font-size: 14px; letter-spacing: .08em; }
      .demo-intro__foot { margin-top: 42px; color: rgba(247,240,227,.3); font-family: "Cascadia Mono",monospace; font-size: 10px; letter-spacing: .16em; }
      #demo-outro {
        position: fixed; inset: 0; z-index: 2147483100; display: grid; place-items: center;
        background: radial-gradient(circle at 24% 80%, rgba(207,103,73,.14), transparent 26rem), linear-gradient(160deg,#223a32,#14251f);
        color: #f7f0e3; font-family: "Segoe UI","Microsoft YaHei",sans-serif; opacity: 0; transition: opacity .55s ease;
      }
      #demo-outro.is-in { opacity: 1; }
      .demo-outro__inner { text-align: center; }
      .demo-outro__title { font-family: "Palatino Linotype","Songti SC",serif; font-size: 46px; font-weight: 500; letter-spacing: .05em; }
      .demo-outro__sub { margin-top: 14px; color: rgba(247,240,227,.55); font-size: 14px; letter-spacing: .1em; }
      .demo-outro__foot { margin-top: 36px; color: rgba(247,240,227,.28); font-family: "Cascadia Mono",monospace; font-size: 10px; letter-spacing: .12em; }
    \`;
    document.head.append(style);
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    document.body.append(cursor);
    const caption = document.createElement('div');
    caption.id = 'demo-caption';
    document.body.append(caption);
    return true;
  })()`);
};

const caption = async (text) => {
  await browser.evaluate(`(() => {
    const el = document.getElementById('demo-caption');
    if (!el) return;
    el.textContent = ${JSON.stringify(text)};
    el.classList.remove('is-in');
    void el.offsetWidth;
    el.classList.add('is-in');
  })()`);
};

const moveCursor = async (selector) => {
  const position = await browser.evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: Math.round(rect.left + rect.width / 2), y: Math.round(rect.top + rect.height / 2) };
  })()`);
  if (!position) return;
  await browser.evaluate(`(() => {
    const cursor = document.getElementById('demo-cursor');
    if (!cursor) return;
    cursor.classList.add('is-visible');
    cursor.style.transform = 'translate(' + ${position.x} + 'px, ' + ${position.y} + 'px)';
    cursor.classList.remove('is-clicking');
    void cursor.offsetWidth;
    cursor.classList.add('is-clicking');
  })()`);
  await browser.sleep(360);
};

const click = async (selector) => {
  await moveCursor(selector);
  await browser.click(selector);
};

const clickByText = async (selector, text) => {
  const found = await browser.evaluate(`(() => {
    const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find((node) => node.textContent.includes(${JSON.stringify(text)}));
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const cursor = document.getElementById('demo-cursor');
    if (cursor) {
      cursor.classList.add('is-visible');
      cursor.style.transform = 'translate(' + (rect.left + rect.width / 2) + 'px, ' + (rect.top + rect.height / 2) + 'px)';
      cursor.classList.remove('is-clicking');
      void cursor.offsetWidth;
      cursor.classList.add('is-clicking');
    }
    el.click();
    return true;
  })()`);
  if (!found) throw new Error(`No element containing ${text} for ${selector}`);
  await browser.sleep(300);
};

const setInput = async (selector, value) => {
  await moveCursor(selector);
  await browser.setInput(selector, value);
};

const selectFile = async (selector) => {
  await browser.evaluate(`(() => {
    const dropzone = document.querySelector('[data-testid="import-dropzone"]');
    if (dropzone) {
      const rect = dropzone.getBoundingClientRect();
      const cursor = document.getElementById('demo-cursor');
      if (cursor) {
        cursor.classList.add('is-visible');
        cursor.style.transform = 'translate(' + (rect.left + rect.width / 2) + 'px, ' + (rect.top + rect.height / 2) + 'px)';
        cursor.classList.remove('is-clicking');
        void cursor.offsetWidth;
        cursor.classList.add('is-clicking');
      }
    }
    return true;
  })()`);
  await browser.sleep(500);
  await browser.setFiles(selector, [SAMPLE]);
};

const showIntro = async () => {
  await browser.evaluate(`(() => {
    const el = document.createElement('div');
    el.id = 'demo-intro';
    el.innerHTML = \`
      <div class="demo-intro__inner">
        <div class="demo-intro__kicker">SOFTWARE ENGINEERING · ASSIGNMENT</div>
        <div class="demo-intro__title">Contact Atlas</div>
        <div class="demo-intro__line"></div>
        <div class="demo-intro__sub">Bookmarks · Multiple contact methods · Excel import/export</div>
        <div class="demo-intro__foot">LIAO WEIBIN · 832402110 · INDIVIDUAL PROJECT</div>
      </div>
    \`;
    document.body.append(el);
  })()`);
  await browser.sleep(2600);
  await browser.evaluate(`document.getElementById('demo-intro').classList.add('is-leaving')`);
  await browser.sleep(650);
  await browser.evaluate(`document.getElementById('demo-intro')?.remove()`);
};

const showOutro = async () => {
  await browser.evaluate(`(() => {
    const el = document.createElement('div');
    el.id = 'demo-outro';
    el.innerHTML = \`
      <div class="demo-outro__inner">
        <div class="demo-outro__title">Keep the people who matter within reach</div>
        <div class="demo-outro__sub">Thanks for watching · Your data stays in your browser</div>
        <div class="demo-outro__foot">CONTACT ATLAS · 2026</div>
      </div>
    \`;
    document.body.append(el);
    requestAnimationFrame(() => el.classList.add('is-in'));
  })()`);
  await browser.sleep(3000);
};

const wasReady = await (async () => {
  await browser.goto('http://127.0.0.1:4173/', { settle: 1800 });
  const ready = await browser.waitForSelector('[data-testid="contact-card"]', { timeout: 12000 });
  if (!ready) throw new Error('App did not render');
  await browser.evaluate(`localStorage.removeItem('contact-atlas.book.v1')`);
  await browser.goto('http://127.0.0.1:4173/', { settle: 1600 });
  await browser.waitForSelector('[data-testid="contact-card"]');
  return true;
})();

try {
  if (!wasReady) throw new Error('Demo could not start');
  await injectDemoUi();
  await browser.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 72,
    maxWidth: 1440,
    maxHeight: 900,
    everyNthFrame: 1,
  });
  browser.on('Page.screencastFrame', (params) => {
    const file = `frame-${String(++frameSeq).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(OUT, file), Buffer.from(params.data, 'base64'));
    frameFiles.push(file);
    frameTimes.push(Number(params.metadata.timestamp) || 0);
    browser.send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => {});
  });

  // 0 · Intro
  await browser.sleep(400);
  await showIntro();

  // 1 · Bookmarks
  await caption('① Bookmark the people you contact most');
  await browser.sleep(700);
  await click('[data-testid="favorites-filter"]');
  await browser.sleep(1700);
  await caption('The Favorites view keeps frequently used contacts one click away');
  await browser.sleep(1500);
  await click('.nav-item');
  await browser.sleep(800);

  // 2 · Multiple contact methods
  await caption('② One person can hold unlimited contact methods');
  await browser.sleep(700);
  await browser.click('[data-testid="contact-card"]');
  await browser.sleep(1800);
  await click('[data-testid="edit-contact"]');
  await browser.sleep(900);
  await click('[data-testid="add-method"]');
  await browser.sleep(600);
  await browser.evaluate(`(() => {
    const inputs = [...document.querySelectorAll('[data-testid="method-value-input"]')];
    const el = inputs[inputs.length - 1];
    if (!el) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, '135 0000 1234');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await browser.sleep(1300);
  await caption('Phone, email, WeChat, QQ, address, or a custom platform — every row is editable');
  await browser.sleep(1700);
  await click('[data-testid="save-contact"]');
  await browser.sleep(1500);
  await browser.evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
  await browser.sleep(700);

  // 3 · Create a contact
  await caption('③ Create a contact with tags, birthday, and notes');
  await browser.sleep(600);
  await click('[data-testid="new-contact"]');
  await browser.sleep(700);
  await setInput('[data-testid="contact-name-input"]', 'Alex Chen');
  await setInput('[data-testid="method-value-input"]', '138 8888 0000');
  await setInput('[data-testid="tags-input"]', 'friend, new');
  await browser.sleep(1300);
  await click('[data-testid="save-contact"]');
  await browser.sleep(1800);
  await browser.evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
  await browser.sleep(700);

  // 4 · Import
  await caption('④ Import from Excel: preview first, then merge or skip duplicates');
  await browser.sleep(700);
  await click('[data-testid="sidebar-import"]');
  await browser.sleep(900);
  await selectFile('[data-testid="import-file-input"]');
  await browser.waitForSelector('[data-testid="confirm-import"]', { timeout: 12000 });
  await browser.sleep(1900);
  await caption('Row-level validation reports line numbers: 4 created, 2 updated, 2 warnings');
  await browser.sleep(1600);
  await browser.click('[data-testid="confirm-import"]');
  await browser.waitForSelector('[data-testid="import-done"]', { timeout: 6000 });
  await browser.sleep(1800);
  await click('.import-done .modal__footer .button--primary');
  await browser.sleep(900);

  // 5 · Export
  await caption('⑤ Export to Excel: one row per contact, one column per field');
  await browser.sleep(600);
  await click('[data-testid="export-button"]');
  await browser.sleep(1700);
  await caption('Optionally export favorites only; the workbook can be imported again');
  await browser.sleep(1600);
  await browser.evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
  await browser.sleep(700);

  // 6 · Search and tags
  await caption('⑥ Search names, companies, tags, or any contact value');
  await browser.sleep(500);
  await setInput('[data-testid="search-input"]', 'lin');
  await browser.sleep(1500);
  await browser.click('.search-box__clear');
  await browser.sleep(700);

  // 7 · Mobile
  await caption('⑦ Responsive layout: view, bookmark, and create contacts on mobile');
  await browser.sleep(500);
  await browser.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await browser.sleep(1600);
  await click('.mobile-menu-button');
  await browser.sleep(1400);
  await browser.evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`);
  await browser.sleep(600);
  await browser.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await browser.sleep(700);

  // 8 · Outro
  await showOutro();
  await browser.sleep(800);

  await browser.send('Page.stopScreencast');
  await browser.sleep(400);

  const start = frameTimes[0] || 0;
  const lines = [];
  for (let i = 0; i < frameFiles.length; i += 1) {
    const current = frameTimes[i] || start;
    const next = frameTimes[i + 1] || current + 0.6;
    const duration = Math.max(0.035, Math.min(5, next - current));
    lines.push(`file '${frameFiles[i]}'`);
    lines.push(`duration ${duration.toFixed(3)}`);
  }
  lines.push(`file '${frameFiles[frameFiles.length - 1]}'`);
  fs.writeFileSync(path.join(OUT, 'frames.txt'), lines.join('\n'), 'utf8');
  fs.writeFileSync(
    path.join(OUT, 'manifest.json'),
    JSON.stringify({ frames: frameFiles.length, startedAt: start, framesList: frameFiles }, null, 2),
  );
  console.log(`Recorded ${frameFiles.length} frames → ${OUT}`);
  console.log('errors:', browser.errors);
} catch (error) {
  console.error('RECORDING FAILED:', error.message);
  console.error('errors:', browser.errors);
  process.exitCode = 1;
} finally {
  await browser.close();
}
