"use client";

type Island = {
  x: number;
  y: number;
  size: number;
  name: string;
  shape?: number;
  active?: boolean;
};

function organicOutline(path: string, seed = 0): string {
  const numbers = (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < numbers.length; i += 2)
    points.push({
      x: numbers[i] + (seed ? Math.sin(i * 1.7 + seed * 11) * 3 : 0),
      y: numbers[i + 1] + (seed ? Math.cos(i * 1.3 + seed * 9) * 3 : 0),
    });
  if (points.length < 3) return path;
  const format = (value: number) => Number(value.toFixed(2));
  let result = `M${format(points[0].x)} ${format(points[0].y)}`;
  for (let i = 0; i < points.length; i++) {
    const previous = points[(i + points.length - 1) % points.length],
      current = points[i],
      next = points[(i + 1) % points.length],
      following = points[(i + 2) % points.length];
    result += `C${format(current.x + (next.x - previous.x) * 0.15)} ${format(current.y + (next.y - previous.y) * 0.15)} ${format(next.x - (following.x - current.x) * 0.15)} ${format(next.y - (following.y - current.y) * 0.15)} ${format(next.x)} ${format(next.y)}`;
  }
  return result + "Z";
}

const shapes = [
  "M-66-24 -49-47 -23-39 -8-54 16-42 35-46 48-20 70-7 53 15 58 34 25 40 10 55 -14 42 -36 46 -51 25 -72 12 -59-8Z",
  "M-61-16 -52-40 -29-32 -14-50 8-39 20-46 47-33 43-8 65 7 41 21 33 42 3 31 -13 48 -29 26 -56 29 -49 8 -70-2Z",
  "M-70-6 -56-35 -30-30 -19-45 7-32 22-40 47-27 61-8 50 14 72 26 42 30 19 48 -4 33 -30 41 -43 19 -62 18Z",
  "M-59-28 -33-49 -13-25 6-36 29-23 49-32 60-7 42 4 56 24 29 43 5 33 -14 53 -34 35 -57 32 -46 9 -67 3Z",
];

const islands: Island[] = [
  { x: 260, y: 205, size: 1.5, name: "Swallow Island" },
  { x: 630, y: 220, size: 1.2, name: "Lvneel" },
  { x: 395, y: 420, size: 1.35, name: "Flevance" },
  { x: 850, y: 455, size: 1.1, name: "Spider Miles" },
  { x: 205, y: 585, size: 0.75, name: "Rubeck Island" },
  { x: 990, y: 290, size: 0.65, name: "Minion Island" },
  { x: 1760, y: 305, size: 1.2, name: "Dawn Island", active: true },
  { x: 2095, y: 270, size: 0.95, name: "Yotsuba Island", active: true },
  { x: 2190, y: 505, size: 1.05, name: "Organ Islands", active: true },
  { x: 1585, y: 435, size: 1.1, name: "Conomi Islands", active: true },
  { x: 2030, y: 570, size: 0.65, name: "Gecko Islands" },
  { x: 1460, y: 620, size: 0.55, name: "Loguetown" },
  { x: 2225, y: 160, size: 0.8, name: "Shimotsuki Village" },
  { x: 1520, y: 230, size: 0.7, name: "Goat Island" },
  { x: 340, y: 1120, size: 1.2, name: "Ohara" },
  { x: 850, y: 1100, size: 1.4, name: "Ilusia Kingdom" },
  { x: 215, y: 1420, size: 1.2, name: "Kano Country" },
  { x: 640, y: 1390, size: 1, name: "Toroa Island" },
  { x: 970, y: 1300, size: 0.65, name: "Las Camp" },
  { x: 1510, y: 1070, size: 0.9, name: "Baterilla" },
  { x: 2090, y: 1170, size: 1.3, name: "Sorbet Kingdom" },
  { x: 1810, y: 1380, size: 1.1, name: "Karate Island" },
  { x: 2240, y: 1430, size: 0.75, name: "Briss Kingdom" },
];
const grandLine: Island[] = [
  { x: 190, y: 815, size: 0.52, name: "Elbaf" },
  { x: 385, y: 875, size: 0.75, name: "Whole Cake Island" },
  { x: 605, y: 785, size: 0.65, name: "Wano Country" },
  { x: 790, y: 890, size: 0.48, name: "Zou" },
  { x: 980, y: 790, size: 0.6, name: "Dressrosa" },
  { x: 1390, y: 860, size: 0.4, name: "Twin Cape" },
  { x: 1505, y: 795, size: 0.35, name: "Whisky Peak" },
  { x: 1635, y: 855, size: 0.4, name: "Little Garden" },
  { x: 1770, y: 795, size: 0.48, name: "Drum Island" },
  { x: 1900, y: 885, size: 0.62, name: "Alabasta" },
  { x: 2045, y: 800, size: 0.4, name: "Water 7" },
  { x: 2230, y: 875, size: 0.42, name: "Sabaody" },
];

function CompassRose({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`} className="atlas-rose">
      <circle r="64" />
      <circle r="52" />
      <path
        d="M0-90 13-14 0 0 -13-14Z M90 0 14 13 0 0 14-13Z M0 90-13 14 0 0 13 14Z M-90 0-14-13 0 0-14 13Z"
        className="rose-dark"
      />
      <path
        d="M0-90 0 0 13-14Z M90 0 0 0 14 13Z M0 90 0 0-13 14Z M-90 0 0 0-14-13Z"
        className="rose-light"
      />
      <path d="M-49-49 0-13 49-49 13 0 49 49 0 13-49 49-13 0Z" fill="none" />
      <path d="M-95 0H95M0-95V95" />
      <text y="-105" textAnchor="middle">
        N
      </text>
      <text x="105" y="6" textAnchor="middle">
        E
      </text>
      <text y="118" textAnchor="middle">
        S
      </text>
      <text x="-107" y="6" textAnchor="middle">
        W
      </text>
    </g>
  );
}

function EngravedShip({ x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className="engraved-ship">
      <path d="M-45 24Q0 36 44 21L31 45Q-3 58-34 41Z" className="ship-hull" />
      <path d="M-52 52Q-28 45-2 54T49 52M-57 63Q-31 55-4 64T53 62" fill="none" />
      <path d="M-21 32V-47M9 36V-62M31 31V-35M-38 29 9-58 40 27" fill="none" />
      <path
        d="M-23-38Q-42-12-24 10L4 7Q-7-16-1-38Z M9-52Q-7-32 10-9L37-12Q21-33 28-52Z M10-6Q-5 15 12 32L36 25Q25 11 28-6Z"
        className="ship-sails"
      />
      <path d="M9-64 29-58 9-52 M-21-49-8-45-21-40" className="ship-flag" />
    </g>
  );
}

function Landmark({
  x,
  y,
  type,
  scale = 1,
}: {
  x: number;
  y: number;
  type: "windmill" | "fortress" | "circus" | "gate" | "pagoda";
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} className="atlas-landmark">
      {type === "windmill" ? (
        <>
          <path d="M-17 16-12-33H12L18 16Z" className="landmark-paper" />
          <path d="M-18-33 0-47 18-33Z" />
          <path d="M-5 16V-1H5V16M-13 6H14M-12-7H13M-12-21H12" />
          <g transform="translate(0 -35)">
            <g className="atlas-windmill-rotor">
              <path
                d="M0 0-7-43 2-45 7-6 0 0 43-7 45 2 6 7 0 0 7 43-2 45-7 6 0 0-43 7-45-2-6-7Z"
                className="landmark-paper"
              />
              <circle r="3" />
            </g>
          </g>
        </>
      ) : null}
      {type === "fortress" ? (
        <>
          <path
            d="M-37 16V-29H-25V-36H-15V-29H-3V-43H9V-29H22V-36H34V16Z"
            className="landmark-paper"
          />
          <path d="M-13 16V-10H8V16M-31-16V-8M25-16V-8M-3-42V-57L18-52-3-47" />
          <path d="M-37 4H34M-34 11H-16M11 11H33" />
        </>
      ) : null}
      {type === "circus" ? (
        <>
          <path d="M-40 16-30-8 0-42 30-8 40 16Z" className="landmark-paper" />
          <path d="M0-42V-60L19-55 0-50M0-42-14 16M0-42 15 16M-30-8Q0 8 30-8M-8 16V0Q0-9 8 0V16" />
        </>
      ) : null}
      {type === "gate" ? (
        <>
          <path d="M-36-27Q0-18 36-27M-40-35Q0-26 40-35M-22-29V18M22-29V18M-29-14H29M-32 18H-12M12 18H32" />
        </>
      ) : null}
      {type === "pagoda" ? (
        <>
          <path d="M-30 20V0H30V20M-24-3V-20H24V-3M-17-23V-40H17V-23" className="landmark-paper" />
          <path d="M-43-2Q0 10 43-2L25-11H-25ZM-35-24Q0-13 35-24L18-33H-18ZM-27-42Q0-31 27-42L0-56ZM0-56V-66M-6 20V7H6V20" />
        </>
      ) : null}
      <path d="M-43 23Q-8 18 41 24M-31 28H30" className="landmark-ground" />
    </g>
  );
}

export function AtlasChart({
  motion = true,
  regional = false,
}: {
  motion?: boolean;
  regional?: boolean;
}) {
  return (
    <svg
      className="atlas-chart"
      viewBox="0 0 2400 1600"
      aria-label="Морской атлас мира One Piece: четыре моря, Red Line, Grand Line и Calm Belt"
      role="img"
    >
      <defs>
        <pattern id="atlas-coordinate-grid" width="120" height="100" patternUnits="userSpaceOnUse">
          <path d="M120 0H0V100" fill="none" stroke="#735031" strokeWidth=".5" opacity=".14" />
        </pattern>
        <pattern id="atlas-wave-hatch" width="72" height="18" patternUnits="userSpaceOnUse">
          <path
            d="M-8 9Q10 1 28 9T64 9T100 9"
            fill="none"
            stroke="#876437"
            strokeWidth="1.1"
            opacity=".35"
          />
        </pattern>
        <pattern
          id="atlas-calm-hatch"
          width="22"
          height="22"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(30)"
        >
          <path d="M0 0V22" fill="none" stroke="#5f7b72" strokeWidth=".8" opacity=".25" />
        </pattern>
      </defs>
      <image
        href="/world/atlas-parchment.webp"
        width="2400"
        height="1600"
        preserveAspectRatio="none"
      />
      <rect x="58" y="58" width="2284" height="1484" fill="#b87350" opacity=".22" />
      <rect x="26" y="26" width="2348" height="1548" rx="5" className="atlas-neatline" />
      <rect x="36" y="36" width="2328" height="1528" rx="3" className="atlas-inner-neatline" />
      <g className="atlas-longitudes">
        <path d="M1200 50V1550M70 800H2330M640 60V1540M1760 60V1540" />
        <path d="M70 330H2330M70 1270H2330" />
      </g>
      <path
        className="red-line-land"
        d={organicOutline(
          "M1050 50 1160 35 1320 50 1370 125 1280 190 1315 260 1270 335 1340 385 1285 455 1305 520 1250 585 1310 655 1275 702 1320 760 1290 820 1320 900 1260 952 1325 1030 1260 1110 1340 1170 1280 1250 1330 1335 1270 1410 1330 1510 1295 1560 1085 1560 1110 1460 1055 1390 1110 1310 1070 1240 1120 1165 1070 1090 1115 1010 1065 940 1110 875 1090 810 1135 750 1090 690 1125 630 1060 565 1115 495 1060 425 1120 355 1065 270 1120 195 1065 130Z",
        )}
      />
      <g className="atlas-seas">
        <path
          d={organicOutline(
            "M90 99 180 69 269 82 320 61 401 92 475 76 560 106 641 74 730 94 813 79 890 102 961 85 1040 119 1064 170 1036 218 1072 264 1042 309 1066 351 1027 395 1046 445 1013 489 1050 532 1015 572 1040 618 990 647 928 623 861 654 785 631 717 660 639 635 572 661 497 633 420 655 351 628 275 652 207 626 148 645 90 610 106 558 68 505 98 462 71 404 108 359 83 300 110 257 75 207 106 157Z",
          )}
        />
        <path
          d={organicOutline(
            "M1390 113 1460 86 1528 107 1600 71 1680 91 1750 77 1820 97 1900 66 1980 97 2050 77 2130 94 2200 73 2280 101 2320 145 2292 192 2330 241 2302 281 2326 333 2289 379 2314 426 2285 475 2320 521 2290 566 2306 615 2240 643 2170 622 2090 649 2020 624 1945 654 1870 627 1795 652 1720 626 1648 650 1574 626 1498 651 1425 625 1381 590 1404 548 1368 502 1404 451 1380 406 1418 362 1380 310 1410 268 1370 219 1402 167Z",
          )}
        />
        <path
          d={organicOutline(
            "M88 975 158 947 231 970 300 942 375 965 451 945 525 970 597 945 672 970 745 948 820 974 892 948 967 976 1041 954 1069 1003 1035 1049 1070 1095 1035 1139 1062 1188 1030 1232 1062 1278 1028 1324 1057 1367 1024 1410 1060 1457 1023 1502 964 1520 894 1499 820 1530 748 1510 674 1538 601 1510 528 1533 454 1508 380 1531 307 1503 234 1528 160 1503 91 1523 76 1474 108 1429 75 1381 108 1336 73 1289 107 1242 80 1195 110 1148 77 1102 109 1056 80 1013Z",
          )}
        />
        <path
          d={organicOutline(
            "M1405 974 1480 949 1553 974 1628 951 1700 975 1773 947 1849 973 1921 949 1998 976 2071 950 2144 975 2218 950 2293 977 2320 1022 2288 1071 2320 1117 2285 1162 2314 1212 2282 1256 2320 1302 2285 1346 2312 1394 2280 1440 2315 1489 2280 1520 2204 1503 2130 1531 2055 1505 1982 1534 1909 1506 1835 1534 1760 1508 1688 1535 1614 1507 1540 1531 1466 1505 1394 1525 1374 1478 1405 1432 1374 1385 1404 1339 1370 1293 1402 1248 1373 1200 1406 1155 1375 1108 1407 1063 1376 1019Z",
          )}
        />
      </g>
      <rect x="65" y="55" width="2270" height="1490" fill="url(#atlas-coordinate-grid)" />
      <g className="calm-belts">
        <path d="M60 672Q550 654 1090 677L1110 719Q560 706 60 726Z M1300 677Q1850 655 2340 678V725Q1840 704 1290 720Z M60 925Q560 944 1095 920L1110 959Q560 980 60 967Z M1300 919Q1850 943 2340 923V965Q1840 979 1290 959Z" />
        <path
          d="M60 672H1090V721H60Z M1300 675H2340V724H1300Z M60 920H1095V967H60Z M1300 920H2340V966H1300Z"
          fill="url(#atlas-calm-hatch)"
        />
      </g>
      <path
        className="grand-line-band"
        d="M60 730Q570 711 1090 734L1148 790 1095 914Q560 941 60 917Z M1305 734Q1830 715 2340 733V916Q1835 940 1305 914L1250 802Z"
      />
      <path d="M60 739H1095V916H60Z M1305 739H2340V916H1305Z" fill="url(#atlas-wave-hatch)" />
      <g className="atlas-current-lines">
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M90 ${754 + i * 43}Q400 ${730 + i * 43} 700 ${754 + i * 43}T1060 ${752 + i * 43}M1350 ${755 + i * 43}Q1650 ${729 + i * 43} 1910 ${754 + i * 43}T2320 ${755 + i * 43}`}
          />
        ))}
      </g>
      <g className="reverse-mountain">
        <path d="M1200 699 1230 752 1290 790 1234 826 1200 894 1171 831 1110 789 1172 752Z" />
        <path d="M1200 711V880M1122 789H1278" className="mountain-stream" />
        <path d="M1157 782 1199 725 1242 782 1200 849Z" className="mountain-peaks" />
        <text x="1200" y="922" textAnchor="middle">
          Reverse Mountain
        </text>
      </g>
      <g className="atlas-islands">
        {islands.map((island, index) => (
          <g key={island.name} transform={`translate(${island.x} ${island.y})`}>
            <path
              d={organicOutline(shapes[index % shapes.length], index + 1)}
              transform={`scale(${island.size})`}
              className={island.active ? "atlas-island active-island" : "atlas-island"}
            />
            <path
              d={organicOutline(shapes[(index + 1) % shapes.length], index + 1)}
              transform={`scale(${island.size * 0.59})`}
              className="island-contour"
            />
            {!regional || !island.active ? (
              <text y={island.size * 57 + 20} textAnchor="middle">
                {island.name}
              </text>
            ) : null}
            <path d={`M${-island.size * 25} 5l13-19 14 19 10-11 12 15`} className="island-hills" />
          </g>
        ))}
      </g>
      <g className="grand-line-islands">
        {grandLine.map((island, index) => (
          <g key={island.name} transform={`translate(${island.x} ${island.y})`}>
            <path
              d={organicOutline(shapes[(index + 2) % shapes.length], index + 2)}
              transform={`scale(${island.size})`}
              className="atlas-island"
            />
            <text y={island.size * 54 + 16} textAnchor="middle">
              {island.name}
            </text>
          </g>
        ))}
      </g>
      <g className="atlas-region-names">
        <text x="610" y="575" textAnchor="middle">
          North Blue
        </text>
        <text x="1840" y="155" textAnchor="middle">
          East Blue
        </text>
        <text x="605" y="1218" textAnchor="middle">
          West Blue
        </text>
        <text x="1830" y="1115" textAnchor="middle">
          South Blue
        </text>
        <text x="1200" y="112" textAnchor="middle" className="red-line-title">
          RED LINE
        </text>
        <text
          x="1190"
          y="1390"
          textAnchor="middle"
          transform="rotate(-90 1190 1390)"
          className="red-line-title lower"
        >
          RED LINE
        </text>
      </g>
      <g className="atlas-band-labels">
        <text x="535" y="725" textAnchor="middle">
          GRAND LINE · NEW WORLD
        </text>
        <text x="1830" y="727" textAnchor="middle">
          GRAND LINE · PARADISE
        </text>
        <text x="720" y="694">
          Calm Belt
        </text>
        <text x="1640" y="945">
          Calm Belt
        </text>
      </g>
      <CompassRose x={780} y={1440} size={0.78} />
      <CompassRose x={2210} y={1030} size={0.43} />
      <g className="atlas-cartouche">
        <path d="M75 68H625L644 101 625 134H75L60 101Z" />
        <text x="351" y="98" textAnchor="middle">
          GRAND LINE ATLAS
        </text>
        <text x="351" y="119" textAnchor="middle" className="cartouche-sub">
          CHART OF THE FOUR SEAS
        </text>
      </g>
      <g className="atlas-scale-bar" transform="translate(1610 1510)">
        <path d="M0 0H340M0-7V7M85-5V5M170-7V7M255-5V5M340-7V7" />
        <text y="-16">SEA CHART · VOLUME I</text>
        <text x="0" y="24">
          0
        </text>
        <text x="170" y="24" textAnchor="middle">
          I
        </text>
        <text x="340" y="24" textAnchor="end">
          II
        </text>
      </g>
      <EngravedShip x={270} y={1100} scale={0.62} />
      <EngravedShip x={1570} y={1330} scale={0.55} />
      <EngravedShip x={1870} y={505} scale={0.7} />
      <Landmark x={1760} y={287} type="windmill" scale={0.62} />
      <Landmark x={2095} y={255} type="fortress" scale={0.55} />
      <Landmark x={2190} y={482} type="circus" scale={0.52} />
      <Landmark x={1585} y={416} type="gate" scale={0.57} />
      <Landmark x={605} y={774} type="pagoda" scale={0.6} />
      {!regional && (
        <text x="1870" y="559" textAnchor="middle" className="atlas-small-label">
          Baratie
        </text>
      )}
      <g className="atlas-roaming-ship" transform={!motion ? "translate(250 505)" : undefined}>
        {motion && (
          <animateMotion
            dur="62s"
            repeatCount="indefinite"
            path="M250 505Q500 480 790 580T1020 420Q830 460 570 490T250 505"
          />
        )}
        <EngravedShip scale={0.5} />
      </g>
      <g
        className="atlas-roaming-ship second"
        transform={!motion ? "translate(1440 1140)" : undefined}
      >
        {motion && (
          <animateMotion
            dur="78s"
            repeatCount="indefinite"
            path="M1440 1140Q1640 1020 1940 1040T2250 1310Q2100 1430 1790 1250T1440 1140"
          />
        )}
        <EngravedShip scale={0.45} />
      </g>
      <g className="atlas-whirlpools">
        <path d="M920 1305c70-10 72 55 20 58-42 3-40-39-9-39 26 0 22 22 5 20M1935 385c60-9 63 47 17 51-37 3-36-34-7-35 22 0 19 19 4 18" />
      </g>
    </svg>
  );
}
