// CDP screenshot at a true emulated viewport.
//   node shot.js <file-url> <width> <out.png> [fullPage]

const { spawn } = require('child_process');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9344;
const [, , url, width = '390', out = 'shot.png', full = 'false'] = process.argv;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + process.env.TEMP + '\\shot-profile-' + Date.now(),
    'about:blank'
  ], { stdio: 'ignore' });

  let targets;
  for (let i = 0; i < 40; i++) {
    await sleep(250);
    try {
      targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      if (targets.some(t => t.type === 'page')) break;
    } catch { /* not up */ }
  }
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
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
  await send('Emulation.setDeviceMetricsOverride', {
    width: Number(width), height: 900, deviceScaleFactor: 1, mobile: Number(width) < 768
  });
  await send('Page.navigate', { url });
  await sleep(6500);

  // Optional 5th arg: a selector to scroll to before capturing the viewport.
  const anchor = process.argv[6];
  if (anchor) {
    await send('Runtime.evaluate', {
      expression: `document.querySelector(${JSON.stringify(anchor)}).scrollIntoView({block:'start'})`
    });
    await sleep(700);
  }

  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: full === 'true'
  });
  fs.writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('wrote', out, Math.round(Buffer.from(shot.data, 'base64').length / 1024) + 'kb');

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
