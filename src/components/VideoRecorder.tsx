import React, { useState, useRef, useEffect } from "react";
import { Camera, Music, Sparkles, AlertCircle, RefreshCw, Square, VideoIcon, ArrowLeft, Mic, ChevronRight, Check } from "lucide-react";
import { POPULAR_TRACKS } from "../data/music";
import { FaceFilter, MusicTrack, Video } from "../types";

interface VideoRecorderProps {
  onBack: () => void;
  onRecordSuccess: (newVideo: Video) => void;
}

const FILTERS: FaceFilter[] = [
  { id: "f-none", name: "Tanpa Filter", emoji: "📷", description: "Bawaan asli kamera", type: "none" },
  { id: "f-cyber", name: "Cyberpunk Neon", emoji: "⚡", description: "Wajah neon futuristik", type: "cyberpunk" },
  { id: "f-vintage", name: "Vintage VHS", emoji: "🎞️", description: "Efek pita seluloid retro", type: "vintage" },
  { id: "f-matrix", name: "Code Matrix", emoji: "🟢", description: "Hujan digital biner", type: "matrix" },
  { id: "f-beauty", name: "Beauty Glam", emoji: "✨", description: "Wajah halus merona", type: "beauty" },
  { id: "f-cat", name: "Cute Cat Mask", emoji: "🐱", description: "Kumis kucing interaktif", type: "funny-mask" }
];

export default function VideoRecorder({ onBack, onRecordSuccess }: VideoRecorderProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string>("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<FaceFilter>(FILTERS[0]);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Custom manual mustache/mask calibration coordinates (to make the cat whiskers align perfectly)
  const [maskX, setMaskX] = useState(50); // percentage-based
  const [maskY, setMaskY] = useState(55); // percentage-based
  const [maskScale, setMaskScale] = useState(1);

  // Form states after recording
  const [caption, setCaption] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Setup camera stream on mount/unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopCameraAndAudio();
    };
  }, []);

  // Sync background music audio element play/pause with recording state
  useEffect(() => {
    if (localAudioRef.current) {
      if (isRecording && selectedTrack) {
        localAudioRef.current.currentTime = 0;
        localAudioRef.current.play().catch(e => console.warn("Failed to play track during recording:", e));
      } else {
        localAudioRef.current.pause();
      }
    }
  }, [isRecording, selectedTrack]);

  // Real-time canvas filter drawing pipeline (60 FPS)
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particlesMatrix: { x: number; y: number; speed: number; char: string }[] = [];
    const charList = "01010101XYZ MATRIX DIGITAL TIKTOK VIBES".split("");
    for (let i = 0; i < 35; i++) {
      particlesMatrix.push({
        x: Math.random() * 400,
        y: Math.random() * 300,
        speed: 1 + Math.random() * 3,
        char: charList[Math.floor(Math.random() * charList.length)]
      });
    }

    const draw = () => {
      if (video.paused || video.ended) {
        animationFrameIdRef.current = requestAnimationFrame(draw);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;

      // 1. Reset filter modifiers
      ctx.filter = "none";
      ctx.clearRect(0, 0, w, h);

      // 2. Setup preset filter variables
      if (selectedFilter.type === "cyberpunk") {
        ctx.filter = "hue-rotate(-15deg) contrast(1.25) saturate(1.2)";
      } else if (selectedFilter.type === "vintage") {
        ctx.filter = "sepia(0.8) contrast(1.1) brightness(0.95)";
      } else if (selectedFilter.type === "matrix") {
        ctx.filter = "grayscale(1) contrast(1.4) brightness(0.9)";
      } else if (selectedFilter.type === "beauty") {
        ctx.filter = "brightness(1.05) saturate(1.1) contrast(0.95) blur(0.3px)";
      }

      // 3. Draw original camera capture onto the canvas
      ctx.drawImage(video, 0, 0, w, h);

      // 4. Draw additional programmatic custom graphic overlays (Face Mask / HUDs)
      if (selectedFilter.type === "cyberpunk") {
        ctx.filter = "none";
        
        // Glowing cyan cyberpunk hud corners
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 10;
        
        // Draw cyber brackets
        ctx.beginPath();
        // Top Left
        ctx.moveTo(30, 30); ctx.lineTo(60, 30); ctx.moveTo(30, 30); ctx.lineTo(30, 60);
        // Top Right
        ctx.moveTo(w - 30, 30); ctx.lineTo(w - 60, 30); ctx.moveTo(w - 30, 30); ctx.lineTo(w - 30, 60);
        // Bottom Left
        ctx.moveTo(30, h - 30); ctx.lineTo(60, h - 30); ctx.moveTo(30, h - 30); ctx.lineTo(30, h - 60);
        // Bottom Right
        ctx.moveTo(w - 30, h - 30); ctx.lineTo(w - 60, h - 30); ctx.moveTo(w - 30, h - 30); ctx.lineTo(w - 30, h - 60);
        ctx.stroke();

        // Pulsing Cyber Grid in center
        ctx.strokeStyle = "rgba(244, 63, 94, 0.4)"; // rose glow
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Circle target
        ctx.arc(w / 2, h / 2, 70 + Math.sin(Date.now() / 150) * 5, 0, Math.PI * 2);
        // Cross lines
        ctx.moveTo(w / 2 - 100, h / 2); ctx.lineTo(w / 2 - 20, h / 2);
        ctx.moveTo(w / 2 + 20, h / 2); ctx.lineTo(w / 2 + 100, h / 2);
        ctx.moveTo(w / 2, h / 2 - 100); ctx.lineTo(w / 2, h / 2 - 20);
        ctx.moveTo(w / 2, h / 2 + 20); ctx.lineTo(w / 2, h / 2 + 100);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.shadowBlur = 0;
        ctx.fillText("TARGET HUD v2.5", w / 2 - 45, h / 2 - 80);
        ctx.fillText("BEAT REACTION CONNECTED", w / 2 - 60, h / 2 + 90);

      } else if (selectedFilter.type === "vintage") {
        ctx.filter = "none";
        // Vintage Red Recording DOT and VHS artifacts
        ctx.fillStyle = Date.now() % 1000 > 500 ? "#f43f5e" : "rgba(255,255,255,0.4)";
        ctx.beginPath();
        ctx.arc(40, 40, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.fillText("REC 🔴", 52, 43);
        ctx.fillText("SP PLAY 00:0" + Math.floor(recordingSeconds / 60) + ":" + (recordingSeconds % 60 < 10 ? "0" : "") + (recordingSeconds % 60), w - 150, 43);

        const currentYear = new Date().getFullYear();
        ctx.fillText(`26 MEI ${currentYear}`, 40, h - 40);
        ctx.fillText("21:30:44", w - 100, h - 40);

        // Scanlines Overlay
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        for (let i = 0; i < h; i += 6) {
          ctx.fillRect(0, i, w, 2);
        }

      } else if (selectedFilter.type === "matrix") {
        ctx.filter = "none";
        // Green matrix code dripping rain
        ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
        ctx.font = "bold 10px monospace";
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 4;

        particlesMatrix.forEach((p) => {
          ctx.fillText(p.char, p.x, p.y);
          p.y += p.speed;
          if (p.y > h) {
            p.y = 0;
            p.x = Math.random() * w;
          }
        });
        ctx.shadowBlur = 0;

      } else if (selectedFilter.type === "funny-mask") {
        ctx.filter = "none";
        
        // Draw the cat whiskers and nose at user calibrated percentages
        const px = (maskX / 100) * w;
        const py = (maskY / 100) * h;
        const scale = maskScale * 50; // default whiskers scale factor

        // Glow pink details
        ctx.shadowColor = "#f43f5e";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#f43f5e"; // Pink cat nose
        ctx.beginPath();
        ctx.arc(px, py, 11 * maskScale, 0, Math.PI, false);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Whiskers left
        ctx.moveTo(px - 15, py + 2); ctx.lineTo(px - 15 - scale, py - 5);
        ctx.moveTo(px - 15, py + 5); ctx.lineTo(px - 15 - scale - 10, py + 5);
        ctx.moveTo(px - 15, py + 8); ctx.lineTo(px - 15 - scale, py + 15);
        // Whiskers right
        ctx.moveTo(px + 15, py + 2); ctx.lineTo(px + 15 + scale, py - 5);
        ctx.moveTo(px + 15, py + 5); ctx.lineTo(px + 15 + scale + 10, py + 5);
        ctx.moveTo(px + 15, py + 8); ctx.lineTo(px + 15 + scale, py + 15);
        ctx.stroke();

        // Little pink cute cat cheeks blush
        ctx.fillStyle = "rgba(244, 63, 94, 0.35)";
        ctx.beginPath();
        ctx.arc(px - 45 * maskScale, py + 12, 14 * maskScale, 0, Math.PI * 2);
        ctx.arc(px + 45 * maskScale, py + 12, 14 * maskScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
      }

      animationFrameIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [selectedFilter, recordingSeconds, maskX, maskY, maskScale]);

  const startCamera = async () => {
    try {
      setCameraError("");
      const constraints = {
        video: { width: 640, height: 480, facingMode: "user" },
        audio: audioEnabled
      };
      
      const userStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(userStream);
      if (videoRef.current) {
        videoRef.current.srcObject = userStream;
        videoRef.current.play().catch(e => console.warn("Video play stream blocked:", e));
      }
    } catch (err: any) {
      console.error("Camera permissions failed:", err);
      setCameraError(
        "Kamera tidak dapat diakses. Pastikan kamu sudah memberikan izin akses kamera dan mikrofon di browser kamu untuk mencoba rekam langsung."
      );
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!stream || !canvasRef.current) return;
    
    setRecordedUrl("");
    setRecordedBlob(null);
    recordedChunksRef.current = [];
    setRecordingSeconds(0);
    setIsRecording(true);

    // Capture dynamic filtered canvas stream rather than clean camera stream!
    const canvasStream = canvasRef.current.captureStream(30); 
    
    // Add audio track if audio is enabled
    if (audioEnabled) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        canvasStream.addTrack(audioTracks[0]);
      }
    }

    try {
      // Find suitable recorder mime types (H.264 video/webm is highly compatible across modern layouts)
      const options = { mimeType: "video/webm;codecs=vp8,opus" };
      const recorder = new MediaRecorder(canvasStream, options);
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullVideoBlob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        setRecordedBlob(fullVideoBlob);
        setRecordedUrl(URL.createObjectURL(fullVideoBlob));
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // chunk every second

      // Start recording countdown timer interval
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 179) { // At 180 seconds (3 minutes) stop automatically
            stopRecording();
            return 180;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (e) {
      console.error("Failed to start MediaRecorder:", e);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
  };

  const stopCameraAndAudio = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const triggerGenAiCaption = async () => {
    if (aiLoading) return;
    setAiLoading(true);

    try {
      const response = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filter: selectedFilter.name,
          music: selectedTrack ? `${selectedTrack.title} oleh ${selectedTrack.artist}` : "Suara Asli",
          prompt: caption || "Gaya hidup santai pakai filter rekam langsung"
        })
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();
      if (data.caption) {
        setCaption(data.caption);
      }
    } catch (e) {
      console.error("AI Caption generation failed:", e);
      setCaption(`Eksperimen filter keren ${selectedFilter.name} bareng sound: ${selectedTrack ? selectedTrack.title : 'Suara Asli'}! #fyp #viral #shortvideo`);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordedBlob) return;

    setIsPublishing(true);

    // Create a local virtual video item that represents this final recording
    const newVideo: Video = {
      id: "recorded-" + Date.now(),
      videoUrl: recordedUrl,
      caption: caption || `Mencoba filter ${selectedFilter.name} rekam langsung! #fyp #viral`,
      author: {
        name: "Pengguna (Kamu)",
        handle: "@kamu_kreator",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
      },
      music: {
        title: selectedTrack ? selectedTrack.title : "Suara Asli",
        artist: selectedTrack ? selectedTrack.artist : "Kamu",
        coverUrl: selectedTrack ? selectedTrack.coverUrl : "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=150"
      },
      likes: 0,
      commentsCount: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
      category: "Kreatif",
      createdAt: new Date().toISOString(),
      comments: [],
      filterApplied: selectedFilter.id
    };

    setTimeout(() => {
      onRecordSuccess(newVideo);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-xl text-white min-h-[85vh] p-4 sm:p-6 rounded-3xl border border-white/10 shadow-2xl shadow-black flex flex-col md:flex-row gap-6 animate-fade-in relative z-10" id="recorder-container">
      
      {/* Audio element for playing selected music during filming */}
      {selectedTrack && (
        <audio 
          ref={localAudioRef}
          src={selectedTrack.audioUrl}
          loop
          className="hidden"
        />
      )}

      {/* LEFT PORTION: STREAM AND WORKSPACE GRAPHICS */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
          <button 
            id="recorder-back-btn"
            onClick={() => {
              stopCameraAndAudio();
              onBack();
            }}
            className="flex items-center gap-1 text-xs font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-ping" : "bg-white/20"}`}></span>
            <span className="text-xs font-bold font-mono tracking-wider text-white/80">
              {Math.floor(recordingSeconds / 60)}:{recordingSeconds % 60 < 10 ? "0" : ""}{recordingSeconds % 60} / 3:00
            </span>
          </div>
        </div>

        {/* Live camera stream & Filter mapping blocks */}
        <div className="relative w-full aspect-[3/4] sm:aspect-[9/16] bg-black/40 max-h-[550px] rounded-3xl overflow-hidden border border-white/10 shadow-lg flex items-center justify-center">
          
          {/* Real standard video node streaming camera stream directly (invisible, feeding canvas) */}
          <video 
            ref={videoRef}
            className="hidden"
            playsInline
            muted
          />

          {/* Canvas Node drawing 60FPS filtered camera */}
          <canvas 
            ref={canvasRef}
            width={640}
            height={853} // Keeps 9:16 vertical ratio inside 480/640 boundaries
            className="w-full h-full object-cover rounded-3xl"
            id="canvas-active-filter"
          />

          {/* Calibration controls overlay for Funny Mask - only visible if Cat Filter is chosen */}
          {selectedFilter.type === "funny-mask" && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 max-w-sm w-[90%] bg-[#080808]/85 backdrop-blur-lg p-3.5 rounded-2xl border border-white/10 flex flex-col gap-2.5 shadow-xl">
              <p className="text-[11px] font-black uppercase text-red-400 tracking-wider text-center">🎯 Kalibrasi Kumis Kucing</p>
              
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="flex flex-col gap-1">
                  <span className="text-white/60">Posisi Kiri-Kanan:</span>
                  <input 
                    type="range" 
                    min="10" 
                    max="90" 
                    value={maskX} 
                    onChange={(e) => setMaskX(Number(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-white/60">Posisi Atas-Bawah:</span>
                  <input 
                    type="range" 
                    min="10" 
                    max="90" 
                    value={maskY} 
                    onChange={(e) => setMaskY(Number(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] border-t border-white/10 pt-2 text-white/40">
                <span>Ukuran Kumis:</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setMaskScale(prev => Math.max(0.5, prev - 0.1))} className="bg-white/10 text-white font-bold p-1 rounded hover:bg-white/20 w-5 h-5 text-center cursor-pointer">-</button>
                  <span className="font-mono text-white/80">{maskScale.toFixed(1)}x</span>
                  <button type="button" onClick={() => setMaskScale(prev => Math.min(2.0, prev + 0.1))} className="bg-white/10 text-white font-bold p-1 rounded hover:bg-white/20 w-5 h-5 text-center cursor-pointer">+</button>
                </div>
              </div>
            </div>
          )}

          {/* Recording overlay elements */}
          {isRecording && (
            <div className="absolute top-4 left-4 bg-red-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
              <Square className="w-2.5 h-2.5 fill-current" />
              RECORDING
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center">
              <AlertCircle className="text-red-500 w-12 h-12 mb-3 animate-bounce" />
              <h4 className="font-bold text-sm text-white">Akses Kamera Diperlukan</h4>
              <p className="text-xs text-white/55 mt-2 max-w-xs leading-relaxed">{cameraError}</p>
              <button 
                id="retry-camera-btn"
                onClick={startCamera} 
                className="mt-5 text-xs bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Berikan Izin Akses
              </button>
            </div>
          )}
        </div>

        {/* Trigger/Record buttons bar */}
        {!recordedUrl && (
          <div className="flex justify-center items-center gap-4 bg-white/5 p-4 border border-white/10 rounded-3xl backdrop-blur-md">
            <button
              id="audio-toggle-btn"
              type="button"
              onClick={() => {
                const newAudioState = !audioEnabled;
                setAudioEnabled(newAudioState);
                // Restart camera stream with new audio settings
                setTimeout(() => startCamera(), 100);
              }}
              className={`p-3 rounded-full border border-white/10 transition-all cursor-pointer ${
                audioEnabled 
                  ? "bg-white/10 text-white/80 hover:text-white hover:bg-white/20" 
                  : "bg-red-500/20 text-red-400 font-bold"
              }`}
              title={audioEnabled ? "Matikan Mikrofon" : "Aktifkan Mikrofon"}
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Huge primary record button */}
            <button
              id="record-trigger-btn"
              onClick={toggleRecording}
              disabled={!!cameraError}
              className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-black box-content transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                isRecording 
                  ? "bg-red-600 ring-4 ring-red-600/30 text-white animate-pulse" 
                  : "bg-white ring-4 ring-white/10 text-black hover:bg-zinc-100"
              }`}
            >
              {isRecording ? <Square className="w-6 h-6 fill-current" /> : <div className="w-6 h-6 rounded-full bg-red-600" />}
            </button>

            <button
              id="flip-cam-btn"
              type="button"
              onClick={startCamera}
              className="p-3 bg-white/10 border border-white/10 hover:bg-white/20 text-white/80 rounded-full transition-all cursor-pointer"
              title="Mulai Ulang Kamera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT PORTION: TIMELINE SELECTIONS & AI CONFIG */}
      <div className="w-full md:w-[350px] flex flex-col gap-5 justify-between">
        
        {recordedUrl ? (
          /* CASE A: Video is recorded, show descriptions & metadata configuration to post */
          <form onSubmit={handlePublish} className="flex flex-col gap-5 animate-scale-up h-full justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/25 p-3 rounded-2xl">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-4 h-4 text-center" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Rekaman Berhasil Disimpan!</p>
                  <p className="text-[10px] text-white/50">Durasi: {recordingSeconds} detik</p>
                </div>
              </div>

              {/* Video preview node */}
              <div className="relative aspect-[16/9] w-full bg-black/40 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                <video 
                  src={recordedUrl} 
                  controls 
                  loop
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  id="re-record-video-btn"
                  onClick={() => {
                    setRecordedUrl("");
                    setRecordedBlob(null);
                    setRecordingSeconds(0);
                    startCamera();
                  }}
                  className="absolute bottom-2 right-2 bg-black/80 hover:bg-red-500 text-white text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-colors border border-white/10 cursor-pointer"
                >
                  Rekam Ulang
                </button>
              </div>

              {/* Caption generation layout */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-black uppercase text-white/50 tracking-widest">Deskripsi Postingan</label>
                  <button
                    type="button"
                    id="rec-generate-caption-ai-btn"
                    onClick={triggerGenAiCaption}
                    disabled={aiLoading}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                      aiLoading 
                        ? "bg-white/5 text-white/30 border border-white/5" 
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/35 border border-red-500/20"
                    }`}
                  >
                    <Sparkles className={`w-3 h-3 ${aiLoading ? "animate-spin" : ""}`} />
                    {aiLoading ? "Memikir..." : "Koleksi Caption AI ✨"}
                  </button>
                </div>

                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ketik caption seru kamu, atau dapatkan ide caption gaul dari AI..."
                  maxLength={150}
                  className="w-full bg-white/5 border border-white/10 focus:border-red-500/50 rounded-xl p-3 text-xs outline-none resize-none h-24 text-white focus:ring-1 focus:ring-red-500/20 transition-all"
                />
              </div>

              {/* Info summary */}
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col gap-1 text-[11px] text-white/60">
                <p><span className="text-white/40">Filter Applied:</span> {selectedFilter.name}</p>
                <p><span className="text-white/40">Music Sync:</span> {selectedTrack ? `${selectedTrack.title} (${selectedTrack.artist})` : "Suara Asli Mic"}</p>
              </div>
            </div>

            {/* Form Action buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setRecordedUrl("");
                  setRecordedBlob(null);
                  setRecordingSeconds(0);
                  startCamera();
                }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white/80 border border-white/10 active:scale-95 cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                id="recorder-publish-btn"
                disabled={isPublishing}
                className="flex-[2] py-3 bg-red-500 hover:bg-red-600 rounded-xl text-xs font-black text-white shadow-lg shadow-red-500/20 justify-center items-center gap-1.5 flex active:scale-95 cursor-pointer"
              >
                {isPublishing ? "Sedang Memasang..." : "Posting ke FYP 🚀"}
              </button>
            </div>
          </form>
        ) : (
          /* CASE B: Video is NOT yet recorded, show Filter Selector and Sound Selector columns */
          <div className="flex flex-col gap-5 justify-between h-full">
            
            {/* Filter preset tabs scroll list */}
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Pilih Filter Wajah</p>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {FILTERS.map((f) => {
                  const isActive = selectedFilter.id === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFilter(f)}
                      className={`flex flex-col p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isActive 
                          ? "bg-red-500/15 border-red-500 text-red-400 font-bold" 
                          : "bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{f.emoji}</span>
                        <span className="text-[11px] font-bold truncate leading-none">{f.name}</span>
                      </div>
                      <span className="text-[9px] text-white/40 select-none mt-1 truncate">{f.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular Sound Overlay selection list */}
            <div>
              <p className="text-xs font-semibold text-white/50 tracking-widest mb-3 uppercase">Pilih Lagu Latar</p>
              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {/* Free Original Audio option */}
                <div 
                  onClick={() => setSelectedTrack(null)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                    selectedTrack === null 
                      ? "bg-red-500/15 border-red-500 text-red-500 font-bold" 
                      : "bg-white/5 border-white/10 text-white/75 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center text-white/50 text-xs border border-white/5">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="leading-none flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate">Suara Original Mic</p>
                    <p className="text-[9px] text-white/40 mt-0.5 truncate">Suara ambient sekitar</p>
                  </div>
                </div>

                {/* Popular lists */}
                {POPULAR_TRACKS.map((track) => {
                  const isActive = selectedTrack?.id === track.id;
                  return (
                    <div 
                      key={track.id}
                      onClick={() => setSelectedTrack(track)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                        isActive 
                          ? "bg-red-500/15 border-red-500 text-red-500 font-bold" 
                          : "bg-white/5 border-white/10 text-white/75 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <img 
                        src={track.coverUrl} 
                        alt={track.title}
                        className="w-8 h-8 rounded-md object-cover border border-white/10"
                      />
                      <div className="leading-none flex-1 min-w-0">
                        <p className="text-[11px] font-bold truncate">{track.title}</p>
                        <p className="text-[9px] text-white/50 mt-0.5 truncate">{track.artist}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instruction tooltip or hint */}
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex gap-2 text-[10px] text-white/60 leading-relaxed">
              <Camera className="w-4 h-4 text-red-500 flex-shrink-0 animate-pulse" />
              <span>
                <strong>Tips:</strong> Rekam video gokil berdurasi hingga 3 menit! Hasil rekaman langsung disematkan filter dan akan langsung masuk feed setelah dipublish.
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
