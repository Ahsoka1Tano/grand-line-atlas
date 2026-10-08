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
