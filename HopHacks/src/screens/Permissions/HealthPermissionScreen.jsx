// src/screens/Permissions/HealthPermissionScreen.jsx
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import Papa from "papaparse";
import { updateTopicWithCsvs } from "../../output/geminiRefiner";

const FRIENDLY = {
  steps: "Steps",
  heartRate: "Heart Rate",
  sleep: "Sleep",
  activities: "Activities",
};

const PREVIEW_ROWS = 5;

/* ===== Theme (matches the rest of your app) ===== */
const T = {
  bg: "#0f1117",
  text: "#EAF2FF",
  textDim: "#AAB6D3",
  stroke: "rgba(255,255,255,0.14)",
  cardBg: "rgba(255,255,255,0.06)",   // solid “glass”
  chipBg: "rgba(255,255,255,0.08)",
  chipStroke: "rgba(255,255,255,0.16)",
  grad: ["#34FFD1", "#5B8EFF", "#BC6FFF", "#FF7AC3"],
  darkText: "#0b0c10",
};

export default function HealthPermissionScreen({ navigation }) {
  const [items, setItems] = useState({
    steps: [],
    heartRate: [],
    sleep: [],
    activities: [],
  });
  const [busyKey, setBusyKey] = useState(null);

  const totalRows = useMemo(
    () =>
      Object.values(items).reduce(
        (sum, arr) =>
          sum +
          (Array.isArray(arr)
            ? arr.reduce((s, it) => s + (it?.rows || 0), 0)
            : 0),
        0
      ),
    [items]
  );

  const processOneFile = async (file, key) => {
    const fileUri = file?.uri;
    if (!fileUri) throw new Error("Invalid File URI");

    const baseName = file.name || "temp";
    const correctedUri = fileUri.endsWith(".csv")
      ? fileUri
      : `${FileSystem.documentDirectory}${baseName}.csv`;

    if (!fileUri.endsWith(".csv")) {
      await FileSystem.copyAsync({ from: fileUri, to: correctedUri });
    }

    let csvText;
    try {
      csvText = await FileSystem.readAsStringAsync(
        fileUri.endsWith(".csv") ? fileUri : correctedUri,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
    } catch (e) {
      console.error("Error reading file:", e);
      throw new Error("Could not read the selected file.");
    }

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (!Array.isArray(parsed.data) || parsed.data.length === 0) {
      throw new Error("No rows found in the selected CSV.");
    }
    if (parsed.errors?.length) {
      console.warn("CSV parse warnings:", parsed.errors.slice(0, 3));
    }

    const jsonPath = `${FileSystem.documentDirectory}${key}-${Date.now()}-${sanitizeName(
      baseName
    )}.json`;
    await FileSystem.writeAsStringAsync(jsonPath, JSON.stringify(parsed.data));

    const preview = parsed.data.slice(0, PREVIEW_ROWS);
    const rows = parsed.data.length;
    const item = {
      id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      jsonPath,
      name: baseName,
      rows,
      preview,
    };

    setItems((prev) => ({
      ...prev,
      [key]: [item, ...(prev[key] || [])],
    }));

    // Update topic with all CSV jsonPaths for this key (new first)
    const csvUris = [jsonPath, ...((items[key] || []).map((it) => it.jsonPath))];
    let topicObj = {};
    updateTopicWithCsvs(csvUris, key, topicObj).catch(() => {});
    return rows;
  };

  const pickCsvFor = async (key) => {
    try {
      setBusyKey(key);
      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
      });

      if (res?.canceled === true || res?.type === "cancel") return;

      const files = res?.assets ? res.assets : [res].filter(Boolean);
      if (!files?.length) return;

      let totalAdded = 0;
      for (const f of files) {
        try {
          const added = await processOneFile(f, key);
          totalAdded += added;
        } catch (err) {
          console.error("File skipped:", err);
          Alert.alert("File skipped", String(err?.message || err));
        }
      }

      if (totalAdded > 0) {
        Alert.alert(
          "Uploaded",
          `${FRIENDLY[key]}: ${totalAdded.toLocaleString()} total rows saved from ${files.length} file(s).`
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Upload failed", String(e?.message || e));
    } finally {
      setBusyKey(null);
    }
  };

  const clearAllForKey = async (key) => {
    const arr = items[key] || [];
    for (const it of arr) {
      if (it?.jsonPath) {
        try {
          await FileSystem.deleteAsync(it.jsonPath, { idempotent: true });
        } catch {}
      }
    }
    setItems((prev) => ({ ...prev, [key]: [] }));
  };

  const removeOne = async (key, id) => {
    const arr = items[key] || [];
    const target = arr.find((x) => x.id === id);
    if (target?.jsonPath) {
      try {
        await FileSystem.deleteAsync(target.jsonPath, { idempotent: true });
      } catch {}
    }
    setItems((prev) => ({
      ...prev,
      [key]: arr.filter((x) => x.id !== id),
    }));
  };

  const continueNext = () => {
    navigation?.navigate?.("CalendarPermission");
  };

  return (
    <SafeAreaView style={st.safe}>
      {/* Hero glow */}
      <LinearGradient colors={T.grad} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={st.hero} />

      <ScrollView contentContainerStyle={st.container}>
        <View style={st.headerChip}>
          <Text style={st.h1}>Upload Health Data</Text>
        </View>
        <Text style={st.subtitle}>
          Add multiple CSVs per category. If picking from Drive, first download to device, then choose from <Text style={{ fontWeight: "800", color: T.text }}>Files → Downloads</Text>.
        </Text>

        {Object.keys(items).map((key) => {
          const arr = items[key] || [];
          const busy = busyKey === key;
          const rowsInKey = arr.reduce((s, it) => s + (it?.rows || 0), 0);

          return (
            <View key={key} style={st.card}>
              <Text style={st.cardTitle}>{FRIENDLY[key]}</Text>

              <View style={st.row}>
                <Pressable
                  onPress={() => (busy ? null : pickCsvFor(key))}
                  style={[st.btnGhost, busy && { opacity: 0.7 }]}
                >
                  <Text style={st.btnGhostText}>{busy ? "Processing…" : "Add CSV(s)"}</Text>
                </Pressable>

                {!!arr.length && (
                  <Pressable onPress={() => clearAllForKey(key)} style={st.btnWarn}>
                    <Text style={st.btnWarnText}>Clear All</Text>
                  </Pressable>
                )}
              </View>

              <Text style={st.meta}>
                {arr.length
                  ? `Saved • ${arr.length} file(s) • ${rowsInKey.toLocaleString()} rows`
                  : "No files uploaded"}
              </Text>

              {arr.map((it) => (
                <View key={it.id} style={st.previewBox}>
                  <View style={st.fileHeader}>
                    <Text style={st.fileName}>{it.name}</Text>
                    <Pressable onPress={() => removeOne(key, it.id)} style={st.removeOne}>
                      <Text style={st.removeOneTxt}>Remove</Text>
                    </Pressable>
                  </View>
                  <Text style={st.fileMeta}>{it.rows.toLocaleString()} rows</Text>
                  {it.preview && (
                    <>
                      <Text style={st.previewTitle}>
                        Preview (first {it.preview.length} rows)
                      </Text>
                      <Text style={st.previewMono}>
                        {JSON.stringify(it.preview, null, 2)}
                      </Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        <View style={st.totalRow}>
          <Text style={st.totalTxt}>
            Total rows stored:{" "}
            <Text style={{ fontWeight: "900", color: T.text }}>
              {totalRows.toLocaleString()}
            </Text>
          </Text>
        </View>

        <Pressable style={st.primaryBtn} onPress={continueNext}>
          <LinearGradient
            colors={T.grad}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={st.primaryBtnBg}
          >
            <Text style={st.primaryBtnText}>Continue</Text>
          </LinearGradient>
        </Pressable>

        <Text style={st.help}>
          Still see greyed-out Drive files? In Drive: ︙ → <Text style={{ fontWeight: "800", color: T.text }}>Download</Text> to device, then pick from <Text style={{ fontWeight: "800", color: T.text }}>Files → Downloads</Text>. We parse & store locally.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function sanitizeName(name = "") {
  return name.replace(/[^a-z0-9._-]/gi, "_");
}

/* ===== Styles ===== */
const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: T.bg },
  hero: {
    position: "absolute",
    top: -140,
    left: -80,
    right: -80,
    height: 320,
    transform: [{ rotate: "-6deg" }],
    opacity: 0.20,
  },
  container: { padding: 16, paddingTop: 24 },
  headerChip: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.stroke,
    backgroundColor: T.cardBg,
    marginBottom: 8,
  },
  h1: { fontSize: 22, fontWeight: "900", color: T.text },

  subtitle: {
    color: T.textDim,
    marginBottom: 12,
    lineHeight: 20,
  },

  card: {
    marginTop: 14,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.stroke,
    backgroundColor: T.cardBg,
    padding: 14,
  },
  cardTitle: { color: T.text, fontWeight: "800", marginBottom: 10, fontSize: 16 },

  row: { flexDirection: "row", alignItems: "center", gap: 10 },

  btnGhost: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.stroke,
    backgroundColor: T.cardBg,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  btnGhostText: { color: T.text, fontWeight: "800" },

  btnWarn: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,99,99,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,99,99,0.28)",
  },
  btnWarnText: { color: "#ff9b9b", fontWeight: "800" },

  meta: { color: T.textDim, marginTop: 8 },

  previewBox: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: T.chipStroke,
  },
  fileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fileName: { color: T.text, fontWeight: "800" },
  removeOne: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,99,99,0.12)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,99,99,0.22)",
  },
  removeOneTxt: { color: "#ff8a8a", fontWeight: "800" },
  fileMeta: { color: T.textDim, marginTop: 4 },

  previewTitle: { fontWeight: "800", marginTop: 8, marginBottom: 6, color: T.text },
  previewMono: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    color: T.textDim,
  },

  totalRow: { marginTop: 16, alignItems: "center" },
  totalTxt: { color: T.textDim },

  primaryBtn: { marginTop: 18, borderRadius: 12, overflow: "hidden" },
  primaryBtnBg: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: T.darkText, fontWeight: "900", fontSize: 16 },

  help: {
    color: T.textDim,
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
    marginBottom: 18,
  },
});
