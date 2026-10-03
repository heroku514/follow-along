import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { BUTTONS, hasProgress, lineText, resetLine, tapButton, type LineState } from "./src/line";
import { loadLine, saveLine } from "./src/store";

export default function App() {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<LineState | null>(null);
  const [note, setNote] = useState("Follow the line.");
  const [confirmNew, setConfirmNew] = useState(false);

  useEffect(() => {
    loadLine()
      .then((loaded) => {
        setState(loaded);
        setNote(loaded.done ? "All copied." : hasProgress(loaded) ? "Saved line loaded." : "Follow the line.");
      })
      .catch(() => {
        setState(null);
        setNote("Could not read the line.");
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !state) return;
    saveLine(state).catch(() => setNote("Could not save the line."));
  }, [ready, state]);

  if (!ready || !state) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <Text style={styles.loading}>Loading the line</Text>
        </View>
      </SafeAreaView>
    );
  }

  function onTap(name: string) {
    const result = tapButton(state!, name);
    setState(result.state);
    setNote(result.note);
    setConfirmNew(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.body}>
        <Text style={styles.title}>Follow Along</Text>
        <Text style={styles.note}>{note}</Text>
        <Text style={styles.line}>{lineText(state)}</Text>
        <View style={styles.row}>
          {BUTTONS.map((name) => (
            <BigButton key={name} label={name} filled={false} inRow onPress={() => onTap(name)} />
          ))}
        </View>
        {confirmNew ? (
          <View style={styles.row}>
            <BigButton label="Confirm new" filled inRow onPress={onConfirmNew} />
            <BigButton label="Cancel new" inRow onPress={onCancelNew} />
          </View>
        ) : (
          <BigButton label="New line" onPress={() => setConfirmNew(true)} />
        )}
      </View>
    </SafeAreaView>
  );

  function onConfirmNew() {
    const result = resetLine();
    setState(result.state);
    setConfirmNew(false);
    setNote(result.note);
  }

  function onCancelNew() {
    setConfirmNew(false);
    setNote("New line canceled.");
  }
}

function BigButton({
  label,
  onPress,
  filled,
  inRow,
}: {
  label: string;
  onPress: () => void;
  filled?: boolean;
  inRow?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, inRow && styles.buttonRow, filled && styles.buttonFilled]}
    >
      <Text style={[styles.buttonText, filled && styles.buttonTextFilled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#EAF3FF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loading: { fontSize: 28, fontWeight: "800", color: "#1E3A5F" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  title: { fontSize: 32, fontWeight: "800", color: "#1E3A5F" },
  note: { fontSize: 18, color: "#3E5678", minHeight: 28 },
  line: { fontSize: 40, fontWeight: "800", color: "#B45309", lineHeight: 48, minHeight: 140 },
  row: { flexDirection: "row", gap: 8 },
  button: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#1E3A5F",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
  buttonRow: { flex: 1 },
  buttonFilled: { backgroundColor: "#1E3A5F" },
  buttonText: { fontSize: 22, fontWeight: "800", color: "#1E3A5F", textAlign: "center" },
  buttonTextFilled: { color: "#FFFFFF" },
});
