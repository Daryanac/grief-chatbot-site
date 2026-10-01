const root = document.documentElement;
const themeButtons = document.querySelectorAll('[data-theme-toggle]');
const menuButton = document.getElementById('menuButton');
const mobileNav = document.getElementById('mobileNav');

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('lantern-theme', theme);
  themeButtons.forEach((button) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', `Switch to ${next} mode`);
    button.textContent = theme === 'dark' ? '☀' : '☾';
  });
}

const savedTheme = localStorage.getItem('lantern-theme');
const preferredDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (preferredDark ? 'dark' : 'light'));

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
});

menuButton?.addEventListener('click', () => {
  const open = mobileNav?.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(Boolean(open)));
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.faq-question').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const open = item.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
    const symbol = button.querySelector('.faq-symbol');
    if (symbol) symbol.textContent = open ? '−' : '+';
  });
});
