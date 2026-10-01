const API_BASE_URL = window.LANTERN_API_BASE_URL || "http://localhost:5000";

const recordButton = document.getElementById("recordButton");
const recordButtonText = document.getElementById("recordButtonText");
const clearButton = document.getElementById("clearButton");
const conversation = document.getElementById("conversation");
const voiceStatus = document.getElementById("voiceStatus");
const timer = document.getElementById("timer");
const connectionBadge = document.getElementById("connectionBadge");
const errorMessage = document.getElementById("errorMessage");

let mediaRecorder = null;
let mediaStream = null;
let audioChunks = [];
let timerInterval = null;
let recordingStartedAt = null;
let isBusy = false;
let conversationHistory = [];

function setError(message = "") {
  if (!errorMessage) return;
  if (!message) {
    errorMessage.hidden = true;
    errorMessage.textContent = "";
    return;
  }
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function setStatus(message) {
  if (voiceStatus) voiceStatus.textContent = message;
}

function formatElapsed(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function startTimer() {
  recordingStartedAt = Date.now();
  timer.textContent = "00:00";
  timerInterval = window.setInterval(() => {
    timer.textContent = formatElapsed(Date.now() - recordingStartedAt);
  }, 250);
}

function stopTimer() {
  if (timerInterval) window.clearInterval(timerInterval);
  timerInterval = null;
}

function addMessage(role, text) {
  const article = document.createElement("article");
  article.className = `message ${role === "user" ? "user-message" : "assistant-message"}`;

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = role === "user" ? "You" : "Lantern";

  const body = document.createElement("p");
  body.textContent = text;

  article.append(label, body);
  conversation.appendChild(article);
  conversation.scrollTop = conversation.scrollHeight;
}

function buildHistoryPayload() {
  return conversationHistory
    .slice(-8)
    .map((entry) => `${entry.role === "user" ? "User" : "Lantern"}: ${entry.text}`)
    .join("\n");
}

async function checkBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
    if (!response.ok) throw new Error("Backend unavailable");
    connectionBadge.textContent = "Backend online";
    connectionBadge.classList.remove("offline");
    connectionBadge.classList.add("online");
  } catch {
    connectionBadge.textContent = "Backend offline";
    connectionBadge.classList.remove("online");
    connectionBadge.classList.add("offline");
  }
}

async function beginRecording() {
  setError();

  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    setError("Your browser does not support microphone recording for this demo.");
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];

    mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", handleRecordingStopped, { once: true });
    mediaRecorder.start();

    recordButton.classList.add("recording");
    recordButton.setAttribute("aria-pressed", "true");
    recordButtonText.textContent = "Send recording";
    setStatus("Listening… press again when you're done.");
    startTimer();
  } catch (error) {
    setError("Microphone access was blocked. Allow microphone access and try again.");
    setStatus("Microphone permission is required.");
  }
}

function stopRecording() {
  if (!mediaRecorder || mediaRecorder.state === "inactive") return;
  mediaRecorder.stop();
  stopTimer();

  recordButton.classList.remove("recording");
  recordButton.setAttribute("aria-pressed", "false");
  recordButtonText.textContent = "Start talking";
  recordButton.disabled = true;
  setStatus("Transcribing and preparing a response…");

  mediaStream?.getTracks().forEach((track) => track.stop());
  mediaStream = null;
}

async function handleRecordingStopped() {
  const mimeType = mediaRecorder?.mimeType || "audio/webm";
  const audioBlob = new Blob(audioChunks, { type: mimeType });

  if (audioBlob.size < 1000) {
    recordButton.disabled = false;
    setStatus("That recording was too short. Try again.");
    return;
  }

  isBusy = true;
  setError();

  try {
    const extension = mimeType.includes("ogg") ? "ogg" : mimeType.includes("mp4") ? "m4a" : "webm";
    const formData = new FormData();
    formData.append("audio", audioBlob, `lantern-recording.${extension}`);
    formData.append("history", buildHistoryPayload());

    const response = await fetch(`${API_BASE_URL}/api/voice-chat`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "The voice request failed.");
    }

    addMessage("user", data.transcript);
    conversationHistory.push({ role: "user", text: data.transcript });

    addMessage("assistant", data.reply);
    conversationHistory.push({ role: "assistant", text: data.reply });

    if (data.audio) {
      const player = new Audio(`data:${data.audioMimeType || "audio/mpeg"};base64,${data.audio}`);
      setStatus("Lantern is speaking…");
      player.addEventListener("ended", () => setStatus("Ready when you are."), { once: true });
      await player.play();
    } else {
      setStatus("Ready when you are.");
    }
  } catch (error) {
    setError(error.message || "Something went wrong. Please try again.");
    setStatus("Ready to try again.");
  } finally {
    isBusy = false;
    recordButton.disabled = false;
  }
}

recordButton?.addEventListener("click", async () => {
  if (isBusy) return;

  if (mediaRecorder && mediaRecorder.state === "recording") {
    stopRecording();
  } else {
    await beginRecording();
  }
});

clearButton?.addEventListener("click", () => {
  if (mediaRecorder?.state === "recording") stopRecording();
  conversationHistory = [];
  conversation.innerHTML = "";
  addMessage("assistant", "Hi. I'm here to listen. What's on your mind today?");
  setError();
  setStatus("Ready when you are.");
  timer.textContent = "00:00";
});

checkBackend();
