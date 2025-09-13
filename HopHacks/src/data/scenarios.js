export const scenarios = {
  "low-sleep-high-aqi": {
    age: 21, sexAtBirth: "male", bmi: 28, famHxHypertension: 1, famHxDiabetes: 0,
    sleepHoursAvg7d: 5.6, lateScreenMinsAvg7d: 95, stepsAvg7d: 2500,
    restingHRTrend14d: "up", hrvTrend14d: "down",
    caffeineMgDay: 280, sedentaryHoursDay: 9, alcoholUnitsWeek: 2, smokingStatus: "none",
    moodTrend14d: "flat",
    aqiDailyMax: 110, waterAdvisoryFlag: false, allergensHighToday: true,
    lateMealsPerWeek: 3
  },
  "balanced": {
    age: 24, sexAtBirth: "female", bmi: 22, famHxHypertension: 0, famHxDiabetes: 0,
    sleepHoursAvg7d: 7.6, lateScreenMinsAvg7d: 20, stepsAvg7d: 8200,
    restingHRTrend14d: "flat", hrvTrend14d: "flat",
    caffeineMgDay: 120, sedentaryHoursDay: 5, alcoholUnitsWeek: 1, smokingStatus: "none",
    moodTrend14d: "up",
    aqiDailyMax: 55, waterAdvisoryFlag: false, allergensHighToday: false,
    lateMealsPerWeek: 0
  },
  "very-sedentary-high-caffeine": {
    age: 35, sexAtBirth: "male", bmi: 31, famHxHypertension: 2, famHxDiabetes: 1,
    sleepHoursAvg7d: 6.4, lateScreenMinsAvg7d: 75, stepsAvg7d: 1800,
    restingHRTrend14d: "up", hrvTrend14d: "down",
    caffeineMgDay: 420, sedentaryHoursDay: 11, alcoholUnitsWeek: 9, smokingStatus: "former",
    moodTrend14d: "down",
    aqiDailyMax: 85, waterAdvisoryFlag: false, allergensHighToday: false,
    lateMealsPerWeek: 4
  }
};
