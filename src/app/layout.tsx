import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grand Line Atlas — твоя команда, твоя легенда",
  description:
    "Фанатский мир One Piece. Собери команду мечты и начни собственное путешествие. Визуальный прототип коллекции и открытия боксов.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
