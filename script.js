// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobileNav");

if (navToggle && mobileNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    mobileNav.setAttribute("aria-hidden", String(!isOpen));
  });

  // Close mobile nav after click
  mobileNav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mobileNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      mobileNav.setAttribute("aria-hidden", "true");
    });
  });
}

// Accordion behavior (works for both safety + FAQ accordions)
document.querySelectorAll(".accordion").forEach((acc) => {
  const items = acc.querySelectorAll(".acc-item");
  items.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      const expanded = btn.getAttribute("aria-expanded") === "true";

      // close others within same accordion
      items.forEach((other) => {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          other.querySelector(".acc-caret").textContent = "+";
          const otherPanel = other.nextElementSibling;
          if (otherPanel) otherPanel.style.display = "none";
        }
      });

      btn.setAttribute("aria-expanded", String(!expanded));
      btn.querySelector(".acc-caret").textContent = expanded ? "+" : "–";
      if (panel) panel.style.display = expanded ? "none" : "block";
    });
  });
});

// Safety first button -> scroll to safety section
const openSafety = document.getElementById("openSafety");
if (openSafety) {
  openSafety.addEventListener("click", () => {
    document.getElementById("safety")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// Waitlist toast (prototype only)
const joinBtn = document.getElementById("joinBtn");
const toast = document.getElementById("toast");
const email = document.getElementById("email");
const consent = document.getElementById("consent");

if (joinBtn && toast && email && consent) {
  joinBtn.addEventListener("click", () => {
    if (!email.checkValidity() || !consent.checked) {
      toast.style.display = "block";
      toast.textContent = "Please enter a valid email and check consent.";
      toast.style.background = "rgba(239,68,68,.10)";
      toast.style.borderColor = "rgba(239,68,68,.18)";
      toast.style.color = "rgba(185,28,28,.92)";
      return;
    }

    toast.style.display = "block";
    toast.textContent = "Thanks! You’re on the waitlist (prototype).";
    toast.style.background = "rgba(34,197,94,.10)";
    toast.style.borderColor = "rgba(34,197,94,.18)";
    toast.style.color = "rgba(21,128,61,.92)";
  });
}