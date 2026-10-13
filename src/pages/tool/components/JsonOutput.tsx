import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { CodeEditor } from "@/components/code-editor/CodeEditor.tsx";

type JsonOutputProps = {
  value: string;
};

export function JsonOutput({ value }: Readonly<JsonOutputProps>) {
  const hasValue = value.trim() !== "";
  return (
    <Card className="h-full" size="sm">
      <CardHeader>
        <h2 className="font-heading text-sm leading-snug font-medium text-muted-foreground">
          Saída
        </h2>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="relative h-80 overflow-hidden rounded-lg border border-border">
          <CodeEditor
            value={value}
            readOnly
            initialAriaLabel="Saída JSON formatada"
            className="h-80"
          />
          {!hasValue && (
            <p
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted-foreground"
            >
              O resultado aparecerá aqui
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
