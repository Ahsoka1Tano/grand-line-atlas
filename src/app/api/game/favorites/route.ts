import { z } from "zod";
import { gameRoute, readBody } from "@/server/http";
export const runtime = "nodejs";
const input = z.object({ editionId: z.string().min(1).max(40), enabled: z.boolean() }).strict();
export const POST = gameRoute(true, async (service, profileId, request) => {
  const { editionId, enabled } = await readBody(request, input);
  await service.setFavorite(profileId, editionId, enabled);
  return { snapshot: await service.getSnapshot(profileId) };
});
