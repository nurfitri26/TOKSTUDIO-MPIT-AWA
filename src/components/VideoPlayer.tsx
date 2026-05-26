import React, { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, Music, Bookmark, Play, Pause, AlertCircle, Volume2, VolumeX, Sparkles, AlertOctagon } from "lucide-react";
import { Video, Comment } from "../types";
import CommentsModal from "./CommentsModal";
import ShareModal from "./ShareModal";

interface VideoPlayerProps {
  video: Video;
  isActive: boolean;
  onLikeToggle: (id: string) => void;
  onBookmarkToggle: (id: string) => void;
  onAddComment: (id: string, comment: Comment) => void;
  onAddAiComments: (id: string, comments: Comment[]) => void;
  onShareClick: (video: Video) => void;
}

export default function VideoPlayer({
  video,
  isActive,
  onLikeToggle,
  onBookmarkToggle,
  onAddComment,
  onAddAiComments,
  onShareClick
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [heartPops, setHeartPops] = useState<{ id: number; x: number; y: number }[]>([]);
  const [showComments, setShowComments] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fallbackIntervalRef = useRef<number | null>(null);

  // Play/Pause effect based on IntersectionObserver or Active State
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive) {
      setIsPlaying(true);
      videoEl.play().catch((e) => {
        console.warn("Autoplay block or loading warning:", e);
        // Toggle on mute fallback
        videoEl.muted = true;
        setIsMuted(true);
        videoEl.play().catch(() => {
          // If completely blocked or CORS issue, trigger visualizer fallback
          setHasError(true);
        });
      });
    } else {
      setIsPlaying(false);
      videoEl.pause();
    }
  }, [isActive]);

  // Handle Play/Pause toggle on click
  const togglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isPlaying) {
      videoEl.pause();
      setIsPlaying(false);
    } else {
      videoEl.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn("Playback failed:", e);
        setHasError(true);
      });
    }
  };

  // Double tap to like face filter trigger
  const lastTapRef = useRef<number>(0);
  const handleVideoTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const currentTime = Date.now();
    const tapLength = currentTime - lastTapRef.current;
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      handleDoubleTap(e);
    } else {
      // Single tap -> Play / pause toggle
      togglePlay();
    }
    lastTapRef.current = currentTime;
  };

  const handleDoubleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Trigger like if not already liked
    if (!video.isLiked) {
      onLikeToggle(video.id);
    }

    // Add heart pop element coordinate
    const heartId = Date.now();
    setHeartPops((prev) => [...prev, { id: heartId, x, y }]);
    setTimeout(() => {
      setHeartPops((prev) => prev.filter((h) => h.id !== heartId));
    }, 800);
  };

  // Direct click sound toggle
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const nextMuted = !isMuted;
    videoEl.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  // Fallback programmatic lofi audio waves canvas animation in case video CORS fails
  useEffect(() => {
    if (!hasError || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const barsCount = 20;
    const heights = Array(barsCount).fill(0).map(() => Math.random() * 80 + 20);

    const drawFallback = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      
      // Clean canvas with deep ambient space
      ctx.fillStyle = "#0c0a09"; // Stone 950
      ctx.fillRect(0, 0, w, h);

      // Create glowing gradient circle in background
      const grad = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, 160);
      grad.addColorStop(0, "rgba(244, 63, 94, 0.15)"); // rose
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(w/2, h/2, 180, 0, Math.PI * 2);
      ctx.fill();

      // Draw bouncing audio bars
      ctx.fillStyle = "rgba(244, 63, 94, 0.65)"; // rose color
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 10;
      const barWidth = 6;
      const gap = 4;
      const totalWidth = (barWidth + gap) * barsCount - gap;
      const startX = (w - totalWidth) / 2;

      for (let i = 0; i < barsCount; i++) {
        const peak = heights[i];
        // bounce height softly with sine wave
        const height = peak + Math.sin(frame * 0.12 + i) * 15;
        const xVal = startX + i * (barWidth + gap);
        const yVal = h / 2 - height / 2;
        ctx.fillRect(xVal, yVal, barWidth, height);
      }
      ctx.shadowBlur = 0;

      // Pulse circular beat ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 90 + Math.sin(frame * 0.08) * 10, 0, Math.PI * 2);
      ctx.stroke();

      // Floating dust particles
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      for (let j = 0; j < 12; j++) {
        const ox = w/2 + Math.cos(frame * 0.01 + j * 0.6) * (110 + j*4);
        const oy = h/2 + Math.sin(frame * 0.015 + j * 0.6) * (110 + j*4);
        ctx.beginPath();
        ctx.arc(ox, oy, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Warn Text Info
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText("Format Media Enkripsi - Memutar Visualizer Audio ✨", w / 2 - 135, h - 80);
      
      fallbackIntervalRef.current = requestAnimationFrame(drawFallback);
    };

    drawFallback();

    return () => {
      if (fallbackIntervalRef.current) {
        cancelAnimationFrame(fallbackIntervalRef.current);
      }
    };
  }, [hasError]);

  return (
    <div 
      className="relative w-full h-[78vh] sm:h-[82vh] md:h-[85vh] aspect-[9/16] bg-[#1a1a1a] rounded-[40px] overflow-hidden shadow-2xl shadow-black border-[12px] border-white/5 flex items-center justify-center snap-start" 
      id={`video-player-root-${video.id}`}
    >
      
      {/* Video element capture node */}
      {!hasError ? (
        <video
          ref={videoRef}
          src={video.videoUrl}
          onClick={togglePlay}
          onDoubleClick={handleDoubleTap}
          loop
          playsInline
          muted={isMuted}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover cursor-pointer"
        />
      ) : (
        /* Canvas Fallback Node playing particles visualizer in case of load fails */
        <canvas 
          ref={canvasRef}
          onClick={handleDoubleTap}
          width={400}
          height={711}
          className="w-full h-full object-cover cursor-pointer"
          id={`fallback-canvas-${video.id}`}
        />
      )}

      {/* Double tap Heart elements container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {heartPops.map((heart) => (
          <div
            key={heart.id}
            style={{ left: heart.x, top: heart.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-heart-pop text-rose-500 scale-[2]"
          >
            <Heart className="w-12 h-12 fill-current filter drop-shadow-[0_4px_12px_rgba(244,63,94,0.7)]" />
          </div>
        ))}
      </div>

      {/* Audio Mute status overlay notification badge */}
      <button
        id={`mute-toggle-${video.id}`}
        onClick={toggleMute}
        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/15 text-white/80 hover:text-white transition-all scale-95 cursor-pointer z-20"
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400" />}
      </button>

      {/* Play/Pause state indicator popup */}
      {!isPlaying && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/25 cursor-pointer"
        >
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/15 scale-110 animate-fade-in">
            <Play className="w-8 h-8 fill-current ml-1 text-red-500" />
          </div>
        </div>
      )}

      {/* RIGHT-SIDE TIKTOK INTERACTION UTILS BAR */}
      <div 
        id={`interactions-sidemenu-${video.id}`} 
        className="absolute right-3.5 bottom-20 flex flex-col items-center gap-4.5 z-20"
      >
        
        {/* Author custom avatar with badge */}
        <div className="flex flex-col items-center">
          <div className="relative border-2 border-red-500 rounded-full p-0.5 bg-black">
            <img 
              src={video.author.avatar} 
              alt={video.author.name}
              className="w-11 h-11 rounded-full object-cover"
            />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold font-sans">
              +
            </span>
          </div>
        </div>

        {/* LIKES element */}
        <button
          id={`like-btn-${video.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onLikeToggle(video.id);
          }}
          className="flex flex-col items-center gap-1 hover:scale-105 active:scale-95 transition-all text-center cursor-pointer group"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${
            video.isLiked 
              ? "bg-red-500 border-red-500/50 text-white shadow-lg shadow-red-500/30" 
              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
          }`}>
            <Heart className={`w-5 h-5 ${video.isLiked ? "fill-current" : ""}`} />
          </div>
          <span className="text-[10px] font-bold font-mono tracking-wide text-white/70">{video.likes}</span>
        </button>

        {/* COMMENTS count element */}
        <button
          id={`comments-drawer-open-${video.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setShowComments(true);
          }}
          className="flex flex-col items-center gap-1 hover:scale-105 active:scale-95 transition-all text-center cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md text-white hover:bg-white/20 transition-all">
            <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold font-mono tracking-wide text-white/70">{video.comments.length}</span>
        </button>

        {/* BOOKMARKS state */}
        <button
          id={`bookmark-btn-${video.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkToggle(video.id);
          }}
          className="flex flex-col items-center gap-1 hover:scale-105 active:scale-95 transition-all text-center cursor-pointer"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${
            video.isBookmarked 
              ? "bg-red-500 border-red-500/50 text-white shadow-lg shadow-red-500/30" 
              : "bg-white/10 border-white/20 text-white hover:bg-white/20"
          }`}>
            <Bookmark className={`w-5 h-5 ${video.isBookmarked ? "fill-current" : ""}`} />
          </div>
          <span className="text-[10px] font-bold font-mono tracking-wide text-white/70">
            {video.isBookmarked ? "Disimpan" : "Simpan"}
          </span>
        </button>

        {/* SHARING drawer */}
        <button
          id={`share-drawer-open-${video.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onShareClick(video);
          }}
          className="flex flex-col items-center gap-1 hover:scale-105 active:scale-95 transition-all text-center cursor-pointer"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md text-white hover:bg-white/20 transition-all">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold font-mono tracking-wide text-white/70">Bagikan</span>
        </button>

        {/* SPINNING MUSIC VINYL DISC */}
        <div className="flex flex-col items-center mt-2.5">
          <div className={`w-9 h-9 rounded-full bg-[#1e1e1e] border-2 border-zinc-800 p-1 shadow-md shrink-0 flex items-center justify-center ${
            isPlaying ? "animate-spin-slow duration-[4s]" : ""
          }`}>
            <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center border border-zinc-700 relative">
              <span className="text-[8px]">💿</span>
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM OVERLAY INFO: AUTHOR & CAPTIONS */}
      <div 
        id={`captions-overlay-${video.id}`} 
        className="absolute bottom-0 left-0 right-14 p-4.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10 text-white pointer-events-none"
      >
        <span className="px-2 py-0.5 bg-red-500 text-[10px] font-bold rounded mb-2 inline-block font-mono text-white">
          {video.category}
        </span>
        
        <h4 className="font-extrabold text-sm flex items-center gap-1.5 leading-none">
          {video.author.name}
          <span className="text-white/60 font-mono text-xs font-normal">{video.author.handle}</span>
        </h4>
        
        {/* Overflow wrap auto scroll or multi line style */}
        <p className="text-xs text-white/90 mt-2 font-sans font-medium leading-relaxed select-all pointer-events-auto">
          {video.caption}
        </p>

        {/* Sliding Music marquee soundtrack ticker */}
        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-red-400 font-semibold truncate max-w-xs">
          <Music className="w-3.5 h-3.5 animate-pulse flex-shrink-0" />
          <div className="overflow-hidden relative w-full h-4">
            <span className="absolute whitespace-nowrap animate-marquee">
              {video.music.title} — {video.music.artist} • Suara Asli
            </span>
          </div>
        </div>
      </div>

      {/* COMMENTS SHEET MODULE PORTAL */}
      {showComments && (
        <CommentsModal 
          video={video}
          onClose={() => setShowComments(false)}
          onAddComment={(comment) => onAddComment(video.id, comment)}
          onAddAiComments={(comments) => onAddAiComments(video.id, comments)}
        />
      )}

    </div>
  );
}
