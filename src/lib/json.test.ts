import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JsonError, JsonResult } from "./json.ts";
import {
  escapeJson,
  formatJson,
  minifyJson,
  sortJsonKeys,
  translateJsonErrorMessage,
  unescapeJson,
  validateJson,
} from "./json.ts";

function valueOf(result: JsonResult): string {
  if (!result.ok) {
    throw new Error(`Expected a success result, got: ${result.error.message}`);
  }
  return result.value;
}

function errorOf(result: JsonResult): JsonError {
  if (result.ok) throw new Error("Expected a failure result");
  return result.error;
}

const VALID_JSON = '{"b":1,"a":{"d":4,"c":[3,2,1]}}';

const FORMATTED_JSON = [
  "{",
  '  "b": 1,',
  '  "a": {',
  '    "d": 4,',
  '    "c": [',
  "      3,",
  "      2,",
  "      1",
  "    ]",
  "  }",
  "}",
].join("\n");

const SORTED_JSON = [
  "{",
  '  "a": {',
  '    "c": [',
  "      3,",
  "      2,",
  "      1",
  "    ],",
  '    "d": 4',
  "  },",
  '  "b": 1',
  "}",
].join("\n");

describe("Given a valid JSON document", () => {
  let input: string;
  let result: JsonResult;

  beforeEach(() => {
    input = VALID_JSON;
  });

  describe("when formatJson is called with a two-space indent", () => {
    beforeEach(() => {
      result = formatJson(input, 2);
    });

    it("then it should report success", () => {
      expect(result.ok).toBe(true);
    });

    it("then the output should be indented with two spaces", () => {
      expect(valueOf(result)).toBe(FORMATTED_JSON);
    });

    it("then the key order should be preserved", () => {
      expect(valueOf(result)).toContain('"b": 1,\n  "a": {');
    });

    it("then the output should re-parse to the same value", () => {
      expect(JSON.parse(valueOf(result))).toEqual(JSON.parse(input));
    });
  });

  describe("when formatJson is called with a four-space indent", () => {
    beforeEach(() => {
      result = formatJson(input, 4);
    });

    it("then nested keys should be indented by four spaces", () => {
      expect(valueOf(result)).toContain('    "d": 4,');
    });
  });

  describe("when formatJson is called with a tab indent", () => {
    beforeEach(() => {
      result = formatJson(input, "\t");
    });

    it("then each nesting level should start with a tab", () => {
      expect(valueOf(result)).toContain('\t"d": 4,');
    });
  });

  describe("when minifyJson is called", () => {
    beforeEach(() => {
      result = minifyJson(input);
    });

    it("then the output should have no whitespace between tokens", () => {
      expect(valueOf(result)).toBe('{"b":1,"a":{"d":4,"c":[3,2,1]}}');
    });

    it("then the output should re-parse to the same value", () => {
      expect(JSON.parse(valueOf(result))).toEqual(JSON.parse(input));
    });
  });

  describe("when sortJsonKeys is called", () => {
    beforeEach(() => {
      result = sortJsonKeys(input, 2);
    });

    it("then the keys should be sorted alphabetically", () => {
      expect(valueOf(result)).toBe(SORTED_JSON);
    });

    it("then the array order should be preserved", () => {
      expect(valueOf(result)).toContain("      3,\n      2,\n      1");
    });
  });

  describe("when validateJson is called", () => {
    beforeEach(() => {
      result = validateJson(input);
    });

    it("then it should report the document as valid", () => {
      expect(result.ok).toBe(true);
    });

    it("then it should return the input unchanged", () => {
      expect(valueOf(result)).toBe(input);
    });
  });

  describe("when escapeJson is called", () => {
    beforeEach(() => {
      result = escapeJson(input);
    });

    it("then the output should be a quoted JSON literal", () => {
      expect(valueOf(result).startsWith('"')).toBe(true);
    });

    it("then unescaping the output should restore the original document", () => {
      expect(JSON.parse(valueOf(result))).toBe(input);
    });
  });
});

describe("Given an invalid JSON document", () => {
  let input: string;
  let result: JsonResult;

  beforeEach(() => {
    input = '{"a":1,}';
  });

  describe("when formatJson is called", () => {
    beforeEach(() => {
      result = formatJson(input, 2);
    });

    it("then it should report failure", () => {
      expect(result.ok).toBe(false);
    });

    it("then the message should be translated to pt-BR", () => {
      expect(errorOf(result).message).toBe(
        "Esperado nome de propriedade entre aspas duplas",
      );
    });

    it("then the error should carry a positive position", () => {
      expect(errorOf(result).line).toBeGreaterThan(0);
    });
  });

  describe("when minifyJson is called", () => {
    beforeEach(() => {
      result = minifyJson(input);
    });

    it("then it should propagate the same failure as format", () => {
      expect(errorOf(result).message).toBe(
        "Esperado nome de propriedade entre aspas duplas",
      );
    });
  });

  describe("when sortJsonKeys is called", () => {
    beforeEach(() => {
      result = sortJsonKeys(input, 2);
    });

    it("then it should not return a sorted document", () => {
      expect(result.ok).toBe(false);
    });
  });

  describe("when the document is empty", () => {
    beforeEach(() => {
      result = formatJson("", 2);
    });

    it("then the message should describe an unexpected end of input", () => {
      expect(errorOf(result).message).toBe(
        "JSON incompleto: fim inesperado da entrada",
      );
    });
  });
});

const MULTILINE_INPUT = '{\n  "a": 1,\n}';

describe("Given a parse error that reports only a source position", () => {
  let rawMessage: string;
  let result: JsonResult;

  beforeEach(() => {
    vi.spyOn(JSON, "parse").mockImplementation(() => {
      throw new SyntaxError(rawMessage);
    });
  });

  describe("when the position falls inside a line", () => {
    beforeEach(() => {
      rawMessage = "Expected property name or '}' in JSON at position 5";
      result = formatJson(MULTILINE_INPUT, 2);
    });

    it("then the message should be translated to pt-BR", () => {
      expect(errorOf(result).message).toBe(
        "Esperado nome de propriedade ou '}'",
      );
    });

    it("then it should keep the position reported by the engine", () => {
      expect(errorOf(result).position).toBe(5);
    });

    it("then the line should be derived from the position", () => {
      expect(errorOf(result).line).toBe(2);
    });

    it("then the column should be derived from the position", () => {
      expect(errorOf(result).column).toBe(4);
    });
  });

  describe("when the position is zero", () => {
    beforeEach(() => {
      rawMessage = "Expected property name or '}' in JSON at position 0";
      result = formatJson(MULTILINE_INPUT, 2);
    });

    it("then the line should be the first one", () => {
      expect(errorOf(result).line).toBe(1);
    });

    it("then the column should be the first one", () => {
      expect(errorOf(result).column).toBe(1);
    });
  });

  describe("when the position sits at the start of a line", () => {
    beforeEach(() => {
      rawMessage = "Expected property name or '}' in JSON at position 12";
      result = formatJson(MULTILINE_INPUT, 2);
    });

    it("then the line should count the breaks before the position", () => {
      expect(errorOf(result).line).toBe(3);
    });

    it("then the column should be reset to the line start", () => {
      expect(errorOf(result).column).toBe(1);
    });
  });

  describe("when the position is beyond the end of the input", () => {
    beforeEach(() => {
      rawMessage = "Expected property name or '}' in JSON at position 99";
      result = formatJson(MULTILINE_INPUT, 2);
    });

    it("then the line should be clamped to the last one", () => {
      expect(errorOf(result).line).toBe(3);
    });

    it("then the column should be clamped to the last line end", () => {
      expect(errorOf(result).column).toBe(2);
    });
  });
});

describe("Given a parse error that reports line and column", () => {
  let result: JsonResult;

  beforeEach(() => {
    vi.spyOn(JSON, "parse").mockImplementation(() => {
      throw new SyntaxError(
        "JSON.parse: unexpected character at line 4 column 8 of the JSON data",
      );
    });
  });

  describe("when formatJson is called", () => {
    beforeEach(() => {
      result = formatJson('{"a":1,}', 2);
    });

    it("then the message should be translated to pt-BR", () => {
      expect(errorOf(result).message).toBe("Caractere inesperado");
    });

    it("then the position should be the sentinel", () => {
      expect(errorOf(result).position).toBe(-1);
    });

    it("then the line should come from the raw message", () => {
      expect(errorOf(result).line).toBe(4);
    });

    it("then the column should come from the raw message", () => {
      expect(errorOf(result).column).toBe(8);
    });
  });
});

describe("Given a parse error without any location information", () => {
  let result: JsonResult;

  beforeEach(() => {
    vi.spyOn(JSON, "parse").mockImplementation(() => {
      throw new SyntaxError("Something completely different");
    });
  });

  describe("when formatJson is called", () => {
    beforeEach(() => {
      result = formatJson("{", 2);
    });

    it("then the message should fall back to the generic translation", () => {
      expect(errorOf(result).message).toBe("Erro de sintaxe no JSON");
    });

    it("then the position should be the sentinel", () => {
      expect(errorOf(result).position).toBe(-1);
    });

    it("then the line should be the sentinel", () => {
      expect(errorOf(result).line).toBe(-1);
    });

    it("then the column should be the sentinel", () => {
      expect(errorOf(result).column).toBe(-1);
    });
  });
});

describe("Given an escaped string literal", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = unescapeJson('"linha\\nquebrada \\"citada\\""');
  });

  describe("when unescapeJson is called", () => {
    it("then the output should be the unescaped content", () => {
      expect(valueOf(result)).toBe('linha\nquebrada "citada"');
    });
  });
});

describe("Given a string literal that is not valid JSON", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = unescapeJson('{"a":');
  });

  describe("when unescapeJson is called", () => {
    it("then it should report failure", () => {
      expect(result.ok).toBe(false);
    });

    it("then the message should be translated to pt-BR", () => {
      expect(errorOf(result).message).toBe(
        "JSON incompleto: fim inesperado da entrada",
      );
    });
  });
});

describe("Given a JSON document instead of a string literal", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = unescapeJson('{"a":1}');
  });

  describe("when unescapeJson is called", () => {
    it("then it should reject the non-string literal", () => {
      expect(errorOf(result).message).toBe(
        "A entrada não é um literal de string JSON válido",
      );
    });

    it("then it should not report a source position", () => {
      expect(errorOf(result).position).toBe(-1);
    });

    it("then it should not report a source line", () => {
      expect(errorOf(result).line).toBe(-1);
    });

    it("then it should not report a source column", () => {
      expect(errorOf(result).column).toBe(-1);
    });
  });
});

type TranslationCase = {
  engine: string;
  raw: string;
  expected: string;
};

const TRANSLATION_CASES: readonly TranslationCase[] = [
  {
    engine: "V8 unexpected token",
    raw: 'Unexpected token \'}\', "{\\"a\\":1,}" is not valid JSON',
    expected: 'Token inesperado "}"',
  },
  {
    engine: "V8 unexpected end",
    raw: "Unexpected end of JSON input",
    expected: "JSON incompleto: fim inesperado da entrada",
  },
  {
    engine: "V8 double-quoted property name",
    raw: "Expected double-quoted property name in JSON at position 7 (line 1 column 8)",
    expected: "Esperado nome de propriedade entre aspas duplas",
  },
  {
    engine: "V8 property name",
    raw: "Expected property name or '}' in JSON at position 1",
    expected: "Esperado nome de propriedade ou '}'",
  },
  {
    engine: "V8 colon",
    raw: "Expected ':' after property name in JSON at position 4",
    expected: "Esperado ':' após o nome da propriedade",
  },
  {
    engine: "V8 object separator",
    raw: "Expected ',' or '}' after property value in JSON at position 5",
    expected: "Esperado ',' ou '}' após o valor da propriedade",
  },
  {
    engine: "V8 array separator",
    raw: "Expected ',' or ']' after array element in JSON at position 5",
    expected: "Esperado ',' ou ']' após o elemento do array",
  },
  {
    engine: "V8 unterminated string",
    raw: "Unterminated string in JSON at position 3",
    expected: "String não terminada",
  },
  {
    engine: "V8 bad escape",
    raw: "Bad escaped character in JSON at position 2",
    expected: "Sequência de escape inválida",
  },
  {
    engine: "V8 bad control character",
    raw: "Bad control character in string literal in JSON at position 2",
    expected: "Caractere de controle inválido na string",
  },
  {
    engine: "V8 trailing content",
    raw: "Unexpected non-whitespace character after JSON at position 4",
    expected: "Caractere inesperado após o fim do JSON",
  },
  {
    engine: "Firefox unexpected character",
    raw: "JSON.parse: unexpected character at line 1 column 2 of the JSON data",
    expected: "Caractere inesperado",
  },
  {
    engine: "Firefox unexpected keyword",
    raw: "JSON.parse: unexpected keyword or identifier at line 1 column 1",
    expected: "Palavra-chave ou identificador inesperado",
  },
  {
    engine: "Firefox unexpected end",
    raw: "JSON.parse: unexpected end of data at line 1 column 1 of the JSON data",
    expected: "JSON incompleto: fim inesperado da entrada",
  },
  {
    engine: "Safari unexpected identifier",
    raw: 'JSON Parse error: Unexpected identifier "x"',
    expected: 'Token inesperado "x"',
  },
  {
    engine: "Safari unexpected EOF",
    raw: "JSON Parse error: Unexpected EOF",
    expected: "JSON incompleto: fim inesperado da entrada",
  },
  {
    engine: "Safari expected brace",
    raw: "JSON Parse error: Expected '}'",
    expected: "Esperado '}'",
  },
  {
    engine: "Safari expected bracket",
    raw: "JSON Parse error: Expected ']'",
    expected: "Esperado ']'",
  },
  {
    engine: "Safari invalid character",
    raw: "JSON Parse error: Invalid character",
    expected: "Caractere inválido",
  },
  {
    engine: "Safari property name",
    raw: "JSON Parse error: Property name must be a string literal",
    expected: "Nome de propriedade deve ser uma string entre aspas duplas",
  },
  {
    engine: "Safari object separator",
    raw: "JSON Parse error: Expected ',' or '}'",
    expected: "Esperado ',' ou '}'",
  },
  {
    engine: "Safari array separator",
    raw: "JSON Parse error: Expected ',' or ']'",
    expected: "Esperado ',' ou ']'",
  },
  {
    engine: "Safari multi-character identifier",
    raw: 'JSON Parse error: Unexpected identifier "foo"',
    expected: 'Token inesperado "foo"',
  },
  {
    engine: "V8 invalid document",
    raw: '"abcdef" is not valid JSON',
    expected: "Conteúdo não é um JSON válido",
  },
  {
    engine: "unmapped",
    raw: "Something completely different",
    expected: "Erro de sintaxe no JSON",
  },
];

describe("Given a raw parse error message", () => {
  let translated: string;

  for (const testCase of TRANSLATION_CASES) {
    describe(`when a ${testCase.engine} message is translated`, () => {
      beforeEach(() => {
        translated = translateJsonErrorMessage(testCase.raw);
      });

      it("then it should return the pt-BR equivalent", () => {
        expect(translated).toBe(testCase.expected);
      });

      it("then it should not leak engine wording", () => {
        expect(translated).not.toMatch(
          /unexpected|expected|invalid|unterminated|bad |parse error/i,
        );
      });
    });
  }
});

describe("Given validateJson with an empty string", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = validateJson("");
  });

  it("then it should report failure", () => {
    expect(result.ok).toBe(false);
  });

  it("then the error should report an unexpected end of input", () => {
    expect(errorOf(result).message).toBe(
      "JSON incompleto: fim inesperado da entrada",
    );
  });
});

describe("Given validateJson with whitespace only", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = validateJson("   ");
  });

  it("then it should report failure", () => {
    expect(result.ok).toBe(false);
  });

  it("then the error should report an unexpected end of input", () => {
    expect(errorOf(result).message).toBe(
      "JSON incompleto: fim inesperado da entrada",
    );
  });
});

describe("Given formatJson with an empty string", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = formatJson("", 2);
  });

  it("then it should report failure", () => {
    expect(result.ok).toBe(false);
  });

  it("then the error should report an unexpected end of input", () => {
    expect(errorOf(result).message).toBe(
      "JSON incompleto: fim inesperado da entrada",
    );
  });
});

describe("Given minifyJson with an empty string", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = minifyJson("");
  });

  it("then it should report failure", () => {
    expect(result.ok).toBe(false);
  });
});

describe("Given sortJsonKeys with an empty string", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = sortJsonKeys("", 2);
  });

  it("then it should report failure", () => {
    expect(result.ok).toBe(false);
  });
});

describe("Given escapeJson with an empty string", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = escapeJson("");
  });

  it("then it should report success", () => {
    expect(result.ok).toBe(true);
  });

  it("then the output should be a quoted empty string", () => {
    expect(valueOf(result)).toBe('""');
  });
});

describe("Given escapeJson with special characters", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = escapeJson('hello "world" \\n');
  });

  it("then it should report success", () => {
    expect(result.ok).toBe(true);
  });

  it("then the output should escape quotes and backslashes", () => {
    expect(valueOf(result)).toBe('"hello \\"world\\" \\\\n"');
  });
});

describe("Given unescapeJson with a valid JSON string literal", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = unescapeJson('"olá mundo"');
  });

  it("then it should report success", () => {
    expect(result.ok).toBe(true);
  });

  it("then the output should be the unescaped content", () => {
    expect(valueOf(result)).toBe("olá mundo");
  });
});

describe("Given unescapeJson with a JSON number (not a string)", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = unescapeJson("42");
  });

  it("then it should report failure", () => {
    expect(result.ok).toBe(false);
  });

  it("then the error should explain the expected string literal", () => {
    expect(errorOf(result).message).toBe(
      "A entrada não é um literal de string JSON válido",
    );
  });

  it("then the error position should be -1", () => {
    expect(errorOf(result).position).toBe(-1);
  });
});

describe("Given unescapeJson with an empty string", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = unescapeJson("");
  });

  it("then it should report failure", () => {
    expect(result.ok).toBe(false);
  });
});

describe("Given a parse error that reports multi-digit line and column", () => {
  let result: JsonResult;

  beforeEach(() => {
    vi.spyOn(JSON, "parse").mockImplementation(() => {
      throw new SyntaxError(
        "JSON.parse: unexpected character at line 12 column 34 of the JSON data",
      );
    });
    result = formatJson('{"a":1,}', 2);
  });

  describe("when formatJson is called", () => {
    it("then the whole line number should be kept", () => {
      expect(errorOf(result).line).toBe(12);
    });

    it("then the whole column number should be kept", () => {
      expect(errorOf(result).column).toBe(34);
    });
  });
});

describe("Given a raw unexpected-token message with a multi-character token", () => {
  describe("when the message is translated", () => {
    it("then the whole token should be kept", () => {
      expect(translateJsonErrorMessage("unexpected token 'multi'")).toBe(
        'Token inesperado "multi"',
      );
    });
  });
});

describe("Given the JSON null literal", () => {
  let result: JsonResult;

  beforeEach(() => {
    result = sortJsonKeys("null", 2);
  });

  describe("when sortJsonKeys is called", () => {
    it("then the null literal should be preserved", () => {
      expect(valueOf(result)).toBe("null");
    });
  });
});
