export type IndentOption = 2 | 4 | "\t";
export type JsonError = {
  message: string;
  position: number;
  line: number;
  column: number;
};
export type JsonResult =
  { ok: true; value: string } | { ok: false; error: JsonError };

type ParseOutcome =
  { ok: true; value: unknown } | { ok: false; error: JsonError };

type JsonErrorRule = {
  pattern: RegExp;
  translate: (match: RegExpExecArray) => string;
};

const JSON_ERROR_RULES: readonly JsonErrorRule[] = [
  {
    pattern: /unexpected token (['"])(?<token>.+?)\1/i,
    translate: ({ groups }) => `Token inesperado "${groups?.token ?? ""}"`,
  },
  {
    pattern: /unexpected identifier "(?<token>.+?)"/i,
    translate: ({ groups }) => `Token inesperado "${groups?.token ?? ""}"`,
  },
  {
    pattern: /unexpected end of (json input|data)/i,
    translate: () => "JSON incompleto: fim inesperado da entrada",
  },
  {
    pattern: /expected double-quoted property name/i,
    translate: () => "Esperado nome de propriedade entre aspas duplas",
  },
  {
    pattern: /expected property name or '\}'/i,
    translate: () => "Esperado nome de propriedade ou '}'",
  },
  {
    pattern: /expected ':' after property name/i,
    translate: () => "Esperado ':' após o nome da propriedade",
  },
  {
    pattern: /expected ',' or '\}' after property value/i,
    translate: () => "Esperado ',' ou '}' após o valor da propriedade",
  },
  {
    pattern: /expected ',' or '\]' after array element/i,
    translate: () => "Esperado ',' ou ']' após o elemento do array",
  },
  {
    pattern: /unterminated string/i,
    translate: () => "String não terminada",
  },
  {
    pattern: /bad escaped character/i,
    translate: () => "Sequência de escape inválida",
  },
  {
    pattern: /bad control character in string literal/i,
    translate: () => "Caractere de controle inválido na string",
  },
  {
    pattern: /unexpected non-whitespace character after json/i,
    translate: () => "Caractere inesperado após o fim do JSON",
  },
  {
    pattern: /unexpected character/i,
    translate: () => "Caractere inesperado",
  },
  {
    pattern: /unexpected keyword or identifier/i,
    translate: () => "Palavra-chave ou identificador inesperado",
  },
  {
    pattern: /unexpected eof/i,
    translate: () => "JSON incompleto: fim inesperado da entrada",
  },
  {
    pattern: /property name must be a string literal/i,
    translate: () =>
      "Nome de propriedade deve ser uma string entre aspas duplas",
  },
  {
    pattern: /expected ',' or '\}'/i,
    translate: () => "Esperado ',' ou '}'",
  },
  {
    pattern: /expected ',' or '\]'/i,
    translate: () => "Esperado ',' ou ']'",
  },
  {
    pattern: /expected '\}'/i,
    translate: () => "Esperado '}'",
  },
  {
    pattern: /expected '\]'/i,
    translate: () => "Esperado ']'",
  },
  {
    pattern: /invalid character/i,
    translate: () => "Caractere inválido",
  },
  {
    pattern: /".*" is not valid json/i,
    translate: () => "Conteúdo não é um JSON válido",
  },
];

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

export function translateJsonErrorMessage(rawMessage: string): string {
  for (const rule of JSON_ERROR_RULES) {
    const match = rule.pattern.exec(rawMessage);
    if (match) return rule.translate(match);
  }
  return "Erro de sintaxe no JSON";
}

function buildJsonError(input: string, error: unknown): JsonError {
  const rawMessage = error instanceof Error ? error.message : String(error);
  return {
    message: translateJsonErrorMessage(rawMessage),
    ...locateError(input, rawMessage),
  };
}

function parseJson(input: string): ParseOutcome {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (error) {
    return { ok: false, error: buildJsonError(input, error) };
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
          message: "A entrada não é um literal de string JSON válido",
          position: -1,
          line: -1,
          column: -1,
        },
      };
    }
    return { ok: true, value: parsed };
  } catch (error) {
    return {
      ok: false,
      error: buildJsonError(input, error),
    };
  }
}
