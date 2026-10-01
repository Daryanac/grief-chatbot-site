# Lantern Voice Demo Setup

The working voice prototype lives on the `voice-ai-demo` branch.

## 1. Configure the backend

From the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Open `backend/.env` and replace:

```text
OPENAI_API_KEY=replace_with_your_key
```

with your real OpenAI API key.

Never commit the `.env` file or paste the key into `demo-config.js`.

## 2. Start the Flask backend

From the `backend` folder with the virtual environment active:

```bash
python app.py
```

The backend should start at:

```text
http://localhost:5000
```

You can verify it by opening:

```text
http://localhost:5000/health
```

You should see a JSON response with `status: ok`.

## 3. Serve the website locally

Open a second terminal in the repository root and run:

```bash
python3 -m http.server 5500
```

Then open:

```text
http://localhost:5500/demo.html
```

Allow microphone access when your browser asks.

## 4. Test the voice flow

1. Click **Start talking**.
2. Speak for a few seconds.
3. Click **Send recording**.
4. The browser sends the recording to the Flask backend.
5. The backend transcribes the audio, asks the AI for a response, converts that response to speech, and returns it to the browser.
6. The transcript and response appear in the conversation panel, and the response audio plays automatically.

## Architecture

```text
Browser microphone
      ↓
MediaRecorder
      ↓
Flask backend
      ↓
OpenAI speech transcription
      ↓
OpenAI text response
      ↓
OpenAI text-to-speech
      ↓
Browser playback
```

The OpenAI API key exists only on the backend.

## Current scope

This prototype intentionally does **not** impersonate or recreate a deceased person's identity. It demonstrates the voice conversation layer first: microphone input, transcription, AI conversation, conversation context, and spoken output.

A later phase can add user-controlled personalization, memory, and consent-based voice features after the core voice pipeline is stable.
