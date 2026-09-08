(() => {
  const bad = [...document.querySelectorAll('a,button')].filter(e =>
    !(e.textContent||'').trim() && !e.getAttribute('aria-label') && !e.getAttribute('title'));
  return bad.map(e => ({
    cls: e.className || '(none)',
    ariaHidden: e.getAttribute('aria-hidden'),
    tabIndex: e.tabIndex,
    inA11yTree: e.getAttribute('aria-hidden') !== 'true'
  }));
})()
