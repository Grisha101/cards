import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   THEMES
═══════════════════════════════════════════════ */
const THEMES = {
  light: {
    ink:        "#1a2f4a",
    paper:      "#eef3fb",
    cream:      "#dde8f7",
    terra:      "#3a6fd8",
    terraLight: "#6b9de8",
    gold:       "#5baad8",
    sage:       "#4a90c4",
    border:     "#bfd2ec",
    soft:       "#d4e4f5",
    muted:      "#6b8fb0",
    faint:      "#9cb8d4",
    white:      "#f8faff",
    again: { bg: "#fdecea", border: "#f5c6c2", text: "#b83232" },
    hard:  { bg: "#fef6e4", border: "#f0d88a", text: "#8a6010" },
    good:  { bg: "#e4f2eb", border: "#9dd4b0", text: "#1f6b38" },
    easy:  { bg: "#dbeeff", border: "#90c4f5", text: "#1254a0" },
  },
  dark: {
    ink:        "#d6e8ff",
    paper:      "#0d1b2e",
    cream:      "#162540",
    terra:      "#5b9cf0",
    terraLight: "#7db5f5",
    gold:       "#5baad8",
    sage:       "#4a90c4",
    border:     "#1e3a5f",
    soft:       "#162038",
    muted:      "#6a96c8",
    faint:      "#2e5080",
    white:      "#111f35",
    again: { bg: "#2a1015", border: "#5c2020", text: "#f08888" },
    hard:  { bg: "#241a08", border: "#5a4010", text: "#d4a840" },
    good:  { bg: "#0d2418", border: "#1a5030", text: "#50d880" },
    easy:  { bg: "#0a1d38", border: "#1a3a6a", text: "#70b8f8" },
  },
};

let C = { ...THEMES.light };

// ─── Горизонтальний відступ від краю екрана — міняй тут ───
const SIDE = 8; // px

/* ═══════════════════════════════════════════════
   LANGUAGES CONFIG
═══════════════════════════════════════════════ */
const LANGUAGES = {
  it: {
    code: "it", label: "Italiano", ttsLang: "it-IT",
    voiceKey: "ifc_voice_it", sample: "Ciao, come stai?",
    rvVoices: [
      { name: "Italian Female", label: "Italiana (жін.)" },
      { name: "Italian Male",   label: "Italiano (чол.)" },
    ],
    flag: (
      <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius: 3, flexShrink: 0 }}>
        <rect width="22" height="16" fill="#009246"/>
        <rect x="7.33" width="7.34" height="16" fill="#fff"/>
        <rect x="14.67" width="7.33" height="16" fill="#ce2b37"/>
      </svg>
    ),
  },
  pl: {
    code: "pl", label: "Polski", ttsLang: "pl-PL",
    voiceKey: "ifc_voice_pl", sample: "Cześć, jak się masz?",
    rvVoices: [
      { name: "Polish Female", label: "Polska (жін.)" },
      { name: "Polish Male",   label: "Polski (чол.)" },
    ],
    flag: (
      <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius: 3, flexShrink: 0 }}>
        <rect width="22" height="16" fill="#fff"/>
        <rect y="8" width="22" height="8" fill="#dc143c"/>
      </svg>
    ),
  },
  en: {
    code: "en", label: "English", ttsLang: "en-GB",
    voiceKey: "ifc_voice_en", sample: "Hello, how are you?",
    rvVoices: [
      { name: "UK English Female", label: "British (жін.)" },
      { name: "UK English Male",   label: "British (чол.)" },
      { name: "US English Female", label: "American (жін.)" },
      { name: "US English Male",   label: "American (чол.)" },
    ],
    flag: (
      <svg width="22" height="16" viewBox="0 0 22 16" style={{ borderRadius: 3, flexShrink: 0 }}>
        <rect width="22" height="16" fill="#012169"/>
        <path d="M0,0 L22,16 M22,0 L0,16" stroke="#fff" strokeWidth="3"/>
        <path d="M0,0 L22,16 M22,0 L0,16" stroke="#C8102E" strokeWidth="1.8"/>
        <path d="M11,0 V16 M0,8 H22" stroke="#fff" strokeWidth="4.5"/>
        <path d="M11,0 V16 M0,8 H22" stroke="#C8102E" strokeWidth="2.5"/>
      </svg>
    ),
  },
};

const DEFAULT_DATA = {
  xp: 0, level: 1, activeLang: "it",
  dictionaries: {
    "it:Базові слова": [
      { word: "ciao",       translation: "привіт / бувай" },
      { word: "grazie",     translation: "дякую" },
      { word: "prego",      translation: "будь ласка / нема за що" },
      { word: "casa",       translation: "будинок" },
      { word: "acqua",      translation: "вода" },
      { word: "amore",      translation: "кохання" },
      { word: "mangiare",   translation: "їсти" },
      { word: "bello",      translation: "красивий" },
      { word: "amico",      translation: "друг" },
      { word: "buongiorno", translation: "добрий день" },
      { word: "notte",      translation: "ніч" },
      { word: "sole",       translation: "сонце" },
    ],
    "pl:Базові слова": [
      { word: "cześć",       translation: "привіт" },
      { word: "dziękuję",   translation: "дякую" },
      { word: "proszę",     translation: "будь ласка / прошу" },
      { word: "dom",        translation: "будинок" },
      { word: "woda",       translation: "вода" },
      { word: "miłość",     translation: "кохання" },
      { word: "jeść",       translation: "їсти" },
      { word: "piękny",     translation: "красивий" },
      { word: "przyjaciel", translation: "друг" },
      { word: "dzień dobry",translation: "добрий день" },
      { word: "noc",        translation: "ніч" },
      { word: "słońce",     translation: "сонце" },
      { word: "tak",        translation: "так" },
      { word: "nie",        translation: "ні" },
      { word: "przepraszam",translation: "вибачте" },
      { word: "dobrze",     translation: "добре / гаразд" },
      { word: "miasto",     translation: "місто" },
      { word: "ulica",      translation: "вулиця" },
      { word: "sklep",      translation: "магазин" },
      { word: "chleb",      translation: "хліб" },
      { word: "mleko",      translation: "молоко" },
      { word: "kawa",       translation: "кава" },
      { word: "herbata",    translation: "чай" },
      { word: "samochód",   translation: "машина" },
      { word: "pociąg",     translation: "потяг" },
    ],
    "en:Базові слова": [
      { word: "hello",        translation: "привіт" },
      { word: "thank you",    translation: "дякую" },
      { word: "please",       translation: "будь ласка" },
      { word: "house",        translation: "будинок" },
      { word: "water",        translation: "вода" },
      { word: "love",         translation: "кохання" },
      { word: "to eat",       translation: "їсти" },
      { word: "beautiful",    translation: "красивий" },
      { word: "friend",       translation: "друг" },
      { word: "good morning", translation: "добрий ранок" },
      { word: "night",        translation: "ніч" },
      { word: "sun",          translation: "сонце" },
      { word: "yes",          translation: "так" },
      { word: "no",           translation: "ні" },
      { word: "sorry",        translation: "вибачте" },
      { word: "good",         translation: "добре / гарний" },
      { word: "city",         translation: "місто" },
      { word: "street",       translation: "вулиця" },
      { word: "shop",         translation: "магазин" },
      { word: "bread",        translation: "хліб" },
      { word: "milk",         translation: "молоко" },
      { word: "coffee",       translation: "кава" },
      { word: "tea",          translation: "чай" },
      { word: "car",          translation: "машина" },
      { word: "train",        translation: "потяг" },
    ],
  },
  progress: {},
};

function buildShareText(name, cards) {
  const lines = cards.map(c => {
    let line = c.word;
    if (c.translation) line += ` = ${c.translation}`;
    if (c.image) line += `\n  🖼 ${c.image}`;
    return line;
  });
  return `📚 ${name}\n${"─".repeat(28)}\n${lines.join("\n")}`;
}

function loadData() {
  try {
    const raw = localStorage.getItem("ifc_v3");
    if (!raw) return DEFAULT_DATA;
    const saved = JSON.parse(raw);
    return { ...saved, dictionaries: { ...DEFAULT_DATA.dictionaries, ...saved.dictionaries } };
  } catch { return DEFAULT_DATA; }
}
function saveData(d) { localStorage.setItem("ifc_v3", JSON.stringify(d)); }

function applyGrade(p = { interval: 1, repetition: 0, ease: 2.5 }, score) {
  const n = { ...p };
  if (score === 0) { n.interval = 1; n.repetition = 0; }
  else {
    n.repetition++;
    n.interval = Math.round(n.interval * n.ease);
    if (score === 3) n.ease = Math.min(n.ease + 0.15, 4);
    if (score === 1) n.ease = Math.max(n.ease - 0.15, 1.3);
  }
  return n;
}

function parseInput(raw) {
  raw = raw.trim();
  if (!raw) return null;
  if (raw.startsWith("[")) {
    try { const p = JSON.parse(raw); if (Array.isArray(p)) return p; } catch {}
  }
  const arr = [];
  for (const line of raw.split("\n").map(l => l.trim()).filter(Boolean)) {
    const sep = line.includes("=") ? "=" : line.includes("—") ? "—" : line.includes("-") ? "-" : null;
    if (!sep) continue;
    const [w, ...rest] = line.split(sep);
    if (w && rest.length) arr.push({ word: w.trim(), translation: rest.join(sep).trim() });
  }
  return arr.length ? arr : null;
}

/* ═══════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════ */
function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const show = useCallback((msg, err = false) => {
    setToast({ msg, err });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);
  return { toast, show };
}

const LOW_PITCH_VOICES = /google|microsoft|samsung|android|ivona/i;
function getVoiceParams(voice) {
  if (!voice) return { rate: 0.82, pitch: 1.0 };
  if (LOW_PITCH_VOICES.test(voice.name)) return { rate: 0.82, pitch: 1.35 };
  return { rate: 0.82, pitch: 1.0 };
}
function dedupeVoices(voices) {
  const seen = new Set();
  return voices.filter(v => { const k = v.name.trim().toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}
const RV_PREFIX = "rv:";
function rvSpeak(rvName, text) {
  if (typeof window.responsiveVoice === "undefined") return false;
  window.responsiveVoice.speak(text, rvName, { rate: 0.9, pitch: 1, volume: 1 });
  return true;
}

function useSpeech(langCode) {
  const lang = LANGUAGES[langCode] || LANGUAGES.it;
  const [sysVoices, setSysVoices] = useState([]);
  const [rvReady, setRvReady] = useState(false);
  const [selectedVoiceName, setSelectedVoiceName] = useState(() => localStorage.getItem(lang.voiceKey) || "");
  const voiceRef = useRef(null);

  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const langVoices = dedupeVoices(all.filter(v => v.lang.toLowerCase().startsWith(lang.code)));
      setSysVoices(langVoices);
      const saved = localStorage.getItem(lang.voiceKey);
      if (saved && saved.startsWith(RV_PREFIX)) { voiceRef.current = null; setSelectedVoiceName(saved); }
      else {
        const match = saved ? langVoices.find(v => v.name === saved) : null;
        voiceRef.current = match || langVoices.find(v => !v.localService) || langVoices[0] || null;
        if (!saved && voiceRef.current) setSelectedVoiceName(voiceRef.current.name);
      }
    };
    window.speechSynthesis.onvoiceschanged = load;
    load(); setTimeout(load, 500); setTimeout(load, 1500);
  }, [langCode]);

  useEffect(() => {
    if (typeof window.responsiveVoice !== "undefined") { setRvReady(true); return; }
    const t = setInterval(() => { if (typeof window.responsiveVoice !== "undefined") { setRvReady(true); clearInterval(t); } }, 300);
    return () => clearInterval(t);
  }, []);

  const selectVoice = useCallback((name) => {
    voiceRef.current = name.startsWith(RV_PREFIX) ? null : (sysVoices.find(v => v.name === name) || null);
    setSelectedVoiceName(name);
    localStorage.setItem(lang.voiceKey, name);
  }, [sysVoices, lang.voiceKey]);

  const speak = useCallback((text) => {
    const saved = selectedVoiceName;
    if (saved && saved.startsWith(RV_PREFIX)) { window.speechSynthesis.cancel(); rvSpeak(saved.slice(RV_PREFIX.length), text); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const { rate, pitch } = getVoiceParams(voiceRef.current);
    u.lang = lang.ttsLang; u.rate = rate; u.pitch = pitch; u.volume = 1;
    if (voiceRef.current) u.voice = voiceRef.current;
    window.speechSynthesis.speak(u);
  }, [selectedVoiceName, lang.ttsLang]);

  return { speak, sysVoices, rvReady, selectedVoiceName, selectVoice };
}

function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/service-worker.js").catch(() => {});
    if (isStandalone) { setInstalled(true); return; }
    const handler = (e) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  };
  return { canInstall: !installed && !dismissed && (!!prompt || isIos), install, installed, isIos, dismiss: () => setDismissed(true) };
}

/* ═══════════════════════════════════════════════
   VIEWPORT HOOK — блокує зум, тримає висоту
═══════════════════════════════════════════════ */
function useViewportHeight() {
  useEffect(() => {
    const existing = document.querySelector('meta[name="viewport"]');
    const content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    if (existing) existing.setAttribute("content", content);
    else {
      const meta = document.createElement("meta");
      meta.name = "viewport"; meta.content = content;
      document.head.prepend(meta);
    }
    const setH = () => {
      const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const hPx = Math.round(h);
      const kbdPx = Math.max(0, window.innerHeight - hPx);
      document.documentElement.style.setProperty("--app-h", hPx + "px");
      document.documentElement.style.setProperty("--kbd-h", kbdPx + "px");
    };
    setH();
    window.visualViewport?.addEventListener("resize", setH);
    return () => window.visualViewport?.removeEventListener("resize", setH);
  }, []);
}

/* ═══════════════════════════════════════════════
   FLIP CARD
═══════════════════════════════════════════════ */
function FlipCard({ front, back, backImage, frontLabel, cardKey, onNext, onPrev }) {
  const [flipped, setFlipped]   = useState(false);
  const [dragX, setDragX]       = useState(0);
  // gesture: null | "swipe" | "tap"
  const gesture  = useRef(null);
  const touchStart = useRef(null);

  useEffect(() => { setFlipped(false); setDragX(0); gesture.current = null; }, [cardKey]);

  const onTouchStart = (e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    gesture.current = null;   // не знаємо ще що це
    setDragX(0);
  };

  const onTouchMove = (e) => {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    const adx = Math.abs(dx), ady = Math.abs(dy);

    // Визначаємо тип жесту після 10px руху — і фіксуємо його
    if (gesture.current === null && (adx > 10 || ady > 10)) {
      // Свайп тільки якщо рух явно горизонтальний: горизонт > 2× вертикаль
      gesture.current = adx > ady * 2 ? "swipe" : "tap";
    }

    if (gesture.current === "swipe") {
      e.preventDefault();   // не скролимо сторінку
      setDragX(dx);
    }
  };

  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const adx = Math.abs(dx);

    if (gesture.current === "swipe" && adx > 72) {
      // Підтверджений горизонтальний свайп досить великий — гортаємо картку
      setDragX(0);
      gesture.current = null;
      touchStart.current = null;
      dx > 0 ? onPrev?.() : onNext?.();
      return;
    }

    // Все інше (включно з коротким свайпом або "tap") — перевертаємо
    setDragX(0);
    gesture.current = null;
    touchStart.current = null;

    // Вважаємо тапом якщо свайп НЕ підтвердився (тобто не "swipe" з великим dx)
    setFlipped(f => !f);
  };

  const isSwipingNow = gesture.current === "swipe" && Math.abs(dragX) > 0;
  const rotate  = Math.max(-18, Math.min(18, dragX / 12));
  const opacity = isSwipingNow ? Math.max(0.5, 1 - Math.abs(dragX) / 300) : 1;

  return (
    <div
      onClick={() => {
        // onClick спрацьовує тільки при кліку мишею (не touch),
        // бо на touch ми вже обробили в onTouchEnd
        if ("ontouchstart" in window) return;
        setFlipped(f => !f);
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        perspective: 1200, cursor: "pointer", userSelect: "none", height: "100%",
        transform: isSwipingNow ? `translateX(${dragX * 0.38}px) rotate(${rotate}deg)` : "none",
        opacity,
        transition: isSwipingNow ? "none" : "transform 0.28s cubic-bezier(.2,.8,.3,1), opacity 0.28s",
        willChange: "transform",
      }}>
      <div style={{
        position: "relative", width: "100%", height: "100%",
        transformStyle: "preserve-3d",
        transition: "transform 0.52s cubic-bezier(.4,0,.2,1)",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        {/* FRONT */}
        <div style={{ ...faceStyle(), background: C.white }}>
          <span style={labelStyle()}>{frontLabel || "Слово"}</span>
          <span style={wordStyle()}>{front}</span>
          <span style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>
            торкніться щоб перевернути · свайп для навігації
          </span>
        </div>
        {/* BACK */}
        <div style={{
          ...faceStyle(),
          background: `linear-gradient(160deg, ${C.cream} 0%, #daeeff 100%)`,
          transform: "rotateY(180deg)",
          padding: backImage ? "16px" : "0 28px",
        }}>
          {backImage ? (
            <>
              <span style={labelStyle()}>Зображення</span>
              <div style={{
                flex: 1, height: 0, width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "8px 0", overflow: "hidden",
              }}>
                <img src={backImage} alt={front} style={{
                  width: "100%", height: "100%",
                  objectFit: "contain", borderRadius: 14,
                  boxShadow: "0 4px 18px rgba(30,60,120,0.13)",
                }} />
              </div>
            </>
          ) : (
            <>
              <span style={labelStyle()}>Переклад</span>
              <span style={wordStyle()}>{back}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const faceStyle  = () => ({
  position: "absolute", inset: 0,
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
  borderRadius: 24, border: `1.5px solid ${C.border}`,
  boxShadow: `0 8px 40px rgba(30,60,120,0.10), 0 2px 8px rgba(30,60,120,0.06)`,
  backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
  padding: "0 28px",
});
const labelStyle = () => ({ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: C.faint });
const wordStyle  = () => ({ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 38, fontWeight: 700, color: C.ink, textAlign: "center", lineHeight: 1.2 });
const inputStyle = () => ({
  width: "100%", padding: "10px 10px", borderRadius: 10,
  border: `1.5px solid ${C.border}`, background: C.cream,
  fontSize: 14, color: C.ink, outline: "none", marginBottom: 10,
  fontFamily: "'DM Sans', sans-serif",
});
const sectionTitle = () => ({
  fontFamily: "'Playfair Display', serif", fontSize: "1.15rem",
  fontWeight: 700, color: C.ink, marginBottom: 16,
});
const linkBtn = () => ({
  background: "none", border: "none", color: C.terra,
  fontWeight: 600, fontSize: 13, cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
});
const ghostSmallBtn = () => ({
  background: C.white, border: `1.5px solid ${C.border}`, color: C.muted,
  borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
  padding: "10px 8px", fontFamily: "'DM Sans', sans-serif",
});

/* ═══════════════════════════════════════════════
   IMAGE SEARCH (Openverse)
═══════════════════════════════════════════════ */
async function searchImages(query) {
  const clean = query
    .toLowerCase()
    .replace(/^(il|lo|la|i|gli|le|un|una|un')\s+/, "")
    .trim();

  const searchQuery = clean + " object";

  const url = "https://api.openverse.org/v1/images/?" + new URLSearchParams({
    q: searchQuery,
    page_size: "20",
    mature: "false",
    license: "cc0,by,by-sa"
  });

  const res = await fetch(url);

  if (!res.ok) throw new Error("HTTP " + res.status);

  const data = await res.json();

  return (data?.results || [])
    .filter(r => r.thumbnail)
    .map(r => r.thumbnail)
    .slice(0, 12);
}

/* ═══════════════════════════════════════════════
   CARD EDIT ROW
═══════════════════════════════════════════════ */
function CardEditRow({ card, num, onChange, onDelete }) {
  const [mode, setMode]           = useState(card.image ? "image" : "text");
  const effectiveMode = mode;
  const [searching, setSearching] = useState(false);
  const [results, setResults]     = useState([]);
  const [searchErr, setSearchErr] = useState("");
  const fileRef = useRef(null);

  // Коли bulk-search встановлює image — НЕ перемикаємо mode примусово,
  // бо текстовий режим тепер сам показує мініатюру знайденого зображення

  const switchMode = (m) => {
    setMode(m);
    setResults([]);
    if (m === "text") onChange("image", "");
    // translation is kept when switching to image mode
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { onChange("image", ev.target.result); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSearch = async () => {
    const q = card.word.trim();
    if (!q) return;
    setSearching(true);
    setSearchErr("");
    setResults([]);
    try {
      const imgs = await searchImages(q);
      if (imgs.length === 0) setSearchErr("Нічого не знайдено. Спробуй англійською.");
      else setResults(imgs);
    } catch {
      setSearchErr("Помилка мережі. Перевір підключення.");
    } finally {
      setSearching(false);
    }
  };

  const pickImage = (url) => {
    onChange("image", url);
    setResults([]);
  };

  return (
    <div style={{
      background: C.white, borderRadius: 16, padding: "14px 14px", marginBottom: 10,
      border: `1.5px solid ${C.soft}`, boxShadow: "0 2px 6px rgba(26,26,46,0.05)",
    }}>
      {/* Word row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: C.faint, minWidth: 22, textAlign: "right", flexShrink: 0 }}>{num}</span>
        <input
          value={card.word}
          onChange={e => onChange("word", e.target.value)}
          placeholder="Слово / фраза"
          style={{ ...inputStyle(), flex: 1, marginBottom: 0 }}
        />
        <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: "4px", flexShrink: 0, lineHeight: 1 }}>🗑️</button>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[["text", "Текст"], ["image", "🖼️ Зображення"]].map(([m, label]) => (
          <button key={m} onClick={() => switchMode(m)} style={{
            padding: "4px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
            border: `1.5px solid ${effectiveMode === m ? C.terra : C.border}`,
            background: effectiveMode === m ? "#fdf2ee" : C.white,
            color: effectiveMode === m ? C.terra : C.muted,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      {/* Content */}
      {effectiveMode === "text" ? (
        <>
          <input
            value={card.translation || ""}
            onChange={e => onChange("translation", e.target.value)}
            placeholder="Переклад"
            style={{ ...inputStyle(), marginBottom: card.image ? 8 : 0 }}
          />
          {/* Показуємо знайдене bulk-пошуком зображення навіть коли mode=text */}
          {card.image && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px",
              background:C.cream, borderRadius:10, border:`1px solid ${C.border}` }}>
              <img src={card.image} alt="" style={{ width:44, height:44, borderRadius:8, objectFit:"cover", flexShrink:0 }}
                onError={e => { e.currentTarget.style.display="none"; }} />
              <span style={{ fontSize:11, color:C.muted, flex:1 }}>Зображення встановлено автоматично</span>
              <button onClick={() => { onChange("image",""); }}
                style={{ background:"none", border:"none", cursor:"pointer", fontSize:15, padding:2, color:C.muted }}>✕</button>
            </div>
          )}
        </>
      ) : (
        <div>
          {/* Current image preview */}
          {card.image && (
            <div style={{
              width: "100%", height: 140, borderRadius: 10, overflow: "hidden",
              background: C.cream, marginBottom: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src={card.image} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
          )}

          {/* Auto-search button */}
          <button
            onClick={handleSearch}
            disabled={searching || !card.word.trim()}
            style={{
              width: "100%", padding: "10px", borderRadius: 9, marginBottom: 8,
              border: `1.5px solid ${C.terra}`,
              background: searching ? C.soft : "#fdf2ee",
              color: C.terra, fontSize: 13, cursor: searching ? "default" : "pointer",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              opacity: (!card.word.trim()) ? 0.45 : 1,
              transition: "all 0.15s",
            }}
          >
            {searching ? "⏳ Шукаю…" : "🔍 Знайти зображення автоматично"}
          </button>

          {/* Search error */}
          {searchErr && (
            <div style={{ fontSize: 12, color: C.again.text, marginBottom: 8, textAlign: "center" }}>
              {searchErr}
            </div>
          )}

          {/* Search results grid */}
          {results.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>
                Обери зображення ({results.length} результатів):
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6,
              }}>
                {results.map((url, i) => (
                  <div
                    key={i}
                    onClick={() => pickImage(url)}
                    style={{
                      aspectRatio: "1", borderRadius: 8, overflow: "hidden",
                      cursor: "pointer", border: `2px solid transparent`,
                      background: C.cream,
                      transition: "border-color 0.15s, transform 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.terra; e.currentTarget.style.transform = "scale(1.03)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={e => { e.currentTarget.parentElement.style.display = "none"; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0" }}>
            <div style={{ flex: 1, height: 1, background: C.soft }} />
            <span style={{ fontSize: 11, color: C.faint }}>або вручну</span>
            <div style={{ flex: 1, height: 1, background: C.soft }} />
          </div>

          {/* Manual URL */}
          <input
            value={card.image && !card.image.startsWith("data:") ? card.image : ""}
            onChange={e => onChange("image", e.target.value)}
            placeholder="URL зображення (https://...)"
            style={{ ...inputStyle(), marginBottom: 8, fontSize: 12 }}
          />

          {/* File upload */}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          <button onClick={() => fileRef.current?.click()} style={{
            width: "100%", padding: "9px", borderRadius: 9,
            border: `1.5px dashed ${C.border}`, background: C.paper,
            color: C.ink, fontSize: 13, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            📁 {card.image ? "Замінити файл" : "Завантажити файл"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CARD EDITOR (full-screen overlay)
═══════════════════════════════════════════════ */
function CardEditor({ cards, dictLabel, onSave, onClose }) {
  const [editCards, setEditCards] = useState(
    () => cards.map((c, i) => ({ ...c, _id: Date.now() + i }))
  );
  const [bulkProgress, setBulkProgress] = useState(null);
  // null = idle | { done, total, errors, finished? } = active

  const updateCard = useCallback((id, field, value) => {
    setEditCards(cs => cs.map(c => c._id === id ? { ...c, [field]: value } : c));
  }, []);

  const deleteCard = useCallback((id) => {
    setEditCards(cs => cs.filter(c => c._id !== id));
  }, []);

  const addCard = () => {
    setEditCards(cs => [...cs, { word: "", translation: "", _id: Date.now() }]);
  };

  // Bulk image search — finds first result for every card that has no image yet
  const findAllImages = async () => {
    const targets = editCards.filter(c => c.word.trim() && !c.image);
    if (!targets.length) return;
    setBulkProgress({ done: 0, total: targets.length, errors: 0 });
    for (let i = 0; i < targets.length; i++) {
      const card = targets[i];
      try {
        const imgs = await searchImages(card.word.trim());
        if (imgs.length > 0) {
          setEditCards(cs => cs.map(c =>
            c._id === card._id ? { ...c, image: imgs[0] } : c
          ));
        }
      } catch {
        setBulkProgress(p => ({ ...p, errors: (p?.errors || 0) + 1 }));
      }
      setBulkProgress(p => ({ ...p, done: i + 1 }));
      await new Promise(r => setTimeout(r, 350)); // avoid rate-limiting
    }
    setBulkProgress(p => ({ ...p, finished: true }));
  };

  const cardsWithoutImage = editCards.filter(c => c.word.trim() && !c.image).length;
  const isRunning = bulkProgress && !bulkProgress.finished;

  const handleSave = () => {
    const cleaned = editCards
      .filter(c => c.word.trim())
      .map(({ _id, ...rest }) => {
        const card = { word: rest.word.trim() };
        if (rest.image) card.image = rest.image;
        if (rest.translation) card.translation = rest.translation;
        if (!rest.image && !rest.translation) card.translation = "";
        return card;
      });
    onSave(cleaned);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Editor header */}
      <div style={{
        height: 64, flexShrink: 0, padding: `0 ${SIDE}px`,
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: `1px solid ${C.soft}`,
        background: "rgba(238,243,251,0.95)", backdropFilter: "blur(8px)",
      }}>
        <button onClick={onClose} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 22, lineHeight: 1, padding: "4px 6px", color: C.ink, flexShrink: 0,
        }}>←</button>
        <div style={{
          flex: 1, minWidth: 0,
          fontFamily: "'Playfair Display', serif",
          fontSize: 18, fontWeight: 700, color: C.ink,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{dictLabel}</div>
        <Btn variant="terra" onClick={handleSave} style={{ padding: "8px 16px", fontSize: 13, flexShrink: 0 }}>
          Зберегти
        </Btn>
      </div>

      {/* Cards list */}
      <div className="tab-scroll" style={{ flex: 1 }}>
        <div style={{ padding: `14px ${SIDE}px 48px` }}>
          {/* ── Bulk image search banner ── */}
          {cardsWithoutImage > 0 && (
            <div style={{
              background: "#e8f0fb", borderRadius: 14, padding: "12px 14px",
              marginBottom: 14, border: `1.5px solid ${C.terra}33`,
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.terra }}>
                    🔍 Знайти зображення для всіх
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                    {isRunning
                      ? `Обробляю ${bulkProgress.done} / ${bulkProgress.total}…`
                      : bulkProgress?.finished
                        ? `Готово · знайдено для ${bulkProgress.total - (bulkProgress.errors||0)} з ${bulkProgress.total}`
                        : `${cardsWithoutImage} карток без зображення`}
                  </div>
                </div>
                {!isRunning && !bulkProgress?.finished && (
                  <button onClick={findAllImages} style={{
                    padding: "9px 16px", borderRadius: 10, flexShrink: 0,
                    background: C.terra, color: C.white, border: "none",
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Запустити
                  </button>
                )}
                {bulkProgress?.finished && (
                  <button onClick={() => setBulkProgress(null)} style={{
                    padding: "9px 16px", borderRadius: 10, flexShrink: 0,
                    background: C.white, color: C.terra,
                    border: `1.5px solid ${C.terra}`, fontSize: 13,
                    fontWeight: 700, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Ще раз
                  </button>
                )}
              </div>

              {/* Progress bar */}
              {bulkProgress && (
                <div style={{ height: 4, background: "#f0e8e4", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    width: `${Math.round((bulkProgress.done / bulkProgress.total) * 100)}%`,
                    background: bulkProgress.finished
                      ? (bulkProgress.errors > 0 ? C.gold : C.sage)
                      : C.terra,
                    transition: "width 0.3s",
                  }} />
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
            {editCards.length} {editCards.length === 1 ? "картка" : "карток"} · редагуй будь-яке поле
          </div>

          {editCards.map((card, i) => (
            <CardEditRow
              key={card._id}
              card={card}
              num={i + 1}
              onChange={(field, val) => updateCard(card._id, field, val)}
              onDelete={() => deleteCard(card._id)}
            />
          ))}

          <button onClick={addCard} style={{
            width: "100%", padding: "13px", borderRadius: 12,
            border: `1.5px dashed ${C.terra}`, background: "transparent",
            color: C.terra, fontSize: 14, fontWeight: 600, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            + Додати картку
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PRACTICE VIEW — keyboard input
═══════════════════════════════════════════════ */
function normalize(s = "") {
  return s.trim().toLowerCase()
    .replace(/[àáâã]/g,"a").replace(/[èéêë]/g,"e")
    .replace(/[ìíîï]/g,"i").replace(/[òóôõ]/g,"o")
    .replace(/[ùúûü]/g,"u").replace(/ç/g,"c")
    .replace(/ł/g,"l").replace(/ń/g,"n").replace(/ś/g,"s")
    .replace(/ź|ż/g,"z").replace(/ą/g,"a").replace(/ę/g,"e")
    .replace(/ó/g,"o");
}

function PracticeView({ words, dictNames, dictName, displayName, switchDict, speak, activeLang, onDuoMode }) {
  // direction: "toUkr" = іноземна → укр | "toForeign" = укр → іноземна
  const [direction, setDirection] = useState("toUkr");
  const [qIdx, setQIdx]       = useState(0);
  const [input, setInput]     = useState("");
  const [status, setStatus]   = useState("idle"); // idle | correct | wrong | revealed
  const [streak, setStreak]   = useState(0);
  const [score, setScore]     = useState({ correct: 0, wrong: 0 });
  const [done, setDone]       = useState(false);
  const [order, setOrder]     = useState([]);
  const inputRef              = useRef(null);

  const reset = (newOrder) => {
    setOrder(newOrder);
    setQIdx(0); setInput(""); setStatus("idle");
    setStreak(0); setScore({ correct: 0, wrong: 0 }); setDone(false);
  };

  useEffect(() => {
    if (!words.length) return;
    reset([...words].map((_, i) => i).sort(() => Math.random() - 0.5));
  }, [dictName, words.length]);

  // Reset quiz when direction changes
  useEffect(() => {
    if (!words.length) return;
    reset([...words].map((_, i) => i).sort(() => Math.random() - 0.5));
  }, [direction]);

  // Auto-focus disabled — не чіпаємо клавіатуру без запиту користувача

  if (!words.length) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: C.muted }}>Словник порожній</p>
    </div>
  );

  const realIdx  = order[qIdx] ?? 0;
  const card     = words[realIdx] || words[0];
  const toForeign = direction === "toForeign";

  // What we SHOW as a prompt, what we EXPECT as answer
  const prompt       = toForeign ? (card.translation || "—") : card.word;
  const correctWords = toForeign
    ? card.word.split("/").map(p => normalize(p))
    : (card.translation || "").split("/").map(p => normalize(p));

  const check = () => {
    if (status !== "idle") return;
    const correct = correctWords.some(p => p === normalize(input));
    setStatus(correct ? "correct" : "wrong");
    if (correct) {
      setStreak(s => s + 1);
      setScore(s => ({ ...s, correct: s.correct + 1 }));
      speak(card.word);
    } else {
      setStreak(0);
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
    }
  };

  const next = () => {
    if (qIdx + 1 >= order.length) { setDone(true); return; }
    setQIdx(q => q + 1);
    setInput(""); setStatus("idle");
  };

  const restart = () => {
    reset([...words].map((_, i) => i).sort(() => Math.random() - 0.5));
  };

  const total = order.length;
  const pct   = total ? Math.round(((qIdx + (status !== "idle" ? 1 : 0)) / total) * 100) : 0;

  const statusColors = {
    correct: { bg: C.good.bg,  border: C.good.border,  text: C.good.text  },
    wrong:   { bg: C.again.bg, border: C.again.border, text: C.again.text },
    revealed:{ bg: C.hard.bg,  border: C.hard.border,  text: C.hard.text  },
    idle:    { bg: C.white,    border: C.border,        text: C.ink        },
  };
  const sc = statusColors[status];

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      padding: `12px ${SIDE}px 12px`,
      // Піднімаємо вміст вгору коли відкрита клавіатура — тільки для цієї вкладки
      paddingBottom: `calc(12px + var(--kbd-h, 0px) / var(--font-scale, 1))`,
      transition: "padding-bottom 0.28s ease",
      boxSizing: "border-box",
    }}>

      {/* Dict chips */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", flexShrink: 0, scrollbarWidth: "none", marginBottom: 10 }}>
        {dictNames.map(n => (
          <button key={n} onClick={() => switchDict(n)} style={{
            padding: "5px 12px", borderRadius: 20,
            borderColor: dictName === n ? C.terra : C.soft,
            border: "1.5px solid", flexShrink: 0,
            background: dictName === n ? C.terra : C.white,
            color: dictName === n ? C.white : C.ink,
            fontWeight: 600, fontSize: 12, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
          }}>{displayName(n)}</button>
        ))}
      </div>

      {/* Direction toggle */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0, marginBottom: 10 }}>
        {[
          ["toUkr",     `${LANGUAGES[activeLang]?.label} → 🇺🇦`],
          ["toForeign", `🇺🇦 → ${LANGUAGES[activeLang]?.label}`],
        ].map(([d, label]) => (
          <button key={d} onClick={() => setDirection(d)} style={{
            flex: 1, padding: "7px 4px", borderRadius: 10, fontSize: 12, fontWeight: 700,
            border: `1.5px solid ${direction === d ? C.terra : C.border}`,
            background: direction === d ? C.terra : C.white,
            color: direction === d ? C.white : C.muted,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.15s",
          }}>{label}</button>
        ))}
        {onDuoMode && words.length >= 4 && (
          <button onClick={onDuoMode} style={{
            padding: "7px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,
            background: "#deeeff", border: `1.5px solid ${C.terra}`,
            color: C.terra, cursor: "pointer", flexShrink: 0,
          }}>🎮 Duo</button>
        )}
      </div>

      {/* Progress */}
      <div style={{ flexShrink: 0, marginBottom: 6 }}>
        <div style={{ height: 4, background: C.soft, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${C.terra},${C.gold})`, borderRadius: 4, transition: "width 0.4s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 10, color: C.muted }}>{qIdx + 1} / {total}</span>
          <span style={{ fontSize: 10, color: C.muted }}>
            ✅ {score.correct} &nbsp; ❌ {score.wrong} &nbsp; 🔥 {streak}
          </span>
        </div>
      </div>

      {/* Done screen */}
      {done ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
          <div style={{ fontSize: 56 }}>{score.wrong === 0 ? "🏆" : score.correct > score.wrong ? "🎉" : "💪"}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: C.ink }}>
            {score.wrong === 0 ? "Ідеально!" : "Раунд завершено"}
          </div>
          <div style={{ fontSize: 14, color: C.muted }}>
            Правильно: {score.correct} · Помилок: {score.wrong}
          </div>
          <Btn variant="terra" onClick={restart} style={{ marginTop: 8 }}>Почати знову →</Btn>
          {onDuoMode && words.length >= 4 && (
            <button onClick={onDuoMode} style={{
              padding: "8px 20px", borderRadius: 10, fontSize: 12, fontWeight: 700,
              background: "#deeeff", border: `1.5px solid ${C.terra}`,
              color: C.terra, cursor: "pointer", marginTop: 4,
            }}>🎮 Duo Mode</button>
          )}
        </div>
      ) : (
        <>
          {/* Word card */}
          <div style={{
            flex: 1, minHeight: 0, borderRadius: 22,
            border: `2px solid ${sc.border}`,
            background: sc.bg,
            boxShadow: "0 8px 40px rgba(30,60,120,0.09)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 10, padding: "20px 24px",
            transition: "background 0.25s, border-color 0.25s",
          }}>
            <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: C.faint }}>
              {toForeign ? "🇺🇦 Українська" : LANGUAGES[activeLang]?.label}
            </span>

            {/* Show image only in toUkr mode (image is the foreign-side hint) */}
            {!toForeign && card.image ? (
              <div style={{ flex: 1, width: "100%", minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={card.image} alt={card.word}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12 }} />
              </div>
            ) : null}

            <span style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: toForeign ? 28 : (card.image ? 26 : 38),
              fontWeight: 700, color: C.ink, textAlign: "center", lineHeight: 1.25,
            }}>{prompt}</span>

            <span style={{ fontSize: 10, color: C.faint }}>
              {toForeign ? `введи ${LANGUAGES[activeLang]?.label?.toLowerCase()}` : "введи переклад українською"}
            </span>

            {/* Feedback */}
            {status === "correct" && (
              <div style={{ fontSize: 15, fontWeight: 700, color: C.good.text }}>✓ Правильно!</div>
            )}
            {(status === "wrong" || status === "revealed") && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, color: C.again.text, fontWeight: 700 }}>
                  {status === "wrong" ? "✗ Неправильно" : "👁 Відповідь"}
                </div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: C.ink, marginTop: 4 }}>
                  {toForeign ? card.word : (card.translation || "—")}
                </div>
              </div>
            )}
          </div>

          {/* Input row */}
          <div style={{ flexShrink: 0, display: "flex", gap: 8, marginTop: 10 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { status === "idle" ? check() : next(); }
              }}
              disabled={status !== "idle"}
              placeholder={toForeign ? `${LANGUAGES[activeLang]?.label}…` : "Переклад українською…"}
              style={{
                ...inputStyle(), flex: 1, marginBottom: 0,
                fontSize: 16, padding: "13px 14px",
                background: status === "idle" ? C.cream : sc.bg,
                borderColor: sc.border, color: sc.text,
                transition: "all 0.2s",
              }}
            />
            <button onClick={() => speak(card.word)} style={{
              flexShrink: 0, width: 48, borderRadius: 10,
              border: `1.5px solid ${C.border}`, background: C.white,
              fontSize: 20, cursor: "pointer",
            }}>🔊</button>
          </div>

          {/* Action buttons */}
          <div style={{ flexShrink: 0, display: "flex", gap: 8, marginTop: 8 }}>
            {status === "idle" ? (
              <>
                <button onClick={() => { setStatus("revealed"); setStreak(0); setScore(s => ({...s, wrong: s.wrong+1})); }}
                  style={{ ...ghostSmallBtn(), flex: 1 }}>
                  👁 Показати
                </button>
                <Btn variant="primary" onClick={check} style={{ flex: 2 }}>
                  Перевірити ↵
                </Btn>
              </>
            ) : (
              <Btn variant="terra" onClick={next} style={{ flex: 1 }}>
                {qIdx + 1 >= total ? "Завершити 🏁" : "Далі →"}
              </Btn>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   GRAMMAR DATA
═══════════════════════════════════════════════ */
const GRAMMAR = {
  it: [
    {
      id: "it_articles", title: "Артиклі (Articoli)", icon: "🔤",
      theory: `В італійській є означений та неозначений артикль.\n\nОзначений: il (чол. одн.) · la (жін. одн.) · i (чол. мн.) · le (жін. мн.)\nПеред голосною та st-/sp-/z-/gn-: lo → gli (чол.), l' (обидва роди)\nНеозначений: un (чол.) · una (жін.) · un' (перед голосною, жін.)\n\nПриклади:\n• il libro — книга  |  i libri — книги\n• la casa — дім  |  le case — доми\n• l'uomo — чоловік  |  lo studente — студент`,
      exercises: [
        { q: "___ libro è rosso.", ans: ["il"], hint: "libro — чол. рід, однина" },
        { q: "___ casa è grande.", ans: ["la"], hint: "casa — жін. рід" },
        { q: "___ studente studia.", ans: ["lo"], hint: "перед st- → lo" },
        { q: "___ amica è gentile.", ans: ["l'"], hint: "перед голосною → l'" },
        { q: "___ libri sono nuovi.", ans: ["i"], hint: "libri — чол. мн." },
        { q: "___ ragazze cantano.", ans: ["le"], hint: "ragazze — жін. мн." },
        { q: "Voglio ___ pizza.", ans: ["una"], hint: "неозначений, жін. рід" },
        { q: "Ho ___ cane.", ans: ["un"], hint: "неозначений, чол. рід" },
      ],
    },
    {
      id: "it_essere", title: "Дієслово essere (бути)", icon: "💫",
      theory: `ESSERE — бути (presente):\nio sono — я є\ntu sei — ти є\nlui/lei è — він/вона є\nnoi siamo — ми є\nvoi siete — ви є\nloro sono — вони є\n\nВикористовується для опису якостей, походження, стану.\n• Sono italiano. — Я італієць.\n• Lei è stanca. — Вона втомлена.`,
      exercises: [
        { q: "Io ___ stanco.", ans: ["sono"], hint: "io → sono" },
        { q: "Tu ___ molto bravo.", ans: ["sei"], hint: "tu → sei" },
        { q: "Lei ___ italiana.", ans: ["è"], hint: "lei → è" },
        { q: "Noi ___ amici.", ans: ["siamo"], hint: "noi → siamo" },
        { q: "Voi ___ pronti?", ans: ["siete"], hint: "voi → siete" },
        { q: "Loro ___ studenti.", ans: ["sono"], hint: "loro → sono" },
      ],
    },
    {
      id: "it_avere", title: "Дієслово avere (мати)", icon: "🤲",
      theory: `AVERE — мати (presente):\nio ho · tu hai · lui/lei ha\nnoi abbiamo · voi avete · loro hanno\n\n• Ho fame. — Я голодний.\n• Hai ragione. — Ти правий.\n• Ha vent'anni. — Йому 20 років.`,
      exercises: [
        { q: "Io ___ un gatto.", ans: ["ho"], hint: "io → ho" },
        { q: "Tu ___ fame?", ans: ["hai"], hint: "tu → hai" },
        { q: "Lei ___ una macchina.", ans: ["ha"], hint: "lei → ha" },
        { q: "Noi ___ fretta.", ans: ["abbiamo"], hint: "noi → abbiamo" },
        { q: "Voi ___ ragione.", ans: ["avete"], hint: "voi → avete" },
        { q: "Loro ___ molti amici.", ans: ["hanno"], hint: "loro → hanno" },
      ],
    },
    {
      id: "it_present", title: "Presente: дієслова на -are", icon: "⏱️",
      theory: `Дієслова на -ARE, напр. parlare (говорити):\nio parlo · tu parli · lui/lei parla\nnoi parliamo · voi parlate · loro parlano\n\nТак само: lavorare, mangiare, abitare, studiare.\n\n• Dove abiti? — Де ти живеш?\n• Mangiamo insieme! — Їмо разом!`,
      exercises: [
        { q: "Io ___ italiano. (parlare)", ans: ["parlo"], hint: "io: -o" },
        { q: "Tu ___ a Roma? (abitare)", ans: ["abiti"], hint: "tu: -i" },
        { q: "Lei ___ la pizza. (mangiare)", ans: ["mangia"], hint: "lui/lei: -a" },
        { q: "Noi ___ insieme. (lavorare)", ans: ["lavoriamo"], hint: "noi: -iamo" },
        { q: "Voi ___ molto. (studiare)", ans: ["studiate"], hint: "voi: -ate" },
        { q: "Loro ___ inglese. (parlare)", ans: ["parlano"], hint: "loro: -ano" },
      ],
    },
    {
      id: "it_plural", title: "Множина іменників", icon: "📦",
      theory: `• -o → -i: libro → libri, ragazzo → ragazzi\n• -a → -e: casa → case, ragazza → ragazze\n• -e → -i: studente → studenti, madre → madri\n• незмінні: città, caffè (наголошена голосна)\n\nВинятки: uomo → uomini`,
      exercises: [
        { q: "libro →", ans: ["libri"], hint: "-o → -i" },
        { q: "casa →", ans: ["case"], hint: "-a → -e" },
        { q: "studente →", ans: ["studenti"], hint: "-e → -i" },
        { q: "ragazza →", ans: ["ragazze"], hint: "-a → -e" },
        { q: "uomo →", ans: ["uomini"], hint: "неправильна форма" },
        { q: "città →", ans: ["città"], hint: "незмінне — наголошена -à" },
      ],
    },
    {
      id: "it_ire_ere", title: "Presente: -ere та -ire дієслова", icon: "🔄",
      theory: `Дієслова на -ERE, напр. scrivere (писати):\nio scrivo · tu scrivi · lui/lei scrive\nnoi scriviamo · voi scrivete · loro scrivono\n\nТак само: leggere (читати), vedere (бачити), prendere (брати), mettere (класти), chiudere (закривати).\n\nДієслова на -IRE: два типи\nТип A — dormire (спати):\nio dormo · tu dormi · lui/lei dorme\nnoi dormiamo · voi dormite · loro dormono\n\nТип B — з -isc- (capire — розуміти):\nio capisco · tu capisci · lui/lei capisce\nnoi capiamo · voi capite · loro capiscono\n\nТип B: capire, finire, preferire, pulire, costruire.`,
      exercises: [
        { q: "Io ___ un libro. (leggere)", ans: ["leggo"], hint: "io: -o" },
        { q: "Tu ___ bene. (scrivere)", ans: ["scrivi"], hint: "tu: -i" },
        { q: "Lei ___ la televisione. (vedere)", ans: ["vede"], hint: "lui/lei: -e" },
        { q: "Noi ___ il caffè. (prendere)", ans: ["prendiamo"], hint: "noi: -iamo" },
        { q: "Voi ___ la porta. (chiudere)", ans: ["chiudete"], hint: "voi: -ete" },
        { q: "Loro ___ il film. (vedere)", ans: ["vedono"], hint: "loro: -ono" },
        { q: "Io non ___ l'italiano. (capire)", ans: ["capisco"], hint: "capire → -isc- (tipo B)" },
        { q: "Tu ___ l'esercizio? (finire)", ans: ["finisci"], hint: "finire → -isci (tipo B)" },
        { q: "Lui ___ il tè. (preferire)", ans: ["preferisce"], hint: "preferire → -isce (tipo B)" },
        { q: "Noi ___ tardi. (dormire)", ans: ["dormiamo"], hint: "dormire → tipo A: -iamo" },
      ],
    },
    {
      id: "it_passato_prossimo", title: "Passato prossimo (минулий час)", icon: "🕰️",
      theory: `Passato prossimo = avere/essere + participio passato\n\nParticipo passato:\n• -are → -ato: parlare → parlato\n• -ere → -uto: vendere → venduto\n• -ire → -ito: dormire → dormito\n\nНеправильні:\nfare→fatto · dire→detto · vedere→visto\nscrivere→scritto · aprire→aperto · leggere→letto\nvenire→venuto · essere→stato · nascere→nato\n\nЗ AVERE: дієслова дії (mangiare, vedere, fare…)\nHo mangiato. · Hai visto il film?\n\nЗ ESSERE: рух, зміна стану (andare, venire, nascere, morire, stare, essere…)\nParticip. узгоджується з підметом!\nSono andato/a. · Siamo andati/e.\nÈ arrivata. (жін.)`,
      exercises: [
        { q: "Ieri io ___ la pizza. (mangiare)", ans: ["ho mangiato"], hint: "mangiare + avere → ho mangiato" },
        { q: "Tu ___ il film? (vedere)", ans: ["hai visto"], hint: "vedere → visto (нерег.)" },
        { q: "Lei ___ a Roma. (andare)", ans: ["è andata"], hint: "andare + essere, жін. → -a" },
        { q: "Noi ___ tardi. (arrivare)", ans: ["siamo arrivati"], hint: "arrivare + essere, чол. мн." },
        { q: "Loro ___ una lettera. (scrivere)", ans: ["hanno scritto"], hint: "scrivere → scritto (нерег.)" },
        { q: "Marco ___ alle 8. (uscire)", ans: ["è uscito"], hint: "uscire + essere, чол." },
        { q: "Io ___ a Milano. (nascere)", ans: ["sono nato", "sono nata"], hint: "nascere + essere" },
        { q: "Voi ___ bene? (stare)", ans: ["siete stati", "siete state"], hint: "stare + essere" },
      ],
    },
    {
      id: "it_imperfetto", title: "Imperfetto (незакінчена минула дія)", icon: "🌀",
      theory: `Imperfetto — тривала або повторювана дія в минулому.\n\nParl-ARE → parlavo:\nio parlavo · tu parlavi · lui/lei parlava\nnoi parlavamo · voi parlavate · loro parlavano\n\nVed-ERE → vedevo (аналогічно)\nDorm-IRE → dormivo (аналогічно)\n\nНеправильні:\nessere: ero, eri, era, eravamo, eravate, erano\nfare: facevo, facevi, faceva…\ndire: dicevo, dicevi, diceva…\n\nКоли: Da bambino mangiavo la pizza ogni giorno.\n(Дитиною я щодня їв піцу.)\nMentre leggevo, lui dormiva.\n(Поки я читав, він спав.)`,
      exercises: [
        { q: "Da bambino io ___ molto. (giocare)", ans: ["giocavo"], hint: "-are → -avo" },
        { q: "Tu ___ sempre tardi. (arrivare)", ans: ["arrivavi"], hint: "-are → -avi" },
        { q: "Lei ___ spesso. (sorridere)", ans: ["sorrideva"], hint: "-ere → -eva" },
        { q: "Noi ___ in centro. (abitare)", ans: ["abitavamo"], hint: "-are → -avamo" },
        { q: "Voi ___ ogni sera. (uscire)", ans: ["uscivate", "uscivate"], hint: "-ire → -ivate" },
        { q: "Loro ___ italiano. (parlare)", ans: ["parlavano"], hint: "-are → -avano" },
        { q: "Io ___ studente. (essere)", ans: ["ero"], hint: "essere → ero (нерег.)" },
        { q: "Lui ___ il medico. (fare)", ans: ["faceva"], hint: "fare → faceva (нерег.)" },
      ],
    },
    {
      id: "it_futuro", title: "Futuro semplice (майбутній час)", icon: "🚀",
      theory: `Futuro semplice — майбутній час.\n\nParlare → parler-:\nparlerò · parlerai · parlerà\nparleremo · parlerete · parleranno\n\nVendere → vender-:\nvenderò · venderai · venderà…\n\nDormire → dormir-:\ndormirò · dormirai · dormirà…\n\nНеправильні (скорочені основи):\nessere → sarò · avere → avrò · fare → farò\nandare → andrò · venire → verrò\npotere → potrò · dovere → dovrò\nvolere → vorrò · sapere → saprò\n\nВикористовується також для припущень:\nChe ore sono? — Saranno le tre.\n(Мабуть, третя година.)`,
      exercises: [
        { q: "Domani io ___ a Roma. (andare)", ans: ["andrò"], hint: "andare → andr- (нерег.)" },
        { q: "Tu ___ con noi? (venire)", ans: ["verrai"], hint: "venire → verr- (нерег.)" },
        { q: "Lei ___ alle 8. (arrivare)", ans: ["arriverà"], hint: "-are → -erà" },
        { q: "Noi ___ la cena. (preparare)", ans: ["prepareremo"], hint: "-are → -eremo" },
        { q: "Voi ___ in Italia? (restare)", ans: ["resterete"], hint: "-are → -erete" },
        { q: "Loro ___ il film. (vedere)", ans: ["vedranno"], hint: "-ere → -ranno" },
        { q: "Io ___ medico. (essere)", ans: ["sarò"], hint: "essere → sarò (нерег.)" },
        { q: "Lui ___ tempo. (avere)", ans: ["avrà"], hint: "avere → avr- (нерег.)" },
      ],
    },
    {
      id: "it_condizionale", title: "Condizionale presente (умовний спосіб)", icon: "💭",
      theory: `Condizionale presente — «я б…», ввічливі прохання, умови.\n\nОснова = та сама, що у futuro + закінчення:\n-ei · -esti · -ebbe · -emmo · -este · -ebbero\n\nparlare → parlerei, parleresti, parlerebbe…\nessere → sarei, saresti, sarebbe…\navere → avrei, avresti, avrebbe…\nandare → andrei · venire → verrei\nfare → farei · potere → potrei\nvolere → vorrei · dovere → dovrei\n\nПриклади:\nVorrei un caffè. — Я б хотів каву.\nPotresti aiutarmi? — Міг би допомогти?\nDovresti studiare. — Тобі варто вчитися.`,
      exercises: [
        { q: "Io ___ un caffè. (volere)", ans: ["vorrei"], hint: "volere → vorrei (нерег.)" },
        { q: "Tu ___ venire? (potere)", ans: ["potresti"], hint: "potere → potr- + -esti" },
        { q: "Lei ___ a casa. (restare)", ans: ["resterebbe"], hint: "-are → -erebbe" },
        { q: "Noi ___ insieme. (parlare)", ans: ["parleremmo"], hint: "-are → -eremmo" },
        { q: "Voi ___ studiare. (dovere)", ans: ["dovreste"], hint: "dovere → dovr- + -este" },
        { q: "Loro ___ contenti. (essere)", ans: ["sarebbero"], hint: "essere → sar- + -ebbero" },
        { q: "Io ___ farlo. (fare)", ans: ["farei"], hint: "fare → farei (нерег.)" },
      ],
    },
    {
      id: "it_congiuntivo", title: "Congiuntivo presente (кон'юнктив)", icon: "🎭",
      theory: `Congiuntivo presente — після виразів сумніву, бажання, емоцій.\n\nParl-ARE → parli:\n(che) io parli · tu parli · lui/lei parli\nnoi parliamo · voi parliate · loro parlino\n\nVed-ERE → veda:\nвед- + -a · -a · -a · -iamo · -iate · -ano\n\nDorm-IRE → dorma (або capire → capisca)\n\nНеправильні:\nessere: sia, sia, sia, siamo, siate, siano\navere: abbia · fare: faccia · andare: vada\nvenire: venga · potere: possa · sapere: sappia\n\nПісля: pensare che, credere che, sperare che,\nvolere che, è necessario che, sebbene, affinché…\n• Penso che lui sia stanco. (Думаю, він втомлений)\n• Voglio che tu venga. (Хочу, щоб ти прийшов)`,
      exercises: [
        { q: "Penso che lui ___ stanco. (essere)", ans: ["sia"], hint: "essere → sia" },
        { q: "Voglio che tu ___ qui. (venire)", ans: ["venga"], hint: "venire → venga" },
        { q: "Credo che lei ___ ragione. (avere)", ans: ["abbia"], hint: "avere → abbia" },
        { q: "Spero che voi ___ bene. (stare)", ans: ["stiate"], hint: "stare → stiate" },
        { q: "È meglio che tu ___. (partire)", ans: ["parta"], hint: "-ire → -a" },
        { q: "Sebbene loro ___ ricchi…", ans: ["siano"], hint: "essere → siano (мн.)" },
        { q: "Voglio che tu ___ la verità. (dire)", ans: ["dica"], hint: "dire → dica" },
      ],
    },
    {
      id: "it_pronouns", title: "Займенники (Pronomi)", icon: "👤",
      theory: `Особові займенники:\nio · tu · lui/lei · noi · voi · loro\n\nПрямий додаток (Complemento oggetto diretto):\nmi (мене) · ti (тебе) · lo/la (його/її)\nci (нас) · vi (вас) · li/le (їх)\n\nНепрямий (Complemento oggetto indiretto):\nmi (мені) · ti (тобі) · gli/le (йому/їй)\nci (нам) · vi (вам) · gli (їм)\n\nРефлексивні: mi · ti · si · ci · vi · si\n\nПозиція: перед дієсловом (або після інфінітива злито)\n• Lo vedo. — Я його бачу.\n• Gli parlo. — Я з ним говорю.\n• Mi chiamo Marco. — Мене звати Марко.\n• Voglio vederlo. — Хочу його побачити.`,
      exercises: [
        { q: "Non ___ vedo. (його)", ans: ["lo"], hint: "masc. diretto → lo" },
        { q: "___ chiamo Marco. (рефл.)", ans: ["Mi"], hint: "рефлексивний → mi" },
        { q: "___ parlo ogni giorno. (їй)", ans: ["Le"], hint: "indir. жін. → le" },
        { q: "Voglio veder___. (їх, жін.)", ans: ["le"], hint: "після інф.: vederle" },
        { q: "___ vediamo domani! (нас → нас)", ans: ["Ci"], hint: "ci = нас/нам" },
        { q: "Non ___ capisco. (тебе)", ans: ["ti"], hint: "diretto 2 ос. → ti" },
        { q: "Hai parlato? — Sì, ___ ho parlato. (з ним)", ans: ["gli"], hint: "indir. чол. → gli" },
      ],
    },
    {
      id: "it_prepositions", title: "Прийменники (Preposizioni)", icon: "🔗",
      theory: `Основні прийменники та їх злиття з артиклем:\n\ndi + il → del · di + la → della · di + i → dei\nda + il → dal · da + la → dalla\na + il → al · a + la → alla · a + i → ai\nin + il → nel · in + la → nella\nsu + il → sul · su + la → sulla\n\nВживання:\n• di — приналежність, матеріал, походження\n  il libro di Marco · una tazza di caffè\n• a — місце (місто!), напрямок, час\n  Vado a Roma. · Sono a casa.\n• da — від кого, з якого часу, мета\n  Vengo da Milano. · Studio da tre anni.\n• in — в (країна, кімната, транспорт)\n  in Italia · in cucina · in treno\n• su — на (поверхня), про\n  sul tavolo · un libro su Roma\n• per — для, щоб, через, тривалість\n  per te · parto per Roma`,
      exercises: [
        { q: "Vado ___ Roma.", ans: ["a"], hint: "місто → a" },
        { q: "Vengo ___ Milano.", ans: ["da"], hint: "звідки → da" },
        { q: "Abito ___ Italia.", ans: ["in"], hint: "країна → in" },
        { q: "Il libro è ___ tavolo.", ans: ["sul"], hint: "su + il → sul" },
        { q: "Studio ___ tre anni.", ans: ["da"], hint: "з якого часу → da" },
        { q: "Una tazza ___ caffè.", ans: ["di"], hint: "матеріал/вміст → di" },
        { q: "Parto ___ le vacanze.", ans: ["per"], hint: "мета → per" },
        { q: "Sono ___ casa.", ans: ["a"], hint: "a casa — вдома" },
      ],
    },
    {
      id: "it_adjectives", title: "Прикметники (Aggettivi)", icon: "🎨",
      theory: `Прикметники узгоджуються з іменником у роді та числі.\n\nТип 1: 4 форми (-o/-a/-i/-e)\nbello (гарний): bello · bella · belli · belle\nnuovo · nuova · nuovi · nuove\n\nТип 2: 2 форми (-e/-i)\ngrande (великий/а): grande · grande · grandi · grandi\ninteressante · interessanti\n\nПозиція: зазвичай ПІСЛЯ іменника\n• una macchina rossa — червона машина\n• un libro interessante — цікава книга\n\nАЛЕ кілька коротких прикметників — ПЕРЕД:\nbello, brutto, buono, cattivo, grande, piccolo, giovane, vecchio, nuovo\n• una bella ragazza · un buon vino\n\nBUONO перед noun (як артикль): buon amico, buona amica`,
      exercises: [
        { q: "una ragazza ___. (bello, жін.)", ans: ["bella"], hint: "жін. → -a" },
        { q: "due ragazzi ___. (alto, чол.мн.)", ans: ["alti"], hint: "чол.мн. → -i" },
        { q: "le case ___. (grande, мн.)", ans: ["grandi"], hint: "тип 2: -i у мн." },
        { q: "un ___ libro. (buono, скорочено)", ans: ["buon"], hint: "buono → buon перед чол." },
        { q: "Ho una macchina ___. (rosso)", ans: ["rossa"], hint: "жін. → -a" },
        { q: "Sono ragazze ___. (simpatico)", ans: ["simpatiche"], hint: "жін.мн. -co → -che" },
        { q: "un film ___. (interessante)", ans: ["interessante"], hint: "тип 2: форма одна" },
        { q: "Ho comprato una ___ borsa. (nuovo)", ans: ["nuova"], hint: "жін. → -a" },
      ],
    },
    {
      id: "it_comparativo", title: "Порівняння (Comparativo & Superlativo)", icon: "📊",
      theory: `COMPARATIVO:\npiù + adj + di/che — більш…, ніж\nmeno + adj + di/che — менш…, ніж\ncosì... come / tanto... quanto — так само… як\n\n• Marco è più alto di Luca.\n• Questo è meno caro di quello.\n• È tanto bello quanto intelligente.\n\ndi — перед займенниками та числівниками\nche — перед двома прикметниками або інфінітивами\n\nSUPERLATIVO RELATIVO: il/la più + adj\n• È il più bello della classe.\n\nSUPERLATIVO ASSOLUTO: adj + -issimo/a/i/e\n• bellissimo · carissimo · facilissimo\n\nНЕПРАВИЛЬНІ:\nbuono → migliore (comparativo) · ottimo (superlativo)\ncattivo → peggiore · pessimo\ngrande → maggiore · massimo\npiccolo → minore · minimo`,
      exercises: [
        { q: "Marco è ___ alto ___ Luca.", ans: ["più", "di"], hint: "più ... di" },
        { q: "Questo libro è ___ interessante.", ans: ["interessantissimo"], hint: "superlativo assoluto: -issimo" },
        { q: "È il ___ bello della classe.", ans: ["più"], hint: "superlativo relativo: il più" },
        { q: "Questo vino è ___ (buono, comp.)", ans: ["migliore"], hint: "buono → migliore (нерег.)" },
        { q: "È ___ mangiare che bere.", ans: ["meglio"], hint: "bene → meglio" },
        { q: "Questa pizza è ___! (buono, sup.ass.)", ans: ["buonissima", "ottima"], hint: "buonissima або ottima" },
        { q: "È ___ caro ___ penso.", ans: ["più", "di"], hint: "più... di quanto/di + inf." },
      ],
    },
    {
      id: "it_reflexive", title: "Рефлексивні дієслова (Riflessivi)", icon: "🔁",
      theory: `Рефлексивні дієслова: дія спрямована на самого себе.\nПронунції: mi · ti · si · ci · vi · si (перед дієсловом)\n\nalzarsi (вставати):\nio mi alzo · tu ti alzi · lui/lei si alza\nnoi ci alziamo · voi vi alzate · loro si alzano\n\nПоширені:\nalzarsi — вставати · sedersi — сідати\nlavarsi — митися · vestirsi — одягатися\nchiudersi — закриватися · chiamarsi — називатися\naddormentarsi — засипати · svegliarsi — прокидатися\nsentirsi — почуватися · innamorarsi — закохуватися\n\nPassato prossimo з ESSERE! Particip. узгодж. з підметом:\nMi sono alzato/a. · Ci siamo divertiti/e.`,
      exercises: [
        { q: "Io ___ alle 7. (alzarsi)", ans: ["mi alzo"], hint: "mi + alzo" },
        { q: "Come ___ ? (chiamarsi, tu)", ans: ["ti chiami"], hint: "ti + chiami" },
        { q: "Lei ___ stanca. (sentirsi)", ans: ["si sente"], hint: "si + sente" },
        { q: "Noi ___ tardi. (svegliarsi)", ans: ["ci svegliamo"], hint: "ci + svegliamo" },
        { q: "Voi ___ alle 8. (alzarsi)", ans: ["vi alzate"], hint: "vi + alzate" },
        { q: "Ieri io ___ tardi. (addormentarsi)", ans: ["mi sono addormentato", "mi sono addormentata"], hint: "essere + part. uzg." },
        { q: "Loro ___ molto. (divertirsi, pass.pr.)", ans: ["si sono divertiti", "si sono divertite"], hint: "si sono + part.mn." },
      ],
    },
    {
      id: "it_modal", title: "Модальні дієслова (Modali)", icon: "🎛️",
      theory: `Tre modali principali + presente:\n\nPOTERE (могти, мати можливість):\nposso · puoi · può · possiamo · potete · possono\n\nDOVERE (повинен, мусити):\ndevo · devi · deve · dobbiamo · dovete · devono\n\nVOLERE (хотіти):\nvoglio · vuoi · vuole · vogliamo · volete · vogliono\n\nПісля модального → ІНФІНІТИВ:\n• Posso aiutarti. — Можу тобі допомогти.\n• Devo studiare. — Мушу вчитися.\n• Voglio un caffè. — Хочу каву. (без inf.)\n\nPassato prossimo: avere/essere (залежно від основного дієслова) + participio modale OR залишити in infinito:\n• Ho dovuto partire. / Sono dovuto/a partire.`,
      exercises: [
        { q: "Io non ___ venire. (potere)", ans: ["posso"], hint: "posso = io puoi? Ні — posso" },
        { q: "Tu ___ studiare di più. (dovere)", ans: ["devi"], hint: "tu → devi" },
        { q: "Lei ___ un caffè. (volere)", ans: ["vuole"], hint: "lui/lei → vuole" },
        { q: "Noi ___ parlare. (potere)", ans: ["possiamo"], hint: "noi → possiamo" },
        { q: "Voi ___ aspettare. (dovere)", ans: ["dovete"], hint: "voi → dovete" },
        { q: "Loro ___ partire. (volere)", ans: ["vogliono"], hint: "loro → vogliono" },
        { q: "___ aiutarmi? (potere, tu, ввічл.)", ans: ["Puoi"], hint: "tu → puoi" },
      ],
    },
    {
      id: "it_imperativo", title: "Наказовий спосіб (Imperativo)", icon: "📢",
      theory: `IMPERATIVO — наказ, прохання, інструкції.\n\nRegolare (parlare / prendere / dormire):\n         parlare   prendere  dormire\ntu:      parla!    prendi!   dormi!\nnoi:     parliamo! prendiamo! dormiamo!\nvoi:     parlate!  prendete!  dormite!\n\nЗаперечення (tu): non + INFINITO\n• Non parlare! · Non fare rumore!\n\nНеправильні (tu форма):\nessere → sii! · avere → abbi! · fare → fa'! (fai!)\ndare → da'! · stare → sta'! · andare → va'!\ndire → di'! · venire → vieni! · uscire → esci!\n\nПрономи: приєднуються до дієслова\n• Dimmi! — Скажи мені!\n• Fallo! — Зроби це!\n• Alzati! — Вставай!`,
      exercises: [
        { q: "___ attenzione! (fare, tu)", ans: ["Fa'", "Fai"], hint: "fare → fa'!/fai!" },
        { q: "___ qui! (venire, tu)", ans: ["Vieni"], hint: "venire → vieni!" },
        { q: "Non ___ tardi! (arrivare, tu)", ans: ["arrivare"], hint: "neg.tu: non + infinito" },
        { q: "___ pure! (andare, voi)", ans: ["Andate"], hint: "voi: -ate" },
        { q: "___ la verità! (dire, tu)", ans: ["Di'", "Dì"], hint: "dire → di'!" },
        { q: "___ pazienti! (essere, voi)", ans: ["Siate"], hint: "essere voi → siate" },
        { q: "___ la! (prendere, tu, con pron.)", ans: ["Prendila"], hint: "prendi + la = prendila" },
        { q: "___ mi! (dire, tu, con pron.)", ans: ["Dimmi"], hint: "di' + mi = dimmi" },
      ],
    },
    {
      id: "it_gerundio", title: "Герундій і дієприкметник (Gerundio & Participio)", icon: "🔧",
      theory: `GERUNDIO PRESENTE: -ando (-are) / -endo (-ere/-ire)\nparlare → parlando · scrivere → scrivendo · dormire → dormendo\n\nНеправильні: fare→facendo · dire→dicendo · bere→bevendo\n\nВикористовується:\n1. STARE + gerundio = дія зараз (прогресивний)\n   Sto mangiando. — Я зараз їм.\n   Stava dormendo. — Він спав (саме тоді).\n\n2. Одночасна дія:\n   Ascoltando musica, studio. — Слухаючи музику, вчуся.\n\n3. Причина/умова:\n   Essendo stanco, sono andato a letto.\n\nPARTICIPIO PRESENTE: -ante/-ente\namante (той, хто любить) · interessante\n\nPARTICIPIO PASSATO: -ato/-uto/-ito (вже вивчали)\nÈ usato come aggettivo:\nuna porta chiusa · un lavoro finito`,
      exercises: [
        { q: "Gerundio: parlare →", ans: ["parlando"], hint: "-are → -ando" },
        { q: "Gerundio: scrivere →", ans: ["scrivendo"], hint: "-ere → -endo" },
        { q: "Gerundio: fare →", ans: ["facendo"], hint: "fare → facendo (нерег.)" },
        { q: "Sto ___ la cena. (preparare)", ans: ["preparando"], hint: "stare + gerundio" },
        { q: "Stavo ___ quando hai chiamato. (dormire)", ans: ["dormendo"], hint: "-ire → -endo" },
        { q: "___ musica, mi rilasso. (ascoltare)", ans: ["Ascoltando"], hint: "gerundio = одночасна дія" },
        { q: "Gerundio: dire →", ans: ["dicendo"], hint: "dire → dicendo (нерег.)" },
      ],
    },
    {
      id: "it_ci_ne", title: "Ci e Ne partitivi", icon: "🔹",
      theory: `CI — відповідає на «де?» і «куoi?», замінює місце:\n• Vai a Roma? — Sì, ci vado. (туди йду)\n• Sei mai stato a Parigi? — Sì, ci sono stato.\n\nCI також у виразах:\nc'è / ci sono — є (існує)\nci vuole / ci vogliono — потрібно\n• C'è un problema. — Є проблема.\n• Ci vogliono due ore. — Потрібно дві години.\n\nNE — замінює частину, кількість (di + щось):\n• Quanti caffè bevi? — Ne bevo due. (їх п'ю два)\n• Parli di lavoro? — Sì, ne parlo. (про це говорю)\n• Vuoi del pane? — Sì, ne voglio un po'.\n\nNE також при виході/відходженні: andarsene\n• Me ne vado. — Я йду (звідси).`,
      exercises: [
        { q: "Vai a Roma? — Sì, ___ vado.", ans: ["ci"], hint: "ci замінює місце" },
        { q: "___ sono due persone qui.", ans: ["Ci"], hint: "c'è/ci sono = є" },
        { q: "Quanti fratelli hai? — ___ ho tre.", ans: ["Ne"], hint: "ne = їх (кількість)" },
        { q: "Parli del problema? — Sì, ___ parlo.", ans: ["ne"], hint: "ne = di + щось" },
        { q: "___ vuole un'ora per arrivare.", ans: ["Ci"], hint: "ci vuole = потрібно" },
        { q: "Sei stato a Venezia? — No, non ___ sono mai stato.", ans: ["ci"], hint: "ci = там" },
        { q: "Vuoi del vino? — Sì, ___ voglio un po'.", ans: ["ne"], hint: "ne = del vino (частина)" },
      ],
    },
    {
      id: "it_negazione", title: "Заперечення (Negazione)", icon: "🚫",
      theory: `Просте заперечення: non + дієслово\n• Non capisco. · Non ho fame.\n\nПодвійне заперечення (non + друге заперечення — НОРМА!):\nnon... mai — ніколи\nnon... niente/nulla — нічого\nnon... nessuno — ніхто\nnon... ancora — ще не\nnon... più — більше не\nnon... né... né — ні... ні\n\n• Non ho mai visto questo film.\n• Non c'è nessuno. — Нікого немає.\n• Non mangio più carne. — Більше не їм м'яса.\n• Non ho ancora finito. — Ще не закінчив.\n\nNeanche / nemmeno / neppure = теж ні:\n• Neanche io. — Я теж ні.`,
      exercises: [
        { q: "Non vado ___ al mare. (ніколи)", ans: ["mai"], hint: "non ... mai" },
        { q: "Non ho ___ da fare. (нічого)", ans: ["niente", "nulla"], hint: "non ... niente/nulla" },
        { q: "Non c'è ___ in casa. (ніхто)", ans: ["nessuno"], hint: "non ... nessuno" },
        { q: "Non ho ___ mangiato. (ще не)", ans: ["ancora"], hint: "non ... ancora" },
        { q: "Non fumo ___. (більше не)", ans: ["più"], hint: "non ... più" },
        { q: "Non voglio ___ tè ___ caffè.", ans: ["né", "né"], hint: "non ... né ... né" },
        { q: "___ io capisco. (я теж ні)", ans: ["Neanche", "Nemmeno", "Neppure"], hint: "neanche/nemmeno io" },
      ],
    },
    {
      id: "it_questions", title: "Питання і питальні слова", icon: "❓",
      theory: `Порядок слів у питанні: найчастіше питальне слово + дієслово + підмет\n\nЧи (yes/no) → інтонація або відсутність слова:\n• Parli italiano? — Ти говориш по-італійськи?\n\nПитальні слова:\nChi? — хто? (Chi è?)  \nChe cosa? / Cosa? / Che? — що?\nDove? — де? (Dove vai?)\nCome? — як? (Come stai?)\nQuando? — коли?\nPerché? — чому? / тому що\nQuanto/a/i/e? — скільки?\nQuale/i? — який/яка/які?\nDi dove sei? — Звідки ти?\nCon chi? · Per chi? · Da dove?\n\nВідповідь на Perché = Perché + indicativo:\n• Perché sei stanco? — Perché non ho dormito.`,
      exercises: [
        { q: "___ sei? (хто ти)", ans: ["Chi"], hint: "Chi = хто" },
        { q: "___ vai? (куди йдеш)", ans: ["Dove"], hint: "Dove = де/куди" },
        { q: "___ stai? (як справи)", ans: ["Come"], hint: "Come = як" },
        { q: "___ arrivi? (коли приїдеш)", ans: ["Quando"], hint: "Quando = коли" },
        { q: "___ anni hai? (скільки років)", ans: ["Quanti"], hint: "Quanti = скільки (чол.мн.)" },
        { q: "___ sei stanco? (чому)", ans: ["Perché"], hint: "Perché = чому" },
        { q: "___ libro preferisci? (який)", ans: ["Quale"], hint: "Quale = який" },
        { q: "___ sei? (звідки)", ans: ["Di dove"], hint: "Di dove sei?" },
      ],
    },
    {
      id: "it_numbers_time", title: "Числа, час і дата", icon: "🔢",
      theory: `ЧИСЛА:\n0 zero · 1 uno · 2 due · 3 tre · 4 quattro · 5 cinque\n6 sei · 7 sette · 8 otto · 9 nove · 10 dieci\n11 undici · 12 dodici · 13 tredici · 20 venti\n21 ventuno · 22 ventidue · 30 trenta · 100 cento\n1000 mille · 2000 duemila\n\nЧАС:\nChe ore sono? — Котра година?\nÈ l'una. (1:00) · Sono le due. (2:00)\nSono le tre e mezza. (3:30)\nSono le quattro e un quarto. (4:15)\nSono le cinque meno un quarto. (4:45)\n\nDATA:\nQuanto è oggi? / Quanti ne abbiamo oggi?\nÈ il tre marzo. · Oggi è lunedì.\n\nГІОРНИ: lunedì · martedì · mercoledì\ngiovedì · venerdì · sabato · domenica\n\nМЕСІ: gennaio · febbraio · marzo · aprile\nmaggio · giugno · luglio · agosto\nsettembre · ottobre · novembre · dicembre`,
      exercises: [
        { q: "15 + 7 = ___", ans: ["ventidue"], hint: "15=quindici, 7=sette, 22=ventidue" },
        { q: "Che ore sono? 3:00 →", ans: ["Sono le tre"], hint: "Sono le + число" },
        { q: "Che ore sono? 1:00 →", ans: ["È l'una"], hint: "1:00 → È l'una" },
        { q: "3:30 →", ans: ["Sono le tre e mezza"], hint: "e mezza = і половина" },
        { q: "Giovedì viene dopo ___.", ans: ["mercoledì"], hint: "lun-mar-mer-gio..." },
        { q: "Il mese dopo marzo è ___.", ans: ["aprile"], hint: "mar-apr" },
        { q: "Come si dice 1000?", ans: ["mille"], hint: "1000 = mille" },
      ],
    },
    {
      id: "it_trapassato", title: "Trapassato prossimo (давноминулий)", icon: "⏮️",
      theory: `Trapassato prossimo = avere/essere (imperfetto) + participio passato\n= дія, що відбулась ДО іншої минулої дії\n\nCon AVERE:\navevo/avevi/aveva/avevamo/avevate/avevano + p.p.\n• Avevo già mangiato quando sei arrivato.\n  (Я вже поїв, коли ти прийшов.)\n\nCon ESSERE:\nero/eri/era/eravamo/eravate/erano + p.p.\n• Era già partita quando ho chiamato.\n  (Вона вже поїхала, коли я зателефонував.)\n\nТипові маркери: già (вже), appena (щойно), non ancora (ще не), dopo che (після того як)\n• Dopo che aveva finito, è uscito.`,
      exercises: [
        { q: "Quando sei arrivato, io ___ già mangiato.", ans: ["avevo"], hint: "avere imp.: avevo" },
        { q: "Lei ___ già partita. (essere)", ans: ["era"], hint: "essere imp.: era" },
        { q: "Non ___ ancora dormito quando ha chiamato.", ans: ["avevo"], hint: "non ancora + trapassato" },
        { q: "Dopo che ___ finito, siamo usciti. (avere)", ans: ["avevamo"], hint: "noi: avevamo" },
        { q: "Loro ___ già visto quel film.", ans: ["avevano"], hint: "loro: avevano" },
        { q: "Non ___ mai stato a Roma prima. (essere)", ans: ["ero"], hint: "io: ero stato" },
      ],
    },
    {
      id: "it_congiuntivo_imp", title: "Congiuntivo imperfetto", icon: "🎭",
      theory: `Congiuntivo imperfetto — після виразів бажання/думки у минулому\n(головне речення в минулому → congiuntivo imperfetto)\n\nparlare → parlass-:\nche io parlassi · tu parlassi · lui/lei parlasse\nnoi parlassimo · voi parlaste · loro parlassero\n\nvendere → vendes-:\nvendessi · vendessi · vendesse · vendessimo · vendeste · vendessero\n\ndormire → dormi-:\ndormissi · dormissi · dormisse…\n\nНеправильні:\nessere: fossi · fossi · fosse · fossimo · foste · fossero\navere: avessi · avessi · avesse…\nfare: facessi · venire: venissi · dare: dessi\n\nПеріод гіпотетичний (реальний/нереальний — тип 2):\nSe + congiuntivo imperfetto → condizionale presente\n• Se avessi tempo, viaggerei di più.\n  (Якби мав час, подорожував би більше.)`,
      exercises: [
        { q: "Pensavo che lui ___ stanco. (essere)", ans: ["fosse"], hint: "essere → fosse" },
        { q: "Volevo che tu ___. (venire)", ans: ["venissi"], hint: "venire → venissi" },
        { q: "Se ___ ricco, comprerei una villa. (essere)", ans: ["fossi"], hint: "fossi = якби я був" },
        { q: "Speravo che voi ___ capito. (avere)", ans: ["aveste"], hint: "avere → aveste" },
        { q: "Se ___ tempo, studierei. (avere)", ans: ["avessi"], hint: "avere → avessi" },
        { q: "Era necessario che loro ___. (partire)", ans: ["partissero"], hint: "-ire → -issero" },
      ],
    },
    {
      id: "it_periodo_ipotetico", title: "Умовні речення (Periodo ipotetico)", icon: "⚡",
      theory: `3 типи умовних речень:\n\nТИП 1 — реальна умова (теперішнє/майбутнє):\nSe + indicativo presente → indicativo futuro\n• Se ho tempo, verrò. (Якщо матиму час, прийду.)\n\nТИП 2 — нереальна умова (теперішнє):\nSe + congiuntivo imperfetto → condizionale presente\n• Se avessi soldi, comprerei una casa.\n  (Якби мав гроші, купив би будинок.)\n\nТИП 3 — нереальна умова (минуле):\nSe + congiuntivo trapassato → condizionale passato\n• Se avessi studiato, avrei superato l'esame.\n  (Якби вчив, склав би іспит.)\n\nMAGARI + congiuntivo = «якби тільки»:\n• Magari potessi venire! (Якби тільки міг прийти!)`,
      exercises: [
        { q: "Se ___ tempo, verrò. (avere, тип 1)", ans: ["ho"], hint: "тип 1: presente indicativo" },
        { q: "Se ___ soldi, viaggerei. (avere, тип 2)", ans: ["avessi"], hint: "тип 2: cong.imp." },
        { q: "Se ___ studiato, avresti passato. (тип 3)", ans: ["avessi"], hint: "тип 3: cong.trap." },
        { q: "Se fossi ricco, ___ una villa. (comprare)", ans: ["comprerei"], hint: "condizionale presente" },
        { q: "Se avesse chiamato, ___ risposto. (io)", ans: ["avrei risposto"], hint: "condizionale passato" },
        { q: "Se fa bel tempo, ___ al mare. (andare, noi)", ans: ["andiamo"], hint: "тип 1: presente" },
      ],
    },
    {
      id: "it_passive", title: "Пасивний стан (Forma passiva)", icon: "↩️",
      theory: `Пасив = essere + participio passato (узгоджується з підметом)\n\nПРЕЗЕНТ: La torta è mangiata da Marco.\nPASSATO: La torta è stata mangiata da Marco.\nIMPERFETTO: La torta veniva mangiata ogni giorno.\nFUTURO: La torta sarà mangiata domani.\n\nda = ким/чим виконана дія (аgente)\n\nALTERNATIВА — SI passivante:\n• Si parla italiano qui. — Тут говорять по-італійськи.\n• Si vendono case. — Продаються будинки.\n• Si mangia bene in Italia. — В Італії добре їдять.\n\nAndare + p.p. = обов'язковість (треба зробити):\n• Questo lavoro va fatto subito. (треба зробити негайно)`,
      exercises: [
        { q: "La lettera ___ scritta da Marco.", ans: ["è"], hint: "essere presente + p.p." },
        { q: "Il film ___ ___ diretto da Fellini.", ans: ["è stato"], hint: "passato: è stato" },
        { q: "___ parla italiano qui. (si passivante)", ans: ["Si"], hint: "si + verbo" },
        { q: "Le case ___ vendute. (passivo pres.)", ans: ["sono"], hint: "essere + p.p.мн." },
        { q: "Questo ___ fatto subito. (andare + obbligo)", ans: ["va"], hint: "andare + p.p." },
        { q: "___ vendono molti libri qui.", ans: ["Si"], hint: "si vendono = пасив" },
      ],
    },
    {
      id: "it_discorso_indiretto", title: "Пряма та непряма мова", icon: "💬",
      theory: `Непряма мова — переказ чужих слів.\n\nЗміни часів при переказі (головне речення в минулому):\npresente → imperfetto\npassato prossimo → trapassato prossimo\nfuturo → condizionale\nimperativo → di + infinito\n\nЗміни займенників і обставин:\nqui → lì/là · oggi → quel giorno · domani → il giorno dopo\nieri → il giorno prima · questo → quello\n\nПриклади:\n«Sono stanco.» → Disse che era stanco.\n«Verrò domani.» → Disse che sarebbe venuto il giorno dopo.\n«Vieni qui!» → Mi disse di andare lì.\n«Ho mangiato.» → Disse che aveva mangiato.`,
      exercises: [
        { q: "«Sono felice.» → Disse che ___ felice.", ans: ["era"], hint: "presente → imperfetto" },
        { q: "«Verrò.» → Disse che ___.", ans: ["sarebbe venuto", "sarebbe venuta"], hint: "futuro → condizionale" },
        { q: "«Ho mangiato.» → Disse che ___ mangiato.", ans: ["aveva"], hint: "pass.pr. → trapassato" },
        { q: "«Vieni!» → Mi disse ___ andare.", ans: ["di"], hint: "imperativo → di + inf." },
        { q: "«Abito qui.» → Disse che abitava ___.", ans: ["lì", "là"], hint: "qui → lì" },
        { q: "«Studio ogni giorno.» → Disse che ___ ogni giorno.", ans: ["studiava"], hint: "presente → imperfetto" },
      ],
    },
    {
      id: "it_subordinate", title: "Складнопідрядні речення", icon: "🔗",
      theory: `ПРИЧИНА (perché, poiché, dato che, siccome):\n• Non sono venuto perché ero malato.\n  siccome/poiché/dato che + indicativo (на початку)\n\nМЕТА (affinché, perché + congiuntivo):\n• Parlo lentamente affinché tu capisca.\n\nЧАС (quando, mentre, appena, dopo che, prima che):\n• Quando arrivi, chiamami.\n• Mentre studiavo, ascoltavo musica.\n• Appena finirò, ti chiamo.\n• Prima che parta, dobbiamo parlare. (+ cong.)\n\nУМОВА (se → già вивчали)\n\nКОНЦЕСІЯ (sebbene, benché, nonostante + cong.):\n• Sebbene sia stanco, continuo a lavorare.\n\nНАСЛІДОК (così... che, tanto... da):\n• Era così stanco che si è addormentato.\n\nВІДНОСНИ (che, cui, il quale):\n• Il libro che leggo è interessante.\n• La persona con cui parlo è mia amica.`,
      exercises: [
        { q: "___ ero malato, non sono venuto.", ans: ["Perché", "Poiché", "Dato che", "Siccome"], hint: "причина → perché/poiché/siccome" },
        { q: "Parlo lento ___ tu capisca.", ans: ["affinché", "perché"], hint: "мета + congiuntivo" },
        { q: "___ stanco, continuo. (sebbene)", ans: ["Sebbene sia", "Benché sia"], hint: "concessione + cong." },
        { q: "Il libro ___ leggo è bello.", ans: ["che"], hint: "відносний займ. → che" },
        { q: "La persona con ___ parlo è simpatica.", ans: ["cui"], hint: "prep + cui" },
        { q: "Era ___ stanco ___ dormiva in piedi.", ans: ["così", "che"], hint: "così ... che" },
      ],
    },
  ],
  pl: [
    {
      id: "pl_gender", title: "Рід іменників", icon: "🧩",
      theory: `3 роди:\n• Чоловічий (męski): закінчення на приголосну → stół, brat, pies\n• Жіночий (żeński): -a/-i → mama, kobieta, pani\n• Середній (nijaki): -o/-e/-ę/-um → okno, dziecko, imię`,
      exercises: [
        { q: "Рід: dom", ans: ["męski", "чоловічий"], hint: "закінч. на приголосну" },
        { q: "Рід: kobieta", ans: ["żeński", "жіночий"], hint: "закінч. на -a" },
        { q: "Рід: okno", ans: ["nijaki", "середній"], hint: "закінч. на -o" },
        { q: "Рід: imię", ans: ["nijaki", "середній"], hint: "закінч. на -ę" },
        { q: "Рід: brat", ans: ["męski", "чоловічий"], hint: "закінч. на приголосну" },
      ],
    },
    {
      id: "pl_present", title: "Теперішній час", icon: "⏱️",
      theory: `I кон'югація (-ać), czytać (читати):\nja czytam · ty czytasz · on/ona czyta\nmy czytamy · wy czytacie · oni czytają\n\nII кон'югація (-ić/-yć), mówić (говорити):\nja mówię · ty mówisz · on/ona mówi\nmy mówimy · wy mówicie · oni mówią`,
      exercises: [
        { q: "Ja ___ książkę. (czytać)", ans: ["czytam"], hint: "ja: -m" },
        { q: "Ty ___ po polsku? (mówić)", ans: ["mówisz"], hint: "ty: -sz" },
        { q: "Ona ___ dużo. (pracować)", ans: ["pracuje"], hint: "-ować → -uje" },
        { q: "My ___ razem. (mieszkać)", ans: ["mieszkamy"], hint: "my: -my" },
        { q: "Oni ___ do szkoły. (iść)", ans: ["idą"], hint: "oni: -ą" },
      ],
    },
    {
      id: "pl_cases", title: "Відмінки — основи", icon: "🔢",
      theory: `7 відмінків:\n1. Mianownik (Nom.) — хто? що?\n2. Dopełniacz (Gen.) — кого? чого? (після negacji, після liczebników)\n3. Celownik (Dat.) — кому? чому?\n4. Biernik (Acc.) — кого? що? (прямий додаток)\n5. Narzędnik (Ins.) — ким? чим? (jestem + Ins.)\n6. Miejscownik (Loc.) — про кого? де? (після: w, na, o, przy)\n7. Wołacz (Voc.) — звертання`,
      exercises: [
        { q: "Nie ma ___ (stół, Gen.)", ans: ["stołu"], hint: "Gen. чол.: -u" },
        { q: "Daję to ___ (kolega, Dat.)", ans: ["koledze"], hint: "Dat. чол.: -e" },
        { q: "Widzę ___ (pies, Acc.)", ans: ["psa"], hint: "Acc. одуш. = Gen." },
        { q: "Jestem ___ (student, Ins.)", ans: ["studentem"], hint: "Ins. чол.: -em" },
        { q: "Mówię o ___ (Polska, Loc.)", ans: ["Polsce"], hint: "Loc. жін.: -ce" },
      ],
    },
  ],
  en: [
    {
      id: "en_tenses", title: "Present Simple vs Continuous", icon: "⏱️",
      theory: `Present Simple — регулярні дії, факти:\nI work · you work · he/she works (+s у 3-й особі)\n• I work every day.\n• She reads books.\n\nPresent Continuous — дія зараз:\nam/is/are + V-ing\n• I am working now.\n• They are eating lunch.`,
      exercises: [
        { q: "She ___ to school every day. (go)", ans: ["goes"], hint: "Simple, 3 ос. → +es" },
        { q: "I ___ TV right now. (watch)", ans: ["am watching"], hint: "зараз → am + -ing" },
        { q: "They ___ football on Sundays. (play)", ans: ["play"], hint: "щонеділі → Simple" },
        { q: "He ___ a book now. (read)", ans: ["is reading"], hint: "now → Continuous" },
        { q: "Water ___ at 100°C. (boil)", ans: ["boils"], hint: "факт → Simple, 3 ос." },
        { q: "We ___ dinner now. (have)", ans: ["are having"], hint: "now → Continuous" },
      ],
    },
    {
      id: "en_articles", title: "Articles: a / an / the", icon: "🔤",
      theory: `a — вперше згадуємо, приголосний звук: a cat, a university\nan — голосний звук: an apple, an hour\nthe — конкретний, вже відомий; єдиний у своєму роді\nБез артикля — загальний сенс, власні назви\n\n• I saw a dog. The dog was big.\n• The sun rises in the east.\n• I like cats. (загалом)`,
      exercises: [
        { q: "She is ___ teacher.", ans: ["a"], hint: "teacher → приголосний звук" },
        { q: "He ate ___ apple.", ans: ["an"], hint: "apple → голосний звук" },
        { q: "___ moon is bright tonight.", ans: ["The"], hint: "єдина у своєму роді" },
        { q: "I have ___ idea!", ans: ["an"], hint: "idea → голосний звук" },
        { q: "We went to ___ park.", ans: ["the"], hint: "конкретний, відомий" },
        { q: "She is ___ honest person.", ans: ["an"], hint: "honest → звук [ɒ], голосний" },
      ],
    },
    {
      id: "en_past", title: "Past Simple", icon: "🕰️",
      theory: `Правильні: + -ed  →  work→worked, play→played\n\nНеправильні (треба вчити):\ngo→went · come→came · see→saw\ntake→took · give→gave · eat→ate\nhave→had · be→was/were · do→did\n\nЗапитання: Did + інфінітив?\nЗаперечення: didn't + інфінітив`,
      exercises: [
        { q: "I ___ to the store. (go)", ans: ["went"], hint: "go → went" },
        { q: "She ___ a cake. (bake)", ans: ["baked"], hint: "правильне: + -d" },
        { q: "They ___ the movie. (see)", ans: ["saw"], hint: "see → saw" },
        { q: "We ___ dinner. (have)", ans: ["had"], hint: "have → had" },
        { q: "___ you call him?", ans: ["Did"], hint: "питання: Did + inf." },
        { q: "She ___ happy. (be, одн.)", ans: ["was"], hint: "be → was (одн.)" },
      ],
    },
    {
      id: "en_modal", title: "Модальні дієслова", icon: "🎛️",
      theory: `can — вміти / мати можливість\ncould — міг / ввічливе прохання\nmust — повинен (внутрішня необхідність)\nhave to — повинен (зовнішня вимога)\nshould — варто (рекомендація)\nmay/might — можливо / дозвіл\n\nПісля модальних → інфінітив БЕЗ to\n✓ She can swim.   ✗ She can to swim.`,
      exercises: [
        { q: "You ___ smoke here. (заборона)", ans: ["cannot", "can't", "must not", "mustn't"], hint: "can't / must not" },
        { q: "He ___ speak French. (вміє)", ans: ["can"], hint: "вміння → can" },
        { q: "I ___ go to the doctor. (треба)", ans: ["must", "have to", "should"], hint: "must / have to" },
        { q: "___ I open the window? (дозвіл)", ans: ["May", "Can", "Could"], hint: "May/Can/Could + I" },
        { q: "You ___ rest more. (рада)", ans: ["should"], hint: "рекомендація → should" },
        { q: "It ___ rain tomorrow. (можливо)", ans: ["might", "may"], hint: "можливо → might/may" },
      ],
    },
  ],
};

/* ═══════════════════════════════════════════════
   GRAMMAR VIEW
═══════════════════════════════════════════════ */
function GrammarView({ activeLang }) {
  const topics   = GRAMMAR[activeLang] || [];
  const [sel, setSel]       = useState(null);   // selected topic id
  const [screen, setScreen] = useState("list"); // list | theory | quiz
  const [qIdx, setQIdx]     = useState(0);
  const [input, setInput]   = useState("");
  const [status, setStatus] = useState("idle"); // idle | correct | wrong
  const [score, setScore]   = useState({ correct: 0, wrong: 0 });
  const [done, setDone]     = useState(false);
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ifc_grammar") || "{}"); } catch { return {}; }
  });
  const inputRef = useRef(null);

  useEffect(() => { setSel(null); setScreen("list"); }, [activeLang]);
  useEffect(() => { if (screen === "quiz" && status === "idle") inputRef.current?.focus(); }, [qIdx, status, screen]);

  const topic = topics.find(t => t.id === sel);

  const saveProgress = (id, data) => {
    const next = { ...progress, [id]: data };
    setProgress(next);
    localStorage.setItem("ifc_grammar", JSON.stringify(next));
  };

  const startQuiz = () => {
    setQIdx(0); setInput(""); setStatus("idle");
    setScore({ correct: 0, wrong: 0 }); setDone(false);
    setScreen("quiz");
  };

  const checkAnswer = () => {
    if (!topic || status !== "idle") return;
    const ex  = topic.exercises[qIdx];
    const ok  = ex.ans.some(a => normalize(a) === normalize(input));
    setStatus(ok ? "correct" : "wrong");
    const ns = { correct: score.correct + (ok ? 1 : 0), wrong: score.wrong + (ok ? 0 : 1) };
    setScore(ns);
    if (qIdx + 1 >= topic.exercises.length) {
      const pct = Math.round((ns.correct / topic.exercises.length) * 100);
      saveProgress(topic.id, { pct, date: Date.now() });
    }
  };

  const nextQ = () => {
    if (qIdx + 1 >= (topic?.exercises.length || 0)) { setDone(true); return; }
    setQIdx(q => q + 1); setInput(""); setStatus("idle");
  };

  const restart = () => {
    setQIdx(0); setInput(""); setStatus("idle");
    setScore({ correct: 0, wrong: 0 }); setDone(false);
  };

  const sc = { correct: { bg: C.good.bg, border: C.good.border, text: C.good.text },
               wrong:   { bg: C.again.bg, border: C.again.border, text: C.again.text },
               idle:    { bg: C.white, border: C.border, text: C.ink } }[status];
  const ex = topic?.exercises[qIdx];

  /* ── LIST ── */
  if (screen === "list") return (
    <div style={{ padding: `16px ${SIDE}px 40px` }}>
      <h2 style={sectionTitle()}>📖 Граматика</h2>
      <p style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>
        {LANGUAGES[activeLang]?.label} · {topics.length} тем
      </p>
      {topics.map(t => {
        const p = progress[t.id];
        return (
          <div key={t.id} onClick={() => { setSel(t.id); setScreen("theory"); }}
            style={{
              background: C.white, borderRadius: 16, padding: "16px 14px",
              marginBottom: 10, border: `1.5px solid ${C.soft}`,
              boxShadow: "0 2px 8px rgba(26,26,46,0.06)",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
              transition: "box-shadow 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,26,46,0.12)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,26,46,0.06)"}
          >
            <span style={{ fontSize: 28, flexShrink: 0 }}>{t.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{t.title}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                {t.exercises.length} вправ
                {p ? ` · остання спроба: ${p.pct}%` : " · не розпочато"}
              </div>
              {p && (
                <div style={{ height: 3, background: C.soft, borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p.pct}%`, borderRadius: 3,
                    background: p.pct >= 80 ? C.sage : p.pct >= 50 ? C.gold : C.terra }} />
                </div>
              )}
            </div>
            <span style={{ fontSize: 16, color: C.faint, flexShrink: 0 }}>›</span>
          </div>
        );
      })}
    </div>
  );

  /* ── THEORY ── */
  if (screen === "theory" && topic) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ height: 56, flexShrink: 0, padding: `0 ${SIDE}px`,
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: `1px solid ${C.soft}`,
        background: "rgba(250,248,243,0.95)", backdropFilter: "blur(8px)" }}>
        <button onClick={() => setScreen("list")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, padding: "4px 6px", color: C.ink, flexShrink: 0 }}>←</button>
        <span style={{ fontSize: 18 }}>{topic.icon}</span>
        <div style={{ flex: 1, minWidth: 0, fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{topic.title}</div>
      </div>
      <div className="tab-scroll">
        <div style={{ padding: `20px ${SIDE}px 40px` }}>
          {/* Theory card */}
          <div style={{ background: C.white, borderRadius: 16, padding: "18px 16px", border: `1.5px solid ${C.soft}`, marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: C.terra, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Теорія</div>
            <pre style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: C.ink, lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0 }}>{topic.theory}</pre>
          </div>
          {/* Start quiz button */}
          <Btn variant="terra" onClick={startQuiz} style={{ width: "100%", padding: "14px", fontSize: 15 }}>
            Почати вправи ({topic.exercises.length} запитань) →
          </Btn>
          {progress[topic.id] && (
            <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: C.muted }}>
              Попередній результат: {progress[topic.id].pct}%
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ── QUIZ ── */
  if (screen === "quiz" && topic) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: `12px ${SIDE}px 12px` }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexShrink: 0 }}>
        <button onClick={() => setScreen("theory")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: "4px", color: C.ink, flexShrink: 0 }}>←</button>
        <div style={{ flex: 1, fontWeight: 700, fontSize: 14, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{topic.title}</div>
        <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>{qIdx + 1}/{topic.exercises.length}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: C.soft, borderRadius: 4, overflow: "hidden", flexShrink: 0, marginBottom: 10 }}>
        <div style={{ height: "100%", borderRadius: 4, transition: "width 0.3s",
          width: `${Math.round(((qIdx + (status !== "idle" ? 1 : 0)) / topic.exercises.length) * 100)}%`,
          background: `linear-gradient(90deg,${C.terra},${C.gold})` }} />
      </div>

      {done ? (
        /* Done */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
          <div style={{ fontSize: 56 }}>{score.wrong === 0 ? "🏆" : score.correct >= topic.exercises.length * 0.7 ? "🎉" : "💪"}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.ink }}>
            {Math.round(score.correct / topic.exercises.length * 100)}%
          </div>
          <div style={{ fontSize: 14, color: C.muted }}>✅ {score.correct} правильно · ❌ {score.wrong} помилок</div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={restart}>Ще раз</Btn>
            <Btn variant="terra" onClick={() => setScreen("theory")}>← Теорія</Btn>
          </div>
        </div>
      ) : (
        <>
          {/* Exercise card */}
          <div style={{ flex: 1, minHeight: 0, borderRadius: 20, padding: "20px 18px",
            background: sc.bg, border: `2px solid ${sc.border}`,
            boxShadow: "0 6px 30px rgba(26,26,46,0.09)",
            display: "flex", flexDirection: "column", gap: 12,
            transition: "background 0.2s, border-color 0.2s" }}>
            <div style={{ fontSize: 10, color: C.faint, textTransform: "uppercase", letterSpacing: "0.14em" }}>Вправа {qIdx + 1}</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.ink, lineHeight: 1.4 }}>
              {ex.q}
            </div>
            {status !== "idle" && (
              <div style={{ marginTop: 4 }}>
                {status === "correct" ? (
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.good.text }}>✓ Правильно!</div>
                ) : (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.again.text }}>✗ Правильна відповідь:</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, color: C.ink, marginTop: 4 }}>
                      {ex.ans[0]}
                    </div>
                  </div>
                )}
              </div>
            )}
            {status === "idle" && (
              <div style={{ marginTop: "auto", fontSize: 12, color: C.faint, display: "flex", alignItems: "center", gap: 6 }}>
                💡 {ex.hint}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ flexShrink: 0, display: "flex", gap: 8, marginTop: 10 }}>
            <input ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { status === "idle" ? checkAnswer() : nextQ(); } }}
              disabled={status !== "idle"}
              placeholder="Введи відповідь…"
              style={{ ...inputStyle(), flex: 1, marginBottom: 0, fontSize: 16, padding: "13px 14px",
                background: sc.bg, borderColor: sc.border, color: sc.text, transition: "all 0.2s" }}
            />
          </div>

          {/* Buttons */}
          <div style={{ flexShrink: 0, display: "flex", gap: 8, marginTop: 8 }}>
            {status === "idle" ? (
              <Btn variant="primary" onClick={checkAnswer} style={{ flex: 1 }}>Перевірити ↵</Btn>
            ) : (
              <Btn variant="terra" onClick={nextQ} style={{ flex: 1 }}>
                {qIdx + 1 >= topic.exercises.length ? "Завершити 🏁" : "Далі →"}
              </Btn>
            )}
          </div>
        </>
      )}
    </div>
  );

  return null;
}

/* ═══════════════════════════════════════════════
   STAT PILL
═══════════════════════════════════════════════ */
function Stat({ val, lbl }) {
  return (
    <div style={{
      background: C.white, border: `1.5px solid ${C.soft}`, borderRadius: 14,
      padding: "8px 16px", minWidth: 64, textAlign: "center",
      boxShadow: "0 2px 8px rgba(30,60,120,0.07)",
    }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: C.terra, lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: C.muted, marginTop: 3 }}>{lbl}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   BUTTON
═══════════════════════════════════════════════ */
function Btn({ onClick, children, variant = "ghost", style: s = {} }) {
  const [hov, setHov] = useState(false);
  const base = {
    fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
    padding: "10px 18px", borderRadius: 10, cursor: "pointer",
    transition: "transform 0.12s, box-shadow 0.12s",
    transform: hov ? "translateY(-1px)" : "translateY(0)",
    boxShadow: hov ? "0 4px 14px rgba(26,26,46,0.13)" : "none",
    border: "none", outline: "none",
  };
  const variants = {
    ghost:   { background: C.white, border: `1.5px solid ${C.border}`, color: C.ink },
    primary: { background: C.ink, color: C.white, border: `1.5px solid ${C.ink}` },
    terra:   { background: C.terra, color: C.white, border: `1.5px solid ${C.terra}` },
    again:   { background: C.again.bg, border: `1.5px solid ${C.again.border}`, color: C.again.text },
    hard:    { background: C.hard.bg,  border: `1.5px solid ${C.hard.border}`,  color: C.hard.text },
    good:    { background: C.good.bg,  border: `1.5px solid ${C.good.border}`,  color: C.good.text },
    easy:    { background: C.easy.bg,  border: `1.5px solid ${C.easy.border}`,  color: C.easy.text },
  };
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant], ...s }}>
      {children}
    </button>
  );
}

const TABS = [
  { id: "cards",    icon: "🃏", label: "Картки" },
  { id: "practice", icon: "⌨️", label: "Практика" },
  { id: "grammar",  icon: "📖", label: "Граматика" },
  { id: "create",   icon: "✏️", label: "Створити" },
  { id: "settings", icon: "⚙️", label: "Налаштування" },
];

/* ═══════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════ */
function DuoMode({ cards, onExit }) {
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [chosen, setChosen]   = useState(null);
  const [score, setScore]     = useState(0);

  const current = cards[index];

  useEffect(() => {
    if (!current) return;
    setChosen(null);
    const pool = cards.map(c => c.translation).filter(t => t && t !== current.translation);
    const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    const opts = [...shuffled, current.translation].sort(() => 0.5 - Math.random());
    setOptions(opts);
  }, [index]);

  if (!current) {
    return (
      <div style={{
        height: "var(--app-h, 100svh)", background: C.paper,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 20, padding: 32,
      }}>
        <div style={{ fontSize: 64 }}>🎉</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 700, color: C.ink }}>Готово!</div>
        <div style={{ fontSize: 18, color: C.muted }}>Результат: <b style={{ color: C.terra }}>{score}</b> / {cards.length}</div>
        <button onClick={onExit} style={{
          marginTop: 10, padding: "12px 32px", borderRadius: 14,
          background: C.terra, color: "#fff", border: "none",
          fontSize: 15, fontWeight: 700, cursor: "pointer",
        }}>← Назад</button>
      </div>
    );
  }

  function choose(opt) {
    if (chosen !== null) return;
    setChosen(opt);
    if (opt === current.translation) setScore(s => s + 1);
    setTimeout(() => {
      setChosen(null);
      setIndex(i => i + 1);
    }, 900);
  }

  return (
    <div style={{
      height: "var(--app-h, 100svh)", background: C.paper,
      display: "flex", flexDirection: "column", gap: 0,
      maxWidth: 520, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px 12px",
        borderBottom: `1px solid ${C.soft}`,
        background: "rgba(238,243,251,0.95)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button onClick={onExit} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.ink, padding: "2px 6px" }}>←</button>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: C.ink, flex: 1 }}>Duo Mode</div>
        <div style={{ fontSize: 13, color: C.muted }}>{index + 1} / {cards.length}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.terra }}>⭐ {score}</div>
      </div>
      {/* Progress */}
      <div style={{ height: 4, background: C.soft }}>
        <div style={{ height: "100%", width: `${(index / cards.length) * 100}%`, background: C.terra, transition: "width 0.4s" }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20, overflowY: "auto" }}>
        <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Що означає:</div>
        <div style={{
          background: C.white, borderRadius: 20, padding: "28px 24px",
          border: `1.5px solid ${C.border}`,
          boxShadow: "0 4px 20px rgba(30,60,120,0.08)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        }}>
          {current.image && (
            <img src={current.image} style={{ maxWidth: 160, maxHeight: 120, borderRadius: 12, objectFit: "cover" }} />
          )}
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: C.ink, textAlign: "center" }}>
            {current.word}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {options.map(o => {
            const isCorrect = o === current.translation;
            let bg = C.white, border = C.border, color = C.ink;
            if (chosen !== null) {
              if (isCorrect)            { bg = "#ddf5e4"; border = "#6cc98a"; color = "#1a6b34"; }
              else if (o === chosen)    { bg = "#fde8e8"; border = "#f0a0a0"; color = "#9a2020"; }
            }
            return (
              <button key={o} onClick={() => choose(o)} style={{
                padding: "15px 18px", borderRadius: 14, fontSize: 16,
                background: bg, border: `1.5px solid ${border}`, color,
                cursor: chosen !== null ? "default" : "pointer",
                fontWeight: 600, textAlign: "left", fontFamily: "'DM Sans',sans-serif",
                transition: "all 0.15s",
                boxShadow: chosen === null ? "0 2px 8px rgba(30,60,120,0.06)" : "none",
              }}>
                {o}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Рівень N потребує N²×60 XP — кожен рівень складніший
function xpForLevel(lvl) { return lvl * lvl * 60; }
function calcLevel(totalXp) {
  let lvl = 1, xp = totalXp;
  while (xp >= xpForLevel(lvl)) { xp -= xpForLevel(lvl); lvl++; }
  return lvl;
}
function xpProgress(totalXp) {
  let lvl = 1, xp = totalXp;
  while (xp >= xpForLevel(lvl)) { xp -= xpForLevel(lvl); lvl++; }
  return { level: lvl, current: xp, needed: xpForLevel(lvl) };
}

/* ═══════════════════════════════════════════════
   LEVEL-UP FIREWORKS
═══════════════════════════════════════════════ */
function LevelUpBanner({ level, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);

  const particles = useRef(
    Array.from({ length: 32 }, (_, i) => {
      const angle = (i / 32) * 360 + (Math.random() - 0.5) * 22;
      const dist  = 70 + Math.random() * 80;
      const rad   = angle * Math.PI / 180;
      return {
        id: i,
        tx: Math.cos(rad) * dist,
        ty: Math.sin(rad) * dist,
        size: 5 + Math.random() * 7,
        color: ["#5b9cf0","#f0c050","#f07860","#60d880","#c580f8","#f8a050"][i % 6],
        dur:  0.85 + Math.random() * 0.6,
        del:  Math.random() * 0.3,
        rot:  Math.random() * 360,
      };
    })
  ).current;

  const keyframes = particles.map(p =>
    `@keyframes fw${p.id}{0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1}
     100%{transform:translate(${p.tx}px,${p.ty + 60}px) scale(0) rotate(${p.rot}deg);opacity:0}}`
  ).join('\n');

  return (
    <div onClick={onDone} style={{
      position:"fixed",inset:0,zIndex:9999,
      display:"flex",alignItems:"center",justifyContent:"center",
      background:"rgba(0,0,0,0.5)",animation:"fwBg 0.2s ease forwards",cursor:"pointer",
    }}>
      <style>{`
        @keyframes fwBg{from{opacity:0}to{opacity:1}}
        @keyframes fwPop{0%{transform:scale(0.3);opacity:0}65%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
        ${keyframes}
      `}</style>

      <div style={{
        position:"relative",background:C.white,borderRadius:28,
        padding:"40px 52px",textAlign:"center",
        boxShadow:"0 24px 64px rgba(0,0,0,0.4)",
        animation:"fwPop 0.4s cubic-bezier(.2,1.5,.4,1) forwards",
        overflow:"visible",
      }}>
        {/* Частинки */}
        {particles.map(p => (
          <div key={p.id} style={{
            position:"absolute",top:"50%",left:"50%",
            width:p.size,height:p.size * (Math.random() > 0.5 ? 2.2 : 1),
            borderRadius: p.size / 2,
            background:p.color,
            animation:`fw${p.id} ${p.dur}s ${p.del}s ease-out forwards`,
            transformOrigin:"center center",
          }}/>
        ))}
        <div style={{fontSize:56,marginBottom:4}}>🎉</div>
        <div style={{fontSize:12,fontWeight:700,letterSpacing:"0.14em",
          textTransform:"uppercase",color:C.muted,marginBottom:4}}>Новий рівень!</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:64,
          fontWeight:700,color:C.terra,lineHeight:1}}>{level}</div>
        <div style={{fontSize:13,color:C.muted,marginTop:10}}>
          До наступного рівня: {xpForLevel(level)} XP
        </div>
        <div style={{fontSize:11,color:C.faint,marginTop:6}}>торкнись щоб закрити</div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(() => loadData());
  const [activeLang, setActiveLang] = useState(() => loadData().activeLang || "it");
  const [dictName, setDictName] = useState(() => {
    const d = loadData(); const lang = d.activeLang || "it";
    return Object.keys(d.dictionaries).find(k => k.startsWith(lang + ":")) || Object.keys(d.dictionaries)[0];
  });
  const [idx, setIdx] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [tab, setTab] = useState("cards");
  const [newName, setNewName] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [editingDict, setEditingDict] = useState(null);
  const [theme, setTheme]     = useState(() => localStorage.getItem("ifc_theme") || "light");
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem("ifc_fs")) || 1);
  const { toast, show: showToast } = useToast();

  // Apply theme immediately — mutates C so all children see correct colors
  Object.assign(C, THEMES[theme] || THEMES.light);
  const { speak, sysVoices, rvReady, selectedVoiceName, selectVoice } = useSpeech(activeLang);
  const { canInstall, install, installed, isIos } = useInstallPrompt();
  const [showIosModal, setShowIosModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [duoMode, setDuoMode] = useState(false);
  const [levelUp, setLevelUp] = useState(null);
  useViewportHeight();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("import");
    if (!data) return;
    try {
      const decoded = JSON.parse(atob(data));
      setData(d => ({
        ...d,
        dictionaries: {
          ...d.dictionaries,
          [decoded.name]: decoded.cards
        }
      }));
    } catch {}
  }, []);

  const dictNames = Object.keys(data.dictionaries).filter(k => k.startsWith(activeLang + ":"));
  const displayName = (k) => k.replace(/^[a-z]+:/, "");
  const words = data.dictionaries[dictName] || [];
  const word  = words[idx] || { word: "—", translation: "—" };

  const switchLang = useCallback((code) => {
    if (code === activeLang) return;
    const nd = { ...data, activeLang: code };
    saveData(nd); setData(nd); setActiveLang(code);
    const first = Object.keys(nd.dictionaries).find(k => k.startsWith(code + ":"));
    if (first) { setDictName(first); setIdx(0); }
  }, [data, activeLang]);

  useEffect(() => {
    if (!dictName.startsWith(activeLang + ":")) {
      const first = Object.keys(data.dictionaries).find(k => k.startsWith(activeLang + ":"));
      if (first) setDictName(first);
      setIdx(0);
    }
  }, [activeLang]);

  useEffect(() => {
    if (autoSpeak && words.length) {
      const t = setTimeout(() => speak(words[0]?.word || ""), 400);
      return () => clearTimeout(t);
    }
  }, [dictName]);

  const persist = useCallback((d) => { setData(d); saveData(d); }, []);

  const changeTheme = (t) => { localStorage.setItem("ifc_theme", t); setTheme(t); };
  const changeFontSize = (f) => { localStorage.setItem("ifc_fs", f); setFontSize(f); };

  let known = 0, learning = 0;
  words.forEach(w => { const p = data.progress[w.word]; if (p && p.interval > 7) known++; else learning++; });
  const pct = words.length ? Math.round((known / words.length) * 100) : 0;

  const goNext = useCallback(() => {
    const next = (idx + 1) % words.length;
    setIdx(next);
    if (autoSpeak) setTimeout(() => speak(words[next]?.word || ""), 350);
  }, [words, idx, autoSpeak, speak]);

  const goPrev = () => setIdx(i => (i - 1 + words.length) % words.length);

  const grade = (score) => {
    const nd = { ...data, progress: { ...data.progress } };
    nd.progress[word.word] = applyGrade(nd.progress[word.word], score);
    const xpGain = [0, 8, 15, 25][score] ?? 10;   // Знову=0, Важко=8, Добре=15, Легко=25
    const oldLevel = calcLevel(nd.xp);
    nd.xp = (nd.xp || 0) + xpGain;
    const newLevel = calcLevel(nd.xp);
    nd.level = newLevel;
    persist(nd);
    if (newLevel > oldLevel) setLevelUp(newLevel);
    goNext();
  };

  const switchDict = (name) => {
    setDictName(name); setIdx(0);
    if (autoSpeak) setTimeout(() => speak(data.dictionaries[name]?.[0]?.word || ""), 350);
  };

  const createDict = () => {
    const parsed = parseInput(jsonInput);
    if (!parsed?.length) { showToast("❌ Невірний формат", true); return; }
    const rawName = newName.trim() || "Словник " + (dictNames.length + 1);
    const key = `${activeLang}:${rawName}`;
    persist({ ...data, dictionaries: { ...data.dictionaries, [key]: parsed } });
    setDictName(key); setIdx(0); setNewName(""); setJsonInput(""); setTab("cards");
    showToast(`✅ "${rawName}" створено — ${parsed.length} слів`);
  };

  const deleteDict = (name) => {
    if (dictNames.length === 1) { showToast("❌ Не можна видалити єдиний словник", true); return; }
    if (!window.confirm(`Видалити словник "${displayName(name)}"?`)) return;
    const nd = { ...data, dictionaries: { ...data.dictionaries } };
    delete nd.dictionaries[name];
    const first = Object.keys(nd.dictionaries).find(k => k.startsWith(activeLang + ":"));
    persist(nd); setDictName(first); setIdx(0);
    showToast(`🗑️ "${displayName(name)}" видалено`);
  };

  const saveEditedDict = (key, newCards) => {
    persist({ ...data, dictionaries: { ...data.dictionaries, [key]: newCards } });
    setEditingDict(null);
    if (dictName === key) setIdx(0);
    showToast(`✅ "${displayName(key)}" збережено — ${newCards.length} карток`);
  };

  useEffect(() => {
    if (!showLangMenu) return;
    const h = () => setShowLangMenu(false);
    setTimeout(() => window.addEventListener("click", h), 0);
    return () => window.removeEventListener("click", h);
  }, [showLangMenu]);

  useEffect(() => {
    const h = (e) => {
      if (["INPUT","TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === "1") grade(0); if (e.key === "2") grade(1);
      if (e.key === "3") grade(2); if (e.key === "4") grade(3);
      if (e.key === "s") speak(word.word);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [word, goNext]);

  /* ── CARDS TAB ── */
  const xpProg = xpProgress(data.xp);
  const CardsTab = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: `12px ${SIDE}px 12px`, gap: 10, minHeight: 0, height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexShrink: 0 }}>
        <Stat val={data.xp} lbl="XP" />
        <Stat val={data.level} lbl="Рівень" />
        <Stat val={known} lbl="Вивчено" />
        <Stat val={learning} lbl="Вчиться" />
      </div>
      {/* XP прогрес до наступного рівня */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
          <span style={{ fontSize:10, color:C.muted }}>XP до рівня {xpProg.level + 1}</span>
          <span style={{ fontSize:10, color:C.muted }}>{xpProg.current} / {xpProg.needed}</span>
        </div>
        <div style={{ height: 5, background: C.soft, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height:"100%", borderRadius:4,
            width:`${Math.min(100, (xpProg.current / xpProg.needed) * 100)}%`,
            background:`linear-gradient(90deg,${C.terra},${C.gold})`,
            transition:"width 0.5s" }} />
        </div>
      </div>
      {/* % словника вивчено */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ height: 3, background: C.soft, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: C.sage, borderRadius: 4, transition: "width 0.5s" }} />
        </div>
        <p style={{ textAlign: "right", fontSize: 10, color: C.muted, marginTop: 2 }}>{pct}% словника вивчено</p>
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
        {dictNames.map(n => (
          <button key={n} onClick={() => switchDict(n)} style={{
            padding: "5px 12px", borderRadius: 20, border: `1.5px solid`,
            borderColor: dictName === n ? C.terra : C.soft,
            background: dictName === n ? C.terra : C.white,
            color: dictName === n ? C.white : C.ink,
            fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
            fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
          }}>{displayName(n)}</button>
        ))}
      </div>
      {words.length > 0 ? (
        <>
          <p style={{ textAlign: "center", fontSize: 11, color: C.muted, flexShrink: 0 }}>{idx + 1} / {words.length}</p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <FlipCard
              front={word.word}
              back={word.translation}
              backImage={word.image}
              frontLabel={LANGUAGES[activeLang]?.label}
              cardKey={`${dictName}-${idx}`}
              onNext={goNext}
              onPrev={goPrev}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
            <button onClick={() => speak(word.word)} style={{
              padding: "8px 20px", borderRadius: 20,
              background: C.soft, border: `1px solid ${C.border}`,
              color: C.muted, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}>🔊 Озвучити</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, flexShrink: 0 }}>
            {[["Знову",0,"again"],["Важко",1,"hard"],["Добре",2,"good"],["Легко",3,"easy"]].map(([l,s,v]) => (
              <Btn key={l} onClick={() => grade(s)} variant={v} style={{ padding: "11px 4px", textAlign: "center", width: "100%" }}>{l}</Btn>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 10, color: C.faint, flexShrink: 0 }}>⬅ свайп → наступна · торкніться → перевернути</p>
        </>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: C.muted, fontSize: 16 }}>Словник порожній</p>
        </div>
      )}
    </div>
  );


  /* ── PRACTICE TAB ── */
  const PracticeTab = <PracticeView
    words={words}
    dictNames={dictNames}
    dictName={dictName}
    displayName={displayName}
    switchDict={switchDict}
    speak={speak}
    activeLang={activeLang}
    onDuoMode={() => setDuoMode(true)}
  />;

  /* ── GRAMMAR TAB ── */
  const GrammarTab = <GrammarView activeLang={activeLang} />;

  /* ── CREATE TAB ── */
  const CreateTab = (
    <div style={{ padding: `20px ${SIDE}px 40px` }}>
      <h2 style={sectionTitle()}>✏️ Створити словник</h2>
      <input style={inputStyle()} placeholder="Назва словника (напр. Урок 3)" value={newName} onChange={e => setNewName(e.target.value)} />
      <div style={{ background: "#edf3fb", borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontFamily: "monospace", fontSize: 11, color: C.muted }}>
        {`[{"word":"ciao","translation":"привіт"}, ...]`}<br/>або рядками: <b>ciao = привіт</b>
      </div>
      <textarea
        style={{ ...inputStyle(), height: 140, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
        placeholder={"ciao = привіт\ngrazie = дякую\nbello = красивий"}
        value={jsonInput} onChange={e => setJsonInput(e.target.value)}
      />
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Btn onClick={() => { const p = parseInput(jsonInput); if (!p) showToast("❌ Невірний формат", true); else showToast(`✅ Розпізнано ${p.length} слів`); }} style={{ flex: 1 }}>Перевірити</Btn>
        <Btn onClick={createDict} variant="terra" style={{ flex: 1 }}>Створити →</Btn>
      </div>

      <h2 style={{ ...sectionTitle(), marginTop: 32 }}>📚 Мої словники</h2>
      {dictNames.map(n => (
        <div key={n} style={{ background: C.white, borderRadius: 16, padding: "14px 14px", marginBottom: 10, border: `1.5px solid ${C.soft}`, boxShadow: "0 2px 8px rgba(30,60,120,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>{displayName(n)}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {data.dictionaries[n].length} карток
                {data.dictionaries[n].some(c => c.image) && " · 🖼️"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button onClick={() => setEditingDict(n)} style={{ padding: "12px 16px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", background: "#deeeff", border: `1.5px solid ${C.terra}55`, color: C.terra, flex: 1 }}>✏️ Редагувати</button>
            <button onClick={() => {
              const text = buildShareText(displayName(n), data.dictionaries[n]);
              navigator.clipboard.writeText(text).then(() => showToast("📋 Скопійовано!"));
            }} style={{ padding: "12px 16px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", background: "#e2eeff", border: `1.5px solid ${C.terra}55`, color: C.terra, flex: 1 }}>📋 Копіювати</button>
            <button onClick={() => deleteDict(n)} style={{ padding: "12px 16px", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", background: "#fdecea", border: "1.5px solid #f5c6c2", color: "#c0392b", flex: 1 }}>🗑 Видалити</button>
          </div>
        </div>
      ))}
    </div>
  );

  /* ── SETTINGS TAB ── */
  const SettingsTab = (
    <div style={{ padding: `20px ${SIDE}px 40px` }}>
      <h2 style={sectionTitle()}>⚙️ Налаштування</h2>

      {/* Theme */}
      <div style={{ background: C.white, borderRadius: 16, padding: "16px 14px", marginBottom: 12, border: `1.5px solid ${C.soft}` }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 12 }}>🎨 Тема</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["light","☀️ Синя"], ["dark","🌙 Темна"]].map(([key, label]) => (
            <button key={key} onClick={() => changeTheme(key)} style={{
              flex: 1, padding: "10px 8px", borderRadius: 12, fontSize: 13, fontWeight: 700,
              border: `2px solid ${theme === key ? C.terra : C.border}`,
              background: theme === key ? C.terra : C.cream,
              color: theme === key ? "#fff" : C.muted,
              cursor: "pointer", transition: "all 0.18s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div style={{ background: C.white, borderRadius: 16, padding: "16px 14px", marginBottom: 12, border: `1.5px solid ${C.soft}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>🔤 Розмір шрифту</div>
          <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>
            {fontSize === 0.85 ? "Малий" : fontSize === 1 ? "Стандарт" : fontSize === 1.15 ? "Більший" : "Великий"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => changeFontSize(Math.max(0.85, +(fontSize - 0.15).toFixed(2)))}
            disabled={fontSize <= 0.85}
            style={{ width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.cream, color: C.ink, fontSize: 20, cursor: fontSize <= 0.85 ? "not-allowed" : "pointer", opacity: fontSize <= 0.85 ? 0.4 : 1, fontWeight: 700, flexShrink: 0 }}>−</button>
          <div style={{ flex: 1, height: 6, background: C.soft, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: C.terra, width: `${((fontSize - 0.85) / 0.6) * 100}%`, transition: "width 0.2s" }} />
          </div>
          <button onClick={() => changeFontSize(Math.min(1.45, +(fontSize + 0.15).toFixed(2)))}
            disabled={fontSize >= 1.45}
            style={{ width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.cream, color: C.ink, fontSize: 20, cursor: fontSize >= 1.45 ? "not-allowed" : "pointer", opacity: fontSize >= 1.45 ? 0.4 : 1, fontWeight: 700, flexShrink: 0 }}>+</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontFamily: "'Playfair Display',serif", fontSize: `${38 * fontSize}px`, color: C.ink, lineHeight: 1.2, transition: "font-size 0.2s" }}>Aa</div>
      </div>

      <SettingRow label="Авто-озвучення" desc="Говорити слово при переході до нової картки">
        <Toggle value={autoSpeak} onChange={setAutoSpeak} />
      </SettingRow>
      <div style={{ background: C.white, borderRadius: 16, padding: "16px 14px", marginBottom: 12, border: `1.5px solid ${C.soft}` }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 4 }}>🎙️ Голос — {LANGUAGES[activeLang]?.label}</div>
        {sysVoices.length > 0 && (
          <>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Системні голоси</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {sysVoices.map(v => (
                <div key={v.name} onClick={() => { selectVoice(v.name); speak(LANGUAGES[activeLang]?.sample || v.name); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 8px", borderRadius: 10, cursor: "pointer", border: `1.5px solid ${selectedVoiceName === v.name ? C.terra : C.border}`, background: selectedVoiceName === v.name ? "#deeeff" : C.paper, transition: "all 0.15s" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.ink }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{v.lang} · {v.localService ? "локальний" : "✨ онлайн"}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {selectedVoiceName === v.name && <span style={{ fontSize: 11, color: C.terra, fontWeight: 700 }}>✓</span>}
                    <span style={{ fontSize: 18 }}>🔊</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {(rvReady || LANGUAGES[activeLang]?.rvVoices?.length > 0) && (
          <>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              ResponsiveVoice {!rvReady && <span style={{ color: C.faint }}>(завантажується...)</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(LANGUAGES[activeLang]?.rvVoices || []).map(rv => {
                const key = RV_PREFIX + rv.name;
                const isSel = selectedVoiceName === key;
                return (
                  <div key={key} onClick={() => { if (!rvReady) return; selectVoice(key); speak(LANGUAGES[activeLang]?.sample || ""); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 8px", borderRadius: 10, cursor: rvReady ? "pointer" : "not-allowed", border: `1.5px solid ${isSel ? C.terra : C.border}`, background: isSel ? "#deeeff" : rvReady ? C.paper : "#f0f4fb", opacity: rvReady ? 1 : 0.55, transition: "all 0.15s" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.ink }}>{rv.label}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>ResponsiveVoice · ☁️ онлайн</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {isSel && <span style={{ fontSize: 11, color: C.terra, fontWeight: 700 }}>✓</span>}
                      <span style={{ fontSize: 18 }}>🔊</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {sysVoices.length === 0 && !rvReady && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Голоси завантажуються...</div>}
      </div>
      {!installed ? (
        <SettingRow label="📲 Додати на екран" desc={isIos ? "Інструкція для Safari на iPhone" : "Встановити як додаток на телефон"}>
          <Btn variant="terra" onClick={() => { if (isIos) setShowIosModal(true); else if (canInstall) install(); }}>{isIos ? "Як?" : "Встановити"}</Btn>
        </SettingRow>
      ) : (
        <SettingRow label="✅ Додаток встановлено" desc="Відкривай з домашнього екрану"><span style={{ fontSize: 22 }}>🎉</span></SettingRow>
      )}
      <SettingRow label="Скинути прогрес" desc="Видалити весь прогрес навчання та XP">
        <Btn variant="again" onClick={() => { if (window.confirm("Скинути весь прогрес?")) { persist({ ...data, progress: {}, xp: 0, level: 1 }); showToast("✅ Прогрес скинуто"); } }}>Скинути</Btn>
      </SettingRow>
      <div style={{ background: C.white, borderRadius: 16, padding: "14px 14px", border: `1.5px solid ${C.soft}`, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 700, color: C.ink, marginBottom: 8 }}>Про застосунок</div>
        <div style={{ fontSize: 13, color: C.muted }}>Flashcards · Spaced Repetition</div>
        <div style={{ fontSize: 13, color: C.muted }}>Словників: {dictNames.length} · Слів: {Object.values(data.dictionaries).flat().length}</div>
        <div style={{ fontSize: 13, color: C.muted }}>Рівень {data.level} · {data.xp} XP зароблено</div>
        <div style={{ fontSize: 13, color: C.muted }}>Прогрес зберігається локально</div>
      </div>
    </div>
  );

  /* ── SHARED STYLES ── */
  const globalStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { height: 100%; -webkit-text-size-adjust: none; text-size-adjust: none; touch-action: pan-y; }
    body { background: ${C.paper}; color: ${C.ink}; font-family: 'DM Sans', sans-serif; overflow: hidden; height: 100%;
           position: fixed; width: 100%; top: 0; left: 0; }
    #root { height: var(--app-h, 100dvh); overflow: hidden; display: flex; flex-direction: column; }
    .tab-scroll-outer { flex: 1; overflow: hidden; display: flex; flex-direction: column; min-height: 0; }
    .tab-scroll { flex: 1; overflow-y: scroll; display: flex; flex-direction: column; scrollbar-width: none; -ms-overflow-style: none; }
    .tab-scroll::-webkit-scrollbar { width: 0; height: 0; background: transparent; }
    button { font-family: 'DM Sans', sans-serif; }
    @keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(10px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }
  `;

  const outerDiv = {
    // Стабільна висота — клавіатура НЕ впливає (тільки Практика адаптується через --kbd-h)
    height: `calc(var(--app-h, 100dvh) / ${fontSize})`,
    "--font-scale": fontSize,
    background: C.paper,
    backgroundImage: `radial-gradient(ellipse 80% 50% at 15% 5%, rgba(58,109,216,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 85% 85%, rgba(74,144,196,0.09) 0%, transparent 60%)`,
    display: "flex", flexDirection: "column", maxWidth: 520, margin: "0 auto", overflow: "hidden",
    zoom: fontSize,
  };

  /* ── DUO MODE SCREEN ── */
  if (duoMode) {
    return (
      <DuoMode
        cards={words}
        onExit={() => setDuoMode(false)}
      />
    );
  }

  /* ── CARD EDITOR SCREEN ── */
  if (editingDict !== null) {
    return (
      <>
        <style>{globalStyle}</style>
        <div style={outerDiv}>
          <CardEditor
            cards={data.dictionaries[editingDict] || []}
            dictLabel={displayName(editingDict)}
            onSave={(cards) => saveEditedDict(editingDict, cards)}
            onClose={() => setEditingDict(null)}
          />
        </div>
        {toast && <Toast toast={toast} />}
      </>
    );
  }

  /* ── NORMAL APP ── */
  return (
    <>
      <style>{globalStyle}</style>
      <div style={outerDiv}>
        {/* HEADER */}
        <header style={{
          padding: `0 ${SIDE}px`, height: 64, flexShrink: 0,
          borderBottom: `1px solid ${C.soft}`,
          background: "rgba(238,243,251,0.92)", backdropFilter: "blur(8px)",
          position: "sticky", top: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: C.ink, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {LANGUAGES[activeLang]?.label} <em style={{ color: C.terra, fontStyle: "italic" }}>Flashcards</em>
            </h1>
            <p style={{ fontSize: 9, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>Spaced repetition</p>
          </div>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div onClick={() => setShowLangMenu(m => !m)} style={{ display: "flex", alignItems: "center", gap: 8, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "7px 12px", boxShadow: "0 2px 8px rgba(26,26,46,0.07)", cursor: "pointer", userSelect: "none" }}>
              {LANGUAGES[activeLang]?.flag}
              <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{LANGUAGES[activeLang]?.label}</span>
              <span style={{ fontSize: 10, color: C.muted, marginLeft: 2 }}>{showLangMenu ? "▲" : "▼"}</span>
            </div>
            {showLangMenu && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 24px rgba(26,26,46,0.14)", zIndex: 50, minWidth: 160 }}>
                {Object.values(LANGUAGES).map(lang => (
                  <div key={lang.code} onClick={() => { switchLang(lang.code); setShowLangMenu(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", cursor: "pointer", background: activeLang === lang.code ? "#fdf2ee" : C.white, borderBottom: `1px solid ${C.soft}`, transition: "background 0.12s" }}>
                    {lang.flag}
                    <span style={{ fontSize: 14, fontWeight: activeLang === lang.code ? 700 : 500, color: activeLang === lang.code ? C.terra : C.ink }}>{lang.label}</span>
                    {activeLang === lang.code && <span style={{ marginLeft: "auto", color: C.terra, fontSize: 14 }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <div className="tab-scroll-outer">
          <div className="tab-scroll">
            {tab === "cards"    ? CardsTab    : null}
            {tab === "practice" ? PracticeTab : null}
            {tab === "grammar"  ? GrammarTab  : null}
            {tab === "create"   ? CreateTab   : null}
            {tab === "settings" ? SettingsTab : null}
          </div>
        </div>

        {/* BOTTOM NAV */}
        <nav style={{ display: "flex", borderTop: `1px solid ${C.soft}`, background: "rgba(238,243,251,0.97)", backdropFilter: "blur(8px)", position: "sticky", bottom: 0, flexShrink: 0 }}>
          {TABS.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 4px 12px", background: "none", border: "none", cursor: "pointer", gap: 2 }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: tab === id ? 700 : 400, color: tab === id ? C.terra : C.muted, letterSpacing: "0.03em" }}>{label}</span>
              {tab === id && <div style={{ width: 4, height: 4, borderRadius: 2, background: C.terra }} />}
            </button>
          ))}
        </nav>
      </div>

      {toast && <Toast toast={toast} />}
      {levelUp && <LevelUpBanner level={levelUp} onDone={() => setLevelUp(null)} />}
      {showIosModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowIosModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: "20px 20px 0 0", padding: "24px 24px 40px", width: "100%", maxWidth: 520, boxShadow: "0 -8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📲</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", fontWeight: 700, color: C.ink }}>Додати на екран</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Три кроки в Safari</div>
            </div>
            {[
              { icon: "⬆️", text: 'Натисни кнопку "Поділитись"', sub: "квадрат зі стрілкою внизу Safari" },
              { icon: "➕", text: 'Обери "На екран Дому"', sub: "прокрути список вниз якщо не видно" },
              { icon: "✅", text: "Натисни «Додати»", sub: "іконка з'явиться на домашньому екрані" },
            ].map(({ icon, text, sub }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: C.terra, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{text}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
                </div>
              </div>
            ))}
            <button onClick={() => setShowIosModal(false)} style={{ width: "100%", padding: "13px", borderRadius: 12, background: C.terra, color: C.white, border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>Зрозуміло!</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════
   SMALL COMPONENTS
═══════════════════════════════════════════════ */
function Toast({ toast }) {
  return (
    <div style={{
      position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
      background: toast.err ? "#c0392b" : C.ink, color: C.white,
      padding: "12px 24px", borderRadius: 30, fontSize: 13, fontWeight: 600,
      zIndex: 100, whiteSpace: "nowrap", animation: "fadeUp 0.25s ease",
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    }}>{toast.msg}</div>
  );
}

function SettingRow({ label, desc, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.white, borderRadius: 16, padding: "16px 14px", marginBottom: 12, border: `1.5px solid ${C.soft}` }}>
      <div style={{ flex: 1, marginRight: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.ink }}>{label}</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{desc}</div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? C.sage : C.border, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }} />
    </div>
  );
}