import { refineToCards } from "./mockRefiner";

export function toAppJson(engineOutput, paletteName = "soft_pastel") {
  const cards = refineToCards(engineOutput.triggers);
  return {
    meta: { version: "1.0", palette: paletteName, disclaimer: "Wellness insights only; not medical advice." },
    drivers: engineOutput.drivers,
    cards
  };
}
