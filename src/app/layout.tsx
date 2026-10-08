import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/features/game/game-provider";

export const metadata: Metadata = {
  title: "Grand Line Atlas — твоя команда, твоя легенда",
  description:
    "Фанатский мир One Piece. Открывай боксы, собирай коллекцию персонажей и команду мечты, исследуй морской атлас.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
