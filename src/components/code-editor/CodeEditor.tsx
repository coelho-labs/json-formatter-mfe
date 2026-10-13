import { useEffect, useRef, useState } from "react";
import { Compartment, EditorState } from "@codemirror/state";
import type { Extension } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  drawSelection,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { bracketMatching, indentOnInput } from "@codemirror/language";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import { codeEditorTheme } from "./theme.ts";

const readOnlyCompartment = new Compartment();

function readOnlyExtensions(readOnly: boolean): Extension {
  return readOnly
    ? [EditorState.readOnly.of(true), EditorView.editable.of(false)]
    : [];
}

type CodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  lintJson?: boolean;
  initialAriaLabel?: string;
  className?: string;
};

export function CodeEditor({
  value,
  onChange,
  readOnly,
  lintJson,
  initialAriaLabel,
  className,
}: Readonly<CodeEditorProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const [initialDoc] = useState(value);
  const [localInitialAriaLabel] = useState(initialAriaLabel);
  const [localLintJson] = useState(lintJson);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;
    const extensions: Extension[] = [
      bracketMatching(),
      drawSelection(),
      highlightActiveLine(),
      history(),
      indentOnInput(),
      lineNumbers(),
      EditorView.lineWrapping,
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      json(),
      codeEditorTheme,
      ...(localLintJson ? [linter(jsonParseLinter())] : []),
      readOnlyCompartment.of([]),
      EditorView.contentAttributes.of(
        localInitialAriaLabel ? { "aria-label": localInitialAriaLabel } : {},
      ),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) onChangeRef.current?.(u.state.doc.toString());
      }),
    ];
    const view = new EditorView({
      parent,
      state: EditorState.create({ doc: initialDoc, extensions }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [initialDoc, localInitialAriaLabel, localLintJson]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: readOnlyCompartment.reconfigure(readOnlyExtensions(!!readOnly)),
    });
  }, [readOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value)
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
  }, [value]);

  return <div ref={containerRef} className={className} />;
}
