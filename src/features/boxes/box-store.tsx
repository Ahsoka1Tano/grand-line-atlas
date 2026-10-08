"use client";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock,
  Coins,
  Gift,
  History,
  Layers,
  Play,
  Sparkles,
} from "lucide-react";
import { cardCatalog, type Rarity } from "@/content/cards";
import { BOX, type GameSnapshot, type OpeningResult } from "@/domain/game";
import { TreasureChest } from "./box-opening";

export function BoxStore({
  snapshot,
  onOpen,
  onReplay,
  onDaily,
}: {
  snapshot: GameSnapshot | null;
  onOpen: () => void;
  onReplay: (opening: OpeningResult) => void;
  onDaily: () => Promise<void>;
}) {
  const [claiming, setClaiming] = useState(false);
  const canOpen =
    !!snapshot && (snapshot.wallet.freeBoxes > 0 || snapshot.wallet.berries >= BOX.price);
  return (
    <div className="store-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow subdued">НОВАЯ ГЛАВА ТВОЕЙ КОЛЛЕКЦИИ</div>
          <h2>Сокровища East Blue</h2>
        </div>
        <span className="box-series">СЕРИЯ 01 / THE FIRST VOYAGE</span>
      </div>
      <div className="store-layout">
        <section className="box-feature">
          <div className="box-feature-art">
            <TreasureChest />
          </div>
          <div className="box-feature-copy">
            <span className="eyebrow">THE FIRST VOYAGE</span>
            <h3>Мечта внутри.</h3>
            <p>
              Три новые карточки и шанс найти редкое издание любимого персонажа. Каждое открытие
              остаётся в твоей истории.
            </p>
            <div className="box-pills">
              <span>
                <Layers size={14} />3 карточки
              </span>
              <span>
                <Sparkles size={14} />
                12 изданий
              </span>
            </div>
            <button className="button primary" disabled={!canOpen} onClick={onOpen}>
              {snapshot?.wallet.freeBoxes ? <Gift size={17} /> : <Coins size={17} />}{" "}
              {snapshot?.wallet.freeBoxes ? "Открыть бесплатно" : `Открыть за ${BOX.price}`}
              <ArrowRight size={16} />
            </button>
            <p className="box-small-print">
              {snapshot?.wallet.freeBoxes
                ? "Первое открытие — подарок капитану."
                : "Цена указана в Berries. Карточки сохраняются сразу после открытия."}
            </p>
          </div>
        </section>
        <aside className="daily-card">
          <span className="daily-icon">
            <Gift size={25} strokeWidth={1.2} />
          </span>
          <span className="eyebrow">ПОПУТНЫЙ ВЕТЕР</span>
          <h3>Подарок капитану</h3>
          <p>Заглядывай в порт каждый день — и получай Berries для следующего открытия.</p>
          <span className="daily-reward">
            <Coins size={16} />+{snapshot?.daily.reward ?? 250}
            <small>BERRIES</small>
          </span>
          <button
            className="button subtle"
            disabled={!snapshot || !snapshot.daily.available || claiming}
            onClick={async () => {
              setClaiming(true);
              try {
                await onDaily();
              } finally {
                setClaiming(false);
              }
            }}
          >
            {claiming ? (
              "Получаем подарок…"
            ) : snapshot?.daily.available ? (
              "Забрать подарок"
            ) : (
              <>
                <Check size={15} />
                Подарок получен
              </>
            )}
          </button>
          {snapshot && !snapshot.daily.available && (
            <small className="daily-reset">
              <Clock size={11} />
              Следующий —{" "}
              {new Intl.DateTimeFormat("ru", { hour: "2-digit", minute: "2-digit" }).format(
                new Date(snapshot.daily.nextResetAt),
              )}
            </small>
          )}
        </aside>
      </div>
      <section className="drop-rate-panel">
        <div>
          <span className="eyebrow subdued">ЧЕСТНЫЕ ШАНСЫ</span>
          <h3>У каждой находки своя история.</h3>
          <p>Вероятности указаны для каждой из трёх карточек.</p>
        </div>
        <div className="drop-rates">
          {(Object.keys(BOX.rarityWeights) as Rarity[]).map((rarity) => (
            <div key={rarity} className={`drop-rate drop-${rarity.toLowerCase()}`}>
              <span>{rarity}</span>
              <strong>{BOX.rarityWeights[rarity] / 100}%</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="opening-history">
        <div className="history-heading">
          <span>
            <History size={15} />
            История находок
          </span>
          <small>{snapshot?.openings.length ?? 0} последних открытий</small>
        </div>
        {!snapshot?.openings.length ? (
          <div className="history-empty">Первое сокровище ещё впереди. Открой подарочный бокс.</div>
        ) : (
          snapshot.openings.map((opening) => (
            <div className="history-row" key={opening.id}>
              <div className="history-card-art">
                {opening.editionIds.map((id, index) => {
                  const card = cardCatalog.find((card) => card.id === id)!;
                  return (
                    <span
                      key={`${id}-${index}`}
                      className={`history-thumb rarity-${card.rarity.toLowerCase()}`}
                    >
                      <Image src={card.image} alt={card.name} width={44} height={60} />
                      <i>{card.rarity}</i>
                    </span>
                  );
                })}
              </div>
              <div className="history-details">
                <strong>The First Voyage</strong>
                <span>
                  {new Intl.DateTimeFormat("ru", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(opening.createdAt))}
                </span>
              </div>
              <span className="history-cost">
                {opening.cost ? `${opening.cost} Berries` : "Подарочный"}
              </span>
              <button
                className="button subtle"
                aria-label={`Посмотреть открытие ${opening.id}`}
                onClick={() => onReplay(opening)}
              >
                <Play size={12} />
                Смотреть
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
