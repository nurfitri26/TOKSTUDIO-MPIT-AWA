import React, { useState } from "react";
import { Share2, Copy, Check, MessageCircle, Send, X, Facebook, Twitter, Link } from "lucide-react";
import { Video } from "../types";

interface ShareModalProps {
  video: Video;
  onClose: () => void;
}

const CONSTANT_MOCK_FRIENDS = [
  { id: "f-1", name: "Nabila Alifah", username: "@nabilakusuma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
  { id: "f-2", name: "Riko Beatmaker", username: "@rikobeat", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
  { id: "f-3", name: "Adit Acoustic", username: "@adit_guitar", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" },
  { id: "f-4", name: "Siti Rahma", username: "@sitirahm", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80" }
];

export default function ShareModal({ video, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [friendShared, setFriendShared] = useState<string[]>([]);
  const [shareText, setShareText] = useState("");

  const shareUrl = `${window.location.origin}?video=${video.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareThirdParty = (platform: "wa" | "fb" | "tw") => {
    let url = "";
    if (platform === "wa") {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `Lihat video pendek keren ini dari ${video.author.name}: ${video.caption} \n\nLink: ${shareUrl}`
      )}`;
    } else if (platform === "fb") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    } else if (platform === "tw") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `Lihat video pendek keren ini dari ${video.author.handle}! \nLink: ${shareUrl}`
      )}`;
    }
    window.open(url, "_blank");
  };

  const handleSendToFriend = (friendId: string) => {
    if (friendShared.includes(friendId)) return;
    setFriendShared((prev) => [...prev, friendId]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm p-4 animate-fade-in" id="share-modal-container">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Sheet Content */}
      <div 
        id="share-modal-card"
        className="relative w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/15 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 text-white transform transition-transform duration-300"
      >
        {/* Drag handle or visual line */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden"></div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Share2 className="text-red-500 w-5 h-5 animate-pulse" />
            Bagikan Video
          </h3>
          <button 
            id="share-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video info card preview */}
        <div className="flex gap-3 bg-white/5 p-3 rounded-2xl mb-6 border border-white/10">
          <img 
            src={video.author.avatar} 
            alt={video.author.name}
            className="w-10 h-10 rounded-full object-cover border border-red-500"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate text-white">{video.author.name}</p>
            <p className="text-xs text-white/50 truncate mt-0.5">{video.caption}</p>
          </div>
        </div>

        {/* Send to mock friends inside the workspace app */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-white/50 tracking-widest uppercase mb-3">Kirim ke Teman</p>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {CONSTANT_MOCK_FRIENDS.map((friend) => {
              const hasShared = friendShared.includes(friend.id);
              return (
                <div key={friend.id} className="flex flex-col items-center flex-shrink-0 w-20">
                  <div className="relative">
                    <img 
                      src={friend.avatar} 
                      alt={friend.name}
                      className={`w-12 h-12 rounded-full object-cover border-2 transition-all duration-300 ${
                        hasShared ? "border-green-500 scale-95 opacity-70" : "border-white/10 hover:border-red-500"
                      }`}
                    />
                    {hasShared && (
                      <span className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-0.5 text-[8px] font-bold shadow-md">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-white/80 truncate w-full text-center mt-1.5">{friend.name}</span>
                  <button
                    id={`send-friend-${friend.id}`}
                    onClick={() => handleSendToFriend(friend.id)}
                    disabled={hasShared}
                    className={`mt-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                      hasShared 
                        ? "bg-white/5 text-white/30 cursor-not-allowed" 
                        : "bg-red-500 hover:bg-red-600 text-white active:scale-95"
                    }`}
                  >
                    {hasShared ? "Terkirim" : "Kirim"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Share buttons row */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-white/50 tracking-widest uppercase mb-3">Bagikan Langsung</p>
          <div className="grid grid-cols-4 gap-3">
            <button
              id="share-wa-btn"
              onClick={() => shareThirdParty("wa")}
              className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <div className="p-2.5 bg-green-600/2 transition-colors text-green-400 rounded-xl mb-1.5">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[11px] font-medium text-white/80">WhatsApp</span>
            </button>

            <button
              id="share-fb-btn"
              onClick={() => shareThirdParty("fb")}
              className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <div className="p-2.5 bg-blue-600/2 transition-colors text-blue-400 rounded-xl mb-1.5">
                <Facebook className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[11px] font-medium text-white/80">Facebook</span>
            </button>

            <button
              id="share-tw-btn"
              onClick={() => shareThirdParty("tw")}
              className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <div className="p-2.5 bg-sky-600/2 transition-colors text-sky-400 rounded-xl mb-1.5">
                <Twitter className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[11px] font-medium text-white/80">Twitter</span>
            </button>

            <button
              id="share-copy-btn"
              onClick={copyToClipboard}
              className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <div className={`p-2.5 rounded-xl mb-1.5 transition-colors ${
                copied ? "bg-green-600/20 text-green-400" : "bg-red-500/20 text-red-500"
              }`}>
                {copied ? <Check className="w-5 h-5" /> : <Link className="w-5 h-5" />}
              </div>
              <span className="text-[11px] font-medium text-white/80">{copied ? "Disalin!" : "Salin Link"}</span>
            </button>
          </div>
        </div>

        {/* Share Link Input field block */}
        <div className="flex gap-2 bg-[#09090b]/60 p-2 border border-white/10 rounded-xl items-center">
          <input 
            type="text" 
            value={shareUrl} 
            readOnly 
            className="flex-1 bg-transparent border-none text-xs text-white/60 px-2 outline-none select-all font-mono truncate"
          />
          <button
            id="share-copy-input-btn"
            onClick={copyToClipboard}
            className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 transition-colors rounded-lg text-xs font-bold active:scale-95 whitespace-nowrap"
          >
            {copied ? "Disalin!" : "Salin"}
          </button>
        </div>
      </div>
    </div>
  );
}
