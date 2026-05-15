import React, { useState } from 'react';
import axios from 'axios';

function App() {
  // Navigation States
  const [currentView, setCurrentView] = useState('start');
  const [studyTab, setStudyTab] = useState('flashcards');
  
  // Data States
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  
  // Flashcard Reviewer States
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Capture file dropped or selected from input
  const handleFileChange = (e) => {
    setError("");
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Orchestrate multipart payload transmission to Port 5001 gateway
  const handleUpload = async () => {
    if (!file) return setError("Please select an academic document or image payload first.");
    
    setLoading(true);
    setError("");
    setData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // ✅ TARGETING PORT 5001: Bypasses native macOS AirPlay Receiver clashes
      const response = await axios.post("http://localhost:5001/api/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Verify deterministic JSON output compliance
      if (response.data && response.data.flashcards) {
        setData(response.data);
        setCurrentView('study');
        setStudyTab('flashcards');
        setCurrentCardIndex(0);
        setIsFlipped(false);
      } else {
        throw new Error("Received malformed JSON schema structure from backend gateway.");
      }
    } catch (err) {
      console.error("Gateway integration failure:", err);
      setError(
        err.response?.data?.error || 
        "Network connection refused. Verify app.py is actively running on Port 5001."
      );
    } finally {
      setLoading(false);
    }
  };

  // Deck pagination logic (automatically flips card back to front before advancing)
  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => Math.min(prev + 1, data.flashcards.length - 1));
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => Math.max(prev - 1, 0));
    }, 150);
  };

  // Flush state memory to return to ingestion gateway
  const resetApp = () => {
    setFile(null);
    setData(null);
    setError("");
    setCurrentView('start');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Premium Ambient Glassmorphism Gradients */}
      <div className="absolute top-0 w-full h-full overflow-hidden -z-10 flex justify-center items-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl absolute -top-40 -left-20"></div>
        <div className="w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl absolute bottom-0 -right-20"></div>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center justify-center">

        {/* ==========================================================
            PHASE 1: LANDING UI
            ========================================================== */}
        {currentView === 'start' && (
          <div className="text-center animate-fade-in flex flex-col items-center max-w-2xl">
            <div className="mb-6 inline-flex p-4 rounded-3xl bg-slate-800/80 border border-slate-700 shadow-xl shadow-cyan-500/5">
              <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Smarter.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
              Upload your raw coursework matrices. Our optimized pipeline maps out context boundaries to output deterministic summaries and active-recall decks instantly.
            </p>
            <button 
              onClick={() => setCurrentView('upload')}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-full font-bold text-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Initialize Workspace
            </button>
          </div>
        )}

        {/* ==========================================================
            PHASE 2: UPLOAD & INGESTION UI
            ========================================================== */}
        {currentView === 'upload' && (
          <div className="animate-fade-in w-full max-w-lg flex flex-col items-center">
            <div className="w-full bg-slate-800/40 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-slate-700/60 text-center">
              <h2 className="text-3xl font-bold mb-2 text-slate-100">Upload Notes</h2>
              <p className="text-slate-400 text-sm mb-8">Select a native PDF stream or rasterized image matrix</p>
              
              {/* Custom File Sandbox Input */}
              <div className="border-2 border-dashed border-slate-600 hover:border-cyan-500/60 rounded-3xl p-8 bg-slate-900/40 hover:bg-slate-900/60 transition-colors group mb-8">
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg" 
                  onChange={handleFileChange} 
                  className="block w-full text-sm text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 file:cursor-pointer cursor-pointer mx-auto file:transition-colors"
                  disabled={loading}
                />
              </div>
              
              {/* Execution Handshake Button */}
              <button 
                onClick={handleUpload}
                disabled={!file || loading}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Extracting & Compiling...</span>
                  </>
                ) : (
                  <span>Create Study Guide</span>
                )}
              </button>

              <button 
                onClick={() => setCurrentView('start')} 
                disabled={loading}
                className="mt-6 text-sm font-semibold text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
              >
                Cancel Processing
              </button>

              {/* Error Gateway Block */}
              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Zero-Persistence Banner */}
              <div className="mt-6 pt-4 border-t border-slate-700/50 text-[11px] text-slate-500">
                🔒 Zero-Persistence Policy: Uploads instantly self-purge from server memory post-delivery.
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            PHASE 3: DYNAMIC STUDY DASHBOARD
            ========================================================== */}
        {currentView === 'study' && data && (
          <div className="animate-fade-in w-full flex flex-col items-center">
            
            {/* Top Navigation & Tab Orchestration */}
            <div className="w-full flex justify-between items-center mb-8 max-w-2xl">
              <button 
                onClick={resetApp} 
                className="text-slate-400 hover:text-cyan-400 text-sm font-semibold transition-colors flex items-center"
              >
                ← Ingest Fresh Payload
              </button>

              {/* TABS: Summary vs Flashcards Viewport */}
              <div className="flex bg-slate-800/80 border border-slate-700/60 p-1 rounded-full shadow-inner">
                <button 
                  onClick={() => setStudyTab('summary')}
                  className={`px-5 py-2 rounded-full font-bold text-xs transition-all ${
                    studyTab === 'summary' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Executive Summary
                </button>
                <button 
                  onClick={() => setStudyTab('flashcards')}
                  className={`px-5 py-2 rounded-full font-bold text-xs transition-all ${
                    studyTab === 'flashcards' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Active-Recall Decks
                </button>
              </div>
            </div>

            {/* TAB CONTENT: Executive Summary Renderer */}
            {studyTab === 'summary' && (
              <div className="w-full max-w-2xl bg-slate-800/40 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-slate-700/60 animate-fade-in text-center">
                <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-cyan-400">
                  ✦
                </div>
                <h3 className="text-2xl font-bold text-slate-100 mb-6">Executive Overview</h3>
                {/* ✅ MAPPED TO data.executive_summary TO PREVENT UNDEFINED SCHEMA FAULTS */}
                <p className="text-base text-slate-300 leading-relaxed text-justify">
                  {data.executive_summary}
                </p>
              </div>
            )}

            {/* TAB CONTENT: Individual Card Viewport with Native Inline 3D Engine */}
            {studyTab === 'flashcards' && data.flashcards && data.flashcards.length > 0 && (
              <div className="w-full flex flex-col items-center animate-fade-in">
                
                {/* Granular Tracking Banner */}
                <div className="flex items-center space-x-2 mb-6">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full">
                    Active Matrix: {currentCardIndex + 1} / {data.flashcards.length}
                  </span>
                </div>

                {/* 3D Viewport Boundary */}
                <div 
                  className="relative w-full max-w-xl h-80 cursor-pointer mb-10 group select-none" 
                  style={{ perspective: "1000px" }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Preserving 3D object rendering inline to execute flawless rotation matrices */}
                  <div 
                    className="w-full h-full duration-500 relative transition-transform ease-out"
                    style={{ 
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                    }}
                  >
                    
                    {/* CARD FRONT: Source Question */}
                    <div 
                      className="absolute inset-0 w-full h-full bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-[2rem] shadow-xl p-10 flex flex-col items-center justify-center text-center group-hover:border-slate-600 transition-colors"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest absolute top-8">
                        QUESTION
                      </span>
                      <p className="text-xl md:text-2xl font-semibold text-slate-100 leading-snug px-4">
                        {data.flashcards[currentCardIndex].front}
                      </p>
                      <span className="text-[11px] font-semibold text-cyan-500/70 uppercase tracking-widest absolute bottom-8">
                        Click matrix to reveal truth →
                      </span>
                    </div>

                    {/* CARD BACK: Decoded Factual Answer */}
                    <div 
                      className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-[2rem] shadow-2xl p-10 flex flex-col items-center justify-center text-center"
                      style={{ 
                        backfaceVisibility: "hidden", 
                        transform: "rotateY(180deg)" 
                      }}
                    >
                      <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest absolute top-8">
                        ANSWER
                      </span>
                      <p className="text-lg md:text-xl font-medium text-slate-200 leading-relaxed overflow-y-auto max-h-[65%] px-4">
                        {data.flashcards[currentCardIndex].back}
                      </p>
                      <span className="text-[11px] font-semibold text-cyan-500/50 uppercase tracking-widest absolute bottom-8">
                        ← Click matrix to reset
                      </span>
                    </div>

                  </div>
                </div>

                {/* Deck Traversing Controls */}
                <div className="flex items-center space-x-6">
                  <button 
                    onClick={prevCard} 
                    disabled={currentCardIndex === 0}
                    className="p-4 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-all duration-150"
                    title="Previous Question"
                  >
                    ←
                  </button>
                  <button 
                    onClick={nextCard} 
                    disabled={currentCardIndex === data.flashcards.length - 1}
                    className="p-4 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-all duration-150"
                    title="Next Question"
                  >
                    →
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default App;