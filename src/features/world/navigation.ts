import {
  locationById,
  worldConnections,
  worldLocations,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "@/content/world";

export type Camera = { zoom: number; x: number; y: number };
export type Viewport = { width: number; height: number };
export const MIN_ZOOM = 0.85;
export const MAX_ZOOM = 6;
export const initialCamera: Camera = { zoom: 1, x: 0, y: 0 };

export function fitScale(viewport: Viewport) {
  return Math.min(viewport.width / WORLD_WIDTH, viewport.height / WORLD_HEIGHT) * 0.97;
}

export function focusCamera(
  viewport: Viewport,
  bounds: { x: number; y: number; width: number; height: number },
): Camera {
  const zoom = Math.min(
    MAX_ZOOM,
    (Math.min(viewport.width / bounds.width, viewport.height / bounds.height) * 0.88) /
      fitScale(viewport),
  );
  const scale = fitScale(viewport) * zoom;
  return clampCamera(
    {
      zoom,
      x: (WORLD_WIDTH / 2 - bounds.x - bounds.width / 2) * scale,
      y: (WORLD_HEIGHT / 2 - bounds.y - bounds.height / 2) * scale,
    },
    viewport,
  );
}

export function clampCamera(camera: Camera, viewport: Viewport): Camera {
  const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, camera.zoom));
  const scale = fitScale(viewport) * zoom;
  const maxX = Math.max(100, (WORLD_WIDTH * scale - viewport.width) / 2 + 120);
  const maxY = Math.max(100, (WORLD_HEIGHT * scale - viewport.height) / 2 + 120);
  return {
    zoom,
    x: Math.max(-maxX, Math.min(maxX, camera.x)),
    y: Math.max(-maxY, Math.min(maxY, camera.y)),
  };
}

export function zoomCamera(
  camera: Camera,
  viewport: Viewport,
  zoom: number,
  anchor = { x: viewport.width / 2, y: viewport.height / 2 },
): Camera {
  const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  const factor = nextZoom / camera.zoom;
  const x = anchor.x - viewport.width / 2;
  const y = anchor.y - viewport.height / 2;
  return clampCamera(
    { zoom: nextZoom, x: x - (x - camera.x) * factor, y: y - (y - camera.y) * factor },
    viewport,
  );
}

export function getRoute(from: string, to: string): string[] {
  if (!locationById(from) || !locationById(to)) return [];
  const costs = new Map<string, number>(worldLocations.map((location) => [location.id, Infinity]));
  const previous = new Map<string, string>();
  const remaining = new Set(worldLocations.map((location) => location.id));
  costs.set(from, 0);
  while (remaining.size) {
    const current = [...remaining].sort((a, b) => costs.get(a)! - costs.get(b)!)[0];
    if (!Number.isFinite(costs.get(current)!)) break;
    remaining.delete(current);
    if (current === to) break;
    const origin = locationById(current)!.port;
    for (const edge of worldConnections) {
      const neighbor = edge.from === current ? edge.to : edge.to === current ? edge.from : null;
      if (!neighbor || !remaining.has(neighbor)) continue;
      const destination = locationById(neighbor)!.port;
      const cost =
        costs.get(current)! + Math.hypot(origin.x - destination.x, origin.y - destination.y);
      if (cost < costs.get(neighbor)!) {
        costs.set(neighbor, cost);
        previous.set(neighbor, current);
      }
    }
  }
  if (!Number.isFinite(costs.get(to)!)) return [];
  const route = [to];
  while (route[0] !== from) {
    const parent = previous.get(route[0]);
    if (!parent) return [];
    route.unshift(parent);
  }
  return route;
}

export function routePath(route: string[]): string {
  if (!route.length) return "";
  const start = locationById(route[0]);
  if (!start) return "";
  let path = `M ${start.port.x} ${start.port.y}`;
  for (let index = 1; index < route.length; index++) {
    const a = locationById(route[index - 1]);
    const b = locationById(route[index]);
    const edge = worldConnections.find(
      (connection) =>
        (connection.from === a?.id && connection.to === b?.id) ||
        (connection.to === a?.id && connection.from === b?.id),
    );
    if (!a || !b || !edge) return "";
    path += ` Q ${(a.port.x + b.port.x) / 2 + edge.curveX} ${(a.port.y + b.port.y) / 2 + edge.curveY} ${b.port.x} ${b.port.y}`;
  }
  return path;
}
