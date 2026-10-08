import type { Metadata } from "next";
import { CollectionExperience } from "@/features/collection/collection-experience";
export const metadata: Metadata = { title: "Сокровища East Blue — Grand Line Atlas" };
export default function BoxesPage() {
  return <CollectionExperience initialView="boxes" />;
}
