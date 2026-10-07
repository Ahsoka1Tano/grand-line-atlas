"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import {
  Anchor,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleDot,
  Compass,
  Flag,
  Home,
  MapPin,
  Maximize,
  Minus,
  Plus,
  Route,
  Sailboat,
  Shield,
  Utensils,
  X,
} from "lucide-react";
import { Modal } from "@/components/modal";
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  locationById,
  worldConnections,
  worldLocations,
  type WorldLocation,
} from "@/content/world";
import { getRoute, routePath, MAX_ZOOM, MIN_ZOOM } from "./navigation";
import { useMapCamera } from "./use-map-camera";
import { LocationScene } from "./location-scene";
import "./world.css";

const typeLabels: Record<WorldLocation["kind"], string> = {
  village: "Деревня",
  navy: "Морская база",
  town: "Портовый город",
  restaurant: "Плавучий ресторан",
  stronghold: "Крепость",
};
const typeIcons = {
  village: Home,
  navy: Shield,
  town: Flag,
  restaurant: Utensils,
  stronghold: Shield,
};
type Journey = { destination: string; route: string[]; path: string; progress: number };
const start = worldLocations[0];

export function WorldExperience() {
  const [selectedId, setSelectedId] = useState(start.id);
  const [currentId, setCurrentId] = useState(start.id);
  const [visited, setVisited] = useState<string[]>([start.id]);
  const [journalOpen, setJournalOpen] = useState(false);
  const [sceneOpen, setSceneOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [shipPosition, setShipPosition] = useState(start.port);
  const [status, setStatus] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const camera = useMapCamera(viewportRef);
  const reducedMotion = useReducedMotion();
  const selected = locationById(selectedId)!;
  const current = locationById(currentId)!;
  const SelectedIcon = typeIcons[selected.kind];
  const previewRoute = useMemo(() => getRoute(currentId, selectedId), [currentId, selectedId]);
  const previewPath = routePath(previewRoute);
  const activePath = journey?.path ?? previewPath;
  const activeRoute = journey?.route ?? previewRoute;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("gla.world-prototype.v1") ?? "null");
      if (saved && typeof saved === "object") {
        const location =
          typeof saved.currentId === "string" ? locationById(saved.currentId) : undefined;
        if (location) {
          setCurrentId(location.id);
          setSelectedId(location.id);
          setShipPosition(location.port);
        }
        if (Array.isArray(saved.visited)) {
          const valid = saved.visited.filter(
            (id: unknown): id is string => typeof id === "string" && !!locationById(id),
          );
          setVisited([...new Set([start.id, ...valid, ...(location ? [location.id] : [])])]);
        }
      }
    } catch {
      /* The map is usable when browser storage is unavailable. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("gla.world-prototype.v1", JSON.stringify({ currentId, visited }));
    } catch {
      /* Keep the journey available in memory. */
    }
  }, [currentId, visited, ready]);
  useEffect(() => {
    if (!status) return;
    const timeout = setTimeout(() => setStatus(""), 5500);
    return () => clearTimeout(timeout);
  }, [status]);

  const arrive = useCallback((destination: string) => {
    const location = locationById(destination)!;
    setCurrentId(destination);
    setSelectedId(destination);
    setShipPosition(location.port);
    setVisited((value) => (value.includes(destination) ? value : [...value, destination]));
    setJourney(null);
    setStatus(`Причалили: ${location.name}. Можно исследовать локацию.`);
  }, []);

  useEffect(() => {
    const destination = journey?.destination;
    const path = routeRef.current;
    if (!destination || !path) return;
    const length = path.getTotalLength();
    const duration = reducedMotion ? 0 : Math.max(2600, Math.min(6200, length * 4.5));
    let frame = 0;
    let started: number | null = null;
    const tick = (timestamp: number) => {
      if (started === null) started = timestamp;
      const progress = duration ? Math.min(1, (timestamp - started) / duration) : 1;
      const point = path.getPointAtLength(length * progress);
      setShipPosition({ x: point.x, y: point.y });
      if (progress >= 1) {
        arrive(destination);
        return;
      }
      setJourney((value) => (value ? { ...value, progress } : null));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [journey?.destination, journey?.path, reducedMotion, arrive]);

  const sail = () => {
    if (journey || selectedId === currentId || previewRoute.length < 2) return;
    camera.reset();
    setStatus("");
    setJourney({ destination: selectedId, route: previewRoute, path: previewPath, progress: 0 });
  };
  const cancelJourney = () => {
    setJourney(null);
    setShipPosition(current.port);
    setStatus("Курс отменён. Корабль остаётся у прежнего причала.");
  };
  const resetJourney = () => {
    setJourney(null);
    setCurrentId(start.id);
    setSelectedId(start.id);
    setShipPosition(start.port);
    setVisited([start.id]);
    setSceneOpen(false);
    camera.reset();
    setStatus("Новое путешествие начинается в деревне Фуша.");
  };

  return (
    <div className="world-experience">
      <header className="world-heading">
        <div>
          <span className="eyebrow">
            <span className="little-diamond" />
            ТВОЙ АТЛАС ПРИКЛЮЧЕНИЙ
          </span>
          <h1>
            Восточное море<span>East Blue</span>
          </h1>
        </div>
        <button className="button subtle journal-button" onClick={() => setJournalOpen(true)}>
          <BookOpen size={15} />
          Журнал капитана<span>{visited.length} / 5</span>
        </button>
      </header>
      <div className="world-layout">
        <div className="atlas-frame">
          <div className="atlas-topline" data-map-control>
            <span>
              <Compass size={12} />
              EAST BLUE <span>/</span> CHAPTER 01
            </span>
            <span className="atlas-current">
              <Anchor size={11} />
              {journey ? "В открытом море" : current.name}
            </span>
          </div>
          <div
            ref={viewportRef}
            className={`map-viewport ${camera.dragging ? "is-dragging" : ""}`}
            tabIndex={0}
            role="region"
            aria-label="Интерактивная карта East Blue. Стрелки перемещают карту, плюс и минус меняют масштаб, Home возвращает обзор."
            {...camera.controls}
          >
            <div
              className="world-plane"
              style={
                {
                  width: WORLD_WIDTH,
                  height: WORLD_HEIGHT,
                  transform: `translate(calc(-50% + ${camera.camera.x}px), calc(-50% + ${camera.camera.y}px)) scale(${camera.scale})`,
                  "--map-scale": camera.scale,
                } as CSSProperties
              }
            >
              <Image
                className="world-map-art"
                src="/world/east-blue.webp"
                alt="Иллюстрированная карта пяти локаций East Blue"
                fill
                sizes="(max-width: 650px) 900px, 1536px"
                loading="eager"
                fetchPriority="high"
                draggable={false}
              />
              <div className="world-ocean-shade" />
              <div className="world-cloud world-cloud-one" />
              <div className="world-cloud world-cloud-two" />
              <svg
                className="world-routes"
                viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
                aria-hidden="true"
              >
                <defs>
                  <filter id="route-glow">
                    <feGaussianBlur stdDeviation="3" />
                  </filter>
                </defs>
                {worldConnections.map((edge) => (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    d={routePath([edge.from, edge.to])}
                    className="sea-route"
                  />
                ))}
                {activeRoute.length > 1 && (
                  <>
                    <path d={activePath} className="planned-route-glow" filter="url(#route-glow)" />
                    <path
                      ref={routeRef}
                      d={activePath}
                      className={`planned-route ${journey ? "is-sailing" : ""}`}
                    />
                  </>
                )}
                {worldLocations.map((location) => (
                  <circle
                    key={location.id}
                    cx={location.port.x}
                    cy={location.port.y}
                    r="4"
                    className="port-dot"
                  />
                ))}
              </svg>
              <span className="sea-label sea-label-main" aria-hidden="true">
                EAST BLUE
              </span>
              <span className="sea-label sea-label-sub" aria-hidden="true">
                THE SEA OF BEGINNINGS
              </span>
              {worldLocations.map((location) => {
                const Icon = typeIcons[location.kind];
                const isSelected = selectedId === location.id;
                const isVisited = visited.includes(location.id);
                return (
                  <button
                    key={location.id}
                    className={`map-node ${isSelected ? "is-selected" : ""} ${isVisited ? "is-visited" : ""} ${currentId === location.id ? "is-current" : ""}`}
                    style={
                      {
                        left: location.x,
                        top: location.y,
                        "--island-accent": location.accent,
                      } as CSSProperties
                    }
                    aria-label={`Выбрать локацию: ${location.name}`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedId(location.id)}
                  >
                    <span className="map-node-ring">
                      <Icon size={17} />
                      {isVisited && (
                        <span className="node-check">
                          <Check size={8} />
                        </span>
                      )}
                    </span>
                    <span className="map-node-label">
                      {location.name}
                      <span>{location.latinName}</span>
                    </span>
                  </button>
                );
              })}
              <div
                className={`map-ship ${journey ? "is-sailing" : ""}`}
                style={{ left: shipPosition.x, top: shipPosition.y }}
                aria-hidden="true"
              >
                <span className="ship-wake" />
                <Sailboat size={23} strokeWidth={1.6} />
                <span className="ship-caption">{journey ? "В ПУТИ" : "ТВОЙ КОРАБЛЬ"}</span>
              </div>
            </div>
          </div>
          <div className="atlas-compass" aria-hidden="true">
            <span>N</span>
            <Compass size={48} strokeWidth={0.8} />
          </div>
          <div className="map-zoom-controls" data-map-control>
            <button
              aria-label="Приблизить карту"
              disabled={camera.camera.zoom >= MAX_ZOOM - 0.01}
              onClick={() => camera.zoomBy(1.25)}
            >
              <Plus size={17} />
            </button>
            <span>{Math.round(camera.camera.zoom * 100)}%</span>
            <button
              aria-label="Отдалить карту"
              disabled={camera.camera.zoom <= MIN_ZOOM + 0.01}
              onClick={() => camera.zoomBy(1 / 1.25)}
            >
              <Minus size={17} />
            </button>
            <span className="zoom-divider" />
            <button aria-label="Показать всю карту" onClick={camera.reset}>
              <Maximize size={16} />
            </button>
          </div>
          {journey && (
            <div className="voyage-hud" data-map-control>
              <span className="voyage-hud-icon">
                <Sailboat size={18} />
              </span>
              <div>
                <span>ПОД ПАРУСАМИ</span>
                <strong>{locationById(journey.destination)!.name}</strong>
                <div className="voyage-progress">
                  <i style={{ width: `${journey.progress * 100}%` }} />
                </div>
              </div>
              <button aria-label="Отменить плавание" onClick={cancelJourney}>
                <X size={16} />
              </button>
            </div>
          )}
          <div className="atlas-bottomline" data-map-control>
            <span>
              <span className="chart-dot" />
              {visited.length} из 5 локаций в журнале
            </span>
            <span>
              Перетащи карту <span>·</span> колесо для масштаба
            </span>
          </div>
        </div>
        <aside className="island-panel" aria-label="Выбранная локация">
          <div className="island-panel-image">
            <Image
              key={selected.image}
              src={selected.image}
              alt={`Берег: ${selected.name}`}
              fill
              sizes="(max-width: 650px) 100vw, 340px"
              loading="eager"
            />
            <div className="island-panel-image-shade" />
            <span className="island-number">
              {selected.number}
              <span>/ EAST BLUE</span>
            </span>
            <span className={`island-status ${currentId === selectedId ? "here" : ""}`}>
              <CircleDot size={10} />
              {currentId === selectedId
                ? "Ты здесь"
                : visited.includes(selectedId)
                  ? "В твоём журнале"
                  : "Новый берег"}
            </span>
          </div>
          <div className="island-panel-copy">
            <span className="eyebrow subdued">
              <SelectedIcon size={12} />
              {typeLabels[selected.kind]}
            </span>
            <h2>{selected.name}</h2>
            <span className="island-subtitle">{selected.subtitle}</span>
            <p className="island-description">{selected.description}</p>
            <div className="island-points">
              <span className="eyebrow subdued">МЕСТА НА БЕРЕГУ</span>
              {selected.points.map((point) => (
                <div key={point.name}>
                  <MapPin size={12} />
                  <span>{point.name}</span>
                </div>
              ))}
            </div>
            {currentId !== selectedId && (
              <div className="route-preview">
                <Route size={15} />
                <span>
                  {current.name}
                  <ChevronRight size={12} />
                  {selected.name}
                  <small>
                    {Math.max(0, previewRoute.length - 1)}{" "}
                    {previewRoute.length === 2 ? "морской переход" : "морских перехода"}
                  </small>
                </span>
              </div>
            )}
            <button
              className="button primary island-action"
              disabled={!!journey || !ready}
              onClick={currentId === selectedId ? () => setSceneOpen(true) : sail}
            >
              {journey ? (
                <Sailboat size={16} />
              ) : currentId === selectedId ? (
                <Compass size={16} />
              ) : (
                <Sailboat size={16} />
              )}
              {journey
                ? "Корабль в пути"
                : currentId === selectedId
                  ? "Исследовать локацию"
                  : "Отправиться сюда"}
              {!journey && <ArrowRight size={15} />}
            </button>
            <span className="island-action-note">
              {currentId === selectedId
                ? "Панорама и точки интереса"
                : "Выбери курс. Поймай попутный ветер."}
            </span>
          </div>
        </aside>
      </div>
      <div className="world-bottom">
        <div className="world-location-list" role="group" aria-label="Локации East Blue">
          {worldLocations.map((location) => (
            <button
              key={location.id}
              aria-label={`Открыть на карте: ${location.name}`}
              aria-pressed={selectedId === location.id}
              className={selectedId === location.id ? "selected" : ""}
              onClick={() => setSelectedId(location.id)}
            >
              <span>{location.number}</span>
              {location.name}
              {visited.includes(location.id) && <Check size={10} />}
            </button>
          ))}
        </div>
        <span className="world-atlas-note">
          Авторская карта <span>✦</span> первая глава
        </span>
      </div>
      <p className="world-status" role="status" aria-live="polite">
        {status || "Пять берегов. Одно море. Твоя история."}
      </p>
      {sceneOpen && (
        <LocationScene key={selected.id} location={selected} onClose={() => setSceneOpen(false)} />
      )}
      {journalOpen && (
        <Modal
          label="Журнал капитана"
          onClose={() => setJournalOpen(false)}
          className="journal-modal"
        >
          <div className="journal-content">
            <span className="eyebrow">
              <BookOpen size={14} />
              CAPTAIN’S LOG
            </span>
            <h2>Море запоминает.</h2>
            <p>Каждый новый берег — ещё одна история в твоём атласе.</p>
            <div className="journal-progress">
              <span>
                {visited.length}
                <small> / 5 берегов</small>
              </span>
              <div>
                <i style={{ width: `${(visited.length / 5) * 100}%` }} />
              </div>
            </div>
            <div className="journal-locations">
              {worldLocations.map((location) => (
                <button
                  key={location.id}
                  aria-label={`Запись журнала: ${location.name}`}
                  onClick={() => {
                    setSelectedId(location.id);
                    setJournalOpen(false);
                  }}
                >
                  <Image src={location.image} alt="" width={75} height={48} />
                  <span>
                    <strong>{location.name}</strong>
                    <small>{location.latinName}</small>
                  </span>
                  {visited.includes(location.id) ? (
                    <Check size={16} />
                  ) : (
                    <span className="journal-unvisited">Ещё впереди</span>
                  )}
                </button>
              ))}
            </div>
            <button
              className="journal-reset"
              onClick={() => {
                resetJourney();
                setJournalOpen(false);
              }}
            >
              Начать демопутешествие заново
              <ArrowRight size={13} />
            </button>
            <span className="journal-note">
              Журнал этого прототипа сохраняется в твоём браузере.
            </span>
          </div>
        </Modal>
      )}
    </div>
  );
}
