# 🧠 Intelligent Study Guide Generator

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

An AI-powered EdTech application that transforms unstructured educational documents (digital PDFs and scanned handwritten notes) into structured, active-recall study tools. Built for high scalability and minimal factual hallucination.

## ✨ Core Features

* **Dual-Pathway Data Ingestion:** Seamlessly handles standard digital PDFs (`PyPDF2`) or scanned image files (`Tesseract OCR` & `OpenCV`).
* **Semantic Text Chunking:** Utilizes `LangChain`'s sliding-window algorithm to process massive textbook chapters without losing contextual meaning or hitting LLM token limits.
* **Constrained AI Generation:** Powered by the Google Gemini API with strict system prompts enforcing predictable JSON schemas, effectively eliminating AI hallucinations.
* **Modern Glassmorphism UI:** A sleek, responsive React frontend featuring 3D CSS transform animations for interactive flashcard studying.

## 🛠️ Technology Stack

**Frontend:**
* React.js
* Tailwind CSS (via CDN for zero-config compilation)
* Axios (API communication)

**Backend:**
* Python 3 & Flask
* Google Generative AI SDK (Gemini 2.5 Flash)
* LangChain (RecursiveCharacterTextSplitter)
* PyPDF2 & PyTesseract

---

## 🚀 Local Setup & Installation

Follow these steps to run the application on your local machine.

### 1. Backend Setup (Flask & AI)
Open a terminal and navigate to the `/backend` directory.

1. **Install OS Dependencies:** You must have Tesseract OCR installed on your machine for image processing to work.
   * *Mac:* `brew install tesseract`
   * *Windows:* [Download Installer](https://github.com/UB-Mannheim/tesseract/wiki)
   * *Linux:* `sudo apt-get install tesseract-ocr`
2. **Set up a Virtual Environment (Recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
3. **Install Python Packages:**
   pip3 install -r requirements.txt
4. **Environment Variables: Create a .env file in the backend root and add your free Google AI Studio key:**
   GEMINI_API_KEY=your_gemini_api_key_here
5. **Start the Server:**
   python3 app.py
The server will start running on **http://127.0.0.1:5000**

### 2. Frontend Setup (React)
Open a new terminal window and navigate to the **/frontend directory**
1. **Install Node Modules:**
   npm install
2. **Start the Application:**
   npm start
The React application will automatically open in your browser at 
**http://localhost:3000**
