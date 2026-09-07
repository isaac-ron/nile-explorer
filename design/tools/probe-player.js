(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const out = {};
  out.idleHasArtwork = !!document.querySelector('.player__stage img');
  out.idleHasIframe = !!document.querySelector('.player__stage iframe');
  out.modes = [...document.querySelectorAll('.player__mode')].map(b => b.textContent + ':' + b.getAttribute('aria-pressed'));

  document.querySelector('.player__play').click(); await wait(700);
  const vid = document.querySelector('.player__stage iframe');
  out.afterPlay = { src: vid ? vid.src.slice(0, 62) : null, title: vid ? vid.title : null };
  out.modesAfterPlay = [...document.querySelectorAll('.player__mode')].map(b => b.textContent + ':' + b.getAttribute('aria-pressed'));

  [...document.querySelectorAll('.player__mode')].find(b => b.textContent.trim() === 'Listen').click();
  await wait(700);
  const aud = document.querySelector('.player__stage iframe');
  out.afterListen = { src: aud ? aud.src.slice(0, 62) : null, title: aud ? aud.title : null };
  out.modesAfterListen = [...document.querySelectorAll('.player__mode')].map(b => b.textContent + ':' + b.getAttribute('aria-pressed'));
  out.audioStageClass = document.querySelector('.player__stage').className;
  return out;
})()
