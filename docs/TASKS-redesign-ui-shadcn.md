# Tasks — Redesign da interface com Tailwind CSS e shadcn/ui

## 1. Referências, escopo e estados

Este backlog executa, em ordem obrigatória:

- [PRD — Redesign da interface com Tailwind CSS e shadcn/ui](PRD-redesign-ui-shadcn.md);
- [SPEC técnica — Redesign da interface com Tailwind CSS e shadcn/ui](SPEC-redesign-ui-shadcn.md).

As referências visuais aprovadas estão em [`assets/redesign-ui/`](assets/redesign-ui/). Elas orientam a reconstrução vetorial da marca e não podem ser importadas pela aplicação.

Estados:

- `[ ]` pendente;
- `[-]` em andamento;
- `[x]` concluída e validada;
- `[!]` bloqueada, acompanhada de motivo e evidência.

Uma task só poderá ser marcada como concluída após a execução de sua validação. Tasks devem ser executadas na ordem numérica dentro do grupo. Grupos devem ser executados na ordem definida neste documento.

## 2. Regras obrigatórias de branches, commits e Pull Requests

### 2.1. Fluxo sequencial

Cada grupo corresponde a uma branch e a um Pull Request coeso:

1. aguardar o merge manual do PR anterior;
2. atualizar `main` por fast-forward;
3. confirmar equivalência com `origin/main`;
4. inventariar alterações locais e preservar trabalho não relacionado;
5. confirmar working tree limpo para iniciar o grupo;
6. criar a branch indicada a partir da `main` atualizada;
7. implementar somente as tasks do grupo;
8. executar validações focais após cada avanço significativo;
9. executar todas as validações do grupo;
10. revisar o diff completo e executar `git diff --check`;
11. criar os commits planejados, em inglês e com Conventional Commits;
12. publicar a branch sem `--force`;
13. abrir PR não-draft, salvo bloqueio real documentado;
14. corrigir checks e review na mesma branch;
15. aguardar merge antes do grupo seguinte.

Branches empilhadas são proibidas. Uma branch dependente não nasce de outra branch de feature.

### 2.2. Regras de commits

- Mensagens devem seguir exatamente ou refinar semanticamente os commits planejados.
- Não usar `--no-verify`, `--force`, `wip`, `changes`, `updates` ou mensagens genéricas.
- Dependência e `package-lock.json` pertencem ao commit que introduz a capacidade.
- Testes devem acompanhar a funcionalidade quando isso mantiver o commit validável.
- Não misturar refatoração alheia, backend, banco ou deploy.
- Não versionar `node_modules`, `.next`, `test-results`, coverage, caches, secrets ou `.env`.
- Não modificar código somente para facilitar a separação de commits.

### 2.3. Conteúdo mínimo de cada PR

Cada PR deverá informar:

- grupo e tasks concluídas;
- objetivo e limites;
- arquivos/componentes principais;
- decisões e desvios da SPEC;
- dependências adicionadas;
- comandos executados e resultados;
- viewports e estados revisados;
- impacto de acessibilidade;
- confirmação de upload direto ao FastAPI;
- confirmação de que os PNGs de referência não foram usados em runtime;
- riscos e rollback;
- links para PRD, SPEC e este backlog.

## 3. Premissas e guardrails

- O comportamento atual do código é a baseline: home e conversores exigem sessão.
- O `callbackURL` interno deve continuar funcionando.
- O FastAPI não será alterado.
- Uploads não passarão pelo Next.js.
- O catálogo continuará sendo fonte única dos cinco conversores.
- Não haverá dark mode, histórico, batch, preview, recuperação de senha ou login social.
- A fonte preferida é Nunito Sans; mudança exige evidência e atualização documental.
- O shadcn será inicializado com Radix.
- Não usar `shadcn add --all`.
- Não usar imagens geradas como asset de produção.
- Claims de segurança, retenção ou limites dependem de aprovação específica.

## 4. Mapa dos grupos

| Grupo | Branch | Commits planejados | Resultado |
| --- | --- | --- | --- |
| 1 | `docs/ui-redesign-plan` | `docs(ui): plan shadcn redesign` | PRD, SPEC, backlog e referências aprovados |
| 2 | `chore/ui-design-system` | `chore(ui): add shadcn design system`; `feat(brand): add FileFlow vector identity` | Fundação visual e marca vetorial disponíveis |
| 3 | `feat/ui-app-shell` | `feat(ui): add responsive application shell`; `test(ui): cover application shell` | Cabeçalho, navegação e menu compartilhados |
| 4 | `feat/ui-auth-redesign` | `feat(auth): redesign authentication experience`; `test(auth): cover redesigned authentication` | Login/cadastro unificados e acessíveis |
| 5 | `feat/ui-home-redesign` | `feat(ui): redesign converter home`; `test(ui): cover converter catalog experience` | Home, filtros e cards novos |
| 6 | `feat/ui-converter-redesign` | `feat(ui): redesign conversion workflow`; `test(ui): cover redesigned conversion states` | Template de conversão e dropzone novos |
| 7 | `test/ui-accessibility-visual` | `test(ui): harden accessibility and visual coverage`; `perf(ui): preserve frontend bundle budget` | Acessibilidade, responsividade e regressão validadas |
| 8 | `docs/ui-redesign-release` | `docs(ui): complete shadcn redesign rollout` | Auditoria final e documentação concluídas |

## 5. Grupo 1 — Planejamento e referências

**Branch:** `docs/ui-redesign-plan`
**Commit:** `docs(ui): plan shadcn redesign`
**Dependência:** estado atual da `main` inventariado; nenhuma implementação do redesign em andamento.

### Task 1 — Registrar o baseline do repositório

- [ ] Confirmar branch atual e divergência de `main`/`origin/main`.
- [ ] Registrar `git status --short`.
- [ ] Identificar arquivos de planejamento já presentes no working tree.
- [ ] Identificar `node_modules/` ou outros artefatos locais sem incluí-los.
- [ ] Confirmar versões atuais de Next.js, React, Tailwind, Node e npm.
- [ ] Confirmar que `components.json` ainda não existe na baseline.
- [ ] Confirmar que os cinco conversores, auth e testes estão verdes antes do redesign.

**Validação:** baseline redigida no PR, sem descarte de mudanças locais e com comandos/versões reproduzíveis.

### Task 2 — Versionar as referências visuais

- [ ] Confirmar os dois PNGs em `docs/assets/redesign-ui/`.
- [ ] Confirmar nomes `fileflow-mark-reference.png` e `fileflow-logo-lockup-reference.png`.
- [ ] Validar os hashes registrados na SPEC.
- [ ] Confirmar que os arquivos abrem e não estão truncados.
- [ ] Confirmar que não há cópias sob `frontend/public/`.
- [ ] Confirmar que nenhuma referência absoluta a `Downloads` permanece nos documentos.

**Validação:** hashes locais correspondem à SPEC e links relativos renderizam no repositório.

**Dependência:** Task 1.

### Task 3 — Revisar PRD, SPEC e backlog

- [ ] Revisar o PRD contra o código atual.
- [ ] Revisar a SPEC contra o PRD e versões fixadas.
- [ ] Revisar este backlog e a ordem dos oito grupos.
- [ ] Confirmar que toda task possui validação objetiva.
- [ ] Confirmar links relativos e UTF-8.
- [ ] Confirmar que referências PNG são documentação, não runtime.
- [ ] Resolver qualquer contradição com PRDs antigos pelo estado atual do código.

**Validação:** os três documentos concordam sobre escopo, auth, assets, arquitetura, testes e definição de pronto.

**Dependência:** Task 2.

### Task 4 — Aprovar o plano de entrega

- [ ] Obter aprovação explícita da identidade de referência.
- [ ] Obter aprovação do PRD.
- [ ] Obter aprovação da SPEC.
- [ ] Obter aprovação dos oito grupos e commits planejados.
- [ ] Atualizar status do PRD e da SPEC de `Proposto/Proposta` para `Aprovado/Aprovada`.
- [ ] Registrar decisões ou ajustes aprovados.

**Validação:** não resta decisão capaz de alterar dependências, arquitetura ou ordem dos grupos.

**Dependência:** Task 3.

### Task 5 — Publicar o PR documental

- [ ] Revisar que o diff contém somente PRD, SPEC, TASKS e dois assets de referência.
- [ ] Executar `git diff --check`.
- [ ] Criar `docs(ui): plan shadcn redesign`.
- [ ] Publicar a branch.
- [ ] Abrir PR com mapa dos oito grupos.
- [ ] Aguardar checks, aprovação e merge manual.

**Validação:** documentos e referências estão em `main`; implementação ainda não começou.

**Dependência:** Task 4.

## 6. Grupo 2 — Design system e marca vetorial

**Branch:** `chore/ui-design-system`
**Dependência:** Grupo 1 incorporado à `main`.
**Commits:**

1. `chore(ui): add shadcn design system`
2. `feat(brand): add FileFlow vector identity`

### Task 6 — Auditar a inicialização do shadcn

- [ ] Confirmar working tree limpo.
- [ ] Registrar cópia/diff de `globals.css`, `layout.tsx`, `package.json` e aliases antes da CLI.
- [ ] Consultar `shadcn info` ou equivalente disponível.
- [ ] Executar dry-run quando suportado.
- [ ] Confirmar base Radix e style `new-york`.
- [ ] Confirmar que Tailwind CSS 4 será detectado sem criar config legado desnecessário.

**Validação:** plano de alterações automáticas conhecido antes da escrita.

### Task 7 — Inicializar shadcn com configuração mínima

- [ ] Executar `npx shadcn@latest init -d --base radix` dentro de `frontend/`.
- [ ] Criar/revisar `components.json` conforme a SPEC.
- [ ] Revisar dependências adicionadas.
- [ ] Confirmar `src/lib/utils.ts` com `cn`.
- [ ] Impedir overwrite não intencional de config existente.
- [ ] Não adicionar componentes ainda sem uso.

**Validação:** `npm run typecheck` e `npm run build` passam com a fundação mínima.

**Dependência:** Task 6.

### Task 8 — Implementar tokens e fonte

- [ ] Migrar `globals.css` para tokens semânticos da SPEC.
- [ ] Manter `@import "tailwindcss"` e sources corretos.
- [ ] Integrar Nunito Sans por `next/font`.
- [ ] Aplicar variável de fonte no `html`.
- [ ] Remover Inter somente quando nenhum consumidor permanecer.
- [ ] Evitar referência circular de `--font-sans`.
- [ ] Definir fundo, foreground, borda, ring, success e cores de marca.
- [ ] Validar contraste inicial.

**Validação:** fonte carrega no build, tokens aparecem no CSS final e não há flash/erro de hidratação.

**Dependência:** Task 7.

### Task 9 — Adicionar primitivas iniciais

- [ ] Instalar `button`, `card`, `badge`, `separator` e `tooltip`.
- [ ] Adicionar `lucide-react` na versão compatível.
- [ ] Revisar source gerado e imports.
- [ ] Confirmar targets de ação principais com pelo menos 44 px.
- [ ] Confirmar variantes sem cores ad hoc.
- [ ] Adicionar testes somente para extensões próprias, não para internals do shadcn.

**Validação:** story/test harness temporário ou testes de composição demonstram variantes sem warning de acessibilidade.

**Dependência:** Task 8.

### Task 10 — Criar a marca vetorial

- [ ] Reconstruir o símbolo com três formas SVG.
- [ ] Criar lockup com wordmark convertido em paths.
- [ ] Criar versão monocromática.
- [ ] Criar favicon simplificado.
- [ ] Usar fundo transparente.
- [ ] Remover metadata, filtros e dependência de fonte.
- [ ] Otimizar SVGs sem deformação.
- [ ] Comparar proporção e paleta com os PNGs de referência.
- [ ] Testar 16, 24, 32, 128 e 512 px.

**Validação:** quatro SVGs da SPEC existem em `frontend/public/brand`, são vetoriais e legíveis nos tamanhos previstos.

**Dependência:** Task 9.

### Task 11 — Criar componente da marca

- [ ] Criar `FileFlowLogo` com modo completo e compacto.
- [ ] Reservar dimensões para evitar CLS.
- [ ] Definir semântica decorativa/acessível correta.
- [ ] Não importar os PNGs de docs.
- [ ] Testar props e nome acessível do link consumidor.
- [ ] Substituir favicon/metadados quando aplicável.

**Validação:** componente renderiza as duas variantes e nenhuma referência `docs/assets` entra no bundle.

**Dependência:** Task 10.

### Task 12 — Validar e publicar o design system

- [ ] Executar lint, typecheck, testes e build.
- [ ] Executar auditoria de bundle.
- [ ] Buscar hex/classes fundamentais duplicadas no código novo.
- [ ] Buscar import dos PNGs de referência.
- [ ] Revisar `package.json` e lockfile.
- [ ] Executar `git diff --check`.
- [ ] Criar os dois commits planejados.
- [ ] Publicar PR e aguardar merge.

**Validação:** fundação e marca podem ser consumidas pelo Grupo 3 sem migrar páginas ainda.

**Dependência:** Task 11.

## 7. Grupo 3 — Shell da aplicação

**Branch:** `feat/ui-app-shell`
**Dependência:** Grupo 2 incorporado à `main`.
**Commits:**

1. `feat(ui): add responsive application shell`
2. `test(ui): cover application shell`

### Task 13 — Criar `PageContainer` e skip link

- [ ] Implementar contrato de `PageContainer`.
- [ ] Evitar `main` aninhado.
- [ ] Criar skip link visível no foco.
- [ ] Adicionar ID estável ao conteúdo principal.
- [ ] Validar paddings e max-width nos breakpoints.

**Validação:** teclado alcança o conteúdo principal e não há scroll horizontal a 320 px.

### Task 14 — Criar cabeçalho desktop

- [ ] Usar `FileFlowLogo` ligado a `/`.
- [ ] Adicionar links `Conversores` e `Como funciona`.
- [ ] Usar tokens e altura estável.
- [ ] Definir estados hover, active e focus-visible.
- [ ] Não adicionar links sem destino real.

**Validação:** cabeçalho é um landmark, links têm nomes acessíveis e logo não causa layout shift.

**Dependência:** Task 13.

### Task 15 — Criar menu do usuário

- [ ] Instalar `avatar` e `dropdown-menu`.
- [ ] Renderizar imagem ou iniciais determinísticas.
- [ ] Exibir nome/e-mail disponíveis.
- [ ] Integrar logout existente.
- [ ] Restaurar foco após fechar.
- [ ] Não inventar perfil ou configurações.

**Validação:** menu funciona por mouse e teclado; logout invalida sessão e redireciona corretamente.

**Dependência:** Task 14.

### Task 16 — Criar navegação mobile

- [ ] Instalar `sheet`.
- [ ] Criar botão de menu com label.
- [ ] Repetir somente links reais e logout.
- [ ] Fechar ao selecionar link, Escape ou ação de logout.
- [ ] Impedir escape de foco quando aberto.
- [ ] Restaurar foco ao gatilho.

**Validação:** navegação funciona a 320/375 px sem overflow e atende padrão de dialog/sheet.

**Dependência:** Task 15.

### Task 17 — Integrar shell nas páginas autenticadas

- [ ] Reusar sessão resolvida no servidor.
- [ ] Integrar shell na home.
- [ ] Integrar shell no template de conversor.
- [ ] Evitar duplicação de header.
- [ ] Manter páginas como Server Components.
- [ ] Preservar redirects e 404.

**Validação:** home e os cinco conversores exibem shell sem alterar fluxo funcional.

**Dependência:** Task 16.

### Task 18 — Cobrir e publicar o shell

- [ ] Testar logo, links, avatar, menu e logout.
- [ ] Testar menu mobile e foco.
- [ ] Atualizar E2E focal de navegação.
- [ ] Executar lint, typecheck, testes, build e E2E focal.
- [ ] Executar `git diff --check`.
- [ ] Criar os commits planejados.
- [ ] Publicar PR e aguardar merge.

**Validação:** shell compartilhado está em `main` e páginas continuam operacionais.

**Dependência:** Task 17.

## 8. Grupo 4 — Redesign da autenticação

**Branch:** `feat/ui-auth-redesign`
**Dependência:** Grupo 3 incorporado à `main`.
**Commits:**

1. `feat(auth): redesign authentication experience`
2. `test(auth): cover redesigned authentication`

### Task 19 — Adicionar primitivas de formulário

- [ ] Instalar `alert`, `input`, `label` e `tabs`.
- [ ] Revisar APIs da versão resolvida.
- [ ] Manter validação atual sem React Hook Form/Zod.
- [ ] Confirmar autocomplete e disabled states.

**Validação:** primitivas compilam e não alteram ainda o contrato Better Auth.

### Task 20 — Implementar `AuthModeTabs`

- [ ] Renderizar `Entrar` e `Criar conta` como tabs.
- [ ] Implementar cápsula deslizante.
- [ ] Preservar `callbackURL` ao alternar.
- [ ] Atualizar `modo=cadastro` corretamente.
- [ ] Restaurar estado ao recarregar URL.
- [ ] Desabilitar durante submissão.
- [ ] Respeitar movimento reduzido.
- [ ] Operar por setas e teclado conforme ARIA.

**Validação:** testes cobrem URL, callback, teclado e reduced motion.

**Dependência:** Task 19.

### Task 21 — Implementar `AuthShell`

- [ ] Criar layout desktop de duas colunas.
- [ ] Criar painel de marca com SVG/CSS de baixa opacidade.
- [ ] Não usar PNG de referência.
- [ ] Posicionar tabs no topo direito.
- [ ] Criar layout mobile de uma coluna.
- [ ] Priorizar formulário na viewport curta.

**Validação:** desktop e mobile não têm overflow; painel decorativo não entra na árvore acessível indevidamente.

**Dependência:** Task 20.

### Task 22 — Migrar formulário de login

- [ ] Usar Card/Label/Input/Button/Alert conforme SPEC.
- [ ] Preservar e-mail, senha, autocomplete e validação.
- [ ] Preservar mensagens seguras.
- [ ] Preservar foco do resumo de erro.
- [ ] Preservar limpeza de senha em falha.
- [ ] Preservar redirect e refresh no sucesso.
- [ ] Não adicionar forgot password ou social login.

**Validação:** testes atuais de login passam com seletores semânticos atualizados.

**Dependência:** Task 21.

### Task 23 — Migrar formulário de cadastro

- [ ] Preservar nome, e-mail, senha e confirmação.
- [ ] Preservar regras e mensagens por campo.
- [ ] Usar botão `Criar minha conta`.
- [ ] Preservar callback e autenticação automática vigentes.
- [ ] Garantir alternância sem valores sensíveis indevidos.

**Validação:** testes atuais de cadastro e validação passam.

**Dependência:** Task 22.

### Task 24 — Cobrir estados e acessibilidade da auth

- [ ] Testar login/cadastro inicial.
- [ ] Testar inválido, enviando, erro e sucesso.
- [ ] Testar foco, labels, aria-invalid e aria-describedby.
- [ ] Testar refresh em cada modo.
- [ ] Testar callback interno e rejeição de externo.
- [ ] Atualizar E2E e capturas visuais de auth.

**Validação:** fluxos funcionam por teclado e testes não dependem de classes CSS.

**Dependência:** Task 23.

### Task 25 — Validar e publicar a autenticação

- [ ] Executar lint, typecheck, testes, build e E2E focal.
- [ ] Executar visual desktop/mobile de auth.
- [ ] Confirmar ausência de alteração server-side em Better Auth/Drizzle.
- [ ] Executar `git diff --check`.
- [ ] Criar commits planejados.
- [ ] Publicar PR e aguardar merge.

**Validação:** login e cadastro redesenhados estão em `main` sem regressão funcional.

**Dependência:** Task 24.

## 9. Grupo 5 — Redesign da home

**Branch:** `feat/ui-home-redesign`
**Dependência:** Grupo 4 incorporado à `main`.
**Commits:**

1. `feat(ui): redesign converter home`
2. `test(ui): cover converter catalog experience`

### Task 26 — Estender o catálogo de apresentação

- [ ] Adicionar `ConverterCategory`.
- [ ] Adicionar `ConverterIconKey`.
- [ ] Classificar três conversores como documentos e dois como imagens.
- [ ] Remover emojis do catálogo.
- [ ] Resolver ícones por mapa no consumidor.
- [ ] Preservar imutabilidade, rotas, endpoints e extensões.
- [ ] Atualizar testes do catálogo.

**Validação:** catálogo continua com exatamente cinco itens e não contém JSX/emoji.

### Task 27 — Implementar hero

- [ ] Renderizar badge, H1, descrição e CTA aprovados.
- [ ] Criar decoração com SVG/CSS, não PNG.
- [ ] Adicionar `#conversores` e comportamento do CTA.
- [ ] Limitar altura da primeira viewport.
- [ ] Preservar H1 único.

**Validação:** CTA chega ao catálogo, foco é previsível e LCP é texto/SVG local.

**Dependência:** Task 26.

### Task 28 — Implementar catálogo filtrável

- [ ] Criar tabs `Todos`, `Documentos`, `Imagens`.
- [ ] Isolar filtro em Client Component pequeno.
- [ ] Preservar ordem original.
- [ ] Anunciar contagem de resultados.
- [ ] Criar estado vazio defensivo.
- [ ] Adicionar `#como-funciona` na seção apropriada.

**Validação:** contagens são 5, 3 e 2; página estática não vira Client Component inteira.

**Dependência:** Task 27.

### Task 29 — Redesenhar `ConverterCard`

- [ ] Usar Card, Badge e ícone Lucide.
- [ ] Exibir par de formatos, título, descrição e ação.
- [ ] Tornar card inteiro um link.
- [ ] Remover `aspect-square`.
- [ ] Alinhar ações no fim dos cards da linha.
- [ ] Implementar hover/focus/active sem `transition-all`.
- [ ] Garantir nome acessível único.

**Validação:** cinco links apontam para rotas corretas e funcionam por teclado.

**Dependência:** Task 28.

### Task 30 — Implementar faixa de benefícios e rodapé

- [ ] Usar copy factual aprovada.
- [ ] Evitar claims não verificados.
- [ ] Usar ícones consistentes.
- [ ] Remover `Powered by Docker`.
- [ ] Tornar ano dinâmico ou atualizar estratégia aprovada.
- [ ] Manter rodapé discreto.

**Validação:** revisão de produto aprova a copy e nenhuma infraestrutura aparece na UI.

**Dependência:** Task 29.

### Task 31 — Cobrir home responsiva

- [ ] Testar tabs e contagens.
- [ ] Testar links e nomes acessíveis.
- [ ] Testar uma coluna mobile.
- [ ] Testar grid 2/3/5 conforme viewport.
- [ ] Testar ausência de overflow.
- [ ] Atualizar E2E de catálogo e capturas visuais.

**Validação:** testes desktop/mobile refletem a nova composição sem seletores frágeis.

**Dependência:** Task 30.

### Task 32 — Validar e publicar a home

- [ ] Executar lint, typecheck, testes, build e E2E focal.
- [ ] Executar auditoria de bundle.
- [ ] Revisar screenshots desktop/mobile.
- [ ] Executar `git diff --check`.
- [ ] Criar commits planejados.
- [ ] Publicar PR e aguardar merge.

**Validação:** home nova está em `main` e todos os conversores permanecem alcançáveis.

**Dependência:** Task 31.

## 10. Grupo 6 — Redesign da conversão

**Branch:** `feat/ui-converter-redesign`
**Dependência:** Grupo 5 incorporado à `main`.
**Commits:**

1. `feat(ui): redesign conversion workflow`
2. `test(ui): cover redesigned conversion states`

### Task 33 — Adicionar primitivas do fluxo

- [ ] Instalar `breadcrumb` e `progress`.
- [ ] Revisar Alert já instalado.
- [ ] Confirmar que nenhuma biblioteca de dropzone é necessária.
- [ ] Preservar bundle e APIs existentes.

**Validação:** primitivas compilam sem alterar `convertFile` ou download.

### Task 34 — Implementar contexto do conversor

- [ ] Criar breadcrumb.
- [ ] Criar ação `Voltar aos conversores`.
- [ ] Renderizar ícone, título e descrição do catálogo.
- [ ] Renderizar badges de origem/destino.
- [ ] Manter metadata e 404 atuais.

**Validação:** todos os cinco pares exibem conteúdo correto a partir do catálogo único.

**Dependência:** Task 33.

### Task 35 — Implementar `ConversionSteps`

- [ ] Criar três etapas semânticas.
- [ ] Mapear idle, selected, converting, success e error.
- [ ] Definir `aria-current=step`.
- [ ] Representar erro por texto/ícone.
- [ ] Respeitar reduced motion.
- [ ] Testar mapeamento exaustivo.

**Validação:** cada estado interno produz exatamente uma representação válida.

**Dependência:** Task 34.

### Task 36 — Implementar `FileDropzone`

- [ ] Criar input real e label/ação associada.
- [ ] Implementar clique e teclado.
- [ ] Implementar drag-enter/over/leave/drop.
- [ ] Validar extensão case-insensitive.
- [ ] Preservar `.jpeg`.
- [ ] Permitir reeleger o mesmo arquivo após reset.
- [ ] Criar estado visual de drag-over.
- [ ] Bloquear interações durante conversão.
- [ ] Não criar limite de tamanho.

**Validação:** testes cobrem clique, drop, inválido, `.jpeg`, disabled e reset.

**Dependência:** Task 35.

### Task 37 — Implementar arquivo selecionado

- [ ] Exibir nome, extensão e tamanho informativo.
- [ ] Criar ação remover/trocar.
- [ ] Garantir truncamento visual sem perder nome acessível.
- [ ] Sincronizar fonte única entre estado e input.
- [ ] Não registrar metadados do arquivo.

**Validação:** remover volta a idle e trocar não deixa object URL ou seleção antiga.

**Dependência:** Task 36.

### Task 38 — Migrar o formulário e estados

- [ ] Compor Card, Steps, Dropzone, Button e Alert.
- [ ] Desabilitar ação sem arquivo.
- [ ] Preservar bloqueio de reenvio.
- [ ] Preservar transporte multipart direto.
- [ ] Preservar mensagens seguras.
- [ ] Preservar download desktop/mobile.
- [ ] Preservar cleanup de object URLs.
- [ ] Permitir retry após erro.
- [ ] Permitir nova conversão após sucesso.

**Validação:** testes atuais de transporte/download passam e novos estados visuais estão cobertos.

**Dependência:** Task 37.

### Task 39 — Implementar painel `Como funciona`

- [ ] Exibir três etapas específicas.
- [ ] Adicionar ação para outro conversor.
- [ ] Posicionar lateralmente em desktop.
- [ ] Posicionar abaixo em mobile.
- [ ] Evitar cards aninhados.
- [ ] Usar copy factual.

**Validação:** layout responde sem overflow e painel não precede a ação principal no mobile.

**Dependência:** Task 38.

### Task 40 — Atualizar testes do fluxo

- [ ] Atualizar unitários da conversão.
- [ ] Atualizar E2E dos cinco endpoints.
- [ ] Cobrir idle, selected, converting, success e error.
- [ ] Cobrir retry e novo arquivo.
- [ ] Cobrir download sugerido.
- [ ] Cobrir mobile legado.
- [ ] Atualizar capturas visuais desktop/mobile.

**Validação:** todos os cinco casos passam sem engine real nos E2E interceptados.

**Dependência:** Task 39.

### Task 41 — Validar e publicar conversores

- [ ] Executar lint, typecheck, testes, coverage focal, build e E2E.
- [ ] Executar smoke entre processos.
- [ ] Confirmar request direto ao FastAPI.
- [ ] Revisar screenshots de todos os estados.
- [ ] Executar `git diff --check`.
- [ ] Criar commits planejados.
- [ ] Publicar PR e aguardar merge.

**Validação:** template novo está em `main` com cinco conversores funcionais.

**Dependência:** Task 40.

## 11. Grupo 7 — Acessibilidade, responsividade e hardening

**Branch:** `test/ui-accessibility-visual`
**Dependência:** Grupo 6 incorporado à `main`.
**Commits:**

1. `test(ui): harden accessibility and visual coverage`
2. `perf(ui): preserve frontend bundle budget`

### Task 42 — Auditar acessibilidade automatizada

- [ ] Avaliar integração de `@axe-core/playwright`.
- [ ] Adicionar somente se compatível e útil.
- [ ] Auditar auth login/cadastro, home e conversor.
- [ ] Corrigir violações críticas/sérias.
- [ ] Registrar exceções justificadas sem silenciar genericamente.

**Validação:** zero violações críticas ou sérias nas rotas cobertas.

### Task 43 — Auditar teclado e foco

- [ ] Testar skip link.
- [ ] Testar tabs de auth.
- [ ] Testar dropdown e sheet.
- [ ] Testar filtros da home.
- [ ] Testar dropzone e retry.
- [ ] Testar foco em erros.
- [ ] Testar retorno de foco após overlays.

**Validação:** os três fluxos principais são concluídos somente por teclado.

**Dependência:** Task 42.

### Task 44 — Auditar contraste e movimento

- [ ] Medir tokens de texto, borda, foco, success e destructive.
- [ ] Validar estados disabled sem perder legibilidade necessária.
- [ ] Validar `prefers-reduced-motion`.
- [ ] Remover animações contínuas.
- [ ] Confirmar que estado não depende só de cor.

**Validação:** WCAG 2.2 AA nos componentes críticos e reduced motion funcional.

**Dependência:** Task 43.

### Task 45 — Auditar responsividade

- [ ] Testar 320 × 568.
- [ ] Testar 375 × 812.
- [ ] Testar 768 × 1024.
- [ ] Testar desktop configurado.
- [ ] Testar desktop amplo.
- [ ] Validar zoom 200%.
- [ ] Corrigir scroll horizontal, sobreposição e cortes.

**Validação:** matriz da SPEC passa e conteúdo/ações permanecem utilizáveis.

**Dependência:** Task 44.

### Task 46 — Consolidar cobertura visual

- [ ] Implementar lista de capturas obrigatórias da SPEC.
- [ ] Desabilitar animações e caret.
- [ ] Manter capturas como artefatos, não arquivos versionados.
- [ ] Atualizar assertions de grid e composição.
- [ ] Evitar dependência de coordenadas frágeis além do necessário.

**Validação:** suíte visual passa em desktop e mobile repetidamente.

**Dependência:** Task 45.

### Task 47 — Auditar performance e bundle

- [ ] Executar `audit:bundle`.
- [ ] Comparar client chunks antes/depois.
- [ ] Confirmar ausência dos PNGs de docs no output.
- [ ] Confirmar imports tree-shakeable de Lucide.
- [ ] Confirmar Server/Client boundaries.
- [ ] Remover dependências e componentes shadcn sem uso.
- [ ] Verificar ausência de layout shift evidente.

**Validação:** orçamento existente passa e regressões relevantes têm correção ou aprovação explícita.

**Dependência:** Task 46.

### Task 48 — Executar regressão completa e publicar

- [ ] Executar `npm ci` em instalação limpa apropriada.
- [ ] Executar lint, typecheck, testes, coverage, build e audit bundle.
- [ ] Executar E2E, smoke e visual.
- [ ] Executar `git diff --check`.
- [ ] Revisar diff completo.
- [ ] Criar commits planejados.
- [ ] Publicar PR com matriz de evidências.
- [ ] Aguardar merge.

**Validação:** todos os gates finais do frontend passam sem artefatos indevidos.

**Dependência:** Task 47.

## 12. Grupo 8 — Documentação e encerramento

**Branch:** `docs/ui-redesign-release`
**Dependência:** Grupo 7 incorporado à `main`.
**Commit:** `docs(ui): complete shadcn redesign rollout`

### Task 49 — Atualizar README e documentação operacional

- [ ] Documentar shadcn/ui e componentes pertencentes ao source.
- [ ] Documentar Nunito Sans e assets SVG.
- [ ] Atualizar árvore relevante do frontend.
- [ ] Documentar comandos de validação.
- [ ] Não documentar mockups PNG como runtime.
- [ ] Não alterar setup de backend sem necessidade.

**Validação:** pessoa nova entende como executar, validar e localizar o design system.

### Task 50 — Auditar assets e dependências

- [ ] Confirmar somente dois PNGs em `docs/assets/redesign-ui`.
- [ ] Confirmar quatro SVGs de produção em `frontend/public/brand`.
- [ ] Confirmar nenhum import de `docs/assets`.
- [ ] Confirmar ausência de assets duplicados/temporários.
- [ ] Confirmar ausência de componentes shadcn sem consumidor.
- [ ] Confirmar ausência de dependências sem uso.

**Validação:** inventário de assets e dependências corresponde à SPEC.

**Dependência:** Task 49.

### Task 51 — Auditar escopo funcional

- [ ] Confirmar exatamente cinco conversores.
- [ ] Confirmar rotas e 404.
- [ ] Confirmar auth e callback.
- [ ] Confirmar uploads diretos.
- [ ] Confirmar downloads desktop/mobile.
- [ ] Confirmar ausência de features adiadas.
- [ ] Confirmar copy sem alegações não aprovadas.

**Validação:** redesign alterou apresentação e usabilidade, não contratos ou escopo de produto.

**Dependência:** Task 50.

### Task 52 — Executar gates finais

- [ ] Executar toda a sequência de hardening novamente.
- [ ] Executar testes duas vezes quando houver risco de ordem/estado residual.
- [ ] Confirmar que validações não deixam arquivos não rastreados.
- [ ] Executar `git diff --check`.
- [ ] Registrar versões e contagens finais de testes.

**Validação:** evidência reproduzível de todos os gates, sem falha omitida.

**Dependência:** Task 51.

### Task 53 — Atualizar status dos documentos

- [ ] Marcar PRD como `Concluído` somente se critérios de aceite passarem.
- [ ] Marcar SPEC como `Implementada` somente se contratos forem atendidos.
- [ ] Marcar tasks concluídas com evidência.
- [ ] Registrar desvios aprovados.
- [ ] Registrar decisões adiadas sem tratá-las como entregues.
- [ ] Adicionar data de conclusão e resumo.

**Validação:** PRD, SPEC e backlog refletem o repositório real.

**Dependência:** Task 52.

### Task 54 — Publicar PR final

- [ ] Revisar diff documental completo.
- [ ] Criar `docs(ui): complete shadcn redesign rollout`.
- [ ] Publicar branch.
- [ ] Abrir PR com links para os sete PRs anteriores.
- [ ] Incluir matriz de gates, assets e desvios.
- [ ] Aguardar checks, aprovação e merge manual.

**Validação:** série completa incorporada à `main`, auditável e sem branch dependente pendente.

**Dependência:** Task 53.

## 13. Matriz de rastreabilidade

| Requisito | Grupos |
| --- | --- |
| PRD, SPEC, TASKS e referências | 1, 8 |
| shadcn, tokens e fonte | 2, 7, 8 |
| marca vetorial | 2, 7, 8 |
| shell e menu do usuário | 3, 7 |
| login/cadastro segmentado | 4, 7 |
| home, filtros e cards | 5, 7 |
| dropzone e estados de conversão | 6, 7 |
| upload direto ao FastAPI | 6, 7, 8 |
| download desktop/mobile | 6, 7, 8 |
| WCAG 2.2 AA | todos os grupos de UI, consolidado no 7 |
| responsividade | 3–7 |
| performance e bundle | 2, 5, 6, consolidado no 7 |
| documentação final | 8 |

## 14. Ordem resumida

| Faixa | Resultado |
| --- | --- |
| Tasks 1–5 | planejamento e referências aprovados |
| Tasks 6–12 | shadcn, tokens, fonte e marca vetorial |
| Tasks 13–18 | shell compartilhado |
| Tasks 19–25 | autenticação redesenhada |
| Tasks 26–32 | home redesenhada |
| Tasks 33–41 | conversores redesenhados |
| Tasks 42–48 | acessibilidade, visual e performance validados |
| Tasks 49–54 | auditoria e encerramento |

## 15. Definição de conclusão

O redesign estará concluído somente quando:

1. os oito PRs tiverem sido incorporados em ordem;
2. as 54 tasks estiverem validadas;
3. PRD e SPEC estiverem refletidos no código;
4. os PNGs permanecerem somente como referência documental;
5. SVGs de produção estiverem aprovados;
6. auth, home e conversores usarem o novo design system;
7. todos os fluxos funcionais anteriores permanecerem verdes;
8. acessibilidade, responsividade, bundle e testes passarem;
9. nenhuma feature fora de escopo ou dependência sem uso permanecer;
10. documentação final corresponder ao estado real da `main`.
