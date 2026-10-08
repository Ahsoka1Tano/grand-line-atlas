"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Anchor,
  ArrowRight,
  Check,
  Compass,
  Crown,
  Plus,
  Save,
  Shield,
  Swords,
  Users,
  X,
} from "lucide-react";
import { CharacterCardView } from "@/components/character-card";
import { Modal } from "@/components/modal";
import { cardCatalog, type CharacterCard } from "@/content/cards";
import type { CrewSlot, GameSnapshot } from "@/domain/game";
type DraftSlot = Omit<CrewSlot, "characterId">;
export function CrewBuilder({
  snapshot,
  onSave,
  onAtlas,
  onInspect,
}: {
  snapshot: GameSnapshot | null;
  onSave: (slots: DraftSlot[], revision: number) => Promise<void>;
  onAtlas: () => void;
  onInspect: (card: CharacterCard) => void;
}) {
  const [draft, setDraft] = useState<DraftSlot[]>([]),
    [picker, setPicker] = useState<number | null>(null),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState("");
  const revision = snapshot?.profile.crewRevision;
  useEffect(() => {
    if (snapshot) setDraft(snapshot.crew.map(({ characterId, ...slot }) => slot));
  }, [revision, snapshot?.profile.id]);
  const cardForInstance = (id: string) =>
    cardCatalog.find(
      (card) => card.id === snapshot?.instances.find((instance) => instance.id === id)?.editionId,
    );
  const battleCount = draft.filter((slot) => slot.battle).length;
  const changed =
    !!snapshot &&
    JSON.stringify(draft) !== JSON.stringify(snapshot.crew.map(({ characterId, ...slot }) => slot));
  const ownedEditions = useMemo(
    () =>
      cardCatalog.filter((card) =>
        snapshot?.instances.some((instance) => instance.editionId === card.id),
      ),
    [snapshot],
  );
  const choose = (card: CharacterCard) => {
    if (picker === null || !snapshot) return;
    const instance = snapshot.instances.find((item) => item.editionId === card.id)!;
    setDraft((slots) => {
      const target = slots.find((slot) => slot.position === picker);
      const source = slots.find(
        (slot) =>
          slot.position !== picker &&
          cardForInstance(slot.instanceId)?.characterId === card.characterId,
      );
      const next = slots.filter(
        (slot) => slot.position !== picker && slot.position !== source?.position,
      );
      next.push({
        position: picker,
        instanceId: instance.id,
        battle: target?.battle ?? source?.battle ?? false,
      });
      if (source && target)
        next.push({ ...target, position: source.position, battle: source.battle });
      return next.sort((a, b) => a.position - b.position);
    });
    setPicker(null);
    setMessage("");
  };
  const save = async () => {
    if (!snapshot) return;
    setSaving(true);
    try {
      await onSave(draft, snapshot.profile.crewRevision);
      setMessage("Состав сохранён. Попутного ветра!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить команду.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="crew-page">
      <section className="crew-banner">
        <Image
          src="/art/crew-voyage.webp"
          alt="Гоинг Мерри на закате"
          fill
          sizes="(max-width: 650px) 100vw, 1400px"
          loading="eager"
        />
        <div className="crew-banner-shade" />
        <div className="crew-banner-copy">
          <span className="eyebrow">
            <Anchor size={12} />
            THE STRAW HAT CREW
          </span>
          <h1>
            Пятеро.
            <br />
            <span>Одна мечта.</span>
          </h1>
          <p>С кем ты отправишься за горизонт?</p>
        </div>
        <span className="crew-ship-name">
          GOING MERRY <span>✦</span> FIRST VOYAGE
        </span>
      </section>
      <section className="crew-content">
        <div className="section-heading">
          <div>
            <div className="eyebrow subdued">ТВОЯ КОМАНДА МЕЧТЫ</div>
            <h2>Экипаж капитана</h2>
          </div>
          <div className="crew-counts">
            <span>
              <Users size={15} />
              {draft.length} / 5
            </span>
            <span>
              <Swords size={15} />
              {battleCount} / 3
            </span>
          </div>
        </div>
        <div className="crew-info-strip">
          <span>
            <Shield size={13} />
            Три боевые карточки. Два места в резерве.
          </span>
          <span>Один персонаж — одно место.</span>
        </div>
        <div className="crew-slots">
          {Array.from({ length: 5 }, (_, position) => {
            const slot = draft.find((item) => item.position === position),
              card = slot ? cardForInstance(slot.instanceId) : undefined;
            return (
              <div key={position} className={"crew-slot " + (slot?.battle ? "in-battle" : "")}>
                <div className="crew-slot-header">
                  <span>{String(position + 1).padStart(2, "0")}</span>
                  {position === 0 ? (
                    <span>
                      <Crown size={11} />
                      Капитанский слот
                    </span>
                  ) : (
                    <span>{slot?.battle ? "Боевой состав" : "Резерв"}</span>
                  )}
                </div>
                {card ? (
                  <>
                    <div className="crew-slot-card">
                      <CharacterCardView card={card} onInspect={() => onInspect(card)} />
                      <button
                        className="crew-remove"
                        aria-label={"Убрать карточку из места " + (position + 1)}
                        onClick={() =>
                          setDraft((slots) => slots.filter((slot) => slot.position !== position))
                        }
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <button
                      className="crew-change"
                      aria-label={"Заменить карточку в месте " + (position + 1)}
                      onClick={() => setPicker(position)}
                    >
                      <Plus size={13} />
                      Выбрать карточку
                    </button>
                    <button
                      className={"crew-battle-toggle " + (slot!.battle ? "selected" : "")}
                      aria-label={"Боевой состав: " + card.name}
                      aria-pressed={slot!.battle}
                      onClick={() => {
                        setDraft((slots) =>
                          slots.map((slot) =>
                            slot.position === position ? { ...slot, battle: !slot.battle } : slot,
                          ),
                        );
                        setMessage("");
                      }}
                    >
                      <Swords size={12} />
                      {slot!.battle ? "В боевом составе" : "В боевую тройку"}
                      {slot!.battle && <Check size={11} />}
                    </button>
                  </>
                ) : (
                  <button
                    className="crew-empty-slot"
                    disabled={!snapshot}
                    onClick={() => setPicker(position)}
                    aria-label={"Выбрать карточку для места " + (position + 1)}
                  >
                    <Plus size={24} />
                    <span>Выбрать персонажа</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="crew-save-row">
          <div>
            <strong>
              {!snapshot
                ? "Готовим твой первый экипаж…"
                : battleCount === 3
                  ? "Команда готова к приключениям"
                  : "Боевых карточек: " + battleCount + ". Нужно выбрать три."}
            </strong>
            <span>{message || "Состав сохраняется в твоём профиле капитана."}</span>
          </div>
          <div>
            <button className="button subtle" onClick={onAtlas}>
              <Compass size={15} />К атласу
              <ArrowRight size={15} />
            </button>
            <button
              className="button primary"
              disabled={!snapshot || saving || !changed || battleCount !== 3}
              onClick={save}
            >
              <Save size={15} />
              {!snapshot
                ? "Загружаем экипаж…"
                : saving
                  ? "Сохраняем…"
                  : changed
                    ? "Сохранить команду"
                    : "Команда сохранена"}
            </button>
          </div>
        </div>
      </section>
      {picker !== null && snapshot && (
        <Modal
          label={"Выбор карточки для места " + (picker + 1)}
          onClose={() => setPicker(null)}
          className="crew-picker-modal"
        >
          <div className="crew-picker-content">
            <span className="eyebrow">МЕСТО {String(picker + 1).padStart(2, "0")}</span>
            <h2>Кто отправится с тобой?</h2>
            <p>Выбери издание из своей коллекции.</p>
            <div className="crew-picker-grid">
              {ownedEditions.map((card) => {
                const occupied = draft.some(
                  (slot) =>
                    slot.position !== picker &&
                    cardForInstance(slot.instanceId)?.characterId === card.characterId,
                );
                return (
                  <div key={card.id}>
                    <CharacterCardView card={card} decorative />
                    <button
                      aria-label={"Выбрать " + card.name + ", " + card.rarity}
                      onClick={() => choose(card)}
                    >
                      {occupied ? "Поменять местами" : "Выбрать"}
                      <ArrowRight size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
