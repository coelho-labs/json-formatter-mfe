import { CodeEditor } from "@/components/code-editor/CodeEditor.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { DragEvent } from "react";

type JsonInputProps = {
  fileError?: string | null;
  value: string;
  onChange?: (value: string) => void;
  onLoadFile: (file: File) => void;
};

export function JsonInput({
  fileError,
  value,
  onChange,
  onLoadFile,
}: Readonly<JsonInputProps>) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node))
      setIsDragging(false);
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onLoadFile(file);
  };
  return (
    <Card className="h-full" size="sm">
      <CardHeader>
        <h2 className="font-heading text-sm leading-snug font-medium text-muted-foreground">
          Entrada JSON
        </h2>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative h-80 overflow-hidden rounded-lg border",
            isDragging ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          <CodeEditor
            value={value}
            onChange={onChange}
            lintJson
            initialAriaLabel="Editor JSON de entrada"
            className="h-80"
          />
          {isDragging && (
            <p
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground"
            >
              Solte o arquivo aqui
            </p>
          )}
        </div>
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onLoadFile(file);
            event.target.value = "";
          }}
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload /> Carregar arquivo
          </Button>
          <label className="text-xs text-muted-foreground" htmlFor={inputId}>
            ou arraste um arquivo .json
          </label>
        </div>
        {fileError && (
          <Badge variant="destructive" role="alert">
            {fileError}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
