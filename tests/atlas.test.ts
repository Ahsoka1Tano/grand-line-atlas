import assert from "node:assert/strict";
import test from "node:test";
import {
  atlasPlaces,
  atlasSources,
  atlasPlaceById,
  visibleAtlasPlaces,
  searchAtlas,
} from "../src/content/atlas";
import { worldLocations } from "../src/content/world";
import reference from "../src/content/atlas-reference.json";
import { expandedAtlasLabels } from "../src/features/world/atlas-labels";
import {
  getRoute,
  routePath,
  zoomCamera,
  MAX_ZOOM,
  resizeCamera,
  fitScale,
} from "../src/features/world/navigation";

test("atlas references stay consistent and unknown places never acquire invented pins", () => {
  assert.equal(new Set(atlasPlaces.map((p) => p.id)).size, atlasPlaces.length);
  for (const p of atlasPlaces) {
    assert.ok(
      atlasSources.some((s) => s.id === p.source),
      p.id,
    );
    if (p.parent) assert.ok(atlasPlaceById(p.parent), p.id);
    if (p.placement === "unknown" || p.placement === "moving")
      assert.equal(p.point, undefined, p.id);
    if (p.point) {
      assert.ok(p.point.x >= 0 && p.point.x <= 2400);
      assert.ok(p.point.y >= 0 && p.point.y <= 1600);
    }
  }
  for (const id of ["laugh-tale", "zou", "germa", "thriller-bark"]) {
    assert.ok(atlasPlaceById(id));
    assert.ok(!visibleAtlasPlaces(MAX_ZOOM).some((p) => p.id === id));
  }
});

test("zoom reveals smaller locations without displacing the islands", () => {
  const overview = visibleAtlasPlaces(1);
  const regional = visibleAtlasPlaces(3);
  const detailed = visibleAtlasPlaces(8);
  assert.ok(overview.length < regional.length && regional.length < detailed.length);
  assert.ok(!overview.some((p) => p.id === "goat"));
  assert.ok(detailed.some((p) => p.id === "goat"));
  assert.ok(detailed.some((p) => p.id === "foosha"));
  for (const p of overview) assert.deepEqual(detailed.find((v) => v.id === p.id)?.point, p.point);
  assert.ok(visibleAtlasPlaces(8, false).every((p) => p.placement !== "route"));
});

test("search finds unplaced canon locations and keeps sea filters", () => {
  assert.equal(searchAtlas(" Laugh Tale ")[0]?.id, "laugh-tale");
  assert.equal(searchAtlas("Фуша")[0]?.id, "foosha");
  assert.equal(searchAtlas("Ohara", "east-blue").length, 0);
  assert.equal(searchAtlas("Ohara", "west-blue")[0]?.id, "ohara");
});

test("playable harbors match the atlas and every voyage has a valid return", () => {
  for (const a of worldLocations) {
    assert.deepEqual(atlasPlaceById(a.id)?.point, { x: a.x, y: a.y }, a.id);
    for (const b of worldLocations) {
      const route = getRoute(a.id, b.id);
      assert.equal(route[0], a.id);
      assert.equal(route.at(-1), b.id);
      assert.ok(routePath(route).startsWith(`M ${a.port.x} ${a.port.y}`));
      assert.ok(!routePath(route).includes("NaN"));
    }
  }
  assert.deepEqual(getRoute("missing", "foosha"), []);
});

test("anchored zoom round trip preserves the position and respects the maximum", () => {
  const viewport = { width: 1000, height: 640 };
  const camera = { zoom: 3, x: 100, y: -80 };
  const anchor = { x: 650, y: 280 };
  const zoomed = zoomCamera(camera, viewport, 6, anchor);
  assert.deepEqual(zoomCamera(zoomed, viewport, 3, anchor), camera);
  assert.equal(zoomCamera(camera, viewport, 500).zoom, MAX_ZOOM);
});

test("desktop to phone resize keeps the same world center instead of sliding to the chart edge", () => {
  const desktop = { width: 1000, height: 630 };
  const phone = { width: 343, height: 503 };
  const camera = { zoom: 3, x: -800, y: 300 };
  const resized = resizeCamera(camera, desktop, phone);
  assert.equal(resized.zoom, camera.zoom);
  assert.ok(Math.abs(resized.x / fitScale(phone) - camera.x / fitScale(desktop)) < 0.001);
  assert.ok(Math.abs(resized.y / fitScale(phone) - camera.y / fitScale(desktop)) < 0.001);
});

test("every observed OP Maps island and point is covered, including aliases and moving places", () => {
  const normalized = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const row of reference.rows) {
    assert.ok(
      atlasPlaces.some((p) =>
        [p.english, p.reference, ...(p.aliases ?? [])]
          .filter(Boolean)
          .some((name) => normalized(name!) === normalized(row.name)),
      ),
      row.name,
    );
  }
  assert.equal(reference.rows.length, 107);
});

test("Totto Land has 35 distinct islands and corrected labels do not invent duplicate land", () => {
  const islands = atlasPlaces.filter((p) => p.parent === "totto-land");
  assert.equal(islands.length, 35);
  assert.ok(islands.some((p) => p.id === "whole-cake"));
  assert.equal(searchAtlas("Milk Island")[0]?.id, "cheese");
  assert.equal(searchAtlas("Winter Island")[0]?.id, "winner");
  assert.ok(!atlasPlaceById("milk") && !atlasPlaceById("winter"));
  assert.equal(atlasPlaceById("whisky-peak")?.parent, "cactus");
});

test("reference layer is explicit and hiding it also hides dependent settlement points", () => {
  const visible = visibleAtlasPlaces(14, false, false);
  assert.ok(!visible.some((p) => p.placement === "reference"));
  assert.ok(!visible.some((p) => p.id === "harahettania"));
  assert.ok(visible.some((p) => p.id === "foosha"));
  for (const p of atlasPlaces.filter((p) => p.placement === "reference")) {
    assert.equal(p.source, "opmaps");
    assert.ok(
      reference.rows.some((row) => row.name === p.reference),
      p.id,
    );
  }
});

test("crowded names collapse while the selected location always gets its full label", () => {
  const first = atlasPlaceById("candy")!;
  const second = { ...atlasPlaceById("cheese")!, point: first.point };
  const names = expandedAtlasLabels([first, second], 1, second.id);
  assert.ok(names.has(second.id));
  assert.ok(!names.has(first.id));
  assert.equal(
    expandedAtlasLabels([first, { ...second, point: { x: 2000, y: 1200 } }], 1, null).size,
    2,
  );
});
