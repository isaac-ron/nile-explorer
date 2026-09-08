(() => {
  const bar = document.querySelector('.masthead__inner');
  const logo = document.querySelector('.logo');
  const nav = document.querySelector('#site-nav');
  const btn = document.querySelector('.btn');
  const w = el => el ? Math.round(el.getBoundingClientRect().width) : 0;
  // Measure the nav laid out horizontally regardless of current mode.
  const clone = nav.cloneNode(true);
  Object.assign(clone.style, { position:'absolute', visibility:'hidden', display:'flex',
    flexDirection:'row', width:'auto', gap:'22px' });
  document.body.appendChild(clone);
  const navNatural = Math.round(clone.getBoundingClientRect().width);
  clone.remove();
  return { viewport: document.documentElement.clientWidth, bar: w(bar), logo: w(logo),
    navNatural, subscribe: w(btn), needed: w(logo) + navNatural + w(btn) + 56 };
})()
