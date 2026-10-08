import { gameRoute } from "@/server/http";
export const runtime = "nodejs";
export const GET = gameRoute(false, async (service, profileId) => ({
  snapshot: await service.getSnapshot(profileId),
}));
