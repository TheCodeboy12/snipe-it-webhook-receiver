import { z } from "zod";

export const webhookUpdateSchema = z.strictObject({
  text: z.string(),
  attachments: z.array(
    z.object({
      fields: z.array(
        z.object({ 
          title: z.string(),
          value: z.string(),
          short: z.boolean()
        }),
      ),
      text: z.string(),
      title: z.string(),
      title_link: z.url(),
    }),
  ),
  channel: z.string(),
  username: z.string(),
});
