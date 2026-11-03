# JSON Formatter MFE

Módulo remoto (Micro Frontend) utilitário do ecossistema Coelho Labs. Ferramenta de JSON 100% client-side — formatar, minificar, validar e transformar — servida ao `portal-shell` via Module Federation.

## Requisitos

- Node.js `^24.22.2` (declarado em `engines` no `package.json`).
- npm com suporte ao `package-lock.json` (o repositório usa npm).
- Navegador moderno (ES2023); não há backend nem dependência de runtime no servidor.

## O que é

- Remote de negócio/utilitário, sem backend (roda inteiramente no browser).
- Roda standalone para desenvolvimento; em produção é consumido pelo Core (`portal-shell`).
- Expõe a entrada única `./RemoteAppEntry` (apenas `<Routes>`, roteamento relativo).

## Funcionalidades

- Formatar (indentação 2/4 espaços ou tab) e minificar.
- Validar com mensagem em pt-BR + posição (e lint inline no editor).
- Ordenar chaves (A-Z), escape/unescape, árvore colapsável.
- Copiar para o clipboard, baixar arquivo e upload/drag&drop de `.json`.

## Stack

React 19 (React Compiler) · React Router 7 · Vite 8 · TypeScript 6 · Tailwind v4 · shadcn (Base UI) · CodeMirror 6 · `@module-federation/vite` (oficial).

## Como rodar

```bash
npm ci                 # ou npm install
cp .env.example .env   # opcional: os defaults funcionam sem .env
npm run dev            # http://localhost:4177/json-formatter/
```

Para validar a build de produção localmente:

```bash
npm run build
npm run preview        # http://localhost:4177 (CORS liberado para o host)
```

## Comandos

```bash
npm run dev      # servidor dev (Vite) — http://localhost:4177
npm run build    # tsc -b && vite build (typecheck faz parte do build)
npm run lint     # eslint .
npm run preview  # servidor de produção (4177, com CORS para o host)
```

## Testes

Este projeto usa Vitest como runner padrão, com React Testing Library e `user-event` para testar comportamento real de componentes e hooks.

```bash
npm run test        # executa a suíte em modo run
npm run test:watch  # modo watch
npm run test:types  # typecheck dos arquivos de teste
```

A suíte unitária é o fluxo principal de validação do domínio. A cobertura por mutação fica reservada para a etapa posterior com StrykerJS, e não como comando obrigatório no ciclo diário.

## Verificação

A verificação padrão de uma mudança é:

```bash
npm run lint
npm run test
npx tsc -p tsconfig.app.json --noEmit
npm run build
```

## Estrutura

- `src/RemoteAppEntry.tsx` — entrada exposta (`./RemoteAppEntry`), somente `<Routes>` com roteamento relativo.
- `src/main.tsx` / `src/App.tsx` — shell standalone de desenvolvimento (BrowserRouter + rota `/json-formatter/*`).
- `src/pages/` — landing (`home/`) e ferramenta (`tool/`, com hooks/componentes co-localizados).
- `src/lib/json.ts` — helpers puros e tradução das mensagens de parse.
- `src/components/code-editor/` — wrapper do CodeMirror 6 e tema por tokens.
- `module-federation.config.ts` / `vite.config.ts` — federation, portas, env e CORS do preview.

## Contrato MFE

- Remote name `json-formatter` · entrada `json-formatter/RemoteAppEntry` · manifest `http://localhost:4177/mf-manifest.json`.
- O core registra o remote estaticamente com `entry` apontando para o `mf-manifest.json` (não para `remoteEntry.js`), por exemplo:
  `"json-formatter": { type: "module", name: "json-formatter", entry: ".../mf-manifest.json" }`.
- Standalone: rotas sob `/json-formatter/*`; no host, o prefixo é definido pelo core (`/json-formatter/*` hoje), mas a navegação interna é relativa e não depende dele.
- `react`, `react-dom` e `react-router-dom` compartilhados como `singleton: true`; mantenha as mesmas versões do core/remotes (confira com `npm ls react react-dom react-router-dom`).
- Tema por duplicação idêntica do `src/index.css` do `portal-shell` (não alterar tokens aqui).
- Config: `VITE_ORIGIN` (dev, default `http://localhost:4177`) e `VITE_BASE` (build; exige barra final, ex. `https://cdn.../json-formatter/`); veja `.env.example`.
- Preview local na porta 4177 com CORS liberado (`preview.headers`), permitindo a integração com o host em build.
- Deploy: publique `dist/` preservando `mf-manifest.json`, `remoteEntry.js` e os assets; o host deve conseguir acessar o manifest com CORS.

## Documentação

- `AGENTS.md` — contrato de arquitetura e regras (fonte para agentes de IA).
- `plan.md` — status de implementação e decisões.
