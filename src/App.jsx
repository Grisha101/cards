import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════════ */
const C = {
  ink: "#1a1a2e",
  paper: "#faf8f3",
  cream: "#f0ebe0",
  terra: "#c0583a",
  terraLight: "#e8795f",
  gold: "#d4a843",
  sage: "#6b8f71",
  border: "#e2ddd4",
  soft: "#e8e2d6",
  muted: "#999",
  faint: "#bbb",
  white: "#ffffff",
  again: { bg: "#fdecea", border: "#f5c6c2", text: "#c0392b" },
  hard:  { bg: "#fff3e0", border: "#f5dcb0", text: "#c07a28" },
  good:  { bg: "#e8f5e9", border: "#b6d9b9", text: "#2e7d32" },
  easy:  { bg: "#e3f2fd", border: "#aecff5", text: "#1565c0" },
};

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
  xp: 0, level: 1,
  activeLang: "it",
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
      { word: "cześć",        translation: "привіт" },
      { word: "dziękuję",     translation: "дякую" },
      { word: "proszę",       translation: "будь ласка / прошу" },
      { word: "dom",          translation: "будинок" },
      { word: "woda",         translation: "вода" },
      { word: "miłość",       translation: "кохання" },
      { word: "jeść",         translation: "їсти" },
      { word: "piękny",       translation: "красивий" },
      { word: "przyjaciel",   translation: "друг" },
      { word: "dzień dobry",  translation: "добрий день" },
      { word: "noc",          translation: "ніч" },
      { word: "słońce",       translation: "сонце" },
      { word: "tak",          translation: "так" },
      { word: "nie",          translation: "ні" },
      { word: "przepraszam",  translation: "вибачте" },
      { word: "dobrze",       translation: "добре / гаразд" },
      { word: "miasto",       translation: "місто" },
      { word: "ulica",        translation: "вулиця" },
      { word: "sklep",        translation: "магазин" },
      { word: "chleb",        translation: "хліб" },
      { word: "mleko",        translation: "молоко" },
      { word: "kawa",         translation: "кава" },
      { word: "herbata",      translation: "чай" },
      { word: "samochód",     translation: "машина" },
      { word: "pociąg",       translation: "потяг" },
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

function loadData() {
  try {
    const raw = localStorage.getItem("ifc_v3");
    if (!raw) return DEFAULT_DATA;
    const saved = JSON.parse(raw);
    return {
      ...saved,
      dictionaries: {
        ...DEFAULT_DATA.dictionaries,
        ...saved.dictionaries,
      },
    };
  } catch { return DEFAULT_DATA; }
}

function saveData(d) {
  localStorage.setItem("ifc_v3", JSON.stringify(d));
}

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
  return voices.filter(v => {
    const key = v.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const RV_PREFIX = "rv:";

function rvSpeak(rvName, text, sample) {
  if (typeof window.responsiveVoice === "undefined") return false;
  window.responsiveVoice.speak(text || sample, rvName, { rate: 0.9, pitch: 1, volume: 1 });
  return true;
}

function useSpeech(langCode) {
  const lang = LANGUAGES[langCode] || LANGUAGES.it;
  const [sysVoices, setSysVoices] = useState([]);
  const [rvReady, setRvReady] = useState(false);
  const [selectedVoiceName, setSelectedVoiceName] = useState(
    () => localStorage.getItem(lang.voiceKey) || ""
  );
  const voiceRef = useRef(null);

  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const langVoices = dedupeVoices(all.filter(v => v.lang.toLowerCase().startsWith(lang.code)));
      setSysVoices(langVoices);
      const saved = localStorage.getItem(lang.voiceKey);
      if (saved && saved.startsWith(RV_PREFIX)) {
        voiceRef.current = null;
        setSelectedVoiceName(saved);
      } else {
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
    const t = setInterval(() => {
      if (typeof window.responsiveVoice !== "undefined") { setRvReady(true); clearInterval(t); }
    }, 300);
    return () => clearInterval(t);
  }, []);

  const selectVoice = useCallback((name) => {
    if (name.startsWith(RV_PREFIX)) {
      voiceRef.current = null;
    } else {
      const v = sysVoices.find(v => v.name === name);
      voiceRef.current = v || null;
    }
    setSelectedVoiceName(name);
    localStorage.setItem(lang.voiceKey, name);
  }, [sysVoices, lang.voiceKey]);

  const speak = useCallback((text) => {
    const saved = selectedVoiceName;
    if (saved && saved.startsWith(RV_PREFIX)) {
      const rvName = saved.slice(RV_PREFIX.length);
      window.speechSynthesis.cancel();
      rvSpeak(rvName, text);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const { rate, pitch } = getVoiceParams(voiceRef.current);
    u.lang = lang.ttsLang; u.rate = rate; u.pitch = pitch; u.volume = 1;
    if (voiceRef.current) u.voice = voiceRef.current;
    window.speechSynthesis.speak(u);
  }, [selectedVoiceName, lang.ttsLang]);

  return { speak, sysVoices, rvReady, selectedVoiceName, selectVoice };
}

/* ═══════════════════════════════════════════════
   PWA INSTALL HOOK
═══════════════════════════════════════════════ */
function useInstallPrompt() {
  const [prompt, setPrompt]       = useState(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {});
    }
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

  const dismiss = () => setDismissed(true);
  const canInstall = !installed && !dismissed && (!!prompt || isIos);

  return { canInstall, install, installed, isIos, dismiss };
}

/* ═══════════════════════════════════════════════
   FLIP CARD
═══════════════════════════════════════════════ */
function FlipCard({ front, back, cardKey }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => setFlipped(false), [cardKey]);

  return (
    <div onClick={() => setFlipped(f => !f)} style={{ perspective: 1200, cursor: "pointer", userSelect: "none", height: "100%" }}>
      <div style={{
        position: "relative", width: "100%", height: "100%",
        transformStyle: "preserve-3d",
        transition: "transform 0.55s cubic-bezier(.4,0,.2,1)",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}>
        {/* FRONT */}
        <div style={{ ...faceStyle, background: C.white }}>
          <span style={labelStyle}>Italiano</span>
          <span style={wordStyle}>{front}</span>
          <span style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>натисни, щоб перевернути</span>
        </div>
        {/* BACK */}
        <div style={{ ...faceStyle, background: C.cream, transform: "rotateY(180deg)" }}>
          <span style={labelStyle}>Переклад</span>
          <span style={wordStyle}>{back}</span>
        </div>
      </div>
    </div>
  );
}

const faceStyle = {
  position: "absolute", inset: 0,
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
  borderRadius: 22, border: `2px solid ${C.border}`,
  boxShadow: `0 8px 40px rgba(26,26,46,0.11), 0 2px 8px rgba(0,0,0,0.05)`,
  backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
  padding: "0 28px",
};

const labelStyle = {
  fontSize: 10, textTransform: "uppercase", letterSpacing: "0.16em", color: C.faint,
};

const wordStyle = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: "clamp(1.7rem, 6vw, 2.7rem)", fontWeight: 700,
  color: C.ink, textAlign: "center", lineHeight: 1.2,
};

/* ═══════════════════════════════════════════════
   STAT PILL
═══════════════════════════════════════════════ */
function Stat({ val, lbl }) {
  return (
    <div style={{
      background: C.white, border: `1.5px solid ${C.soft}`, borderRadius: 14,
      padding: "8px 16px", minWidth: 64, textAlign: "center",
      boxShadow: "0 2px 8px rgba(26,26,46,0.08)",
    }}>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.5rem", fontWeight: 700, color: C.terra, lineHeight: 1 }}>{val}</div>
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
    ghost:    { background: C.white, border: `1.5px solid ${C.border}`, color: C.ink },
    primary:  { background: C.ink, color: C.white, border: `1.5px solid ${C.ink}` },
    terra:    { background: C.terra, color: C.white, border: `1.5px solid ${C.terra}` },
    again:    { background: C.again.bg, border: `1.5px solid ${C.again.border}`, color: C.again.text },
    hard:     { background: C.hard.bg,  border: `1.5px solid ${C.hard.border}`,  color: C.hard.text },
    good:     { background: C.good.bg,  border: `1.5px solid ${C.good.border}`,  color: C.good.text },
    easy:     { background: C.easy.bg,  border: `1.5px solid ${C.easy.border}`,  color: C.easy.text },
  };
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant], ...s }}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════ */
const TABS = [
  { id: "cards",    icon: "🃏", label: "Картки" },
  { id: "create",   icon: "✏️", label: "Створити" },
  { id: "settings", icon: "⚙️", label: "Налаштування" },
];

/* ═══════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════ */
export default function App() {
  const [data, setData] = useState(() => loadData());
  const [activeLang, setActiveLang] = useState(() => loadData().activeLang || "it");
  const [dictName, setDictName] = useState(() => {
    const d = loadData();
    const lang = d.activeLang || "it";
    return Object.keys(d.dictionaries).find(k => k.startsWith(lang + ":")) || Object.keys(d.dictionaries)[0];
  });
  const [idx, setIdx] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [tab, setTab] = useState("cards");
  const [newName, setNewName] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const { toast, show: showToast } = useToast();
  const { speak, sysVoices, rvReady, selectedVoiceName, selectVoice } = useSpeech(activeLang);
  const { canInstall, install, installed, isIos, dismiss } = useInstallPrompt();
  const [showIosModal, setShowIosModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const dictNames = Object.keys(data.dictionaries).filter(k => k.startsWith(activeLang + ":"));
  const displayName = (k) => k.replace(/^[a-z]+:/, "");

  const words = data.dictionaries[dictName] || [];
  const word  = words[idx] || { word: "—", translation: "—" };

  const switchLang = useCallback((code) => {
    if (code === activeLang) return;
    const nd = { ...data, activeLang: code };
    saveData(nd);
    setData(nd);
    setActiveLang(code);
    const firstDict = Object.keys(nd.dictionaries).find(k => k.startsWith(code + ":"));
    if (firstDict) {
      setDictName(firstDict);
      setIdx(0);
    }
  }, [data, activeLang]);

  useEffect(() => {
    const belongs = dictName.startsWith(activeLang + ":");
    if (!belongs) {
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

  let known = 0, learning = 0;
  words.forEach(w => {
    const p = data.progress[w.word];
    if (p && p.interval > 7) known++; else learning++;
  });
  const pct = words.length ? Math.round((known / words.length) * 100) : 0;

  const goNext = useCallback(() => {
    setIdx(i => (i + 1) % words.length);
    if (autoSpeak) setTimeout(() => speak(words[(idx + 1) % words.length]?.word || ""), 350);
  }, [words, idx, autoSpeak, speak]);

  const goPrev = () => setIdx(i => (i - 1 + words.length) % words.length);

  const grade = (score) => {
    const nd = { ...data, progress: { ...data.progress } };
    nd.progress[word.word] = applyGrade(nd.progress[word.word], score);
    nd.xp += 10;
    nd.level = Math.floor(nd.xp / 100) + 1;
    persist(nd);
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
    setDictName(key); setIdx(0);
    setNewName(""); setJsonInput("");
    setTab("cards");
    showToast(`✅ "${rawName}" створено — ${parsed.length} слів`);
  };

  const deleteDict = (name) => {
    if (dictNames.length === 1) {
      showToast("❌ Не можна видалити єдиний словник", true); return;
    }
    if (!window.confirm(`Видалити словник "${displayName(name)}"?`)) return;
    const nd = { ...data, dictionaries: { ...data.dictionaries } };
    delete nd.dictionaries[name];
    const first = Object.keys(nd.dictionaries).find(k => k.startsWith(activeLang + ":"));
    persist(nd); setDictName(first); setIdx(0);
    showToast(`🗑️ "${displayName(name)}" видалено`);
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
      if (e.key === "1") grade(0);
      if (e.key === "2") grade(1);
      if (e.key === "3") grade(2);
      if (e.key === "4") grade(3);
      if (e.key === "s") speak(word.word);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [word, goNext]);

  /* ── CARDS TAB ──────────────────────────── */
  const CardsTab = (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      padding: "12px 16px 12px", overflow: "hidden", gap: 10,
    }}>

      {/* Stats row */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexShrink: 0 }}>
        <Stat val={data.xp}    lbl="XP" />
        <Stat val={data.level} lbl="Рівень" />
        <Stat val={known}      lbl="Вивчено" />
        <Stat val={learning}   lbl="Вчиться" />
      </div>

      {/* Progress bar */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ height: 4, background: C.soft, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${C.terra},${C.gold})`, borderRadius: 4, transition: "width 0.5s" }} />
        </div>
        <p style={{ textAlign: "right", fontSize: 10, color: C.muted, marginTop: 3 }}>{pct}% вивчено</p>
      </div>

      {/* Dict chips */}
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
          {/* Counter */}
          <p style={{ textAlign: "center", fontSize: 11, color: C.muted, flexShrink: 0 }}>
            {idx + 1} / {words.length}
          </p>

          {/* Card */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <FlipCard front={word.word} back={word.translation} cardKey={`${dictName}-${idx}`} />
          </div>

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Btn onClick={goPrev} style={{ flex: 1 }}>← Назад</Btn>
            <Btn onClick={() => speak(word.word)} style={{ flex: "0 0 48px" }}>🔊</Btn>
            <Btn onClick={goNext} variant="primary" style={{ flex: 1 }}>Далі →</Btn>
          </div>

          {/* Grade buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, flexShrink: 0 }}>
            {[
              ["Знову", 0, "again"], ["Важко", 1, "hard"],
              ["Добре", 2, "good"],  ["Легко", 3, "easy"],
            ].map(([l, s, v]) => (
              <Btn key={l} onClick={() => grade(s)} variant={v} style={{ padding: "11px 4px", textAlign: "center", width: "100%" }}>{l}</Btn>
            ))}
          </div>

          {/* Keyboard hint */}
          <p style={{ textAlign: "center", fontSize: 10, color: C.faint, flexShrink: 0 }}>
            ← → переміщення · 1-4 оцінка · S озвучити
          </p>
        </>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: C.muted, fontSize: 16 }}>Словник порожній</p>
        </div>
      )}
    </div>
  );

  /* ── CREATE TAB ─────────────────────────── */
  const CreateTab = (
    <div style={{ padding: "20px 16px 40px" }}>
      <h2 style={sectionTitle}>✏️ Створити словник</h2>

      <input
        style={inputStyle} placeholder="Назва словника (напр. Урок 3)"
        value={newName} onChange={e => setNewName(e.target.value)}
      />

      <div style={{ background: "#f5f3ee", borderRadius: 8, padding: "8px 12px", marginBottom: 8, fontFamily: "monospace", fontSize: 11, color: C.muted }}>
        {`[{"word":"ciao","translation":"привіт"}, ...]`}<br/>або рядками: <b>ciao = привіт</b>
      </div>

      <textarea
        style={{ ...inputStyle, height: 140, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
        placeholder={"ciao = привіт\ngrazie = дякую\nbello = красивий"}
        value={jsonInput} onChange={e => setJsonInput(e.target.value)}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Btn onClick={() => {
          const p = parseInput(jsonInput);
          if (!p) showToast("❌ Невірний формат", true);
          else showToast(`✅ Розпізнано ${p.length} слів`);
        }} style={{ flex: 1 }}>Перевірити</Btn>
        <Btn onClick={createDict} variant="terra" style={{ flex: 1 }}>Створити →</Btn>
      </div>

      <h2 style={{ ...sectionTitle, marginTop: 32 }}>📚 Мої словники</h2>
      {dictNames.map(n => (
        <div key={n} style={{ display: "flex", alignItems: "center", background: C.white, borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: `1.5px solid ${C.soft}`, boxShadow: "0 2px 8px rgba(26,26,46,0.06)" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>{displayName(n)}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{data.dictionaries[n].length} слів</div>
          </div>
          <button onClick={() => { switchDict(n); setTab("cards"); }} style={linkBtn}>Відкрити</button>
          <button onClick={() => deleteDict(n)} style={{ ...linkBtn, color: "#c0392b", marginLeft: 14 }}>🗑️</button>
        </div>
      ))}
    </div>
  );

  /* ── SETTINGS TAB ────────────────────────── */
  const SettingsTab = (
    <div style={{ padding: "20px 16px 40px" }}>
      <h2 style={sectionTitle}>⚙️ Налаштування</h2>

      <SettingRow label="Авто-озвучення" desc="Говорити слово при переході до нової картки">
        <Toggle value={autoSpeak} onChange={setAutoSpeak} />
      </SettingRow>

      {/* VOICE SELECTOR */}
      <div style={{ background: C.white, borderRadius: 16, padding: "16px 18px", marginBottom: 12, border: `1.5px solid ${C.soft}` }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.ink, marginBottom: 4 }}>🎙️ Голос — {LANGUAGES[activeLang]?.label}</div>

        {sysVoices.length > 0 && (
          <>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Системні голоси</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {sysVoices.map(v => (
                <div key={v.name} onClick={() => { selectVoice(v.name); speak(LANGUAGES[activeLang]?.sample || v.name); }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                    border: `1.5px solid ${selectedVoiceName === v.name ? C.terra : C.border}`,
                    background: selectedVoiceName === v.name ? "#fdf2ee" : C.paper,
                    transition: "all 0.15s",
                  }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: C.ink }}>{v.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                      {v.lang} · {v.localService ? "локальний" : "✨ онлайн"}
                    </div>
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
                const isSelected = selectedVoiceName === key;
                return (
                  <div key={key} onClick={() => { if (!rvReady) return; selectVoice(key); speak(LANGUAGES[activeLang]?.sample || ""); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 14px", borderRadius: 10,
                      cursor: rvReady ? "pointer" : "not-allowed",
                      border: `1.5px solid ${isSelected ? C.terra : C.border}`,
                      background: isSelected ? "#fdf2ee" : rvReady ? C.paper : "#f8f8f8",
                      opacity: rvReady ? 1 : 0.55,
                      transition: "all 0.15s",
                    }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.ink }}>{rv.label}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>ResponsiveVoice · ☁️ онлайн</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {isSelected && <span style={{ fontSize: 11, color: C.terra, fontWeight: 700 }}>✓</span>}
                      <span style={{ fontSize: 18 }}>🔊</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {sysVoices.length === 0 && !rvReady && (
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Голоси завантажуються...</div>
        )}
      </div>

      {!installed ? (
        <SettingRow
          label="📲 Додати на екран"
          desc={isIos ? "Інструкція для Safari на iPhone" : "Встановити як додаток на телефон"}
        >
          <Btn variant="terra" onClick={() => {
            if (isIos) setShowIosModal(true);
            else if (canInstall) install();
          }}>
            {isIos ? "Як?" : "Встановити"}
          </Btn>
        </SettingRow>
      ) : (
        <SettingRow label="✅ Додаток встановлено" desc="Відкривай з домашнього екрану">
          <span style={{ fontSize: 22 }}>🎉</span>
        </SettingRow>
      )}

      <SettingRow label="Скинути прогрес" desc="Видалити весь прогрес навчання та XP">
        <Btn variant="again" onClick={() => {
          if (window.confirm("Скинути весь прогрес?")) {
            persist({ ...data, progress: {}, xp: 0, level: 1 });
            showToast("✅ Прогрес скинуто");
          }
        }}>Скинути</Btn>
      </SettingRow>

      <div style={{ background: C.white, borderRadius: 16, padding: 18, border: `1.5px solid ${C.soft}`, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 700, color: C.ink, marginBottom: 8 }}>Про застосунок</div>
        <div style={{ fontSize: 13, color: C.muted }}>Italian Flashcards · Spaced Repetition</div>
        <div style={{ fontSize: 13, color: C.muted }}>Словників: {dictNames.length} · Слів: {Object.values(data.dictionaries).flat().length}</div>
        <div style={{ fontSize: 13, color: C.muted }}>Рівень {data.level} · {data.xp} XP зароблено</div>
        <div style={{ fontSize: 13, color: C.muted }}>Прогрес зберігається локально</div>
      </div>
    </div>
  );

  /* ── RENDER ─────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.paper}; font-family: 'DM Sans', sans-serif; overflow: hidden; height: 100%; }
        html { height: 100%; }
        #root { height: 100vh; height: 100dvh; overflow: hidden; display: flex; flex-direction: column; }
        ::-webkit-scrollbar { display: none; }
        button { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div style={{
        height: "100vh", height: "100dvh", background: C.paper,
        backgroundImage: `radial-gradient(ellipse 80% 50% at 15% 5%, rgba(192,88,58,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 85% 85%, rgba(107,143,113,0.08) 0%, transparent 60%)`,
        display: "flex", flexDirection: "column", maxWidth: 520, margin: "0 auto",
        overflow: "hidden",
      }}>
        {/* HEADER — fixed height, no layout shift between tabs */}
        <header style={{
          padding: "14px 20px 12px",
          borderBottom: `1px solid ${C.soft}`,
          background: "rgba(250,248,243,0.9)",
          backdropFilter: "blur(8px)",
          position: "sticky", top: 0, zIndex: 10,
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}>
          {/* Title — flex: 1 + minWidth: 0 prevents it from pushing the dropdown */}
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.6rem", fontWeight: 700, color: C.ink, lineHeight: 1,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {LANGUAGES[activeLang]?.label} <em style={{ color: C.terra, fontStyle: "italic" }}>Flashcards</em>
            </h1>
            <p style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 3 }}>
              Spaced repetition
            </p>
          </div>

          {/* LANGUAGE DROPDOWN — flexShrink: 0 keeps it from being squeezed */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div onClick={() => setShowLangMenu(m => !m)} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: C.white, border: `1.5px solid ${C.border}`,
              borderRadius: 10, padding: "7px 12px",
              boxShadow: "0 2px 8px rgba(26,26,46,0.07)",
              cursor: "pointer", userSelect: "none",
            }}>
              {LANGUAGES[activeLang]?.flag}
              <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{LANGUAGES[activeLang]?.label}</span>
              <span style={{ fontSize: 10, color: C.muted, marginLeft: 2 }}>{showLangMenu ? "▲" : "▼"}</span>
            </div>

            {showLangMenu && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0,
                background: C.white, border: `1.5px solid ${C.border}`,
                borderRadius: 12, overflow: "hidden",
                boxShadow: "0 8px 24px rgba(26,26,46,0.14)",
                zIndex: 50, minWidth: 160,
              }}>
                {Object.values(LANGUAGES).map(lang => (
                  <div key={lang.code} onClick={() => { switchLang(lang.code); setShowLangMenu(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "11px 14px", cursor: "pointer",
                      background: activeLang === lang.code ? "#fdf2ee" : C.white,
                      borderBottom: `1px solid ${C.soft}`,
                      transition: "background 0.12s",
                    }}>
                    {lang.flag}
                    <span style={{ fontSize: 14, fontWeight: activeLang === lang.code ? 700 : 500, color: activeLang === lang.code ? C.terra : C.ink }}>
                      {lang.label}
                    </span>
                    {activeLang === lang.code && <span style={{ marginLeft: "auto", color: C.terra, fontSize: 14 }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {tab === "cards" ? CardsTab : (
            <div style={{ flex: 1, overflowY: "auto" }}>
              {tab === "create"   ? CreateTab   : null}
              {tab === "settings" ? SettingsTab : null}
            </div>
          )}
        </div>

        {/* BOTTOM NAV — slightly taller padding */}
        <nav style={{ display: "flex", borderTop: `1px solid ${C.soft}`, background: "rgba(250,248,243,0.95)", backdropFilter: "blur(8px)", position: "sticky", bottom: 0 }}>
          {TABS.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "14px 4px 12px", background: "none", border: "none", cursor: "pointer",
              gap: 2,
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: tab === id ? 700 : 400, color: tab === id ? C.terra : C.muted, letterSpacing: "0.03em" }}>{label}</span>
              {tab === id && <div style={{ width: 4, height: 4, borderRadius: 2, background: C.terra }} />}
            </button>
          ))}
        </nav>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: toast.err ? "#c0392b" : C.ink,
          color: C.white, padding: "12px 24px", borderRadius: 30,
          fontSize: 13, fontWeight: 600, zIndex: 100, whiteSpace: "nowrap",
          animation: "fadeUp 0.25s ease",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(10px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }`}</style>

      {/* iOS INSTALL MODAL */}
      {showIosModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={() => setShowIosModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.white, borderRadius: "20px 20px 0 0",
            padding: "24px 24px 40px", width: "100%", maxWidth: 520,
            boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
          }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📲</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.3rem", fontWeight: 700, color: C.ink }}>
                Додати на екран
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Три кроки в Safari</div>
            </div>
            {[
              { num: "1", icon: "⬆️", text: 'Натисни кнопку "Поділитись"', sub: "квадрат зі стрілкою внизу Safari" },
              { num: "2", icon: "➕", text: 'Обери "На екран Дому"', sub: 'прокрути список вниз якщо не видно' },
              { num: "3", icon: "✅", text: "Натисни «Додати»", sub: "іконка з'явиться на домашньому екрані" },
            ].map(({ num, icon, text, sub }) => (
              <div key={num} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: C.terra,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>{icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{text}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>
                </div>
              </div>
            ))}
            <button onClick={() => setShowIosModal(false)} style={{
              width: "100%", padding: "13px", borderRadius: 12,
              background: C.terra, color: C.white, border: "none",
              fontWeight: 700, fontSize: 15, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", marginTop: 4,
            }}>Зрозуміло!</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════
   SMALL COMPONENTS
═══════════════════════════════════════════════ */
function SettingRow({ label, desc, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.white, borderRadius: 16, padding: "16px 18px", marginBottom: 12, border: `1.5px solid ${C.soft}` }}>
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
    <div onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12, background: value ? C.sage : "#ddd",
      position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 3, left: value ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%", background: C.white,
        transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }} />
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: `1.5px solid ${C.border}`, background: "#faf9f6",
  fontSize: 14, color: C.ink, outline: "none", marginBottom: 10,
  fontFamily: "'DM Sans', sans-serif",
};

const sectionTitle = {
  fontFamily: "'Playfair Display', serif", fontSize: "1.15rem",
  fontWeight: 700, color: C.ink, marginBottom: 16,
};

const linkBtn = {
  background: "none", border: "none", color: C.terra,
  fontWeight: 600, fontSize: 13, cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};