import { z } from "zod";
import { gameRoute, readBody } from "@/server/http";
export const runtime = "nodejs";
const input = z.object({ requestKey: z.uuid() }).strict();
export const POST = gameRoute(true, async (service, profileId, request) => {
  const { requestKey } = await readBody(request, input);
  const opening = await service.openBox(profileId, requestKey);
  return { opening, snapshot: await service.getSnapshot(profileId) };
});
