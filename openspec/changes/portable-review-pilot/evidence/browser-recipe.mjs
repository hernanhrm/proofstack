import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const input = resolve(process.argv[2]);
const out = resolve(process.argv[3]);
mkdirSync(out, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'openspec-review-chrome-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ['--headless', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'],
  { stdio: ['ignore', 'ignore', 'pipe'] });
const exited = once(chrome, 'exit');
let stderr = '';
const endpoint = await new Promise((resolveEndpoint, reject) => {
  chrome.stderr.on('data', chunk => {
    stderr += chunk;
    const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (match) resolveEndpoint(match[1]);
  });
  chrome.once('error', reject);
  chrome.once('exit', code => reject(new Error(`Chrome exited ${code}: ${stderr}`)));
});
const url = new URL(endpoint);
const pages = await (await fetch(`http://${url.host}/json/list`)).json();
const ws = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
await once(ws, 'open');
let id = 0;
const pending = new Map();
const errors = [];
const requests = [];
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const pair = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) pair.reject(new Error(JSON.stringify(message.error)));
    else pair.resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params);
  if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
};
function send(method, params = {}) {
  return new Promise((resolveCall, reject) => {
    pending.set(++id, { resolve: resolveCall, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
const checks = [];
try {
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  for (const [label, width, theme] of [['desktop', 720, 'light'], ['mobile-dark', 360, 'dark']]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: theme }] });
    await send('Page.navigate', { url: pathToFileURL(input).href });
    for (let i = 0; i < 100; i++) {
      if (await evaluate('document.readyState === "complete" && !!document.querySelector(".comparison")')) break;
      await new Promise(r => setTimeout(r, 20));
    }
    for (const expanded of [false, true]) {
      const state = expanded ? 'expanded' : 'default';
      if (expanded) {
        const open = await evaluate('Array.from(document.querySelectorAll("summary")).map(s=>{s.click();return s.parentElement.open;})');
        if (!open.every(Boolean) || open.length !== 2) throw new Error('Details controls failed');
      }
      const layout = await evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,criteria:document.querySelectorAll(".results tr").length})');
      if (layout.scrollWidth > width || layout.criteria !== 3) throw new Error(JSON.stringify(layout));
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
        clip: { x: 0, y: 0, width, height: layout.height, scale: 1 } });
      writeFileSync(join(out, `${label}-${state}.png`), Buffer.from(shot.data, 'base64'));
      checks.push({ viewport: width, theme, state, noHorizontalOverflow: true, detailControls: expanded ? 'opened by click' : 'closed', ...layout });
    }
  }
  if (errors.length || requests.some(r => /^https?:/.test(r))) throw new Error(JSON.stringify({ errors, requests }));
  writeFileSync(join(out, 'browser-checks.json'), JSON.stringify({ checks, network: 'offline', externalRequests: 0, scriptErrors: 0 }, null, 2));
  console.log(JSON.stringify(checks, null, 2));
} finally {
  await send('Browser.close').catch(() => {});
  await exited;
  rmSync(profile, { recursive: true, force: true });
}
