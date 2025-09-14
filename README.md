# HopHack25 — Personal Health Time-Machine

> **A calm, modern health companion** that turns your everyday data (steps, sleep, heart rate, calendar, air quality) into **clear, actionable insights**, plus a playful **“time-machine”** that simulates your future under what-if scenarios.

---

> ### 📌 NOTE TO JUDGES / GRADERS
>
> The **final production build** of our mobile app is hosted in our prod workspace and is **not fully mirrored** in this repo.
> For access or demo credentials, please contact **[fimtiaz1@umbc.edu](mailto:fimtiaz1@umbc.edu)**.

---

## ✨ Highlights

* **Story-driven dashboard** — crisp “Apple-style 2025” UI with glass surfaces and tasteful gradients.
* **Personal Health Time-Machine** — drag time forward, test micro-changes (e.g., +2k steps, -1 coffee), see predicted trends.
* **Unified signals** — steps, heart rate, sleep, calendar load, and **environmental data** (AirNow AQI; optional water quality).
* **Micro-actions** — bite-sized, context-aware nudges (e.g., “On exam weeks, aim for 7k steps to flatten HR spikes.”).
* **Bring-your-own data** — quick import of **Samsung Health CSVs** (multi-file, on-device parsing).
* **Privacy-first** — local processing by default; no PHI leaves device unless you explicitly enable sync.

---

## 📱 Screens (glimpse)

| Intro          | Login          | Permissions    | Dashboard      | Time-Machine   |
| -------------- | -------------- | -------------- | -------------- | -------------- |
| *(screenshot)* | *(screenshot)* | *(screenshot)* | *(screenshot)* | *(screenshot)* |

> Add your images in `/screenshots` and replace the placeholders above.

---

## 🧩 Architecture (high-level)

```
Mobile App (Expo / React Native)
  ├─ UI: modern glass + gradient components
  ├─ Data Ingest:
  │    • CSV imports (Samsung Health: HR, Steps, Sleep, Activities)
  │    • Location (Expo Location) → AirNow AQI
  │    • Calendar load (availability windows)
  ├─ On-device State:
  │    • AsyncStorage + local JSON caches
  ├─ Insights Engine:
  │    • Lightweight rule/risk engine (rubrics)
  │    • LLM narrative (optional, configurable)
  └─ Optional Cloud:
       • HCGateway / Health Connect proxy (future)
       • Secure REST endpoints for sync
```

---

## 🛠 Tech Stack

* **App**: Expo + React Native
* **Navigation**: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
* **Design**: `expo-linear-gradient`, `expo-blur`
* **Device**: `expo-location`, `expo-task-manager` (background location on dev builds)
* **Files**: `expo-document-picker`, `expo-file-system`, `papaparse`
* **State / Storage**: AsyncStorage
* **Data**: AirNow API (AQI), optional water quality API (pluggable)

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/<your-org>/HopHack25.git
cd HopHack25

# Install
npm install
# or
yarn

# Env (create .env or use your config system)
# AIRNOW_API_KEY=your_key_here

# Run (Expo)
npx expo start
```

> **Background location & certain APIs** require a **Development Build** (not Expo Go):
>
> ```
> npx expo prebuild
> npx expo run:android
> # or
> npx expo run:ios
> ```
>
> Make sure `app.json/app.config.*` includes location permissions for both iOS and Android.

---

## ⚙️ Configuration

### Environment

* `AIRNOW_API_KEY` — used to fetch Air Quality by lat/long.
  In code, we reference it as a constant; for production, move to secure storage or server proxy.

### Permissions (app.json)

* **iOS**:

  * `NSLocationWhenInUseUsageDescription`
  * `NSLocationAlwaysAndWhenInUseUsageDescription`
* **Android**:

  * `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`

> The repo includes examples of permission blocks used in development.

---

## 📂 Data Ingestion

### 1) Samsung Health (CSV import)

* Multi-file CSV import for **Steps**, **Heart Rate**, **Sleep**, **Activities**.
* Files are parsed **on device** (Papa Parse) and persisted to the app’s document directory as JSON.
* Preview first rows for sanity checks.

**Tip (Android + Google Drive):** If Google Drive items appear greyed out, use **Drive → ⋮ → Download** first, then pick from **Files → Downloads**.

### 2) Location → Air Quality

* Foreground location permission prompts; background optional (dev build).
* Calls **AirNow** for current AQI, displays **worst AQI** category nearby.

### 3) Calendar (optional)

* Lightweight “allow access” step; future work: detect busy windows and match **micro-actions** to free time.

---

## 🧪 Features: Risk & Rubric

* Deterministic **risk rules** (e.g., low sleep + high AQI → respiratory strain insight).
* **LLM narrative** (configurable) to summarize *today vs simulated future*:

  * “Today you are here… In 3 months, if nothing changes…”
  * Cautious, non-diagnostic language.
* **Time-Machine sliders** for horizon and “what-ifs” (extra steps, less caffeine, etc).

---

## 🔒 Privacy & Security

* **On-device** parsing + storage by default.
* CSVs converted to JSON and stored locally (`FileSystem.documentDirectory`).
* Optional remote sync is off by default; integrations must be explicitly enabled.
* No medical diagnoses. This app is **informational only**.

---

## 🧭 Project Structure (excerpt)

```
/src
  /screens
    DashboardScreen.jsx
    TimeMachineScreen.jsx
    /Permissions
      LocationPermissionScreen.jsx
      HealthPermissionScreen.jsx
      CalendarPermissionScreen.jsx
    LoginScreen.jsx
    IntroScreen.jsx
  /navigation
    BottomTabNavigator.jsx
  /data
    scenarios.js
  /engine
    engine.js                # rule/risk engine
  /output
    serializer.js            # to cards/todos format
    geminiRefiner.js         # optional narrative refinement
  /state
    todos.js
```

---

## 🧭 Usage Walkthrough

1. **Intro → Login/Signup**
2. **Permissions** (Location → Health CSV → Calendar)
3. **Dashboard** — top insights, AQI, add actions to To-Do
4. **Time-Machine** — set horizon, tweak drivers, simulate trends
5. **To-Do** — track micro-actions; lightweight streaks (roadmap)

---

## 🗺 Roadmap

* Health Connect / Samsung Health direct sync (via HCGateway or native module)
* Water quality + pollen indexes
* Personal baseline modeling (week-over-week deltas)
* Deeper scheduling intelligence (calendar constraints)
* Secure export / share-with-physician pack

---

## 🤝 Contributing

We welcome PRs for:

* CSV schema adapters
* New insight rubrics
* Visual polish & accessibility
* Docs & test coverage

Please open an issue to discuss major changes. Be respectful, concise, and include screenshots for UI PRs.

---

## 🧑‍⚖️ License

MIT for demo app code.
Trademarks and third-party assets belong to their respective owners.


