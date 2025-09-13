const targetSleep = 8;
const coerceTrend = (t) => (t === "up" || t === "down" || t === "flat" ? t : "unknown");

export function deriveDrivers(x) {
  const sleepDebtHours = Math.max(0, targetSleep - x.sleepHoursAvg7d);
  return {
    sleepDebtHours,
    lateScreenMins: x.lateScreenMinsAvg7d,
    avgSteps7d: x.stepsAvg7d,
    caffeineLoadMg: x.caffeineMgDay,
    restingHRTrend: x.restingHRTrend14d,
    hrvTrend: coerceTrend(x.hrvTrend14d),
    aqiLevel: x.aqiDailyMax,
    sedentaryHours: x.sedentaryHoursDay,
    circadianShiftMins: 0,
    alcoholUnitsWeek: x.alcoholUnitsWeek ?? 0,
    smokingStatus: x.smokingStatus ?? "none",
    bmi: x.bmi,
    moodTrend: coerceTrend(x.moodTrend14d),
    waterAdvisoryFlag: x.waterAdvisoryFlag,
    allergensHighToday: x.allergensHighToday ?? false,
    lateMealsPerWeek: x.lateMealsPerWeek ?? 0,
    famHxHypertension: x.famHxHypertension,
    famHxDiabetes: x.famHxDiabetes,
    age: x.age,
    sexAtBirth: x.sexAtBirth
  };
}
