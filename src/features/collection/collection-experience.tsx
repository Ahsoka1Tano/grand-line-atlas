"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Anchor,
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  Crown,
  Grid2X2,
  Heart,
  Layers,
  LockKeyhole,
  Package,
  Search,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { CharacterCardView } from "@/components/character-card";
import { Modal } from "@/components/modal";
import { BoxOpening, TreasureChest } from "@/features/boxes/box-opening";
import {
  demoBoxCards,
  initialCards,
  rarityLabels,
  type CharacterCard,
  type Rarity,
} from "@/content/cards";

export function CollectionExperience() {
  const [activeView, setActiveView] = useState<"collection" | "boxes">("collection");
  const [rarity, setRarity] = useState<Rarity | "all">("all");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [muted, setMuted] = useState(true);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CharacterCard | null>(null);
  const [opening, setOpening] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sort, setSort] = useState("number");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("gla.preferences.v1") ?? "null");
      if (saved && typeof saved === "object") {
        if (Array.isArray(saved.favorites))
          setFavorites(
            saved.favorites.filter(
              (id: unknown) =>
                typeof id === "string" && initialCards.some((card) => card.id === id),
            ),
          );
        if (typeof saved.muted === "boolean") setMuted(saved.muted);
      }
    } catch {
      /* Preferences are optional in private browsing. */
    }
    setPreferencesReady(true);
  }, []);
  useEffect(() => {
    if (!preferencesReady) return;
    try {
      localStorage.setItem("gla.preferences.v1", JSON.stringify({ favorites, muted }));
    } catch {
      /* Keep the current session usable. */
    }
  }, [favorites, muted, preferencesReady]);

  const toggleFavorite = (id: string) =>
    setFavorites((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  const visibleCards = useMemo(() => {
    const rank = { C: 0, R: 1, SR: 2, SSR: 3 };
    return initialCards
      .filter(
        (card) =>
          (rarity === "all" || card.rarity === rarity) &&
          (!favoritesOnly || favorites.includes(card.id)) &&
          `${card.name} ${card.latinName} ${card.role}`
            .toLocaleLowerCase("ru")
            .includes(search.toLocaleLowerCase("ru")),
      )
      .sort((a, b) =>
        sort === "rarity"
          ? rank[b.rarity] - rank[a.rarity]
          : sort === "name"
            ? a.name.localeCompare(b.name, "ru")
            : a.number.localeCompare(b.number),
      );
  }, [rarity, favoritesOnly, favorites, search, sort]);
  const count =
    initialCards.length + Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  const claimCards = () =>
    setQuantities((current) => {
      const next = { ...current };
      demoBoxCards.forEach((card) => {
        next[card.id] = (next[card.id] ?? 0) + 1;
      });
      return next;
    });
  const scrollToCollection = () => {
    setActiveView("collection");
    requestAnimationFrame(() =>
      document
        .getElementById("collection-heading")
        ?.scrollIntoView({ behavior: reduceMotion ? "instant" : "smooth", block: "start" }),
    );
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#collection-content">
        К содержимому
      </a>
      <aside className="sidebar" aria-label="Главная навигация">
        <a className="brand-symbol" href="/" aria-label="Grand Line Atlas">
          <Compass size={31} strokeWidth={1.3} />
        </a>
        <span className="sidebar-line" />
        <nav>
          <button
            className={`nav-icon ${activeView === "collection" ? "active" : ""}`}
            aria-label="Коллекция"
            aria-current={activeView === "collection" ? "page" : undefined}
            onClick={() => setActiveView("collection")}
          >
            <Layers size={22} />
            <span>Коллекция</span>
          </button>
          <button
            className={`nav-icon ${activeView === "boxes" ? "active" : ""}`}
            aria-label="Боксы"
            aria-current={activeView === "boxes" ? "page" : undefined}
            onClick={() => setActiveView("boxes")}
          >
            <Package size={22} />
            <span>Боксы</span>
          </button>
          <button
            className="nav-icon locked-nav"
            aria-label="Карта мира — следующий этап"
            disabled
            title="Карта мира — следующий этап"
          >
            <Compass size={22} />
            <LockKeyhole size={9} className="nav-lock" />
            <span>Карта мира</span>
          </button>
          <button
            className="nav-icon locked-nav"
            aria-label="Команда — следующий этап"
            disabled
            title="Команда — следующий этап"
          >
            <Crown size={22} />
            <LockKeyhole size={9} className="nav-lock" />
            <span>Команда</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <span className="vertical-text">SET SAIL. STAY FREE.</span>
          <Anchor size={18} />
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <a className="wordmark" href="/">
            GRAND LINE<span>ATLAS</span>
          </a>
          <div className="header-divider" />
          <div className="region-label">
            <Compass size={15} />
            <span>EAST BLUE</span>
            <span className="live-dot" />
          </div>
          <div className="topbar-right">
            <span className="prototype-badge">VISUAL ALPHA</span>
            <button
              className="icon-button audio-toggle"
              aria-label={muted ? "Включить звук" : "Выключить звук"}
              aria-pressed={!muted}
              onClick={() => setMuted((value) => !value)}
            >
              {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
            <span className="profile-avatar" aria-label="Демо-профиль капитана">
              V<span />
            </span>
          </div>
        </header>
        <main id="collection-content">
          <section className="hero">
            <div className="hero-grid" />
            <div className="hero-compass" aria-hidden="true">
              <span>N</span>
              <Compass strokeWidth={0.4} />
            </div>
            <div className="hero-content">
              <div className="eyebrow">
                <span className="little-diamond" />
                СЕЗОН 01
                <span className="eyebrow-line" />
                НАЧАЛО ПУТЕШЕСТВИЯ
              </div>
              <h1>
                Твоя команда.
                <br />
                <span>Твоя легенда.</span>
              </h1>
              <p>
                Собери тех, с кем отправишься к мечте.
                <br />
                Большой океан начинается с первой карточки.
              </p>
              <div className="hero-actions">
                <button className="button primary" onClick={() => setOpening(true)}>
                  <Package size={17} />
                  Открыть первый бокс
                  <ArrowRight size={17} />
                </button>
                <button className="hero-scroll" onClick={scrollToCollection}>
                  К коллекции
                  <ArrowDown size={15} />
                </button>
              </div>
              <div className="hero-footnote">
                <span className="small-card-stack">
                  <Layers size={14} />
                </span>
                Три карточки внутри. Целый мир впереди.
              </div>
            </div>
            <div className="hero-cards" aria-hidden="true">
              <div className="hero-card hero-card-nami">
                <CharacterCardView card={initialCards[2]} decorative />
              </div>
              <div className="hero-card hero-card-zoro">
                <CharacterCardView card={initialCards[1]} decorative />
              </div>
              <div className="hero-card hero-card-luffy">
                <CharacterCardView card={initialCards[0]} decorative />
              </div>
              <span className="hero-card-caption">
                <span />
                THE STRAW HAT COLLECTION
              </span>
            </div>
            <div className="hero-coordinate">01° 00′ N&nbsp;&nbsp; · &nbsp;&nbsp;EAST BLUE</div>
          </section>
          <div className="content-area">
            {activeView === "collection" ? (
              <section className="collection-section" aria-labelledby="collection-heading">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow subdued">ТВОЯ ИСТОРИЯ В КАРТОЧКАХ</div>
                    <h2 id="collection-heading">
                      Коллекция<span className="heading-count">{initialCards.length}</span>
                    </h2>
                  </div>
                  <div className="collection-stats">
                    <div>
                      <strong>{count.toString().padStart(2, "0")}</strong>
                      <span>Карточек</span>
                    </div>
                    <span className="stat-divider" />
                    <div>
                      <strong>03</strong>
                      <span>Персонажа</span>
                    </div>
                    <span className="stat-divider" />
                    <div>
                      <strong>01</strong>
                      <span>Легендарная</span>
                    </div>
                  </div>
                </div>
                <div className="collection-toolbar">
                  <div className="filter-tabs" role="group" aria-label="Редкость">
                    {(["all", "C", "R", "SR", "SSR"] as const).map((value) => (
                      <button
                        key={value}
                        aria-pressed={rarity === value}
                        className={`filter-tab ${rarity === value ? "selected" : ""} ${value === "SSR" ? "legendary-tab" : ""}`}
                        onClick={() => setRarity(value)}
                      >
                        {value === "all" ? "Все карточки" : value}
                        {value === "SSR" && <Sparkles size={11} />}
                      </button>
                    ))}
                  </div>
                  <div className="toolbar-controls">
                    <label className="search-field">
                      <Search size={16} />
                      <input
                        placeholder="Найти персонажа"
                        aria-label="Найти персонажа"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                      {search && (
                        <button aria-label="Очистить поиск" onClick={() => setSearch("")}>
                          <X size={13} />
                        </button>
                      )}
                    </label>
                    <button
                      className={`icon-button favorite-filter ${favoritesOnly ? "selected" : ""}`}
                      aria-label="Только избранные"
                      aria-pressed={favoritesOnly}
                      onClick={() => setFavoritesOnly((value) => !value)}
                    >
                      <Heart size={17} fill={favoritesOnly ? "currentColor" : "none"} />
                    </button>
                    <label className="sort-control">
                      <SlidersHorizontal size={15} />
                      <span className="sr-only">Порядок карточек</span>
                      <select
                        aria-label="Порядок карточек"
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                      >
                        <option value="number">По номеру</option>
                        <option value="rarity">По редкости</option>
                        <option value="name">По имени</option>
                      </select>
                      <ChevronDown size={13} />
                    </label>
                  </div>
                </div>
                <div className="collection-meta">
                  <span>
                    <Grid2X2 size={12} /> EAST BLUE COLLECTION
                  </span>
                  <span>
                    {visibleCards.length} из {initialCards.length} изданий
                  </span>
                </div>
                <div className="cards-grid">
                  {visibleCards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.4,
                        delay: reduceMotion ? 0 : index * 0.045,
                      }}
                      className="collection-card-wrap"
                    >
                      <CharacterCardView
                        card={card}
                        favorite={favorites.includes(card.id)}
                        quantity={1 + (quantities[card.id] ?? 0)}
                        onFavorite={() => toggleFavorite(card.id)}
                        onInspect={() => setSelectedCard(card)}
                      />
                      <div className="edition-label">
                        <span>{rarityLabels[card.rarity]}</span>
                        <span>
                          {card.rarity === "SSR"
                            ? "GOLD FOIL"
                            : card.rarity === "SR"
                              ? "PRISM FOIL"
                              : "FIRST EDITION"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {visibleCards.length === 0 && (
                  <div className="empty-state">
                    <BookOpen size={30} />
                    <h3>Здесь пока тихо</h3>
                    <p>
                      {favoritesOnly
                        ? "Добавь карточку в избранное с помощью сердечка."
                        : "Попробуй другое имя или редкость."}
                    </p>
                    <button
                      className="button subtle"
                      onClick={() => {
                        setSearch("");
                        setRarity("all");
                        setFavoritesOnly(false);
                      }}
                    >
                      Показать все карточки
                      <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </section>
            ) : (
              <section className="boxes-section" aria-labelledby="boxes-heading">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow subdued">НОВАЯ ГЛАВА ТВОЕЙ КОЛЛЕКЦИИ</div>
                    <h2 id="boxes-heading">Сокровища East Blue</h2>
                  </div>
                  <span className="box-series">СЕРИЯ 01 / FIRST VOYAGE</span>
                </div>
                <div className="box-feature">
                  <div className="box-feature-art">
                    <TreasureChest />
                  </div>
                  <div className="box-feature-copy">
                    <span className="eyebrow">THE FIRST VOYAGE</span>
                    <h3>Начни с мечты.</h3>
                    <p>
                      Луффи, Зоро и Нами. Первые спутники, первые открытия и тот самый момент, когда
                      карточка переворачивается лицом к тебе.
                    </p>
                    <div className="box-pills">
                      <span>
                        <Layers size={14} />3 карточки
                      </span>
                      <span>
                        <Sparkles size={14} />4 вида рамок в коллекции
                      </span>
                    </div>
                    <button className="button primary" onClick={() => setOpening(true)}>
                      Открыть демо-бокс
                      <ArrowRight size={17} />
                    </button>
                    <p className="box-small-print">
                      Фиксированный состав для знакомства со сценой открытия.
                    </p>
                  </div>
                </div>
              </section>
            )}
            <footer className="footer">
              <span>
                <Compass size={13} /> GRAND LINE ATLAS
              </span>
              <span>Фанатский проект · East Blue · визуальный прототип</span>
              <span className="footer-version">
                VOL. 01 <span>✦</span> 2026
              </span>
            </footer>
          </div>
        </main>
      </div>
      {selectedCard && (
        <Modal
          label={`Карточка ${selectedCard.name}`}
          onClose={() => setSelectedCard(null)}
          className="inspect-modal"
        >
          <div className="inspect-layout">
            <div className="inspect-card">
              <CharacterCardView card={selectedCard} decorative />
            </div>
            <div className="inspect-copy">
              <span className="eyebrow">EAST BLUE · #{selectedCard.number}</span>
              <span className={`inspect-rarity rarity-text-${selectedCard.rarity.toLowerCase()}`}>
                <Sparkles size={14} />
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
                <small>Боевой набор появится на этапе игровых локаций.</small>
              </div>
              <button
                className="button subtle favorite-inspect"
                onClick={() => toggleFavorite(selectedCard.id)}
              >
                {favorites.includes(selectedCard.id) ? <Check size={16} /> : <Heart size={16} />}
                {favorites.includes(selectedCard.id) ? "В избранном" : "Добавить в избранное"}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {opening && (
        <BoxOpening muted={muted} onClose={() => setOpening(false)} onClaim={claimCards} />
      )}
    </div>
  );
}
