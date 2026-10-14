# plan.md — JSON Formatter MFE

Plano de implementação e **única fonte de status** do repositório.
O `AGENTS.md` descreve o contrato (atemporal); este arquivo descreve o andamento.

## Legenda

⬜ pendente · 🟨 em andamento · ✅ concluído · ⏸️ postergado · ❌ cancelado

## Status por fase

| Fase | Descrição | Status | Commit |
| ---- | --------- | ------ | ------ |
| 0 | Saneamento e base navegável | ✅ | c4fa071 |
| 1 | Núcleo puro `src/lib/json.ts` | ✅ | 1a529e6 |
| 2 | Integração CodeMirror (theme + CodeEditor) | ✅ | 2400e19 |
| 3 | Ferramenta núcleo em texto | ✅ | 618343a |
| 4 | Extras puros (sort/escape/unescape) | ✅ | 92aecf8 |
| 5 | Tree view | ✅ | d146e4f |
| 6 | Upload / Drag & Drop | ✅ | 7554d68 |
| 7 | Docs + a11y/responsivo + .env.example | ✅ | — |
| 8 | Verificação de integração final | ✅ | — |

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
- Entregáveis: deps `@codemirror/*` + `@lezer/highlight`; `components/code-editor/theme.ts`; `components/code-editor/CodeEditor.tsx`; tokens `--syntax-*` no `index.css` (os 3 repos, byte-idênticos); smoke do editor em `Tool.page` (provisório, substituído na Fase 3). UI `{label,select,separator,tooltip}` **movida para a Fase 3** (decisão 2026-10-12).
- Aceite: editor editável; tema segue `.dark` via tokens; `readOnly` por Compartment (não recria a view); `aria-label` no contentDOM; CM fora do `shared`; lint+build.
- Notas: instalar deps é com o dono; `index.css` dos 3 repos realinhado a 2 espaços (prettier) — byte-equivalência genuína.

### Fase 3 — Ferramenta núcleo (texto)
- Objetivo: formatar/minificar/validar/copiar/baixar/limpar.
- Entregáveis: `pages/tool/hooks/useJsonFormatter.ts`; `components/{Toolbar,JsonInput,JsonOutput}.tsx`; `Tool.page.tsx`; copiar `ui/{label,select,separator,tooltip}.tsx` (absorvido da Fase 2).
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

### 2026-10-12 — Fase 1 concluída (núcleo puro `src/lib/json.ts`)

- Entregue: tipos `IndentOption`/`JsonError`/`JsonResult`; helpers **privados** `deriveLocation`, `locateError`, `parseJson` (tipo interno `ParseOutcome` com `value: unknown`); públicas `validateJson`, `formatJson`, `minifyJson`.
- Contrato: `validateJson` valida e devolve a própria entrada; `formatJson`/`minifyJson` validam e **re-serializam** (canonicalizam) com indentação / compacto. Em erro, as três devolvem o mesmo `JsonError`.
- Localização do erro: `locateError` prefere `line X column Y` (cobre Firefox/Safari) → senão `position N` (V8) com `deriveLocation` → fallback `-1/-1/-1` (desconhecido).
- Verificação: `npm run lint` + `npx tsc -p tsconfig.app.json --noEmit` + `npm run build` limpos (DTS + `remoteEntry.js`/`mf-manifest.json` gerados).
- Revisões aplicadas: regex `column (?<column>...)` (faltava o espaço — o ramo line/column estava morto); `parseJson` privado com `value: unknown` (tira o `any` de circulação); `.at(-1)` (S7755); `.exec` sobre literal (S6594/S7723); early-return no lugar de `else`; formatação prettier.
- Decisão registrada: no ramo line/column, `position` fica `-1` mesmo quando o V8 informa `at position N` (offset não é consumido pela UI). Sem impacto; reavaliar só se algum consumidor precisar do offset.
- Escopo: `format`/`minify` **não** ordenam chaves (isso é a Fase 4) nem preservam o texto original — re-serializam a partir do valor parseado.

### 2026-10-12 — Fase 2 implementada e revisada (CodeMirror + tema por tokens)

- Entregue: deps `@codemirror/{state,view,commands,language,lang-json,lint}` + `@lezer/highlight`; `components/code-editor/theme.ts` (tema por tokens via `EditorView.theme` + `HighlightStyle`); `components/code-editor/CodeEditor.tsx` (wrapper CM6 com `value`/`onChange`/`readOnly`/`ariaLabel`/`className`); smoke em `Tool.page` (2 editores: entrada editável + prévia read-only).
- Tokens: adicionados `--syntax-property|string|number|literal` em `:root` e `.dark` no `src/index.css`, propagados via `cp` para `../portal-shell/src/index.css` e `../content-delivery-mfe/src/index.css` — os 3 **byte-idênticos** (`diff` vazio). CodeMirror **não** entra no `shared`.
- `index.css` realinhado a 2 espaços/aspas duplas: **descoberta** — a "byte-equivalência" citada na Fase 0 era falsa (este repo nascido em 4 espaços pelo CLI do shadcn; portal/content-delivery em 2 por não terem `.prettierignore`). Os 3 repos foram alinhados ao prettier do repo (`.prettierrc` `tabWidth: 2`); o `diff` anti-drift agora é genuinamente vazio. `.prettierignore` mantido como defesa de config futura (arquivo é prettier-stable).
- `CodeEditor`: `readOnly` via **Compartment** (`reconfigure` no effect de `[readOnly]`; criação com deps `[initialDoc, initialAriaLabel]` — não recria a view nem perde o doc). `aria-label` via `EditorView.contentAttributes` (o `contentDOM` tem `role="textbox"`); `aria-label` num `<div>` sem role não gera nome acessível.
- Decisão: UI `{label,select,separator,tooltip}` adiada para a **Fase 3** (o smoke não as requer).
- Revisões aplicadas: removido `lineNumbers()` duplicado; `contentAttributes.of(...)` estava como **expressão solta** (fora do array de extensions — label morto, e nem eslint/tsc pegam) e foi movido para o array; `Tool.page` com `w-full` nos wrappers (senão `items-center` colapsava os editores); import com extensão `.tsx`.
- Verificação: `npm run lint` + `npx tsc -p tsconfig.app.json --noEmit` + `npm run build` verdes; `npx prettier --check` limpo nos arquivos novos; `diff` dos 3 `index.css` vazio. Commitada em 88b0d57 (deps CM) + b016715 (tokens) + 4d21724 (CodeEditor) + 2400e19 (docs).

### 2026-10-12 — Fase 3 implementada e revisada (ferramenta núcleo em texto)

- Entregue: `pages/tool/hooks/useJsonFormatter.ts` (estado + ações format/minify/validate/copy/download/clear/setInput); `components/{Toolbar,JsonInput,JsonOutput}.tsx`; `Tool.page.tsx` composto; UI `{label,select,separator,tooltip}.tsx` copiada; `CodeEditor` ganhou o prop `lintJson`.
- Decisões: `copyStatus` auto-reseta a "idle" em 2s (useEffect + clearTimeout); `format`/`minify` em erro limpam a Saída (`setOutput("")`) para não exibir resultado stale; tooltips Base UI nos botões (`TooltipProvider` + `TooltipTrigger render={<Button/>}`).
- Revisões aplicadas: pasta `hook/`→`hooks/` (o import de `Tool.page` quebrava o tsc, TS2307); prop `lintJson` ausente no `CodeEditor` (TS2322); `toIndentOption(v ?? "2")` (Base UI Select entrega `string | null`); `JsonOutput` com lógica invertida `value.trim() !== ""`; `FormatStatus` deduplicado (só no hook); imports com extensão; `Readonly<JsonInputProps>`.
- Verificação: `npm run lint` + `npx tsc -p tsconfig.app.json --noEmit` + `npm run build` verdes; smoke (format/minify/validate/copy/download/clear, indent 2/4/tab, `.dark`). Commits 4030ee4/d3f3882/618343a + docs.
- Em aberto: `validate()` **não** limpa a Saída (validar não produz saída — staleness possível); lint inline marca o input vazio (squiggle) — mantido por ora.

### 2026-10-13 — Fase 4 concluída (extras puros)

- Entregue: `sortJsonKeys`/`escapeJson`/`unescapeJson` em `lib/json.ts` + botões Ordenar/Escape/Unescape na Toolbar.
- Semântica confirmada: escape = `JSON.stringify(texto)` (literal escapado); unescape = `JSON.parse` de string literal → conteúdo.
- Commits: 88d47ab (fix refresh), 92aecf8 (feat), b3cd3e7 (docs).

### 2026-10-13 — Fase 5 concluída (tree view)

- Entregue: `JsonTreeView.tsx` (colapsável) + toggle Texto/Árvore (`view` no hook; `treeValue` via `JSON.parse`; `effectiveView` força "text" quando não há saída/erro).
- Fix: botão Árvore desabilitado sem saída (04c8ab5).
- Commits: d146e4f, 04c8ab5.

### 2026-10-13 — Fase 6 concluída (upload / drag & drop)

- Entregue: `loadFile(file)` **async** no hook (`await` em `try/catch`); estado `fileError` (limpo em `setInput`/`validate`/`clear`); `JsonInput` com drop zone (`onDragOver`/`onDragLeave`/`onDrop` + realce via `cn`), `<input type="file" hidden>` acionado por `Button`/ref + label, `Badge destructive` para erro; `Tool.page` propaga `onLoadFile`/`fileError`.
- Decisões: leitura **leniente** (não valida tipo — lint/Validar sinalizam); acesso ao input via `ref` (foco no botão); overlay "Solte o arquivo aqui" com `pointer-events-none`, renderizado **depois** do editor.
- React Compiler: removido o `useMemo` de `treeValue` (memoização automática).
- Correções de review: `??`→`&&` no overlay; import `cn` corrigido para `@/lib/utils`; tooltip do Escape no Toolbar; guard do `dragleave` por `relatedTarget`.
- Verificação: `npm run lint` + `npx tsc -p tsconfig.app.json --noEmit` + `npm run build` + smoke (drop, seleção, teclado, re-seleção).
- Commit: 7554d68.

### 2026-10-13 — Fases 7 e 8 concluídas (docs, integração e alinhamento cross-repo)

- **Versões dos singletons alinhadas** em todo o ecossistema para `react`/`react-dom` 19.3.0 e `react-router-dom` 7.18.4: bump no `portal-shell`, no `json-formatter-mfe`, no `planning-poker-mfe` e no `content-delivery-mfe` (`react`/`react-dom`), com `npm install` nos quatro. Motivo: `requiredVersion` divergente entre singletons pode carregar **duas cópias de React** conforme a ordem de inicialização do share scope. Verificado com `npm ls` (19.3.0 / 7.18.4 nos quatro).
- `shared` do json-formatter **padronizado** ao do core/planning-poker: removidos `react/jsx-runtime` e `react/jsx-dev-runtime` (o `jsx-runtime` resolve via `react` singleton; mantê-los só criava assimetria com os demais remotes).
- **CORS no preview**: `preview.headers["Access-Control-Allow-Origin"] = "*"` nos três remotes, com a **porta de preview espelando a do dev** (4175/4176/4177, `strictPort`) — permite subir os três previews em paralelo e reaproveitar o mesmo `.env` do host em dev e build. Sem CORS, o host recebe `RUNTIME-001`/`Failed to get remoteEntry exports`.
- **Docs reconciliados** com a convenção real do core: `AGENTS.md` e `README.md` passam a citar rota `/json-formatter/*` (era `/json/*`) e o registro do remote **estático** em `module-federation.config.ts` (era `registerRemotes` em runtime). AGENTS/README do comando de preview atualizados para 4177.
- **Junk de lint no core**: `portal-shell/backup_node_modules/` (não rastreado) era varrido pelo ESLint e quebrava o `npm run lint` (um `eslint.config.js` interno requeria `neostandard`). Ignorado em `eslint.config.js` (`globalIgnores`) e no `.gitignore`.
- **Verificação (Fase 8)**: `npm run lint` + `npm run build` verdes nos quatro repos; `diff ../portal-shell/src/index.css src/index.css` vazio; os três `mf-manifest.json` em preview respondem HTTP 200 com `Access-Control-Allow-Origin: *` e o chunk/remoteEntry acessíveis; `json-formatter:RemoteAppEntry` presente no manifest; o host sobe em dev (5173) sem erros e inclui o `loadRemote("json-formatter/RemoteAppEntry")`. Render visual no host é checagem manual (sem browser headless no ambiente).

## Pendências / pontos abertos
- (Fora do escopo deste repo) `../AGENTS.md` da raiz cita `@originjs` e planning-poker.

## Armadilhas aprendidas (reviews)
- Regex de mensagem de engine precisa ser testado contra mensagens **reais**: `column(?<column>\d+)` (sem espaço) não casa `column 3` e o ramo cai silencioso no fallback.
- `JSON.parse` retorna `any`: tipar o retorno como `string` mente e **passa até com `strict`** (o `any` fura). Tipar o parse interno como `unknown` força a conversão explícita (`JSON.stringify`) nas funções públicas.
- Sonar: usar `.exec()` sobre **literal** de regex atende S6594 (prefer `exec` sobre `match`) e não aciona S7723 (que só pega `RegExp(...)` sem `new`); `new RegExp(/literal/)` é redundante. Array: preferir `.at(-1)` a `[length - 1]` (S7755).
- O `eslint.config.js` **não** integra prettier → formatação (espaços extras, `;` faltando) não é pega no `npm run lint`; depende do prettier na IDE/`--write`.
- `JSON.stringify(value, replacer?, space?)` tipa `string` (não `string | undefined`) na lib do TS 6 instalada — `?? ""` desnecessário.
- Chamada solta de função que **retorna** algo (ex. `EditorView.contentAttributes.of({...})` fora do array de extensions) não tem efeito e **nenhuma regra pega**: tsc passa e o ESLint permite calls em `no-unused-expressions`. Revisar manualmente "expressões órfãs" que retornam extensões/effects.
- `aria-label` num `<div>` sem role (ou em container externo) não gera nome acessível: no CM6 vai em `EditorView.contentAttributes` (o `contentDOM` tem `role="textbox"`). E o CM **já emite `aria-readonly="true"` sozinho** via `state.readOnly` — não adicionar manualmente.
- Byte-equivalência exige `diff` real: o CLI do shadcn gera `index.css` em 4 espaços/aspas simples; o prettier (`tabWidth: 2`) normaliza para 2/aspas duplas. Repo sem `.prettierignore` ficou 2; o que tinha ignore ficou 4 — "mesmo conteúdo" não é byte-idêntico. Conferir sempre `diff` + `npx prettier --check`.
- ESLint/tsc não pegam lógica booleana invertida: `value.trim()! == ""` (o `!` non-null e o `==` solto) compila e passa no lint; o bug só aparece em runtime. Revisar comparações à mão.
- Nome de pasta vs import diverge e só falha no typecheck: `hook/` (singular) com import `./hooks/useJsonFormatter.ts` → TS2307; manter a pasta alinhada ao contrato (`hooks/` plural).
- `{flag ?? (<jsx/>)}` com `flag: boolean` **nunca renderiza**: `??` só decide em `null`/`undefined`, e o React ignora `true`/`false` como children. Nem tsc nem ESLint (sem `no-unnecessary-condition`) acusam — usar `&&`.
- Import com extensão errada (`@/lib/utils.tsx` para um `.ts`) só falha na resolução de módulo (TS2307/Vite): conferir a extensão real; `ui/*` importam `@/lib/utils` **sem** extensão.
- Overlay absoluto sobre o CodeMirror: `.cm-editor` tem fundo opaco e `.cm-scroller` é `position: relative` — para o overlay pintar por cima, colocá-lo **depois** do editor na árvore (ou usar `z-10`).

## Última atualização
- 2026-10-13 · commit base: 7554d68 (Fase 6) · Fases 7–8 concluídas em working tree (docs, CORS preview, alinhamento de versões cross-repo e verificação de integração) — ainda não commitadas
