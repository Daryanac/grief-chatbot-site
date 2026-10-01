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

The local backend starts at:

```text
http://localhost:5050
```

Verify it by opening:

```text
http://localhost:5050/api/health
```

A configured local environment should return a JSON response containing:

```json
{"status":"ok","apiConfigured":true}
```

## 3. Serve the frontend locally

Open a second terminal in the repository root and run:

```bash
python3 -m http.server 5500
```

Then open:

```text
http://localhost:5500/demo.html
```

Allow microphone access when your browser asks.

## 4. Test the interaction

### Voice path

1. Click **Start talking**.
2. Speak for a few seconds.
3. Click **Send recording**.
4. The UI enters **Thinking** while the backend transcribes and generates a reply.
5. The transcript and reply appear in the conversation panel.
6. The UI enters **Speaking** while the generated audio plays.
7. The interface returns to **Ready** for the next turn.

### Text fallback

Type a message into the text field and press **Send**. The same context, tone selection, AI response, and speech output are used without microphone capture.

### Response styles

The demo supports three styles:

- **Gentle** — warm and reassuring
- **Reflective** — thoughtful and exploratory
- **Encouraging** — supportive and forward-looking

## Architecture

```text
Browser microphone or text input
            ↓
     JavaScript frontend
            ↓
        Flask REST API
        ↙     ↓      ↘
 speech-to-text  LLM  text-to-speech
        ↘     ↓      ↙
   transcript + response + audio
            ↓
        Browser playback
```

The OpenAI API key exists only on the backend.

## Graceful fallbacks

- If microphone access is unavailable, users can type instead.
- If generated speech audio fails, the browser's speech synthesis API can read the text response.
- Backend status is shown directly in the demo.
- The conversation can be cleared at any time.

## Current scope

This prototype intentionally does **not** impersonate or recreate a deceased person's identity. It demonstrates the voice conversation layer first: microphone input, transcription, AI conversation, recent context, selectable tone, and spoken output.

Future product exploration can add user-controlled memory or personalization only with explicit boundaries and clear controls.
