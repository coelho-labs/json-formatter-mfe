import type { LucideIcon } from "lucide-react";
import { Braces, Minimize2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Braces,
    title: "Formatar",
    description:
      "Deixe o JSON legível com indentação de 2 ou 4 espaços (ou tab).",
  },
  {
    icon: Minimize2,
    title: "Minificar",
    description:
      "Compacte o JSON removendo espaços e quebras de linha desnecessários.",
  },
  {
    icon: ShieldCheck,
    title: "Validar",
    description:
      "Detecte erros de sintaxe com mensagem e posição (linha e coluna).",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
          <feature.icon className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-1">
          <CardTitle>{feature.title}</CardTitle>
          <CardDescription>{feature.description}</CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col w-full">
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-4 pt-4 pb-8 lg:pt-14 text-center">
        <Badge variant="outline" className="uppercase tracking-wide">
          UTILITÁRIO DEV · RÁPIDO & SEGURO
        </Badge>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Formatador e Validador JSON
        </h1>
        <p className="max-w-xl text-pretty text-muted-foreground">
          Formate, minifique e valide dados JSON instantaneamente no navegador
          com diagnóstico de erros e realce de sintaxe.
        </p>
        <Button
          size="lg"
          className="m-auto"
          render={<Link to="tool" relative="path" />}
        >
          Abrir ferramenta
        </Button>
      </section>

      <section
        className="mx-auto w-full max-w-5xl px-4 pb-8"
        aria-labelledby="features-heading"
      >
        <h2
          id="features-heading"
          className="mb-6 text-center text-xl font-semibold"
        >
          O que a ferramenta faz
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="h-full">
              <FeatureCard feature={feature} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
