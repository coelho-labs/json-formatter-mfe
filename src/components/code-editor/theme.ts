import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import type { Extension } from "@codemirror/state";

const editorTheme = EditorView.theme({
  "&": {
    color: "var(--foreground)",
    backgroundColor: "var(--background)",
    fontSize: "13px",
    height: "100%",
  },
  ".cm-content": {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
    caretColor: "var(--foreground)",
    padding: "0.5rem 0",
  },
  ".cm-scroller": { fontFamily: "inherit", lineHeight: "1.6" },
  ".cm-gutters": {
    backgroundColor: "var(--muted)",
    color: "var(--muted-foreground)",
    border: "none",
    borderRight: "1px solid var(--border)",
  },
  ".cm-activeLine": { backgroundColor: "var(--accent)" },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--accent)",
    color: "var(--accent-foreground)",
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--foreground)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
    backgroundColor: "var(--accent)",
  },
  ".cm-panels": {
    backgroundColor: "var(--card)",
    color: "var(--card-foreground)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
  },
});

const jsonHighlightStyle = HighlightStyle.define([
  { tag: tags.propertyName, color: "var(--syntax-property)" },
  { tag: tags.string, color: "var(--syntax-string)" },
  { tag: tags.number, color: "var(--syntax-number)" },
  { tag: [tags.bool, tags.null], color: "var(--syntax-literal)" },
  { tag: [tags.punctuation, tags.separator], color: "var(--muted-foreground)" },
  { tag: tags.invalid, color: "var(--destructive)" },
]);

export const codeEditorTheme: Extension = [
  editorTheme,
  syntaxHighlighting(jsonHighlightStyle),
];
