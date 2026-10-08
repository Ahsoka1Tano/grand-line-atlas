import { z } from "zod";
import { gameRoute, readBody } from "@/server/http";
export const runtime = "nodejs";
const input = z
  .object({
    revision: z.number().int().min(0),
    slots: z
      .array(
        z
          .object({
            position: z.number().int().min(0).max(4),
            instanceId: z.uuid(),
            battle: z.boolean(),
          })
          .strict(),
      )
      .min(3)
      .max(5),
  })
  .strict();
export const PUT = gameRoute(true, async (service, profileId, request) => {
  const { revision, slots } = await readBody(request, input);
  await service.saveCrew(profileId, revision, slots);
  return { snapshot: await service.getSnapshot(profileId) };
});
