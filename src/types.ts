export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface Video {
  id: string;
  videoUrl: string;
  caption: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  music: {
    title: string;
    artist: string;
    coverUrl?: string;
  };
  likes: number;
  commentsCount: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  category: string;
  createdAt: string;
  comments: Comment[];
  filterApplied?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
  genre: string;
}

export interface FaceFilter {
  id: string;
  name: string;
  emoji: string;
  description: string;
  type: 'none' | 'cyberpunk' | 'vintage' | 'matrix' | 'beauty' | 'funny-mask';
}
