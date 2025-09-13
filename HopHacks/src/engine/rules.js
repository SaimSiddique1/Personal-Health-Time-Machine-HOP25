const over = (v, th) => v >= th;
const between = (v, a, b) => v >= a && v < b;

export function evaluateRules(d) {
  const out = [];
  const call = {
    sleep: () => `Sleep debt ${d.sleepDebtHours.toFixed(1)}h`,
    lateScreen: () => `Late screen ${d.lateScreenMins}m`,
    steps: () => `Steps ${d.avgSteps7d} (goal 7–10k)`,
    caffeine: () => `Caffeine ${d.caffeineLoadMg}mg`,
    aqi: () => `AQI ${d.aqiLevel}`,
    rhr: () => `RHR trend ${d.restingHRTrend}`,
    bmi: () => `BMI ${d.bmi.toFixed(1)}`,
    sedentary: () => `Sedentary ${d.sedentaryHours}h`,
    alcohol: () => `Alcohol ${d.alcoholUnitsWeek}/wk`
  };

  if (over(d.sleepDebtHours, 1.5) || (d.lateScreenMins > 60 && over(d.sleepDebtHours, 1))) {
    out.push({ category: "Sleep debt", type: "insight", severity: over(d.sleepDebtHours, 2) ? 3 : 2,
      confidence: 0.85, reasons: ["short_sleep","late_screen"], metric_callouts: [call.sleep(), call.lateScreen()] });
  }

  if (d.lateScreenMins > 60) {
    out.push({ category: "Screen time", type: "action", severity: d.lateScreenMins > 120 ? 2 : 1,
      confidence: 0.8, reasons: ["late_screen>60"], metric_callouts: [call.lateScreen()] });
  }

  if (d.avgSteps7d < 5000 || d.sedentaryHours > 8) {
    out.push({ category: "Sedentary lifestyle", type: "insight",
      severity: (d.avgSteps7d<3000||d.sedentaryHours>10)?3:2, confidence: 0.8,
      reasons: ["low_steps","high_sedentary"], metric_callouts: [call.steps(), call.sedentary()] });
    out.push({ category: "Exercise", type: "action", severity: 2,
      confidence: 0.7, reasons: ["needs_activity"], metric_callouts: ["Add +2000 steps today"] });
  }

  if (d.caffeineLoadMg > 250) {
    out.push({ category: "Caffeine", type: "action", severity: d.caffeineLoadMg>350?2:1,
      confidence: 0.8, reasons: ["caffeine>250mg"], metric_callouts: [call.caffeine()] });
  }

  if (d.caffeineLoadMg > 250 && (d.sleepDebtHours > 1 || d.lateScreenMins > 60)) {
    out.push({ category: "Migraine", type: "action", severity: 2,
      confidence: 0.6, reasons: ["caffeine+sleep/screen"], metric_callouts: [call.caffeine(), call.sleep()] });
  }

  if (d.restingHRTrend === "up" && (d.sleepDebtHours > 1 || d.sedentaryHours > 8)) {
    out.push({ category: "Heart rate", type: "alert", severity: 2,
      confidence: 0.7, reasons: ["rhr_up + stressors"], metric_callouts: [call.rhr(), call.sleep(), call.sedentary()] });
  }

  if (d.restingHRTrend === "up" && (d.sleepDebtHours > 1 || d.avgSteps7d < 5000)) {
    out.push({ category: "Stress", type: "insight", severity: 1,
      confidence: 0.6, reasons: ["rhr_up + recovery_needed"], metric_callouts: ["Try 10m recovery walk"] });
  }

  if (d.aqiLevel >= 100) {
    out.push({ category: "Air quality", type: "alert", severity: between(d.aqiLevel,100,150)?2:3,
      confidence: 0.85, reasons: ["aqi>=100"], metric_callouts: [call.aqi()] });
  }

  if (d.allergensHighToday && d.aqiLevel >= 80) {
    out.push({ category: "Environmental allergies", type: "action", severity: 1,
      confidence: 0.6, reasons: ["allergens_high"], metric_callouts: ["Consider indoor time; shower after outdoor"] });
  }

  if (d.waterAdvisoryFlag) {
    out.push({ category: "Water quality", type: "alert", severity: 3,
      confidence: 0.9, reasons: ["local_advisory"], metric_callouts: ["Use filtered/bottled per local guidance"] });
  }

  if (d.caffeineLoadMg > 300) {
    out.push({ category: "Hydration", type: "action", severity: 1,
      confidence: 0.55, reasons: ["caffeine_diuretic_proxy"], metric_callouts: ["Add +1–2 cups water"] });
  }

  if (d.lateScreenMins > 60 && d.sleepDebtHours > 1) {
    out.push({ category: "Circadian disruption", type: "action", severity: 1,
      confidence: 0.6, reasons: ["late_light + short_sleep"], metric_callouts: ["Aim screen cutoff ≤23:00"] });
  }

  if (d.moodTrend === "down" && (d.sleepDebtHours > 1 || d.avgSteps7d < 5000)) {
    out.push({ category: "Mood", type: "insight", severity: 1,
      confidence: 0.6, reasons: ["mood_down + recovery_needed"], metric_callouts: ["Try 10m sunlight walk"] });
    out.push({ category: "Anxiety", type: "action", severity: 1,
      confidence: 0.5, reasons: ["mood_down + sleep"], metric_callouts: ["2 min breathing tonight"] });
    out.push({ category: "Depression", type: "action", severity: 1,
      confidence: 0.5, reasons: ["mood_down + sedentary"], metric_callouts: ["Text a friend / quick check-in"] });
  }

  if (d.bmi >= 27 && (d.avgSteps7d < 7000 || d.alcoholUnitsWeek >= 6)) {
    out.push({ category: "Weight management", type: "action", severity: d.bmi>=30?2:1,
      confidence: 0.7, reasons: ["bmi + lifestyle"], metric_callouts: [call.bmi(), call.steps(), call.alcohol()] });
  }

  if ((d.bmi >= 27 && d.famHxDiabetes >= 1) || (d.avgSteps7d < 5000 && d.bmi >= 27)) {
    out.push({ category: "Prediabetes", type: "insight", severity: 1,
      confidence: 0.6, reasons: ["bmi + famHx or lowSteps"], metric_callouts: ["Favor 10–15m post-meal walk"] });
  }

  if (d.bmi >= 30 && d.avgSteps7d < 5000 && d.famHxDiabetes >= 1) {
    out.push({ category: "Diabetes (type 2)", type: "insight", severity: 2,
      confidence: 0.55, reasons: ["clustered_risk_factors"], metric_callouts: ["Smaller carb portion at dinner"] });
  }

  if ((d.bmi >= 27 && d.famHxHypertension >= 1) || d.sedentaryHours > 8) {
    out.push({ category: "Hypertension", type: "action", severity: 1,
      confidence: 0.6, reasons: ["bmi/family/sedentary"], metric_callouts: ["Low-salt meal swap 1x"] });
  }

  if (d.alcoholUnitsWeek >= 7) {
    out.push({ category: "Alcohol use", type: "action", severity: d.alcoholUnitsWeek>=14?2:1,
      confidence: 0.75, reasons: ["alcohol>=7/wk"], metric_callouts: [call.alcohol()] });
  }

  if (d.smokingStatus === "current") {
    out.push({ category: "Smoking", type: "action", severity: 3,
      confidence: 0.9, reasons: ["smoking_current"], metric_callouts: ["Explore a quit plan resource"] });
  }

  if (d.bmi >= 30 && d.sleepDebtHours > 1) {
    out.push({ category: "Sleep apnea", type: "insight", severity: 1,
      confidence: 0.5, reasons: ["bmi + short_sleep"], metric_callouts: ["Aim consistent bedtime this week"] });
  }

  if (d.moodTrend === "down" && d.avgSteps7d < 5000) {
    out.push({ category: "Social isolation", type: "action", severity: 1,
      confidence: 0.5, reasons: ["mood_down + low_steps"], metric_callouts: ["Plan a 10m walk w/ a friend"] });
  }

  if (d.lateMealsPerWeek >= 3 && d.caffeineLoadMg > 250) {
    out.push({ category: "GERD (acid reflux)", type: "action", severity: 1,
      confidence: 0.55, reasons: ["late_meals + caffeine"], metric_callouts: ["Avoid eating 2–3h before bed"] });
  }
  return out;
}
