import { z } from "zod";

export const webhookTestSchema = z.strictObject({
  channel: z.string(),
  text: z.string(),
  username: z.string(),
  icon_emoji: z.string(),
});
