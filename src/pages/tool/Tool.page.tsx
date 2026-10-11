import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Tool() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-4 pt-20 pb-12 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Ferramenta JSON</h1>
      <p className="max-w-xl text-pretty text-muted-foreground">
        Em construção — aqui entrará o editor de formatação de JSON.
      </p>
      <Button variant="outline" render={<Link to=".." relative="path" />}>
        Voltar
      </Button>
    </section>
  );
}