import { deriveDrivers } from "./deriveDrivers";
import { evaluateRules } from "./rules";

export function runRiskEngine(inputs) {
  const drivers = deriveDrivers(inputs);
  const triggers = evaluateRules(drivers);
  return { drivers, triggers };
}
