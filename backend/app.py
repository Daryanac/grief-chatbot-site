import base64
import os
from io import BytesIO

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import OpenAI

load_dotenv()

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 12 * 1024 * 1024

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5500,http://127.0.0.1:5500,https://daryanac.github.io",
    ).split(",")
    if origin.strip()
]

CORS(app, resources={r"/*": {"origins": allowed_origins}})

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
TEXT_MODEL = os.getenv("OPENAI_TEXT_MODEL", "gpt-4.1-mini")
TRANSCRIBE_MODEL = os.getenv("OPENAI_TRANSCRIBE_MODEL", "gpt-4o-mini-transcribe")
TTS_MODEL = os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
TTS_VOICE = os.getenv("OPENAI_TTS_VOICE", "alloy")

BASE_INSTRUCTIONS = """
You are Lantern, a calm and supportive AI conversation companion for people experiencing grief.

Your role is to listen, reflect, and respond with warmth. You are not a therapist, clinician, crisis service,
or a deceased loved one, and you must never claim to be one. Do not imitate or impersonate a specific real
person. If the user asks you to speak as a deceased loved one, gently explain that you can help them reflect on
memories or qualities that person valued, but you cannot present yourself as that person.

Keep responses conversational and usually under 120 words so they sound natural when spoken aloud. Ask at most
one gentle follow-up question at a time. Avoid clichés, diagnoses, certainty about the afterlife, or claims that
you know what the deceased person would have said.

If the user expresses an immediate intention to harm themselves or someone else, encourage them to contact local
emergency services or a crisis line and reach out to a trusted person nearby. Keep the response direct and
supportive rather than continuing normal conversation.
""".strip()

TONE_INSTRUCTIONS = {
    "gentle": "Use a warm, reassuring tone. Be emotionally attentive without sounding overly sentimental.",
    "reflective": "Use a thoughtful, reflective tone. Help the user explore feelings and memories with one careful question when useful.",
    "encouraging": "Use a supportive, forward-looking tone. Validate the feeling first, then gently emphasize coping, connection, or a manageable next step.",
}


def configured() -> bool:
    return bool(os.getenv("OPENAI_API_KEY"))


def normalized_tone(value: str | None) -> str:
    tone = (value or "gentle").strip().lower()
    return tone if tone in TONE_INSTRUCTIONS else "gentle"


def build_instructions(tone: str) -> str:
    return f"{BASE_INSTRUCTIONS}\n\nConversation style for this turn:\n{TONE_INSTRUCTIONS[tone]}"


def build_conversation_input(message: str, history: str) -> str:
    if not history:
        return message
    return (
        "Recent conversation context:\n"
        f"{history[-6000:]}\n\n"
        f"User's newest message:\n{message}"
    )


def generate_reply(message: str, history: str, tone: str) -> str:
    response = client.responses.create(
        model=TEXT_MODEL,
        instructions=build_instructions(tone),
        input=build_conversation_input(message, history),
    )
    return (response.output_text or "").strip()


def synthesize_reply(reply: str):
    """Return encoded speech when available; keep text usable if TTS fails."""
    try:
        speech = client.audio.speech.create(
            model=TTS_MODEL,
            voice=TTS_VOICE,
            input=reply,
            response_format="mp3",
        )
        speech_bytes = speech.read()
        return base64.b64encode(speech_bytes).decode("utf-8"), None
    except Exception:
        app.logger.exception("Lantern text-to-speech failed")
        return None, "AI audio was unavailable, so the browser can read the response instead."


def response_payload(transcript: str, reply: str, tone: str):
    audio_base64, audio_warning = synthesize_reply(reply)
    payload = {
        "transcript": transcript,
        "reply": reply,
        "tone": tone,
        "audio": audio_base64,
        "audioMimeType": "audio/mpeg" if audio_base64 else None,
    }
    if audio_warning:
        payload["audioWarning"] = audio_warning
    return payload


@app.get("/health")
@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "apiConfigured": configured()})


@app.post("/api/text-chat")
def text_chat():
    if not configured():
        return jsonify({"error": "OPENAI_API_KEY is not configured on the server."}), 500

    body = request.get_json(silent=True) or {}
    message = str(body.get("message", "")).strip()
    history = str(body.get("history", "")).strip()
    tone = normalized_tone(body.get("tone"))

    if not message:
        return jsonify({"error": "Please enter a message."}), 400
    if len(message) > 4000:
        return jsonify({"error": "That message is too long for this demo."}), 400

    try:
        reply = generate_reply(message, history, tone)
        if not reply:
            return jsonify({"error": "The AI response was empty. Please try again."}), 502
        return jsonify(response_payload(message, reply, tone))
    except Exception:
        app.logger.exception("Lantern text request failed")
        return jsonify({"error": "The text request failed. Check the backend logs and try again."}), 500


@app.post("/api/voice-chat")
def voice_chat():
    if not configured():
        return jsonify({"error": "OPENAI_API_KEY is not configured on the server."}), 500

    audio = request.files.get("audio")
    if audio is None or audio.filename == "":
        return jsonify({"error": "An audio recording is required."}), 400

    history = request.form.get("history", "").strip()
    tone = normalized_tone(request.form.get("tone"))

    try:
        audio_bytes = audio.read()
        audio_buffer = BytesIO(audio_bytes)
        audio_buffer.name = audio.filename or "recording.webm"

        transcription = client.audio.transcriptions.create(
            model=TRANSCRIBE_MODEL,
            file=audio_buffer,
        )
        transcript = (getattr(transcription, "text", "") or "").strip()

        if not transcript:
            return jsonify({"error": "I couldn't understand that recording. Please try again."}), 400

        reply = generate_reply(transcript, history, tone)
        if not reply:
            return jsonify({"error": "The AI response was empty. Please try again."}), 502

        return jsonify(response_payload(transcript, reply, tone))

    except Exception:
        app.logger.exception("Lantern voice request failed")
        return jsonify({"error": "The voice request failed. Check the backend logs and try again."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5050")), debug=True)
