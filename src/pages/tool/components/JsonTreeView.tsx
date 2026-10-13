import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type JsonTreeViewProps = {
  value: unknown;
  className?: string;
};

type TreeNodeType =
  | "array"
  | "boolean"
  | "null"
  | "number"
  | "object"
  | "string";

function getType(v: unknown): TreeNodeType {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  const t = typeof v;
  if (t === "string" || t === "number" || t === "boolean") return t;
  return "object";
}

function formatPrimitive(v: unknown, t: TreeNodeType): string {
  if (t === "string") return JSON.stringify(v);
  if (t === "null") return "null";
  return String(v);
}

type NodeProps = {
  collapsed: Set<string>;
  expanded: boolean;
  label?: string;
  onToggle: (path: string) => void;
  path: string;
  root?: boolean;
  value: unknown;
};

function Node({
  collapsed,
  expanded,
  label,
  onToggle,
  path,
  value,
}: Readonly<NodeProps>) {
  const t = getType(value);
  if (t !== "object" && t !== "array") {
    return (
      <div className="ml-4 flex gap-1 text-sm font-mono">
        {label !== undefined && <span className="text-blue-500">{label}:</span>}
        <span
          className={cn(
            t === "string" && "text-green-600 dark:text-green-400",
            t === "number" && "text-yellow-600 dark:text-yellow-400",
            (t === "boolean" || t === "null") &&
              "text-purple-600 dark:text-purple-400",
          )}
        >
          {formatPrimitive(value, t)}
        </span>
      </div>
    );
  }
  const isArr = t === "array";
  const entries = isArr
    ? (value as unknown[])
    : Object.keys(value as Record<string, unknown>);
  const collapsedLabel = isArr
    ? `[${entries.length} items]`
    : `{${entries.length} keys}`;
  if (!expanded) {
    return (
      <div className="ml-2 flex items-center gap-1 text-sm font-mono">
        <button
          type="button"
          aria-expanded={false}
          aria-label="Expand"
          className="inline-flex h-4 w-4 items-center justify-center"
          onClick={() => onToggle(path)}
        >
          <ChevronRight className="h-3 w-3" />
        </button>
        {label !== undefined && <span className="text-blue-500">{label}:</span>}
        <span className="text-muted-foreground">{collapsedLabel}</span>
      </div>
    );
  }
  return (
    <div className="ml-2">
      <div className="flex items-center gap-1 text-sm font-mono">
        <button
          type="button"
          aria-expanded={true}
          aria-label="Collapse"
          className="inline-flex h-4 w-4 items-center justify-center"
          onClick={() => onToggle(path)}
        >
          <ChevronDown className="h-3 w-3" />
        </button>
        {label !== undefined && <span className="text-blue-500">{label}:</span>}
        <span className="text-muted-foreground">{isArr ? "[" : "{"}</span>
      </div>
      <div className="ml-4">
        {isArr
          ? (value as unknown[]).map((item, i) => {
              const childPath = `${path}[${i}]`;
              return (
                <Node
                  key={childPath}
                  value={item}
                  path={childPath}
                  label={String(i)}
                  expanded={!collapsed.has(childPath)}
                  collapsed={collapsed}
                  onToggle={onToggle}
                />
              );
            })
          : Object.keys(value as Record<string, unknown>).map((k) => {
              const obj = value as Record<string, unknown>;
              const childPath = `${path}${path ? "." : ""}${k}`;
              return (
                <Node
                  collapsed={collapsed}
                  expanded={!collapsed.has(childPath)}
                  key={childPath}
                  label={k}
                  onToggle={onToggle}
                  path={childPath}
                  value={obj[k]}
                />
              );
            })}
      </div>
      <div className="ml-2 text-sm font-mono text-muted-foreground">
        {isArr ? "]" : "}"}
      </div>
    </div>
  );
}

export function JsonTreeView({
  value,
  className,
}: Readonly<JsonTreeViewProps>) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const toggle = (p: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };
  return (
    <div
      className={cn("overflow-auto rounded-md border bg-card p-3", className)}
    >
      <Node
        collapsed={collapsed}
        expanded={!collapsed.has("")}
        onToggle={toggle}
        path=""
        root
        value={value}
      />
    </div>
  );
}
