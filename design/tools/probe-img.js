(() => [...document.querySelectorAll('img')].map(i => {
  const r = i.getBoundingClientRect();
  const cs = getComputedStyle(i);
  return {
    src: (i.currentSrc || i.src).slice(-60),
    complete: i.complete,
    natural: i.naturalWidth + 'x' + i.naturalHeight,
    box: Math.round(r.width) + 'x' + Math.round(r.height),
    display: cs.display, position: cs.position, opacity: cs.opacity,
    loading: i.getAttribute('loading')
  };
}))()
