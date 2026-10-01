import base64
import os
from io import BytesIO

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from openai import OpenAI

load_dotenv()

app = Flask(__name__)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5500,http://127.0.0.1:5500,https://daryanac.github.io",
    ).split(",")
    if origin.strip()
]

# Allow the local demo and deployed GitHub Pages site to call the backend.
CORS(app, resources={r"/*": {"origins": allowed_origins}})

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
TEXT_MODEL = os.getenv("OPENAI_TEXT_MODEL", "gpt-4.1-mini")
TRANSCRIBE_MODEL = os.getenv("OPENAI_TRANSCRIBE_MODEL", "gpt-4o-mini-transcribe")
TTS_MODEL = os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
TTS_VOICE = os.getenv("OPENAI_TTS_VOICE", "alloy")

SYSTEM_INSTRUCTIONS = """
You are Lantern, a calm and supportive AI conversation companion for people experiencing grief.

Your role is to listen, reflect, and respond with warmth. You are not a therapist, clinician, crisis service,
or a deceased loved one, and you must never claim to be one. Do not imitate or impersonate a specific real
person. If the user asks you to speak as a deceased loved one, gently explain that you can help them reflect on
memories or imagine what qualities that person valued, but you cannot present yourself as that person.

Keep responses conversational and usually under 120 words so they sound natural when spoken aloud. Ask at most
one gentle follow-up question at a time. Avoid clichés, diagnoses, certainty about the afterlife, or claims that
you know what the deceased person would have said.

If the user expresses an immediate intention to harm themselves or someone else, encourage them to contact local
emergency services or a crisis line and reach out to a trusted person nearby. Keep the response direct and
supportive rather than continuing normal conversation.
""".strip()


@app.get("/health")
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/voice-chat")
def voice_chat():
    if not os.getenv("OPENAI_API_KEY"):
        return jsonify({"error": "OPENAI_API_KEY is not configured on the server."}), 500

    audio = request.files.get("audio")
    if audio is None or audio.filename == "":
        return jsonify({"error": "An audio recording is required."}), 400

    history = request.form.get("history", "").strip()

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

        conversation_input = transcript
        if history:
            conversation_input = (
                "Recent conversation context:\n"
                f"{history[-5000:]}\n\n"
                f"User's newest message:\n{transcript}"
            )

        response = client.responses.create(
            model=TEXT_MODEL,
            instructions=SYSTEM_INSTRUCTIONS,
            input=conversation_input,
        )
        reply = (response.output_text or "").strip()

        if not reply:
            return jsonify({"error": "The AI response was empty. Please try again."}), 502

        speech = client.audio.speech.create(
            model=TTS_MODEL,
            voice=TTS_VOICE,
            input=reply,
            response_format="mp3",
        )

        speech_bytes = speech.read()
        audio_base64 = base64.b64encode(speech_bytes).decode("utf-8")

        return jsonify(
            {
                "transcript": transcript,
                "reply": reply,
                "audio": audio_base64,
                "audioMimeType": "audio/mpeg",
            }
        )

    except Exception as exc:
        app.logger.exception("Lantern voice request failed")
        return jsonify({"error": "The voice request failed. Check the backend logs and try again."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
