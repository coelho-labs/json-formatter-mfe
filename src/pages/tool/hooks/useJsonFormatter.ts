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
  const [inputState, setInputState] = useState(initialInput);
  const [indent, setIndent] = useState<IndentOption>(2);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<JsonError | null>(null);
  const [validated, setValidated] = useState<boolean | null>(null);
  const [copyStatus, setCopyStatus] = useState<FormatStatus>("idle");
  const [view, setView] = useState<"text" | "tree">("text");
  const [fileError, setFileError] = useState<string | null>(null);

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
    setFileError(null);
  };

  const loadFile = async (file: File) => {
    try {
      const text = await file.text();
      setInput(text);
    } catch {
      setFileError("Não foi possível ler o arquivo.");
    }
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
    setFileError(null);
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
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const clear = () => {
    setInputState("");
    setOutput("");
    setError(null);
    setValidated(null);
    setCopyStatus("idle");
    setFileError(null);
  };

  const hasInput = inputState.trim() !== "";
  const hasOutput = output.trim() !== "";

  let treeValue: unknown = null;
  if (hasOutput) {
    try {
      treeValue = JSON.parse(output);
    } catch {
      treeValue = null;
    }
  }

  const canShowTree = treeValue !== null && !error;

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
    fileError,
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
    loadFile,
    minify,
    setIndent,
    setInput,
    setView,
    sortKeys,
    unescape,
    validate,
  };
}
