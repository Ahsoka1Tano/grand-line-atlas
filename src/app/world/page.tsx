import type { Metadata } from "next";
import { CollectionExperience } from "@/features/collection/collection-experience";

export const metadata: Metadata = {
  title: "East Blue — Grand Line Atlas",
  description:
    "Исследуй авторскую карту East Blue: пять локаций, морские маршруты и твоё первое путешествие.",
};

export default function WorldPage() {
  return <CollectionExperience initialView="world" />;
}
