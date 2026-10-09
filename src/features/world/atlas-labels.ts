import type { AtlasPlace } from "@/content/atlas";

export function atlasLabelTop(place: AtlasPlace) {
  return place.parent ? place.point!.y - 8 : place.point!.y + (place.radius ?? 12) + 13;
}

/** Names compete for screen space; omitted names remain interactive point markers. */
export function expandedAtlasLabels(
  places: AtlasPlace[],
  scale: number,
  selectedId: string | null,
) {
  const occupied: { left: number; right: number; top: number; bottom: number }[] = [];
  const expanded = new Set<string>();
  const factor = Math.min(3, 1 / scale) * scale;
  const ranked = [...places].sort(
    (a, b) =>
      Number(b.id === selectedId) - Number(a.id === selectedId) ||
      a.detail - b.detail ||
      Number(!!a.parent) - Number(!!b.parent),
  );
  for (const p of ranked) {
    if (!p.point) continue;
    const width = Math.min(190, p.english.length * (p.parent ? 5 : 6) + 20) * factor;
    const top = atlasLabelTop(p) * scale;
    const rect = {
      left: p.point.x * scale - width / 2 - 3,
      right: p.point.x * scale + width / 2 + 3,
      top: top - 3,
      bottom: top + (p.parent ? 24 : 42) * factor + 3,
    };
    if (
      p.id === selectedId ||
      !occupied.some(
        (r) =>
          rect.left < r.right && rect.right > r.left && rect.top < r.bottom && rect.bottom > r.top,
      )
    ) {
      occupied.push(rect);
      expanded.add(p.id);
    }
  }
  return expanded;
}
