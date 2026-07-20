# Tasks — Separação do frontend e migração para Next.js

## 1. Referência, escopo e estados

Este backlog implementa o [PRD técnico de separação do frontend e migração para Next.js](PRD-migracao-frontend-nextjs.md).

O trabalho é exclusivamente arquitetural. Todas as tasks devem preservar a interface, os textos, as URLs públicas e os cinco contratos de conversão existentes. Melhorias não necessárias à migração deverão ser registradas para uma entrega posterior.

Estados utilizados:

- `[ ]` pendente;
- `[-]` em andamento;
- `[x]` concluída e validada;
- `[!]` bloqueada, acompanhada do motivo e da evidência.

Uma task só poderá ser marcada como concluída depois que seu critério de validação tiver sido executado.

## 2. Regras obrigatórias de branches, commits e Pull Requests

### 2.1. Fluxo sequencial

Cada grupo deste documento deverá seguir integralmente este ciclo:

1. aguardar o merge do PR do grupo anterior;
2. atualizar a `main` local por fast-forward e confirmar que corresponde à `origin/main`;
3. confirmar que o working tree está limpo;
4. criar a branch indicada no grupo a partir dessa `main` atualizada;
5. implementar somente as tasks daquele grupo;
6. executar todas as validações indicadas;
7. revisar o diff completo e executar `git diff --check`;
8. criar o único commit principal indicado para o grupo;
9. publicar a branch no remoto;
10. abrir um Pull Request não-draft imediatamente após a conclusão;
11. aguardar os checks obrigatórios e corrigir falhas na mesma branch;
12. entregar o PR pronto para revisão e aguardar o merge manual pelo responsável do repositório;
13. após a confirmação do responsável, atualizar a `main` local e confirmar a remoção da branch remota conforme a política do repositório.

Branches empilhadas não serão utilizadas. Se um PR ainda não tiver sido incorporado à `main`, o grupo dependente não deverá começar.

### 2.2. Escopo dos commits

- Cada branch terá um commit principal com a mensagem indicada.
- Correções solicitadas durante review poderão usar `fixup!` e deverão ser consolidadas antes do merge quando a política permitir.
- Não usar commits genéricos como `changes`, `updates`, `wip` ou `fix stuff`.
- Não misturar mudanças de grupos diferentes para “aproveitar o PR”.
- Arquivos gerados necessários, como `package-lock.json`, pertencem ao mesmo commit que introduz a ferramenta correspondente.
- Não versionar `.env`, `.env.local`, caches, builds, relatórios ou dependências instaladas.

### 2.3. Conteúdo mínimo de cada PR

Cada descrição de PR deverá informar:

- objetivo e limite do grupo;
- arquivos ou áreas principais alteradas;
- decisões técnicas relevantes;
- comandos de validação executados e seus resultados;
- evidência de paridade quando houver alteração visual;
- riscos conhecidos e rollback;
- declaração explícita de que não foram adicionadas funcionalidades;
- vínculo com este backlog e com o PRD.

## 3. Mapa dos grupos

| Grupo | Branch | Commit principal | Resultado |
| --- | --- | --- | --- |
| 1 | `docs/frontend-migration-plan` | `docs(frontend): plan Next.js migration` | Planejamento e baseline aprovados |
| 2 | `chore/backend-workspace` | `chore(repo): isolate backend workspace` | Aplicação Python isolada em `backend/` |
| 3 | `refactor/backend-api-routes` | `refactor(backend): extract conversion routes` | Composição FastAPI separada das rotas |
| 4 | `chore/frontend-tooling` | `chore(frontend): scaffold strict Next.js app` | Next.js estrito instalável e compilável |
| 5 | `refactor/conversion-catalog` | `refactor(frontend): add typed conversion catalog` | Domínio e configuração tipados |
| 6 | `refactor/frontend-home` | `refactor(frontend): migrate home page` | Home reproduzida no Next.js |
| 7 | `refactor/frontend-converter-page` | `refactor(frontend): migrate converter page` | Página compartilhada de conversão reproduzida |
| 8 | `refactor/frontend-conversion-flow` | `refactor(frontend): migrate conversion workflow` | Upload, API e download migrados |
| 9 | `test/frontend-routes` | `test(frontend): cover catalog and pages` | Catálogo, home, rotas e 404 cobertos |
| 10 | `test/frontend-conversion-flow` | `test(frontend): cover conversion workflow` | Interações e downloads cobertos |
| 11 | `chore/backend-cors` | `chore(backend): configure frontend origins` | Acesso cross-origin configurável e testado |
| 12 | `refactor/backend-api-only` | `refactor(backend): remove legacy frontend` | FastAPI somente API e legado excluído |
| 13 | `test/frontend-e2e` | `test(frontend): add migration end-to-end coverage` | Fluxos de navegador e paridade protegidos |
| 14 | `chore/split-runtime` | `chore(deploy): split frontend and backend runtime` | Containers e proxy independentes |
| 15 | `docs/complete-nextjs-migration` | `docs(architecture): complete Next.js migration` | Documentação e auditoria final concluídas |

## 4. Grupo 1 — Planejamento e baseline

**Branch:** `docs/frontend-migration-plan`
**Commit:** `docs(frontend): plan Next.js migration`
**Dependência:** refatoração estrutural anterior incorporada à `main`.

### Task 1 — Resolver o baseline Git antes da nova série

- [x] Confirmar a branch atual e registrar `git status --short`.
- [x] Confirmar se a `main` local possui commits ainda não publicados.
- [x] Garantir que o commit `chore(api): centralize temporary file lifecycle` esteja em `origin/main` antes de criar a branch.
- [x] Não descartar nem reescrever mudanças locais sem autorização.
- [x] Criar `docs/frontend-migration-plan` somente a partir da `main` sincronizada.

**Validação:** `git log -1 --oneline main` e `git log -1 --oneline origin/main` apontam para o mesmo commit, e o novo branch possui esse commit como base.

### Task 2 — Versionar os documentos de planejamento

- [x] Revisar e incluir `docs/PRD-migracao-frontend-nextjs.md`.
- [x] Incluir este backlog em `docs/TASKS-migracao-frontend-nextjs.md`.
- [x] Confirmar que os dois documentos usam UTF-8 e links relativos válidos.
- [x] Confirmar que o PRD permanece com status `Proposto` até sua aprovação.

**Validação:** os dois arquivos aparecem no diff e os links entre PRD e backlog resolvem dentro de `docs/`.

### Task 3 — Registrar o inventário funcional do frontend legado

- [x] Registrar as seis URLs públicas da interface.
- [x] Registrar os cinco pares de conversão, títulos, descrições, ícones e extensões aceitas.
- [x] Registrar os textos de estado, sucesso e erro exibidos por `static/script.js`.
- [x] Registrar o comportamento diferente de download em desktop e dispositivos móveis.
- [x] Registrar os breakpoints e os estados visuais relevantes da home e do formulário.
- [x] Registrar que `templates/index.html` não é servido pelas rotas atuais.
- [x] Registrar os cinco endpoints, campo multipart, status e tipos MIME protegidos pelos testes Python.

**Validação:** uma pessoa revisora consegue identificar o comportamento que deverá permanecer sem depender apenas da memória ou da interface em execução.

### Task 4 — Registrar a dispensa das capturas visuais

- [x] Executar o frontend legado em ambiente controlado.
- [x] Confirmar a indisponibilidade do Browser integrado nesta sessão.
- [x] Registrar a decisão do responsável de não versionar capturas de tela neste grupo.
- [x] Manter no baseline textual os layouts, breakpoints, conteúdos e estados relevantes.
- [x] Preservar templates e CSS no histórico Git como referência adicional de paridade.

**Desvio aprovado:** em 20 de julho de 2026, o responsável dispensou as capturas de tela do Grupo 1 após a integração de navegador permanecer indisponível. A validação futura utilizará o baseline textual, o código legado preservado no histórico e revisão manual da interface.

**Validação:** a ausência das imagens está explícita e não é interpretada como evidência produzida.

### Task 5 — Publicar o PR de planejamento

- [x] Revisar que o diff contém somente documentação e evidências aprovadas.
- [x] Executar `git diff --check`.
- [x] Criar o commit `docs(frontend): plan Next.js migration`.
- [x] Publicar `docs/frontend-migration-plan`.
- [x] Abrir o PR com o resumo dos 15 grupos e a ordem obrigatória.
- [x] Obter aprovação explícita do PRD e do backlog.
- [x] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 2.

**Validação:** PR incorporado à `main`, documentos acessíveis no repositório e escopo aprovado.

## 5. Grupo 2 — Isolamento físico do backend

**Branch:** `chore/backend-workspace`
**Commit:** `chore(repo): isolate backend workspace`
**Dependência:** Grupo 1 incorporado à `main`.

### Task 6 — Inventariar caminhos afetados pela movimentação

- [x] Localizar referências a `app/`, `tests/`, `temp/`, `requirements*.txt`, `templates/`, `static/` e `Dockerfile`.
- [x] Classificar cada referência como runtime, teste, container ou documentação.
- [x] Registrar os comandos atuais de importação, teste e execução.
- [x] Confirmar que não há scripts externos versionados dependendo silenciosamente dos caminhos da raiz.

**Validação:** existe uma lista completa dos consumidores a ajustar no mesmo grupo.

### Task 7 — Mover a aplicação Python para `backend/`

- [x] Mover `app/` para `backend/app/` preservando o histórico Git.
- [x] Mover `tests/` para `backend/tests/` preservando o histórico Git.
- [x] Mover `requirements.txt` e `requirements-dev.txt` para `backend/`.
- [x] Mover `temp/` para `backend/temp/` e preservar somente o marcador versionado.
- [x] Mover o `Dockerfile` atual para `backend/Dockerfile`.
- [x] Mover temporariamente `templates/` e `static/` para dentro de `backend/`, sem duplicá-los, para manter o frontend legado funcional até o Grupo 12.
- [x] Confirmar que não restaram cópias dos mesmos arquivos na raiz.

**Validação:** cada arquivo possui uma única localização e `git status` reconhece movimentações sempre que possível.

**Nota de execução:** o diretório `temp/` anterior não possuía marcador rastreado. Os artefatos locais criados durante o Grupo 1 foram removidos e `backend/temp/.gitkeep` foi criado como o novo marcador versionado.

### Task 8 — Tornar caminhos do backend independentes do diretório de execução

- [x] Definir uma raiz da aplicação baseada em `Path(__file__)`, não no diretório corrente do processo.
- [x] Resolver o diretório temporário a partir dessa raiz.
- [x] Resolver `templates/` e `static/` temporários a partir dessa raiz.
- [x] Manter o diretório temporário substituível nos testes.
- [x] Confirmar contenção e limpeza dos caminhos após a movimentação.

**Validação:** importar e executar o backend a partir da raiz e de `backend/` não muda a localização efetiva dos recursos.

### Task 9 — Ajustar testes e comandos Python

- [x] Atualizar imports, configuração de descoberta e caminhos de fixtures somente onde necessário.
- [x] Padronizar o comando local como execução dentro de `backend/`.
- [x] Confirmar que os testes continuam sem escrever no diretório temporário real.
- [x] Atualizar `.gitignore` para ignorar artefatos Python e runtime dentro dos novos caminhos.
- [x] Confirmar que ambientes virtuais não são movidos nem versionados.

**Validação:** a suíte completa passa a partir de `backend/` em Python 3.10.

### Task 10 — Ajustar o container existente ao novo contexto

- [x] Fazer `backend/Dockerfile` funcionar com `backend/` como contexto de build.
- [x] Preservar as dependências de sistema exigidas pelas conversões.
- [x] Preservar o comando `uvicorn app.main:app` dentro do workspace.
- [x] Confirmar a criação e permissão do diretório temporário.
- [x] Não introduzir ainda frontend Next.js, proxy ou Compose.

**Validação:** a imagem do backend é construída isoladamente e registra as cinco rotas de conversão e as rotas HTML legadas.

**Validação adiada:** o ambiente de execução não possui Docker, Podman nem distribuição WSL. Em 20 de julho de 2026, o responsável autorizou concluir o PR com análise estática do contexto e adiar o build real para um ambiente com runtime de containers, no máximo até o Grupo 14.

### Task 11 — Publicar o PR de isolamento do backend

- [x] Executar a suíte Python duas vezes.
- [x] Importar `app.main` no novo workspace e listar as rotas.
- [!] Construir a imagem do backend. Bloqueado pela ausência de Docker, Podman ou WSL; adiamento aprovado pelo responsável.
- [x] Executar `git diff --check` e revisar que o grupo é predominantemente mecânico.
- [x] Criar o commit `chore(repo): isolate backend workspace`.
- [x] Publicar `chore/backend-workspace` e abrir o PR.
- [x] Destacar no PR que `backend/templates` e `backend/static` são temporários e serão removidos no Grupo 12.
- [x] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 3.

**Validação:** PR incorporado, backend isolado e comportamento existente preservado.

## 6. Grupo 3 — Composição e rotas do backend

**Branch:** `refactor/backend-api-routes`
**Commit:** `refactor(backend): extract conversion routes`
**Dependência:** Grupo 2 incorporado à `main`.

### Task 12 — Definir a composição do pacote HTTP

- [x] Criar `backend/app/api/__init__.py`.
- [x] Criar `backend/app/api/routes/__init__.py`.
- [x] Criar um módulo dedicado às rotas de conversão.
- [x] Definir `APIRouter` sem prefixar ou renomear os endpoints existentes.
- [x] Manter construção e configuração global da aplicação em `app/main.py`.

**Validação:** a fronteira entre criação da aplicação e handlers HTTP está explícita sem mudança de contrato.

### Task 13 — Extrair as cinco rotas de conversão

- [x] Mover cada handler para o router dedicado.
- [x] Preservar validação de extensão, mensagens, status e tipos MIME byte a byte quando aplicável.
- [x] Preservar factories de adapters e o serviço temporário como pontos de substituição dos testes.
- [x] Preservar cleanup imediato em erro e `BackgroundTasks` em sucesso.
- [x] Evitar criar uma classe de serviço ou camada adicional sem responsabilidade concreta.

**Validação:** os testes de contrato existentes passam sem alteração das expectativas.

### Task 14 — Manter temporariamente as rotas do frontend legado isoladas

- [x] Colocar a configuração e os handlers HTML em módulo claramente marcado como legado.
- [x] Manter `CONVERTER_CONFIG` fora do router de conversões da API.
- [x] Montar templates e estáticos somente durante esta fase transitória.
- [x] Adicionar comentário de remoção apontando para o Grupo 12 deste backlog.
- [x] Não duplicar metadados no novo frontend, que ainda não existe neste grupo.

**Validação:** `app/main.py` compõe API e legado por imports separados, e as URLs atuais continuam respondendo.

### Task 15 — Readequar os testes aos novos pontos de patch

- [x] Atualizar monkeypatches para as referências efetivamente usadas pelos handlers extraídos.
- [x] Manter os fakes existentes sem importar engines reais.
- [x] Confirmar que nenhum teste depende da ordem de importação dos routers.
- [x] Adicionar teste de inventário das cinco rotas de conversão.

**Validação:** a suíte passa repetidamente e falha se uma rota for removida ou renomeada.

### Task 16 — Publicar o PR de extração das rotas

- [x] Executar testes Python duas vezes.
- [x] Comparar o OpenAPI anterior e posterior para os cinco endpoints.
- [x] Executar `git diff --check`.
- [x] Criar o commit `refactor(backend): extract conversion routes`.
- [x] Publicar `refactor/backend-api-routes` e abrir o PR.
- [x] Incluir no PR a evidência de que nenhum contrato mudou.
- [x] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 4.

**Validação:** PR incorporado com composição FastAPI menor e contratos intactos.

**Evidência de contrato:** antes e depois da extração, a representação canônica dos cinco paths `/convert/*` no OpenAPI produziu o mesmo SHA-256: `f5ef4ab9883d88bc8fc513623f591b98727d394c6d1caf08c9a9cf65720233c7`.

## 7. Grupo 4 — Scaffold e qualidade estática do frontend

**Branch:** `chore/frontend-tooling`
**Commit:** `chore(frontend): scaffold strict Next.js app`
**Dependência:** Grupo 3 incorporado à `main`.

### Task 17 — Selecionar e registrar versões suportadas

- [x] Verificar a versão LTS ativa do Node.js no momento da implementação.
- [x] Selecionar versões estáveis e compatíveis de Next.js, React, React DOM e TypeScript.
- [x] Registrar a versão de Node no campo `engines` e em arquivo de versionamento aceito pelo projeto.
- [x] Usar `npm` e gerar `package-lock.json` determinístico.
- [x] Registrar as versões escolhidas no PR, sem intervalos desnecessariamente amplos.

**Validação:** uma instalação limpa usa as versões registradas e não produz alterações no lockfile.

### Task 18 — Criar o workspace Next.js mínimo

- [x] Criar `frontend/package.json` com scripts de desenvolvimento, build, start, lint e typecheck.
- [x] Criar o App Router sob `frontend/src/app/`.
- [x] Criar `layout.tsx`, uma página mínima temporária e `globals.css`.
- [x] Manter `frontend/public/` ausente enquanto não houver assets realmente utilizados.
- [x] Configurar o alias `@/*` para `src/*`.
- [x] Não criar Pages Router, Route Handlers ou Server Actions.
- [x] Não copiar ainda templates ou JavaScript legado para arquivos React.

**Validação:** `npm run build` gera uma aplicação mínima usando somente App Router.

### Task 19 — Habilitar TypeScript estrito

- [x] Habilitar `strict`.
- [x] Habilitar `noUncheckedIndexedAccess`.
- [x] Habilitar `exactOptionalPropertyTypes`.
- [x] Habilitar `noImplicitOverride`.
- [x] Habilitar `noFallthroughCasesInSwitch`.
- [x] Habilitar `noUncheckedSideEffectImports` se suportado pelas versões selecionadas.
- [x] Impedir arquivos JavaScript de aplicação.
- [x] Garantir que `npm run typecheck` execute `tsc --noEmit`.

**Validação:** a configuração rejeita exemplos controlados de acesso inseguro, opcionais imprecisos e `any` implícito.

### Task 20 — Configurar lint e fronteiras arquiteturais

- [x] Configurar ESLint compatível com a versão selecionada do Next.js.
- [x] Proibir `any` explícito.
- [x] Proibir imports profundos da implementação interna de features por consumidores externos.
- [x] Proibir imports de `app` ou `features` a partir de módulos compartilhados.
- [x] Proibir JavaScript de aplicação e dependências não declaradas.
- [x] Configurar regras sem desabilitações globais genéricas.
- [x] Documentar qualquer exceção pontual com justificativa no próprio código.

**Validação:** fixtures ou violações temporárias confirmam que as regras de fronteira realmente falham no lint.

### Task 21 — Configurar Next.js e Tailwind

- [x] Habilitar `typedRoutes` na configuração estável do Next.js.
- [x] Instalar Tailwind CSS como dependência de build, sem CDN.
- [x] Configurar os caminhos de conteúdo restritos ao frontend.
- [x] Integrar a fonte Inter com pesos 400, 600 e 700 pelo mecanismo do Next.js.
- [x] Não introduzir biblioteca de componentes, ícones ou estado global.

**Validação:** build de produção não referencia `cdn.tailwindcss.com` nem Google Fonts em runtime.

### Task 22 — Preparar configuração e higiene do workspace

- [x] Criar `.env.example` com apenas variáveis públicas necessárias e valores seguros de exemplo.
- [x] Ajustar `.gitignore` para `.next/`, `node_modules/`, coverage, resultados E2E e `.env.local`.
- [x] Garantir que `.env.example` continue versionável.
- [x] Confirmar que o build não escreve fora de `frontend/`.
- [x] Confirmar que nenhum segredo está exposto com prefixo `NEXT_PUBLIC_`.

**Validação:** instalação, lint, typecheck e build não sujam o working tree.

### Task 23 — Publicar o PR do scaffold

- [x] Executar instalação limpa com o lockfile.
- [x] Executar lint, typecheck e build.
- [x] Executar `git diff --check`.
- [x] Revisar que o PR contém somente scaffold e ferramentas, sem migração visual.
- [x] Criar o commit `chore(frontend): scaffold strict Next.js app`.
- [x] Publicar `chore/frontend-tooling` e abrir o PR.
- [x] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 5.

**Validação:** PR incorporado e frontend mínimo reproduzível em instalação limpa.

**Evidências de execução:** Node.js `24.18.0` LTS e npm `11.16.0`; Next.js `16.2.10`, React `19.2.7`, TypeScript `6.0.3`, Tailwind CSS `4.3.3` e ESLint `9.39.5`. Duas instalações limpas produziram o mesmo SHA-256 do lockfile (`459A8FC4B1C0FC9295E0B4C48F08948E2C9DC9EFC65C962FD7E8B1E5E2A2F6BE`). Fixtures temporárias confirmaram falha para `any` explícito, JavaScript de aplicação, dependência de desenvolvimento importada pela aplicação, import profundo de feature, dependência reversa de módulo compartilhado, acesso inseguro por índice, propriedade opcional imprecisa e `any` implícito; as fixtures não fazem parte do commit.

## 8. Grupo 5 — Catálogo e domínio tipado de conversão

**Branch:** `refactor/conversion-catalog`
**Commit:** `refactor(frontend): add typed conversion catalog`
**Dependência:** Grupo 4 incorporado à `main`.

### Task 24 — Modelar formatos, pares e endpoints

- [x] Criar unions literais para formatos de origem e destino.
- [x] Representar somente os cinco pares suportados.
- [x] Restringir endpoints aos cinco caminhos existentes.
- [x] Tipar extensões aceitas e extensão de download.
- [x] Tornar configurações imutáveis em compile time e runtime quando adequado.
- [x] Evitar enums quando unions e objetos constantes forem suficientes.

**Validação:** TypeScript rejeita formato, par ou endpoint não suportado sem type assertion.

### Task 25 — Criar o catálogo único de apresentação

- [x] Migrar títulos, descrições, labels, ícones e extensões do legado.
- [x] Preservar a diferença entre `.jpg` e `.jpeg` como entradas aceitas.
- [x] Preservar exatamente os endpoints atuais.
- [x] Definir uma chave canônica e estável para cada conversor.
- [x] Garantir que o catálogo seja a única fonte de metadados visuais no frontend.
- [x] Não copiar o catálogo para o backend.

**Validação:** uma busca encontra uma única declaração de cada título, descrição e endpoint no frontend.

### Task 26 — Implementar resolução segura de rotas

- [x] Criar uma função que receba strings externas de rota.
- [x] Validar `fromFormat` e `toFormat` sem casts inseguros.
- [x] Retornar uma configuração conhecida ou ausência explícita.
- [x] Criar uma função para listar os cinco conversores na ordem atual da home.
- [x] Garantir verificação exaustiva ao adicionar um novo estado ou formato.

**Validação:** pares válidos resolvem para a entrada correta e qualquer outro valor resulta em ausência.

### Task 27 — Modelar estados e erros do cliente

- [x] Criar a união discriminada do estado da conversão.
- [x] Representar `idle`, arquivo selecionado, conversão, sucesso e erro.
- [x] Impedir estados incompatíveis por construção.
- [x] Tipar o corpo de erro FastAPI `detail` como dado externo a validar.
- [x] Criar guardas pequenos para valores externos, sem biblioteca de schema se ela não for necessária.

**Validação:** switches sobre estado são exaustivos e respostas arbitrárias não são tratadas como erros válidos sem verificação.

### Task 28 — Validar configuração pública da API

- [x] Criar `frontend/src/config/env.ts`.
- [x] Aceitar uma URL absoluta no desenvolvimento e base relativa/same-origin em produção.
- [x] Normalizar barra final sem alterar paths dos endpoints.
- [x] Falhar com mensagem clara em configuração inválida.
- [x] Centralizar o acesso a `process.env.NEXT_PUBLIC_API_BASE_URL` nesse módulo.
- [x] Documentar que valores `NEXT_PUBLIC_*` são definidos no build.

**Validação:** não existem leituras dispersas de `process.env` e os cenários absoluto, relativo e inválido são verificáveis.

### Task 29 — Definir a API pública da feature

- [x] Criar `frontend/src/features/conversion/index.ts`.
- [x] Exportar somente tipos, resolvers e componentes destinados a consumidores externos.
- [x] Manter detalhes internos inacessíveis por imports profundos conforme o lint.
- [x] Confirmar que o domínio não importa React, APIs do navegador ou módulos de `app` sem necessidade.

**Validação:** a página poderá consumir a feature somente pela API pública planejada.

### Task 30 — Publicar o PR do domínio tipado

- [x] Executar lint, typecheck e build.
- [x] Auditar ausência de `any`, casts supressivos e endpoints livres.
- [x] Executar `git diff --check`.
- [x] Criar o commit `refactor(frontend): add typed conversion catalog`.
- [x] Publicar `refactor/conversion-catalog` e abrir o PR.
- [x] Incluir no PR a matriz dos cinco pares e sua origem no legado.
- [x] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 6.

**Validação:** PR incorporado com domínio puro, tipado e sem mudança visível publicada.

**Evidências de execução:** os cinco pares foram comparados com `backend/app/legacy_frontend.py`, `backend/app/api/routes/conversions.py` e o baseline textual. Validações temporárias confirmaram resolução e ordem em runtime, congelamento do catálogo e das extensões, `.jpg`/`.jpeg`, diferença textual da home para JPG → PNG, guarda do erro FastAPI e bases absoluta, relativa e same-origin. O TypeScript rejeitou formato, destino, endpoint e par desconhecidos, além de switch não exaustivo; as fixtures não fazem parte do commit. Lint, typecheck, build e os 29 testes Python passaram, sem alteração em `frontend/src/app` ou nas dependências.

## 9. Grupo 6 — Migração da home

**Branch:** `refactor/frontend-home`
**Commit:** `refactor(frontend): migrate home page`
**Dependência:** Grupo 5 incorporado à `main`.

### Task 31 — Criar o layout global equivalente

- [x] Configurar `lang="pt-BR"` e metadados equivalentes.
- [x] Aplicar Inter e as cores globais atuais.
- [x] Reproduzir estrutura de página, largura e espaçamentos sem redesign.
- [x] Criar header e footer somente se houver reutilização concreta.
- [x] Preservar o texto e o ano exibidos no baseline, mesmo que melhorias tenham sido identificadas.

**Validação:** o layout em viewports de referência é visualmente equivalente ao legado.

### Task 32 — Criar o componente de card de conversor

- [x] Receber uma entrada tipada do catálogo.
- [x] Usar `next/link` com rota tipada.
- [x] Preservar ícone, título, descrição e call to action.
- [x] Preservar estados de hover, bordas, sombras, aspect ratio e transições.
- [x] Manter semântica de link navegável por teclado.
- [x] Não marcar o componente como cliente sem necessidade.

**Validação:** o card é um Server Component/presente estático e reproduz o comportamento visual atual.

**Nota de execução:** enquanto a rota dinâmica pertence ao Grupo 7 e ainda não existe no App Router, `next/link` recebe um `UrlObject` cujo `pathname` continua restrito à union literal do catálogo. Isso mantém a rota tipada sem cast nem antecipação da página seguinte; o uso direto da string será reavaliado quando o Next.js gerar o tipo da rota dinâmica.

### Task 33 — Reproduzir a grade da home

- [x] Renderizar a partir do catálogo único.
- [x] Preservar a ordem atual dos cinco conversores.
- [x] Preservar uma coluna em mobile, duas em medium e quatro em large.
- [x] Preservar largura máxima, padding e gaps.
- [x] Confirmar que nenhum texto ou card foi adicionado.

**Validação:** as cinco URLs corretas são geradas e a composição corresponde às evidências do Grupo 1.

### Task 34 — Comparar a home com o baseline

- [x] Registrar a impossibilidade de comparar desktop no navegador integrado nas condições de referência.
- [x] Registrar a impossibilidade de comparar mobile no navegador integrado nas condições de referência.
- [x] Corrigir somente diferenças estruturais detectadas em relação ao baseline textual e ao template legado.
- [x] Registrar no PR a dispensa explícita das evidências lado a lado.
- [x] Documentar a limitação de validação visual desta execução.

**Desvio aprovado:** em 20 de julho de 2026, o responsável autorizou concluir o Grupo 6 sem capturas e sem comparação visual automatizada depois que o procedimento oficial de recuperação confirmou que nenhum navegador estava conectado à sessão. A validação substituta compara o template legado, o baseline textual, as classes responsivas e o HTML de produção; não será apresentada como revisão visual executada.

**Validação substituta:** revisão estrutural não encontrou mudança intencional de conteúdo ou composição, e a ausência de evidência visual está explícita para a pessoa revisora.

### Task 35 — Publicar o PR da home

- [x] Executar lint, typecheck e build.
- [x] Confirmar que a home não exige JavaScript cliente para renderização estática.
- [x] Executar `git diff --check`.
- [x] Criar o commit `refactor(frontend): migrate home page`.
- [x] Publicar `refactor/frontend-home` e abrir o PR com evidências estruturais e o desvio visual aprovado.
- [x] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 7.

**Validação:** PR incorporado e home equivalente disponível no frontend Next.js.

**Evidência estrutural:** legado e Next.js responderam HTTP 200; o HTML de produção contém exatamente os cinco links esperados, todos os textos do baseline, o título equivalente e nenhuma fronteira cliente própria. Lint, typecheck, build e os 29 testes Python passaram. A revisão visual desktop/mobile foi dispensada explicitamente pelo responsável após a integração de navegador retornar uma lista vazia de navegadores disponíveis.

## 10. Grupo 7 — Migração da página de conversão

**Branch:** `refactor/frontend-converter-page`
**Commit:** `refactor(frontend): migrate converter page`
**Dependência:** Grupo 6 incorporado à `main`.

### Task 36 — Criar a rota dinâmica tipada

- [x] Criar `app/converter/[fromFormat]/[toFormat]/page.tsx`.
- [x] Resolver os parâmetros pelo resolver seguro da feature.
- [x] Chamar `notFound()` para pares não suportados.
- [x] Gerar metadados de título equivalentes para pares válidos.
- [x] Manter `page.tsx` livre de fetch, `FormData`, Blob e APIs do navegador.
- [x] Considerar geração estática dos cinco pares sem tornar valores inválidos aceitos.

**Validação:** as cinco URLs válidas renderizam e uma combinação inválida retorna 404.

### Task 37 — Criar a apresentação compartilhada do conversor

- [x] Criar um único componente para todos os pares.
- [x] Receber somente configuração tipada como propriedade.
- [x] Reproduzir link Voltar, ícone, título e descrição.
- [x] Reproduzir card, largura, espaçamentos, bordas e sombras.
- [x] Preservar footer e posicionamento responsivo.
- [x] Não criar cinco páginas ou componentes duplicados.

**Validação:** os cinco pares usam a mesma implementação estrutural e variam somente por catálogo.

### Task 38 — Criar o formulário visual acessível

- [x] Reproduzir label, input, texto auxiliar, botão, spinner e região de status.
- [x] Gerar `accept` a partir das extensões tipadas.
- [x] Garantir que JPG aceite `.jpg,.jpeg` sem alterar a apresentação.
- [x] Preservar os textos atuais do botão e da ajuda.
- [x] Associar label, input e status por atributos semânticos.
- [x] Manter o limite cliente somente no componente que futuramente receberá interação.

**Validação:** o formulário possui a mesma apresentação e extensões corretas, ainda sem duplicar transporte HTTP.

**Evidência estrutural:** o build gerou estaticamente os cinco pares a partir do catálogo. O HTML de produção contém títulos, labels, botões e extensões esperados; JPG aceita `.jpg,.jpeg`. Uma combinação não suportada responde 404. Página e formulário não usam `fetch`, `FormData`, `Blob` nem APIs do navegador, e a camada visual permanece como Server Component até a interação ser implementada no Grupo 8.

### Task 39 — Comparar as páginas com o baseline

- [x] Registrar a impossibilidade de comparar um conversor em desktop e mobile no navegador integrado.
- [x] Verificar estruturalmente os cinco títulos, descrições, ícones e labels.
- [x] Registrar a dispensa da inspeção visual de foco, hover e layout com nome de arquivo selecionado.
- [x] Corrigir somente regressões estruturais de migração detectadas.
- [x] Incluir no PR as evidências estruturais e a dispensa visual explícita.

**Desvio aprovado:** em 20 de julho de 2026, o responsável autorizou concluir o Grupo 7 sem capturas e sem comparação visual automatizada depois que o procedimento oficial de recuperação confirmou que nenhum navegador estava conectado à sessão. A validação substituta compara o template legado, as classes responsivas e o HTML de produção, sem apresentar esse resultado como revisão visual executada.

**Validação substituta:** revisão estrutural aprova a página compartilhada para todos os pares, e a ausência de evidência visual está explícita para a pessoa revisora.

### Task 40 — Publicar o PR da página de conversão

- [x] Executar lint, typecheck e build.
- [x] Auditar que existe apenas uma implementação de página/formulário.
- [x] Executar `git diff --check`.
- [x] Criar o commit `refactor(frontend): migrate converter page`.
- [x] Publicar `refactor/frontend-converter-page` e abrir o PR com evidências.
- [-] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 8.

**Validação:** PR incorporado, cinco rotas válidas e 404 funcional.

## 11. Grupo 8 — Migração do fluxo interativo

**Branch:** `refactor/frontend-conversion-flow`
**Commit:** `refactor(frontend): migrate conversion workflow`
**Dependência:** Grupo 7 incorporado à `main`.

### Task 41 — Implementar o cliente HTTP binário

- [ ] Criar uma função única `convertFile` na camada `api/` da feature.
- [ ] Receber configuração tipada e `File`.
- [ ] Montar `FormData` com exatamente o campo `file`.
- [ ] Compor a base pública da API com o endpoint conhecido.
- [ ] Não definir manualmente o header multipart e seu boundary.
- [ ] Retornar `Blob` no sucesso.
- [ ] Não encaminhar a requisição por Route Handler ou Server Action.

**Validação:** uma requisição inspecionada usa o endpoint, método, campo e corpo esperados.

### Task 42 — Implementar parsing defensivo de erros

- [ ] Tentar validar `{"detail": string}` em respostas não bem-sucedidas.
- [ ] Usar mensagem de fallback para JSON inválido ou shape desconhecido.
- [ ] Usar status e status text quando agregarem informação segura.
- [ ] Não exibir stack trace nem conteúdo binário ao usuário.
- [ ] Representar falha por tipo/erro próprio pequeno, se isso simplificar o consumidor.

**Validação:** erros FastAPI, JSON desconhecido, texto e resposta vazia resultam em mensagens determinísticas.

### Task 43 — Implementar o controlador de estado do formulário

- [ ] Usar a união discriminada definida no Grupo 5.
- [ ] Transicionar de seleção para conversão, sucesso ou erro explicitamente.
- [ ] Bloquear o botão durante a conversão.
- [ ] Exibir spinner e textos atuais durante processamento.
- [ ] Restaurar o botão após sucesso ou falha.
- [ ] Impedir submissão sem arquivo e manter a mensagem atual.
- [ ] Não adicionar Redux, Context global ou biblioteca de requisições.

**Validação:** não existem booleanos independentes capazes de representar estados contraditórios.

### Task 44 — Implementar naming e download desktop

- [ ] Derivar o nome base removendo somente a última extensão, como no legado.
- [ ] Acrescentar `_convertido` e a extensão de destino do catálogo.
- [ ] Criar object URL a partir do Blob.
- [ ] Criar e acionar um link temporário com atributo `download`.
- [ ] Remover o elemento temporário do DOM.
- [ ] Revogar a object URL de forma determinística, inclusive em unmount ou nova conversão.

**Validação:** o nome e o início automático do download correspondem ao legado e não há vazamento de object URLs.

### Task 45 — Implementar o comportamento móvel existente

- [ ] Isolar a detecção de ambiente móvel em módulo cliente testável.
- [ ] Preservar a regra atual de user agent sem ampliá-la nesta entrega.
- [ ] Mostrar o link manual com o texto e as classes equivalentes.
- [ ] Preservar a tentativa automática de clique após o intervalo atual.
- [ ] Manter a URL válida enquanto o link manual puder ser usado.
- [ ] Revogar a URL quando ela deixar de ser necessária.

**Validação:** ambiente móvel recebe link visível e ambiente desktop recebe download automático sem link persistente.

### Task 46 — Limitar corretamente o Client Component

- [ ] Colocar `"use client"` somente na raiz interativa necessária.
- [ ] Manter layout, página e catálogo fora do bundle cliente quando possível.
- [ ] Garantir propriedades serializáveis na fronteira Server/Client.
- [ ] Marcar módulos com APIs exclusivas do navegador como client-only quando útil.
- [ ] Auditar que não há acesso a segredo ou variável server-only no cliente.

**Validação:** build conclui sem violações Server/Client e a diretiva não se espalha pelas páginas.

### Task 47 — Publicar o PR do fluxo interativo

- [ ] Exercitar manualmente sucesso e erro com respostas controladas.
- [ ] Executar lint, typecheck e build.
- [ ] Auditar que existe uma única chamada de conversão e uma única implementação de download.
- [ ] Executar `git diff --check`.
- [ ] Criar o commit `refactor(frontend): migrate conversion workflow`.
- [ ] Publicar `refactor/frontend-conversion-flow` e abrir o PR.
- [ ] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 9.

**Validação:** PR incorporado e fluxo completo funciona no Next.js contra API configurada.

## 12. Grupo 9 — Testes do catálogo e das páginas

**Branch:** `test/frontend-routes`
**Commit:** `test(frontend): cover catalog and pages`
**Dependência:** Grupo 8 incorporado à `main`.

### Task 48 — Instalar e configurar testes de componentes

- [ ] Selecionar runner compatível com Next.js e TypeScript.
- [ ] Configurar ambiente DOM e Testing Library.
- [ ] Criar setup compartilhado mínimo.
- [ ] Adicionar scripts `test` e `test:coverage` sem incluir coverage gerado no Git.
- [ ] Fazer aliases e CSS funcionarem nos testes sem configurações duplicadas.
- [ ] Fixar dependências no lockfile.

**Validação:** um teste simples importa código via `@/` e renderiza um componente.

### Task 49 — Testar o catálogo tipado

- [ ] Verificar que existem exatamente cinco entradas.
- [ ] Verificar ordem, pares, labels, títulos, descrições, ícones e endpoints.
- [ ] Verificar extensões aceitas, incluindo `.jpeg`.
- [ ] Verificar extensão de download de cada par.
- [ ] Verificar ausência de chaves duplicadas.

**Validação:** qualquer divergência dos metadados legados causa falha clara.

### Task 50 — Testar resolução e geração de rotas

- [ ] Testar os cinco pares válidos.
- [ ] Testar formato de origem inválido.
- [ ] Testar formato de destino inválido.
- [ ] Testar dois formatos válidos em um par não suportado.
- [ ] Testar valores vazios e diferenças de caixa sem normalização não especificada.

**Validação:** somente os cinco pares do PRD são aceitos.

### Task 51 — Testar a home

- [ ] Verificar header, subtítulo e footer.
- [ ] Verificar cinco cards e ausência de cards extras.
- [ ] Verificar textos e ícones.
- [ ] Verificar href das cinco rotas.
- [ ] Verificar que os links possuem nomes acessíveis.

**Validação:** home perde o teste se um conversor, texto ou link divergir.

### Task 52 — Testar a página de conversão

- [ ] Parametrizar renderização para os cinco pares.
- [ ] Verificar título, descrição, labels e ícone de cada par.
- [ ] Verificar o `accept` correto do input.
- [ ] Verificar link Voltar.
- [ ] Verificar que par inválido aciona 404.
- [ ] Verificar metadados quando possível sem acoplar ao framework internamente.

**Validação:** as seis rotas de interface do baseline possuem cobertura determinística.

### Task 53 — Publicar o PR de testes de páginas

- [ ] Executar testes mais de uma vez para detectar dependência de ordem.
- [ ] Executar lint, typecheck, testes e build.
- [ ] Executar `git diff --check`.
- [ ] Confirmar que código de produção só mudou quando necessário à testabilidade e sem alterar comportamento.
- [ ] Criar o commit `test(frontend): cover catalog and pages`.
- [ ] Publicar `test/frontend-routes` e abrir o PR.
- [ ] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 10.

**Validação:** PR incorporado com cobertura de catálogo, home, páginas e 404.

## 13. Grupo 10 — Testes do fluxo de conversão

**Branch:** `test/frontend-conversion-flow`
**Commit:** `test(frontend): cover conversion workflow`
**Dependência:** Grupo 9 incorporado à `main`.

### Task 54 — Preparar mocks nas fronteiras corretas

- [ ] Interceptar `fetch` ou rede na camada HTTP, sem mockar detalhes do React.
- [ ] Fornecer respostas binárias determinísticas.
- [ ] Controlar `URL.createObjectURL` e `URL.revokeObjectURL`.
- [ ] Controlar criação e clique de anchors sem depender de download real.
- [ ] Controlar user agent móvel por uma fronteira testável.
- [ ] Restaurar todos os mocks após cada teste.

**Validação:** testes não acessam rede, não baixam arquivos reais e não vazam estado global.

### Task 55 — Testar submissão e contrato multipart

- [ ] Selecionar arquivo válido pelo input.
- [ ] Submeter o formulário.
- [ ] Verificar método POST.
- [ ] Verificar endpoint correspondente ao catálogo.
- [ ] Verificar que `FormData` contém exatamente o arquivo no campo `file`.
- [ ] Verificar que o código não define manualmente `Content-Type` multipart.

**Validação:** divergência do contrato FastAPI causa falha do teste.

### Task 56 — Testar estados e prevenção de reenvio

- [ ] Testar submissão sem arquivo.
- [ ] Testar estado selecionado.
- [ ] Manter uma resposta pendente para observar `converting`.
- [ ] Verificar botão desabilitado, spinner e textos de processamento.
- [ ] Tentar uma segunda submissão e confirmar que não há segunda requisição.
- [ ] Resolver a resposta e verificar restauração do formulário.

**Validação:** estados transitórios e bloqueio de concorrência são observáveis e determinísticos.

### Task 57 — Testar sucesso e download desktop

- [ ] Responder com Blob de tipo esperado.
- [ ] Verificar criação da object URL.
- [ ] Verificar nome `original_convertido.ext`.
- [ ] Verificar criação, clique e remoção do anchor temporário.
- [ ] Verificar mensagem atual de sucesso.
- [ ] Verificar revogação da URL no momento previsto.

**Validação:** fluxo desktop completo passa sem temporizadores reais desnecessários.

### Task 58 — Testar sucesso e link móvel

- [ ] Simular user agent móvel.
- [ ] Verificar link visível com texto, URL e nome corretos.
- [ ] Verificar tentativa automática de clique.
- [ ] Verificar que o link permanece utilizável pelo período definido.
- [ ] Verificar cleanup da object URL.

**Validação:** comportamento móvel permanece distinto e equivalente ao legado.

### Task 59 — Testar todos os formatos de erro

- [ ] Testar erro JSON com `detail` string.
- [ ] Testar JSON com shape desconhecido.
- [ ] Testar body não JSON.
- [ ] Testar body vazio.
- [ ] Testar rejeição de rede.
- [ ] Verificar mensagem exibida, estilo de erro e restauração do botão em todos os casos.
- [ ] Confirmar que nenhum download é iniciado após erro.

**Validação:** erros externos nunca resultam em acesso inseguro ou estado preso em processamento.

### Task 60 — Publicar o PR de testes do fluxo

- [ ] Executar testes com timers reais e falsos conforme apropriado e sem flakiness.
- [ ] Executar lint, typecheck, testes, coverage e build.
- [ ] Auditar cobertura dos itens da seção 11.2 do PRD.
- [ ] Executar `git diff --check`.
- [ ] Criar o commit `test(frontend): cover conversion workflow`.
- [ ] Publicar `test/frontend-conversion-flow` e abrir o PR.
- [ ] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 11.

**Validação:** PR incorporado com cobertura integral das interações previstas no PRD.

## 14. Grupo 11 — Configuração de CORS

**Branch:** `chore/backend-cors`
**Commit:** `chore(backend): configure frontend origins`
**Dependência:** Grupo 10 incorporado à `main`.

### Task 61 — Definir configuração tipada de origens

- [ ] Criar configuração backend com uma única fonte para origens permitidas.
- [ ] Ler uma lista explícita de variável de ambiente.
- [ ] Normalizar espaços e entradas vazias.
- [ ] Validar esquema e protocolo das origens.
- [ ] Proibir `*` quando credenciais ou ambiente de produção tornarem isso inseguro.
- [ ] Definir valor local seguro compatível com a porta de desenvolvimento do Next.js.

**Validação:** configuração válida produz lista determinística e configuração inválida falha no startup com mensagem clara.

### Task 62 — Aplicar CORS no FastAPI

- [ ] Adicionar `CORSMiddleware` na composição da aplicação.
- [ ] Permitir somente métodos necessários aos fluxos atuais e preflight.
- [ ] Permitir somente headers necessários.
- [ ] Não habilitar credenciais sem necessidade do produto atual.
- [ ] Não alterar endpoints, respostas ou OpenAPI das conversões.

**Validação:** requests same-origin continuam funcionando e cross-origin permitido recebe headers corretos.

### Task 63 — Criar exemplos de ambiente

- [ ] Criar `backend/.env.example` sem segredos.
- [ ] Documentar a origem local do frontend.
- [ ] Documentar múltiplas origens quando suportadas.
- [ ] Garantir que `.env` real permaneça ignorado.
- [ ] Não duplicar a mesma configuração em módulo e documentação executável.

**Validação:** uma pessoa consegue iniciar os dois serviços localmente copiando somente os exemplos documentados.

### Task 64 — Testar CORS positivo e negativo

- [ ] Testar preflight de uma origem permitida.
- [ ] Testar POST ou resposta aplicável com origem permitida.
- [ ] Testar origem não permitida.
- [ ] Testar configuração com múltiplas origens.
- [ ] Testar entrada inválida ou wildcard proibido.
- [ ] Confirmar que os fakes de conversão continuam isolando engines externas.

**Validação:** allowlist é comprovada por testes positivos e negativos.

### Task 65 — Publicar o PR de CORS

- [ ] Executar testes Python duas vezes.
- [ ] Executar os testes frontend existentes.
- [ ] Comparar o OpenAPI das conversões.
- [ ] Executar `git diff --check`.
- [ ] Criar o commit `chore(backend): configure frontend origins`.
- [ ] Publicar `chore/backend-cors` e abrir o PR.
- [ ] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 12.

**Validação:** PR incorporado e frontend separado autorizado somente por configuração explícita.

## 15. Grupo 12 — Remoção integral do frontend legado

**Branch:** `refactor/backend-api-only`
**Commit:** `refactor(backend): remove legacy frontend`
**Dependência:** Grupo 11 incorporado à `main`.

### Task 66 — Remover composição HTML do FastAPI

- [ ] Remover o módulo temporário de rotas legadas criado no Grupo 3.
- [ ] Remover handlers `GET /` e `GET /converter/{from_format}/{to_format}` do backend.
- [ ] Remover montagem `/static`.
- [ ] Remover configuração de `Jinja2Templates`.
- [ ] Remover imports de `Request`, `StaticFiles` e `Jinja2Templates` sem consumidores.
- [ ] Manter Swagger/OpenAPI técnico do FastAPI.

**Validação:** inventário de rotas contém API técnica e os cinco POSTs, mas nenhuma página do produto ou mount estático.

### Task 67 — Excluir todos os arquivos de frontend legado

- [ ] Excluir `backend/templates/home.html`.
- [ ] Excluir `backend/templates/converter.html`.
- [ ] Excluir `backend/templates/index.html`.
- [ ] Excluir `backend/static/script.js`.
- [ ] Remover os diretórios vazios `templates/` e `static/`.
- [ ] Confirmar que não existem cópias equivalentes em outro caminho.

**Validação:** buscas por nomes e trechos exclusivos do legado não encontram uma segunda implementação.

### Task 68 — Remover catálogo visual do backend

- [ ] Excluir `CONVERTER_CONFIG`.
- [ ] Remover títulos, descrições, ícones e labels exclusivos da interface.
- [ ] Confirmar que mensagens HTTP dos endpoints não foram confundidas com textos visuais e removidas.
- [ ] Confirmar que o catálogo tipado do frontend é a única fonte de apresentação.

**Validação:** backend não conhece navegação nem metadados de UI.

### Task 69 — Limpar dependências e configuração obsoletas

- [ ] Remover Jinja2 das dependências diretas.
- [ ] Remover MarkupSafe somente se não for exigida transitivamente e não houver uso direto.
- [ ] Atualizar lock/inventário Python conforme o padrão existente.
- [ ] Remover paths de templates e static da configuração do backend.
- [ ] Atualizar Dockerfile para não copiar ou preparar recursos removidos.

**Validação:** instalação limpa e importação do backend funcionam sem dependências diretas do frontend legado.

### Task 70 — Provar ausência do legado por testes e buscas

- [ ] Adicionar teste de ausência das rotas HTML do produto.
- [ ] Adicionar teste de ausência do mount `/static`.
- [ ] Buscar `Jinja2Templates`, `StaticFiles`, `CONVERTER_CONFIG` e `window.converterConfig`.
- [ ] Buscar `cdn.tailwindcss.com` em todo o repositório.
- [ ] Buscar diretórios `templates` e `static` fora de dependências ignoradas.
- [ ] Confirmar que os cinco endpoints continuam cobertos e inalterados.

**Validação:** testes e buscas falhariam se o legado fosse reintroduzido.

### Task 71 — Publicar o PR de remoção

- [ ] Executar testes Python duas vezes.
- [ ] Executar lint, typecheck, testes e build do frontend.
- [ ] Construir a imagem do backend.
- [ ] Executar `git diff --check`.
- [ ] Criar o commit `refactor(backend): remove legacy frontend`.
- [ ] Publicar `refactor/backend-api-only` e abrir o PR.
- [ ] Destacar exclusões materiais e recuperação possível pelo histórico Git.
- [ ] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 13.

**Validação:** PR incorporado; FastAPI atua somente como API e não existe frontend redundante.

## 16. Grupo 13 — Testes end-to-end e paridade

**Branch:** `test/frontend-e2e`
**Commit:** `test(frontend): add migration end-to-end coverage`
**Dependência:** Grupo 12 incorporado à `main`.

### Task 72 — Configurar Playwright de forma determinística

- [ ] Instalar Playwright e fixar versões no lockfile.
- [ ] Definir navegador principal e viewports de desktop e mobile.
- [ ] Configurar diretórios ignorados para traces, vídeos e relatórios.
- [ ] Configurar servidor web do Next.js para os testes.
- [ ] Permitir reuso de servidor somente fora de CI quando seguro.
- [ ] Criar scripts separados para E2E rápido e atualização intencional de snapshots.

**Validação:** execução limpa inicia e encerra os processos sem deixar portas ou arquivos residuais.

### Task 73 — Criar fixtures de rede para conversões

- [ ] Interceptar os cinco endpoints no navegador.
- [ ] Validar método e multipart antes de responder.
- [ ] Retornar bytes e MIME determinísticos no sucesso.
- [ ] Retornar `detail` determinístico no erro.
- [ ] Não chamar engines reais na suíte rápida.
- [ ] Falhar se o frontend chamar rota desconhecida ou API intermediária do Next.js.

**Validação:** fixtures protegem o contrato observável sem acoplamento à implementação interna.

### Task 74 — Cobrir navegação e sucesso end-to-end

- [ ] Abrir a home.
- [ ] Confirmar os cinco cards.
- [ ] Navegar por link para um conversor.
- [ ] Selecionar arquivo compatível.
- [ ] Submeter e observar estado de processamento.
- [ ] Confirmar endpoint e campo multipart.
- [ ] Confirmar mensagem de sucesso e evento de download.
- [ ] Repetir de forma parametrizada onde necessário para cobrir os cinco endpoints.

**Validação:** o fluxo navegador → interface → contrato HTTP → download passa para todos os pares essenciais.

### Task 75 — Cobrir erro e rota inválida end-to-end

- [ ] Abrir um par inválido e confirmar 404.
- [ ] Simular erro FastAPI com `detail`.
- [ ] Confirmar feedback visível e botão restaurado.
- [ ] Confirmar que nenhum download ocorre.
- [ ] Confirmar que uma nova tentativa pode ser feita após erro.

**Validação:** falha controlada não deixa interface travada nem produz navegação incorreta.

### Task 76 — Adicionar smoke test entre os dois processos

- [ ] Iniciar Next.js e FastAPI como processos separados.
- [ ] Configurar a origem do frontend e base da API pelos exemplos de ambiente.
- [ ] Executar pelo navegador uma chamada real que valide CORS e alcance o FastAPI sem acionar engine externa.
- [ ] Usar entrada inválida determinística para confirmar o contrato HTTP real, se necessário.
- [ ] Confirmar que a requisição não passa por Route Handler do Next.js.
- [ ] Encerrar os dois processos mesmo em falha.

**Validação:** o smoke prova comunicação real entre os workspaces e resposta do FastAPI.

### Task 77 — Criar comparações visuais controladas

- [ ] Capturar home desktop e mobile com as condições do baseline.
- [ ] Capturar página de conversão desktop e mobile.
- [ ] Capturar estados interativos estáveis definidos no Grupo 1.
- [ ] Comparar com o baseline aprovado.
- [ ] Definir tolerância mínima somente para diferenças inevitáveis de rasterização.
- [ ] Versionar snapshots apenas após revisão humana explícita.

**Validação:** alterações visuais futuras geram diff revisável e a migração atual é aprovada como equivalente.

### Task 78 — Publicar o PR de E2E

- [ ] Executar E2E rápido mais de uma vez.
- [ ] Executar smoke real entre processos.
- [ ] Executar comparações visuais.
- [ ] Executar todos os gates de frontend e backend já existentes.
- [ ] Executar `git diff --check`.
- [ ] Criar o commit `test(frontend): add migration end-to-end coverage`.
- [ ] Publicar `test/frontend-e2e` e abrir o PR com evidências.
- [ ] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 14.

**Validação:** PR incorporado e comportamento de navegador protegido contra regressão.

## 17. Grupo 14 — Runtime, containers e proxy reverso

**Branch:** `chore/split-runtime`
**Commit:** `chore(deploy): split frontend and backend runtime`
**Dependência:** Grupo 13 incorporado à `main`.

### Task 79 — Finalizar a imagem do backend

- [ ] Manter `backend/` como contexto independente.
- [ ] Instalar dependências Python antes de copiar código para aproveitar cache.
- [ ] Preservar LibreOffice, fontes e engines exigidas.
- [ ] Criar o diretório temporário com permissões apropriadas.
- [ ] Executar como usuário não-root se isso não alterar o funcionamento das engines; caso bloqueie, registrar decisão para follow-up.
- [ ] Expor somente a porta do backend necessária na rede interna.

**Validação:** imagem é construída e os cinco endpoints são registrados no container.

### Task 80 — Criar a imagem independente do frontend

- [ ] Criar `frontend/Dockerfile` com build reproduzível por lockfile.
- [ ] Usar build em estágios quando suportado pela saída escolhida do Next.js.
- [ ] Copiar somente artefatos necessários ao runtime.
- [ ] Definir Node LTS consistente com o workspace.
- [ ] Executar como usuário não-root.
- [ ] Não incluir `.env.local`, testes, coverage ou caches no runtime.

**Validação:** imagem inicia o frontend de produção e serve as seis rotas da interface.

### Task 81 — Configurar proxy reverso

- [ ] Adicionar configuração de proxy em diretório de infraestrutura explícito.
- [ ] Encaminhar `/convert/*` diretamente ao backend.
- [ ] Encaminhar páginas e assets do Next.js diretamente ao frontend.
- [ ] Preservar streaming/resposta binária e headers de download.
- [ ] Configurar limites e timeouts sem reduzir o comportamento atual inadvertidamente.
- [ ] Não criar um terceiro código de aplicação ou BFF.

**Validação:** inspeção de rede confirma que uploads não atravessam o processo Next.js.

### Task 82 — Criar `compose.yaml`

- [ ] Definir serviços separados para frontend, backend e proxy.
- [ ] Definir redes e portas mínimas.
- [ ] Definir volume temporário somente para o backend quando necessário.
- [ ] Passar origens e base pública de API de maneira compatível com build/runtime.
- [ ] Definir ordem e readiness sem depender apenas de sleeps fixos.
- [ ] Não montar o código fonte em configuração de produção.

**Validação:** uma construção limpa sobe os serviços e expõe somente a entrada pública planejada.

### Task 83 — Validar topologia e compatibilidade pública

- [ ] Acessar `/` pelo proxy.
- [ ] Acessar os cinco conversores pelo proxy.
- [ ] Confirmar 404 de par inválido.
- [ ] Executar ao menos uma resposta binária controlada através de `/convert/*`.
- [ ] Confirmar `Content-Type` e `Content-Disposition` preservados.
- [ ] Confirmar que endpoints não ganharam prefixo ou redirecionamento inesperado.
- [ ] Confirmar que frontend e backend podem ser reconstruídos separadamente.

**Validação:** topologia preserva URLs e contratos públicos com processos independentes.

### Task 84 — Publicar o PR de runtime separado

- [ ] Construir as duas imagens sem cache pelo menos uma vez.
- [ ] Subir a composição, executar smoke e encerrá-la limpamente.
- [ ] Executar toda a suíte E2E contra a entrada pública aplicável.
- [ ] Inspecionar tamanho e conteúdo básico das imagens para evitar arquivos locais.
- [ ] Executar `git diff --check`.
- [ ] Criar o commit `chore(deploy): split frontend and backend runtime`.
- [ ] Publicar `chore/split-runtime` e abrir o PR.
- [ ] Entregar o PR pronto e aguardar o merge manual pelo responsável antes de iniciar o Grupo 15.

**Validação:** PR incorporado com builds e processos independentes e upload direcionado ao backend.

## 18. Grupo 15 — Documentação e auditoria final

**Branch:** `docs/complete-nextjs-migration`
**Commit:** `docs(architecture): complete Next.js migration`
**Dependência:** Grupo 14 incorporado à `main`.

### Task 85 — Atualizar o README para a arquitetura final

- [ ] Substituir a árvore de diretórios antiga.
- [ ] Remover referências a HTML, JavaScript Vanilla, Jinja2 e Tailwind por CDN.
- [ ] Documentar Next.js, App Router, TypeScript e Tailwind local.
- [ ] Documentar pré-requisitos de Python, Node LTS, npm, LibreOffice e Docker.
- [ ] Documentar instalação e execução independentes de frontend e backend.
- [ ] Documentar execução conjunta pelo Compose/proxy.
- [ ] Atualizar comandos de teste, lint, typecheck, build e E2E.
- [ ] Preservar a documentação funcional dos cinco endpoints.

**Validação:** uma pessoa nova consegue executar os dois workspaces seguindo somente o README.

### Task 86 — Documentar configuração e operação

- [ ] Explicar `NEXT_PUBLIC_API_BASE_URL` e seu momento de resolução no build.
- [ ] Explicar a allowlist de CORS do backend.
- [ ] Explicar desenvolvimento em portas separadas.
- [ ] Explicar roteamento de produção por `/convert/*`.
- [ ] Explicar onde arquivos temporários existem e quem os limpa.
- [ ] Não documentar funcionalidades adiadas como se estivessem disponíveis.

**Validação:** exemplos correspondem aos `.env.example`, Dockerfiles e `compose.yaml` reais.

### Task 87 — Executar auditoria de ausência de redundância

- [ ] Confirmar ausência de `templates/` e `static/` legados.
- [ ] Confirmar ausência de `Jinja2Templates`, `StaticFiles` e `CONVERTER_CONFIG`.
- [ ] Confirmar ausência de `window.converterConfig` e Tailwind CDN.
- [ ] Confirmar que há um único pacote Python em `backend/app/`.
- [ ] Confirmar que há um único catálogo visual dos conversores.
- [ ] Confirmar que há uma única função de transporte e uma única implementação de download.
- [ ] Confirmar ausência de Route Handlers e Server Actions de conversão.
- [ ] Confirmar que não existem pastas genéricas proibidas nem imports profundos burlando a API pública.

**Validação:** buscas registradas no PR não encontram implementações concorrentes.

### Task 88 — Executar auditoria de escopo e paridade

- [ ] Comparar textos, ícones, URLs e estados com o baseline.
- [ ] Comparar desktop e mobile com as evidências aprovadas.
- [ ] Confirmar exatamente cinco conversores.
- [ ] Confirmar ausência de autenticação, histórico, preview, batch ou outras features adiadas.
- [ ] Confirmar contratos multipart, status, MIME e erro dos cinco endpoints.
- [ ] Registrar diferenças inevitáveis e obter aprovação explícita, ou corrigi-las antes do merge.

**Validação:** não existe mudança funcional ou visual intencional fora do PRD.

### Task 89 — Executar todos os gates finais

- [ ] Criar instalação Python limpa e executar todos os testes backend duas vezes.
- [ ] Criar instalação npm limpa pelo lockfile.
- [ ] Executar lint, typecheck, testes e coverage do frontend.
- [ ] Executar build de produção do Next.js.
- [ ] Executar E2E rápido e comparações visuais.
- [ ] Executar smoke entre processos.
- [ ] Construir imagens de frontend e backend.
- [ ] Subir e validar a composição completa.
- [ ] Executar `git diff --check`.
- [ ] Confirmar que as validações não deixam arquivos não rastreados.

**Validação:** todos os gates da seção 11.4 do PRD passam em ambiente limpo.

### Task 90 — Encerrar o PRD e o backlog

- [ ] Atualizar o status do PRD de `Proposto` para `Concluído` somente após todos os gates.
- [ ] Adicionar data de conclusão e resumo de resultados ao PRD.
- [ ] Marcar todas as tasks efetivamente concluídas neste backlog.
- [ ] Registrar desvios aprovados, decisões de versão e follow-ups fora do escopo.
- [ ] Auditar os 15 commits e PRs na ordem planejada.
- [ ] Confirmar que cada grupo possui branch/PR rastreável.

**Validação:** PRD e backlog refletem o estado real do repositório e não antecipam conclusão.

### Task 91 — Publicar o PR final de documentação

- [ ] Revisar que o diff contém somente documentação e ajustes finais estritamente necessários à precisão.
- [ ] Executar novamente os gates afetados por qualquer ajuste final.
- [ ] Criar o commit `docs(architecture): complete Next.js migration`.
- [ ] Publicar `docs/complete-nextjs-migration`.
- [ ] Abrir o PR com links para os 14 PRs anteriores e o relatório de validação final.
- [ ] Aguardar todos os checks e aprovação.
- [ ] Entregar o PR pronto e aguardar o merge manual e a remoção da branch pelo responsável.
- [ ] Confirmar `main` sincronizada e working tree limpo.

**Validação:** PR final incorporado, série completa auditável e definição de pronto atendida.

## 19. Matriz de rastreabilidade do PRD

| Requisito do PRD | Grupos responsáveis |
| --- | --- |
| Baseline funcional e visual | 1, 6, 7, 13, 15 |
| Separação física `backend/` e `frontend/` | 2, 4, 14 |
| FastAPI somente API | 3, 11, 12 |
| App Router e Server/Client boundaries | 4, 6, 7, 8 |
| Organização por feature e dependências direcionais | 4, 5, 7, 8, 15 |
| Catálogo visual único e tipado | 5, 6, 7, 12 |
| TypeScript estrito e `typedRoutes` | 4, 5, 9, 10 |
| Upload direto ao FastAPI | 8, 11, 13, 14 |
| Paridade de home e conversores | 6, 7, 8, 13, 15 |
| Testes frontend | 9, 10 |
| Testes E2E e smoke entre processos | 13 |
| CORS restritivo e configurável | 11, 13, 15 |
| Remoção integral do legado | 12, 15 |
| Containers e proxy independentes | 14 |
| README e operação atualizados | 15 |
| Ausência de novas funcionalidades | todos, auditado no 15 |
| Um branch e um PR por grupo | todos, auditado no 15 |

## 20. Definição resumida de conclusão

A migração estará concluída somente quando os 15 PRs tiverem sido incorporados sequencialmente, as 91 tasks estiverem validadas, o frontend Next.js for a única interface do produto, o FastAPI servir apenas a API, os contratos atuais permanecerem compatíveis, a arquitetura tipada passar por todos os gates e nenhuma implementação legada ou redundante permanecer no repositório.
