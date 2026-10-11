# plan.md — JSON Formatter MFE

Plano de implementação e **única fonte de status** do repositório.
O `AGENTS.md` descreve o contrato (atemporal); este arquivo descreve o andamento.

## Legenda

⬜ pendente · 🟨 em andamento · ✅ concluído · ⏸️ postergado · ❌ cancelado

## Status por fase

| Fase | Descrição | Status | Commit |
| ---- | --------- | ------ | ------ |
| 0 | Saneamento e base navegável | ✅ | (a commitar) |
| 1 | Núcleo puro `src/lib/json.ts` | ⬜ | — |
| 2 | Integração CodeMirror (theme + CodeEditor) | ⬜ | — |
| 3 | Ferramenta núcleo em texto | ⬜ | — |
| 4 | Extras puros (sort/escape/unescape) | ⬜ | — |
| 5 | Tree view | ⬜ | — |
| 6 | Upload / Drag & Drop | ⬜ | — |
| 7 | Docs + a11y/responsivo + .env.example | ⬜ | — |
| 8 | Verificação de integração final | ⬜ | — |

## Detalhamento das fases

> Cada fase é commitável e retomável. Verificação padrão ao fim de toda fase: `npm run lint` + `npm run build`.

### Fase 0 — Saneamento e base navegável
- Objetivo: desacoplar do planning-poker e ter shell + rotas + landing navegáveis.
- Entregáveis: `module-federation.config.ts` (name `json-formatter`); `index.html` (título/descrição); `src/App.tsx` (shell `/json-formatter/*`); `src/RemoteAppEntry.tsx` (`<Routes>`: index→Home, tool→Tool); `src/pages/home/Home.page.tsx` (landing do formatter); `src/pages/tool/Tool.page.tsx` (placeholder); copiar `components/ui/{badge,button,card}.tsx` do `planning-poker-mfe`.
- Aceite: lint+build limpos; `npm run dev` navega landing → `/json-formatter/tool`.
- Notas: ainda sem CodeMirror.

### Fase 1 — Núcleo puro `src/lib/json.ts`
- Objetivo: funções puras, sem I/O.
- Entregáveis: tipos `IndentOption`/`JsonError`/`JsonResult`; `formatJson`, `minifyJson`, `validateJson`; derivar `line`/`column` a partir de `position`.
- Deps: —. Aceite: lint+build; sem API de browser.

### Fase 2 — Integração CodeMirror
- Objetivo: wrapper de editor com tema por tokens.
- Entregáveis: deps `@codemirror/*` + `@lezer/highlight`; `components/code-editor/theme.ts`; `components/code-editor/CodeEditor.tsx`; copiar `ui/{label,select,separator,tooltip}.tsx` conforme uso.
- Aceite: editor editável; tema segue `.dark`; sem violar `react-hooks/refs`; CM fora do `shared`.
- Notas: instalar deps é com o dono.

### Fase 3 — Ferramenta núcleo (texto)
- Objetivo: formatar/minificar/validar/copiar/baixar/limpar.
- Entregáveis: `pages/tool/hooks/useJsonFormatter.ts`; `components/{Toolbar,JsonInput,JsonOutput}.tsx`; `Tool.page.tsx`.
- Deps: 1, 2. Aceite: ações núcleo ok; `await` em `try/catch`; a11y básica.

### Fase 4 — Extras puros
- Entregáveis: `sortJsonKeys`/`escapeJson`/`unescapeJson` em `lib/json.ts` + botões na Toolbar.
- Deps: 3. Aceite: Ordenar/Escape/Unescape ok.

### Fase 5 — Tree view
- Entregáveis: `JsonTreeView.tsx` + toggle Texto/Árvore (`view` no hook).
- Deps: 3. Aceite: árvore colapsável acessível (`aria-expanded`).

### Fase 6 — Upload / Drag & Drop
- Entregáveis: zona de drop + `<input type="file" hidden>` com label em `JsonInput`.
- Deps: 3. Aceite: carrega `.json` por drop e seleção; a11y.

### Fase 7 — Docs e ajustes finais
- Entregáveis: README, plan.md (status), `.env.example` (`VITE_ORIGIN`/`VITE_BASE`); revisão a11y/responsivo; ajustar AGENTS se alguma convenção mudou.
- Deps: todas. Aceite: docs coerentes; lint+build.

### Fase 8 — Verificação final
- Entregáveis: nenhum código; checagens.
- Aceite: `diff ../portal-shell/src/index.css src/index.css` vazio; `npm run build`; `npm run preview`; `mf-manifest.json` gerado.

## Decisões (log datado)

### 2026-10-11 — Kickoff, diagnóstico e desenho

**Estado do repo no kickoff**
- Cópia parcial do `planning-poker-mfe`; sem commit (branch `main` vazia) e sem `node_modules`.
- Ainda referencia planning-poker em: `module-federation.config.ts` (name), `index.html`, `src/App.tsx`, `src/RemoteAppEntry.tsx`, `src/pages/home/Home.page.tsx`.
- `src/RemoteAppEntry.tsx` importa páginas inexistentes (`pages/create-room`, `pages/room`).
- Ausentes (descritos no AGENTS como alvo): `src/components/ui/*`, `src/pages/tool/*`, `src/lib/json.ts`.
- `src/index.css` já byte-idêntico ao `portal-shell/src/index.css` (não tocar).

**Escopo funcional aprovado**
- Núcleo: formatar (indent 2/4/tab), minificar, validar (erro + posição), copiar, baixar.
- Extras: ordenar chaves (A-Z), escape/unescape, árvore colapsável (tree view), upload/drag&drop de `.json`.
- Fora de escopo: compartilhar via URL, query JSONPath.

**Stack / técnica**
- Editor: **CodeMirror 6** granular (`@codemirror/*` + `@lezer/highlight`), syntax highlight; tema por tokens `var(--...)` (segue `.dark` pelo cascade, sem MutationObserver). NÃO entra no `shared`.
- Sem test runner (mantém o AGENTS): verificação = `npm run lint` + `npm run build`.

**Semântica de escape/unescape (provisória/vetável)**
- `escapeJson`: `JSON.stringify(texto)` → literal escapado.
- `unescapeJson`: `JSON.parse` de string literal → conteúdo.

**Documentação**
- Papéis: AGENTS.md = contrato atemporal (sem status); README.md = onboarding humano; plan.md = status/decisões.
- Workflow: ao pedir "atualiza docs", propor o diff antes de escrever.
- Precedência: AGENTS.md do repo vence o `../AGENTS.md` da raiz (desatualizado).

**Forma de trabalho**
- Fases pequenas e retomáveis; o dono implementa e commita; o agente detalha a fase e faz code review (salvo pedido explícito para implementar).

### 2026-10-11 — Fase 0 concluída (saneamento e base navegável)

- Entregue: MF `name: json-formatter`; `index.html`; shell standalone em `/json-formatter/*`; `RemoteAppEntry` (Routes: index→Home, tool→Tool); landing do formatter; `Tool.page` placeholder; UI base copiada (`badge`, `button`, `card`).
- Verificação: `npm run lint` limpo; `npm run build` verde (DTS ok; `remoteEntry.js` + `mf-manifest.json` gerados); `diff` do `index.css` vazio; `grep` de resíduos planning-poker vazio; `dev` (4177) e `preview` (4173) sobem.
- Revisão: contratos MFE validados (sem router no entry, navegação relativa `relative="path"`, `RemoteAppEntry` fora do `exposes`).
- Observações: `vite` resolveu para 8.3.4; Fase 0 ainda **não commitada**.

## Pendências / pontos abertos
- Confirmar semântica de escape/unescape (acima está provisória).
- (Fora do escopo deste repo) `../AGENTS.md` da raiz cita `@originjs` e planning-poker.
- Corrigir a versão do `vite` na tabela do `AGENTS.md` (instalado 8.3.4; tabela diz 8.2.1) — fazer na Fase 7.

## Armadilhas aprendidas (reviews)
- (vazio — preencher conforme os reviews acontecem)

## Última atualização
- 2026-10-11 · commit base: nenhum (Fase 0 implementada e verificada, ainda não commitada)
