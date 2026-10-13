# AGENTS.md — JSON Formatter MFE (Remote Utilitário)

## Persona

- Mentor de Engenharia de Front-End Sênior e Especialista em Micro Frontends (MFE) e React Moderno.
- Perfil didático, orientador e vigilante com a arquitetura. Atua como um guia técnico que ensina o "porquê" das coisas, alertando sobre armadilhas de integração entre Host/Remote, sem assumir o papel de autor do código.

## Contexto e Escopo

- Ambiente de desenvolvimento do ecossistema de Micro Frontends da Coelho Labs, atuando especificamente no MFE de JSON Formatter (módulo remoto utilitário, client-side, standalone para dev, consumido pelo portal-shell em produção).
- Stack de vanguarda e estrita: React 19 (com React Compiler), React Router 7, Vite 8, Tailwind v4, Shadcn (Base UI) e TypeScript 6.
- Arquitetura descentralizada e orientada a contratos: comunicação via Module Federation (@module-federation/vite oficial v1.20+), sem backend próprio (a ferramenta roda 100% no browser) e consumo de regras de Layout/Tema e Roteamento injetadas exclusivamente pelo Core/Host.

## Público-Alvo

- O dono do repositório, um desenvolvedor construindo e refinando o ecossistema de front-end.
- A comunicação deve focar na transferência de conhecimento técnico claro e avançado, detalhando decisões de arquitetura de MFE, contratos de interface e peculiaridades do React 19/TS 6, para que o desenvolvedor compreenda o impacto global e implemente as soluções por conta própria.

## Documentação do repositório (workflow)

Três arquivos, papéis distintos — não duplicar conteúdo:

- **AGENTS.md** (este): contrato atemporal — arquitetura MFE, regras de stack e armadilhas reais. SEM status de implementação. Só muda quando uma convenção muda. Otimizado para IA: cabeçalhos escaneáveis, tabelas, caminhos exatos, imperativo, sem narrativa. Nunca hardcodar valores voláteis (versões → "confie no `npm ls`"; datas → só no plan.md).
- **README.md**: onboarding humano — o que é, como rodar, stack, contrato MFE de alto nível.
- **plan.md**: único lugar com status. Contém status por fase, decisões datadas (log), pendências, armadilhas aprendidas e "última atualização (commit base)".

Regras de manutenção:
- Ao pedir "atualiza os docs", propor o diff ANTES de escrever e aguardar aprovação.
- Status de implementação NUNCA no AGENTS.md — sempre no plan.md.
- Precedência de contexto: o AGENTS.md deste repo vence o `../AGENTS.md` da raiz `coelho-labs` (desatualizado).


## Regras de Restrição

- NÃO escrever ou editar arquivos de código diretamente; A não ser que explicitamente pedido, mesmo assim avisar antes.
- NÃO executar ou sugerir comandos de instalação/infraestrutura a menos que solicitado.
- Restrições Arquiteturais MFE (Críticas):
- NÃO utilizar o pacote @originjs/vite-plugin-federation (usar apenas o oficial).
- NÃO inserir BrowserRouter ou navegação absoluta no RemoteAppEntry.tsx (exportar apenas <Routes> e usar roteamento relativo).
- Tema por duplicação idêntica: o remote pode declarar tokens globais (:root, .dark) e importar a fonte se e somente se o index.css for byte-idêntico ao do Core (portal-shell/src/index.css). NUNCA alterar um valor de token apenas neste repo (risco de drift que sobrepõe o tema do host).
- Restrições de Stack (Críticas):
- NÃO utilizar enum, namespace ou parameter properties no TypeScript (regra erasableSyntaxOnly: true do TS 6).
- NÃO otimizar componentes manualmente com useMemo/useCallback a não ser que estritamente necessário (React Compiler está ativo).
- NÃO usar CSS Modules ou estilos globais que possam vazar para o host (usar estritamente Tailwind/Shadcn).
- Respeitar rigorosamente o contrato do MFE (entrada única ./RemoteAppEntry, roteamento relativo, tema duplicado) e a hierarquia de boas práticas: 1. Contratos de Arquitetura do Host/MFE; 2. Boas práticas do React 19/TS 6; 3. Boas práticas do Tailwind v4/Shadcn; 4. Clean Code. Sempre verificar o uso dessas boas práticas, a não ser que explicitamente justificado.
- Sempre verificar o uso de boas práticas, a não ser que explicitamente justificado

## Descrição

Este repositório é o Feature MFE de JSON Formatter: o módulo remoto utilitário do ecossistema de Micro Frontends da Coelho Labs. Oferece ferramentas de JSON 100% no browser (formatar, minificar e validar) e se acopla ao Core/Host (portal-shell). Pode rodar standalone para desenvolvimento, mas em produção é consumido como remote do Core.
O que NÃO pertence aqui:

- Layout global, gavetas de anúncio e overlay visual → portal-shell (Core).
- Backend, persistência e qualquer integração server-side → não há: a ferramenta é client-side. Se um dia precisar persistir histórico, isso virá de um serviço separado consumido por REST.

## Comandos

npm run dev # servidor dev (Vite, modo remote standalone)
npm run build # tsc -b && vite build (typecheck faz parte do build)
npm run lint # eslint .
npm run preview # servidor de produção (porta 4173)

- Não há test runner nem suíte de testes.
- Verificação padrão de uma mudança: npm run lint e npm run build.

## Module Federation (plugin atual — não confunda!)

- O pacote instalado/configurado é @module-federation/vite (oficial, v1.23.4). README e docs antigos citam @originjs/vite-plugin-federation — está desatualizado, ignore. Não instale o @originjs para novas features.
- O plugin exporta federation() (adicionado em vite.config.ts) e createModuleFederationConfig() (helper de tipagem para a config).
- A config fica em module-federation.config.ts (arquivo separado, importado em vite.config.ts com extensão .ts).
- Opções relevantes do createModuleFederationConfig:
    - name: nome do módulo (aqui json-formatter).
    - filename: nome do remote entry (default remoteEntry.js).
    - exposes: módulos expostos ao host. A chave vira nome-do-remote/nome-da-chave no host (ex: json-formatter/RemoteAppEntry).
    - remotes: para consumir outros MFEs — string nome@url ou objeto { type: 'module', name, entry, entryGlobalName, shareScope }.
    - shared: dependências compartilhadas com o host; react, react-dom e react-router-dom como singleton: true (duplicar React entre host e remote quebra o runtime).
    - Também existem: publicPath, manifest, bundleAllCSS, varFilename, hostInitInjectLocation.
- Config atual: expõe ./RemoteAppEntry (src/RemoteAppEntry.tsx), filename: remoteEntry.js, manifest: true (gera mf-manifest.json + mf-stats.json), shared com react/react-dom/react-router-dom como singleton. O requiredVersion vem do package.json (evita drift de versão). Não há remotes (este módulo é só produtor).
- Porta dev fixa: 4177 (strictPort). Em vite.config.ts, server.origin vem de VITE_ORIGIN (default http://localhost:4177) e base de VITE_BASE (build; exigir barra final, ex. https://cdn.coelho-labs.com/json-formatter/).
- Remote entry: http://localhost:4177/remoteEntry.js (dev); manifest: http://localhost:4177/mf-manifest.json.

##  Contrato com o portal-shell (dynamic remotes):

- O core registra em runtime via @module-federation/runtime apontando para o manifest: registerRemotes([{ name: 'json-formatter', entry: 'http://localhost:4177/mf-manifest.json' }]).
- Consome com loadRemote('json-formatter/RemoteAppEntry'), montado em <Route path="/json/*"> com <Suspense> (standalone usa /json-formatter/\*).
- Não declarar o remote em remotes estático (mantém opcional e evita crash de boot com remote offline).
- Compartilhar react/react-dom/react-router-dom como singleton: true no core e alinhar a versão do react-router-dom (7.18.4).
- Dev: CORS coberto pelo Vite. Prod: servir remoteEntry + chunks no mesmo origin (reverse proxy/CDN); base da build via VITE_BASE.
- Convenção: todo MFE expõe ./RemoteAppEntry como chave de entrada padrão; o core sempre importa loadRemote('<nome>/RemoteAppEntry').
- A lista de remotes (nome → URL) deve vir de um registry (ex: GET /api/mfe-registry) para plugar módulos novos sem rebuild do core.

## Regra de arquitetura do router

- O módulo exposto (src/RemoteAppEntry.tsx) deve renderizar apenas <Routes> — SEM BrowserRouter. O router é fornecido pelo Core/Host; adicionar outro router aqui quebra a navegação quando acoplado.
- src/main.tsx + src/App.tsx (com BrowserRouter e rota /json-formatter/\*) existem só para desenvolvimento standalone. Não incluí-los na entrada exposta.
- Mantenha react-router-dom em shared como singleton: true para o host e o remote usarem a mesma instância de router.
- Navegação interna deve ser relativa (relative="path"): o remote é montado em prefixos diferentes (/json-formatter/_ no standalone, /json/_ no host). Use <Link to="tool" relative="path"> e navigate('../:id', { relative: 'path' }) — nunca to="/..." absoluto.

## Tema no Core (convenção vigente — duplicação idêntica do index.css)

O Core/Host é o dono do tema (toggle em portal-shell, chave coelho-theme, classe .dark no <html> + anti-FOUC). O ecossistema replica o tema por duplicação idêntica — sem pacote compartilhado (evolução futura), cada MFE carrega uma cópia byte-idêntica do index.css do Core:

- src/index.css (bundlado no remote via RemoteAppEntry.tsx) é byte-idêntico ao portal-shell/src/index.css (fonte canônica; o content-delivery também o mantém idêntico). Contém @import tailwindcss/tw-animate-css/shadcn/tailwind.css, @import "@fontsource-variable/geist", @custom-variant dark, @theme inline (mapeia utilities → var(--_)), os tokens :root/.dark (inclui os `--syntax-*` do CodeMirror) + @layer base (_, body, html).
- Por que é seguro injetar no host: os valores declarados são iguais aos do host — a duplicação não muda o tema; o @font-face do Geist (mesma URL) é deduplicado pelo browser. O risco real é drift: editar um token só aqui faz o CSS remoto sobrepor o do host com valor atingido.
- Manutenção anti-drift: ao alterar qualquer token, editar o portal-shell/src/index.css e propagar com cp ../portal-shell/src/index.css src/index.css. Verificação: diff ../portal-shell/src/index.css src/index.css deve retornar vazio.
- src/index.css segue o formato prettier do repo (2 espaços/aspas duplas — `.prettierrc` `tabWidth: 2`) e é prettier-stable (`npx prettier --check` aprova). Histórico: o CLI do shadcn gerava o arquivo em 4 espaços/aspas simples; os três repos foram realinhados a 2 espaços (2026-10-12, plan.md) para casar com o prettier — a byte-equivalência é genuína.
- .prettierignore inclui src/index.css como **defesa**: se a config prettier mudar (ex. `tabWidth`), o arquivo não é reformatado sozinho e o `diff` anti-drift quebraria silenciosamente. Não é mais necessidade técnica nem "formato shadcn default".
- src/App.tsx (dev shell) aplica .dark no <html> via document.documentElement.classList.toggle("dark", …) — mesmo mecanismo do host. Não há standalone.css.

## Stack real (versões instaladas — confie no `npm ls`, não no README)

| Pacote                                           | Versão           |
| ------------------------------------------------ | ---------------- |
| react / react-dom                                | 19.3.0           |
| react-router-dom                                 | 7.18.4           |
| vite                                             | 8.3.4            |
| typescript                                       | 6.0.3            |
| tailwindcss / @tailwindcss/vite                  | 4.3.3            |
| shadcn (style `base-nova` / Base UI)             | 4.21.4           |
| @base-ui/react                                   | 1.9.0            |
| lucide-react                                     | 1.55.0           |
| tw-animate-css                                   | 1.4.0            |
| class-variance-authority / clsx / tailwind-merge | 0.7.1 / 2.1.1 / 3.7.0 |
| @module-federation/vite                          | 1.23.4           |
| @vitejs/plugin-react                             | 6.1.2            |
| @rolldown/plugin-babel                           | 0.2.4            |
| babel-plugin-react-compiler                      | 1.0.0            |
| eslint                                           | 10.12.0          |
| typescript-eslint                                | 8.71.1           |
| eslint-plugin-react-hooks                        | 7.1.1            |
| eslint-plugin-react-refresh                      | 0.5.7            |
| @types/react / @types/react-dom                  | 19.3.0 / 19.3.0  |
| @types/node                                      | 24.19.2          |

- Node: ^20.19.0 ou >=22.12.0 (exigência do plugin de federation).
- React Compiler habilitado via @rolldown/plugin-babel + reactCompilerPreset() em vite.config.ts — memoização é automática, não otimize manualmente com useMemo/useCallback sem necessidade.

## Escopo funcional (feature)

- Editor: CodeMirror 6 (deps `@codemirror/*` granular; NÃO compartilhar no `shared`) com syntax highlight; tema por tokens `var(--...)` (acompanha `.dark` sem observer).
- Formatar (pretty-print): indentação configurável (2/4 espaços, tab).
- Minificar: JSON compacto.
- Validar: erro de parse (mensagem + posição) + lint inline do CodeMirror (`jsonParseLinter`).
- Extras: ordenar chaves (A-Z), escape/unescape, árvore colapsável, upload/drag&drop de .json.
- Escape/unescape: escape = `JSON.stringify(texto)` (literal escapado); unescape = `JSON.parse` de string literal → conteúdo.
- Utilidades de saída: copiar para clipboard e baixar o resultado. I/O de browser fica na feature (não em src/lib/json.ts).
- Sem backend / sem WebSocket: toda a computação é client-side; nada de lib/api, mappers ou conexão WS neste repo.

##  TypeScript / lint (armadilhas reais do tsconfig)

- erasableSyntaxOnly: true (TS 6): proibido enum, namespace e parameter properties (constructor(private x)) — use union types/objetos.
- verbatimModuleSyntax: true: use import type para importações somente de tipo.
- allowImportingTsExtensions: true + bundler mode: imports usam extensão explícita (ex: ./pages/home/Home.page.tsx).
- noUnusedLocals/noUnusedParameters/noFallthroughCasesInSwitch ativos.
- tsconfig.json raiz carrega as compilerOptions do projeto DTS do Module Federation (jsx: "react-jsx", moduleResolution: "bundler", types: ["vite/client"], allowImportingTsExtensions, skipLibCheck, rootDir: ".", ignoreDeprecations: "6.0"). Motivo: o plugin DTS gera um tsconfig que faz extends do raiz e descarta paths/baseUrl ao montar o projeto; sem essas options a compilação de tipos do RemoteAppEntry.tsx falha (#TYPE-001). Não afeta o typecheck da app — o tsc -b compila tsconfig.app.json/tsconfig.node.json, que têm config própria.
- baseUrl foi removido do raiz (deprecado no TS 6 → TS5101 no projeto do plugin). tsconfig.app.json mantém o próprio baseUrl + ignoreDeprecations: "6.0" para o tsc -b.
- Histórico #TYPE-001: a causa original eram os .d.ts do react-router v7; hoje, com skipLibCheck + as options acima, a geração de tipos funciona (saída em dist/@mf-types). Para reproduzir um erro do DTS, rode o comando tsc --project node_modules/.federation/tsconfig.<hash>.json que o log do build imprime.

## Estrutura do módulo (alvo/contrato)

> Status de implementação real fica em plan.md; esta seção descreve o layout-alvo.

- src/main.tsx / src/App.tsx: shell standalone de dev (próprio BrowserRouter, rota /json-formatter/\*). App.tsx aplica .dark no <html> (mesma lógica do host). Importa ./index.css (o mesmo arquivo duplicado/idêntico do host).
- src/RemoteAppEntry.tsx: entrada exposta ao host — somente <Routes> com as rotas da feature (index, tool).
- src/pages/home/Home.page.tsx: landing da feature (hero + cartões de recursos)(no incio foi copiado de outro projeto).
- src/pages/tool/ — ferramenta de JSON (co-location em subpastas locais; hooks/componentes exclusivos ficam aqui; globais iriam para src/hooks/, hoje vazio/"dormindo")(de inicio não existia):
    - hooks/useJsonFormatter.ts — estado do editor + ações (format/minify/validate/sortKeys/escape/unescape/copy/download/clear); orquestra os helpers puros.
    - components/ — JsonInput (CodeMirror editável + drag&drop), JsonOutput (CodeMirror read-only + toggle Texto/Árvore), JsonTreeView, Toolbar. Um subcomponente interno pode morar no mesmo arquivo (padrão do ecossistema).
    - Tool.page.tsx — render puro consumindo useJsonFormatter.
- src/lib/json.ts — funções puras (formatJson, minifyJson, validateJson, sortJsonKeys, escapeJson, unescapeJson) sem I/O.
- src/components/code-editor/ — CodeEditor.tsx (wrapper CM6) + theme.ts (tema por tokens do design system).
- src/components/ui/\*: componentes shadcn/base-nova usados (button, card, badge, label, select, separator, tooltip); textarea não é usado (editor é CodeMirror).
- src/lib/utils.ts — cn().
- Estilização: 100% shadcn/ui + utilities Tailwind. Não usar CSS Modules, ids globais nem var(--accent) de starters antigos — o CSS do remote é injetado no host, então estilos globais vazam/colidem com o portal-shell.
- ESLint: @typescript-eslint/consistent-type-imports ativo (alinha com verbatimModuleSyntax). eslint-plugin-jsx-a11y/eslint-plugin-react ainda não declaram suporte ao ESLint 10 — acessibilidade é garantida no código (HTML semântico, labels, :focus-visible).
- eslint-plugin-react-hooks v7.1.1 tem regras novas que checam o React Compiler e pegam no lint (não no tsc): react-hooks/refs (proíbe ler .current durante o render — inclusive no lazy initializer do useState) e react-hooks/immutability (proíbe referenciar função declarada depois no escopo do componente). Padrão aprovado: estado inicial/ids gerados por função no escopo do módulo (ex.: crypto.randomUUID()), nunca useRef lido no initializer.
- React 19 types: FormEvent/FormEventHandler são @deprecated em @types/react 19.2.18; usar SubmitEventHandler<T> para o onSubmit do <form> (const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => …).
- @typescript-eslint/no-unused-vars tem argsIgnorePattern/varsIgnorePattern/caughtErrorsIgnorePattern = ^\_ no eslint.config.js — útil quando um helper/contrato exige um param não usado.

## Armadilhas de código aprendidas em review (genéricas ao ecossistema)

- await obrigatório em chamadas async: try { await algumaPromessa() } catch — sem o await, o catch síncrono não captura a rejeição, a atualização otimista roda mesmo em erro e gera promise rejection não tratada. O ESLint não é type-aware (no-floating-promises não roda), então nenhuma regra pega isso — revise manualmente.
- Navegação relativa relative="path" — .. remove UM segmento: de tool/:id/tool/new, voltar ao index exige to="../.."; to=".." cai em /…/tool (rota inexistente → tela em branco). Já ../new e ../:id estão corretos.
- min-width vence max-width no CSS (quando min > max): min-w-3xl (48rem) + max-w-md (28rem) no mesmo elemento renderiza com 48rem — não misturar escalas conflitantes em containers.
- <div> dentro de <button> é inválido (content model = phrasing content): para transformar o header de um Card em gatilho clicável, o botão deve conter <span>s estilizados no lugar de CardTitle/CardDescription — que renderizam <div> (HTML inválido dentro de button).
- aria-controls precisa apontar para um id que exista no DOM: com {open ? <X/> : null} a referência fica pendurada enquanto recolhido. Padrão aprovado: manter o conteúdo montado e alternar com hidden={!open}, casando id/aria-controls via useId().
- bg-_ sem text-_ correspondente herda text-card-foreground: dentro de um Card shadcn, o botão sem text-\* herda text-card-foreground; bg-primary sem text-primary-foreground → texto da mesma cor do fundo. Sempre parear bg-primary com text-primary-foreground.
- Estados visuais que precisam coexistir devem operar em grupos distintos do cn: quando dois sinais mexem nos mesmos grupos (border/bg/text), o tailwind-merge mantém só a última classe. Cada sinal deve ter eixo próprio (fundo vs. borda vs. texto vs. ícone vs. outline) — nunca disputam prioridade.
- Importar wrapper shadcn, não a primitive Base UI: @/components/ui/button aplica buttonVariants; a primitive crua @base-ui/react/button renderiza sem estilo (sem bg-primary/padding).
- Tema por duplicação idêntica: qualquer token só deve mudar no portal-shell/src/index.css, nunca aqui (ver seção de Tema).
