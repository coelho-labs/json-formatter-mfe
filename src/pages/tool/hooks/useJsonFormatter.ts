import { useEffect, useState } from "react";
import type { IndentOption, JsonError, JsonResult } from "@/lib/json.ts";
import {
  escapeJson,
  formatJson,
  minifyJson,
  sortJsonKeys,
  unescapeJson,
  validateJson,
} from "@/lib/json.ts";

export type FormatStatus = "idle" | "copied" | "error";

export function useJsonFormatter(initialInput = "") {
  const [input, setInputState] = useState(initialInput);
  const [indent, setIndent] = useState<IndentOption>(2);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<JsonError | null>(null);
  const [validated, setValidated] = useState<boolean | null>(null);
  const [copyStatus, setCopyStatus] = useState<FormatStatus>("idle");

  useEffect(() => {
    if (copyStatus === "idle") return;
    const timer = setTimeout(() => setCopyStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [copyStatus]);

  const setInput = (value: string) => {
    setInputState(value);
    setValidated(null);
    setError(null);
    setCopyStatus("idle");
  };

  const handleTransform = (result: JsonResult) => {
    if (result.ok) {
      setOutput(result.value);
      setError(null);
      setValidated(null);
    } else {
      setOutput("");
      setError(result.error);
      setValidated(false);
    }
    setCopyStatus("idle");
  };

  const format = () => handleTransform(formatJson(input, indent));

  const minify = () => handleTransform(minifyJson(input));

  const sortKeys = () => handleTransform(sortJsonKeys(input, indent));

  const escape = () => handleTransform(escapeJson(input));

  const unescape = () => handleTransform(unescapeJson(input));

  const validate = () => {
    const result = validateJson(input);
    setValidated(result.ok);
    setError(result.ok ? null : result.error);
    setCopyStatus("idle");
    setOutput("");
  };

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "json-formatted.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    setInputState("");
    setOutput("");
    setError(null);
    setValidated(null);
    setCopyStatus("idle");
  };

  const hasInput = input.trim() !== "";
  const hasOutput = output.trim() !== "";

  return {
    copyStatus,
    error,
    hasInput,
    hasOutput,
    indent,
    input,
    output,
    validated,
    clear,
    copy,
    download,
    escape,
    format,
    minify,
    setIndent,
    setInput,
    sortKeys,
    unescape,
    validate,
  };
}
