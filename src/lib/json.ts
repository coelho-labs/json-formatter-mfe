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
