"use client";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  ChevronDown,
  Compass,
  Crown,
  Grid2X2,
  Heart,
  Layers,
  Package,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { CharacterCardView } from "@/components/character-card";
import { cardCatalog, rarityLabels, type CharacterCard, type Rarity } from "@/content/cards";
import type { GameSnapshot } from "@/domain/game";

type Props = {
  snapshot: GameSnapshot | null;
  loading: boolean;
  onOpen: () => void;
  onCrew: () => void;
  onInspect: (card: CharacterCard) => void;
  onFavorite: (id: string) => void;
};
export function CollectionGallery({
  snapshot,
  loading,
  onOpen,
  onCrew,
  onInspect,
  onFavorite,
}: Props) {
  const [view, setView] = useState<"owned" | "catalog">("owned"),
    [rarity, setRarity] = useState<Rarity | "all">("all"),
    [search, setSearch] = useState(""),
    [favoritesOnly, setFavoritesOnly] = useState(false),
    [sort, setSort] = useState("number");
  const reduced = useReducedMotion();
  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    snapshot?.instances.forEach((instance) => {
      result[instance.editionId] = (result[instance.editionId] ?? 0) + 1;
    });
    return result;
  }, [snapshot]);
  const favoriteIds = snapshot?.favoriteEditionIds ?? [];
  const ownedEditions = Object.keys(counts).length;
  const visible = cardCatalog
    .filter(
      (card) =>
        (view === "catalog" || counts[card.id]) &&
        (rarity === "all" || card.rarity === rarity) &&
        (!favoritesOnly || favoriteIds.includes(card.id)) &&
        `${card.name} ${card.latinName} ${card.role}`
          .toLocaleLowerCase("ru")
          .includes(search.toLocaleLowerCase("ru")),
    )
    .sort((a, b) =>
      sort === "rarity"
        ? { C: 0, R: 1, SR: 2, SSR: 3 }[b.rarity] - { C: 0, R: 1, SR: 2, SSR: 3 }[a.rarity]
        : sort === "name"
          ? a.name.localeCompare(b.name, "ru")
          : a.number.localeCompare(b.number),
    );
  const uniqueCharacters = new Set(snapshot?.instances.map((instance) => instance.characterId))
    .size;
  const legends =
    snapshot?.instances.filter(
      (instance) => cardCatalog.find((card) => card.id === instance.editionId)?.rarity === "SSR",
    ).length ?? 0;
  return (
    <>
      <section className="hero collection-hero">
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
            ТВОЯ ИСТОРИЯ НАЧИНАЕТСЯ
          </div>
          <h1>
            Твоя команда.
            <br />
            <span>Твоя легенда.</span>
          </h1>
          <p>
            Луффи, Зоро, Нами, Усопп и Санджи уже с тобой.
            <br />
            Собирай новые издания и отправляйся к мечте.
          </p>
          <div className="hero-actions">
            <button className="button primary" disabled={!snapshot} onClick={onOpen}>
              <Package size={17} />
              {snapshot?.wallet.freeBoxes ? "Забрать подарочный бокс" : "Открыть бокс"}
              <ArrowRight size={17} />
            </button>
            <button className="hero-scroll" onClick={onCrew}>
              Собрать команду
              <Crown size={15} />
            </button>
          </div>
          <div className="hero-footnote">
            <Layers size={14} />
            Первые пять персонажей — начало большого путешествия.
          </div>
        </div>
        <div className="hero-cards" aria-hidden="true">
          <div className="hero-card hero-card-nami">
            <CharacterCardView card={cardCatalog[2]} decorative />
          </div>
          <div className="hero-card hero-card-zoro">
            <CharacterCardView card={cardCatalog[1]} decorative />
          </div>
          <div className="hero-card hero-card-luffy">
            <CharacterCardView card={cardCatalog[0]} decorative />
          </div>
          <span className="hero-card-caption">
            <span />
            THE STRAW HAT COLLECTION
          </span>
        </div>
        <div className="hero-coordinate">EAST BLUE / THE FIRST VOYAGE</div>
      </section>
      <div className="content-area">
        <section aria-labelledby="collection-heading">
          <div className="section-heading">
            <div>
              <div className="eyebrow subdued">ТВОЯ ИСТОРИЯ В КАРТОЧКАХ</div>
              <h2 id="collection-heading">
                Коллекция<span className="heading-count">{ownedEditions}</span>
              </h2>
            </div>
            <div className="collection-stats">
              <div>
                <strong>
                  {loading ? "—" : String(snapshot?.instances.length ?? 0).padStart(2, "0")}
                </strong>
                <span>Карточек</span>
              </div>
              <span className="stat-divider" />
              <div>
                <strong>{loading ? "—" : String(uniqueCharacters).padStart(2, "0")}</strong>
                <span>Персонажей</span>
              </div>
              <span className="stat-divider" />
              <div>
                <strong>{String(legends).padStart(2, "0")}</strong>
                <span>Легендарных</span>
              </div>
            </div>
          </div>
          <div className="collection-view-switch">
            <div role="group" aria-label="Раздел коллекции">
              <button
                aria-pressed={view === "owned"}
                className={view === "owned" ? "selected" : ""}
                onClick={() => setView("owned")}
              >
                Мои карточки<span>{ownedEditions}</span>
              </button>
              <button
                aria-pressed={view === "catalog"}
                className={view === "catalog" ? "selected" : ""}
                onClick={() => setView("catalog")}
              >
                Каталог изданий<span>{cardCatalog.length}</span>
              </button>
            </div>
            <div className="collection-completion">
              <span>
                {ownedEditions} / {cardCatalog.length} изданий
              </span>
              <i>
                <span style={{ width: `${(ownedEditions / cardCatalog.length) * 100}%` }} />
              </i>
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
              <Grid2X2 size={12} />
              EAST BLUE COLLECTION
            </span>
            <span>{visible.length} изданий</span>
          </div>
          {loading ? (
            <div className="cards-grid skeleton-grid">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="card-skeleton" />
              ))}
            </div>
          ) : (
            <div className="cards-grid">
              {visible.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : index * 0.035 }}
                  className="collection-card-wrap"
                >
                  <CharacterCardView
                    card={card}
                    favorite={favoriteIds.includes(card.id)}
                    quantity={counts[card.id] ?? 0}
                    locked={!counts[card.id]}
                    onInspect={() => onInspect(card)}
                    onFavorite={counts[card.id] ? () => onFavorite(card.id) : undefined}
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
          )}
          {!loading && !visible.length && (
            <div className="empty-state">
              <BookOpen size={30} />
              <h3>Эта история ещё впереди</h3>
              <p>
                {favoritesOnly
                  ? "Добавь полученные карточки в избранное."
                  : "Попробуй другой фильтр или загляни в каталог изданий."}
              </p>
              <button
                className="button subtle"
                onClick={() => {
                  setSearch("");
                  setRarity("all");
                  setFavoritesOnly(false);
                }}
              >
                Показать коллекцию
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </section>
        <footer className="footer">
          <span>
            <Compass size={13} />
            GRAND LINE ATLAS
          </span>
          <span>Твоя коллекция · твоя команда · твой океан</span>
          <span className="footer-version">
            VOL. 01 <span>✦</span> 2026
          </span>
        </footer>
      </div>
    </>
  );
}
