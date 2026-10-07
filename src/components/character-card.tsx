"use client";

import Image from "next/image";
import { Heart, Sparkles, Swords, Compass, Crown } from "lucide-react";
import { useRef, type CSSProperties } from "react";
import { type CharacterCard, rarityLabels } from "@/content/cards";

type Props = {
  card: CharacterCard;
  favorite?: boolean;
  quantity?: number;
  onInspect?: () => void;
  onFavorite?: () => void;
  decorative?: boolean;
};

export function CharacterCardView({
  card,
  favorite = false,
  quantity,
  onInspect,
  onFavorite,
  decorative = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const RoleIcon =
    card.characterId === "luffy" ? Crown : card.characterId === "zoro" ? Swords : Compass;
  const updateTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    ref.current?.style.setProperty("--tilt-x", `${(0.5 - y) * 9}deg`);
    ref.current?.style.setProperty("--tilt-y", `${(x - 0.5) * 9}deg`);
    ref.current?.style.setProperty("--shine-x", `${x * 100}%`);
    ref.current?.style.setProperty("--shine-y", `${y * 100}%`);
  };
  const resetTilt = () => {
    ref.current?.style.setProperty("--tilt-x", "0deg");
    ref.current?.style.setProperty("--tilt-y", "0deg");
  };
  return (
    <div
      ref={ref}
      className={`character-card rarity-${card.rarity.toLowerCase()} ${decorative ? "decorative" : ""}`}
      style={{ "--character-accent": card.accent } as CSSProperties}
      onPointerMove={updateTilt}
      onPointerLeave={resetTilt}
    >
      <div className="card-art">
        <Image
          src={card.image}
          alt={`${card.name}, ранний образ East Blue`}
          fill
          sizes="(max-width: 600px) 46vw, (max-width: 1100px) 30vw, 280px"
          loading={decorative ? "eager" : "lazy"}
          fetchPriority={decorative ? "high" : "auto"}
          draggable={false}
        />
      </div>
      <div className="card-shade" />
      <div className="card-foil" />
      <div className="card-border" />
      <div className="card-top">
        <span className="card-set">
          EAST BLUE <span>·</span> 01
        </span>
        <span className="rarity-badge" title={rarityLabels[card.rarity]}>
          {card.rarity === "SSR" && <Sparkles size={10} />}
          {card.rarity}
        </span>
      </div>
      <div className="card-copy">
        <span className="card-epithet">{card.epithet}</span>
        <h3>{card.name}</h3>
        <span className="card-latin">{card.latinName}</span>
        <div className="card-bottom">
          <span>
            <RoleIcon size={12} />
            {card.role}
          </span>
          <span>#{card.number}</span>
        </div>
      </div>
      {!decorative && (
        <button
          className="card-inspect"
          aria-label={`Осмотреть ${card.name}, ${card.rarity}`}
          onClick={onInspect}
        />
      )}
      {onFavorite && (
        <button
          className={`card-favorite ${favorite ? "is-favorite" : ""}`}
          aria-label={`${favorite ? "Убрать из избранного" : "В избранное"}: ${card.name}, ${card.rarity}`}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          <Heart size={15} fill={favorite ? "currentColor" : "none"} />
        </button>
      )}
      {quantity !== undefined && quantity > 1 && <span className="card-quantity">×{quantity}</span>}
    </div>
  );
}
