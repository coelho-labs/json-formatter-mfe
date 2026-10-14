# JSON Formatter MFE

Módulo remoto (Micro Frontend) utilitário do ecossistema Coelho Labs. Ferramenta de JSON 100% client-side — formatar, minificar, validar e transformar — servida ao `portal-shell` via Module Federation.

## O que é

- Remote de negócio/utilitário, sem backend (roda inteiramente no browser).
- Roda standalone para desenvolvimento; em produção é consumido pelo Core (`portal-shell`).
- Expõe a entrada única `./RemoteAppEntry` (apenas `<Routes>`, roteamento relativo).

## Funcionalidades

- Formatar (indentação 2/4 espaços ou tab) e minificar.
- Validar com mensagem + posição (e lint inline no editor).
- Ordenar chaves (A-Z), escape/unescape, árvore colapsável.
- Copiar para o clipboard, baixar arquivo e upload/drag&drop de `.json`.

## Stack

React 19 (React Compiler) · React Router 7 · Vite 8 · TypeScript 6 · Tailwind v4 · shadcn (Base UI) · CodeMirror 6 · `@module-federation/vite` (oficial).

## Comandos

```bash
npm install
npm run dev      # servidor dev (Vite) — http://localhost:4177
npm run build    # tsc -b && vite build (typecheck faz parte do build)
npm run lint     # eslint .
npm run preview  # servidor de produção (4177, com CORS para o host)
```

## Contrato MFE

- Remote name `json-formatter` · entrada `json-formatter/RemoteAppEntry` · manifest `http://localhost:4177/mf-manifest.json`.
- Standalone: rotas sob `/json-formatter/*`; no host: `/json-formatter/*` (navegação relativa, o prefixo pode variar).
- `react`, `react-dom` e `react-router-dom` compartilhados como `singleton: true` (alinhados a 19.3.0 / 7.18.4 nos três remotes e no core).
- Tema por duplicação idêntica do `src/index.css` do `portal-shell` (não alterar tokens aqui).
- Config: `VITE_ORIGIN` (dev, default `http://localhost:4177`) e `VITE_BASE` (build; barra final).
- Preview local na porta 4177 com CORS liberado (`preview.headers`), permitindo a integração com o host em build.

## Documentação

- `AGENTS.md` — contrato de arquitetura e regras (fonte para agentes de IA).
- `plan.md` — status de implementação e decisões.
