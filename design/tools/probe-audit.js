(() => {
  const lum = c => {
    const [r,g,b] = c.match(/\d+(\.\d+)?/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});
    return 0.2126*r+0.7152*g+0.0722*b;
  };
  const bgOf = el => {
    let n = el;
    while (n && n !== document.documentElement) {
      const b = getComputedStyle(n).backgroundColor;
      if (b && !/rgba\(0, 0, 0, 0\)|transparent/.test(b)) return b;
      n = n.parentElement;
    }
    return 'rgb(255,255,255)';
  };
  const cr = (a,b) => { const l1=lum(a),l2=lum(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };

  // 1. touch targets
  const small = [];
  for (const el of document.querySelectorAll('a,button,input,select,textarea')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || el.classList.contains('skip')) continue;
    if (r.height < 44 || r.width < 24) small.push({ t: el.tagName.toLowerCase(), c: el.className||'', txt:(el.textContent||'').trim().slice(0,28), w:Math.round(r.width), h:Math.round(r.height) });
  }

  // 2. text contrast
  const bad = [];
  for (const el of document.querySelectorAll('p,span,a,h1,h2,h3,h4,li,figcaption,button,div')) {
    if (!el.childNodes.length) continue;
    const direct = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!direct) continue;
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight) >= 700;
    const large = size >= 24 || (bold && size >= 18.66);
    const ratio = cr(cs.color, bgOf(el));
    const need = large ? 3 : 4.5;
    if (ratio < need) bad.push({ txt: el.textContent.trim().slice(0,34), color: cs.color, bg: bgOf(el), size: Math.round(size), ratio: +ratio.toFixed(2), need });
  }

  // 3. images missing alt
  const imgs = [...document.querySelectorAll('img')].map(i => ({ alt: i.getAttribute('alt'), src: (i.getAttribute('src')||'').slice(0,14) }));

  // 4. heading order
  const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => h.tagName + ': ' + h.textContent.trim().slice(0,40));

  // 5. focus visible check on first nav link
  const a = document.querySelector('.nav__link');
  a && a.focus();
  const fs = a ? getComputedStyle(a, null).outlineColor + ' / ' + getComputedStyle(a).outlineWidth : 'n/a';

  // 6. links with no accessible name
  const nameless = [...document.querySelectorAll('a,button')].filter(e =>
    !(e.textContent||'').trim() && !e.getAttribute('aria-label') && !e.getAttribute('title')).length;

  return { smallTargets: small, contrastFailures: bad, images: imgs, headings: heads, navFocusOutline: fs, namelessControls: nameless };
})()
