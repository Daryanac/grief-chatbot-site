// Mobile nav
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");

navToggle?.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  mobileNav.style.display = expanded ? "none" : "flex";
  mobileNav.setAttribute("aria-hidden", String(expanded));
});

// Close mobile nav after click
mobileNav?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    if (!navToggle) return;
    navToggle.setAttribute("aria-expanded", "false");
    mobileNav.style.display = "none";
    mobileNav.setAttribute("aria-hidden", "true");
  });
});

// Accordion
document.querySelectorAll(".acc-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    const panel = btn.nextElementSibling;
    if (!panel) return;

    // close other panels in same accordion
    const acc = btn.closest(".accordion");
    if (acc) {
      acc.querySelectorAll(".acc-item").forEach((b) => {
        if (b !== btn) b.setAttribute("aria-expanded", "false");
      });
      acc.querySelectorAll(".acc-panel").forEach((p) => {
        if (p !== panel) p.style.display = "none";
      });
    }

    panel.style.display = expanded ? "none" : "block";
    const caret = btn.querySelector(".acc-caret");
    if (caret) caret.textContent = expanded ? "+" : "–";
  });
});

// Safety first button scroll
document.getElementById("openSafety")?.addEventListener("click", () => {
  document.getElementById("safety")?.scrollIntoView({ behavior: "smooth" });
});

// Waitlist (mock submit)
const joinBtn = document.getElementById("joinBtn");
const toast = document.getElementById("toast");
joinBtn?.addEventListener("click", () => {
  const email = document.getElementById("email");
  const consent = document.getElementById("consent");
  if (!email || !consent) return;

  if (!email.value || !consent.checked) {
    showToast("Please enter an email and check consent.", true);
    return;
  }
  showToast("You’re on the waitlist — thank you for helping shape the prototype.", false);
  email.value = "";
  consent.checked = false;
});

function showToast(message, isError){
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = "block";
  toast.style.background = isError ? "rgba(239,68,68,0.10)" : "rgba(34,197,94,0.10)";
  toast.style.borderColor = isError ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.18)";
  toast.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    toast.style.display = "none";
    toast.setAttribute("aria-hidden", "true");
  }, 3800);
}
