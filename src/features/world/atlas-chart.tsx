import { memo } from "react";
import { atlasPlaces, atlasDetailLevel, type AtlasPlace } from "@/content/atlas";
import { AtlasFleet } from "./atlas-fleet";

// Red Line silhouette registered manually to Oda's early world sketch.
// Fine coastline and relief are our illustration, not additional canon facts.
const northRed =
  "M960 38H1620Q1580 74 1470 84L1375 125 1400 175 1480 190 1540 165 1600 194 1680 215 1728 254 1674 283 1590 266 1555 303 1510 294 1488 339 1430 358 1380 336 1370 398 1310 437 1340 479 1300 522 1355 556 1315 599 1340 652 1295 694 1268 752 1220 805 1170 774 1130 714 1070 710 1020 680 946 685 900 642 932 611 892 569 909 524 845 512 805 476 815 426 750 421 710 389 750 355 728 312 796 275 850 268 898 231 920 176 990 161 1024 125 992 91Z";
const southRed =
  "M1220 837L1264 884 1320 905 1310 951 1370 980 1350 1039 1400 1085 1358 1126 1408 1170 1450 1150 1470 1200 1438 1233 1460 1264 1530 1260 1550 1305 1517 1352 1540 1395 1473 1440 1440 1490 1510 1559H954L996 1500 980 1450 1050 1414 1040 1380 1110 1340 1080 1300 1114 1260 1070 1220 1110 1170 1080 1115 1140 1070 1120 1030 1180 990 1160 937 1174 880Z";
const leftRed =
  "M40 38H210L174 110 194 166 148 210 174 262 148 302 194 340 170 385 216 430 181 480 222 529 175 578 218 625 192 668 232 702 205 738 256 784 188 821 230 866 202 910 244 964 191 1000 220 1046 188 1080 218 1140 186 1205 236 1270 204 1334 222 1390 181 1460 226 1559H40Z";
const rightRed =
  "M2360 38H2280L2310 109 2260 158 2290 203 2240 253 2280 308 2250 354 2305 390 2270 440 2310 484 2270 523 2308 560 2270 601 2315 660 2280 694 2320 743 2350 785 2310 830 2340 882 2300 928 2330 972 2280 1011 2305 1065 2260 1102 2290 1150 2235 1208 2290 1250 2250 1300 2300 1352 2270 1410 2310 1470 2280 1559H2360Z";
const outlines: Record<string, string> = {
  dawn: "M-68-23Q-72-48-42-48L-31-67-8-60 12-68 23-45Q60-47 65-21L49-4 69 17 48 27 51 46 29 57 11 44-7 63-27 45-51 47-45 21-69 10-58-5Z",
  yotsuba:
    "M-42-35Q-20-55-5-34Q24-57 38-34L27-13Q55 1 39 21L20 16Q30 54 2 47L-12 23Q-44 43-47 22L-24 4Q-60-10-42-35Z",
  conomi:
    "M-51-31Q-30-54-8-41L9-54 22-29 52-20 58 5 34 14 42 35 19 49-3 31-31 47-39 20-63 13-54-8Z",
  organ: "M-42-16L-28-37-7-33 7-42 30-23 43-4 27 11 35 25 11 36-4 25-25 40-34 22-48 17-34 3Z",
  gecko: "M-36-16Q-26-38-7-35L12-28 25-37 35-17 24-2 39 14 22 31 4 19-14 35-29 23-37 6-22-1Z",
  wano: "M-50-21L-38-47-12-43 8-55 22-32 47-36 57-11 40 7 56 30 24 37 6 53-19 38-40 44-34 19-58 10Z",
  alabasta:
    "M-52-30Q-26-54 0-48L30-54 48-36 61-10 50 12 58 33 31 44 11 55-12 45-41 49-46 25-62 9-43-8Z",
  drum: "M-35-27L-16-43 0-31 22-43 39-26 29-7 43 10 30 28 10 24-4 41-24 28-41 24-31 3-44-9Z",
};
function inkCoast(path: string, fine = false) {
  const tokens = path.match(/[MLHVQZ]|-?\d+(?:\.\d+)?/g) ?? [];
  const points: [number, number][] = [];
  let command = "M",
    x = 0,
    y = 0,
    i = 0;
  while (i < tokens.length) {
    if (/[A-Z]/.test(tokens[i])) {
      command = tokens[i++];
      if (command === "Z") break;
    }
    if (command === "H") x = Number(tokens[i++]);
    else if (command === "V") y = Number(tokens[i++]);
    else if (command === "Q") {
      i += 2;
      x = Number(tokens[i++]);
      y = Number(tokens[i++]);
    } else {
      x = Number(tokens[i++]);
      y = Number(tokens[i++]);
    }
    points.push([x, y]);
  }
  if (points.length < 3) return path;
  const samples: [number, number][] = fine
    ? points.flatMap((p, j) => {
        const n = points[(j + 1) % points.length];
        const dx = n[0] - p[0],
          dy = n[1] - p[1],
          len = Math.hypot(dx, dy);
        const count = Math.max(1, Math.floor(len / 15));
        return Array.from({ length: count }, (_, k): [number, number] => {
          const t = k / count;
          const ripple =
            Math.sin(t * Math.PI) * Math.sin((j * 3 + k) * 2.7) * Math.min(3.2, len * 0.04);
          return [
            p[0] + dx * t - (dy / (len || 1)) * ripple,
            p[1] + dy * t + (dx / (len || 1)) * ripple,
          ];
        });
      })
    : points;
  let result = `M${samples[0][0]} ${samples[0][1]}`;
  samples.forEach((p, j) => {
    const before = samples[(j - 1 + samples.length) % samples.length],
      next = samples[(j + 1) % samples.length],
      after = samples[(j + 2) % samples.length];
    result += `C${p[0] + (next[0] - before[0]) * 0.14} ${p[1] + (next[1] - before[1]) * 0.14} ${next[0] - (after[0] - p[0]) * 0.14} ${next[1] - (after[1] - p[1]) * 0.14} ${next[0]} ${next[1]}`;
  });
  return result + "Z";
}
const continentPaths = [northRed, southRed, leftRed, rightRed].map((d) => inkCoast(d, true));
Object.keys(outlines).forEach((id) => {
  outlines[id] = inkCoast(outlines[id]);
});
const defaultOutline = inkCoast(
  "M-34-22Q-22-38-4-31L11-38 28-24 32-7 24 5 35 18 17 28 4 23-11 36-25 24-32 7-26-5-39-12Z",
);
const palette: Record<string, [string, string]> = {
  forest: ["#a5bba0", "#cfceb0"],
  desert: ["#dec399", "#eddbb5"],
  snow: ["#d8e0d6", "#e9ead4"],
  city: ["#b5bd9b", "#ddcfad"],
  volcano: ["#b6a397", "#d9bea4"],
  cake: ["#d8b9a3", "#e9d1b3"],
  grove: ["#99b6a0", "#c7d0ac"],
};
export function AtlasEmblem({ type, size = 1 }: { type: string; size?: number }) {
  return (
    <g transform={`scale(${size})`} className="engraving">
      {type === "windmill" ? (
        <>
          <path className="emblem-fill" d="M-12 14L-8-20H8L12 14Z" />
          <path d="M-9-20L0-32 9-20M-17 15H18M-4 14V4H4V14" />
          <g className="chart-windmill">
            <path d="M0-16V-45H6V-24H-19V-18H28V-12H6V9H0V-16H-25V-22H0" />
          </g>
        </>
      ) : type === "fort" ? (
        <>
          <path
            className="emblem-fill"
            d="M-24 17V-22H-18V-29H-10V-22H-3V-9H4V-22H11V-29H18V-22H24V17Z"
          />
          <path d="M-29 17H30M-5 17V3Q0-5 5 3V17M-16-12V-4M16-12V-4M0-27V-47L16-40 0-35" />
        </>
      ) : type === "pagoda" ? (
        <>
          <path
            className="emblem-fill"
            d="M-22 15H22V-5L32-8 16-18H-16L-32-8-22-5ZM-17-18V-30L-25-33-9-43H9L25-33 17-30V-18"
          />
          <path d="M-29 17H30M-9 15V-1H9V15M-14-25H14M-5-43V-53H5V-43" />
        </>
      ) : type === "cake" ? (
        <>
          <path className="emblem-fill" d="M-22 15V-3H22V15ZM-15-3V-19H15V-3ZM-7-19V-32H7V-19Z" />
          <path d="M-27 15H27M-22 4Q-13 15-5 4Q4 15 12 4Q20 14 22 4M-2-32V-41L9-38-2-35" />
        </>
      ) : type === "desert" ? (
        <>
          <path d="M-31 14L-12-17 6 14M-12-17L-2 7M-2 14L16-11 34 14M17-14L22-5M-38 16H38" />
          <path className="emblem-fill" d="M-6-6V-29H8V-6M-11-29L1-40 14-29Z" />
        </>
      ) : type === "city" ? (
        <>
          <path
            className="emblem-fill"
            d="M-23 15V-5L-14-14-5-5V15M-2 15V-23L8-34 18-23V15M19 15V-4L27-13 35-4V15"
          />
          <path d="M-28 17H39M4-15H12M4-7H12M4 1H12M-18 1H-10M24 2H30" />
        </>
      ) : type === "skull" ? (
        <>
          <path className="emblem-fill" d="M-21-2Q-30-33 0-35Q30-33 21-2L10 4V15H-10V4Z" />
          <path d="M-14-15L-7-19-1-9-12-6ZM14-15L7-19 1-9 12-6ZM-4 0L0-6 4 0M-7 8V15M0 8V15M7 8V15M-31-32L-18-22M31-32L18-22" />
        </>
      ) : (
        <>
          <path d="M-28 15L-8-26 9 15M-8-26L-1-10 4-14M0 15L17-14 35 15M17-14L22-5 27-1M-33 17H38" />
        </>
      )}
    </g>
  );
}
function CompassRose({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`} className="chart-rose">
      <circle r="71" />
      <circle r="60" />
      <circle r="46" />
      {Array.from({ length: 16 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 22.5})`}>
          <path
            d={`M0 ${i % 2 ? -53 : -77}L8-12 0-3Z`}
            className={i % 2 ? "rose-light" : "rose-dark"}
          />
          <path d={`M0 ${i % 2 ? -53 : -77}L-8-12 0-3Z`} className="rose-light" />
        </g>
      ))}
      <circle r="5" />
      <text y="-92" textAnchor="middle">
        N
      </text>
      <text y="108" textAnchor="middle">
        S
      </text>
      <text x="95" y="8">
        E
      </text>
      <text x="-109" y="8">
        W
      </text>
    </g>
  );
}
function Island({ place, level }: { place: AtlasPlace; level: number }) {
  if (!place.point || !place.radius) return null;
  if (
    [
      "dawn",
      "yotsuba",
      "conomi",
      "organ",
      "gecko",
      "polestar",
      "alabasta",
      "wano",
      "water-seven",
    ].includes(place.id)
  ) {
    const span = place.radius * 3.2;
    return (
      <g
        transform={`translate(${place.point.x} ${place.point.y})`}
        className="painted-island"
        data-island={place.id}
      >
        <image
          href={`/world/atlas/${place.id}-vignette.webp`}
          x={-span / 2}
          y={-span / 2}
          width={span}
          height={span}
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    );
  }
  const [green, sand] = palette[place.terrain ?? "forest"];
  const outline = outlines[place.id] ?? defaultOutline;
  const ratio = place.radius / (outlines[place.id] ? 62 : 38);
  const icon =
    place.id === "dawn"
      ? "windmill"
      : place.id === "yotsuba"
        ? "fort"
        : place.id === "wano"
          ? "pagoda"
          : place.id === "onigashima"
            ? "skull"
            : place.terrain === "cake"
              ? "cake"
              : place.terrain === "city"
                ? "city"
                : place.terrain === "desert"
                  ? "desert"
                  : "mountain";
  return (
    <g
      transform={`translate(${place.point.x} ${place.point.y})`}
      className={`chart-island terrain-${place.terrain}`}
      data-island={place.id}
    >
      <g transform={`scale(${ratio})`}>
        <path d={outline} className="island-shelf" />
        <path d={outline} className="island-surf" />
        <path d={outline} transform="translate(0 5)" fill="#4b655952" />
        <path d={outline} fill={sand} className="island-shore" />
        <path d={outline} transform="scale(.86)" fill={green} className="island-interior" />
        <path d={outline} transform="scale(.67)" className="island-contour" />
        <path d="M-19-27Q-3-8-15 9T1 35" className="island-river" />
        {level >= 1 && (
          <g className="island-vegetation">
            {[-27, -13, 16, 30].map((x, i) => (
              <g key={x} transform={`translate(${x} ${[-2, 18, 12, -10][i]})`}>
                <path d="M0 0V-12M-6-7L0-20 7-7ZM-7-1L0-13 8-1Z" />
                <path d="M-9 3H10" />
              </g>
            ))}
          </g>
        )}
        {level >= 2 && (
          <g className="island-houses">
            <path d="M-32 16V9L-27 3-22 9V16ZM19-20V-28L25-34 31-28V-20ZM29 23V16L34 11 39 16V23Z" />
            <path d="M-23 19Q0 0 25-22" className="island-road" />
          </g>
        )}
      </g>
      <g transform={`translate(3 ${place.id === "dawn" ? 5 : 0})`}>
        <AtlasEmblem type={icon} size={Math.min(0.83, place.radius / 68)} />
      </g>
    </g>
  );
}
const archipelagoIslets: Record<string, [number, number, number][]> = {
  conomi: [
    [-80, -16, 13],
    [-56, -62, 16],
    [-15, -75, 10],
    [50, -63, 17],
    [77, -27, 11],
    [67, 38, 14],
    [-63, 64, 12],
  ],
  organ: [
    [-55, -18, 12],
    [-29, -51, 11],
    [51, 23, 14],
    [5, 55, 10],
  ],
  gecko: [
    [-49, 23, 11],
    [30, -48, 13],
    [55, 6, 9],
  ],
  "long-ring": [
    [-35, -8, 8],
    [-22, -29, 7],
    [0, -38, 8],
    [27, -27, 7],
    [39, 0, 8],
    [29, 25, 7],
    [0, 34, 8],
    [-27, 23, 7],
    [-39, 13, 6],
  ],
  "whole-cake": [
    [-83, 15, 12],
    [-60, 55, 10],
    [-2, 71, 13],
    [42, 62, 11],
    [92, -12, 10],
    [-33, -71, 11],
  ],
};
export const AtlasChart = memo(function AtlasChart({
  motion,
  zoom,
  showRoutes = true,
  showShips = true,
  sailing = false,
}: {
  motion: boolean;
  zoom: number;
  showRoutes?: boolean;
  showShips?: boolean;
  sailing?: boolean;
}) {
  const level = atlasDetailLevel(zoom);
  const islands = atlasPlaces.filter(
    (p) =>
      p.point &&
      p.radius &&
      (p.detail <= level || p.detail < 2) &&
      (showRoutes || p.placement !== "route"),
  );
  return (
    <svg
      className={`atlas-chart cartography-v2 ${motion ? "with-motion" : ""}`}
      viewBox="0 0 2400 1600"
      aria-label="Морской атлас: четыре моря, Red Line и Grand Line"
      role="img"
    >
      <defs>
        <linearGradient id="atlas-ocean" x2=".6" y2="1">
          <stop stopColor="#8eb3af" />
          <stop offset=".43" stopColor="#bbcdc0" />
          <stop offset="1" stopColor="#97b8b1" />
        </linearGradient>
        <linearGradient id="redland" x2="1" y2=".8">
          <stop stopColor="#c6a78c" />
          <stop offset=".5" stopColor="#b98d78" />
          <stop offset="1" stopColor="#d4b99a" />
        </linearGradient>
        <pattern id="chart-waves" width="96" height="58" patternUnits="userSpaceOnUse">
          <path
            d="M12 30q8-5 16 0t16 0M64 9q7-4 14 0"
            fill="none"
            stroke="#527c76"
            strokeWidth=".8"
            opacity=".3"
          />
        </pattern>
        <pattern id="mountain-ridge" width="68" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M2 47L22 13 39 47M22 13L26 30 34 33M28 52L48 22 67 52M48 22L51 39 61 41"
            fill="none"
            stroke="#805b48"
            strokeWidth="1.1"
            opacity=".45"
          />
        </pattern>
        <clipPath id="redland-clip">
          {continentPaths.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <radialGradient id="depth-wash">
          <stop stopColor="#315f6625" />
          <stop offset="1" stopColor="#315f6600" />
        </radialGradient>
      </defs>
      <rect width="2400" height="1600" fill="url(#atlas-ocean)" />
      <image
        href="/world/atlas-parchment.webp"
        width="2400"
        height="1600"
        preserveAspectRatio="none"
        opacity=".2"
        className="chart-paper-grain"
      />
      <rect x="40" y="38" width="2320" height="1521" fill="url(#chart-waves)" />
      <ellipse cx="1750" cy="350" rx="400" ry="260" fill="url(#depth-wash)" />
      <ellipse cx="600" cy="1200" rx="400" ry="200" fill="url(#depth-wash)" />
      <g className="chart-rhumbs">
        {[350, 1150, 2050].map((x, i) => (
          <g key={x}>
            {Array.from({ length: 16 }, (_, n) => {
              const angle = (n * Math.PI) / 8;
              return (
                <path
                  key={n}
                  d={`M${x} ${[390, 1260, 1180][i]}l${Math.cos(angle) * 2500} ${Math.sin(angle) * 2500}`}
                />
              );
            })}
          </g>
        ))}
      </g>
      <g className="chart-graticule">
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M${200 + i * 200} 38V1559`} />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M40 ${200 + i * 200}H2360`} />
        ))}
      </g>
      <path d="M40 710H2360V760H40ZM40 934H2360V992H40Z" className="chart-calm" />
      <path d="M40 760H2360V934H40Z" className="chart-grand" />
      <g className="chart-ocean-flow">
        <path d="M280 865Q480 925 700 859T1120 858M1330 878Q1530 939 1750 863T2260 873" />
        <path d="M1440 595Q1660 640 1790 601M370 1190Q550 1160 650 1205M390 554Q530 606 700 565" />
      </g>
      <g className="red-continent">
        {continentPaths.map((d, i) => (
          <g key={i}>
            <path d={d} className="continent-shelf" />
            <path d={d} className="continent-cliff-shadow" transform="translate(0 9)" />
            <path d={d} fill="url(#redland)" className="continent-coast" />
          </g>
        ))}
      </g>
      <g clipPath="url(#redland-clip)">
        <rect width="2400" height="1600" fill="url(#mountain-ridge)" />
        <path
          d="M1220 80Q1160 250 1230 410T1220 800M1220 858Q1290 1040 1270 1200T1230 1510"
          className="continent-spine"
        />
      </g>
      <g className="reverse-pass">
        <path d="M1160 776L1220 746 1272 780 1251 832 1222 858 1172 821Z" />
        <path
          d="M1132 733L1220 799 1276 729M1118 905L1220 799 1290 915M1220 799H1326"
          className="reverse-stream"
        />
        <path d="M1212 768L1220 748 1230 772M1178 803L1188 783 1200 809" />
      </g>
      <g className="chart-sea-titles">
        <text x="525" y="220">
          North Blue
        </text>
        <text x="1800" y="158">
          East Blue
        </text>
        <text x="540" y="1120">
          West Blue
        </text>
        <text x="1830" y="1240">
          South Blue
        </text>
      </g>
      <g className="chart-band-titles">
        <text x="665" y="964">
          CALM BELT
        </text>
        <text x="1700" y="741">
          CALM BELT
        </text>
        <text x="615" y="785">
          NEW WORLD
        </text>
        <text x="1710" y="775">
          GRAND LINE · PARADISE
        </text>
        <text x="1220" y="248" transform="rotate(-82 1220 248)" className="chart-red-title">
          RED LINE
        </text>
        <text x="1300" y="1310" transform="rotate(-82 1300 1310)" className="chart-red-title">
          RED LINE
        </text>
      </g>
      <g className="chart-islands">
        {islands
          .filter((p) => p.kind !== "underwater" && p.kind !== "sky")
          .map((p) => (
            <Island key={p.id} place={p} level={level} />
          ))}
      </g>
      {level >= 1 && (
        <g className="chart-islets">
          {Object.entries(archipelagoIslets)
            .filter(([id]) => islands.some((p) => p.id === id))
            .flatMap(([id, parts]) => {
              const place = atlasPlaces.find((p) => p.id === id)!;
              return parts.map(([dx, dy, r], i) => (
                <g
                  key={`${id}-${i}`}
                  transform={`translate(${place.point!.x + dx} ${place.point!.y + dy}) scale(${r / 38})`}
                >
                  <path d={defaultOutline} className="island-shelf" />
                  <path d={defaultOutline} fill="#cbd0a9" className="island-shore" />
                  <path d={defaultOutline} transform="scale(.7)" fill="#a7bc9d" />
                </g>
              ));
            })}
        </g>
      )}
      {level >= 2 && (
        <>
          <g transform="translate(2010 692)" className="chart-sky">
            <path d="M-48 22Q-61 0-41-5Q-48-33-20-33Q-10-56 12-35Q37-45 40-19Q64-12 48 13Q40 32 16 23Q-14 39-32 23Z" />
            <AtlasEmblem type="pagoda" size={0.65} />
            <path d="M0 42V113" className="sky-tether" />
          </g>
          <g transform="translate(2357 919)" className="chart-underwater">
            <circle r="34" />
            <circle r="40" />
            <AtlasEmblem type="city" size={0.65} />
            <path d="M0-45V-126" className="sky-tether" />
          </g>
          <path d="M455 771L467 751" className="chart-bridge" />
          <path d="M2180 800Q2210 762 2250 783" className="chart-rail" />
        </>
      )}
      <g transform="translate(1670 525)">
        <image
          href="/world/atlas/baratie-vignette.webp"
          x="-66"
          y="-44"
          width="132"
          height="88"
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
      <g transform="translate(2370 777)">
        <AtlasEmblem type="city" size={0.8} />
      </g>
      <g className="sea-monster engraving" transform="translate(460 510)">
        <path className="emblem-fill" d="M-65 9Q-46-29-26-3Q-5-37 15-9Q35-31 54 8L73 21H-70Z" />
        <path d="M-79 24q16-9 33 0t33 0t33 0t33 0t33 0M-64 2Q-75-18-61-29L-53-14M-39-5L-31-15M7-9L15-21M47-1L55-12" />
      </g>
      <g className="chart-whale engraving" transform="translate(1720 1300)">
        <path
          className="emblem-fill"
          d="M-63 15Q-66-42-13-39Q33-34 40 10L65-4 83-31 87-3 103 5 69 20Q22 40-20 35Z"
        />
        <circle cx="-42" cy="-9" r="3" />
        <path
          d="M-63 11Q-40 22-22 13M-33-42Q-37-63-49-64M-33-42Q-27-67-15-62M-76 43q15-8 30 0t30 0t30 0t30 0t30 0"
          className="whale-breath"
        />
      </g>
      <AtlasFleet
        motion={motion}
        enabled={showShips}
        sailing={sailing}
        scale={0.65 * Math.min(1, 4 / zoom)}
      />
      <CompassRose x={590} y={1375} size={1.05} />
      <CompassRose x={1930} y={1130} size={0.5} />
      <CompassRose x={520} y={350} size={0.52} />
      <g className="chart-cartouche" transform="translate(475 80)">
        <path d="M-325 0H325L343 28 325 57H-325L-343 28Z" />
        <path d="M-310 7H310M-310 49H310" />
        <text y="27">THE GRAND LINE ATLAS</text>
        <text y="44" className="chart-cartouche-sub">
          A CHART OF SEAS, ISLANDS & UNWRITTEN STORIES
        </text>
      </g>
      <g className="chart-unknown-note">
        <text x="480" y="656">
          INCOMPLETELY CHARTED WATERS
        </text>
        <text x="495" y="1250">
          Beyond the known shores
        </text>
        <text x="1780" y="1460">
          Every voyage begins with a dream.
        </text>
      </g>
      <rect x="25" y="25" width="2350" height="1550" className="chart-border-outer" />
      <rect x="40" y="38" width="2320" height="1521" className="chart-border-inner" />
      {Array.from({ length: 24 }, (_, i) => (
        <g key={i} className="chart-border-ticks">
          <path d={`M${i * 100 + 50} 25V38M${i * 100 + 50} 1559V1575`} />
          <text x={i * 100 + 50} y="20" textAnchor="middle">
            {String.fromCharCode(65 + i)}
          </text>
        </g>
      ))}
    </svg>
  );
});
