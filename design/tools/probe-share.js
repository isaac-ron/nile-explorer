[...document.querySelectorAll('.share__btn')].map(a => ({
  label: a.getAttribute('aria-label'),
  href: a.getAttribute('href').slice(0, 78),
  rel: a.rel
}))
