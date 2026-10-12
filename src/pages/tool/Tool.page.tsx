import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/code-editor/CodeEditor.tsx";

const INITIAL = `{
  "hello": "world",
  "n": 42,
  "ok": true,
  "nothing": null
}`;

export default function Tool() {
  const [value, setValue] = useState(INITIAL);
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-4 pt-20 pb-12 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Ferramenta JSON</h1>
      <p className="max-w-xl text-pretty text-muted-foreground">
        Em construção — aqui entrará o editor de formatação de JSON.
      </p>
      <Button variant="outline" render={<Link to=".." relative="path" />}>
        Voltar
      </Button>
      <div className="w-full overflow-hidden rounded-lg border border-border">
        <CodeEditor
          value={value}
          onChange={setValue}
          initialAriaLabel="Editor JSON de entrada"
          className="h-72"
        />
      </div>

      <div className="w-full overflow-hidden rounded-lg border border-border">
        <CodeEditor
          value={value}
          readOnly
          initialAriaLabel="Prévia somente leitura"
          className="h-40"
        />
      </div>
    </section>
  );
}
