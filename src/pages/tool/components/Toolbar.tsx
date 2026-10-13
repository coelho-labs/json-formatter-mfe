import { useId } from "react";
import {
  ArrowUpDown,
  Braces,
  CircleCheck,
  Copy,
  Download,
  ListTree,
  Minimize2,
  Quote,
  Type,
  Trash2,
  Undo2,
} from "lucide-react";
import type { IndentOption, JsonError } from "@/lib/json.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip.tsx";
import type { FormatStatus } from "../hooks/useJsonFormatter.ts";

const indentOptions = [
  { value: "2", label: "2 espaços" },
  { value: "4", label: "4 espaços" },
  { value: "\t", label: "Tab" },
] as const;

function toIndentOption(value: string): IndentOption {
  if (value === "\t") return "\t";
  if (value === "4") return 4;
  return 2;
}

function formatError(error: JsonError): string {
  const at =
    error.line > 0 && error.column > 0
      ? ` (linha ${error.line}, coluna ${error.column})`
      : "";
  return `${error.message}${at}`;
}

type ToolbarProps = {
  canShowTree: boolean;
  copyStatus: FormatStatus;
  error: JsonError | null;
  hasInput: boolean;
  hasOutput: boolean;
  indent: IndentOption;
  validated: boolean | null;
  view: "text" | "tree";
  escape: () => void;
  onClear: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onFormat: () => void;
  onIndentChange: (indent: IndentOption) => void;
  onMinify: () => void;
  onValidate: () => void;
  setView: (v: "text" | "tree") => void;
  sortKeys: () => void;
  unescape: () => void;
};

export function Toolbar({
  canShowTree,
  copyStatus,
  error,
  hasInput,
  hasOutput,
  indent,
  validated,
  view,
  escape,
  onClear,
  onCopy,
  onDownload,
  onFormat,
  onIndentChange,
  onMinify,
  onValidate,
  setView,
  sortKeys,
  unescape,
}: Readonly<ToolbarProps>) {
  const selectId = useId();
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={selectId}>Indentação</Label>
            <Select
              value={String(indent)}
              onValueChange={(v) => onIndentChange(toIndentOption(v ?? "2"))}
            >
              <SelectTrigger id={selectId} className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {indentOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator orientation="vertical" className="h-5" />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button size="sm" disabled={!hasInput} onClick={onFormat}>
                  <Braces /> Formatar
                </Button>
              }
            />
            <TooltipContent>
              Embelezar com a indentação escolhida
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sortKeys}
                  disabled={!hasInput}
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Ordenar chaves
                </Button>
              }
            ></TooltipTrigger>
            <TooltipContent>Ordena chaves A–Z recursivamente</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasInput}
                  onClick={onMinify}
                >
                  <Minimize2 /> Minificar
                </Button>
              }
            />
            <TooltipContent>Remover espaços e quebras de linha</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={escape}
                  disabled={!hasInput}
                >
                  <Quote className="mr-2 h-4 w-4" />
                  Escape
                </Button>
              }
            />
            <TooltipContent>
              Escapa texto para literal JSON (JSON.stringify)” — curto e claro.
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={unescape}
                  disabled={!hasInput}
                >
                  <Undo2 className="mr-2 h-4 w-4" />
                  Unescape
                </Button>
              }
            />
            <TooltipContent>
              Converte string literal JSON → conteúdo
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasInput}
                  onClick={onValidate}
                >
                  <CircleCheck /> Validar
                </Button>
              }
            />
            <TooltipContent>Checar a sintaxe e apontar o erro</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-5" />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView(view === "text" ? "tree" : "text")}
                  disabled={!canShowTree && view === "text"}
                  aria-pressed={view === "tree"}
                />
              }
            >
              {view === "text" ? (
                <ListTree className="mr-2 h-4 w-4" />
              ) : (
                <Type className="mr-2 h-4 w-4" />
              )}
              {view === "text" ? "Árvore" : "Texto"}
            </TooltipTrigger>
            <TooltipContent>
              {view === "text"
                ? "Ver em árvore colapsável"
                : "Ver em modo texto"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasOutput}
                  onClick={onCopy}
                >
                  <Copy /> {copyStatus === "copied" ? "Copiado" : "Copiar"}
                </Button>
              }
            />
            <TooltipContent>
              Copiar a saída para a área de transferência
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasOutput}
                  onClick={onDownload}
                >
                  <Download /> Baixar
                </Button>
              }
            />
            <TooltipContent>Baixar como json-formatted.json</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button size="sm" variant="outline" onClick={onClear}>
                  <Trash2 /> Limpar
                </Button>
              }
            />
            <TooltipContent>Limpar entrada e saída</TooltipContent>
          </Tooltip>
        </div>

        <div role="status" aria-live="polite" className="flex flex-wrap gap-2">
          {validated === true && <Badge variant="outline">JSON válido</Badge>}
          {validated === false && error && (
            <Badge variant="destructive">Inválido — {formatError(error)}</Badge>
          )}
          {copyStatus === "copied" && (
            <Badge variant="outline">
              Copiado para a área de transferência
            </Badge>
          )}
          {copyStatus === "error" && (
            <Badge variant="destructive">Falha ao copiar</Badge>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
