// Smooth UX for landing page interactions (GitHub Pages friendly)

const modal = document.getElementById("waitlistModal");
const waitlistForm = document.getElementById("waitlistForm");
const waitlistSuccess = document.getElementById("waitlistSuccess");
const yearEl = document.getElementById("year");

yearEl.textContent = new Date().getFullYear();

// Open modal buttons
["openWaitlistBtn", "openWaitlistBtn2", "openWaitlistBtn3"].forEach((id) => {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener("click", () => openModal());
});

document.getElementById("learnMoreBtn")?.addEventListener("click", () => {
  document.querySelector("#features")?.scrollIntoView({ behavior: "smooth" });
});

function openModal() {
  modal.setAttribute("aria-hidden", "false");
  waitlistSuccess.hidden = true;
  waitlistForm.hidden = false;
  document.getElementById("email")?.focus();
}

function closeModal() {
  modal.setAttribute("aria-hidden", "true");
}

// Close modal on backdrop / close buttons
modal.addEventListener("click", (e) => {
  const target = e.target;
  if (target?.dataset?.close === "true") closeModal();
});

// Fake submit (no backend)
waitlistForm.addEventListener("submit", (e) => {
  e.preventDefault();
  waitlistForm.hidden = true;
  waitlistSuccess.hidden = false;
});

// FAQ accordions
document.querySelectorAll(".faq__q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    const answer = btn.nextElementSibling;

    // close others (optional: keeps it clean)
    document.querySelectorAll(".faq__q").forEach((b) => {
      if (b !== btn) b.setAttribute("aria-expanded", "false");
    });
    document.querySelectorAll(".faq__a").forEach((a) => {
      if (a !== answer) a.hidden = true;
    });

    btn.setAttribute("aria-expanded", String(!expanded));
    if (answer) answer.hidden = expanded;
  });
});
