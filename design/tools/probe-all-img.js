(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  window.scrollTo(0, document.body.scrollHeight); await wait(2500);
  const all = [...document.querySelectorAll('img')];
  return {
    total: all.length,
    loaded: all.filter(i => i.complete && i.naturalWidth > 0).length,
    broken: all.filter(i => i.complete && i.naturalWidth === 0).map(i => (i.currentSrc||i.src).slice(-64))
  };
})()
