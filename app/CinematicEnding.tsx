"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ending as script } from "../game/config";
import "./ending.css";

type Phase = "approach" | "wish" | "burst" | "letter" | "album" | "story";
const timing = Object.fromEntries(
  Object.entries(script.ms).map(([name, ms]) => ["--" + name, ms + "ms"]),
) as CSSProperties;

function CandleCake({ lit }: { lit: boolean }) {
  return (
    <svg
      className="wish-cake"
      viewBox="0 0 100 80"
      role="img"
      aria-label={
        lit ? "Mumları yanan doğum günü pastası" : "Doğum günü pastası"
      }
      shapeRendering="crispEdges"
    >
      <ellipse cx="50" cy="75" rx="43" ry="4" fill="#95789c" opacity=".25" />
      <path fill="#705771" d="M5 67h90v5h-5v2H10v-2H5z" />
      <path fill="#fff0da" d="M8 67h84v3H8z" />
      {[
        [10, 49, 80, 19],
        [22, 32, 56, 19],
      ].map(([x, y, w, h]) => (
        <g key={y}>
          <rect x={x} y={y} width={w} height={h} rx="2" fill="#985f78" />
          <rect
            x={x + 2}
            y={y + 2}
            width={w - 4}
            height={h - 4}
            fill="#ed9baa"
          />
          <rect x={x + 2} y={y + 10} width={w - 4} height="3" fill="#ffe6c7" />
          <path
            d={`M${x + 1} ${y + 1}h${w - 2}v5h-5v3h-4v-3h-9v2h-5v-2h-8v4h-5v-4h-8v-1H${x + 1}z`}
            fill="#fff4de"
          />
          {Array.from({ length: Math.floor(w / 14) }, (_, i) => (
            <rect
              key={i}
              x={x + 5 + i * 14}
              y={y + 14}
              width="3"
              height="2"
              fill="#b56b89"
            />
          ))}
        </g>
      ))}
      {[34, 50, 66].map((x, i) => (
        <g key={x}>
          <rect x={x - 2} y="19" width="5" height="13" fill="#9b6287" />
          <path
            d={`M${x - 1} 20h3v10h-3z`}
            fill={i === 1 ? "#b9a1dd" : "#ffacc0"}
          />
          <rect x={x} y="17" width="1" height="3" fill="#655067" />
          {lit && (
            <g className="flame" style={{ animationDelay: i * -0.17 + "s" }}>
              <path
                d={`M${x} 8h2v3h2v5h-2v2h-4v-2h-1v-3h2v-3h1z`}
                fill="#f4a04b"
              />
              <rect x={x} y="13" width="2" height="4" fill="#fff9ca" />
            </g>
          )}
        </g>
      ))}
      <path
        fill="#bc5e83"
        d="M44 52h4v2h3v-2h4v2h2v4h-2v2h-2v2h-4v-2h-2v-2h-3z"
      />
    </svg>
  );
}

function Shower({ burst }: { burst: boolean }) {
  return (
    <div className="wish-shower" aria-hidden="true">
      {Array.from({ length: burst ? 32 : 16 }, (_, i) => (
        <i
          key={i}
          style={
            {
              left: ((i * 29 + 3) % 98) + "%",
              "--dx": ((i % 7) - 3) * 18 + "px",
              animationDelay: (i % 5) * 0.06 + "s",
              color: ["#d96b94", "#ffd886", "#a48ac6", "#e9a0b4"][i % 4],
            } as CSSProperties
          }
        >
          {!burst || i % 3 === 0 ? "♥" : "▪"}
        </i>
      ))}
    </div>
  );
}

export default function CinematicEnding({
  sound,
  onReplay,
  unlock,
  chime,
}: {
  sound: boolean;
  onReplay: () => void;
  unlock: () => void;
  chime: (volume: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>("approach");
  const [photos, setPhotos] = useState<((typeof script.photos)[number] & { ratio: number })[]>([]);
  const [index, setIndex] = useState(0);
  const [love, setLove] = useState(0);
  const blown = useRef(false);
  const music = useRef<HTMLAudioElement | null>(null);
  const muted = useRef(!sound);
  const fallback = useRef(chime);
  const ms = script.ms;
  useEffect(() => {
    muted.current = !sound;
    fallback.current = chime;
    if (music.current) music.current.muted = !sound;
  }, [sound, chime]);

  useEffect(() => {
    let live = true;
    const images = script.photos.slice(0, 5).map(() => new Image());
    let remaining = images.length;
    const collect = () => {
      if (live)
        setPhotos(
          images.flatMap((img, i) =>
            img.complete && img.naturalWidth && img.naturalHeight
              ? [{ ...script.photos[i], ratio: img.naturalWidth / img.naturalHeight }]
              : [],
          ),
        );
    };
    const stopLoading = () =>
      images.forEach((img) => {
        img.onload = img.onerror = null;
        if (!img.complete) img.removeAttribute("src");
      });
    const cutoff = window.setTimeout(() => {
      collect();
      stopLoading();
    }, ms.photoLoadLimit);
    images.forEach((img, i) => {
      img.onload = img.onerror = () => {
        if (--remaining === 0) {
          clearTimeout(cutoff);
          collect();
        }
      };
      img.src = script.photos[i].src;
    });
    return () => {
      live = false;
      clearTimeout(cutoff);
      stopLoading();
      const clip = music.current;
      if (clip) {
        clip.onerror = null;
        clip.pause();
        clip.removeAttribute("src");
        clip.load();
        music.current = null;
      }
    };
  }, [ms.photoLoadLimit]);
  useEffect(() => {
    let delay: number, next: () => void;
    if (phase === "approach") {
      delay = ms.camera;
      next = () => setPhase("wish");
    } else if (phase === "burst") {
      delay = ms.celebration;
      next = () => setPhase("letter");
    } else if (phase === "letter") {
      delay = ms.line * script.lines.length + ms.read;
      next = () => setPhase(photos.length ? "album" : "story");
    } else if (phase === "album") {
      delay = ms.photo;
      next = () => {
        if (index + 1 < photos.length) setIndex(index + 1);
        else setPhase("story");
      };
    } else return;
    const timer = window.setTimeout(next, delay);
    return () => clearTimeout(timer);
  }, [phase, index, photos.length, ms]);

  function blow() {
    if (blown.current) return;
    blown.current = true;
    setPhase("burst");
    unlock();
    if (!sound || script.sound.volume <= 0) return;
    const volume = Math.min(1, script.sound.volume);
    if (!script.sound.file) {
      chime(volume);
      return;
    }
    const clip = new Audio(script.sound.file);
    music.current = clip;
    clip.volume = volume;
    let failed = false;
    const onError = () => {
      if (!failed && music.current === clip && !muted.current) {
        failed = true;
        fallback.current(volume);
      }
    };
    clip.onerror = onError;
    void clip.play().catch(onError);
  }
  return (
    <section
      className={"cinematic phase-" + phase}
      style={timing}
      aria-label="Doğum günü finali"
    >
      {phase !== "approach" && (
        <>
          <div className="wish-sky" aria-hidden="true">
            <i />
            <i />
            {Array.from({ length: 16 }, (_, i) => (
              <b
                key={i}
                className={i % 4 === 0 ? "floating" : "glint"}
                style={{
                  left: ((i * 37 + 3) % 97) + "%",
                  top: ((i * 19 + 5) % 90) + "%",
                  animationDelay: -(i % 7) * 0.8 + "s",
                }}
              >
                {i % 4 === 0 ? "♥" : "✦"}
              </b>
            ))}
          </div>
          {(phase === "wish" || phase === "burst") && (
            <div className="wish-content">
              <CandleCake lit={phase === "wish"} />
              <h2>{script.wish}</h2>
              {phase === "wish" ? (
                <button autoFocus className="primary" onClick={blow}>
                  {script.blow}
                </button>
              ) : (
                <div className="button-space" />
              )}
            </div>
          )}
          {phase === "burst" && (
            <>
              <div className="wish-flash" />
              <Shower burst />
            </>
          )}
          {phase === "letter" && (
            <div className="wish-content wish-letter">
              <h2>{script.title}</h2>
              {script.lines.map((line, i) => (
                <p key={i} style={{ animationDelay: (i + 1) * ms.line + "ms" }}>
                  {line}
                </p>
              ))}
            </div>
          )}
          {phase === "album" && (
            <figure key={index} className="polaroid" style={{ "--ratio": photos[index].ratio } as CSSProperties}>
              <img
                src={photos[index].src}
                alt={`Birlikte bir anımız, ${index + 1}`}
              />
              <figcaption>{photos[index].compliment}</figcaption>
            </figure>
          )}
          {phase === "story" && (
            <div className="wish-content wish-story">
              <div aria-hidden="true" className="heart-seal">
                ♥
              </div>
              <p>{script.goodbye}</p>
              <div className="after-pause">
                <h2>{script.story}</h2>
                <p>{script.note}</p>
                <div className="ending-actions">
                  <button className="primary" onClick={() => setLove(love + 1)}>
                    {script.love}
                  </button>
                  <button className="audio" onClick={onReplay}>
                    {script.replay}
                  </button>
                </div>
              </div>
              <div className="love-reply" role="status">
                {love > 0 && script.reply}
              </div>
            </div>
          )}
          {love > 0 && <Shower key={love} burst={false} />}
        </>
      )}
    </section>
  );
}
