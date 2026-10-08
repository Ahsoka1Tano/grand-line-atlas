import assert from "node:assert/strict";
import { before, test } from "node:test";
import { randomUUID } from "node:crypto";

const base = process.env.GAME_TEST_URL ?? "http://127.0.0.1:3000";
let cookie = "",
  profileId = "";
async function call(path, { method = "GET", body, cookieValue = cookie, origin = base } = {}) {
  const response = await fetch(base + "/api/game/" + path, {
    method,
    headers: {
      ...(cookieValue ? { cookie: cookieValue } : {}),
      ...(method !== "GET" ? { "content-type": "application/json", origin } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { response, data: await response.json() };
}
before(async () => {
  const { response, data } = await call("session", { method: "POST", body: {}, cookieValue: "" });
  assert.equal(response.status, 200);
  const header = response.headers.get("set-cookie") ?? "";
  assert.ok(/HttpOnly/i.test(header));
  assert.ok(/SameSite=Lax/i.test(header));
  cookie = header.split(";")[0];
  profileId = data.snapshot.profile.id;
});
test("private snapshots need a valid session and writes need the same origin", async () => {
  assert.equal((await call("state", { cookieValue: "" })).response.status, 401);
  assert.equal(
    (await call("daily", { method: "POST", body: {}, origin: "https://foreign.example" })).response
      .status,
    403,
  );
  const valid = await call("state");
  assert.equal(valid.response.status, 200);
  assert.equal(valid.data.snapshot.profile.id, profileId);
  assert.match(valid.response.headers.get("cache-control") ?? "", /no-store/);
});
test("box API is idempotent, rejects forged pricing, and returns saved instances", async () => {
  const requestKey = randomUUID();
  const first = await call("boxes", { method: "POST", body: { requestKey } });
  const repeat = await call("boxes", { method: "POST", body: { requestKey } });
  assert.equal(first.response.status, 200);
  assert.equal(first.data.opening.cost, 0);
  assert.equal(repeat.data.opening.id, first.data.opening.id);
  assert.equal(repeat.data.snapshot.instances.length, 8);
  const forged = await call("boxes", {
    method: "POST",
    body: { requestKey: randomUUID(), price: -1000 },
  });
  assert.equal(forged.response.status, 400);
  const paid = await call("boxes", { method: "POST", body: { requestKey: randomUUID() } });
  assert.equal(paid.response.status, 200);
  assert.equal(paid.data.opening.cost, 250);
  assert.equal(paid.data.snapshot.wallet.berries, 750);
  assert.equal(paid.data.snapshot.instances.length, 11);
});
test("daily API can grant the reward only once", async () => {
  const first = await call("daily", { method: "POST", body: {} }),
    repeat = await call("daily", { method: "POST", body: {} });
  assert.equal(first.response.status, 200);
  assert.equal(first.data.claimed, true);
  assert.equal(repeat.data.claimed, false);
  assert.equal(repeat.data.snapshot.wallet.berries, 1000);
});
test("client payload cannot select a different profile", async () => {
  const response = await call("profile", {
    method: "PATCH",
    body: { name: "HTTP капитан", profileId: randomUUID() },
  });
  assert.equal(response.response.status, 400);
  const name = await call("profile", { method: "PATCH", body: { name: "HTTP капитан" } });
  assert.equal(name.response.status, 200);
  assert.equal(name.data.snapshot.profile.id, profileId);
});
