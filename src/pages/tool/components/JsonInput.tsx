import { CodeEditor } from "@/components/code-editor/CodeEditor.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";

type JsonInputProps = {
  value: string;
  onChange?: (value: string) => void;
};

export function JsonInput({ value, onChange }: Readonly<JsonInputProps>) {
  return (
    <Card className="h-full" size="sm">
      <CardHeader>
        <h2 className="font-heading text-sm leading-snug font-medium text-muted-foreground">
          Entrada JSON
        </h2>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="relative h-80 overflow-hidden rounded-lg border border-border">
          <CodeEditor
            value={value}
            onChange={onChange}
            lintJson
            initialAriaLabel="Editor JSON de entrada"
            className="h-80"
          />
        </div>
      </CardContent>
    </Card>
  );
}
