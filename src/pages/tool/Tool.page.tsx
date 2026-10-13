import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { useJsonFormatter } from "./hooks/useJsonFormatter.ts";
import { JsonInput } from "./components/JsonInput.tsx";
import { JsonOutput } from "./components/JsonOutput.tsx";
import { Toolbar } from "./components/Toolbar.tsx";

const INITIAL = `{
  "hello": "world",
  "n": 42,
  "ok": true,
  "nothing": null
}`;

export default function Tool() {
  const formatter = useJsonFormatter(INITIAL);
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pt-8 pb-12">
      <div className="flex items-start gap-3">
        <Button
          variant="outline"
          size="sm"
          render={<Link to=".." relative="path" />}
        >
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Ferramenta JSON
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Formate, minifique e valide JSON — 100% no navegador.
          </p>
        </div>
      </div>

      <Toolbar
        indent={formatter.indent}
        onIndentChange={formatter.setIndent}
        hasInput={formatter.hasInput}
        hasOutput={formatter.hasOutput}
        copyStatus={formatter.copyStatus}
        error={formatter.error}
        validated={formatter.validated}
        onFormat={formatter.format}
        onMinify={formatter.minify}
        onValidate={formatter.validate}
        onCopy={formatter.copy}
        onDownload={formatter.download}
        onClear={formatter.clear}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JsonInput value={formatter.input} onChange={formatter.setInput} />
        <JsonOutput value={formatter.output} />
      </div>
    </section>
  );
}
