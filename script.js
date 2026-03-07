// script.js
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");
const html = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeToggleMobile = document.getElementById("themeToggleMobile");
const openSafety = document.getElementById("openSafety");
const waitlistForm = document.getElementById("waitlistForm");
const joinBtn = document.getElementById("joinBtn");
const toast = document.getElementById("toast");
const email = document.getElementById("email");
const consent = document.getElementById("consent");

if (navToggle && mobileNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNav.setAttribute("aria-hidden", String(!isOpen));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
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

      items.forEach((otherBtn) => {
        const otherPanel = otherBtn.nextElementSibling;
        const otherCaret = otherBtn.querySelector(".acc-caret");

        if (otherBtn !== btn) {
          otherBtn.setAttribute("aria-expanded", "false");
          if (otherCaret) otherCaret.textContent = "+";
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

if (openSafety) {
  openSafety.addEventListener("click", () => {
    document.getElementById("safety")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

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

if (waitlistForm && email && consent && joinBtn) {
  waitlistForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideToast();

    const isValidEmail = email.checkValidity();
    const hasConsent = consent.checked;

    if (!isValidEmail || !hasConsent) {
      showToast("Please enter a valid email and agree to receive updates.", "error");
      if (!isValidEmail) {
        email.focus();
      } else {
        consent.focus();
      }
      return;
    }

    waitlistForm.classList.add("glow");
    joinBtn.classList.add("is-pulsing");
    showToast("Thanks. You’re on the Lantern waitlist.", "success");

    const savedWaitlist = JSON.parse(localStorage.getItem("lantern-waitlist") || "[]");
    savedWaitlist.push({
      email: email.value.trim(),
      joinedAt: new Date().toISOString()
    });
    localStorage.setItem("lantern-waitlist", JSON.stringify(savedWaitlist));

    waitlistForm.reset();

    window.setTimeout(() => {
      waitlistForm.classList.remove("glow");
      joinBtn.classList.remove("is-pulsing");
    }, 1800);
  });

  email.addEventListener("input", hideToast);
  consent.addEventListener("change", hideToast);
}

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
} else {
  applyTheme("light");
}

if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
if (themeToggleMobile) themeToggleMobile.addEventListener("click", toggleTheme);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));