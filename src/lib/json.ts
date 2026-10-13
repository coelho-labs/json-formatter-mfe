export type IndentOption = 2 | 4 | "\t";
export type JsonError = {
  message: string;
  position: number;
  line: number;
  column: number;
};
export type JsonResult =
  | { ok: true; value: string }
  | { ok: false; error: JsonError };

type ParseOutcome =
  | { ok: true; value: unknown }
  | { ok: false; error: JsonError };

function deriveLocation(
  input: string,
  position: number,
): { line: number; column: number } {
  if (position < 0) return { line: -1, column: -1 };
  const clamped = Math.min(Math.max(position, 0), input.length);
  const before = input.slice(0, clamped);
  const lines = before.split("\n");
  const lastLine = lines.at(-1) ?? "";
  return { line: lines.length, column: lastLine.length + 1 };
}

function locateError(
  input: string,
  message: string,
): { position: number; line: number; column: number } {
  const lineColumnMatch = /line (?<line>\d+) column (?<column>\d+)/i.exec(
    message,
  );
  if (lineColumnMatch?.groups) {
    return {
      position: -1,
      line: Number(lineColumnMatch.groups.line),
      column: Number(lineColumnMatch.groups.column),
    };
  }
  const positionMatch = /position (?<position>\d+)/i.exec(message);
  if (positionMatch?.groups) {
    const position = Number(positionMatch.groups.position);
    return { position, ...deriveLocation(input, position) };
  }
  return { position: -1, line: -1, column: -1 };
}

function parseJson(input: string): ParseOutcome {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: { message, ...locateError(input, message) } };
  }
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortKeysDeep(item));
  }
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
    const result: Record<string, unknown> = {};
    for (const k of keys) {
      result[k] = sortKeysDeep(obj[k]);
    }
    return result;
  }
  return value;
}

export function sortJsonKeys(input: string, indent: IndentOption): JsonResult {
  const outcome = parseJson(input);
  if (!outcome.ok) return outcome;
  const sorted = sortKeysDeep(outcome.value);
  return { ok: true, value: JSON.stringify(sorted, null, indent) };
}

export function validateJson(input: string): JsonResult {
  const outcome = parseJson(input);
  if (!outcome.ok) return outcome;
  return { ok: true, value: input };
}

export function formatJson(input: string, indent: IndentOption): JsonResult {
  const outcome = parseJson(input);
  if (!outcome.ok) return outcome;
  return { ok: true, value: JSON.stringify(outcome.value, null, indent) };
}

export function minifyJson(input: string): JsonResult {
  const outcome = parseJson(input);
  if (!outcome.ok) return outcome;
  return { ok: true, value: JSON.stringify(outcome.value) };
}

export function escapeJson(input: string): JsonResult {
  return { ok: true, value: JSON.stringify(input) };
}

export function unescapeJson(input: string): JsonResult {
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== "string") {
      return {
        ok: false,
        error: {
          message: "Input is not a valid JSON string literal",
          position: -1,
          line: -1,
          column: -1,
        },
      };
    }
    return { ok: true, value: parsed };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      error: { message, ...locateError(input, message) },
    };
  }
}