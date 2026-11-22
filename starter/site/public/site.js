document.querySelectorAll('nav a').forEach((a) => {
  if (a.href === location.href.replace(/[?#].*$/, '')) a.setAttribute('aria-current', 'page');
});
