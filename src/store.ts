import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseLine, type LineState } from "./line";

const KEY = "follow-along-v1";

export async function loadLine(): Promise<LineState> {
  const raw = await AsyncStorage.getItem(KEY);
  return parseLine(raw);
}

export async function saveLine(state: LineState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
