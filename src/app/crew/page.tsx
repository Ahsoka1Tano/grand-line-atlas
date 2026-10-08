import type { Metadata } from "next";
import { CollectionExperience } from "@/features/collection/collection-experience";
export const metadata: Metadata = { title: "Команда мечты — Grand Line Atlas" };
export default function CrewPage() {
  return <CollectionExperience initialView="crew" />;
}
