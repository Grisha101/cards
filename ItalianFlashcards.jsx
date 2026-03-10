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

const DEFAULT_DATA = {
  xp: 0, level: 1,
  dictionaries: {
    "Базові слова": [
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
  },
  progress: {},
};

function loadData() {
  try {
    const raw = localStorage.getItem("ifc_v3");
    return raw ? JSON.parse(raw) : DEFAULT_DATA;
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

function useSpeech() {
  const voiceRef = useRef(null);
  useEffect(() => {
    const pick = () => {
      const all = window.speechSynthesis.getVoices();
      const it = all.filter(v => v.lang.toLowerCase().startsWith("it"));
      voiceRef.current = it.find(v => !v.localService) || it.find(v => /alice|bianca|luca|federica/i.test(v.name)) || it[0] || null;
    };
    window.speechSynthesis.onvoiceschanged = pick;
    pick(); setTimeout(pick, 500); setTimeout(pick, 1500);
  }, []);

  return useCallback((text) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "it-IT"; u.rate = 0.82; u.pitch = 0.92; u.volume = 1;
    if (voiceRef.current) u.voice = voiceRef.current;
    window.speechSynthesis.speak(u);
  }, []);
}

/* ═══════════════════════════════════════════════
   FLIP CARD
═══════════════════════════════════════════════ */
function FlipCard({ front, back, cardKey }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => setFlipped(false), [cardKey]);

  return (
    <div onClick={() => setFlipped(f => !f)} style={{ perspective: 1200, cursor: "pointer", userSelect: "none" }}>
      <div style={{
        position: "relative", width: "100%", height: 200,
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
  const [dictName, setDictName] = useState(() => Object.keys(loadData().dictionaries)[0]);
  const [idx, setIdx] = useState(0);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [tab, setTab] = useState("cards");
  const [newName, setNewName] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const { toast, show: showToast } = useToast();
  const speak = useSpeech();

  const words = data.dictionaries[dictName] || [];
  const word  = words[idx] || { word: "—", translation: "—" };

  const persist = useCallback((d) => { setData(d); saveData(d); }, []);

  // stats
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
    const name = newName.trim() || "Словник " + (Object.keys(data.dictionaries).length + 1);
    persist({ ...data, dictionaries: { ...data.dictionaries, [name]: parsed } });
    setDictName(name); setIdx(0);
    setNewName(""); setJsonInput("");
    setTab("cards");
    showToast(`✅ "${name}" створено — ${parsed.length} слів`);
  };

  const deleteDict = (name) => {
    if (name === Object.keys(DEFAULT_DATA.dictionaries)[0] && Object.keys(data.dictionaries).length === 1) {
      showToast("❌ Не можна видалити єдиний словник", true); return;
    }
    if (!window.confirm(`Видалити словник "${name}"?`)) return;
    const nd = { ...data, dictionaries: { ...data.dictionaries } };
    delete nd.dictionaries[name];
    const first = Object.keys(nd.dictionaries)[0];
    persist(nd); setDictName(first); setIdx(0);
    showToast(`🗑️ "${name}" видалено`);
  };

  // keyboard
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

  const dictNames = Object.keys(data.dictionaries);

  /* ── CARDS TAB ──────────────────────────── */
  const CardsTab = (
    <div style={{ padding: "20px 16px 40px" }}>
      {/* Stats */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <Stat val={data.xp}    lbl="XP" />
        <Stat val={data.level} lbl="Рівень" />
        <Stat val={known}      lbl="Вивчено" />
        <Stat val={learning}   lbl="Вчиться" />
      </div>

      {/* Progress */}
      <div style={{ height: 5, background: C.soft, borderRadius: 4, overflow: "hidden", marginBottom: 6, maxWidth: 440, margin: "0 auto 6px" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${C.terra},${C.gold})`, borderRadius: 4, transition: "width 0.5s" }} />
      </div>
      <p style={{ textAlign: "right", fontSize: 11, color: C.muted, maxWidth: 440, margin: "0 auto 16px" }}>{pct}% вивчено</p>

      {/* Dict chips */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 16, scrollbarWidth: "none" }}>
        {dictNames.map(n => (
          <button key={n} onClick={() => switchDict(n)} style={{
            padding: "6px 14px", borderRadius: 20, border: `1.5px solid`,
            borderColor: dictName === n ? C.terra : C.soft,
            background: dictName === n ? C.terra : C.white,
            color: dictName === n ? C.white : C.ink,
            fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
            fontFamily: "'DM Sans', sans-serif",
          }}>{n}</button>
        ))}
      </div>

      {words.length > 0 ? (
        <>
          <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginBottom: 10 }}>{idx + 1} / {words.length}</p>
          <FlipCard front={word.word} back={word.translation} cardKey={`${dictName}-${idx}`} />

          {/* Nav */}
          <div style={{ display: "flex", gap: 8, marginTop: 20, marginBottom: 12 }}>
            <Btn onClick={goPrev} style={{ flex: 1 }}>← Назад</Btn>
            <Btn onClick={() => speak(word.word)} style={{ flex: "0 0 48px" }}>🔊</Btn>
            <Btn onClick={goNext} variant="primary" style={{ flex: 1 }}>Далі →</Btn>
          </div>

          {/* Grade */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              ["Знову", 0, "again"], ["Важко", 1, "hard"],
              ["Добре", 2, "good"],  ["Легко", 3, "easy"],
            ].map(([l, s, v]) => (
              <Btn key={l} onClick={() => grade(s)} variant={v} style={{ padding: "12px 4px", textAlign: "center", width: "100%" }}>{l}</Btn>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: 11, color: C.faint, marginTop: 14 }}>
            ← → переміщення · 1-4 оцінка · S озвучити
          </p>
        </>
      ) : (
        <p style={{ textAlign: "center", color: C.muted, marginTop: 60, fontSize: 16 }}>Словник порожній</p>
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
            <div style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>{n}</div>
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
        body { background: ${C.paper}; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { display: none; }
        button { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: C.paper,
        backgroundImage: `radial-gradient(ellipse 80% 50% at 15% 5%, rgba(192,88,58,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 85% 85%, rgba(107,143,113,0.08) 0%, transparent 60%)`,
        display: "flex", flexDirection: "column", maxWidth: 520, margin: "0 auto",
      }}>
        {/* HEADER */}
        <header style={{ textAlign: "center", padding: "24px 20px 16px", borderBottom: `1px solid ${C.soft}`, background: "rgba(250,248,243,0.9)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 10 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,5vw,2.6rem)", fontWeight: 700, color: C.ink, lineHeight: 1 }}>
            Italian <em style={{ color: C.terra, fontStyle: "italic" }}>Flashcards</em>
          </h1>
          <p style={{ fontSize: 11, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>
            Spaced repetition · Ukrainian translations
          </p>
        </header>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {tab === "cards"    ? CardsTab    : null}
          {tab === "create"   ? CreateTab   : null}
          {tab === "settings" ? SettingsTab : null}
        </div>

        {/* BOTTOM NAV */}
        <nav style={{ display: "flex", borderTop: `1px solid ${C.soft}`, background: "rgba(250,248,243,0.95)", backdropFilter: "blur(8px)", position: "sticky", bottom: 0 }}>
          {TABS.map(({ id, icon, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              padding: "10px 4px 8px", background: "none", border: "none", cursor: "pointer",
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
