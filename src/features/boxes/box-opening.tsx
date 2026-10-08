"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  Coins,
  LoaderCircle,
  PackageOpen,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { cardCatalog, rarityLabels } from "@/content/cards";
import { BOX, type OpeningResult } from "@/domain/game";
import { CharacterCardView } from "@/components/character-card";
import { Modal } from "@/components/modal";

export function TreasureChest({ opening = false }: { opening?: boolean }) {
  return (
    <div className={"treasure-wrap " + (opening ? "chest-opening" : "")} aria-hidden="true">
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
        {Array.from({ length: 14 }, (_, index) => (
          <i key={index} style={{ "--i": index } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
type Props = {
  muted: boolean;
  freeBoxes: number;
  berries: number;
  onClose: () => void;
  onCollection: () => void;
  onOpen: () => Promise<OpeningResult>;
  replay?: OpeningResult;
};
export function BoxOpening({
  muted,
  freeBoxes,
  berries,
  onClose,
  onCollection,
  onOpen,
  replay,
}: Props) {
  const [phase, setPhase] = useState<"sealed" | "requesting" | "opening" | "reveal" | "summary">(
    replay ? "opening" : "sealed",
  );
  const [result, setResult] = useState<OpeningResult | null>(replay ?? null),
    [revealed, setRevealed] = useState(0),
    [error, setError] = useState("");
  const requestPending = useRef(false),
    audioRef = useRef<AudioContext | null>(null),
    mutedRef = useRef(muted);
  mutedRef.current = muted;
  const reduceMotion = useReducedMotion();
  const cards = useMemo(
    () =>
      result
        ? result.editionIds
            .map((id) => cardCatalog.find((card) => card.id === id)!)
            .sort(
              (a, b) =>
                ({ C: 0, R: 1, SR: 2, SSR: 3 })[a.rarity] - { C: 0, R: 1, SR: 2, SSR: 3 }[b.rarity],
            )
        : [],
    [result],
  );
  const playTone = useCallback((rare = false) => {
    if (mutedRef.current) return;
    try {
      const context = audioRef.current ?? new AudioContext();
      audioRef.current = context;
      void context.resume().catch(() => {});
      [0, 0.09, 0.18].forEach((offset, index) => {
        const oscillator = context.createOscillator(),
          gain = context.createGain();
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
    } catch {}
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
        playTone(cards[0]?.rarity === "SSR");
      },
      reduceMotion ? 100 : 1900,
    );
    return () => clearTimeout(timeout);
  }, [phase, reduceMotion, playTone, cards]);
  useEffect(() => {
    if (phase !== "reveal") return;
    const timeout = setTimeout(
      () => {
        if (revealed < 3) {
          playTone(cards[revealed]?.rarity === "SSR");
          setRevealed(revealed + 1);
        } else setPhase("summary");
      },
      reduceMotion ? 120 : 950,
    );
    return () => clearTimeout(timeout);
  }, [phase, revealed, reduceMotion, playTone, cards]);
  const start = async () => {
    if (requestPending.current) return;
    requestPending.current = true;
    setError("");
    setPhase("requesting");
    try {
      const opening = await onOpen();
      setResult(opening);
      setRevealed(0);
      playTone();
      setPhase("opening");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось открыть бокс.");
      setPhase("sealed");
    } finally {
      requestPending.current = false;
    }
  };
  const skip = () => {
    setRevealed(3);
    setPhase("summary");
  };
  return (
    <Modal label="Открытие бокса East Blue" onClose={onClose} className="opening-modal">
      <div className="opening-scene">
        <div className="opening-stars" />
        <span className="eyebrow">
          <span className="little-diamond" />
          THE FIRST VOYAGE
        </span>
        <h2>
          {phase === "sealed"
            ? "Мечта внутри."
            : phase === "requesting"
              ? "Твоё сокровище уже близко…"
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
        {["sealed", "requesting", "opening"].includes(phase) ? (
          <TreasureChest opening={phase === "opening"} />
        ) : (
          <div className="reveal-cards">
            {cards.map((card, index) => (
              <div key={card.id + "-" + index} className="reveal-slot">
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
                  <div className="reveal-back" aria-hidden="true">
                    <span className="back-compass">✦</span>
                    <span>
                      GRAND LINE
                      <br />
                      ATLAS
                    </span>
                  </div>
                </motion.div>
                <span className={"reveal-caption " + (index < revealed ? "visible" : "")}>
                  {rarityLabels[card.rarity]}
                  {card.rarity === "SSR" && <Sparkles size={13} />}
                </span>
              </div>
            ))}
          </div>
        )}
        {error && (
          <p className="opening-error" role="alert">
            {error}
          </p>
        )}
        <div className="opening-actions">
          {phase === "sealed" && (
            <button
              className="button primary"
              disabled={!freeBoxes && berries < BOX.price}
              onClick={start}
            >
              <PackageOpen size={18} />
              {error
                ? "Попробовать снова"
                : freeBoxes
                  ? "Открыть бесплатно"
                  : "Открыть за " + BOX.price}
              <ArrowRight size={16} />
            </button>
          )}
          {phase === "requesting" && (
            <span className="opening-request">
              <LoaderCircle size={16} />
              Открываем сундук…
            </span>
          )}
          {(phase === "opening" || phase === "reveal") && (
            <button className="button subtle" onClick={skip}>
              Пропустить анимацию
              <ArrowRight size={16} />
            </button>
          )}
          {phase === "summary" && (
            <>
              <button className="button primary" onClick={onCollection}>
                <Check size={17} />
                Вернуться в коллекцию
              </button>
              <button
                className="button subtle"
                onClick={() => {
                  setRevealed(0);
                  playTone();
                  setPhase("opening");
                }}
              >
                <RotateCcw size={15} />
                Повторить сцену
              </button>
            </>
          )}
        </div>
        <p className="demo-note">
          {result
            ? "Карточки в коллекции. Открытие сохранено в истории."
            : freeBoxes
              ? "Подарок капитану · 3 карточки"
              : "3 карточки · " + BOX.price + " Berries"}
        </p>
        <span role="status" aria-live="polite" className="sr-only">
          {phase === "summary"
            ? "Получены: " + cards.map((card) => card.name).join(", ") + ". Карточки сохранены."
            : ""}
        </span>
      </div>
    </Modal>
  );
}
