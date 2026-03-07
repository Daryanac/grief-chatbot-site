// script.js
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
          const otherCaret = other.querySelector(".acc-caret");
          if (otherCaret) otherCaret.textContent = "+";
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

const waitlistForm = document.getElementById("waitlistForm");
const joinBtn = document.getElementById("joinBtn");
const toast = document.getElementById("toast");
const email = document.getElementById("email");
const consent = document.getElementById("consent");

function showToast(message, type) {
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = "block";
  toast.setAttribute("aria-hidden", "false");
  toast.classList.remove("toast-success", "toast-error");
  toast.classList.add(type === "success" ? "toast-success" : "toast-error");
}

function hideToast() {
  if (!toast) return;
  toast.style.display = "none";
  toast.setAttribute("aria-hidden", "true");
  toast.classList.remove("toast-success", "toast-error");
  toast.textContent = "";
}

if (waitlistForm && joinBtn && toast && email && consent) {
  waitlistForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideToast();

    if (!email.checkValidity() || !consent.checked) {
      showToast("Please enter a valid email and check consent.", "error");
      return;
    }

    waitlistForm.classList.add("glow");
    joinBtn.disabled = true;
    showToast("Thanks! You’re on the waitlist.", "success");

    const entries = JSON.parse(localStorage.getItem("lantern-waitlist") || "[]");
    entries.push({
      email: email.value.trim(),
      joinedAt: new Date().toISOString()
    });
    localStorage.setItem("lantern-waitlist", JSON.stringify(entries));

    waitlistForm.reset();

    setTimeout(() => {
      waitlistForm.classList.remove("glow");
      joinBtn.disabled = false;
    }, 1400);
  });

  email.addEventListener("input", hideToast);
  consent.addEventListener("change", hideToast);
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
applyTheme(savedTheme === "dark" ? "dark" : "light");

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

if (themeToggleMobile) {
  themeToggleMobile.addEventListener("click", toggleTheme);
}