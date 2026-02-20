// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");

if (navToggle && mobileNav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));

    if (expanded) {
      mobileNav.style.display = "none";
      mobileNav.setAttribute("aria-hidden", "true");
    } else {
      mobileNav.style.display = "block";
      mobileNav.setAttribute("aria-hidden", "false");
    }
  });

  // Close mobile nav when clicking a link
  mobileNav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      mobileNav.style.display = "none";
      mobileNav.setAttribute("aria-hidden", "true");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Accordion behavior (works for both safety and FAQ accordions)
document.querySelectorAll(".accordion").forEach((acc) => {
  const items = acc.querySelectorAll(".acc-item");
  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // close others in this accordion
      items.forEach((other) => {
        other.setAttribute("aria-expanded", "false");
        const otherPanel = other.nextElementSibling;
        if (otherPanel && otherPanel.classList.contains("acc-panel")) {
          otherPanel.style.display = "none";
        }
        const caret = other.querySelector(".acc-caret");
        if (caret) caret.textContent = "+";
      });

      // open selected if it was closed
      if (!isOpen && panel && panel.classList.contains("acc-panel")) {
        btn.setAttribute("aria-expanded", "true");
        panel.style.display = "block";
        const caret = btn.querySelector(".acc-caret");
        if (caret) caret.textContent = "–";
      }
    });
  });
});

// Safety first button scroll
const openSafety = document.getElementById("openSafety");
if (openSafety) {
  openSafety.addEventListener("click", () => {
    const target = document.getElementById("safety");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// Waitlist "Join" toast (prototype behavior)
const joinBtn = document.getElementById("joinBtn");
const toast = document.getElementById("toast");

if (joinBtn && toast) {
  joinBtn.addEventListener("click", () => {
    const email = document.getElementById("email");
    const consent = document.getElementById("consent");

    if (!email || !consent) return;

    if (!email.value || !email.checkValidity()) {
      toast.style.display = "block";
      toast.setAttribute("aria-hidden", "false");
      toast.textContent = "Please enter a valid email.";
      return;
    }

    if (!consent.checked) {
      toast.style.display = "block";
      toast.setAttribute("aria-hidden", "false");
      toast.textContent = "Please check the consent box to continue.";
      return;
    }

    toast.style.display = "block";
    toast.setAttribute("aria-hidden", "false");
    toast.textContent = "You’re on the waitlist (prototype). Thanks for helping shape the design!";

    // Optional: clear fields
    email.value = "";
    consent.checked = false;

    // Hide toast after a moment
    window.setTimeout(() => {
      toast.style.display = "none";
      toast.setAttribute("aria-hidden", "true");
      toast.textContent = "";
    }, 3500);
  });
}