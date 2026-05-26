import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, MessageCircleCode } from "lucide-react";
import { Video, Comment } from "../types";

interface CommentsModalProps {
  video: Video;
  onClose: () => void;
  onAddComment: (comment: Comment) => void;
  onAddAiComments: (comments: Comment[]) => void;
}

export default function CommentsModal({ 
  video, 
  onClose, 
  onAddComment, 
  onAddAiComments 
}: CommentsModalProps) {
  const [newCommentText, setNewCommentText] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on initial open
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [video.comments.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const myComment: Comment = {
      id: "comment-user-" + Date.now(),
      author: "Kamu (Kreator)",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      text: newCommentText.trim(),
      timestamp: "Baru saja"
    };

    onAddComment(myComment);
    setNewCommentText("");
  };

  const handleGenerateAiComments = async () => {
    if (aiGenerating) return;
    setAiGenerating(true);

    try {
      const response = await fetch("/api/generate-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: video.caption,
          author: video.author.name
        })
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();
      if (data.comments && data.comments.length > 0) {
        onAddAiComments(data.comments);
      }
    } catch (e) {
      console.error("Failed to generate AI comments:", e);
      // Fail gracefully: add a mock local positive comment if server failed
      const mockFailover: Comment = {
        id: "comment-failover-" + Date.now(),
        author: "Penonton Setia",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
        text: "Keren videonya kak! Ditunggu konten lirik sound ini selanjutnya sukses selalu yah! 🙌🙌",
        timestamp: "Baru saja"
      };
      onAddAiComments([mockFailover]);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-sm animate-fade-in" id="comments-modal-container">
      {/* Tap out backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Sheet panel */}
      <div 
        id="comments-sheet-card"
        className="relative w-full max-w-lg bg-white/5 backdrop-blur-2xl border-t border-white/15 rounded-t-[32px] shadow-2xl z-10 flex flex-col h-[70vh] sm:h-[65vh] text-white"
      >
        {/* Grab bar */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-3.5"></div>

        {/* Header split */}
        <div className="flex justify-between items-center px-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-widest text-white/50 uppercase">Komentar</span>
            <span className="bg-white/10 text-white font-mono text-xs px-2.5 py-0.5 rounded-full font-bold border border-white/10">
              {video.comments.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Generate AI Comments trigger */}
            <button
              id="generate-ai-comments-btn"
              onClick={handleGenerateAiComments}
              disabled={aiGenerating}
              className={`flex items-center gap-1.5 text-xs font-bold py-1 px-3.5 rounded-full cursor-pointer select-none transition-all duration-300 ${
                aiGenerating 
                  ? "bg-white/5 text-white/30 border border-white/5" 
                  : "bg-red-500/20 text-red-400 hover:bg-red-500/35 border border-red-500/30 shadow-xs shadow-red-500/10 animate-pulse"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiGenerating ? "animate-spin" : ""}`} />
              {aiGenerating ? "AI Berpikir..." : "Simulasikan Komentar AI"}
            </button>

            <button 
              id="comments-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comments scrolling scroll view */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
          {video.comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <div className="p-4 bg-white/5 rounded-full mb-3 text-white/40 border border-white/10 animate-pulse">
                <MessageCircleCode className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-white/70">Belum ada komentar</p>
              <p className="text-xs text-white/40 mt-1">Jadilah yang pertama mengomentari video ini!</p>
              
              <button
                id="comment-placeholder-ai-btn"
                onClick={handleGenerateAiComments}
                className="mt-4 text-xs font-bold text-red-400 border border-red-500/30 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
              >
                Pancing Komentar dengan AI ✨
              </button>
            </div>
          ) : (
            video.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 hover:bg-white/5 p-2 rounded-2xl transition-colors group">
                <img 
                  src={comment.avatar} 
                  alt={comment.author} 
                  className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white/80">{comment.author}</span>
                    <span className="text-[10px] text-white/40 font-mono">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-white/75 mt-1 leading-relaxed break-words">{comment.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Submit Comment Input bar form footer */}
        <form 
          onSubmit={handleSubmit}
          className="p-4.5 border-t border-white/10 bg-[#0d0d0d]/80 backdrop-blur-md flex gap-2.5 items-center"
        >
          <input 
            type="text" 
            placeholder="Ketik komentar santai..." 
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/15 text-sm border border-white/10 rounded-full px-5 py-3 outline-none text-white placeholder-white/30 focus:ring-1 focus:ring-red-500/50 transition-all font-sans"
            maxLength={250}
          />
          <button 
            id="comments-submit-btn"
            type="submit"
            disabled={!newCommentText.trim()}
            className={`p-3 rounded-full transition-all flex items-center justify-center ${
              newCommentText.trim() 
                ? "bg-red-500 hover:bg-red-600 text-white active:scale-95 shadow-lg shadow-red-500/20 text-center" 
                : "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4 text-center text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
