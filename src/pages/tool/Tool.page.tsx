import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useJsonFormatter } from "./hooks/useJsonFormatter.ts";
import { JsonInput } from "./components/JsonInput.tsx";
import { JsonOutput } from "./components/JsonOutput.tsx";
import { Toolbar } from "./components/Toolbar.tsx";
import { JsonTreeView } from "./components/JsonTreeView.tsx";

export default function Tool() {
  const formatter = useJsonFormatter();
  return (
    <section className="flex h-full flex-col w-full mx-auto max-w-5xl flex-1 flex-col gap-6 px-4 pt-8 pb-12">
      <div className="flex flex-col items-start">
        <Link
          to="../.."
          relative="path"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </Link>
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
        canShowTree={formatter.canShowTree}
        copyStatus={formatter.copyStatus}
        error={formatter.error}
        escape={formatter.escape}
        hasInput={formatter.hasInput}
        hasOutput={formatter.hasOutput}
        indent={formatter.indent}
        onClear={formatter.clear}
        onCopy={formatter.copy}
        onDownload={formatter.download}
        onFormat={formatter.format}
        onIndentChange={formatter.setIndent}
        onMinify={formatter.minify}
        onValidate={formatter.validate}
        setView={formatter.setView}
        sortKeys={formatter.sortKeys}
        unescape={formatter.unescape}
        validated={formatter.validated}
        view={formatter.view}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <JsonInput
          fileError={formatter.fileError}
          value={formatter.input}
          onChange={formatter.setInput}
          onLoadFile={formatter.loadFile}
        />
        {formatter.view === "text" ? (
          <JsonOutput value={formatter.output} />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Árvore (leitura)</h2>
            </div>
            {formatter.treeValue !== null ? (
              <JsonTreeView value={formatter.treeValue} className="h-[420px]" />
            ) : (
              <div className="text-sm text-muted-foreground">
                Nada para exibir
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
