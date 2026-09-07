(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const out = {};
  const tabs = [...document.querySelectorAll('.tab')];
  out.tabs = tabs.map(t => t.textContent + ':' + t.getAttribute('aria-pressed'));
  out.storiesBefore = document.querySelectorAll('.story').length;
  out.titlesBefore = [...document.querySelectorAll('.story__title')].map(t=>t.textContent.slice(0,26));

  const opinion = tabs.find(t => t.textContent.trim() === 'Opinion');
  opinion.click(); await wait(400);
  out.tabsAfter = [...document.querySelectorAll('.tab')].map(t => t.textContent + ':' + t.getAttribute('aria-pressed'));
  out.titlesAfter = [...document.querySelectorAll('.story__title')].map(t=>t.textContent.slice(0,26));

  const play = document.querySelector('.player__btn');
  out.playBefore = { label: play.getAttribute('aria-label'), pressed: play.getAttribute('aria-pressed'), icon: play.textContent };
  play.click(); await wait(1600);
  const p2 = document.querySelector('.player__btn');
  out.playAfter = { label: p2.getAttribute('aria-label'), pressed: p2.getAttribute('aria-pressed'), icon: p2.textContent };
  out.elapsed = document.querySelector('.player__meta span').textContent;
  out.progressNow = document.querySelector('.player__track').getAttribute('aria-valuenow');
  out.fillWidth = document.querySelector('.player__fill').style.width;

  const tvPlay = document.querySelector('.tv__play');
  out.tvPlayLabel = tvPlay && tvPlay.getAttribute('aria-label');
  tvPlay && tvPlay.click(); await wait(600);
  out.iframeAfterClick = !!document.querySelector('.frame--video iframe');
  out.iframeTitle = document.querySelector('.frame--video iframe')?.getAttribute('title');

  const form = document.querySelector('.signup__form');
  const input = document.querySelector('#signup-email');
  out.inputLabel = document.querySelector('label[for="signup-email"]')?.textContent;
  out.inputRequired = input.required; out.inputAutocomplete = input.autocomplete; out.inputType = input.type;
  input.value = 'reader@example.org';
  form.requestSubmit(); await wait(400);
  out.subLabelAfter = document.querySelector('.signup__form .btn').textContent;
  out.subNoteAfter = document.querySelector('.signup__note').textContent.slice(0,40);
  return out;
})()
