# Tasks — Redesign da interface com Tailwind CSS e shadcn/ui

## 1. Referências e convenções

- [PRD do redesign](PRD-redesign-ui-shadcn.md)
- [SPEC técnica](SPEC-redesign-ui-shadcn.md)
- [Referências visuais](assets/redesign-ui/)

Estados: `[ ]` pendente, `[-]` em andamento, `[x]` concluída e `[!]` bloqueada.

Os grupos são sequenciais. Cada grupo parte da `main` atualizada, usa a branch indicada e deve ser incorporado antes do próximo. Commits seguem Conventional Commits em inglês. O gate de cada grupo concentra as verificações e evita repeti-las em toda task.

## 2. Guardrails do projeto

- Preservar autenticação, sessão, redirects internos e `callbackURL`.
- Manter home e conversores protegidos por sessão.
- Preservar os cinco pares de conversão, endpoints e extensões atuais.
- Manter upload direto ao FastAPI; não alterar backend, banco ou contratos HTTP.
- Manter o catálogo como fonte única dos conversores.
- Usar Nunito Sans, tokens semânticos e componentes shadcn apenas quando necessários.
- Não importar os PNGs de referência no runtime; a marca de produção será SVG.
- Não incluir dark mode, histórico, batch, preview, recuperação de senha ou login social.
- Não versionar `node_modules`, `.next`, `test-results`, coverage, caches, segredos ou `.env`.

## 3. Sequência de entrega

| Grupo | Status | Branch | Resultado |
| --- | --- | --- | --- |
| 1 | Concluído | `docs/ui-redesign-plan` | PRD, SPEC, tasks e referências |
| 2 | Pendente | `chore/ui-design-system` | Design system e marca vetorial |
| 3 | Pendente | `feat/ui-app-shell` | Shell responsivo da aplicação |
| 4 | Pendente | `feat/ui-auth-redesign` | Login e cadastro redesenhados |
| 5 | Pendente | `feat/ui-home-redesign` | Nova home de conversores |
| 6 | Pendente | `feat/ui-converter-redesign` | Novo fluxo de conversão |
| 7 | Pendente | `test/ui-accessibility-visual` | Hardening visual e acessível |
| 8 | Pendente | `docs/ui-redesign-release` | Documentação e encerramento |

## 4. Grupo 1 — Planejamento e referências

**Status:** concluído.

- [x] Baseline, escopo e sequência definidos.
- [x] PRD, SPEC e backlog criados.
- [x] Referências visuais adicionadas e validadas.

## 5. Grupo 2 — Design system e marca vetorial

**Branch:** `chore/ui-design-system` · **Dependência:** Grupo 1 incorporado à `main`.

**Commits planejados:**

1. `chore(ui): add shadcn design system`
2. `feat(brand): add FileFlow vector identity`

### Task 6 — Inicializar shadcn/ui

- [ ] Executar `npx shadcn@latest init -d --base radix` em `frontend/`.
- [ ] Usar estilo `new-york`, RSC, TypeScript, CSS variables e aliases da SPEC.
- [ ] Revisar `components.json`, `globals.css`, dependências e `src/lib/utils.ts`.
- [ ] Manter Tailwind CSS 4 sem criar configuração legada desnecessária.
- [ ] Não executar `shadcn add --all` nem sobrescrever arquivos sem revisar o diff.

**Aceite:** typecheck e build passam com a fundação mínima, antes de migrar páginas.

### Task 7 — Implementar tokens e tipografia

- [ ] Aplicar tokens de fundo, texto, card, borda, ring, estados e cores da marca definidos na SPEC.
- [ ] Integrar Nunito Sans com `next/font` e aplicar a variável no elemento `html`.
- [ ] Preservar `@import "tailwindcss"` e as sources necessárias.
- [ ] Evitar referência circular em `--font-sans` e remover a fonte anterior somente quando não houver consumidores.
- [ ] Usar tokens semânticos em vez de cores Tailwind ou hexadecimais fundamentais espalhados.

**Aceite:** fonte e tokens aparecem no build sem erro de hidratação ou regressão de contraste.

### Task 8 — Adicionar primitivas base

- [ ] Adicionar `button`, `card`, `badge`, `separator` e `tooltip`.
- [ ] Adicionar Lucide e manter ícones em tamanhos consistentes.
- [ ] Definir variantes de botão previstas na SPEC e alvos de ação com pelo menos 44 px.
- [ ] Testar somente extensões próprias; não duplicar testes internos do shadcn.

**Aceite:** primitivas compilam, usam tokens e têm foco visível.

### Task 9 — Criar assets vetoriais da marca

- [ ] Reconstruir em SVG o símbolo com três formas, o lockup, a versão monocromática e o favicon.
- [ ] Usar fundo transparente e remover dependência de fonte, bitmap, filtro ou metadata desnecessária.
- [ ] Preservar progressão, proporção, arredondamento e paleta das referências aprovadas.
- [ ] Garantir legibilidade nos tamanhos definidos na SPEC, incluindo favicon.

**Aceite:** quatro SVGs otimizados existem em `frontend/public/brand` e nenhum PNG de docs foi copiado.

### Task 10 — Criar `FileFlowLogo`

- [ ] Implementar variantes completa e compacta com dimensões reservadas para evitar CLS.
- [ ] Suportar uso decorativo ou nome acessível conforme o consumidor.
- [ ] Aplicar a marca no favicon e nos metadados pertinentes.
- [ ] Cobrir props, variantes e nome acessível do link que envolve a marca.

**Aceite:** ambas as variantes renderizam corretamente e não incluem `docs/assets` no bundle.

### Gate do Grupo 2

- [ ] Executar lint, typecheck, testes, build e auditoria de bundle.
- [ ] Revisar dependências, lockfile, diff e imports dos PNGs de referência.
- [ ] Criar os commits planejados e abrir o PR do grupo.

## 6. Grupo 3 — Shell da aplicação

**Branch:** `feat/ui-app-shell` · **Dependência:** Grupo 2 incorporado à `main`.

**Commits planejados:**

1. `feat(ui): add responsive application shell`
2. `test(ui): cover application shell`

### Task 11 — Criar `PageContainer` e skip link

- [ ] Implementar largura máxima e paddings responsivos conforme a SPEC.
- [ ] Garantir um único landmark `main` e um ID estável para o conteúdo.
- [ ] Adicionar skip link visível ao receber foco.

**Aceite:** teclado alcança o conteúdo principal e não há scroll horizontal a 320 px.

### Task 12 — Criar cabeçalho desktop

- [ ] Usar `FileFlowLogo` como link para a home.
- [ ] Adicionar somente os links reais `Conversores` e `Como funciona`.
- [ ] Definir estados hover, ativo e `focus-visible` com altura estável.
- [ ] Manter o cabeçalho como landmark semântico.

**Aceite:** links têm nomes acessíveis, destinos válidos e a logo não causa layout shift.

### Task 13 — Criar menu do usuário

- [ ] Adicionar `avatar` e `dropdown-menu`.
- [ ] Exibir imagem ou iniciais determinísticas, além de nome/e-mail disponíveis.
- [ ] Integrar o logout existente sem inventar telas de perfil ou configurações.
- [ ] Garantir navegação por teclado e restauração de foco ao fechar.

**Aceite:** logout invalida a sessão e mantém o redirecionamento atual.

### Task 14 — Criar navegação mobile

- [ ] Adicionar `sheet` com botão de menu nomeado.
- [ ] Repetir somente links reais e logout.
- [ ] Fechar por seleção, Escape ou logout; prender e restaurar foco corretamente.

**Aceite:** menu funciona em 320/375 px sem overflow e segue o padrão acessível de dialog/sheet.

### Task 15 — Integrar o shell

- [ ] Aplicar o shell à home e ao template dos conversores.
- [ ] Reusar a sessão resolvida no servidor e evitar cabeçalhos duplicados.
- [ ] Manter páginas como Server Components sempre que não houver interatividade local.
- [ ] Preservar redirects, 404 e comportamento dos cinco conversores.

**Aceite:** todas as páginas autenticadas exibem o shell sem regressão funcional.

### Gate do Grupo 3

- [ ] Cobrir logo, links, menus, logout, foco e navegação mobile.
- [ ] Executar lint, typecheck, testes, build e E2E focal.
- [ ] Revisar o diff, criar os commits planejados e abrir o PR.

## 7. Grupo 4 — Redesign da autenticação

**Branch:** `feat/ui-auth-redesign` · **Dependência:** Grupo 3 incorporado à `main`.

**Commits planejados:**

1. `feat(auth): redesign authentication experience`
2. `test(auth): cover redesigned authentication`

### Task 16 — Preparar primitivas e seletor de modo

- [ ] Adicionar `alert`, `input`, `label` e `tabs`.
- [ ] Implementar `AuthModeTabs` com `Entrar`, `Criar conta` e indicador deslizante.
- [ ] Sincronizar cadastro com `modo=cadastro` e preservar `callbackURL` ao alternar.
- [ ] Restaurar o modo ao recarregar, operar por teclado e respeitar movimento reduzido.
- [ ] Desabilitar a alternância durante submissão.

**Aceite:** URL, callback, teclado e estado visual permanecem sincronizados.

### Task 17 — Implementar `AuthShell`

- [ ] Criar layout desktop em duas colunas com painel de marca em SVG/CSS.
- [ ] Posicionar o seletor no canto superior direito da área do formulário.
- [ ] Em mobile, usar uma coluna e priorizar o formulário em viewports curtas.
- [ ] Manter elementos decorativos fora da árvore acessível.

**Aceite:** layout não apresenta overflow em desktop ou mobile e não usa os PNGs de referência.

### Task 18 — Migrar login

- [ ] Compor o formulário com Card, Label, Input, Button e Alert.
- [ ] Preservar e-mail, senha, autocomplete, validação e mensagens seguras atuais.
- [ ] Manter foco no resumo de erro, limpeza da senha após falha e estado de envio.
- [ ] Preservar refresh e redirect interno no sucesso.
- [ ] Não adicionar recuperação de senha ou login social.

**Aceite:** fluxo e testes atuais de login passam com seletores semânticos.

### Task 19 — Migrar cadastro

- [ ] Preservar nome, e-mail, senha, confirmação e regras por campo.
- [ ] Usar o CTA `Criar minha conta` e manter autenticação automática/callback vigentes.
- [ ] Não carregar valores sensíveis indevidamente ao trocar de modo.
- [ ] Associar erros aos campos com `aria-invalid` e `aria-describedby`.

**Aceite:** cadastro válido e inválido mantêm o comportamento atual.

### Task 20 — Cobrir estados da autenticação

- [ ] Cobrir login e cadastro nos estados inicial, inválido, enviando, erro e sucesso.
- [ ] Cobrir refresh em cada modo, callback interno e rejeição de callback externo.
- [ ] Atualizar E2E e referências visuais de desktop/mobile sem seletores por classe CSS.

**Aceite:** ambos os fluxos podem ser concluídos somente por teclado.

### Gate do Grupo 4

- [ ] Executar lint, typecheck, testes, build, E2E focal e visual da autenticação.
- [ ] Confirmar que Better Auth e Drizzle não foram alterados.
- [ ] Revisar o diff, criar os commits planejados e abrir o PR.

## 8. Grupo 5 — Redesign da home

**Branch:** `feat/ui-home-redesign` · **Dependência:** Grupo 4 incorporado à `main`.

**Commits planejados:**

1. `feat(ui): redesign converter home`
2. `test(ui): cover converter catalog experience`

### Task 21 — Estender o catálogo

- [ ] Adicionar `ConverterCategory` e `ConverterIconKey`.
- [ ] Classificar três conversores como documentos e dois como imagens.
- [ ] Remover emojis e resolver ícones Lucide por mapa no consumidor.
- [ ] Preservar imutabilidade, rotas, endpoints e extensões.

**Aceite:** catálogo mantém exatamente cinco itens, sem JSX ou emoji nos dados.

### Task 22 — Implementar hero

- [ ] Criar badge, H1, descrição e CTA para a seção de conversores.
- [ ] Usar texto/SVG local como conteúdo principal, sem imagem pesada de LCP.
- [ ] Aplicar hierarquia, largura e espaçamento responsivos da SPEC.

**Aceite:** CTA move o foco/navegação para o catálogo de forma previsível.

### Task 23 — Implementar filtros

- [ ] Criar filtros Todos, Documentos e Imagens com contagem derivada do catálogo.
- [ ] Manter o estado no menor Client Component possível.
- [ ] Expor estado selecionado e operação completa por teclado.

**Aceite:** contagens e resultados são, respectivamente, 5, 3 e 2.

### Task 24 — Redesenhar `ConverterCard`

- [ ] Exibir ícone, título, descrição, origem/destino e CTA semântico.
- [ ] Tornar o card inteiro ou seu CTA claramente clicável, sem controles aninhados.
- [ ] Aplicar hover/foco sem depender apenas de cor.
- [ ] Preservar as rotas dos cinco conversores.

**Aceite:** todos os cards funcionam por teclado e apontam para destinos corretos.

### Task 25 — Completar a home

- [ ] Adicionar faixa de benefícios e rodapé conforme o PRD.
- [ ] Usar somente claims aprovados; não prometer retenção, segurança ou limites não implementados.
- [ ] Garantir grid de 1/2/3 colunas nos breakpoints definidos.

**Aceite:** conteúdo é legível sem overflow e a seção principal continua sendo o catálogo.

### Gate do Grupo 5

- [ ] Cobrir catálogo, filtros, cards, links e layout desktop/mobile.
- [ ] Executar lint, typecheck, testes, build, E2E focal e visual da home.
- [ ] Revisar o diff, criar os commits planejados e abrir o PR.

## 9. Grupo 6 — Redesign da conversão

**Branch:** `feat/ui-converter-redesign` · **Dependência:** Grupo 5 incorporado à `main`.

**Commits planejados:**

1. `feat(ui): redesign conversion workflow`
2. `test(ui): cover redesigned conversion states`

### Task 26 — Preparar o template

- [ ] Adicionar somente as primitivas necessárias, como `progress` e `alert`.
- [ ] Derivar título, descrição, extensões e endpoint do catálogo existente.
- [ ] Preservar 404 para pares inválidos e Server Component no template externo.

**Aceite:** os cinco pares exibem contexto correto sem duplicar configuração.

### Task 27 — Implementar `ConversionSteps`

- [ ] Representar seleção, conversão e conclusão.
- [ ] Diferenciar etapa atual, concluída e futura por texto/ícone, não apenas por cor.
- [ ] Marcar a etapa atual com semântica acessível e anunciar mudanças relevantes.
- [ ] Responder a movimento reduzido.

**Aceite:** estados idle, ready, submitting, error e success geram representação coerente.

### Task 28 — Implementar `FileDropzone`

- [ ] Suportar clique, teclado e arrastar/soltar sobre um input de arquivo real.
- [ ] Usar `accept` derivado do catálogo e validar extensão no cliente.
- [ ] Aceitar equivalência `.jpg`/`.jpeg` quando prevista.
- [ ] Exibir instrução, formatos aceitos e erro associado; bloquear durante envio.
- [ ] Evitar listeners globais e prevenir comportamento padrão somente na área de drop.

**Aceite:** testes cobrem clique, drop, inválido, equivalências, disabled e nova seleção.

### Task 29 — Implementar arquivo selecionado

- [ ] Exibir nome, tamanho formatado, ícone e ação para remover/trocar.
- [ ] Retornar a idle ao remover e limpar input, erro e estado anterior.
- [ ] Evitar object URLs desnecessárias ou vazamento ao trocar de arquivo.

**Aceite:** remover e substituir o arquivo não conserva seleção ou mensagem obsoleta.

### Task 30 — Migrar submissão e estados

- [ ] Integrar dropzone e passos ao fluxo atual de `convertFile`.
- [ ] Preservar upload direto ao FastAPI, timeout, parsing de erro e download.
- [ ] Exibir progresso indeterminado sem inventar percentual.
- [ ] Tratar erro com Alert e permitir nova tentativa sem recarregar a página.
- [ ] No sucesso, oferecer download e opção de converter outro arquivo.

**Aceite:** testes atuais de transporte/download passam e todos os estados visuais estão cobertos.

### Task 31 — Implementar painel “Como funciona”

- [ ] Exibir três passos curtos e específicos para o par selecionado.
- [ ] Posicionar como apoio lateral no desktop e após a ação principal no mobile.
- [ ] Não incluir detalhes de infraestrutura ou claims não aprovados.

**Aceite:** painel não compete com a conversão e não causa overflow.

### Task 32 — Cobrir os cinco conversores

- [ ] Cobrir arquivo válido/inválido, remoção, envio, erro, sucesso e download.
- [ ] Atualizar E2E interceptado para os cinco pares sem depender da engine real.
- [ ] Atualizar referências visuais de idle, ready, submitting, error e success.

**Aceite:** os cinco fluxos concluem com seletores semânticos e resultados determinísticos.

### Gate do Grupo 6

- [ ] Executar lint, typecheck, testes, build, E2E focal e visual dos conversores.
- [ ] Confirmar que chamadas continuam indo diretamente ao FastAPI.
- [ ] Revisar o diff, criar os commits planejados e abrir o PR.

## 10. Grupo 7 — Acessibilidade, responsividade e hardening

**Branch:** `test/ui-accessibility-visual` · **Dependência:** Grupo 6 incorporado à `main`.

**Commits planejados:**

1. `test(ui): harden accessibility and visual coverage`
2. `perf(ui): preserve frontend bundle budget`

### Task 33 — Auditar acessibilidade automática

- [ ] Executar axe nas rotas e estados definidos na SPEC.
- [ ] Corrigir landmarks, nomes acessíveis, labels, descrições de erro e ARIA inválida.
- [ ] Tratar violações críticas e sérias; documentar exceções reais.

**Aceite:** nenhuma violação crítica ou séria permanece nas rotas cobertas.

### Task 34 — Auditar teclado, foco e movimento

- [ ] Concluir login, cadastro, navegação, filtros, seleção e conversão somente por teclado.
- [ ] Verificar foco inicial, foco após erro, menus, sheet, tabs e retorno de foco.
- [ ] Confirmar contraste WCAG 2.2 AA e comportamento com `prefers-reduced-motion`.

**Aceite:** os fluxos principais são operáveis sem mouse e sem perda de contexto.

### Task 35 — Auditar responsividade e visual

- [ ] Validar viewports de 320, 375, 768, 1024 e 1440 px, além de zoom a 200%.
- [ ] Cobrir conteúdo longo, mensagens de erro, teclado móvel e ausência de overflow.
- [ ] Consolidar snapshots determinísticos para auth, home e conversão.

**Aceite:** matriz da SPEC passa e ações permanecem visíveis/utilizáveis.

### Task 36 — Auditar performance e regressão

- [ ] Executar auditoria de bundle e investigar aumentos relevantes.
- [ ] Executar a suíte completa de lint, typecheck, testes, coverage, build, E2E e visual.
- [ ] Remover artefatos gerados antes do commit.

**Aceite:** gates passam e qualquer desvio de bundle possui justificativa aprovada.

### Gate do Grupo 7

- [ ] Registrar resultados de acessibilidade, viewports, testes e bundle no PR.
- [ ] Revisar o diff, criar os commits planejados e abrir o PR.

## 11. Grupo 8 — Documentação e encerramento

**Branch:** `docs/ui-redesign-release` · **Dependência:** Grupo 7 incorporado à `main`.

**Commit planejado:** `docs(ui): complete shadcn redesign rollout`

### Task 37 — Atualizar documentação operacional

- [ ] Documentar instalação, componentes shadcn, tokens, marca e comandos de validação.
- [ ] Atualizar README e caminhos de assets quando necessário.
- [ ] Registrar decisões e desvios aprovados da SPEC.

**Aceite:** uma pessoa nova consegue executar, localizar e validar o design system.

### Task 38 — Auditar escopo e repositório

- [ ] Conferir que somente SVGs de produção entram no frontend e que os PNGs permanecem em docs.
- [ ] Revisar dependências, lockfile e ausência de artefatos/segredos.
- [ ] Confirmar que backend, auth, upload direto e cinco conversores preservam seus contratos.

**Aceite:** o redesign alterou apresentação e usabilidade, não o escopo funcional.

### Task 39 — Encerrar o plano

- [ ] Executar os gates finais e atualizar os status do PRD, da SPEC e deste backlog.
- [ ] Registrar resultados, riscos residuais e pendências explicitamente aceitas.
- [ ] Criar o commit documental e abrir o PR final.

**Aceite:** documentação reflete a implementação incorporada à `main`.

## 12. Definição de conclusão

O redesign estará concluído quando:

- os Grupos 1 a 8 estiverem incorporados à `main` na ordem definida;
- login, home e cinco conversores corresponderem ao PRD e à SPEC;
- acessibilidade, responsividade, testes, build e bundle passarem;
- backend, autenticação e upload direto não tiverem regressão;
- somente SVGs de produção forem usados pela aplicação;
- documentação e status estiverem atualizados.
