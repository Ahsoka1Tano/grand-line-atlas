"use client";
import { createContext, useContext } from "react";
import { useGame } from "./use-game";
const GameContext = createContext<ReturnType<typeof useGame> | null>(null);
export function GameProvider({ children }: { children: React.ReactNode }) {
  const game = useGame();
  return <GameContext.Provider value={game}>{children}</GameContext.Provider>;
}
export function useGameState() {
  const game = useContext(GameContext);
  if (!game) throw new Error("GameProvider is required");
  return game;
}
