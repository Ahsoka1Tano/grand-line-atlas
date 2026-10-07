"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, PackageOpen, RotateCcw, Sparkles } from "lucide-react";
import { demoBoxCards, rarityLabels } from "@/content/cards";
import { CharacterCardView } from "@/components/character-card";
import { Modal } from "@/components/modal";

type Props = { muted: boolean; onClose: () => void; onClaim: () => void };

export function TreasureChest({ opening = false }: { opening?: boolean }) {
  return (
    <div className={`treasure-wrap ${opening ? "chest-opening" : ""}`} aria-hidden="true">
      <div className="chest-halo" />
      <div className="chest-floor" />
      <div className="treasure-chest">
        <div className="chest-lid">
          <span className="chest-band band-left" />
          <span className="chest-band band-right" />
          <div className="chest-lid-mark">
            G<span>✦</span>L
          </div>
        </div>
        <div className="chest-light" />
        <div className="chest-base">
          <span className="chest-band band-left" />
          <span className="chest-band band-right" />
          <span className="chest-lock">✦</span>
          <span className="chest-rivet rivet-left" />
          <span className="chest-rivet rivet-right" />
        </div>
      </div>
      <div className="chest-particles">
        {Array.from({ length: 14 }, (_, i) => (
          <i key={i} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}

export function BoxOpening({ muted, onClose, onClaim }: Props) {
  const [phase, setPhase] = useState<"sealed" | "opening" | "reveal" | "summary">("sealed");
  const [revealed, setRevealed] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const reduceMotion = useReducedMotion();
  const audioRef = useRef<AudioContext | null>(null);
  const claimedRef = useRef(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const playTone = useCallback((rare = false) => {
    if (mutedRef.current) return;
    try {
      const AudioContextClass = window.AudioContext;
      const context = audioRef.current ?? new AudioContextClass();
      audioRef.current = context;
      void context.resume().catch(() => {});
      [0, 0.09, 0.18].forEach((offset, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = (rare ? 523.25 : 329.63) * [1, 1.25, 1.5][index];
        gain.gain.setValueAtTime(0, context.currentTime + offset);
        gain.gain.linearRampToValueAtTime(0.045, context.currentTime + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + offset + 0.7);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(context.currentTime + offset);
        oscillator.stop(context.currentTime + offset + 0.75);
      });
    } catch {
      /* The animation still works when browser audio is unavailable. */
    }
  }, []);

  useEffect(
    () => () => {
      void audioRef.current?.close().catch(() => {});
    },
    [],
  );
  useEffect(() => {
    if (phase !== "opening") return;
    const timeout = setTimeout(
      () => {
        setPhase("reveal");
        setRevealed(1);
        playTone();
      },
      reduceMotion ? 100 : 1900,
    );
    return () => clearTimeout(timeout);
  }, [phase, reduceMotion, playTone]);
  useEffect(() => {
    if (phase !== "reveal") return;
    const timeout = setTimeout(
      () => {
        if (revealed < 3) {
          setRevealed(revealed + 1);
          playTone(revealed === 2);
        } else setPhase("summary");
      },
      reduceMotion ? 120 : 950,
    );
    return () => clearTimeout(timeout);
  }, [phase, revealed, reduceMotion, playTone]);

  const skip = () => {
    setRevealed(3);
    setPhase("summary");
  };
  const claim = () => {
    if (claimedRef.current) return;
    claimedRef.current = true;
    onClaim();
    setClaimed(true);
  };
  const replay = () => {
    // Replay is presentation only and cannot claim this opening a second time.
    setRevealed(0);
    setPhase("opening");
    playTone();
  };

  return (
    <Modal label="Открытие бокса East Blue" onClose={onClose} className="opening-modal">
      <div className="opening-scene">
        <div className="opening-stars" />
        <span className="eyebrow">
          <span className="little-diamond" /> THE FIRST VOYAGE
        </span>
        <h2>
          {phase === "sealed"
            ? "Мечта внутри."
            : phase === "opening"
              ? "Приключение начинается…"
              : phase === "summary"
                ? "Твоя новая добыча"
                : "Познакомься с командой"}
        </h2>
        <p className="opening-subtitle">
          {phase === "summary"
            ? "Три карточки. Три истории. Один большой океан."
            : "East Blue · коллекционный бокс"}
        </p>
        {phase === "sealed" || phase === "opening" ? (
          <TreasureChest opening={phase === "opening"} />
        ) : (
          <div className="reveal-cards">
            {demoBoxCards.map((card, index) => (
              <div key={card.id} className="reveal-slot">
                <motion.div
                  className="reveal-flipper"
                  initial={false}
                  animate={{
                    rotateY: index < revealed ? 0 : 180,
                    scale: index < revealed ? 1 : 0.94,
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="reveal-front">
                    <CharacterCardView card={card} decorative />
                  </div>
                  <div className="reveal-back">
                    <span className="back-compass">✦</span>
                    <span>
                      GRAND LINE
                      <br />
                      ATLAS
                    </span>
                  </div>
                </motion.div>
                <span className={`reveal-caption ${index < revealed ? "visible" : ""}`}>
                  {rarityLabels[card.rarity]}
                  {card.rarity === "SSR" && <Sparkles size={13} />}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="opening-actions">
          {phase === "sealed" && (
            <button
              className="button primary"
              onClick={() => {
                playTone();
                setPhase("opening");
              }}
            >
              <PackageOpen size={18} />
              Открыть бокс
              <ArrowRight size={17} />
            </button>
          )}
          {(phase === "opening" || phase === "reveal") && (
            <button className="button subtle" onClick={skip}>
              Пропустить анимацию
              <ArrowRight size={16} />
            </button>
          )}
          {phase === "summary" && (
            <>
              <button className="button primary" onClick={claimed ? onClose : claim}>
                {claimed ? <Check size={18} /> : <PackageOpen size={18} />}
                {claimed ? "Вернуться в коллекцию" : "Добавить в коллекцию"}
              </button>
              <button className="button subtle" onClick={replay}>
                <RotateCcw size={15} />
                Повторить сцену
              </button>
            </>
          )}
        </div>
        <p className="demo-note">
          Демонстрационный бокс · фиксированные карточки · без списания валюты
        </p>
        <span role="status" aria-live="polite" className="sr-only">
          {phase === "summary" ? "Раскрыты Нами, Ророноа Зоро и Монки Д. Луффи." : ""}
          {claimed ? " Карточки добавлены в демо-коллекцию." : ""}
        </span>
      </div>
    </Modal>
  );
}
