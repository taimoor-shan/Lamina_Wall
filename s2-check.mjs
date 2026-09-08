import { spawn } from 'child_process';
import WebSocket from 'ws';

const PORT = 4328, DBG = 9336;
const wait = (ms) => new Promise(r => setTimeout(r, ms));
async function pollJson(url, tries = 40) {
  for (let i = 0; i < tries; i++) { try { const r = await fetch(url); if (r.ok) return await r.json(); } catch {} await wait(250); }
  throw new Error('no debug');
}
async function main() {
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [`--remote-debugging-port=${DBG}`, '--headless=new', '--no-first-run', '--no-default-browser-check', '--user-data-dir=/tmp/s2-chrome', 'about:blank'],
    { stdio: ['ignore', 'ignore', 'pipe'] });
  chrome.stderr.on('data', () => {});
  const pages = await pollJson(`http://127.0.0.1:${DBG}/json/list`);
  const ws = new WebSocket(pages.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });
  let id = 0; const pending = new Map();
  ws.on('message', (d) => { const m = JSON.parse(d.toString()); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const evl = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.result.value;
  await send('Page.enable'); await send('Runtime.enable');

  const widths = [320, 390, 480, 768, 1024, 1440];
  const out = {};
  for (const pathName of ['/', '/products/wood-grain/']) {
    const key = pathName === '/' ? 'landing' : 'family';
    out[key] = [];
    for (const w of widths) {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: `http://localhost:${PORT}${pathName}` });
      for (let i = 0; i < 40; i++) { if (await evl(`document.body && document.body.children.length > 0`)) break; await wait(150); }
      await wait(400);
      const h = await evl(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
      out[key].push({ w, h });
    }
  }
  console.log(JSON.stringify(out, null, 2));
  chrome.kill(); process.exit(0);
}
main().catch(e => { console.error('ERR', e); process.exit(1); });
