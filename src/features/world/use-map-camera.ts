"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type PointerEvent,
  type KeyboardEvent,
} from "react";
import {
  clampCamera,
  fitScale,
  focusCamera,
  initialCamera,
  zoomCamera,
  resizeCamera,
  type Viewport,
} from "./navigation";

type Point = { x: number; y: number };
const distance = (points: Point[]) =>
  Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
const midpoint = (points: Point[]) => ({
  x: (points[0].x + points[1].x) / 2,
  y: (points[0].y + points[1].y) / 2,
});

export function useMapCamera(ref: RefObject<HTMLDivElement | null>) {
  const [viewport, setViewport] = useState<Viewport>({ width: 1000, height: 630 });
  const [camera, setCamera] = useState(initialCamera);
  const [dragging, setDragging] = useState(false);
  const [measured, setMeasured] = useState(false);
  const viewportRef = useRef<Viewport>({ width: 1000, height: 630 });
  const pointers = useRef(new Map<number, Point>());

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    if (bounds.width && bounds.height) {
      const size = { width: bounds.width, height: bounds.height };
      viewportRef.current = size;
      setViewport(size);
      setCamera((current) => clampCamera(current, size));
      setMeasured(true);
    }
    const observer = new ResizeObserver(([entry]) => {
      const next = { width: entry.contentRect.width, height: entry.contentRect.height };
      if (!next.width || !next.height) return;
      const previous = viewportRef.current;
      viewportRef.current = next;
      setViewport(next);
      setCamera((current) => resizeCamera(current, previous, next));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const bounds = element.getBoundingClientRect();
      const factor = Math.exp(-Math.max(-100, Math.min(100, event.deltaY)) * 0.0025);
      setCamera((current) =>
        zoomCamera(current, viewport, current.zoom * factor, {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        }),
      );
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [ref, viewport]);

  const reset = useCallback(() => setCamera(initialCamera), []);
  const focusRect = useCallback(
    (bounds: { x: number; y: number; width: number; height: number }) =>
      setCamera(focusCamera(viewport, bounds)),
    [viewport],
  );
  const zoomBy = useCallback(
    (factor: number) =>
      setCamera((current) => zoomCamera(current, viewport, current.zoom * factor)),
    [viewport],
  );
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.button !== 0 ||
      (event.target as HTMLElement).closest("button, a, [data-map-control]")
    )
      return;
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    setDragging(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const before = [...pointers.current.values()];
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const after = [...pointers.current.values()];
    if (before.length >= 2) {
      const oldDistance = distance(before);
      if (oldDistance < 1) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const oldCenter = midpoint(before);
      const newCenter = midpoint(after);
      setCamera((current) => {
        const next = zoomCamera(current, viewport, (current.zoom * distance(after)) / oldDistance, {
          x: oldCenter.x - bounds.left,
          y: oldCenter.y - bounds.top,
        });
        return clampCamera(
          { ...next, x: next.x + newCenter.x - oldCenter.x, y: next.y + newCenter.y - oldCenter.y },
          viewport,
        );
      });
    } else {
      setCamera((current) =>
        clampCamera(
          {
            ...current,
            x: current.x + event.clientX - previous.x,
            y: current.y + event.clientY - previous.y,
          },
          viewport,
        ),
      );
    }
  };
  const releasePointer = (event: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(pointers.current.size > 0);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const shifts: Record<string, Point> = {
      ArrowLeft: { x: 45, y: 0 },
      ArrowRight: { x: -45, y: 0 },
      ArrowUp: { x: 0, y: 45 },
      ArrowDown: { x: 0, y: -45 },
    };
    if (shifts[event.key]) {
      event.preventDefault();
      setCamera((current) =>
        clampCamera(
          { ...current, x: current.x + shifts[event.key].x, y: current.y + shifts[event.key].y },
          viewport,
        ),
      );
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomBy(1.2);
    } else if (event.key === "-") {
      event.preventDefault();
      zoomBy(1 / 1.2);
    } else if (event.key === "Home") {
      event.preventDefault();
      reset();
    }
  };

  return {
    viewport,
    camera,
    measured,
    scale: fitScale(viewport) * camera.zoom,
    dragging,
    reset,
    focusRect,
    zoomBy,
    controls: {
      onPointerDown,
      onPointerMove,
      onPointerUp: releasePointer,
      onPointerCancel: releasePointer,
      onLostPointerCapture: releasePointer,
      onKeyDown,
    },
  };
}
