"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GameSnapshot, OpeningResult } from "@/domain/game";

async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`/api/game/${path}`, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => {
    throw new Error("Не удалось связаться с портом. Проверь соединение и попробуй ещё раз.");
  });
  const result = await response.json().catch(() => null);
  if (!result) throw new Error("Порт временно недоступен. Попробуй ещё раз.");
  if (!response.ok) throw new Error(result.error?.message ?? "Не удалось выполнить действие.");
  return result as T;
}
let bootstrapPromise: Promise<{ snapshot: GameSnapshot }> | null = null;
function bootstrap() {
  if (!bootstrapPromise)
    bootstrapPromise = api<{ snapshot: GameSnapshot }>("session", "POST", {}).finally(() => {
      bootstrapPromise = null;
    });
  return bootstrapPromise;
}

export function useGame() {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const alive = useRef(true);
  const mutationQueue = useRef<Promise<unknown>>(Promise.resolve());
  const epoch = useRef(0);
  const refresh = useCallback(async () => {
    if (bootstrapPromise) await bootstrapPromise.catch(() => {});
    const started = epoch.current;
    try {
      const data = await api<{ snapshot: GameSnapshot }>("state");
      if (alive.current && started === epoch.current) {
        setSnapshot(data.snapshot);
        setError("");
      }
    } catch (error) {
      if (alive.current && started === epoch.current)
        setError(error instanceof Error ? error.message : "Профиль недоступен.");
    }
  }, []);
  useEffect(() => {
    alive.current = true;
    bootstrap()
      .then((data) => {
        if (alive.current) {
          setSnapshot(data.snapshot);
          setError("");
        }
      })
      .catch((error) => {
        if (alive.current) setError(error.message);
      })
      .finally(() => {
        if (alive.current) setLoading(false);
      });
    window.addEventListener("focus", refresh);
    return () => {
      alive.current = false;
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);
  const mutate = useCallback(
    async <T extends { snapshot: GameSnapshot }>(path: string, body: unknown, method = "POST") => {
      const operation = mutationQueue.current
        .catch(() => {})
        .then(async () => {
          epoch.current++;
          try {
            const data = await api<T>(path, method, body);
            if (alive.current) {
              setSnapshot(data.snapshot);
              setError("");
            }
            return data;
          } finally {
            epoch.current++;
          }
        });
      mutationQueue.current = operation;
      return operation;
    },
    [],
  );
  const openBox = useCallback(async () => {
    if (!snapshot) throw new Error("Профиль капитана ещё загружается.");
    const storageKey = `gla.pending-opening:${snapshot.profile.id}`;
    let requestKey: string | null = null;
    try {
      requestKey = sessionStorage.getItem(storageKey);
    } catch {}
    if (
      !requestKey ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestKey)
    )
      requestKey = crypto.randomUUID();
    try {
      sessionStorage.setItem(storageKey, requestKey);
    } catch {}
    const data = await mutate<{ opening: OpeningResult; snapshot: GameSnapshot }>("boxes", {
      requestKey,
    });
    try {
      sessionStorage.removeItem(storageKey);
    } catch {}
    return data.opening;
  }, [snapshot, mutate]);
  return { snapshot, loading, error, refresh, mutate, openBox };
}
