"use client";
import { memo, useEffect, useRef } from "react";

export const atlasVessels = [
  {
    id: "going-merry",
    name: "Гоинг Мерри",
    english: "Going Merry",
    duration: 82,
    phase: 0.18,
    point: [1600, 620],
    path: "M1600 620C1740 632 1850 646 1980 625C2080 609 2150 580 2240 570",
    width: 112,
    height: 76,
  },
  {
    id: "thousand-sunny",
    name: "Таузенд Санни",
    english: "Thousand Sunny",
    duration: 100,
    phase: 0.42,
    point: [320, 920],
    path: "M320 920C390 924 430 917 505 912C575 908 595 934 667 932C750 930 780 926 845 926C935 930 990 925 1040 918",
    width: 128,
    height: 84,
  },
  {
    id: "marine-garp",
    name: "Корабль Гарпа",
    english: "Marine · Garp",
    duration: 106,
    phase: 0.66,
    point: [1780, 150],
    path: "M1780 150C1870 130 1930 98 2010 95C2090 92 2160 110 2240 140",
    width: 132,
    height: 94,
  },
];

/** Illustrated voyages. These are not current canon ship coordinates. */
export const AtlasFleet = memo(function AtlasFleet({
  motion,
  enabled = true,
  sailing = false,
  scale = 0.65,
}: {
  motion: boolean;
  enabled?: boolean;
  sailing?: boolean;
  scale?: number;
}) {
  const rootRef = useRef<SVGGElement>(null);
  useEffect(() => {
    if (!enabled || !motion || !rootRef.current) return;
    const root = rootRef.current;
    const items = atlasVessels
      .filter((v) => !sailing || v.id !== "going-merry")
      .map((ship) => {
        const path = root.querySelector<SVGPathElement>(`#vessel-path-${ship.id}`)!;
        return {
          ship,
          path,
          length: path.getTotalLength(),
          vessel: root.querySelector<SVGGElement>(`[data-vessel="${ship.id}"]`)!,
          wake: root.querySelector<SVGPathElement>(`[data-wake="${ship.id}"]`)!,
          heading: root.querySelector<SVGGElement>(`[data-heading="${ship.id}"]`)!,
        };
      });
    let frame = 0,
      started: number | null = null;
    const tick = (time: number) => {
      if (started === null) started = time;
      const elapsed = (time - started) / 1000;
      for (const item of items) {
        const { ship, path, length } = item;
        const cycle = (elapsed / ship.duration + ship.phase) % 1;
        const passage = cycle;
        // Smooth departure and arrival; no looping turn, mirror or teleport in view.
        const progress = passage * passage * (3 - 2 * passage);
        const traveled = progress * length;
        const point = path.getPointAtLength(traveled);
        const ahead = path.getPointAtLength(Math.min(length, traveled + 4));
        const behind = path.getPointAtLength(Math.max(0, traveled - 4));
        const incline = Math.max(
          -15,
          Math.min(15, (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI),
        );
        item.vessel.setAttribute("transform", `translate(${point.x} ${point.y})`);
        const alpha = Math.min(1, cycle / 0.045, (1 - cycle) / 0.075);
        item.vessel.style.opacity = String(Math.max(0, alpha));
        item.heading.setAttribute("transform", `rotate(${incline})`);
        // The wake follows the actual route behind the hull, in world coordinates.
        const back = Math.min(65, traveled);
        const points = Array.from({ length: 12 }, (_, i) => {
          const p = path.getPointAtLength(Math.max(0, traveled - (back * i) / 11));
          return `${i ? "L" : "M"}${p.x - point.x - 20} ${p.y - point.y + 14}`;
        });
        item.wake.setAttribute("d", points.join(""));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [motion, enabled, sailing]);
  if (!enabled) return null;
  return (
    <g ref={rootRef} className={`atlas-fleet ${motion ? "fleet-in-motion" : ""}`}>
      <defs>
        {atlasVessels.map((ship) => (
          <path id={`vessel-path-${ship.id}`} key={ship.id} d={ship.path} />
        ))}
      </defs>
      {atlasVessels
        .filter((v) => !sailing || v.id !== "going-merry")
        .map((ship) => (
          <g
            key={ship.id}
            data-vessel={ship.id}
            className={`atlas-vessel ${ship.id === "marine-garp" ? "navy-vessel" : ""}`}
            transform={`translate(${ship.point[0]} ${ship.point[1]})`}
          >
            <path data-wake={ship.id} className="vessel-trail" d="M-25 14H-75" />
            <g data-heading={ship.id}>
              <g transform={`scale(${scale})`}>
                <g className="vessel-bob">
                  <ellipse cx="0" cy="14" rx="36" ry="10" className="vessel-shadow" />
                  <image
                    href={`/world/atlas/${ship.id}.webp`}
                    x={-ship.width / 2}
                    y={-ship.height / 2}
                    width={ship.width}
                    height={ship.height}
                    preserveAspectRatio="xMidYMid meet"
                  />
                  <title>{`${ship.name} · ${ship.english}`}</title>
                </g>
              </g>
            </g>
          </g>
        ))}
    </g>
  );
});
export function MerryShip({ size = 1 }: { size?: number }) {
  return (
    <g transform={`scale(${size})`} className="player-merry">
      <image
        href="/world/atlas/going-merry.webp"
        x="-58"
        y="-41"
        width="116"
        height="82"
        preserveAspectRatio="xMidYMid meet"
      />
    </g>
  );
}
