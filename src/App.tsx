import React, { useState, useEffect } from "react";
import { Sparkles, Video, UploadCloud, Film, Bookmark, ChevronDown, ChevronUp, Share2, Music, Flame } from "lucide-react";
import { INITIAL_VIDEOS } from "./data/videos";
import { Video as VideoType, Comment } from "./types";
import VideoPlayer from "./components/VideoPlayer";
import VideoRecorder from "./components/VideoRecorder";
import VideoUpload from "./components/VideoUpload";
import ShareModal from "./components/ShareModal";

export default function App() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [activeTab, setActiveTab] = useState<"fyp" | "rekam" | "unggah" | "saved">("fyp");
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [sharingVideo, setSharingVideo] = useState<VideoType | null>(null);
  
  // Bookmarked video modal player focus
  const [savedFocusedVideo, setSavedFocusedVideo] = useState<VideoType | null>(null);

  // Initialize videos from preloaded data
  useEffect(() => {
    // Check if there are local videos in localStorage
    const cached = localStorage.getItem("tiktok-videos");
    if (cached) {
      try {
        setVideos(JSON.parse(cached));
      } catch (e) {
        setVideos(INITIAL_VIDEOS);
      }
    } else {
      setVideos(INITIAL_VIDEOS);
    }
  }, []);

  // Sync to local storage on edits
  const saveToCache = (updatedVideos: VideoType[]) => {
    setVideos(updatedVideos);
    localStorage.setItem("tiktok-videos", JSON.stringify(updatedVideos));
  };

  const handleLikeToggle = (id: string) => {
    const updated = videos.map((v) => {
      if (v.id === id) {
        const nextLiked = !v.isLiked;
        return {
          ...v,
          isLiked: nextLiked,
          likes: nextLiked ? v.likes + 1 : v.likes - 1
        };
      }
      return v;
    });
    saveToCache(updated);
  };

  const handleBookmarkToggle = (id: string) => {
    const updated = videos.map((v) => {
      if (v.id === id) {
        return {
          ...v,
          isBookmarked: !v.isBookmarked
        };
      }
      return v;
    });
    saveToCache(updated);
  };

  const handleAddComment = (videoId: string, comment: Comment) => {
    const updated = videos.map((v) => {
      if (v.id === videoId) {
        return {
          ...v,
          comments: [...v.comments, comment],
          commentsCount: v.commentsCount + 1
        };
      }
      return v;
    });
    saveToCache(updated);
  };

  const handleAddAiComments = (videoId: string, comments: Comment[]) => {
    const updated = videos.map((v) => {
      if (v.id === videoId) {
        return {
          ...v,
          comments: [...v.comments, ...comments],
          commentsCount: v.commentsCount + comments.length
        };
      }
      return v;
    });
    saveToCache(updated);
  };

  const handlePublishNewVideo = (newVideo: VideoType) => {
    const updated = [newVideo, ...videos];
    saveToCache(updated);
    setActiveVideoIndex(0); // focus on newly created video
    setActiveTab("fyp"); // return to streaming feed
  };

  const handleNextVideo = () => {
    if (activeVideoIndex < videos.length - 1) {
      setActiveVideoIndex((prev) => prev + 1);
    }
  };

  const handlePrevVideo = () => {
    if (activeVideoIndex > 0) {
      setActiveVideoIndex((prev) => prev - 1);
    }
  };

  // Filter bookmarked clips for the Koleksi Disimpan panel
  const bookmarkedVideos = videos.filter((v) => v.isBookmarked);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white font-sans flex flex-col selection:bg-red-500 selection:text-white relative overflow-hidden" id="main-applet-root">
      
      {/* Frosted Glass ambient gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#1a0b2e] via-[#050505] to-[#2e0b1a] z-0 opacity-80 pointer-events-none"></div>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-purple-600/15 rounded-full blur-[100px] sm:blur-[130px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-red-600/15 rounded-full blur-[100px] sm:blur-[130px]" />
      </div>

      {/* 1. TOP GLOBAL NAVIGATION HEADER */}
      <header className="sticky top-0 z-45 backdrop-blur-md bg-white/5 border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between">
        
        {/* Branding Logo */}
        <div 
          onClick={() => setActiveTab("fyp")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-white/5 group-hover:scale-105 duration-300">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black tracking-tighter flex items-center gap-1 leading-none text-white uppercase bg-clip-text">
              TOKSTUDIO <span className="text-[9px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-sm shrink-0 font-mono font-normal tracking-wide normal-case">LITE</span>
            </h1>
            <p className="text-[9px] text-white/50 leading-none mt-1 font-mono tracking-wider uppercase">Dunia Kreativitas Indonesia</p>
          </div>
        </div>

        {/* Middle Navigation Tabs (Horizontal Desk version) */}
        <nav className="flex items-center gap-1 bg-white/5 p-1 border border-white/10 rounded-full backdrop-blur-md">
          <button
            id="tab-fyp-btn"
            onClick={() => setActiveTab("fyp")}
            className={`px-4.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "fyp" 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>FYP Feed</span>
          </button>

          <button
            id="tab-rekam-btn"
            onClick={() => setActiveTab("rekam")}
            className={`px-4.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "rekam" 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Rekam Wajah</span>
          </button>

          <button
            id="tab-unggah-btn"
            onClick={() => setActiveTab("unggah")}
            className={`px-4.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "unggah" 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Unggah Video</span>
          </button>

          <button
            id="tab-saved-btn"
            onClick={() => setActiveTab("saved")}
            className={`px-4.5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "saved" 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Disimpan</span>
            {bookmarkedVideos.length > 0 && (
              <span className="w-4.5 h-4.5 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center shrink-0">
                {bookmarkedVideos.length}
              </span>
            )}
          </button>
        </nav>

        {/* Current Date Indicators for clean UI */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-bold text-white/50 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
          <span>UTC</span>
          <span className="text-white">2026-05-26</span>
        </div>

      </header>

      {/* 2. CORE WORKSPACE AREA */}
      <main className="flex-1 flex flex-col py-4 md:py-6 px-4 items-center justify-center relative z-10">
        
        {/* CASE A: FYP MODE - Vertical Short video player list */}
        {activeTab === "fyp" && (
          <div className="w-full max-w-sm flex flex-col items-center gap-4 relative animate-fade-in" id="fyp-feed-container">
            {videos.length === 0 ? (
              <div className="py-24 text-center text-white/50 border border-white/10 rounded-3xl p-6 bg-white/5 backdrop-blur-xl">
                <Film className="w-10 h-10 mx-auto text-red-500 mb-3 animate-pulse" />
                <p className="font-bold text-sm text-white">Belum ada video di upload</p>
                <p className="text-xs text-white/40 mt-2">Mulai rekam wajah kamu atau unggah berkas video baru!</p>
              </div>
            ) : (
              <>
                {/* Scroll Snapping Feed element */}
                <div className="w-full flex justify-center">
                  <VideoPlayer
                    video={videos[activeVideoIndex]}
                    isActive={true}
                    onLikeToggle={handleLikeToggle}
                    onBookmarkToggle={handleBookmarkToggle}
                    onAddComment={handleAddComment}
                    onAddAiComments={handleAddAiComments}
                    onShareClick={(v) => setSharingVideo(v)}
                  />
                </div>

                {/* Vertical Keyboard accessibility/interactive buttons overlay */}
                <div 
                  id="feed-scroller-utils" 
                  className="absolute -right-16 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 z-30"
                >
                  <button
                    id="prev-video-util"
                    onClick={handlePrevVideo}
                    disabled={activeVideoIndex === 0}
                    className={`p-3 rounded-full border backdrop-blur-md transition-all cursor-pointer ${
                      activeVideoIndex === 0 
                        ? "bg-white/5 text-white/20 border-white/10 cursor-not-allowed" 
                        : "bg-white/10 text-white border-white/25 hover:bg-white/20 active:scale-95"
                    }`}
                    title="Sebelumnya"
                  >
                    <ChevronUp className="w-5 h-5 text-center" />
                  </button>

                  <div className="text-[11px] text-white/60 font-mono text-center font-bold">
                    {activeVideoIndex + 1} / {videos.length}
                  </div>

                  <button
                    id="next-video-util"
                    onClick={handleNextVideo}
                    disabled={activeVideoIndex === videos.length - 1}
                    className={`p-3 rounded-full border backdrop-blur-md transition-all cursor-pointer ${
                      activeVideoIndex === videos.length - 1 
                        ? "bg-white/5 text-white/20 border-white/10 cursor-not-allowed" 
                        : "bg-white/10 text-white border-white/25 hover:bg-white/20 active:scale-95"
                    }`}
                    title="Selanjutnya"
                  >
                    <ChevronDown className="w-5 h-5 text-center" />
                  </button>
                </div>

                {/* Handheld scroll swipe tip (only visible at feed start) */}
                {activeVideoIndex === 0 && (
                  <div className="animate-bounce absolute bottom-2 flex flex-col items-center bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-none z-10 text-[10px] font-bold text-white">
                    <span>Scroll ke bawah atau tekan panah untuk video lain ✨</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* CASE B: REKAM MODE - Web Camera and Programmable canvas drawing filter system */}
        {activeTab === "rekam" && (
          <VideoRecorder 
            onBack={() => setActiveTab("fyp")}
            onRecordSuccess={handlePublishNewVideo}
          />
        )}

        {/* CASE C: UNGGAH MODE - drag, drop, and metadata video validator */}
        {activeTab === "unggah" && (
          <VideoUpload 
            onBack={() => setActiveTab("fyp")}
            onUploadSuccess={handlePublishNewVideo}
          />
        )}

        {/* CASE D: SAVED VIDEOS - grid bento display */}
        {activeTab === "saved" && (
          <div className="w-full max-w-4xl p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl min-h-[70vh] animate-fade-in relative z-10 shadow-2xl" id="saved-bento-grid-root">
            <div className="flex justify-between items-center mb-6 px-2">
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-red-500 animate-pulse fill-current" />
                  Koleksi Disimpan ({bookmarkedVideos.length})
                </h3>
                <p className="text-xs text-white/50">Video-video pendek favorit kamu yang telah disimpan</p>
              </div>
            </div>

            {bookmarkedVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center h-full">
                <div className="p-4 bg-white/5 text-white/40 rounded-full mb-4 border border-white/10">
                  <Bookmark className="w-8 h-8" />
                </div>
                <p className="font-bold text-white/70 text-sm">Belum ada koleksi tersimpan</p>
                <p className="text-xs text-white/40 mt-1 max-w-xs leading-relaxed">Ketuk ikon simpan (pita bendera) di pojok kanan video player FYP untuk menyimpan konten favorit kamu!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2">
                {bookmarkedVideos.map((video) => (
                  <div 
                    key={video.id}
                    onClick={() => setSavedFocusedVideo(video)}
                    className="relative aspect-[9/16] bg-black/40 border border-white/10 rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:border-red-500/50 transition-all hover:-translate-y-1 hover:shadow-red-500/5"
                  >
                    {/* Render visual preview block, or fallback placeholder stream */}
                    <video 
                      src={video.videoUrl} 
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                    
                    {/* Dark gradient blur footer for subtitles */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-3">
                      <span className="text-[9px] bg-red-500 text-white font-bold font-mono px-2 py-0.5 rounded-md inline-block w-max mb-1">{video.category}</span>
                      <p className="font-bold text-xs truncate text-white">{video.author.name}</p>
                      <p className="text-[10px] text-white/60 truncate mt-0.5">{video.caption}</p>
                    </div>

                    {/* Floating views metrics hover style */}
                    <div className="absolute top-2 left-2 bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-bold text-white border border-white/10 flex gap-1 items-center">
                      <Flame className="w-3.5 h-3.5 text-red-500" />
                      <span>{video.likes} likes</span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 3. MODAL FOR VIDEO SHARING */}
      {sharingVideo && (
        <ShareModal 
          video={sharingVideo} 
          onClose={() => setSharingVideo(null)} 
        />
      )}

      {/* 4. MODAL FOR BOOKMARKED VIDEO PLAY FOCUS LISTENER */}
      {savedFocusedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" id="saved-focused-player-box">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={() => setSavedFocusedVideo(null)}></div>
          <div className="relative w-full max-w-sm bg-white/5 backdrop-blur-2xl p-2 rounded-[44px] border border-white/20 z-10 shadow-2xl">
            
            {/* Close button */}
            <button
              id="close-saved-focused-player-btn"
              onClick={() => setSavedFocusedVideo(null)}
              className="absolute top-4 right-4 z-40 p-2 bg-black/80 hover:bg-red-500 text-white rounded-full transition-colors border border-white/10 cursor-pointer"
            >
              x
            </button>

            <VideoPlayer
              video={savedFocusedVideo}
              isActive={true}
              onLikeToggle={handleLikeToggle}
              onBookmarkToggle={handleBookmarkToggle}
              onAddComment={handleAddComment}
              onAddAiComments={handleAddAiComments}
              onShareClick={(v) => setSharingVideo(v)}
            />
          </div>
        </div>
      )}

      {/* 5. TIKTOK BRANDED BOTTOM GLOBAL FOOTER */}
      <footer className="relative z-10 bg-white/5 border-t border-white/10 py-4.5 text-center text-[10px] text-white/40 tracking-wider flex justify-center items-center gap-2 font-mono">
        <span>© 2026 TOKSTUDIO VIDEO PENDEK LITE</span>
        <span className="text-white/20">•</span>
        <span className="text-red-400">POWERED BY GEMINI AI</span>
      </footer>

    </div>
  );
}
