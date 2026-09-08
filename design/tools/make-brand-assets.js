// Render the brand marks to the fixed-size PNGs Next.js expects.
//   node design/tools/make-brand-assets.js
//
// Writes src/app/icon.png, src/app/apple-icon.png and src/app/opengraph-image.png.
// Re-run whenever public/brand/ changes. Nothing else generates these, so they
// are committed rather than built.

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9351;
const ROOT = path.resolve(__dirname, '..', '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Inlined as data URIs: a page written into about:blank is an opaque origin
// and Chrome refuses to load file: subresources into it.
const asset = f =>
  'data:image/png;base64,' +
  fs.readFileSync(path.join(ROOT, 'public', 'brand', f)).toString('base64');

const page = (w, h, body) => `<!doctype html><meta charset="utf-8"><style>
  html,body{margin:0;padding:0}
  body{width:${w}px;height:${h}px;overflow:hidden}
</style>${body}`;

/* Square icon: white ground so the artwork keeps its own colours, with enough
   inset that the silhouette is not clipped by a rounded tab treatment. */
const icon = (w) => page(w, w, `<div style="
  width:100%;height:100%;background:#fff;
  display:flex;align-items:center;justify-content:center">
  <img src="${asset('logo-mark.png')}" style="width:82%;height:auto">
</div>`);

/* Share card: the real lockup, not a re-drawing of it. */
const og = () => page(1200, 630, `<div style="
  width:1200px;height:630px;background:#fff;position:relative;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px">
  <img src="${asset('logo-mark.png')}" style="height:250px;width:auto">
  <img src="${asset('logo-wordmark.png')}" style="width:620px;height:auto">
  <div style="position:absolute;left:0;right:0;bottom:0;height:88px;background:#06183A;
       display:flex;align-items:center;justify-content:center">
    <span style="font:700 20px/1 'Segoe UI',system-ui,sans-serif;letter-spacing:.34em;
          text-transform:uppercase;color:#fff">The Mirror of Africa</span>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:88px;height:5px;background:#C4881C"></div>
</div>`);

const JOBS = [
  { out: 'src/app/icon.png', w: 512, h: 512, html: icon(512) },
  { out: 'src/app/apple-icon.png', w: 180, h: 180, html: icon(180) },
  { out: 'src/app/opengraph-image.png', w: 1200, h: 630, html: og() }
];

async function main() {
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + process.env.TEMP + '/brand-profile-' + Date.now(),
    'about:blank'
  ], { stdio: 'ignore' });

  let targets;
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    try {
      targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      if (targets.some(t => t.type === 'page')) break;
    } catch { /* not up yet */ }
  }
  const target = targets.find(t => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) =>
    new Promise(res => { pending.set(++id, res); ws.send(JSON.stringify({ id, method, params })); });

  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) pending.get(m.id)(m.result);
  });
  await send('Page.enable');

  for (const job of JOBS) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: job.w, height: job.h, deviceScaleFactor: 1, mobile: false
    });
    // data: URLs cannot read file:, so write the document through the debugger.
    await send('Page.navigate', { url: 'about:blank' });
    await sleep(150);
    await send('Runtime.evaluate', {
      expression: `document.open();document.write(${JSON.stringify(job.html)});document.close();`
    });
    await sleep(900);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(shot.data, 'base64');
    fs.writeFileSync(path.join(ROOT, job.out), buf);
    console.log('wrote', job.out, job.w + 'x' + job.h, Math.round(buf.length / 1024) + 'kb');
  }

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
