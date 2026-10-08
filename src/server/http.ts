import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { GameError } from "@/domain/game";
import { getDatabase } from "./database";
import { GameService } from "./game-service";

export const SESSION_COOKIE = "gla_local_session";
export function assertLocalRequest(request: Request) {
  const url = new URL(request.url);
  const requestedHost = new URL(url.protocol + "//" + (request.headers.get("host") ?? url.host))
    .hostname;
  if (!new Set(["localhost", "127.0.0.1", "[::1]"]).has(requestedHost))
    throw new GameError(
      503,
      "LOCAL_PROFILE_ONLY",
      "Облачный вход ещё не настроен. Эта версия работает локально.",
    );
}
export function assertSameOrigin(request: Request) {
  const url = new URL(request.url);
  const expectedOrigin = url.protocol + "//" + (request.headers.get("host") ?? url.host);
  if (request.headers.get("origin") !== expectedOrigin)
    throw new GameError(403, "INVALID_ORIGIN", "Запрос не принадлежит этой игровой сессии.");
}
export async function readBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new GameError(415, "INVALID_CONTENT", "Ожидается игровой запрос в формате JSON.");
  if (Number(request.headers.get("content-length") ?? 0) > 16000)
    throw new GameError(413, "BODY_TOO_LARGE", "Слишком большой запрос.");
  const text = await request.text();
  if (text.length > 16000) throw new GameError(413, "BODY_TOO_LARGE", "Слишком большой запрос.");
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new GameError(400, "INVALID_JSON", "Не удалось прочитать игровой запрос.");
  }
  return schema.parse(value);
}
export function errorResponse(error: unknown) {
  if (error instanceof GameError)
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status, headers: { "Cache-Control": "no-store" } },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: error.issues[0]?.message ?? "Проверь данные запроса.",
        },
      },
      { status: 400 },
    );
  console.error("Game operation failed:", error instanceof Error ? error.message : "Unknown error");
  return NextResponse.json(
    {
      error: { code: "SERVER_ERROR", message: "Не удалось завершить действие. Попробуй ещё раз." },
    },
    { status: 500 },
  );
}
export function gameRoute(
  mutating: boolean,
  handle: (service: GameService, profileId: string, request: NextRequest) => Promise<unknown>,
) {
  return async (request: NextRequest) => {
    try {
      assertLocalRequest(request);
      if (mutating) assertSameOrigin(request);
      const { db } = await getDatabase(),
        service = new GameService(db);
      const profileId = await service.resolveSession(request.cookies.get(SESSION_COOKIE)?.value);
      if (!profileId)
        throw new GameError(401, "SESSION_REQUIRED", "Открой профиль капитана, чтобы продолжить.");
      return NextResponse.json(await handle(service, profileId, request), {
        headers: { "Cache-Control": "private, no-store" },
      });
    } catch (error) {
      return errorResponse(error);
    }
  };
}
