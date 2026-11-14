"use client";
import { useEffect, useRef, useState } from "react";
import Pixel from "./Pixel";
import { levels, gameText } from "../game/config";
type Mode = "menu" | "loading" | "playing" | "memory" | "final" | "error";
type Engine = ReturnType<typeof import("../game/engine").createGame>;
export default function Home() {
  const [mode, setMode] = useState<Mode>("menu"),
    [sound, setSound] = useState(true),
    [level, setLevel] = useState(0),
    [hearts, setHearts] = useState(0),
    [photoFailed, setPhotoFailed] = useState(false),
    [checkpoint, setCheckpoint] = useState(false);
  const host = useRef<HTMLDivElement>(null),
    engine = useRef<Engine | null>(null),
    audio = useRef<AudioContext | null>(null),
    enabled = useRef(true),
    active = useRef(true),
    starting = useRef(false),
    timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function unlock() {
    try {
      const Context =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!audio.current) audio.current = new Context();
      void audio.current.resume().catch(() => {});
    } catch {}
  }
  function tone(kind: string) {
    const ctx = audio.current;
    if (!ctx || !enabled.current) return;
    const notes =
      kind === "heart"
        ? [784, 1047]
        : kind === "finish"
          ? [523, 659, 784, 1047]
          : kind === "checkpoint"
            ? [659, 880]
            : [330];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator(),
        gain = ctx.createGain(),
        t = ctx.currentTime + i * 0.08;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.055, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    });
  }
  async function start() {
    if (starting.current) return;
    starting.current = true;
    unlock();
    engine.current?.destroy();
    engine.current = null;
    setLevel(0);
    setHearts(0);
    setCheckpoint(false);
    setPhotoFailed(false);
    setMode("loading");
    try {
      const { createGame } = await import("../game/engine");
      if (!active.current || !host.current) return;
      engine.current = createGame(host.current, {
        onReady: () => setMode("playing"),
        onHeart: setHearts,
        onSound: tone,
        onCheckpoint: () => {
          setCheckpoint(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCheckpoint(false), 1800);
        },
        onLevelEnd: (i) => {
          setLevel(i);
          setPhotoFailed(false);
          setMode(i === levels.length - 1 ? "final" : "memory");
        },
      });
    } catch {
      setMode("error");
    } finally {
      starting.current = false;
    }
  }
  function advance() {
    setLevel(level + 1);
    setCheckpoint(false);
    setMode("playing");
    engine.current?.startLevel(level + 1);
  }
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      clearTimeout(timer.current);
      engine.current?.destroy();
      void audio.current?.close();
    };
  }, []);
  const memoryPhoto = photoFailed ? (
    <div className="memoryArt" />
  ) : (
    <img
      className="memoryPhoto"
      src={levels[level].photo}
      alt={levels[level].title}
      onError={() => setPhotoFailed(true)}
    />
  );
  const menu = mode === "menu" || mode === "error";
  return (
    <>
      <header>
        <div className="nav">
          <div className="brand">
            <Pixel name="pad" size={36} />
            Kalp Arcade
          </div>
          <button
            className="audio"
            aria-pressed={sound}
            onClick={() => {
              unlock();
              enabled.current = !sound;
              setSound(!sound);
              if (!sound) tone("heart");
            }}
          >
            <Pixel name="sound" size={16} />
            {sound ? "Ses açık" : "Ses kapalı"}
          </button>
        </div>
      </header>
      <main>
        <div className="ambient" aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => (
            <span
              key={i}
              style={{
                left: ((i * 37 + 3) % 99) + "%",
                top: ((i * 29 + 3) % 96) + "%",
              }}
            >
              <Pixel
                name={i % 4 === 0 ? "heart" : "star"}
                size={i % 4 === 0 ? 19 : 10}
                tone="#efc6d4"
                ink="#e9b5c8"
              />
            </span>
          ))}
        </div>
        <section
          className={"cabinet " + (menu ? "" : "running")}
          aria-label="Oyun penceresi"
        >
          <div className="windowbar">
            <span className="lamps">
              <i />
              <i />
              <i />
            </span>
            <span>ASKIMA_GIDEN_YOL.EXE</span>
            <span className="windowheart">♥</span>
          </div>
          <div className={"stage " + (menu ? "intro" : "")}>
            <div className="gamehost" ref={host} />
            {menu && (
              <div className="hero">
                <div className="herocopy">
                  <div className="ribbon">
                    <Pixel name="star" size={12} tone="#ffdc83" /> DOĞUM GÜNÜ
                    MACERASI <Pixel name="star" size={12} tone="#ffdc83" />
                  </div>
                  <h1>
                    <span>Aşkıma Giden Yol</span>
                  </h1>
                  <p>{gameText.intro}</p>
                  <button className="primary" onClick={start}>
                    <Pixel name="play" size={18} tone="#fff3e1" ink="#51364a" />
                    {mode === "error" ? "Tekrar dene" : "Oyuna başla"}
                  </button>
                </div>
                <div className="landscape" />
                <div className="hero-decor" aria-hidden="true">
                  {["heart", "star", "star", "heart", "star", "heart"].map(
                    (n, i) => (
                      <span key={i}>
                        <Pixel
                          name={n}
                          size={[27, 14, 20, 24, 16, 13][i]}
                          tone={n === "heart" ? "#ffa5be" : "#ffe29a"}
                        />
                      </span>
                    ),
                  )}
                </div>
              </div>
            )}
            {mode === "loading" && (
              <div className="overlay">Oyun yükleniyor…</div>
            )}
            {checkpoint && mode === "playing" && (
              <div className="toast">⚑ Kontrol noktası</div>
            )}
            {mode === "playing" && (
              <div className="touch">
                {(["left", "right", "jump"] as const).map((k, i) => (
                  <button
                    key={k}
                    aria-label={["Sola git", "Sağa git", "Zıpla"][i]}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      engine.current?.input(k, true);
                    }}
                    onLostPointerCapture={() => engine.current?.input(k, false)}
                    onPointerUp={() => engine.current?.input(k, false)}
                    onPointerCancel={() => engine.current?.input(k, false)}
                  >
                    {["◀", "▶", "↑"][i]}
                  </button>
                ))}
              </div>
            )}
            {mode === "memory" && (
              <div className="overlay">
                <article
                  className="card"
                  role="dialog"
                  aria-modal="true"
                  aria-label={levels[level].title}
                >
                  {memoryPhoto}
                  <h2>{levels[level].title}</h2>
                  <p>{levels[level].message}</p>
                  <button autoFocus className="primary" onClick={advance}>
                    Sonraki bölüm ▸
                  </button>
                </article>
              </div>
            )}
            {mode === "final" && (
              <div className="overlay finale">
                <div className="confetti" aria-hidden="true">
                  {Array.from({ length: 36 }, (_, i) => (
                    <i
                      key={i}
                      style={{
                        left: ((i * 37) % 100) + "%",
                        animationDelay: -(i % 9) * 0.43 + "s",
                        color: ["#ed7292", "#b98bdf", "#f7c259"][i % 3],
                      }}
                    >
                      {i % 3 ? "▪" : "♥"}
                    </i>
                  ))}
                </div>
                <article className="card">
                  {memoryPhoto}
                  <h2>{gameText.final}</h2>
                  <p>{levels[level].message}</p>
                  <button className="primary" onClick={start}>
                    Tekrar oyna
                  </button>
                </article>
              </div>
            )}
          </div>
          <div className="status">
            <div>
              <Pixel name="heart" size={17} />
              <b>{menu ? "00" : String(hearts).padStart(2, "0")}</b>
              <em />
              <Pixel name="flag" size={16} tone="#facc9d" ink="#fff2dd" />
              <span>{menu ? "3 bölüm" : `Bölüm ${level + 1}/3`}</span>
            </div>
            <span className="state">
              <i />
              {menu
                ? "Oynamaya hazır"
                : mode === "playing"
                  ? levels[level].name
                  : mode === "loading"
                    ? "Yükleniyor"
                    : "Bölüm tamamlandı"}
            </span>
          </div>
        </section>
        <aside className="controls">
          <span>
            <Pixel name="pad" size={22} /> Kontroller
          </span>
          <div>
            <kbd>←</kbd>
            <kbd>→</kbd>
            <small>/</small>
            <kbd>A</kbd>
            <kbd>D</kbd> Hareket
          </div>
          <div>
            <kbd>Space</kbd> Zıpla
          </div>
        </aside>
        <p className="rotate">
          ↻ Daha rahat oynamak için telefonu yatay çevir.
        </p>
      </main>
    </>
  );
}
