(() => {
  const a = document.activeElement;
  const cs = getComputedStyle(a);
  return {
    focused: a.tagName.toLowerCase() + '.' + (a.className || '') + ' "' + (a.textContent||'').trim().slice(0,30) + '"',
    matchesFocusVisible: a.matches(':focus-visible'),
    outlineColor: cs.outlineColor,
    outlineWidth: cs.outlineWidth,
    outlineStyle: cs.outlineStyle,
    outlineOffset: cs.outlineOffset
  };
})()
