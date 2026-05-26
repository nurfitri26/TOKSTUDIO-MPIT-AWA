import React, { useState, useRef } from "react";
import { UploadCloud, FileVideo, Music, AlertTriangle, Sparkles, ArrowLeft, CheckCircle2 } from "lucide-react";
import { POPULAR_TRACKS } from "../data/music";
import { MusicTrack, Video } from "../types";

interface VideoUploadProps {
  onBack: () => void;
  onUploadSuccess: (video: Video) => void;
}

export default function VideoUpload({ onBack, onUploadSuccess }: VideoUploadProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [durationError, setDurationError] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [category, setCategory] = useState<string>("Gaya Hidup");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [isDoneUploaded, setIsDoneUploaded] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Format berkas harus berupa video.");
      return;
    }

    setDurationError("");
    const fileUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(fileUrl);
    setVideoFile(file);

    // Create a temporary video element to validate video duration
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = fileUrl;
    tempVideo.onloadedmetadata = () => {
      window.URL.revokeObjectURL(tempVideo.src);
      const videoLength = tempVideo.duration;
      setDuration(videoLength);

      // Enforce 3 minute limit (180 seconds)
      if (videoLength > 180) {
        setDurationError(
          `Durasi video kamu ${Math.round(videoLength)} detik (melebihi 3 menit / 180 detik). Sesuai aturan TikTok, silakan unggah video dengan durasi maksimal 3 menit.`
        );
      }
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
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
          filter: "original",
          music: selectedTrack ? `${selectedTrack.title} oleh ${selectedTrack.artist}` : "Suara Asli",
          prompt: caption || "Video pendek seru terbaru"
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
      // fallback
      setCaption(`Video seru hari ini! Musik: ${selectedTrack ? selectedTrack.title : 'Suara Asli'} #fyp #viral #shortvideo`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || durationError) return;

    // Create a real Blob URL that will remain active in this app-session
    const finalVideoUrl = URL.createObjectURL(videoFile);

    const newVideo: Video = {
      id: "uploaded-" + Date.now(),
      videoUrl: finalVideoUrl,
      caption: caption || "Konten video baru tanpa deskripsi. #fyp",
      author: {
        name: "Pengguna (Kamu)",
        handle: "@kamu_kreator",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
      },
      music: {
        title: selectedTrack ? selectedTrack.title : "Suara Asli",
        artist: selectedTrack ? selectedTrack.artist : "Kamu",
        coverUrl: selectedTrack ? selectedTrack.coverUrl : "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150"
      },
      likes: 0,
      commentsCount: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
      category: category,
      createdAt: new Date().toISOString(),
      comments: [],
      filterApplied: "none"
    };

    setIsDoneUploaded(true);
    setTimeout(() => {
      onUploadSuccess(newVideo);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-xl text-white min-h-[85vh] p-4 sm:p-8 rounded-3xl border border-white/10 shadow-2xl shadow-black animate-fade-in relative z-10" id="upload-panel-container">
      {/* Upper navigation */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <button 
          id="upload-back-btn"
          onClick={onBack}
          className="p-2 bg-white/10 border border-white/10 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Unggah Video <span className="text-xs bg-red-500 font-bold px-2.5 py-0.5 rounded-full uppercase">Maks 3 Mnt</span>
          </h2>
          <p className="text-xs text-white/55">Publikasikan video pendek kreatif kamu ke ekosistem feed FYP</p>
        </div>
      </div>

      {isDoneUploaded ? (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh] animate-scale-up" id="upload-success-state">
          <div className="p-4 bg-green-500/10 text-green-500 rounded-full mb-4 border border-green-500/25 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-white">Video Berhasil Diunggah!</h3>
          <p className="text-sm text-white/55 mt-2">Konten kamu sedang diproses dan ditambahkan langsung ke FYP Feed...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT: DROP ZONE AND PREVIEW (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Berkas Video</p>
            
            {videoPreviewUrl ? (
              <div className="relative w-full aspect-[9/16] bg-black/40 rounded-3xl overflow-hidden border-2 border-red-500 shadow-xl group">
                <video 
                   
                  ref={videoRef}
                  src={videoPreviewUrl} 
                  controls 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  id="reset-video-btn"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreviewUrl("");
                    setDuration(0);
                    setDurationError("");
                  }}
                  className="absolute top-4 right-4 bg-black/70 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                >
                  Ganti Video
                </button>
                
                {/* Meta details badge */}
                <div className="absolute bottom-4 left-4 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] flex gap-2 items-center font-mono text-white/80 border border-white/10">
                  <FileVideo className="w-3.5 h-3.5 text-red-500" />
                  <span>{Math.round(duration)} dtk</span>
                  <span className="text-white/20">|</span>
                  <span>{(videoFile!.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              </div>
            ) : (
              <div 
                id="dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[9/16] border-2 border-dashed border-white/10 hover:border-red-500/50 bg-white/5 hover:bg-red-500/[0.02] rounded-3xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group backdrop-blur-sm"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden" 
                  accept="video/*"
                />
                
                <div className="p-4 bg-white/10 border border-white/10 text-white/60 group-hover:text-red-500 group-hover:border-red-500/30 rounded-2xl mb-4 transition-all">
                  <UploadCloud className="w-8 h-8 group-hover:scale-110 duration-300" />
                </div>
                
                <h4 className="font-bold text-sm text-white">Seret & Taruh Berkas Video</h4>
                <p className="text-xs text-white/55 mt-1 max-w-[200px] leading-relaxed">Atau klik untuk menjelajahi berkas komputer kamu</p>
                <div className="mt-4 flex flex-col gap-1 items-center">
                  <span className="text-[10px] text-white/70 bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold border border-white/5">Resolusi 9:16 Disarankan</span>
                  <span className="text-[10px] text-white/40 font-mono mt-1">Maks 3 menit (180 detik)</span>
                </div>
              </div>
            )}

            {/* Duration Error block alert */}
            {durationError && (
              <div className="p-4 bg-red-500/15 border border-red-500/25 rounded-2xl flex gap-3 text-red-400 text-xs leading-relaxed">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 animate-pulse" />
                <span>{durationError}</span>
              </div>
            )}
          </div>

          {/* RIGHT: METADATA & CONFIG (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-6">
            
            {/* Caption Input with Gen AI Caption generator link */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-white/50 tracking-widest uppercase">Deskripsi & Caption</label>
                <button
                  type="button"
                  id="generate-caption-ai-btn"
                  onClick={triggerGenAiCaption}
                  disabled={aiLoading}
                  className={`flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full transition-all duration-300 cursor-pointer ${
                    aiLoading 
                      ? "bg-white/5 text-white/35" 
                      : "bg-red-500/20 text-red-400 hover:bg-red-500/35 border border-red-500/20"
                  }`}
                >
                  <Sparkles className={`w-3 h-3 ${aiLoading ? "animate-spin" : ""}`} />
                  {aiLoading ? "AI Berpikir..." : "Dapatkan Caption AI ✨"}
                </button>
              </div>

              <textarea 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Tuliskan deskripsi video pendek kamu, tambahkan #fyp #viral #indonesia..."
                maxLength={200}
                className="w-full bg-white/5 border border-white/10 focus:border-red-500/50 rounded-2xl p-4 text-sm outline-none resize-none h-28 text-white focus:ring-1 focus:ring-red-500/20 transition-all placeholder-white/30"
              />
              <div className="flex justify-between text-[11px] text-white/40 font-mono px-1">
                <span>Usahakan gunakan hashtag tren agar cepat FYP.</span>
                <span>{caption.length}/200</span>
              </div>
            </div>

            {/* Popular Sound Selection Overlay */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-white/50 tracking-widest uppercase flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-red-500" />
                Lapiskan Musik Latar Populer
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {/* Original Track option */}
                <div 
                  onClick={() => setSelectedTrack(null)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer select-none transition-all ${
                    selectedTrack === null 
                      ? "bg-red-500/15 border-red-500 text-red-400 font-bold font-sans" 
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="w-10 h-10 bg-white/10 border border-white/5 rounded-xl flex items-center justify-center text-white/60">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <div className="leading-tight flex-1">
                    <p className="text-xs font-bold truncate">Suara Asli Video</p>
                    <p className="text-[10px] text-white/40 truncate mt-0.5">Sesuai mic rekaman asli</p>
                  </div>
                </div>

                {/* Popular tracks lists */}
                {POPULAR_TRACKS.map((track) => (
                  <div 
                    key={track.id}
                    onClick={() => setSelectedTrack(track)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer select-none transition-all ${
                      selectedTrack?.id === track.id 
                        ? "bg-red-500/15 border-red-500 text-red-400 font-bold" 
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <img 
                      src={track.coverUrl} 
                      alt={track.title}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10"
                    />
                    <div className="leading-tight flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{track.title}</p>
                      <p className="text-[10px] text-white/50 truncate mt-0.5">{track.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category / Tema Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-white/50 tracking-widest uppercase">Kategori Konten</label>
              <div className="flex gap-2 flex-wrap">
                {["Gaya Hidup", "Seni & Estetika", "Teknologi", "Musik", "Komedian", "Edukasi"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      category === cat 
                        ? "bg-red-500 text-white border-red-500 font-bold" 
                        : "bg-white/5 hover:bg-white/10 text-white/75 border-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                id="cancel-upload-btn"
                onClick={onBack}
                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-full font-bold transition-all text-sm active:scale-95 text-center border border-white/10 cursor-pointer"
              >
                Batalkan
              </button>
              <button
                type="submit"
                id="submit-upload-btn"
                disabled={!videoFile || !!durationError}
                className={`flex-[2] py-3.5 rounded-full font-bold transition-all text-sm text-center flex justify-center items-center gap-2 cursor-pointer ${
                  videoFile && !durationError 
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg active:scale-95 cursor-pointer"
                    : "bg-white/5 text-white/25 hover:cursor-not-allowed border border-white/5"
                }`}
              >
                Publikasikan Video 🚀
              </button>
            </div>

          </div>

        </form>
      )}
    </div>
  );
}
