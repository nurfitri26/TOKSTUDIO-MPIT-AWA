import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini backend client if API KEY is present
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log("Gemini AI successfully initialized server-side.");
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
  }
} else {
  console.warn("GEMINI_API_KEY is not defined. AI features will fall back to local generators.");
}

// Ensure clean Indonesian generator fallbacks when API key isn't provided or fails
const LOCAL_HASHTAGS = ["#fyp", "#viralindonesia", "#aesthetic", "#jedagjedug", "#facefilter", "#beranda", "#tiktokindonesia"];
const LOCAL_CAPTIONS_BY_FILTER = {
  cyberpunk: [
    "Vibes masa depan ini gila bgt⚡ neon lights everywhere!",
    "Masuk ke tahun 2077 lewat filter cyberpunk kece ini 🌃",
    "Jalanan Jakarta berasa Tokyo atau Neo-Seoul nih guys!"
  ],
  vintage: [
    "Kembali ke masa lampau, vibes-nya nostalgia banget 📻☕",
    "Aesthetic jadul emang nggak pernah salah. Suka filternya?",
    "Menolak lupa kenangan manis zaman tape tape pita 🎞️"
  ],
  matrix: [
    "Welcome to the Real World. Pilih pil merah atau biru? 🟢⌨️",
    "Sistem eror gara-gara kelebihan muatan kegantengan/kecantikan!",
    "Masuk jaringan mainframe virtual dulu sebentar..."
  ],
  beauty: [
    "Aura glowing-nya keluar alami berkat lighting senja ✨🥰",
    "Self-love first. Filter andalan kalau belum mandi pagi!",
    "Smooth glowing parah, berasa perawatan klinik mahal padahal gratisan!"
  ],
  'funny-mask': [
    "Meong! Siapa mau adopsi anak kucing imut ini? 🐾😹",
    "Kacamata bintangnya terlalu bersinar, silau men!",
    "Random bgt hari ini pengen jadi maskot kucing lucu haha"
  ],
  none: [
    "Keep it simple, keep it real. Tanpa filter apapun tetep asyik 💫",
    "Hari biasa bareng musik favorit di telinga.",
    "Ngikutin tren musik populer ginian aja udah seru!"
  ]
};

const LOCAL_COMMENTERS = [
  { name: "Andi Pratama", handle: "@andipra" },
  { name: "Dewi Lestari", handle: "@dewilest" },
  { name: "Beni Wijaya", handle: "@beniwij" },
  { name: "Siti Sarah", handle: "@sitisar" },
  { name: "Rian Hidayat", handle: "@rianhid" },
  { name: "Clara Agustina", handle: "@clara_agus" },
  { name: "Eko Prasetyo", handle: "@ekopras" },
  { name: "Kiki Amelia", handle: "@kikiamel" }
];

const LOCAL_COMMENTS = [
  "Wah keren parah kak! Suka banget filter sama lagunya cocok abis 🔥",
  "Spill settingan kameranya dong kakaaa",
  "Definisi aesthetic berkelas ini mah, fyp sih harusnya!",
  "Jedag jedugnya dapet bgt, asyik goyangnya haha 😂",
  "Kucingnya imut bgt sih gemes pengen cubit!",
  "Cyberpunk-nya dapet bgt vibes-nya berasa di film fiksi ilmiah",
  "Vintage-nya bikin kangen masa lalu yang indah, nostalgia parah",
  "Waduh rame nih, numpang jemur baju ya guys wkwk 🧺",
  "Fyp lewat jalur mana nih, masuk beranda aku mulu keren!",
  "Gokilll! Sukses terus ya kak konten-kontennya!"
];

// Helper to generate a random ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// 1. API Route: Generate AI TikTok Captions & Tags
app.post("/api/generate-caption", async (req, res) => {
  const { filter, music, prompt } = req.body;
  const filterName = filter || "original";
  const musicName = music || "musik populer";
  const userPrompt = prompt || "";

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Kamu adalah asisten AI pembuat konten TikTok top di Indonesia (gen Z). 
Buatkan satu caption video TikTok yang sangat menarik, kasual, penuh gaya anak muda masa kini, pendek, dan dilengkapi 3-4 hashtag relevan dan trending (termasuk #fyp).
Detail Video:
- Filter wajah yang digunakan: ${filterName} (misal cyberpunk, vintage, lofi, beauty, dsb).
- Musik latar yang digunakan: ${musicName}.
- Catatan tambahan pengguna (jika ada): "${userPrompt}".

Tuliskan caption langsung beserta hashtag-nya dalam satu respon pendek (maksimal 2 kalimat ditambah hashtag). Tanpa instruksi tambahan, dalam bahasa Indonesia yang gaul.`,
      });

      const captionText = response.text?.trim() || "";
      return res.json({ caption: captionText });
    } catch (err: any) {
      console.error("Gemini API Error details:", err);
      // Fallback below
    }
  }

  // Fallback if Gemini failed or is not available
  const activeList = LOCAL_CAPTIONS_BY_FILTER[filterName as keyof typeof LOCAL_CAPTIONS_BY_FILTER] || LOCAL_CAPTIONS_BY_FILTER.none;
  const baseCap = activeList[Math.floor(Math.random() * activeList.length)];
  const tags = [
    "#fyp",
    `#${filterName}`,
    LOCAL_HASHTAGS[Math.floor(Math.random() * LOCAL_HASHTAGS.length)],
    LOCAL_HASHTAGS[Math.floor(Math.random() * LOCAL_HASHTAGS.length)]
  ];
  const uniqueTags = Array.from(new Set(tags)).join(" ");
  const fallbackCaption = `${baseCap} Musik: ${musicName}. ${uniqueTags}`;
  
  res.json({ caption: fallbackCaption });
});

// 2. API Route: Generate AI Simulated Comments
app.post("/api/generate-comments", async (req, res) => {
  const { caption, author } = req.body;
  const videoCaption = caption || "";
  const videoAuthor = author || "Kreator";

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Buatkan 3 komentar akun TikTok Indonesia yang sangat realistis untuk mengomentari video berikut.
Keterangan Video:
- Pengunggah: ${videoAuthor}
- Deskripsi Video: "${videoCaption}"

Komentar harus bergaya bahasa gaul anak muda Indonesia saat ini (singkatan seperti 'bgt', 'follback', 'gokil', bahasa campur aduk daerah/Slang Gen-Z). Ada yang sifatnya mendukung kreatif, bercanda, atau menanyakan filter/lagu.
Format output harus berupa JSON Array dengan struktur:
[
  { "author": "Nama Pengguna", "handle": "@handle_unik", "text": "Isi komentar gaul disini" },
  ...
]
Pastikan mengembalikan HANYA valid JSON array tanpa markdown block (\`\`\`json ...) agar bisa diparse langsung.`,
      });

      let responseText = response.text?.trim() || "[]";
      // Sanitasi jika model mengembalikan pembungkus markdown ```json atau ```
      if (responseText.startsWith("```")) {
        responseText = responseText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      
      const parsedComments = JSON.parse(responseText);
      const commentsWithMetadata = parsedComments.map((c: any) => ({
        id: "c-ai-" + generateId(),
        author: c.author || "Viewer",
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=100&auto=format&fit=crop&q=80`,
        text: c.text || "Keren banget kak!",
        timestamp: "Baru saja"
      }));

      return res.json({ comments: commentsWithMetadata });
    } catch (err) {
      console.error("Gemini API Error for comments:", err);
      // Fallback below
    }
  }

  // Fallback generator for comments
  const selectedComments: any[] = [];
  const count = 3;
  const tempCommenters = [...LOCAL_COMMENTERS];
  const tempComments = [...LOCAL_COMMENTS];

  for (let i = 0; i < count; i++) {
    const cIdx = Math.floor(Math.random() * tempCommenters.length);
    const mIdx = Math.floor(Math.random() * tempComments.length);
    
    const comm = tempCommenters.splice(cIdx, 1)[0];
    const textMsg = tempComments.splice(mIdx, 1)[0];

    selectedComments.push({
      id: "c-local-" + generateId(),
      author: comm.name,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=100&auto=format&fit=crop&q=80`,
      text: textMsg,
      timestamp: "Baru saja"
    });
  }

  res.json({ comments: selectedComments });
});

// Configure Vite middleware or Static files loading based on environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Use Vite middlewares
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TikTok Video Pendek App Server running on port ${PORT}`);
  });
}

startServer();
