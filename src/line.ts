export const BUTTONS = ["Sun", "Moon", "Star"] as const;

export const PATTERNS = [
  ["Sun"],
  ["Sun", "Moon"],
  ["Moon", "Star"],
  ["Sun", "Star", "Moon"],
] as const;

export type LineState = {
  patternIndex: number;
  step: number;
  done: boolean;
};

export const EMPTY_LINE: LineState = {
  patternIndex: 0,
  step: 0,
  done: false,
};

export function lineText(state: LineState): string {
  if (state.done) return "All copied.";
  const pattern = PATTERNS[state.patternIndex] ?? PATTERNS[0];
  return `${pattern.join(" then ")}.`;
}

export function hasProgress(state: LineState): boolean {
  return state.done || state.patternIndex > 0 || state.step > 0;
}

export function parseLine(raw: string | null): LineState {
  if (!raw) return EMPTY_LINE;
  try {
    const data = JSON.parse(raw) as Partial<LineState>;
    const patternIndex = typeof data.patternIndex === "number" && data.patternIndex >= 0 && data.patternIndex < PATTERNS.length
      ? data.patternIndex
      : 0;
    const pattern = PATTERNS[patternIndex];
    const step = typeof data.step === "number" && data.step >= 0 && data.step < pattern.length ? data.step : 0;
    const done = data.done === true;
    return { patternIndex, step: done ? 0 : step, done };
  } catch {
    return EMPTY_LINE;
  }
}

export function tapButton(state: LineState, name: string): { state: LineState; note: string } {
  if (state.done) return { state, note: "All copied." };
  if (!BUTTONS.includes(name as (typeof BUTTONS)[number])) return { state, note: "Follow the line." };
  const pattern = PATTERNS[state.patternIndex];
  if (name !== pattern[state.step]) return { state: { ...state, step: 0 }, note: "Start this one again." };
  const step = state.step + 1;
  if (step < pattern.length) return { state: { ...state, step }, note: `Tapped ${name}.` };
  if (state.patternIndex + 1 >= PATTERNS.length) return { state: { patternIndex: state.patternIndex, step: 0, done: true }, note: "All copied." };
  return { state: { patternIndex: state.patternIndex + 1, step: 0, done: false }, note: "Copied." };
}

export function resetLine(): { state: LineState; note: string } {
  return { state: EMPTY_LINE, note: "Follow the line." };
}
