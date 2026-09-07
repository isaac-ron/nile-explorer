// Zero-dependency Chrome DevTools Protocol probe (Node 22: global fetch + WebSocket).
//
//   node cdp.js <file-url> <width> <expression-file>
//
// Launches headless Chrome, waits for the bundle to unpack, evaluates the
// expression in the page and prints the JSON result.

const { spawn } = require('child_process');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;

const [, , url, width = '390', exprFile] = process.argv;
const expression = fs.readFileSync(exprFile, 'utf8');

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + process.env.TEMP + '\\cdp-profile-' + Date.now(),
    '--window-size=' + width + ',900',
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
  const page = targets.find(t => t.type === 'page');
  if (!page) throw new Error('no page target');

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
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: Number(width),
    height: 900,
    deviceScaleFactor: 1,
    mobile: Number(width) < 768
  });
  await send('Page.navigate', { url });
  await sleep(6000); // bundle unpack + font load + React render

  // Real Tab presses: synthetic KeyboardEvents do not move focus, and
  // :focus-visible only matches after genuine keyboard interaction.
  const tabs = Number(process.argv[5] || 0);
  for (let i = 0; i < tabs; i++) {
    for (const type of ['rawKeyDown', 'keyUp']) {
      await send('Input.dispatchKeyEvent', {
        type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9
      });
    }
    await sleep(60);
  }

  const r = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });

  if (r.exceptionDetails) console.log('EXCEPTION:', JSON.stringify(r.exceptionDetails.exception, null, 2));
  else console.log(JSON.stringify(r.result.value, null, 2));

  ws.close();
  chrome.kill();
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
