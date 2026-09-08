(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const out = {};
  const btn = document.querySelector('.navtoggle');
  const nav = document.querySelector('#site-nav');
  const vis = el => getComputedStyle(el).display !== 'none';

  out.toggleVisible = vis(btn);
  out.toggleSize = btn.getBoundingClientRect().width + 'x' + btn.getBoundingClientRect().height;
  out.ariaControls = btn.getAttribute('aria-controls');
  out.navIdMatches = nav && nav.id === btn.getAttribute('aria-controls');
  out.closed = { expanded: btn.getAttribute('aria-expanded'), navVisible: vis(nav) };

  btn.click(); await wait(350);
  out.open = { expanded: btn.getAttribute('aria-expanded'), navVisible: vis(nav) };
  const links = [...nav.querySelectorAll('.nav__link')];
  out.linkCount = links.length;
  const r = links.map(l => l.getBoundingClientRect());
  out.allFullWidth = r.every(b => b.width > 300);
  out.minHeight = Math.min(...r.map(b => Math.round(b.height)));
  out.anyClipped = links.some(l => l.scrollWidth > l.clientWidth + 1);
  out.labels = links.map(l => l.textContent);

  // Escape should close it and return focus
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await wait(300);
  out.afterEscape = { expanded: btn.getAttribute('aria-expanded'), navVisible: vis(nav), focusOnToggle: document.activeElement === btn };
  return out;
})()
