const API_BASE_URL = window.LANTERN_API_BASE_URL || "http://localhost:5050";

const recordButton = document.getElementById("recordButton");
const recordButtonText = document.getElementById("recordButtonText");
const clearButton = document.getElementById("clearButton");
const conversation = document.getElementById("conversation");
const voiceStatus = document.getElementById("voiceStatus");
const stateLabel = document.getElementById("stateLabel");
const timer = document.getElementById("timer");
const connectionBadge = document.getElementById("connectionBadge");
const errorMessage = document.getElementById("errorMessage");
const interactionZone = document.getElementById("interactionZone");
const waveform = document.getElementById("waveform");
const textForm = document.getElementById("textForm");
const textMessage = document.getElementById("textMessage");
const sendTextButton = document.getElementById("sendTextButton");
const toneOptions = [...document.querySelectorAll(".tone-option")];

let mediaRecorder = null;
let mediaStream = null;
let audioChunks = [];
let timerInterval = null;
let recordingStartedAt = null;
let isBusy = false;
let conversationHistory = [];
let selectedTone = "gentle";
let audioContext = null;
let analyser = null;
let analyserSource = null;
let visualizerFrame = null;
let activeAudio = null;

const waveformBars = waveform ? [...waveform.querySelectorAll("i")] : [];

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

function setState(state, message) {
  if (interactionZone) interactionZone.dataset.state = state;

  const labels = {
    idle: "Ready",
    listening: "Listening",
    thinking: "Thinking",
    speaking: "Speaking",
    error: "Try again",
  };

  if (stateLabel) stateLabel.textContent = labels[state] || "Ready";
  if (voiceStatus && message) voiceStatus.textContent = message;
}

function setBusy(busy) {
  isBusy = busy;
  if (recordButton && mediaRecorder?.state !== "recording") recordButton.disabled = busy;
  if (sendTextButton) sendTextButton.disabled = busy;
  if (textMessage) textMessage.disabled = busy;
}

function formatElapsed(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function startTimer() {
  recordingStartedAt = Date.now();
  if (timer) timer.textContent = "00:00";
  timerInterval = window.setInterval(() => {
    if (timer) timer.textContent = formatElapsed(Date.now() - recordingStartedAt);
  }, 250);
}

function stopTimer() {
  if (timerInterval) window.clearInterval(timerInterval);
  timerInterval = null;
}

function addMessage(role, text) {
  const article = document.createElement("article");
  article.className = `message ${role === "user" ? "user-message" : "assistant-message"}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = role === "user" ? "Y" : "✦";

  const content = document.createElement("div");
  content.className = "message-content";

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = role === "user" ? "You" : "Lantern";

  const body = document.createElement("p");
  body.textContent = text;

  content.append(label, body);
  article.append(avatar, content);
  conversation.appendChild(article);
  conversation.scrollTo({ top: conversation.scrollHeight, behavior: "smooth" });
}

function buildHistoryPayload() {
  return conversationHistory
    .slice(-10)
    .map((entry) => `${entry.role === "user" ? "User" : "Lantern"}: ${entry.text}`)
    .join("\n");
}

function stopPlayback() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

function resetWaveform() {
  waveformBars.forEach((bar, index) => {
    bar.style.height = `${5 + (index % 3) * 2}px`;
  });
}

async function startVisualizer(stream) {
  stopVisualizer();
  if (!window.AudioContext && !window.webkitAudioContext) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.75;
    analyserSource = audioContext.createMediaStreamSource(stream);
    analyserSource.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      if (!analyser) return;
      analyser.getByteFrequencyData(data);
      waveformBars.forEach((bar, index) => {
        const dataIndex = Math.floor((index / Math.max(waveformBars.length - 1, 1)) * (data.length - 1));
        const level = data[dataIndex] / 255;
        bar.style.height = `${5 + Math.round(level * 27)}px`;
      });
      visualizerFrame = requestAnimationFrame(draw);
    };

    draw();
  } catch (error) {
    resetWaveform();
  }
}

function stopVisualizer() {
  if (visualizerFrame) cancelAnimationFrame(visualizerFrame);
  visualizerFrame = null;
  if (analyserSource) analyserSource.disconnect();
  analyserSource = null;
  analyser = null;
  if (audioContext) audioContext.close().catch(() => {});
  audioContext = null;
  resetWaveform();
}

async function checkBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, { method: "GET" });
    if (!response.ok) throw new Error("Backend unavailable");
    const data = await response.json();
    connectionBadge.textContent = data.apiConfigured ? "Backend online" : "API key missing";
    connectionBadge.classList.toggle("online", Boolean(data.apiConfigured));
    connectionBadge.classList.toggle("offline", !data.apiConfigured);
  } catch (error) {
    connectionBadge.textContent = "Backend offline";
    connectionBadge.classList.remove("online");
    connectionBadge.classList.add("offline");
  }
}

function chooseRecorderOptions() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  const supported = candidates.find((type) => window.MediaRecorder?.isTypeSupported?.(type));
  return supported ? { mimeType: supported } : undefined;
}

async function beginRecording() {
  setError();
  stopPlayback();

  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    setError("Microphone recording is not supported in this browser. You can still type a message below.");
    setState("error", "Use the typed message field instead.");
    textMessage?.focus();
    return;
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(mediaStream, chooseRecorderOptions());

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    });
    mediaRecorder.addEventListener("stop", handleRecordingStopped, { once: true });
    mediaRecorder.start();

    recordButton.setAttribute("aria-pressed", "true");
    recordButtonText.textContent = "Send recording";
    setState("listening", "Listening… press again when you’re finished.");
    startTimer();
    await startVisualizer(mediaStream);
  } catch (error) {
    setError("Microphone access was blocked or unavailable. Allow microphone access, or use the typed message field below.");
    setState("error", "Microphone unavailable — text input is ready.");
    textMessage?.focus();
  }
}

function stopRecording() {
  if (!mediaRecorder || mediaRecorder.state === "inactive") return;
  mediaRecorder.stop();
  stopTimer();
  stopVisualizer();

  recordButton.setAttribute("aria-pressed", "false");
  recordButtonText.textContent = "Start talking";
  recordButton.disabled = true;
  setState("thinking", "Transcribing your message and preparing a response…");

  mediaStream?.getTracks().forEach((track) => track.stop());
  mediaStream = null;
}

function audioExtension(mimeType) {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "m4a";
  return "webm";
}

async function handleRecordingStopped() {
  const mimeType = mediaRecorder?.mimeType || "audio/webm";
  const audioBlob = new Blob(audioChunks, { type: mimeType });

  if (audioBlob.size < 1000) {
    recordButton.disabled = false;
    setState("idle", "That recording was too short. Try again or type below.");
    return;
  }

  const formData = new FormData();
  formData.append("audio", audioBlob, `lantern-recording.${audioExtension(mimeType)}`);
  formData.append("history", buildHistoryPayload());
  formData.append("tone", selectedTone);

  await sendRequest(`${API_BASE_URL}/api/voice-chat`, {
    method: "POST",
    body: formData,
  });
}

async function sendTextMessage(message) {
  await sendRequest(`${API_BASE_URL}/api/text-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: buildHistoryPayload(),
      tone: selectedTone,
    }),
  });
}

async function sendRequest(url, options) {
  setBusy(true);
  setError();
  setState("thinking", "Lantern is preparing a response…");

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "The request failed.");

    addMessage("user", data.transcript);
    conversationHistory.push({ role: "user", text: data.transcript });

    addMessage("assistant", data.reply);
    conversationHistory.push({ role: "assistant", text: data.reply });

    await speakReply(data);
  } catch (error) {
    setError(error.message || "Something went wrong. Please try again.");
    setState("error", "The request didn’t complete. You can try again.");
  } finally {
    setBusy(false);
    if (recordButton) recordButton.disabled = false;
  }
}

async function speakReply(data) {
  setState("speaking", "Lantern is speaking…");

  if (data.audio) {
    try {
      activeAudio = new Audio(`data:${data.audioMimeType || "audio/mpeg"};base64,${data.audio}`);
      await new Promise((resolve, reject) => {
        activeAudio.addEventListener("ended", resolve, { once: true });
        activeAudio.addEventListener("error", reject, { once: true });
        activeAudio.play().catch(reject);
      });
      activeAudio = null;
      setState("idle", "Ready when you are.");
      return;
    } catch (error) {
      activeAudio = null;
    }
  }

  if ("speechSynthesis" in window && data.reply) {
    await new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(data.reply);
      utterance.rate = 0.96;
      utterance.pitch = 1;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }

  setState("idle", data.audioWarning || "Ready when you are.");
}

recordButton?.addEventListener("click", async () => {
  if (isBusy) return;
  if (mediaRecorder && mediaRecorder.state === "recording") {
    stopRecording();
  } else {
    await beginRecording();
  }
});

textForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isBusy) return;
  const message = textMessage.value.trim();
  if (!message) {
    textMessage.focus();
    return;
  }
  textMessage.value = "";
  stopPlayback();
  await sendTextMessage(message);
});

toneOptions.forEach((button) => {
  button.addEventListener("click", () => {
    selectedTone = button.dataset.tone || "gentle";
    toneOptions.forEach((option) => {
      const selected = option === button;
      option.classList.toggle("selected", selected);
      option.setAttribute("aria-checked", String(selected));
    });
  });
});

clearButton?.addEventListener("click", () => {
  if (mediaRecorder?.state === "recording") stopRecording();
  stopPlayback();
  conversationHistory = [];
  conversation.innerHTML = "";
  addMessage("assistant", "Hi. I’m here to listen. What’s on your mind today?");
  setError();
  setState("idle", "Press the microphone and start speaking.");
  if (timer) timer.textContent = "00:00";
});

resetWaveform();
setState("idle", "Press the microphone and start speaking.");
checkBackend();
