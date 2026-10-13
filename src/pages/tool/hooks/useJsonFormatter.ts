import { useEffect, useMemo, useState } from "react";
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
  const [inputState, setInputState] = useState(initialInput);
  const [indent, setIndent] = useState<IndentOption>(2);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<JsonError | null>(null);
  const [validated, setValidated] = useState<boolean | null>(null);
  const [copyStatus, setCopyStatus] = useState<FormatStatus>("idle");
  const [view, setView] = useState<"text" | "tree">("text");

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

  const format = () => handleTransform(formatJson(inputState, indent));

  const minify = () => handleTransform(minifyJson(inputState));

  const sortKeys = () => handleTransform(sortJsonKeys(inputState, indent));

  const escape = () => handleTransform(escapeJson(inputState));

  const unescape = () => handleTransform(unescapeJson(inputState));

  const validate = () => {
    const result = validateJson(inputState);
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

  const hasInput = inputState.trim() !== "";
  const hasOutput = output.trim() !== "";

  const treeValue = useMemo<unknown>(() => {
    if (!hasOutput) return null;
    try {
      return JSON.parse(output);
    } catch {
      return null;
    }
  }, [output, hasOutput]);

  const canShowTree = view === "tree" && treeValue !== null && !error;

  const effectiveView =
    (error || !hasOutput) && view === "tree" ? "text" : view;
  useEffect(() => {
    if (effectiveView !== view) {
      queueMicrotask(() => {
        setView(effectiveView);
      });
    }
  }, [effectiveView, view]);

  return {
    canShowTree,
    copyStatus,
    error,
    hasInput,
    hasOutput,
    indent,
    input: inputState,
    output,
    treeValue,
    validated,
    view: effectiveView,
    clear,
    copy,
    download,
    escape,
    format,
    minify,
    setIndent,
    setInput,
    setView,
    sortKeys,
    unescape,
    validate,
  };
}
