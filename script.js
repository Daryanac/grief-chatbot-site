(function () {
  const chatWindow = document.getElementById("chatWindow");
  const recordBtn = document.getElementById("recordBtn");
  const playBtn = document.getElementById("playBtn");
  const statusText = document.getElementById("statusText");
  const chips = document.querySelectorAll(".chip");

  if (!chatWindow) return; // only run on demo page

  const scenarios = {
    advice: {
      user: "I really miss their advice right now.",
      bot: "Would you like to open Advice Memory Mode and hear an approved guidance clip for decision-making?"
    },
    sleep: {
      user: "I cannot sleep and my mind is racing.",
      bot: "Let us do a short breathing routine and a gentle wind-down plan for tonight."
    },
    anniversary: {
      user: "Their anniversary is coming up and I am anxious.",
      bot: "That makes sense. We can create a small plan for the day and identify one person you can reach out to."
    }
  };

  function addBubble(text, type) {
    const div = document.createElement("div");
    div.className = `bubble ${type}`;
    div.textContent = text;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const key = chip.dataset.scenario;
      const scenario = scenarios[key];
      if (!scenario) return;
      addBubble(`User: ${scenario.user}`, "user");
      addBubble(`EchoCare: ${scenario.bot}`, "bot");
      statusText.textContent = "Status: Scenario loaded";
    });
  });

  let recording = false;
  recordBtn.addEventListener("click", () => {
    recording = !recording;
    if (recording) {
      recordBtn.textContent = "Stop Microphone";
      statusText.textContent = "Status: Listening (simulated)…";
      addBubble("User: [Voice input simulated] I feel a wave of grief right now.", "user");
    } else {
      recordBtn.textContent = "Start Microphone";
      statusText.textContent = "Status: Ready";
    }
  });

  playBtn.addEventListener("click", () => {
    statusText.textContent = "Status: Playing response (simulated)…";
    addBubble(
      "EchoCare: I hear you. Let us pause for one slow breath. Would you like grounding, memory support, or reaching out to someone you trust?",
      "bot"
    );
    setTimeout(() => {
      statusText.textContent = "Status: Ready";
    }, 1200);
  });
})();
