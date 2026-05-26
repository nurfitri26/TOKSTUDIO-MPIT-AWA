import { Video } from "../types";

export const INITIAL_VIDEOS: Video[] = [
  {
    id: "video-1",
    videoUrl: "https://player.vimeo.com/external/435674703.sd.mp4?s=7fdf7c315e9821bf6d15668e82ef620e23117ae8&profile_id=165&oauth2_token_id=57447761",
    caption: "Mencoba filter baru hari ini! Suka banget sama feel-nya ✨ #fyp #aesthetic #viral #pagi",
    author: {
      name: "Nabila Alifah",
      handle: "@nabilakusuma",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    },
    music: {
      title: "Senja dan Kopi",
      artist: "Adit & The Acoustic",
      coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=80"
    },
    likes: 1240,
    commentsCount: 38,
    shares: 450,
    isLiked: false,
    isBookmarked: false,
    category: "Gaya Hidup",
    createdAt: "2026-05-25T14:22:00Z",
    comments: [
      {
        id: "c-1",
        author: "Andi Wijaya",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        text: "Keren bgt kak filter-nya! Sangat aesthetic 😍",
        timestamp: "2 jam yang lalu"
      },
      {
        id: "c-2",
        author: "Siti Rahma",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
        text: "Lagu latar-nya adem banget cocok sama videonya",
        timestamp: "1 jam yang lalu"
      }
    ]
  },
  {
    id: "video-2",
    videoUrl: "https://player.vimeo.com/external/403816518.sd.mp4?s=d00bbd5e1dc865b263b65d5df2f073fa8b7a4f78&profile_id=139&oauth2_token_id=57447761",
    caption: "Cyberpunk filter on public street! Berasa masuk ke dunia masa depan ⚡🌃 #cyberpunk #neon #future #vibes",
    author: {
      name: "Riko Beatmaker",
      handle: "@rikobeat",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    music: {
      title: "DJ Remix Santai Slow",
      artist: "Riko Beatmaker",
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80"
    },
    likes: 8520,
    commentsCount: 204,
    shares: 1120,
    isLiked: false,
    isBookmarked: false,
    category: "Teknologi",
    createdAt: "2026-05-25T11:05:00Z",
    comments: [
      {
        id: "c-3",
        author: "Budi Santoso",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
        text: "Ini rekam pakai filter Cyberpunk ya? Detail gila!",
        timestamp: "5 jam yang lalu"
      },
      {
        id: "c-4",
        author: "Jessica Lee",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        text: "Gila keren parah, spill nama filter and settingannya dong",
        timestamp: "3 jam yang lalu"
      }
    ]
  },
  {
    id: "video-3",
    videoUrl: "https://player.vimeo.com/external/372727192.sd.mp4?s=f5ef99f92fc0aee80b7b135bc37ec42a0b388b39&profile_id=165&oauth2_token_id=57447761",
    caption: "Rintik hujan di sudut kemacetan Jakarta malam ini. Tenang di dalam mobil bareng musik favorit 🌧️🚗 #jakarta #rainyday #sedih #senja #peaceful",
    author: {
      name: "Sianipar Lofi",
      handle: "@sora_lofi",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
    },
    music: {
      title: "Lofi Pagi Hari di Jakarta",
      artist: "Sora Lofi Collective",
      coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80"
    },
    likes: 4310,
    commentsCount: 92,
    shares: 612,
    isLiked: false,
    isBookmarked: false,
    category: "Seni & Estetika",
    createdAt: "2026-05-25T08:31:00Z",
    comments: [
      {
        id: "c-5",
        author: "Hendra",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
        text: "Vibes-nya dapet banget. Hujan memang bikin overthinking haha",
        timestamp: "8 jam yang lalu"
      }
    ]
  }
];
