(() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0) continue;
    if (r.right > vw + 1 || r.left < -1) {
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className) || '',
        w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right)
      });
    }
  }
  return { viewport: vw, scrollWidth: document.documentElement.scrollWidth, count: out.length, first: out.slice(0, 14) };
})()
