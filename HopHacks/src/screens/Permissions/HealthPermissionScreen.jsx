// HealthPermissionScreen.js
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
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import Papa from "papaparse";

const FRIENDLY = {
  steps: "Steps",
  heartRate: "Heart Rate",
  sleep: "Sleep",
  activities: "Activities",
};

const PREVIEW_ROWS = 5;

export default function HealthPermissionScreen({ navigation }) {
  // Now each category is an ARRAY of uploaded items
  // item shape: { id, jsonPath, name, rows, preview }
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
    // Extract usable URI
    const fileUri = file?.uri;
    if (!fileUri) throw new Error("Invalid File URI");

    // Ensure a .csv extension for safer read/parse path
    // (We keep your copy-then-read approach that worked for you)
    const baseName = file.name || "temp";
    const correctedUri = fileUri.endsWith(".csv")
      ? fileUri
      : `${FileSystem.documentDirectory}${baseName}.csv`;

    if (!fileUri.endsWith(".csv")) {
      await FileSystem.copyAsync({ from: fileUri, to: correctedUri });
    }

    // Read CSV text
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

    // Parse
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

    // Persist JSON
    const jsonPath = `${FileSystem.documentDirectory}${key}-${Date.now()}-${sanitizeName(
      baseName
    )}.json`;
    await FileSystem.writeAsStringAsync(jsonPath, JSON.stringify(parsed.data));

    // Build item
    const preview = parsed.data.slice(0, PREVIEW_ROWS);
    const rows = parsed.data.length;
    const item = {
      id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      jsonPath,
      name: baseName,
      rows,
      preview,
    };

    // Push into the array for that key
    setItems((prev) => ({
      ...prev,
      [key]: [item, ...(prev[key] || [])],
    }));

    return rows;
  };

  const pickCsvFor = async (key) => {
    try {
      setBusyKey(key);

      // Keep your working picker setup; just enable multiple
      const res = await DocumentPicker.getDocumentAsync({
        // type intentionally omitted to avoid breaking your current behavior
        multiple: true, // <- allow selecting multiple files at once
        // copyToCacheDirectory left as default to preserve your flow
      });

      // Handle cancel across shapes
      if (res?.canceled === true || res?.type === "cancel") return;

      // Normalize to an array of files
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
    // Example: enforce at least one HR CSV
    // if (!(items.heartRate && items.heartRate.length)) {
    //   Alert.alert("Missing file", "Please upload at least one Heart Rate CSV first.");
    //   return;
    // }
    navigation?.navigate?.("CalendarPermission");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Upload Health Data</Text>
        <Text style={styles.subtitle}>
          You can add multiple CSVs for each category. (If picking from Drive,
          download to device first, then select from Files → Downloads.)
        </Text>

        {Object.keys(items).map((key) => {
          const arr = items[key] || [];
          const busy = busyKey === key;
          const rowsInKey = arr.reduce((s, it) => s + (it?.rows || 0), 0);

          return (
            <View key={key} style={styles.card}>
              <Text style={styles.label}>{FRIENDLY[key]}</Text>

              <View style={styles.row}>
                <Button
                  title={busy ? "Processing…" : "Add CSV(s)"}
                  onPress={() => (busy ? null : pickCsvFor(key))}
                  color={Platform.OS === "ios" ? "#007AFF" : "#34a853"}
                />
                {!!arr.length && (
                  <Pressable onPress={() => clearAllForKey(key)} style={styles.clearBtn}>
                    <Text style={styles.clearTxt}>Clear All</Text>
                  </Pressable>
                )}
              </View>

              <Text style={styles.meta}>
                {arr.length
                  ? `Saved • ${arr.length} file(s) • ${rowsInKey.toLocaleString()} rows`
                  : "No files uploaded"}
              </Text>

              {/* Render each uploaded file for this key */}
              {arr.map((it) => (
                <View key={it.id} style={styles.previewBox}>
                  <View style={styles.fileHeader}>
                    <Text style={styles.fileName}>{it.name}</Text>
                    <Pressable onPress={() => removeOne(key, it.id)} style={styles.removeOne}>
                      <Text style={styles.removeOneTxt}>Remove</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.fileMeta}>{it.rows.toLocaleString()} rows</Text>
                  {it.preview && (
                    <>
                      <Text style={styles.previewTitle}>
                        Preview (first {it.preview.length} rows)
                      </Text>
                      <Text style={styles.previewMono}>
                        {JSON.stringify(it.preview, null, 2)}
                      </Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        <View style={styles.totalRow}>
          <Text style={styles.totalTxt}>
            Total rows stored:{" "}
            <Text style={{ fontWeight: "900" }}>
              {totalRows.toLocaleString()}
            </Text>
          </Text>
        </View>

        <Pressable style={styles.cta} onPress={continueNext}>
          <Text style={styles.ctaTxt}>Continue</Text>
        </Pressable>

        <Text style={styles.help}>
          Still see greyed-out Drive files? Use Drive → ︙ → Download to device, then pick
          from Files → Downloads. We keep your flow and parse/persist CSVs locally.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function sanitizeName(name = "") {
  return name.replace(/[^a-z0-9._-]/gi, "_");
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  subtitle: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 20,
  },

  card: {
    marginTop: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#e7e7e7",
  },
  label: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 10 },
  clearTxt: { color: "#cc0000", fontWeight: "700" },
  meta: { color: "#666", marginTop: 8 },

  previewBox: {
    marginTop: 10,
    backgroundColor: "#f2f4f7",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e3e6ec",
  },
  fileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fileName: { color: "#222", fontWeight: "800" },
  removeOne: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#ffe5e5", borderRadius: 8 },
  removeOneTxt: { color: "#b00020", fontWeight: "800" },
  fileMeta: { color: "#666", marginTop: 4 },

  previewTitle: { fontWeight: "800", marginTop: 8, marginBottom: 6, color: "#222" },
  previewMono: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    color: "#1f2937",
  },

  totalRow: { marginTop: 16, alignItems: "center" },
  totalTxt: { color: "#333" },

  cta: {
    marginTop: 18,
    backgroundColor: "#34a853",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  ctaTxt: { color: "#fff", fontWeight: "800", fontSize: 16 },

  help: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
});
