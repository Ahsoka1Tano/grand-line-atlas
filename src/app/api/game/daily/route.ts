import { z } from "zod";
import { gameRoute, readBody } from "@/server/http";
export const runtime = "nodejs";
export const POST = gameRoute(true, async (service, profileId, request) => {
  await readBody(request, z.object({}).strict());
  const claimed = await service.claimDaily(profileId);
  return { claimed, snapshot: await service.getSnapshot(profileId) };
});
