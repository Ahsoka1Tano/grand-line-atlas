"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Anchor,
  Check,
  Coins,
  Compass,
  Crown,
  Gift,
  Heart,
  Layers,
  Package,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { CharacterCardView } from "@/components/character-card";
import { Modal } from "@/components/modal";
import { cardCatalog, rarityLabels, type CharacterCard } from "@/content/cards";
import type { CrewSlot, OpeningResult } from "@/domain/game";
import { useGameState } from "@/features/game/game-provider";
import { CollectionGallery } from "./collection-gallery";
import { BoxOpening } from "@/features/boxes/box-opening";
import { BoxStore } from "@/features/boxes/box-store";
import { CrewBuilder } from "@/features/crew/crew-builder";
import { CaptainProfile } from "@/features/profile/captain-profile";
import { WorldExperience } from "@/features/world/world-experience";
import "@/features/game/game.css";

type AppView = "collection" | "boxes" | "world" | "crew";
export function CollectionExperience({ initialView = "collection" }: { initialView?: AppView }) {
  const router = useRouter(),
    game = useGameState(),
    snapshot = game.snapshot;
  const [muted, setMuted] = useState(true),
    [preferencesReady, setPreferencesReady] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CharacterCard | null>(null),
    [opening, setOpening] = useState(false),
    [replay, setReplay] = useState<OpeningResult | undefined>(),
    [profileOpen, setProfileOpen] = useState(false),
    [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const preferences = JSON.parse(localStorage.getItem("gla.preferences.v1") ?? "null");
      if (typeof preferences?.muted === "boolean") setMuted(preferences.muted);
    } catch {}
    setPreferencesReady(true);
  }, []);
  useEffect(() => {
    if (!preferencesReady) return;
    try {
      localStorage.setItem("gla.preferences.v1", JSON.stringify({ muted }));
    } catch {}
  }, [muted, preferencesReady]);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timeout);
  }, [notice]);
  const favorites = snapshot?.favoriteEditionIds ?? [];
  const open = () => {
    if (!snapshot) return;
    setReplay(undefined);
    setOpening(true);
  };
  const toggleFavorite = async (id: string) => {
    try {
      await game.mutate("favorites", { editionId: id, enabled: !favorites.includes(id) });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Не удалось сохранить избранное.");
    }
  };
  const claimDaily = async () => {
    try {
      await game.mutate("daily", {});
      setNotice("Попутного ветра! Подарок капитану получен.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Не удалось получить подарок.");
    }
  };
  const saveCrew = async (slots: Omit<CrewSlot, "characterId">[], revision: number) => {
    try {
      await game.mutate("crew", { slots, revision }, "PUT");
    } catch (error) {
      await game.refresh();
      throw error;
    }
  };
  const navigation = [
    { view: "collection", href: "/", label: "Коллекция", Icon: Layers },
    { view: "boxes", href: "/boxes", label: "Боксы", Icon: Package },
    { view: "world", href: "/world", label: "Карта мира", Icon: Compass },
    { view: "crew", href: "/crew", label: "Команда", Icon: Crown },
  ];
  const ownedCopies = selectedCard
    ? (snapshot?.instances.filter((instance) => instance.editionId === selectedCard.id) ?? [])
    : [];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#collection-content">
        К содержимому
      </a>
      <aside className="sidebar" aria-label="Главная навигация">
        <Link href="/" className="brand-symbol" aria-label="Grand Line Atlas">
          <Compass size={31} strokeWidth={1.3} />
        </Link>
        <span className="sidebar-line" />
        <nav>
          {navigation.map(({ view, href, label, Icon }) => (
            <Link
              key={view}
              href={href}
              className={"nav-icon " + (initialView === view ? "active" : "")}
              aria-label={label}
              aria-current={initialView === view ? "page" : undefined}
            >
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="vertical-text">SET SAIL. STAY FREE.</span>
          <Anchor size={18} />
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <Link href="/" className="wordmark">
            GRAND LINE<span>ATLAS</span>
          </Link>
          <div className="header-divider" />
          <div className="region-label">
            <Compass size={15} />
            <span>EAST BLUE</span>
            <span className="live-dot" />
          </div>
          <div className="topbar-right">
            <span className="prototype-badge">ALPHA 0.2</span>
            <Link
              href="/boxes"
              className="wallet-balance"
              aria-label={"Кошелёк: " + (snapshot?.wallet.berries ?? 0) + " Berries"}
            >
              <Coins size={16} />
              <strong>{snapshot ? snapshot.wallet.berries.toLocaleString("ru") : "—"}</strong>
              <span>BERRIES</span>
            </Link>
            {!!snapshot?.wallet.freeBoxes && (
              <button
                className="header-free-box"
                aria-label="Открыть подарочный бокс"
                onClick={open}
              >
                <Gift size={16} />
                <span>{snapshot.wallet.freeBoxes}</span>
              </button>
            )}
            <button
              className="icon-button audio-toggle"
              aria-label={muted ? "Включить звук" : "Выключить звук"}
              aria-pressed={!muted}
              onClick={() => setMuted((value) => !value)}
            >
              {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
            <button
              className="profile-avatar"
              aria-label="Профиль капитана"
              disabled={!snapshot}
              onClick={() => setProfileOpen(true)}
            >
              {Array.from(snapshot?.profile.name ?? "К")[0]}
              <span />
            </button>
          </div>
        </header>
        {game.error && (
          <div className="game-error-banner" role="alert">
            <span>{game.error}</span>
            <button onClick={() => window.location.reload()}>Попробовать снова</button>
          </div>
        )}
        <main id="collection-content">
          {initialView === "world" ? (
            <WorldExperience />
          ) : initialView === "crew" ? (
            <CrewBuilder
              snapshot={snapshot}
              onSave={saveCrew}
              onAtlas={() => router.push("/world")}
              onInspect={setSelectedCard}
            />
          ) : initialView === "boxes" ? (
            <BoxStore
              snapshot={snapshot}
              onOpen={open}
              onReplay={(value) => {
                setReplay(value);
                setOpening(true);
              }}
              onDaily={claimDaily}
            />
          ) : (
            <CollectionGallery
              snapshot={snapshot}
              loading={game.loading}
              onOpen={open}
              onCrew={() => router.push("/crew")}
              onInspect={setSelectedCard}
              onFavorite={(id) => void toggleFavorite(id)}
            />
          )}
        </main>
      </div>
      {notice && (
        <div className="game-notice" role="status">
          <Compass size={16} />
          <span>{notice}</span>
          <button aria-label="Закрыть уведомление" onClick={() => setNotice("")}>
            <X size={14} />
          </button>
        </div>
      )}
      {selectedCard && (
        <Modal
          label={"Карточка " + selectedCard.name}
          onClose={() => setSelectedCard(null)}
          className="inspect-modal"
        >
          <div className="inspect-layout">
            <div className="inspect-card">
              <CharacterCardView card={selectedCard} decorative />
            </div>
            <div className="inspect-copy">
              <span className="eyebrow">EAST BLUE · #{selectedCard.number}</span>
              <span className={"inspect-rarity rarity-text-" + selectedCard.rarity.toLowerCase()}>
                {rarityLabels[selectedCard.rarity]}
              </span>
              <h2>{selectedCard.name}</h2>
              <span className="inspect-epithet">
                {selectedCard.epithet} / {selectedCard.role}
              </span>
              <blockquote>«{selectedCard.quote}»</blockquote>
              <p>{selectedCard.description}</p>
              <div className="ability-preview">
                <span>ФИРМЕННАЯ СПОСОБНОСТЬ</span>
                <strong>{selectedCard.ability}</strong>
              </div>
              <div className="inspect-ownership">
                {ownedCopies.length ? (
                  <>
                    <Check size={13} />
                    {ownedCopies.length}{" "}
                    {ownedCopies.length === 1 ? "экземпляр в коллекции" : "экземпляров в коллекции"}
                  </>
                ) : (
                  <>Это издание ещё ждёт тебя в боксах.</>
                )}
              </div>
              {ownedCopies.length > 0 && (
                <button
                  className="button subtle favorite-inspect"
                  onClick={() => void toggleFavorite(selectedCard.id)}
                >
                  {favorites.includes(selectedCard.id) ? <Check size={16} /> : <Heart size={16} />}{" "}
                  {favorites.includes(selectedCard.id) ? "В избранном" : "Добавить в избранное"}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
      {profileOpen && snapshot && (
        <CaptainProfile
          snapshot={snapshot}
          onClose={() => setProfileOpen(false)}
          onSave={async (name) => {
            await game.mutate("profile", { name }, "PATCH");
          }}
        />
      )}
      {opening && snapshot && (
        <BoxOpening
          key={replay?.id ?? "new-opening"}
          muted={muted}
          freeBoxes={snapshot.wallet.freeBoxes}
          berries={snapshot.wallet.berries}
          onClose={() => setOpening(false)}
          onCollection={() => {
            setOpening(false);
            router.push("/");
          }}
          onOpen={game.openBox}
          replay={replay}
        />
      )}
    </div>
  );
}
