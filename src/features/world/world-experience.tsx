"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import {
  Anchor,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Layers,
  MapPin,
  Maximize,
  Minus,
  Plus,
  Route,
  Sailboat,
  Search,
  X,
  ExternalLink,
  Info,
} from "lucide-react";
import { Modal } from "@/components/modal";
import {
  atlasPlaces,
  atlasPlaceById,
  atlasRegions,
  atlasSources,
  atlasDetailLevel,
  searchAtlas,
  visibleAtlasPlaces,
  type AtlasPlace,
  type AtlasRegion,
} from "@/content/atlas";
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  EAST_BLUE_BOUNDS,
  locationById,
  worldLocations,
} from "@/content/world";
import { getRoute, routePath, MAX_ZOOM, MIN_ZOOM } from "./navigation";
import { useMapCamera } from "./use-map-camera";
import { LocationScene } from "./location-scene";
import { AtlasChart } from "./atlas-chart";
import { MerryShip } from "./atlas-fleet";
import { expandedAtlasLabels, atlasLabelTop } from "./atlas-labels";
import "./world.css";
import "./atlas.css";

const placementLabels = {
  chart: "По опубликованной карте",
  route: "Положение по маршруту",
  local: "Внутри острова · условная точка",
  reference: "По фанатской карте OP Maps",
  unknown: "Положение неизвестно",
  moving: "Движущееся место",
};
const kindLabels = {
  island: "Остров",
  archipelago: "Архипелаг",
  city: "Город / локация",
  ship: "Корабль",
  sky: "Небесный остров",
  underwater: "Подводный остров",
  continent: "Red Line",
};
const start = worldLocations[0];
type Journey = { destination: string; path: string; progress: number };
export function WorldExperience() {
  const [region, setRegion] = useState<AtlasRegion>("world");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showRoutes, setShowRoutes] = useState(true);
  const [showNames, setShowNames] = useState(true);
  const [showShips, setShowShips] = useState(true);
  const [showReference, setShowReference] = useState(true);
  const [layersOpen, setLayersOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [immersive, setImmersive] = useState(false);
  const [currentId, setCurrentId] = useState(start.id);
  const [visited, setVisited] = useState<string[]>([start.id]);
  const [ready, setReady] = useState(false);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [shipPosition, setShipPosition] = useState(start.port);
  const [status, setStatus] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const shipRef = useRef<SVGGElement>(null);
  const camera = useMapCamera(viewportRef);
  const reducedMotion = useReducedMotion();
  const selected = selectedId ? atlasPlaceById(selectedId) : undefined;
  const current = locationById(currentId)!;
  const scene = selected
    ? locationById(
        selected.scene ??
          (
            {
              dawn: "foosha",
              yotsuba: "shells-town",
              organ: "orange-town",
              conomi: "arlong-park",
              baratie: "baratie",
            } as Record<string, string>
          )[selected.id],
      )
    : undefined;
  const source = atlasSources.find((s) => s.id === selected?.source);
  const relatedPlaces = selected ? atlasPlaces.filter((p) => p.parent === selected.id) : [];
  const results = useMemo(() => searchAtlas(query, region), [query, region]);
  const visible = useMemo(
    () => visibleAtlasPlaces(camera.camera.zoom, showRoutes, showReference),
    [camera.camera.zoom, showRoutes, showReference],
  );
  const level = atlasDetailLevel(camera.camera.zoom);
  const regionInfo = atlasRegions.find((r) => r.id === region)!;
  const changeRegion = (id: AtlasRegion) => {
    setRegion(id);
    setSelectedId(null);
    setQuery("");
    if (id === "world") camera.reset();
    else camera.focusRect(atlasRegions.find((r) => r.id === id)!.bounds);
  };
  const selectPlace = (place: AtlasPlace) => {
    setSelectedId(place.id);
    setRegion(place.region);
    if (
      place.placement === "reference" ||
      atlasPlaceById(place.parent ?? "")?.placement === "reference"
    )
      setShowReference(true);
    if (place.placement === "route") setShowRoutes(true);
    if (place.focusBounds) {
      camera.focusRect(place.focusBounds);
      return;
    }
    if (place.point) {
      const radius = place.parent
        ? Math.max(28, atlasPlaceById(place.parent)?.radius ?? 55)
        : Math.max(28, place.radius ?? 50);
      camera.focusRect({
        x: place.point.x - radius * 3,
        y: place.point.y - radius * 2.5,
        width: radius * 6,
        height: radius * 5,
      });
    }
  };
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("gla.world-prototype.v1") ?? "null");
      const loc = typeof saved?.currentId === "string" ? locationById(saved.currentId) : undefined;
      if (loc) {
        setCurrentId(loc.id);
        setShipPosition(loc.port);
      }
      if (Array.isArray(saved?.visited)) {
        setVisited([
          ...new Set([
            start.id,
            ...saved.visited.filter(
              (id: unknown): id is string => typeof id === "string" && !!locationById(id),
            ),
          ]),
        ]);
      }
    } catch {
      /* Atlas works without storage. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("gla.world-prototype.v1", JSON.stringify({ currentId, visited }));
      } catch {
        /* Memory only. */
      }
  }, [currentId, visited, ready]);
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(""), 5500);
    return () => clearTimeout(timer);
  }, [status]);
  useEffect(() => {
    if (!immersive) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setImmersive(false);
    };
    document.addEventListener("keydown", escape);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", escape);
      document.body.style.overflow = previous;
    };
  }, [immersive]);
  const arrive = useCallback((id: string) => {
    const loc = locationById(id)!;
    setCurrentId(id);
    setShipPosition(loc.port);
    setVisited((v) => (v.includes(id) ? v : [...v, id]));
    setJourney(null);
    setStatus(`Причалили: ${loc.name}.`);
  }, []);
  // Animate the ship directly; the entire SVG geography doesn't rerender at 60 fps.
  useEffect(() => {
    if (!journey?.destination || !routeRef.current) return;
    const path = routeRef.current;
    const length = path.getTotalLength();
    const duration = reducedMotion ? 0 : Math.min(6500, Math.max(2800, length * 5));
    let frame = 0,
      started: number | null = null,
      lastHud = 0;
    const destination = journey.destination;
    const tick = (t: number) => {
      if (started === null) started = t;
      const progress = duration ? Math.min(1, (t - started) / duration) : 1;
      const p = path.getPointAtLength(length * progress);
      shipRef.current?.setAttribute("transform", `translate(${p.x} ${p.y})`);
      if (progress === 1) {
        arrive(destination);
        return;
      }
      if (t - lastHud > 120) {
        setJourney((v) => (v ? { ...v, progress } : null));
        lastHud = t;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [journey?.destination, journey?.path, reducedMotion, arrive]);
  const sail = () => {
    if (!scene || journey || scene.id === currentId) return;
    const route = getRoute(currentId, scene.id);
    if (route.length < 2) return;
    camera.focusRect(EAST_BLUE_BOUNDS);
    setJourney({ destination: scene.id, path: routePath(route), progress: 0 });
    setStatus("");
  };
  const cancel = () => {
    setJourney(null);
    setShipPosition(current.port);
    setStatus("Курс отменён. Корабль остался у причала.");
  };
  const displayed = visible.filter(
    (p) => camera.viewport.width >= 760 || region === "world" || p.region === region,
  );
  const expandedNames = expandedAtlasLabels(displayed, camera.scale, selectedId);
  return (
    <div
      className={`world-experience atlas-experience atlas-v2 ${immersive ? "atlas-immersive" : ""}`}
    >
      <header className="atlas-page-heading">
        <div>
          <span className="eyebrow">
            <span className="little-diamond" />
            THE CARTOGRAPHER’S COLLECTION
          </span>
          <h1>
            За край горизонта.<span>Морской атлас One Piece</span>
          </h1>
        </div>
        <div className="atlas-heading-actions">
          <button onClick={() => setSourcesOpen(true)}>
            <BookOpen size={15} />
            Об атласе
          </button>
          <button onClick={() => setJournalOpen(true)}>
            <Anchor size={15} />
            <span>Журнал</span>
            <small>{visited.length}/5</small>
          </button>
        </div>
      </header>
      <nav className="atlas-region-tabs" aria-label="Моря и регионы">
        {atlasRegions.map((r) => (
          <button
            key={r.id}
            aria-pressed={r.id === region}
            disabled={!!journey}
            onClick={() => changeRegion(r.id)}
          >
            {r.id === "world" && <Compass size={14} />} {r.name}
            {r.id === "east-blue" && <span className="region-dot" />}
          </button>
        ))}
      </nav>
      <div className="atlas-workbench">
        <aside className="atlas-library" aria-label="Указатель атласа">
          <div className="atlas-library-header">
            <span>УКАЗАТЕЛЬ МЕСТ</span>
            <small>{results.length.toString().padStart(2, "0")}</small>
          </div>
          <label className="atlas-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedId(null);
              }}
              placeholder="Остров, город, море…"
              aria-label="Поиск по атласу"
            />
            {query && (
              <button aria-label="Очистить поиск" onClick={() => setQuery("")}>
                <X size={13} />
              </button>
            )}
          </label>
          {selected ? (
            <div className="atlas-place-detail" aria-label="Выбранное место">
              <button className="atlas-back" onClick={() => setSelectedId(null)}>
                <ArrowLeft size={12} />К указателю
              </button>
              {scene ? (
                <div className="atlas-place-image">
                  <Image
                    src={scene.image}
                    alt={`Берег: ${selected.name}`}
                    width={400}
                    height={240}
                  />
                  <span>{kindLabels[selected.kind]}</span>
                </div>
              ) : (
                <div className={`atlas-place-seal seal-${selected.kind}`}>
                  <Compass size={44} strokeWidth={0.7} />
                  <span>{selected.english}</span>
                </div>
              )}
              <span className="atlas-detail-region">
                {atlasRegions.find((r) => r.id === selected.region)!.name} /{" "}
                {kindLabels[selected.kind]}
              </span>
              <h2>{selected.name}</h2>
              <span className="atlas-detail-english">{selected.english}</span>
              <p>{selected.description}</p>
              {selected.note && <p className="atlas-place-note">{selected.note}</p>}
              {selected.parent && (
                <button
                  className="atlas-parent"
                  onClick={() => selectPlace(atlasPlaceById(selected.parent!)!)}
                >
                  <MapPin size={12} />
                  {atlasPlaceById(selected.parent)?.name}
                  <ArrowRight size={12} />
                </button>
              )}
              <div className={`atlas-placement placement-${selected.placement}`}>
                <Info size={13} />
                <div>
                  <strong>{placementLabels[selected.placement]}</strong>
                  <span>
                    {selected.placement === "chart"
                      ? "Сохранено взаимное положение. Масштаб и контуры иллюстративные."
                      : selected.placement === "route"
                        ? "Каноничный маршрут; расстояния и точка в мировой проекции условны."
                        : selected.placement === "local"
                          ? "Место относится к этому острову. Локальная точка привязана к нашей иллюстрации, а не к каноническим координатам."
                          : selected.placement === "reference"
                            ? "Положение перенесено из OP Maps в нашу проекцию. Это фанатская реконструкция; официальных координат она не подтверждает."
                            : "Место есть в каноне. Случайную метку на карте не ставим."}
                  </span>
                </div>
              </div>
              <button className="atlas-source-link" onClick={() => setSourcesOpen(true)}>
                <BookOpen size={12} />
                {source?.title}
                <ArrowRight size={12} />
              </button>
              {scene && (
                <>
                  <button
                    className="atlas-visit"
                    disabled={!!journey}
                    onClick={() => (currentId === scene.id ? setSceneId(scene.id) : sail())}
                  >
                    {currentId === scene.id ? <MapPin size={15} /> : <Sailboat size={15} />}{" "}
                    {journey
                      ? "Корабль в пути"
                      : currentId === scene.id
                        ? "Исследовать берег"
                        : "Проложить курс"}
                    <ArrowRight size={14} />
                  </button>
                  <small className="atlas-visit-note">
                    {currentId === scene.id
                      ? "Панорама и места на берегу"
                      : "Плавание в главе East Blue"}
                  </small>
                </>
              )}
              {!selected.point && (
                <button
                  className="atlas-region-link"
                  onClick={() => camera.focusRect(regionInfo.bounds)}
                >
                  Показать море
                  <ArrowRight size={13} />
                </button>
              )}
              {relatedPlaces.length > 0 && (
                <div className="atlas-related">
                  <span>МЕСТА В РЕГИОНЕ</span>
                  {relatedPlaces.map((p) => (
                    <button key={p.id} onClick={() => selectPlace(p)}>
                      <MapPin size={12} />
                      {p.name}
                      <ChevronArrow />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="atlas-index-results">
              <div className="atlas-index-note">
                {query
                  ? "Результаты поиска"
                  : region === "world"
                    ? "Места из манги и опубликованных карт"
                    : "Избранная глава морского атласа"}
              </div>
              <div className="atlas-place-list">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPlace(p)}
                    className={p.point ? "" : "unplaced"}
                  >
                    <span className={`atlas-index-mark mark-${p.placement}`}>
                      {p.point ? <MapPin size={12} /> : <Compass size={12} />}
                    </span>
                    <span>
                      <strong>{p.name}</strong>
                      <small>{p.english}</small>
                    </span>
                    {p.parent ? (
                      <span className="index-subplace">↳</span>
                    ) : (
                      <ArrowRight size={12} />
                    )}
                  </button>
                ))}
                {!results.length && (
                  <p className="atlas-no-results">
                    Такого места в указателе пока нет. Попробуй русское или английское название.
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="atlas-library-foot">
            <span className="chart-dot" /> {atlasPlaces.length} мест · с указанием источников
          </div>
        </aside>
        <div className="atlas-map-column">
          <div className="atlas-frame">
            <div className="atlas-map-caption" data-map-control>
              <Compass size={16} />
              <div>
                <strong>
                  {region === "world" ? "THE FOUR SEAS" : regionInfo.name.toUpperCase()}
                </strong>
                <span>{regionInfo.subtitle}</span>
              </div>
            </div>
            <div className="atlas-map-tools" data-map-control>
              <button
                aria-label="Слои карты"
                aria-expanded={layersOpen}
                onClick={() => setLayersOpen(!layersOpen)}
              >
                <Layers size={17} />
              </button>
              <button
                aria-label={immersive ? "Выйти из полного экрана" : "Развернуть атлас"}
                onClick={() => setImmersive(!immersive)}
              >
                {immersive ? <X size={17} /> : <Maximize size={17} />}
              </button>
            </div>
            {layersOpen && (
              <div className="atlas-layer-menu" data-map-control>
                <strong>Слои атласа</strong>
                <label>
                  <input
                    type="checkbox"
                    checked={showNames}
                    onChange={(e) => setShowNames(e.target.checked)}
                  />
                  Названия мест
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={showRoutes}
                    onChange={(e) => setShowRoutes(e.target.checked)}
                  />
                  Схемы маршрутов Grand Line
                </label>
                <p>Метки неизвестных и движущихся мест доступны в указателе.</p>
                <label>
                  <input
                    type="checkbox"
                    checked={showReference}
                    onChange={(e) => setShowReference(e.target.checked)}
                  />
                  Дополнения по OP Maps
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={showShips}
                    onChange={(e) => setShowShips(e.target.checked)}
                  />
                  Корабли One Piece
                </label>
              </div>
            )}
            <div
              ref={viewportRef}
              className={`map-viewport ${camera.dragging ? "is-dragging" : ""}`}
              tabIndex={0}
              role="region"
              aria-label="Интерактивный морской атлас. Стрелки перемещают карту; плюс, минус — масштаб; Home — весь мир."
              {...camera.controls}
              onKeyDown={(e) => {
                camera.controls.onKeyDown(e);
                if (e.key === "Home" && e.target === e.currentTarget) {
                  setRegion("world");
                  setSelectedId(null);
                }
              }}
            >
              <div
                className="world-plane"
                style={
                  {
                    width: WORLD_WIDTH,
                    height: WORLD_HEIGHT,
                    opacity: camera.measured ? 1 : 0,
                    transform: `translate(calc(-50% + ${camera.camera.x}px), calc(-50% + ${camera.camera.y}px)) scale(${camera.scale})`,
                    "--map-scale": camera.scale,
                    "--label-scale": Math.min(3, 1 / camera.scale),
                  } as CSSProperties
                }
              >
                <AtlasChart
                  motion={!reducedMotion}
                  zoom={camera.camera.zoom}
                  showRoutes={showRoutes}
                  showShips={showShips}
                  showReference={showReference}
                  sailing={!!journey}
                />
                {showNames &&
                  displayed.map((p) => (
                    <button
                      key={p.id}
                      data-map-control
                      className={`atlas-place-label ${p.parent ? "subplace-label" : ""} ${p.placement === "route" ? "route-label" : ""} ${p.placement === "reference" ? "reference-label" : ""} ${!expandedNames.has(p.id) ? "compact-map-label" : ""} ${selectedId === p.id ? "is-selected" : ""} ${p.id === "baratie" ? "ship-label" : ""}`}
                      style={
                        {
                          left: p.point!.x,
                          top: expandedNames.has(p.id) ? atlasLabelTop(p) : p.point!.y,
                        } as CSSProperties
                      }
                      aria-label={`Найти на карте: ${p.name}`}
                      title={p.name}
                      aria-pressed={p.id === selectedId}
                      onClick={() => selectPlace(p)}
                    >
                      <span className="atlas-label-rule" />
                      <strong>{p.english}</strong>
                      {level >= 1 && !p.parent && <small>{p.name}</small>}
                      {p.placement === "route" && (
                        <span className="route-position-dot" title="Схематическое положение" />
                      )}
                      {p.placement === "reference" && (
                        <span
                          className="reference-position-dot"
                          title="Привязка к фанатскому атласу"
                        />
                      )}
                    </button>
                  ))}
                {level === 0 && (
                  <>
                    {[
                      { id: "east-blue", x: 1800, y: 178 },
                      { id: "paradise", x: 1730, y: 903 },
                      { id: "new-world", x: 640, y: 903 },
                      { id: "north-blue", x: 520, y: 239 },
                      { id: "west-blue", x: 540, y: 1140 },
                      { id: "south-blue", x: 1830, y: 1265 },
                    ].map((r) => (
                      <button
                        key={r.id}
                        className="atlas-region-portal"
                        style={{ left: r.x, top: r.y }}
                        aria-label={`Исследовать ${atlasRegions.find((a) => a.id === r.id)!.name}`}
                        onClick={() => changeRegion(r.id as AtlasRegion)}
                      >
                        Исследовать
                        <ArrowRight size={11} />
                      </button>
                    ))}
                  </>
                )}
                <svg
                  className="world-routes atlas-player-route"
                  viewBox="0 0 2400 1600"
                  aria-hidden="true"
                >
                  {journey && (
                    <path ref={routeRef} d={journey.path} className="planned-route is-sailing" />
                  )}
                  {level >= 1 && journey && (
                    <g ref={shipRef} transform={`translate(${shipPosition.x} ${shipPosition.y})`}>
                      <MerryShip size={0.7} />
                      <circle cy="19" r="5" className="player-ship-dot" />
                    </g>
                  )}
                </svg>
              </div>
            </div>
            <div className="atlas-map-legend" data-map-control>
              <span>
                <i className="legend-chart" />
                Опубликованная карта
              </span>
              <span>
                <i className="legend-route" />
                Схема маршрута
              </span>
              {showReference && (
                <span>
                  <i className="legend-reference" />
                  OP Maps
                </span>
              )}
            </div>
            <div className="map-zoom-controls" data-map-control>
              <button
                aria-label="Приблизить карту"
                disabled={camera.camera.zoom >= MAX_ZOOM - 0.01}
                onClick={() => camera.zoomBy(1.35)}
              >
                <Plus size={17} />
              </button>
              <span>{Math.round(camera.camera.zoom * 100)}%</span>
              <button
                aria-label="Отдалить карту"
                disabled={camera.camera.zoom <= MIN_ZOOM + 0.01}
                onClick={() => camera.zoomBy(1 / 1.35)}
              >
                <Minus size={17} />
              </button>
              <span className="zoom-divider" />
              <button aria-label="Показать всю карту" onClick={() => changeRegion("world")}>
                <Compass size={17} />
              </button>
            </div>
            {journey && (
              <div className="voyage-hud" data-map-control>
                <Sailboat size={18} />
                <div>
                  <span>ПОД ПАРУСАМИ</span>
                  <strong>{locationById(journey.destination)!.name}</strong>
                  <div className="voyage-progress">
                    <i style={{ width: `${journey.progress * 100}%` }} />
                  </div>
                </div>
                <button aria-label="Отменить плавание" onClick={cancel}>
                  <X size={15} />
                </button>
              </div>
            )}
          </div>
          <div className="atlas-map-footer">
            <span>
              <span className="chart-dot" />
              {["Обзор океанов", "Острова и архипелаги", "Малые острова и места на берегу"][level]}
            </span>
            <span>Перетащи карту · колесо для масштаба</span>
          </div>
        </div>
      </div>
      <div className="atlas-bottom-note">
        <span>Каноничные места. Источники открыты. Неизвестные берега остаются неизвестными.</span>
        <button onClick={() => setSourcesOpen(true)}>
          Как читать эту карту
          <ArrowRight size={12} />
        </button>
      </div>
      <p className="world-status" role="status" aria-live="polite">
        {status}
      </p>
      {sceneId && (
        <LocationScene
          key={sceneId}
          location={locationById(sceneId)!}
          onClose={() => setSceneId(null)}
        />
      )}
      {sourcesOpen && (
        <Modal
          label="Источники и точность атласа"
          onClose={() => setSourcesOpen(false)}
          className="atlas-sources-modal"
        >
          <div className="atlas-sources">
            <span className="eyebrow">
              <BookOpen size={14} />
              CHARTER OF THE ATLAS
            </span>
            <h2>
              Где заканчивается карта,
              <br />
              начинается приключение.
            </h2>
            <p>
              У мира One Piece нет опубликованного набора точных координат всех островов. Этот атлас
              сохраняет подтверждённые регионы, связи и взаимное положение там, где они показаны.
              Контуры, рельеф и масштаб — наша иллюстрация.
            </p>
            <p>
              Каталог расширен по OP Maps: сравнили 84 островных маркера и 23 места интереса.
              Дополнительные позиции помечены отдельно и отключаются слоем «Дополнения по OP Maps».
              Имена из манги и фанатские мировые точки — разные сведения. Молочный остров объединён
              с Сырным, а Winter Island — с Winner Island; движущиеся Зоу и Джерма остаются без
              фиксированных координат.
            </p>
            <div className="atlas-accuracy-key">
              <div>
                <i className="legend-chart" />
                <strong>Опубликованная карта</strong>
                <span>
                  Основные ориентиры East Blue по Color Walk и эскизу Оды. Это привязка к
                  иллюстрации, а не реальные широты.
                </span>
              </div>
              <div>
                <i className="legend-route" />
                <strong>Схема маршрута</strong>
                <span>
                  Grand Line: порядок и связи каноничны; расстояния и мировые точки приблизительны.
                  Этот слой можно отключить.
                </span>
              </div>
              <div>
                <Compass size={15} />
                <strong>Без точки</strong>
                <span>
                  Неизвестные координаты, исчезнувшие и движущиеся места остаются в указателе.
                </span>
              </div>
            </div>
            <p className="atlas-accuracy-footnote">
              Детализация архипелагов — иллюстративные контуры островков внутри подтверждённого
              региона. Их количество, форма и локальные отступы не заявлены как точная каноническая
              съёмка. Онигасима показана в состоянии до рейда. Плавания «Гоинг Мерри», «Таузенд
              Санни» и корабля Гарпа оживляют иллюстрацию: их маршруты не обозначают текущее
              местоположение команд в сюжете.
            </p>
            <div className="atlas-sources-list">
              {atlasSources.map((s) => (
                <article key={s.id}>
                  <span>{s.id.toUpperCase()}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <small>{s.publication}</small>
                    <p>{s.note}</p>
                    <a href={s.url} target="_blank" rel="noreferrer">
                      Издание / официальный источник
                      <ExternalLink size={12} />
                    </a>
                    <a href={s.reference} target="_blank" rel="noreferrer">
                      Посмотреть референс
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Modal>
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
              {worldLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    selectPlace(atlasPlaceById(loc.id)!);
                    setJournalOpen(false);
                  }}
                >
                  <Image src={loc.image} alt="" width={75} height={48} />
                  <span>
                    <strong>{loc.name}</strong>
                    <small>{loc.latinName}</small>
                  </span>
                  {visited.includes(loc.id) ? (
                    <Check size={16} />
                  ) : (
                    <span className="journal-unvisited">Ещё впереди</span>
                  )}
                </button>
              ))}
            </div>
            <span className="journal-note">Журнал путешествия сохраняется в твоём браузере.</span>
          </div>
        </Modal>
      )}
    </div>
  );
}
function ChevronArrow() {
  return <ArrowRight size={11} />;
}
