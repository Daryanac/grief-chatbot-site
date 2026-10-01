# Lantern

Lantern is a full-stack voice AI prototype designed to explore supportive conversational experiences for people processing grief. The working build lets a user speak naturally or type a message, sends the conversation through a secure Flask backend, generates a context-aware AI response, and speaks the response back.

The current prototype intentionally focuses on the voice-conversation layer. It does **not** impersonate a deceased person or claim to recreate someone's identity.

## Live experience

The frontend contains:

- `index.html` — project overview and architecture
- `demo.html` — interactive voice AI prototype
- `research.html` — research impact and iterative design documentation

When the Flask backend is running locally, open:

```text
http://localhost:5500/demo.html
```

## Core capabilities

- Browser microphone capture with `MediaRecorder`
- Live audio visualization with the Web Audio API
- Speech-to-text transcription
- Context-aware AI response generation
- Text-to-speech playback
- Gentle, Reflective, and Encouraging response styles
- Typed-input fallback when microphone capture is unavailable
- Browser speech fallback when generated audio cannot play
- Conversation history for recent-turn context
- Visible Listening, Thinking, Speaking, Ready, and Error states
- Responsive light/dark interface
- Server-side API key protection
- Safety-aware system instructions and transparent AI boundaries

## Architecture

```text
             ┌─────────────────────────┐
             │      Browser UI         │
             │  Voice or typed input   │
             └────────────┬────────────┘
                          │
                          ▼
             ┌─────────────────────────┐
             │      Flask REST API     │
             │ validation + context    │
             └───────┬────────┬────────┘
                     │        │
          ┌──────────┘        └──────────┐
          ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│ Speech-to-text   │          │ Language model   │
│ transcription    │          │ response         │
└────────┬─────────┘          └────────┬─────────┘
         └──────────────┬──────────────┘
                        ▼
              ┌──────────────────┐
              │ Text-to-speech   │
              │ synthesis        │
              └────────┬─────────┘
                       ▼
              Browser audio playback
```

## Technology

**Frontend**

- HTML5
- CSS3
- JavaScript
- MediaRecorder API
- Web Audio API
- Web Speech API fallback

**Backend**

- Python
- Flask
- Flask-CORS
- python-dotenv
- OpenAI API

**AI pipeline**

- Speech transcription
- Language-model response generation
- Text-to-speech synthesis

## Run locally

### 1. Clone and select the prototype branch

```bash
git checkout voice-ai-demo
git pull
```

### 2. Create the backend environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Add your OpenAI API key to `backend/.env`:

```text
OPENAI_API_KEY=your_key_here
```

Do not commit `.env`.

### 3. Start the backend

```bash
python app.py
```

The local API runs on:

```text
http://localhost:5050
```

Verify it at:

```text
http://localhost:5050/api/health
```

### 4. Start the frontend

From the repository root in another terminal:

```bash
python3 -m http.server 5500
```

Then visit:

```text
http://localhost:5500/
```

## Security

The OpenAI API key is never stored in browser JavaScript. It is read by the Flask server from an environment variable. `.env`, virtual environments, Python caches, and local dependency folders are excluded through `.gitignore`.

For a deployed version, configure `ALLOWED_ORIGINS` with the final frontend origin and set the API key through the hosting provider's secret/environment-variable controls.

## Product and safety scope

Lantern is an experimental portfolio project. It is not therapy, medical care, diagnosis, or an emergency service.

The current system prompt is designed to:

- avoid claiming to be a deceased loved one
- avoid impersonating a specific person
- keep responses concise and conversational
- avoid diagnoses and certainty about the afterlife
- direct users toward human or emergency support when immediate harm is expressed

The original design research explored deeper personalization and remembrance features. Those ideas remain research directions rather than claims about the current implementation.

## Research-driven design

The project was developed iteratively through multiple survey rounds and prototype feedback. Research influenced:

- warmer visual design
- clearer product explanation
- stronger trust and safety language
- simpler navigation
- reduced text density
- more transparent AI positioning
- mobile-friendly presentation

See `research.html` for the research impact report.

## Project status

**Implemented**

- end-to-end voice conversation
- text fallback
- selectable conversation tones
- context handling
- speech playback and browser fallback
- responsive UI
- research documentation

**Future work**

- hosted production backend
- persistent user accounts
- explicit user-controlled memory
- additional accessibility controls
- richer testing and observability
- production-rate limiting and abuse protections

---

Built by **Daryana Castro** as a full-stack AI portfolio project.
