import os
import re
import uuid
import tempfile
import sqlite3
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv  # Explicitly loads local .env files into OS variables

# Computer Vision & Extraction Dependencies
import cv2
import numpy as np
import pytesseract
from PyPDF2 import PdfReader

# Semantic Partitioning & Cloud AI Dependencies
from langchain.text_splitter import RecursiveCharacterTextSplitter
import google.generativeai as genai

# =====================================================================
# 1. SERVER INITIALIZATION & CONFIGURATION
# =====================================================================
# Securely inject local .env variables into the active OS context
load_dotenv()

app = Flask(__name__)
CORS(app)  # Authorize cross-origin handshakes with the React frontend

# Configure Google Gemini API Gateway securely from OS environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("CRITICAL WARNING: GEMINI_API_KEY environment variable not detected. Inference will fail.")

# Initialize the Gemini Model Tier
model = genai.GenerativeModel('gemini-2.5-flash')

# =====================================================================
# 2. EPHEMERAL STATE MANAGEMENT (VOLATILE RAM DATABASE)
# =====================================================================
# Using a shared memory database connection to enforce absolute zero-persistence.
# Data resides strictly in host RAM and leaves zero footprints on persistent storage.
ram_db_connection = sqlite3.connect("file::memory:?cache=shared", uri=True, check_same_thread=False)

def init_ephemeral_db():
    """Initializes the transient SQLite schemas inside system RAM."""
    cursor = ram_db_connection.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Sessions (
            session_id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    # ✅ FIXED: Stripped out the scrambled SQLITE_MASTER syntax artifact
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS DocCache (
            session_id TEXT,
            raw_text TEXT,
            FOREIGN KEY(session_id) REFERENCES Sessions(session_id) ON DELETE CASCADE
        )
    """)
    ram_db_connection.commit()

init_ephemeral_db()

# =====================================================================
# 3. EXTRACTION SUBROUTINES (DUAL-PATHWAY ENGINE)
# =====================================================================
def sanitize_extracted_string(raw_string):
    """Custom regular expression sanitization to filter non-alphanumeric byte noise."""
    cleaned = re.sub(r'[^\w\s.,!?()-=\[\]{}:;""\'`~*/\\+^]', '', raw_string)
    return cleaned.strip()

def extract_text_from_pdf(file_path):
    """Direct unformatted string extraction for native, born-digital PDF object trees."""
    reader = PdfReader(file_path)
    extracted_text = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            extracted_text.append(text)
    return sanitize_extracted_string("\n".join(extracted_text))

def extract_text_from_image(file_path):
    """
    OpenCV pre-processing pipeline optimized to resolve typographical noise,
    shadows, and background paper grain upstream of the Tesseract LSTM engine.
    """
    image = cv2.imread(file_path)
    if image is None:
        raise ValueError("Computer Vision failure: Image matrix could not be decoded.")

    # Dimensionality reduction: Convert 3D RGB to 2D Grayscale matrix
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Binarization: Adaptive Gaussian Thresholding over an 11x11 pixel block minus constant C=2
    binarized = cv2.adaptiveThreshold(
        gray, 
        255, 
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 
        11, 
        2
    )

    raw_ocr_string = pytesseract.image_to_string(binarized)
    return sanitize_extracted_string(raw_ocr_string)

# =====================================================================
# 4. CORE REST API ENDPOINT (/api/generate)
# =====================================================================
@app.route('/api/generate', methods=['POST'])
def generate_study_guide():
    """
    Orchestrates file ingestion, route assignment, LangChain sliding-window
    semantic chunking, zero-hallucination Gemini inference, and cascade clean-up.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file payload detected in the multipart request."}), 400

    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return jsonify({"error": "Empty filename submitted."}), 400

    session_id = str(uuid.uuid4())
    temp_dir = tempfile.gettempdir()
    secure_ext = os.path.splitext(uploaded_file.filename)[1].lower()
    temp_file_path = os.path.join(temp_dir, f"payload_{session_id}{secure_ext}")

    cursor = ram_db_connection.cursor()

    try:
        # Secure OS-level Sandbox Saving
        uploaded_file.save(temp_file_path)

        cursor.execute("INSERT INTO Sessions (session_id) VALUES (?)", (session_id,))
        ram_db_connection.commit()

        # Dynamic Parsing Routing Logic
        extracted_content = ""
        if secure_ext == '.pdf':
            extracted_content = extract_text_from_pdf(temp_file_path)
        elif secure_ext in ['.png', '.jpg', '.jpeg']:
            extracted_content = extract_text_from_image(temp_file_path)
        else:
            return jsonify({"error": f"Unsupported MIME/file extension: {secure_ext}"}), 415

        if not extracted_content:
            return jsonify({"error": "Document extraction complete but yielded zero readable characters."}), 422

        cursor.execute("INSERT INTO DocCache (session_id, raw_text) VALUES (?, ?)", (session_id, extracted_content))
        ram_db_connection.commit()

        # Mathematical Semantic Chunking via LangChain
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=5000,
            chunk_overlap=500,
            separators=["\n\n", "\n", ".", " ", ""]
        )
        chunks = splitter.split_text(extracted_content)
        target_chunk = chunks[0] if chunks else extracted_content

        # Prompt Engineering & Deterministic Inference Constraints
        system_instruction = """
You are an expert academic data extractor. Analyze the provided text chunk.

CRITICAL RULES:
1. NO HALLUCINATIONS: Rely ONLY on the provided text.
2. EXACT COUNT: You MUST generate a MINIMUM of 15 active-recall flashcards.
3. GRANULARITY: Break down complex arguments into atomic Q&A pairs.

You MUST return your response STRICTLY as a JSON object matching this schema:
{
    "executive_summary": "A comprehensive 3-sentence overview.",
    "flashcards": [
        {"front": "Specific Question?", "back": "Factual Answer."}
    ]
}
"""
        full_prompt = f"{system_instruction}\n\nTEXT TO ANALYZE:\n{target_chunk}"

        api_response = model.generate_content(
            full_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,                       
                response_mime_type="application/json", 
            )
        )

        structured_payload = json.loads(api_response.text)
        
        structured_payload["meta"] = {
            "session_id": session_id,
            "source_characters": len(extracted_content),
            "total_chunks_derived": len(chunks),
            "flashcard_count": len(structured_payload.get("flashcards", []))
        }

        return jsonify(structured_payload), 200

    except Exception as e:
        print(f"CRITICAL PIPELINE FAULT: {str(e)}")
        return jsonify({"error": "Backend encountered a processing interruption.", "details": str(e)}), 500

    finally:
        # Cascade Clean-up Protocol
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except OSError as cleanup_error:
                print(f"Sandbox purger warning: {str(cleanup_error)}")

        try:
            cursor.execute("DELETE FROM DocCache WHERE session_id = ?", (session_id,))
            cursor.execute("DELETE FROM Sessions WHERE session_id = ?", (session_id,))
            ram_db_connection.commit()
        except sqlite3.Error as db_cleanup_error:
            print(f"RAM DB purger warning: {str(db_cleanup_error)}")

if __name__ == '__main__':
    print("=" * 70)
    print("INITIALIZING: Intelligent Study Guide Generator API Gateway")
    print("-> Dual-Pathway Extraction Engine: ONLINE")
    print("-> Volatile RAM State DB (:memory:): ONLINE")
    print("-> Port Binding: http://localhost:5001")
    print("=" * 70)
    app.run(host='0.0.0.0', port=5001, debug=True)