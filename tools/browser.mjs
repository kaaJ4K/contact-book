/**
 * Tiny CDP browser helper (no Puppeteer / Playwright).
 * Edge is launched headless with stdio ignored, which keeps it compatible with
 * the DSH Windows sandbox (no named-pipe stdio).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const EDGE_PATHS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findEdge() {
  const found = EDGE_PATHS.find((candidate) => fs.existsSync(candidate));
  if (!found) throw new Error('Microsoft Edge was not found');
  return found;
}

export async function openBrowser({ port = 9460, width = 1440, height = 1000, deviceScaleFactor = 1 } = {}) {
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'contact-atlas-edge-'));
  const edge = spawn(
    findEdge(),
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-component-update',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--no-default-browser-check',
      '--hide-scrollbars',
      '--disable-features=TranslateUI,msEdgeIdentity,msSmartScreen',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      `--window-size=${width},${height}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let ready = false;
  for (let i = 0; i < 240; i += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      // Edge is still starting.
    }
    await sleep(250);
  }
  if (!ready) throw new Error('Edge DevTools endpoint did not start');

  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then(
    (response) => response.json(),
  );
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  const listeners = new Map();
  let seq = 0;

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
      else entry.resolve(message.result);
      return;
    }
    (listeners.get(message.method) || []).forEach((handler) => handler(message.params));
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    }
    return result.result?.value;
  };

  const on = (method, handler) => {
    const list = listeners.get(method) || [];
    list.push(handler);
    listeners.set(method, list);
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor,
    mobile: false,
  });

  const errors = [];
  on('Runtime.exceptionThrown', (params) => {
    errors.push(
      params.exceptionDetails?.exception?.description ||
        params.exceptionDetails?.text ||
        'Unknown runtime exception',
    );
  });
  on('Log.entryAdded', (params) => {
    if (params.entry.level === 'error') errors.push(params.entry.text);
  });
  on('Runtime.consoleAPICalled', (params) => {
    if (params.type === 'error') {
      errors.push(params.args.map((arg) => arg.value ?? arg.description ?? '').join(' '));
    }
  });

  const goto = async (url, { settle = 500 } = {}) => {
    await send('Page.navigate', { url });
    await sleep(settle);
  };

  const waitFor = async (expression, { timeout = 10000, interval = 100 } = {}) => {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      try {
        if (await evaluate(expression)) return true;
      } catch {
        // Page may still be navigating.
      }
      await sleep(interval);
    }
    return false;
  };

  const waitForSelector = (selector, options = {}) =>
    waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`, options);

  const screenshot = async (filePath, { format = 'png', quality } = {}) => {
    const { data } = await send('Page.captureScreenshot', {
      format,
      ...(quality ? { quality } : {}),
      captureBeyondViewport: false,
    });
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    return filePath;
  };

  const click = async (selector) => {
    const clicked = await evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      el.click();
      return true;
    })()`);
    if (!clicked) throw new Error(`Element not found: ${selector}`);
    await sleep(250);
  };

  const setInput = async (selector, value) => {
    const ok = await evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(el, ${JSON.stringify(value)});
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    if (!ok) throw new Error(`Input not found: ${selector}`);
    await sleep(120);
  };

  const setFiles = async (selector, files) => {
    const doc = await send('DOM.getDocument', { depth: -1 });
    const { nodeIds } = await send('DOM.querySelectorAll', {
      nodeId: doc.root.nodeId,
      selector,
    });
    if (!nodeIds.length) throw new Error(`File input not found: ${selector}`);
    await send('DOM.setFileInputFiles', { nodeId: nodeIds[0], files });
    await sleep(500);
  };

  const close = async () => {
    try {
      ws.close();
    } catch {
      // Ignore.
    }
    edge.kill();
    await sleep(250);
    try {
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch {
      // Temp profile cleanup is best effort.
    }
  };

  return {
    send,
    evaluate,
    goto,
    waitFor,
    waitForSelector,
    screenshot,
    click,
    setInput,
    setFiles,
    close,
    errors,
    on,
    sleep,
  };
}

export function startStaticServer({ port = 4173, root = 'dist' } = {}) {
  const server = spawn(process.execPath, ['tools/serve.mjs', root, String(port)], {
    stdio: 'ignore',
    detached: false,
  });
  return {
    process: server,
    stop: () => server.kill(),
  };
}
