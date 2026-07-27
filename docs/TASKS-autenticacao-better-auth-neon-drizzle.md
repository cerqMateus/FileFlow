# Tasks - Autenticação com Better Auth, Neon Postgres e Drizzle ORM

## 1. Referência, escopo e estados

Este backlog implementa o [PRD técnico de autenticação com Better Auth, Neon Postgres e Drizzle ORM](PRD-autenticacao-better-auth-neon-drizzle.md).

As tasks deverão ser executadas na ordem numérica. Cada grupo corresponde a uma branch e a um Pull Request coeso. O objetivo é produzir cinco PRs robustos, sem criar um PR por task e sem reunir toda a funcionalidade em uma única mudança difícil de revisar.

Estados utilizados:

- `[ ]` pendente;
- `[-]` em andamento;
- `[x]` concluída e validada;
- `[!]` bloqueada, acompanhada do motivo e da evidência.

Uma task só poderá ser marcada como concluída depois que sua validação tiver sido executada. Ações externas, como provisionar Neon ou cadastrar secrets, deverão ter evidência redigida no PR sem revelar valores sensíveis.

## 2. Regras de branches, commits e Pull Requests

### 2.1. Fluxo sequencial obrigatório

Cada grupo deverá seguir este ciclo:

1. aguardar o merge do PR anterior;
2. atualizar a `main` local por fast-forward e confirmar correspondência com `origin/main`;
3. inventariar mudanças locais existentes e não descartar trabalho sem autorização;
4. criar a branch indicada a partir da `main` atualizada;
5. implementar somente as tasks do grupo;
6. criar os commits indicados nos pontos de avanço significativo;
7. executar as validações do grupo e `git diff --check`;
8. revisar o diff completo e confirmar ausência de secrets e artefatos;
9. publicar a branch e abrir um PR não-draft;
10. corrigir feedback e checks na mesma branch;
11. aguardar o merge antes de iniciar o grupo seguinte.

Branches empilhadas não serão usadas. Uma branch dependente não deverá nascer de outra branch de feature.

### 2.2. Commits

- As mensagens planejadas usam Conventional Commits.
- Cada commit deverá representar um avanço verificável e deixar o branch em estado compilável e testável dentro do possível.
- Correções pequenas durante review poderão ser commits adicionais na mesma branch.
- Não usar mensagens genéricas como `changes`, `updates`, `wip` ou `fix stuff`.
- `package-lock.json`, schema gerado, migrations e metadados Drizzle pertencem ao commit que introduz a respectiva capacidade.
- Não versionar `.env`, `.env.local`, connection strings, tokens, cookies, caches, builds ou relatórios.

### 2.3. Conteúdo mínimo de cada PR

Cada PR deverá informar:

- objetivo e limites do grupo;
- tasks concluídas;
- commits e áreas principais alteradas;
- decisões técnicas tomadas;
- comandos de validação e resultados;
- migrations incluídas ou declaração de que não há migration;
- evidência redigida de qualquer ação no Neon;
- riscos, compatibilidade e rollback;
- confirmação de que os conversores continuam públicos e chamam o FastAPI diretamente;
- links para este backlog e para o PRD.

## 3. Premissas e bloqueios

### 3.1. Decisão de produto obrigatória

Este backlog assume que os cinco conversores permanecem públicos e que somente `/dashboard` exige autenticação. Essa decisão deverá ser confirmada no Grupo 1.

Se os conversores precisarem de autenticação, o Grupo 2 ficará bloqueado até que PRD e backlog sejam revisados para incluir autenticação entre Next.js e FastAPI, proteção dos endpoints `/convert/*` e nova política de CORS/credenciais ou tokens.

### 3.2. Dependências externas

Antes do fim do Grupo 2, será necessário acesso autorizado ao Neon para criar branches/databases e cadastrar secrets. Antes do fim do Grupo 5, serão necessários o domínio e a plataforma de deploy do frontend para definir `BETTER_AUTH_URL`, origens confiáveis e headers de IP.

Nenhuma credencial real será colocada neste documento ou no repositório.

**Decisão posterior ao Grupo 2:** o FileFlow usará somente o banco Neon
principal. Testes de integração que persistem dados serão opt-in, seriais,
usarão identificadores exclusivos e limparão somente seus próprios registros.
Operações estruturais ou limpeza ampla permanecem proibidas.

### 3.3. Limites mantidos em todos os grupos

- O FastAPI não receberá Better Auth, cookies ou lógica de usuário.
- Uploads não passarão por Route Handlers do Next.js.
- Verificação de e-mail, recuperação de senha e login social não serão antecipados.
- O design será mínimo e seguirá o estilo existente.
- Não será criada criptografia própria, DTO duplicado dos endpoints Better Auth ou adapter paralelo.

## 4. Mapa dos grupos

| Grupo | Branch | Commits planejados | Resultado do PR |
| --- | --- | --- | --- |
| 1 | `docs/auth-implementation-plan` | `docs(auth): plan authentication delivery` | PRD aprovado e execução sequencial acordada |
| 2 | `feat/auth-persistence-foundation` | `chore(auth): add Neon and Drizzle foundation`; `feat(auth): add persistent authentication schema` | Banco, configuração, schema e migration reproduzíveis |
| 3 | `feat/auth-server-session` | `feat(auth): expose Better Auth service`; `feat(auth): protect authenticated routes` | API de autenticação, sessão e proteção server-side funcionais |
| 4 | `feat/auth-user-flows` | `feat(auth): add sign-up and sign-in flows`; `feat(auth): add dashboard and sign-out flow`; `test(auth): cover user-facing flows` | Cadastro, login, dashboard e logout utilizáveis |
| 5 | `chore/auth-release-readiness` | `test(auth): add database and browser coverage`; `docs(auth): document setup and operations` | E2E, regressão, documentação e release preparados |

## 5. Grupo 1 - Planejamento e decisões

**Branch:** `docs/auth-implementation-plan`
**Dependência:** PRD criado e mudanças locais existentes inventariadas.
**Commit:** `docs(auth): plan authentication delivery`

### Task 1 - Registrar o baseline antes da série

- [x] Confirmar branch atual, `git status --short` e divergência em relação a `origin/main`.
- [x] Identificar alterações preliminares de autenticação já existentes no working tree.
- [x] Separar mudanças documentais deste grupo de alterações de implementação ainda não validadas.
- [x] Não reverter nem sobrescrever mudanças locais sem autorização.
- [x] Confirmar que PRs anteriores necessários à arquitetura Next.js/FastAPI já estão incorporados.

**Validação:** o PR documental contém somente os arquivos de planejamento pretendidos, e o PR registra qualquer alteração local excluída do escopo.

### Task 2 - Confirmar as decisões de produto

- [x] Confirmar que os conversores permanecerão públicos neste MVP.
- [x] Confirmar que `/dashboard` será a única rota protegida inicial.
- [x] Confirmar que o cadastro exigirá nome, e-mail, senha e confirmação.
- [x] Confirmar que cadastro bem-sucedido autenticará o usuário automaticamente.
- [x] Confirmar que verificação de e-mail, recuperação de senha e login social permanecem adiados.
- [x] Registrar no PRD qualquer decisão diferente antes de aprovar este backlog.

**Validação:** não resta decisão de produto pendente que altere banco, FastAPI, rotas ou fluxos do MVP.

### Task 3 - Revisar PRD e backlog

- [x] Revisar o PRD contra o estado real do repositório.
- [x] Revisar este backlog e sua ordem de dependências.
- [x] Confirmar que todas as tasks possuem resultado verificável.
- [x] Confirmar que os cinco grupos são suficientes e não sobrepõem escopo.
- [x] Confirmar links relativos, UTF-8 e nomenclatura de branches e commits.
- [x] Alterar o status do PRD para `Aprovado` após a aprovação explícita.

**Validação:** PRD e backlog concordam sobre escopo, arquitetura, critérios de aceite e definição de pronto.

### Task 4 - Publicar o PR de planejamento

- [x] Executar `git diff --check`.
- [x] Criar o commit `docs(auth): plan authentication delivery`.
- [x] Publicar `docs/auth-implementation-plan`.
- [x] Abrir o PR com o mapa dos cinco grupos e a decisão sobre conversores públicos.
- [x] Obter aprovação do PRD e da sequência de entrega.
- [-] Aguardar o merge antes de iniciar o Grupo 2.

**Validação:** documentos incorporados à `main` e escopo aprovado.

## 6. Grupo 2 - Fundação de persistência

**Branch:** `feat/auth-persistence-foundation`
**Dependência:** Grupo 1 incorporado à `main`.

### Task 5 - Reconciliar dependências preliminares

- [ ] Reavaliar qualquer dependência de autenticação já adicionada ao `package.json`.
- [ ] Consultar as versões vigentes e escolher uma combinação compatível de Better Auth, Drizzle ORM, Drizzle Kit e `pg`.
- [ ] Usar um único adapter Drizzle suportado pela versão fixada do Better Auth.
- [ ] Remover adapter duplicado ou pacote desnecessário, se existir.
- [ ] Fixar versões pelo `package-lock.json` e evitar `latest` em scripts de CI.
- [ ] Adicionar scripts de schema, geração de migration, aplicação de migration e Drizzle Studio.
- [ ] Confirmar compatibilidade com Node e npm declarados pelo frontend.

**Validação:** instalação limpa por `npm ci`, árvore de dependências sem adapter concorrente e scripts listados por `npm run`.

### Task 6 - Provisionar os ambientes Neon

- [ ] Criar ou selecionar o projeto Neon autorizado para o FileFlow.
- [ ] Criar branch/database de desenvolvimento.
- [ ] Criar branch/database exclusiva de testes ou CI.
- [ ] Reservar a branch primária exclusivamente para produção.
- [ ] Obter URL pooled para runtime e URL direta para migrations em cada ambiente.
- [ ] Confirmar SSL obrigatório e região adequada.
- [ ] Cadastrar os secrets nas plataformas autorizadas sem copiá-los para arquivos versionados.
- [ ] Registrar evidência redigida com nomes de ambiente, nunca credenciais.

**Validação:** desenvolvimento e testes respondem a uma consulta de conectividade, e um guardrail documental impede testes contra produção.

### Task 7 - Separar e validar configuração privada

- [ ] Preservar a validação pública existente de `NEXT_PUBLIC_API_BASE_URL`.
- [ ] Criar leitura server-only de `DATABASE_URL`.
- [ ] Criar leitura de ferramenta para `DATABASE_MIGRATION_URL`.
- [ ] Validar `BETTER_AUTH_SECRET` com no mínimo 32 caracteres e sem expor o valor.
- [ ] Validar `BETTER_AUTH_URL` como origem HTTP(S) canônica sem query, fragment ou credenciais.
- [ ] Validar `BETTER_AUTH_TRUSTED_ORIGINS` como allowlist explícita.
- [ ] Falhar cedo com o nome da variável ausente ou inválida.
- [ ] Atualizar `.env.example` somente com placeholders seguros.
- [ ] Adicionar testes unitários da validação privada.

**Validação:** valores inválidos falham com mensagens seguras, módulos cliente não conseguem importar configuração privada e nenhum secret aparece no diff.

### Task 8 - Configurar Drizzle para runtime e migrations

- [ ] Criar `src/db/index.ts` protegido por `server-only`.
- [ ] Inicializar `pg` e `drizzle-orm/node-postgres` com `DATABASE_URL` pooled.
- [ ] Garantir um pool por instância de runtime, sem criar pool por requisição.
- [ ] Configurar limites e timeouts conservadores sem codificar credenciais.
- [ ] Criar `drizzle.config.ts` usando `DATABASE_MIGRATION_URL` direta.
- [ ] Definir diretório versionado `frontend/drizzle/`.
- [ ] Definir caminho explícito para o schema de autenticação.
- [ ] Impedir que conexão e schema server-side entrem no bundle cliente.

**Validação:** typecheck passa, a configuração Drizzle é carregada com ambiente de teste e uma consulta `select 1` funciona no Neon de desenvolvimento/teste.

### Task 9 - Configurar a instância Better Auth para geração de schema

- [ ] Criar módulo server-side da instância Better Auth.
- [ ] Configurar o adapter Drizzle com `provider: "pg"` e schema explícito.
- [ ] Habilitar somente e-mail e senha.
- [ ] Configurar senha entre 8 e 128 caracteres.
- [ ] Configurar sessão de 7 dias e renovação após 1 dia.
- [ ] Manter cookie cache desabilitado.
- [ ] Configurar rate limiting persistido no banco.
- [ ] Incluir regras específicas de login e cadastro definidas no PRD.
- [ ] Configurar secret, base URL e trusted origins pelo ambiente privado.
- [ ] Não montar ainda o Route Handler público.

**Validação:** a CLI Better Auth consegue carregar a configuração sem expor secrets e identifica o adapter PostgreSQL esperado.

### Task 10 - Gerar e revisar o schema de autenticação

- [ ] Gerar o schema com a CLI compatível e fixada do Better Auth.
- [ ] Versionar `user`, `session`, `account`, `verification` e `rateLimit`.
- [ ] Confirmar UUIDs, timestamps UTC e tipos esperados.
- [ ] Confirmar unicidade de e-mail e token de sessão.
- [ ] Confirmar chaves estrangeiras e cascade para sessão e conta.
- [ ] Confirmar índices para consultas de sessão, conta e verificação.
- [ ] Confirmar que `account.password` armazena somente hash gerenciado pelo Better Auth.
- [ ] Evitar customizações manuais sem justificativa registrada.

**Validação:** schema revisado contra a documentação da versão fixada e sem tabela ou coluna obrigatória ausente.

### Task 11 - Gerar a migration inicial

- [ ] Executar a geração do Drizzle Kit a partir do schema revisado.
- [ ] Versionar SQL e metadados da migration.
- [ ] Revisar que o SQL cria exatamente as tabelas, constraints e índices planejados.
- [ ] Aplicar a migration em banco de teste vazio usando conexão direta.
- [ ] Reexecutar o comando de migration e confirmar idempotência do histórico.
- [ ] Confirmar que nova geração não produz diff inesperado.
- [ ] Não usar `drizzle-kit push` em produção.

**Validação:** um banco vazio chega ao schema esperado somente com migrations versionadas e não existem mudanças pendentes.

### Task 12 - Testar a fundação de dados

- [ ] Testar conexão pooled do runtime.
- [ ] Testar que a configuração de migration usa a URL direta.
- [ ] Testar constraints de e-mail e token únicos.
- [ ] Testar relações e cascade em banco exclusivo de testes.
- [ ] Testar persistência do contador de rate limiting.
- [ ] Adicionar guardrail que rejeite ambiente de teste apontando para a branch/database de produção.
- [ ] Confirmar que logs de erro não exibem connection strings.

**Validação:** testes de configuração e banco passam repetidamente contra o ambiente de testes.

### Task 13 - Consolidar e publicar o PR de persistência

- [ ] Criar o commit `chore(auth): add Neon and Drizzle foundation` após Tasks 5 a 8.
- [ ] Criar o commit `feat(auth): add persistent authentication schema` após Tasks 9 a 12.
- [ ] Executar `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` com ambiente seguro.
- [ ] Aplicar migrations do zero mais uma vez em banco limpo de teste.
- [ ] Executar os testes existentes de conversão do frontend.
- [ ] Executar `git diff --check` e revisar o lockfile, schema e SQL.
- [ ] Abrir o PR com plano de migration e rollback por branch/restore Neon.
- [ ] Aguardar o merge antes do Grupo 3.

**Validação:** PR incorporado com persistência reproduzível, sem endpoint ou interface pública de autenticação ainda.

## 7. Grupo 3 - Serviço de autenticação e sessão server-side

**Branch:** `feat/auth-server-session`
**Dependência:** Grupo 2 incorporado à `main` e migration aplicada no banco principal.

### Task 14 - Expor o handler oficial do Better Auth

- [ ] Criar `src/app/api/auth/[...all]/route.ts`.
- [ ] Delegar `GET` e `POST` diretamente a `toNextJsHandler(auth)`.
- [ ] Declarar runtime Node.js quando necessário.
- [ ] Não criar wrappers para os endpoints nativos.
- [ ] Confirmar que `/api/auth/get-session` responde sessão ou nulo.
- [ ] Confirmar que rotas não suportadas retornam resposta controlada.

**Validação:** endpoints Better Auth respondem no Next.js e não alteram `/convert/*` nem a topologia de uploads.

### Task 15 - Criar utilitários server-side de sessão

- [ ] Criar função coesa para obter sessão a partir dos headers da requisição.
- [ ] Manter a função em módulo `server-only`.
- [ ] Tratar sessão ausente, expirada ou revogada como nula.
- [ ] Evitar duplicar leitura de cookie ou implementar verificação manual de token.
- [ ] Criar validador de `callbackURL` que aceite somente paths internos seguros.
- [ ] Rejeitar `//`, esquemas, hosts, credenciais e valores malformados.
- [ ] Adicionar testes unitários do validador.

**Validação:** sessão é obtida pela API oficial e todos os casos de open redirect previstos no PRD são rejeitados.

### Task 16 - Proteger `/dashboard` no servidor

- [ ] Criar a rota `/dashboard` como Server Component.
- [ ] Consultar a sessão antes de renderizar conteúdo autenticado.
- [ ] Redirecionar ausência de sessão para `/auth?callbackURL=%2Fdashboard`.
- [ ] Renderizar nesta etapa apenas conteúdo mínimo e não sensível da sessão.
- [ ] Não confiar em query string, estado cliente ou mera existência do cookie.
- [ ] Evitar `proxy.ts` salvo se houver benefício demonstrado.
- [ ] Se `proxy.ts` for criado, manter a validação autoritativa no Server Component.

**Validação:** requisição anônima não recebe conteúdo autenticado e sessão válida consegue renderizar a rota.

### Task 17 - Validar segurança de origem, cookie e rate limiting

- [ ] Testar origem confiável e rejeição de origem não autorizada.
- [ ] Confirmar atributos `HttpOnly`, `SameSite=Lax` e `Secure` em configuração de produção.
- [ ] Confirmar que cookie não usa domínio compartilhado entre subdomínios.
- [ ] Confirmar que token não aparece no corpo da página ou Web Storage.
- [ ] Confirmar persistência distribuída do rate limiting no banco.
- [ ] Testar limite de login de 3 tentativas por 10 segundos.
- [ ] Testar limite de cadastro de 5 tentativas por 60 segundos.
- [ ] Tratar `429` sem expor detalhes internos.

**Validação:** testes automatizados opt-in cobrem origem, cookie e abuso no banco principal, com chaves exclusivas e limpeza restrita.

### Task 18 - Cobrir os contratos de autenticação por integração

- [ ] Cadastrar usuário pela API Better Auth.
- [ ] Confirmar criação de usuário, conta e sessão.
- [ ] Confirmar que o valor persistido da senha não corresponde ao texto original.
- [ ] Rejeitar cadastro duplicado sem criar segundo usuário.
- [ ] Autenticar senha correta e rejeitar senha incorreta.
- [ ] Recuperar sessão pelo cookie.
- [ ] Revogar sessão pelo logout.
- [ ] Rejeitar sessão expirada e sessão revogada.
- [ ] Limpar os dados exclusivos criados pelos testes.

**Validação:** a suíte prova o ciclo completo sem depender ainda dos formulários visuais.

**Política de banco único:** executar somente por `npm run test:auth:primary`.
A suíte deve ser serial, criar e-mails e chaves próprias e deixar zero resíduos.

### Task 19 - Auditar isolamento em relação ao FastAPI

- [ ] Confirmar que nenhum arquivo do backend importa Better Auth, Drizzle ou schema de usuário.
- [ ] Confirmar que `BACKEND_CORS_ORIGINS` e `allow_credentials=False` permanecem adequados aos conversores públicos.
- [ ] Confirmar que `/api/auth/*` existe somente no Next.js.
- [ ] Confirmar que o smoke test de conversão não observa request intermediária no Next.js.
- [ ] Registrar qualquer futura integração com FastAPI como fora de escopo.

**Validação:** buscas e testes demonstram fronteiras independentes entre autenticação e conversão.

### Task 20 - Consolidar e publicar o PR server-side

- [ ] Criar o commit `feat(auth): expose Better Auth service` após Tasks 14, 15, 17 e 18.
- [ ] Criar o commit `feat(auth): protect authenticated routes` após Tasks 16 e 19.
- [ ] Executar lint, typecheck, testes unitários, testes de integração e build.
- [ ] Executar a suíte de conversão do frontend e smoke test existente.
- [ ] Executar `git diff --check`.
- [ ] Revisar respostas, headers e logs em busca de informação sensível.
- [ ] Abrir o PR com evidência dos contratos e limites de arquitetura.
- [ ] Aguardar o merge antes do Grupo 4.

**Validação:** PR incorporado com serviço de autenticação e proteção server-side funcionais, ainda sem fluxo visual completo.

## 8. Grupo 4 - Fluxos de usuário

**Branch:** `feat/auth-user-flows`
**Dependência:** Grupo 3 incorporado à `main`.

### Task 21 - Criar o cliente oficial de autenticação

- [ ] Criar `src/lib/auth/client.ts` como módulo cliente.
- [ ] Instanciar `createAuthClient` pelo caminho React suportado.
- [ ] Preferir same-origin e não expor `BETTER_AUTH_SECRET` ou `DATABASE_URL`.
- [ ] Centralizar tratamento de `429` quando isso reduzir duplicação real.
- [ ] Não reconstruir manualmente endpoints ou DTOs do Better Auth.

**Validação:** o cliente tipado funciona no navegador e o bundle não contém configuração privada.

### Task 22 - Implementar a composição de `/auth`

- [ ] Criar `/auth` como página server-side fina.
- [ ] Redirecionar usuários já autenticados para `/dashboard`.
- [ ] Interpretar `modo=cadastro` sem aceitar estados arbitrários.
- [ ] Validar `callbackURL` no servidor antes de repassá-lo ao componente interativo.
- [ ] Exibir login por padrão e oferecer navegação para cadastro.
- [ ] Preservar o design atual sem iniciar reformulação visual.

**Validação:** acesso anônimo vê o modo correto, sessão válida é redirecionada e callback externo é descartado.

### Task 23 - Modelar validação e mensagens dos formulários

- [ ] Definir validação compartilhável para nome entre 2 e 100 caracteres.
- [ ] Validar e-mail obrigatório.
- [ ] Validar senha entre 8 e 128 caracteres.
- [ ] Validar confirmação no cliente sem enviá-la ao servidor.
- [ ] Mapear erros conhecidos para mensagens em português.
- [ ] Usar mensagem genérica para credenciais inválidas e erros desconhecidos.
- [ ] Garantir que mensagens não revelem tabela, SQL, host, stack ou existência isolada do e-mail.
- [ ] Adicionar testes unitários das regras e do mapeamento.

**Validação:** casos-limite produzem resultado determinístico e seguro.

### Task 24 - Implementar cadastro

- [ ] Criar formulário com nome, e-mail, senha e confirmação.
- [ ] Adicionar labels, tipos e `autocomplete` adequados.
- [ ] Exibir erros por campo e resumo anunciável.
- [ ] Bloquear reenvio enquanto a submissão estiver em andamento.
- [ ] Usar `authClient.signUp.email`.
- [ ] Não enviar `passwordConfirmation`.
- [ ] Em sucesso, redirecionar para callback interno ou `/dashboard`.
- [ ] Em falha, manter nome/e-mail e limpar campos de senha.

**Validação:** teste de componente cobre sucesso, validação local, duplicidade, falha de rede e submissão repetida.

### Task 25 - Implementar login

- [ ] Criar formulário com e-mail e senha.
- [ ] Adicionar labels, tipos e `autocomplete` adequados.
- [ ] Bloquear reenvio durante autenticação.
- [ ] Usar `authClient.signIn.email`.
- [ ] Em sucesso, redirecionar para callback interno ou `/dashboard`.
- [ ] Em erro, manter e-mail, limpar senha e exibir mensagem genérica.
- [ ] Exibir orientação de nova tentativa em falha de rede ou `429`.

**Validação:** teste de componente cobre sucesso, credenciais inválidas, rate limit, falha de rede e foco do erro.

### Task 26 - Completar dashboard e logout

- [ ] Exibir nome e e-mail obtidos da sessão server-side.
- [ ] Adicionar ação `Sair` em limite cliente pequeno.
- [ ] Bloquear a ação durante a requisição.
- [ ] Usar `authClient.signOut`.
- [ ] Redirecionar para `/auth` após sucesso.
- [ ] Tratar logout sem sessão como estado final não autenticado.
- [ ] Em falha de rede, manter mensagem e permitir nova tentativa.
- [ ] Confirmar que logout revoga a sessão no banco e remove o cookie.

**Validação:** testes cobrem renderização, logout bem-sucedido, logout idempotente e falha recuperável.

### Task 27 - Integrar navegação mínima e acessibilidade

- [ ] Adicionar entrada mínima para login/cadastro a partir da interface existente.
- [ ] Não alterar os links ou cards dos cinco conversores.
- [ ] Garantir foco visível e operação por teclado.
- [ ] Associar mensagens de campo com `aria-describedby`.
- [ ] Usar região anunciável para erro geral e estados de envio.
- [ ] Verificar formulários a partir de 320 px.
- [ ] Evitar que estado de sucesso/erro dependa somente de cor.
- [ ] Atualizar metadados somente quando necessário.

**Validação:** revisão com teclado e testes de acessibilidade do fluxo principal não encontram bloqueios críticos.

### Task 28 - Consolidar testes dos fluxos visuais

- [ ] Testar redirecionamento de `/auth` quando já autenticado.
- [ ] Testar seleção dos modos de login e cadastro.
- [ ] Testar validação de callback seguro e inseguro.
- [ ] Testar todos os estados de cadastro, login e logout.
- [ ] Testar que recarregar dashboard preserva apresentação da sessão.
- [ ] Atualizar cobertura sem excluir arquivos de autenticação relevantes.
- [ ] Confirmar que mocks não escondem erro de integração tipada com Better Auth.

**Validação:** suíte unitária/de componentes cobre RF-01 a RF-07 no nível apropriado.

### Task 29 - Publicar o PR dos fluxos de usuário

- [ ] Criar `feat(auth): add sign-up and sign-in flows` após Tasks 21 a 25.
- [ ] Criar `feat(auth): add dashboard and sign-out flow` após Tasks 26 e 27.
- [ ] Criar `test(auth): cover user-facing flows` após Task 28.
- [ ] Executar lint, typecheck, testes, cobertura e build.
- [ ] Executar Playwright existente para detectar regressão visual/funcional.
- [ ] Executar `git diff --check`.
- [ ] Revisar responsividade e fluxo por teclado.
- [ ] Abrir o PR com capturas ou descrição objetiva dos estados mínimos.
- [ ] Aguardar o merge antes do Grupo 5.

**Validação:** PR incorporado com cadastro, login, dashboard e logout utilizáveis de ponta a ponta em ambiente de desenvolvimento.

## 9. Grupo 5 - Qualidade, documentação e release

**Branch:** `chore/auth-release-readiness`
**Dependência:** Grupo 4 incorporado à `main` e ambiente Neon de testes disponível.

### Task 30 - Automatizar o banco de testes

- [ ] Definir como o CI obtém uma branch/database Neon isolada.
- [ ] Garantir que credenciais de testes não tenham acesso à produção.
- [ ] Aplicar migrations antes da suíte de integração/E2E.
- [ ] Usar e-mails únicos por execução.
- [ ] Limpar usuários e registros auxiliares criados pela suíte.
- [ ] Tornar falha de migration um bloqueio do pipeline.
- [ ] Redigir secrets em logs e relatórios.
- [ ] Documentar fallback quando branches efêmeras não estiverem disponíveis.

**Validação:** duas execuções consecutivas partem de estado controlado e passam sem interferência entre si.

### Task 31 - Implementar E2E de cadastro e login

- [ ] Testar cadastro válido até `/dashboard`.
- [ ] Testar confirmação divergente sem request de cadastro.
- [ ] Testar e-mail duplicado com mensagem segura.
- [ ] Testar login válido até `/dashboard`.
- [ ] Testar login inválido sem criar sessão.
- [ ] Testar persistência da sessão após recarregamento.
- [ ] Evitar dependência de ordem entre testes.

**Validação:** Playwright passa repetidamente contra Next.js e Neon de testes reais.

### Task 32 - Implementar E2E de proteção e logout

- [ ] Testar redirecionamento anônimo de `/dashboard`.
- [ ] Testar retorno por callback interno após login.
- [ ] Testar rejeição de callback externo e protocol-relative.
- [ ] Testar exibição de nome/e-mail autenticados.
- [ ] Testar logout e bloqueio de novo acesso ao dashboard.
- [ ] Testar labels, teclado e foco no fluxo principal.
- [ ] Confirmar ausência de token em local/session storage.

**Validação:** E2E demonstra RF-04 a RF-07 e os controles básicos de segurança do navegador.

### Task 33 - Executar regressão completa e auditoria de segurança

- [ ] Executar frontend lint, typecheck, testes, cobertura e build.
- [ ] Executar E2E de autenticação, E2E existente, smoke e visual quando disponível.
- [ ] Executar a suíte completa do backend FastAPI.
- [ ] Confirmar que os cinco conversores permanecem públicos.
- [ ] Confirmar por interceptação de rede que uploads continuam indo ao FastAPI.
- [ ] Buscar secrets, connection strings, tokens e cookies no diff e bundle.
- [ ] Inspecionar headers de cookie em build de produção.
- [ ] Confirmar que logs não capturam corpos de `/api/auth/*`.
- [ ] Verificar que schema e migrations continuam sincronizados.

**Validação:** todos os gates do PRD passam e a auditoria não encontra regressão ou vazamento.

### Task 34 - Atualizar documentação de setup e operação

- [ ] Atualizar README com infraestrutura e fluxo de autenticação.
- [ ] Documentar criação segura de `.env.local` a partir de `.env.example`.
- [ ] Documentar variáveis públicas, privadas e de migration.
- [ ] Documentar comandos de schema e migrations.
- [ ] Documentar separação entre runtime pooled e migration direta.
- [ ] Documentar ambientes Neon e proibição de testes em produção.
- [ ] Documentar rotação de secret e efeito sobre sessões.
- [ ] Documentar aplicação de migration antes do deploy dependente.
- [ ] Documentar recuperação por restore/branch Neon.
- [ ] Registrar que política de privacidade deve cobrir nome, e-mail e metadados de sessão antes do lançamento público.

**Validação:** uma pessoa sem contexto consegue configurar desenvolvimento, testar, migrar e diagnosticar a feature sem receber um secret por canal inseguro.

### Task 35 - Preparar e validar staging/preview

- [ ] Definir domínio canônico de staging/preview.
- [ ] Configurar `BETTER_AUTH_URL` e trusted origins exatas.
- [ ] Configurar header de IP somente conforme garantia da plataforma.
- [ ] Aplicar migration no banco de staging com conexão direta.
- [ ] Publicar o commit exato do branch em preview/staging.
- [ ] Executar smoke de cadastro, login, sessão, proteção e logout.
- [ ] Confirmar cookies `Secure`, `HttpOnly` e `SameSite=Lax`.
- [ ] Confirmar conectividade pooled e ausência de excesso de conexões.
- [ ] Excluir conta e dados de smoke quando concluído.

**Validação:** staging reproduz a topologia de produção e todos os fluxos essenciais passam por HTTPS.

### Task 36 - Publicar o PR de release readiness

- [ ] Criar `test(auth): add database and browser coverage` após Tasks 30 a 33.
- [ ] Criar `docs(auth): document setup and operations` após Tasks 34 e 35.
- [ ] Executar todos os gates finais e `git diff --check`.
- [ ] Incluir no PR matriz dos critérios de aceite e seus testes.
- [ ] Incluir plano de aplicação da migration de produção.
- [ ] Incluir plano de rollback de aplicação e recuperação do banco.
- [ ] Confirmar que nenhuma decisão adiada foi implementada.
- [ ] Entregar o PR pronto e aguardar merge manual.

**Validação:** PR incorporado com testes, documentação e evidência de staging suficientes para autorizar produção.

### Task 37 - Executar rollout de produção após o merge

Esta task é operacional e não exige um novo PR, pois não altera arquivos. Deve usar o commit incorporado e o runbook versionado pelo Grupo 5.

- [ ] Criar ponto de restauração ou branch de segurança no Neon.
- [ ] Confirmar secrets de produção e origem canônica HTTPS.
- [ ] Aplicar a migration de produção antes do código dependente.
- [ ] Interromper o deploy se a migration falhar.
- [ ] Publicar o frontend incorporado à `main`.
- [ ] Executar smoke com conta de produção destinada a teste.
- [ ] Confirmar cadastro, login, recarregamento, proteção e logout.
- [ ] Confirmar que conversões públicas continuam funcionando.
- [ ] Remover os dados da conta de smoke.
- [ ] Monitorar 5xx de `/api/auth/*` e conexões Neon por pelo menos 24 horas.
- [ ] Registrar incidentes, desvios ou rollback na evidência da release.

**Validação:** produção atende aos critérios de aceite sem regressão, e a evidência operacional está vinculada ao PR/release.

## 10. Matriz de rastreabilidade

| Requisito do PRD | Tasks responsáveis |
| --- | --- |
| RF-01 - Exibir autenticação | 22, 27, 28, 31 |
| RF-02 - Cadastrar usuário | 9, 10, 18, 23, 24, 28, 31 |
| RF-03 - Autenticar usuário | 14, 17, 18, 23, 25, 28, 31 |
| RF-04 - Manter sessão | 9, 15, 17, 18, 26, 28, 31 |
| RF-05 - Proteger rota | 15, 16, 22, 28, 32 |
| RF-06 - Exibir área autenticada | 16, 26, 28, 32 |
| RF-07 - Encerrar sessão | 18, 26, 28, 32 |
| RF-08 - Preservar conversões | 19, 20, 27, 29, 33, 37 |
| Schema e migrations | 5 a 13, 30, 33, 35, 37 |
| Segurança e privacidade | 7, 9, 15, 17, 23, 30, 32 a 35 |
| Observabilidade e recuperação | 12, 33 a 37 |
| Documentação e operação | 3, 34 a 37 |

## 11. Gates por grupo

| Grupo | Gates mínimos |
| --- | --- |
| 1 | links relativos, revisão documental e `git diff --check` |
| 2 | `npm ci`, lint, typecheck, unitários, build, migration em banco vazio e testes de constraints |
| 3 | lint, typecheck, unitários, integração Better Auth, build, regressão de conversão e smoke |
| 4 | lint, typecheck, componentes, cobertura, build, Playwright existente e acessibilidade manual |
| 5 | todos os gates frontend, E2E auth, smoke/visual, backend completo, auditoria de secrets e staging |

Comandos-base do frontend:

```powershell
cd frontend
npm ci
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e
npm run test:e2e:smoke
npm run test:e2e:visual
```

O comando exato de integração de autenticação e migrations será adicionado no Grupo 2 e automatizado no Grupo 5. O backend deverá ser validado a partir da raiz com a suíte Python documentada no README.

## 12. Definição resumida de conclusão

A feature estará concluída quando:

1. os cinco PRs tiverem sido incorporados sequencialmente;
2. as 37 tasks estiverem concluídas ou possuírem desvio explicitamente aprovado;
3. cadastro, login, sessão, `/dashboard` e logout funcionarem em produção;
4. schema e migrations forem reproduzíveis em banco vazio;
5. rate limiting for persistido e cookies tiverem atributos seguros;
6. secrets estiverem isolados por ambiente;
7. E2E e regressão completa passarem;
8. uploads continuarem indo diretamente ao FastAPI;
9. documentação e runbook refletirem a implementação real;
10. a evidência de rollout e monitoramento inicial estiver registrada.
