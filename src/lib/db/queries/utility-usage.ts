import { eq } from "drizzle-orm";

import { db } from "~/lib/db";
import { models } from "~/lib/db/schema/models";
import { utilityUsage } from "~/lib/db/schema/usage";

export type UtilityUsageType = "title" | "icon" | "metadata" | "tags" | "handoff";

export async function logUtilityUsage(
  userId: string,
  type: UtilityUsageType,
  model: string,
  usage: { inputTokens?: number; outputTokens?: number },
): Promise<void> {
  const inputTokens = usage.inputTokens ?? 0;
  const outputTokens = usage.outputTokens ?? 0;

  let costTotalUsd = "0";

  const [pricing] = await db
    .select({
      pricingPrompt: models.pricingPrompt,
      pricingCompletion: models.pricingCompletion,
    })
    .from(models)
    .where(eq(models.modelId, model))
    .limit(1);

  if (pricing?.pricingPrompt != null && pricing?.pricingCompletion != null) {
    const promptCost = inputTokens * pricing.pricingPrompt;
    const completionCost = outputTokens * pricing.pricingCompletion;
    costTotalUsd = (promptCost + completionCost).toString();
  }

  await db.insert(utilityUsage).values({
    userId,
    type,
    model,
    inputTokens,
    outputTokens,
    costTotalUsd,
  });
}
