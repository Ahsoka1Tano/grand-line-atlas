"use client";
import { useState, type FormEvent } from "react";
import { Anchor, Check, Coins, Crown, Layers, Save } from "lucide-react";
import { Modal } from "@/components/modal";
import type { GameSnapshot } from "@/domain/game";
export function CaptainProfile({
  snapshot,
  onClose,
  onSave,
}: {
  snapshot: GameSnapshot;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(snapshot.profile.name),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState(false),
    [error, setError] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave(name);
      setSaved(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить имя.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal label="Профиль капитана" onClose={onClose} className="captain-profile-modal">
      <div className="captain-profile">
        <span className="captain-seal">
          <Crown size={34} strokeWidth={1} />
        </span>
        <span className="eyebrow">CAPTAIN’S RECORD</span>
        <h2>Твоё имя в истории.</h2>
        <p>Капитан своей команды. Автор собственного путешествия.</p>
        <form onSubmit={submit}>
          <label htmlFor="captain-name">Имя капитана</label>
          <input
            id="captain-name"
            aria-label="Имя капитана"
            value={name}
            minLength={2}
            maxLength={24}
            required
            onChange={(event) => {
              setName(event.target.value);
              setSaved(false);
            }}
          />
          <button
            className="button primary"
            type="submit"
            disabled={saving || name.trim().length < 2}
          >
            {saved ? <Check size={15} /> : <Save size={15} />}{" "}
            {saving ? "Сохраняем…" : saved ? "Имя сохранено" : "Сохранить имя"}
          </button>
          {error && (
            <p className="profile-validation" role="alert">
              {error}
            </p>
          )}
        </form>
        <div className="captain-facts">
          <span>
            <Layers size={15} />
            <strong>{snapshot.instances.length}</strong>карточек
          </span>
          <span>
            <Coins size={15} />
            <strong>{snapshot.wallet.berries.toLocaleString("ru")}</strong>Berries
          </span>
          <span>
            <Anchor size={15} />
            <strong>East Blue</strong>первая глава
          </span>
        </div>
        <small>
          Локальный профиль сохраняется в этом браузере. Облачный вход появится в следующей версии.
        </small>
      </div>
    </Modal>
  );
}
