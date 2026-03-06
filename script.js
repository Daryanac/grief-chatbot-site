const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");

if (navToggle && mobileNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNav.setAttribute("aria-hidden", String(!isOpen));
  });

  mobileNav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
    });
  });
}

document.querySelectorAll(".accordion").forEach((acc) => {
  const items = acc.querySelectorAll(".acc-item");

  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      const expanded = btn.getAttribute("aria-expanded") === "true";

      items.forEach((other) => {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          const caret = other.querySelector(".acc-caret");
          if (caret) caret.textContent = "+";
          const otherPanel = other.nextElementSibling;
          if (otherPanel) otherPanel.style.display = "none";
        }
      });

      btn.setAttribute("aria-expanded", String(!expanded));
      const caret = btn.querySelector(".acc-caret");
      if (caret) caret.textContent = expanded ? "+" : "–";
      if (panel) panel.style.display = expanded ? "none" : "block";
    });
  });
});

const openSafety = document.getElementById("openSafety");
if (openSafety) {
  openSafety.addEventListener("click", () => {
    document.getElementById("safety")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

const joinBtn = document.getElementById("joinBtn");
const toast = document.getElementById("toast");
const email = document.getElementById("email");
const consent = document.getElementById("consent");

if (joinBtn && toast && email && consent) {
  joinBtn.addEventListener("click", () => {
    if (!email.checkValidity() || !consent.checked) {
      toast.style.display = "block";
      toast.textContent = "Please enter a valid email and check consent.";
      toast.classList.remove("toast-success");
      toast.classList.add("toast-error");
      return;
    }

    toast.style.display = "block";
    toast.textContent = "Thanks! You’re on the waitlist (prototype).";
    toast.classList.remove("toast-error");
    toast.classList.add("toast-success");
  });
}

const html = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeToggleMobile = document.getElementById("themeToggleMobile");

function applyTheme(theme) {
  html.setAttribute("data-theme", theme);

  const label = theme === "dark" ? "Light mode" : "Dark mode";
  if (themeToggle) themeToggle.textContent = label;
  if (themeToggleMobile) themeToggleMobile.textContent = label;

  localStorage.setItem("lantern-theme", theme);
}

function toggleTheme() {
  const current = html.getAttribute("data-theme") || "light";
  applyTheme(current === "light" ? "dark" : "light");
}

const savedTheme = localStorage.getItem("lantern-theme");
if (savedTheme === "dark" || savedTheme === "light") {
  applyTheme(savedTheme);
}

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

if (themeToggleMobile) {
  themeToggleMobile.addEventListener("click", toggleTheme);
}