import { z } from "zod";
import { gameRoute, readBody } from "@/server/http";
export const runtime = "nodejs";
const input = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Имя должно содержать хотя бы два символа.")
      .max(24, "Не больше 24 символов.")
      .regex(/^[\p{L}\p{N} _.\-]+$/u, "Используй буквы, цифры, пробелы, точки или дефис."),
  })
  .strict();
export const PATCH = gameRoute(true, async (service, profileId, request) => {
  const { name } = await readBody(request, input);
  await service.renameProfile(profileId, name);
  return { snapshot: await service.getSnapshot(profileId) };
});
