// REPLACE the previous serializer with this async version
import { refineWithGemini } from "./geminiRefiner";
import { partitionPayload } from "./partition"; // to provide extremes context (optional)

export async function toAppJsonAsync(engineOutput, palette = "soft_pastel", existingPayloadForContext = null) {
  // Optional: pass extremes/todos context to the LLM to help it prioritize
  const context = existingPayloadForContext
    ? partitionPayload(existingPayloadForContext)
    : { extremes: [], suggestions: [] };

  const cards = await refineWithGemini(
    { triggers: engineOutput.triggers, extremes: context.extremes, todos: [] },
    palette
  );

  return {
    meta: { version: "1.0", palette, disclaimer: "Wellness insights only; not medical advice." },
    drivers: engineOutput.drivers,
    cards
  };
}
