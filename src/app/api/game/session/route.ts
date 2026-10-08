import { NextRequest, NextResponse } from "next/server";
import { assertLocalRequest, assertSameOrigin, errorResponse, SESSION_COOKIE } from "@/server/http";
import { getDatabase } from "@/server/database";
import { GameService } from "@/server/game-service";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    assertLocalRequest(request);
    assertSameOrigin(request);
    const { db } = await getDatabase(),
      service = new GameService(db);
    let token = request.cookies.get(SESSION_COOKIE)?.value;
    let profileId = await service.resolveSession(token);
    if (!profileId) {
      const created = await service.createProfile();
      profileId = created.profileId;
      token = created.token;
    } else if (token) await service.renewSession(token);
    const response = NextResponse.json(
      { snapshot: await service.getSnapshot(profileId) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
    if (token)
      response.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: new URL(request.url).protocol === "https:",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
