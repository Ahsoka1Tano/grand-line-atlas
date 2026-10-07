import type { Metadata } from "next";
import { CollectionExperience } from "@/features/collection/collection-experience";

export const metadata: Metadata = {
  title: "Атлас мира — Grand Line Atlas",
  description:
    "Анимированный морской атлас One Piece: четыре моря, Red Line, Grand Line и путешествие по East Blue.",
};

export default function WorldPage() {
  return <CollectionExperience initialView="world" />;
}
