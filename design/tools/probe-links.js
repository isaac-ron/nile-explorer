(() => {
  const hrefs = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
  const uniq = [...new Set(hrefs)];
  const local = uniq.filter(h => !/^(https?:|mailto:|#)/.test(h));
  const hashes = uniq.filter(h => h.startsWith('#'));
  const dead = hashes.filter(h => h !== '#' && !document.querySelector(h.replace(/^#/, '#')));
  return {
    errorBanner: !!document.getElementById('__bundler_err'),
    errorText: (document.getElementById('__bundler_err')||{}).textContent || null,
    localTargets: local,
    hashTargets: hashes,
    deadHashes: dead,
    externalCount: uniq.filter(h=>/^https?:/.test(h)).length,
    unsafeExternal: [...document.querySelectorAll('a[target="_blank"]')].filter(a=>!/noopener/.test(a.rel)).length
  };
})()
