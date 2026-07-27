# PRD técnico - Autenticação com Better Auth, Neon Postgres e Drizzle ORM

## 1. Identificação

- **Status:** Aprovado
- **Data:** 22 de julho de 2026
- **Data de aprovação:** 22 de julho de 2026
- **Produto:** FileFlow
- **Tipo:** Nova funcionalidade e evolução arquitetural
- **Responsáveis:** Produto e Engenharia do FileFlow
- **Escopo da entrega:** cadastro, login, sessão autenticada, área protegida e logout
- **Stack definida:** Next.js 16, Better Auth, Drizzle ORM e Neon Postgres
- **Decisão confirmada:** os conversores existentes permanecem públicos nesta entrega

## 2. Resumo executivo

O FileFlow passará a reconhecer usuários por meio de autenticação com e-mail e senha. O frontend Next.js será responsável pelas páginas e pelos endpoints de autenticação do Better Auth. O Neon fornecerá o PostgreSQL gerenciado e persistirá usuários, credenciais com hash, sessões e dados auxiliares. O Drizzle será a camada tipada de acesso ao banco e a ferramenta de migrations.

O MVP terá uma página única de autenticação com modos de cadastro e login, uma rota protegida `/dashboard` e logout da sessão atual. O backend FastAPI continuará responsável somente pelas conversões e não receberá credenciais, cookies ou lógica de autenticação nesta fase.

Esta entrega não inclui verificação de e-mail, recuperação de senha, login social, perfis avançados, autorização por papéis ou associação das conversões a usuários.

## 3. Contexto e problema

O FileFlow atualmente oferece conversão de arquivos sem identidade persistente. Essa arquitetura atende aos fluxos públicos existentes, mas não cria uma base para funcionalidades futuras que dependam de usuário, como histórico, limites por conta, preferências ou planos.

A autenticação precisa ser introduzida sem:

- acoplar o FastAPI ao mecanismo de sessão do frontend;
- encaminhar uploads pelo Next.js;
- duplicar lógica criptográfica ou de sessão já fornecida pelo Better Auth;
- criar infraestrutura adicional sem necessidade, como Redis ou serviço de e-mail;
- alterar o comportamento dos cinco conversores existentes.

## 4. Decisões e premissas

| Tema | Decisão |
| --- | --- |
| Método de autenticação | E-mail e senha |
| Dados de cadastro | Nome, e-mail, senha e confirmação de senha |
| Persistência | Neon Postgres |
| ORM e migrations | Drizzle ORM e Drizzle Kit |
| Biblioteca de autenticação | Better Auth |
| Runtime de autenticação | Node.js no Next.js |
| Endpoints de autenticação | Route Handler do Next.js em `/api/auth/[...all]` |
| Sessão | Cookie seguro e registro persistido no Postgres |
| Duração da sessão | 7 dias, com renovação após 24 horas de uso |
| Cache de sessão em cookie | Desabilitado no MVP para validar a sessão no banco |
| Rate limiting | Better Auth com armazenamento no Postgres |
| Rota protegida inicial | `/dashboard` |
| Conversores | Permanecem públicos |
| FastAPI | Permanece independente e sem alterações de autenticação |
| Verificação de e-mail | Adiada |
| Recuperação de senha | Adiada |
| Provedores sociais | Adiados |

As versões das dependências deverão ser fixadas no `package-lock.json`. Não serão usados intervalos `latest` no código ou no pipeline. Antes da implementação, a equipe deverá escolher versões mutuamente compatíveis e suportadas pela documentação vigente do Better Auth e do Drizzle.

## 5. Objetivos

1. Permitir que uma pessoa crie uma conta com nome, e-mail e senha.
2. Permitir login com e-mail e senha válidos.
3. Manter a sessão entre navegações e recarregamentos durante o período configurado.
4. Impedir acesso não autenticado à rota `/dashboard`.
5. Permitir encerramento explícito da sessão atual.
6. Persistir identidade, credencial e sessão de forma segura no Neon.
7. Criar uma base tipada, migrável e testável para futuras funcionalidades por usuário.
8. Preservar integralmente os fluxos de conversão atuais.

## 6. Indicadores de sucesso

Na primeira versão, os indicadores serão técnicos e funcionais:

- 100% dos critérios de aceite automatizáveis cobertos por testes;
- cadastro, login, leitura de sessão e logout funcionando no ambiente de produção;
- nenhuma senha, hash, token de sessão ou segredo exposto ao bundle do navegador ou aos logs;
- nenhuma regressão nos testes unitários, E2E e smoke dos conversores;
- migrations aplicáveis do zero em um banco vazio e reaplicáveis sem alterações pendentes;
- respostas de autenticação sem erros 5xx em condições normais de uso;
- rota protegida sem renderização de conteúdo privado para usuários sem sessão válida.

Métricas de negócio, analytics de funil e retenção não fazem parte desta entrega. Quando analytics for introduzido, não deverá registrar senha, token, cookie ou e-mail em texto puro.

## 7. Usuários e histórias

### 7.1. Visitante sem conta

- Como visitante, quero criar uma conta para acessar funcionalidades identificadas do FileFlow.
- Como visitante, quero receber mensagens claras quando meu cadastro não puder ser concluído.

### 7.2. Usuário existente

- Como usuário, quero entrar com meu e-mail e senha para recuperar minha sessão.
- Como usuário autenticado, quero ver meu nome e e-mail na área protegida.
- Como usuário autenticado, quero sair para encerrar a sessão no dispositivo atual.

### 7.3. Visitante de rota protegida

- Como visitante sem sessão, ao abrir `/dashboard`, quero ser encaminhado ao login e retornar ao destino seguro após autenticar.

## 8. Escopo funcional

### 8.1. Incluído

- formulário de cadastro;
- formulário de login;
- alternância ou navegação entre os dois modos;
- validação de campos no cliente e no servidor;
- criação de usuário e conta de credencial;
- criação, consulta, renovação e revogação da sessão;
- cookie de sessão gerenciado pelo Better Auth;
- redirecionamento após cadastro e login;
- rota protegida `/dashboard`;
- exibição mínima de nome e e-mail da sessão;
- logout da sessão atual;
- tratamento de carregamento, sucesso, validação, indisponibilidade e limite de requisições;
- schema Drizzle e migrations versionadas;
- configuração do Neon para desenvolvimento, testes e produção;
- documentação de setup e operação;
- testes unitários, de integração e E2E.

### 8.2. Não incluído

- confirmação ou troca de e-mail;
- envio de e-mails transacionais;
- recuperação ou troca de senha;
- login por Google, GitHub, Microsoft ou outro provedor;
- autenticação multifator, passkeys ou magic links;
- nome de usuário separado do e-mail;
- edição de perfil, avatar ou exclusão self-service da conta;
- papéis, permissões, organizações ou painel administrativo;
- login no FastAPI ou emissão de JWT para a API de conversão;
- proteção dos conversores por autenticação;
- histórico de conversões ou associação de arquivos ao usuário;
- Redis, cache distribuído ou fila de jobs;
- aplicativo móvel nativo;
- reformulação visual completa.

## 9. Requisitos funcionais

### RF-01 - Exibir autenticação

- `GET /auth` deverá exibir o modo de login por padrão.
- `GET /auth?modo=cadastro` deverá exibir o modo de cadastro.
- A página deverá oferecer navegação clara entre cadastro e login sem perder acessibilidade por teclado.
- Usuário já autenticado que acessar `/auth` deverá ser redirecionado para `/dashboard`.

### RF-02 - Cadastrar usuário

- O cadastro deverá solicitar `name`, `email`, `password` e `passwordConfirmation`.
- `name` deverá ter entre 2 e 100 caracteres após remoção de espaços externos.
- `email` deverá ser obrigatório e validado como endereço de e-mail.
- `password` deverá ter de 8 a 128 caracteres.
- `passwordConfirmation` deverá coincidir com `password` e não deverá ser enviada nem persistida.
- Durante a submissão, os controles deverão ser bloqueados contra envio duplicado.
- Em caso de sucesso, o Better Auth deverá criar `user`, `account` de credencial e `session`.
- O usuário deverá terminar o cadastro autenticado e ser redirecionado para um destino interno válido ou para `/dashboard`.
- O e-mail deverá possuir unicidade no banco de dados.

### RF-03 - Autenticar usuário

- O login deverá solicitar `email` e `password`.
- Credenciais válidas deverão criar uma sessão e redirecionar para um destino interno válido ou `/dashboard`.
- Credenciais inválidas deverão produzir mensagem genérica em português, sem indicar isoladamente se o e-mail existe.
- O formulário não deverá apagar o e-mail após erro; a senha deverá ser limpa.
- Envios repetidos deverão respeitar o rate limiting configurado.

### RF-04 - Manter sessão

- A sessão deverá sobreviver a recarregamentos e novas abas no mesmo navegador.
- A validade deverá ser de 7 dias.
- Sessões ativas deverão ter a expiração renovada quando tiver transcorrido ao menos 1 dia desde a última atualização.
- Sessão ausente, expirada, revogada ou inconsistente deverá ser tratada como não autenticada.
- A aplicação não deverá armazenar token de sessão em `localStorage` ou `sessionStorage`.

### RF-05 - Proteger rota

- `GET /dashboard` deverá validar a sessão no servidor antes de renderizar dados do usuário.
- Sem sessão válida, a resposta deverá redirecionar para `/auth?callbackURL=%2Fdashboard`.
- O parâmetro `callbackURL` deverá aceitar somente caminhos internos iniciados por `/` e rejeitar `//`, esquemas, hosts externos e URLs inválidas.
- A checagem em `proxy.ts`, se usada, será apenas uma otimização de redirecionamento; a autorização efetiva deverá ocorrer no Server Component ou camada de servidor da rota.

### RF-06 - Exibir área autenticada

- `/dashboard` deverá mostrar, no mínimo, o nome e o e-mail da sessão.
- A página deverá oferecer uma ação de logout.
- Dados de sessão deverão vir da validação server-side e não de parâmetros da URL ou armazenamento local.

### RF-07 - Encerrar sessão

- O logout deverá revogar a sessão atual no banco.
- O cookie correspondente deverá ser removido.
- Após sucesso, o usuário deverá ser redirecionado para `/auth`.
- Repetir logout sem sessão deverá resultar em estado final não autenticado, sem erro visível desnecessário.
- Falha de rede deverá manter mensagem acionável e permitir nova tentativa.

### RF-08 - Preservar conversões

- `/`, `/converter/*` e as chamadas diretas ao FastAPI deverão continuar públicas.
- O navegador continuará enviando arquivos diretamente ao FastAPI.
- Nenhum cookie de autenticação será necessário para os endpoints `/convert/*` nesta versão.
- Todos os testes existentes de conversão deverão continuar passando sem alteração intencional de contrato.

## 10. Fluxos de usuário

### 10.1. Cadastro bem-sucedido

1. Visitante abre `/auth?modo=cadastro`.
2. Preenche nome, e-mail, senha e confirmação.
3. Frontend valida os campos e envia o cadastro ao endpoint do Better Auth.
4. Better Auth valida a origem, aplica rate limiting e cria usuário, conta e sessão no Neon por meio do Drizzle.
5. A resposta define o cookie de sessão `HttpOnly`.
6. O navegador é redirecionado para `/dashboard`.
7. O servidor valida a sessão e renderiza nome, e-mail e ação de logout.

### 10.2. Login bem-sucedido

1. Visitante abre `/auth` diretamente ou após redirecionamento de uma rota protegida.
2. Informa e-mail e senha.
3. Better Auth compara a senha com o hash da conta de credencial.
4. Uma nova sessão é persistida e o cookie é definido.
5. O navegador segue para o `callbackURL` interno validado ou `/dashboard`.

### 10.3. Login inválido

1. O usuário envia credenciais inválidas.
2. Nenhuma sessão é criada.
3. A interface exibe mensagem genérica, mantém o e-mail e limpa a senha.
4. O foco é movido para o resumo de erro ou para o primeiro campo inválido.

### 10.4. Acesso sem sessão

1. Visitante abre `/dashboard`.
2. O servidor não encontra sessão válida.
3. O visitante é redirecionado para `/auth?callbackURL=%2Fdashboard`.
4. Após login, retorna a `/dashboard`.

### 10.5. Logout

1. Usuário autenticado aciona `Sair`.
2. A interface bloqueia a ação enquanto a requisição está em andamento.
3. Better Auth revoga a sessão no banco e expira o cookie.
4. O navegador é redirecionado para `/auth`.
5. Nova tentativa de abrir `/dashboard` volta ao login.

## 11. Rotas e contratos

### 11.1. Rotas de página

| Método | Rota | Acesso | Comportamento |
| --- | --- | --- | --- |
| `GET` | `/` | Público | Página atual com conversores |
| `GET` | `/auth` | Público | Login; autenticados vão para `/dashboard` |
| `GET` | `/auth?modo=cadastro` | Público | Cadastro; autenticados vão para `/dashboard` |
| `GET` | `/dashboard` | Autenticado | Área mínima do usuário |
| `GET` | `/converter/[fromFormat]/[toFormat]` | Público | Fluxos atuais de conversão |

### 11.2. API de autenticação

O Route Handler `src/app/api/auth/[...all]/route.ts` deverá delegar `GET` e `POST` diretamente para `toNextJsHandler(auth)`. A aplicação não criará wrappers próprios para os endpoints nativos.

Os contratos usados pelo frontend serão:

| Operação | Endpoint Better Auth | Entrada principal | Resultado esperado |
| --- | --- | --- | --- |
| Cadastro | `POST /api/auth/sign-up/email` | nome, e-mail e senha | usuário e sessão |
| Login | `POST /api/auth/sign-in/email` | e-mail e senha | sessão |
| Sessão | `GET /api/auth/get-session` | cookie | sessão ou nulo |
| Logout | `POST /api/auth/sign-out` | cookie | sessão revogada |

Os formatos completos de request e response pertencem ao Better Auth da versão fixada. O código cliente deverá usar `createAuthClient` e seus métodos tipados, sem replicar DTOs internos manualmente.

### 11.3. Status e erros relevantes

- `2xx`: operação concluída;
- `4xx`: entrada inválida, credenciais inválidas, origem não confiável ou conflito;
- `429`: limite excedido, respeitando `X-Retry-After` quando presente;
- `5xx`: indisponibilidade inesperada do serviço ou banco.

A interface não deverá exibir stack trace, SQL, nome de tabela, host do Neon ou mensagem bruta que revele implementação. Erros conhecidos deverão ser mapeados para mensagens em português; erros desconhecidos usarão uma mensagem genérica com opção de tentar novamente.

## 12. Experiência mínima e acessibilidade

O objetivo visual é funcional, não estético. A implementação deverá respeitar o estilo existente sem iniciar um redesign.

- Todos os campos terão `label` visível e associado.
- Campos usarão `name`, `autocomplete` e `type` apropriados.
- Cadastro usará `autocomplete="name"`, `email`, `new-password` e `new-password`.
- Login usará `autocomplete="email"` e `current-password`.
- Erros de campo serão associados por `aria-describedby`.
- O resumo de erro usará uma região anunciável.
- Estados de carregamento não dependerão apenas de cor.
- Botões e links funcionarão por teclado e terão foco visível.
- O formulário será utilizável a partir de 320 px de largura.
- A senha não será preenchida novamente após falha.
- Não haverá requisito de animação, ilustração ou identidade visual nova.

## 13. Arquitetura técnica

### 13.1. Topologia

```text
Navegador
  |-- páginas e /api/auth/* --> Next.js 16 (Node.js)
  |                              |-- Better Auth
  |                              |-- Drizzle ORM
  |                              `-- Neon Postgres
  |
  `-- /convert/* -------------> FastAPI
                                 `-- engines de conversão
```

O Next.js passa a possuir uma API exclusivamente para autenticação. Isso não altera a decisão anterior de evitar uma API intermediária para uploads: arquivos e respostas binárias continuarão trafegando diretamente entre navegador e FastAPI.

### 13.2. Responsabilidades

| Componente | Responsabilidade |
| --- | --- |
| Better Auth | fluxos de credencial, hash de senha, cookie, sessão, validações de segurança e rate limiting |
| Drizzle ORM | schema TypeScript, adapter tipado e acesso ao PostgreSQL |
| Drizzle Kit | geração e aplicação de migrations versionadas |
| Neon | PostgreSQL gerenciado, conexão, branches e recuperação operacional |
| Next.js Route Handler | expor o handler padrão em `/api/auth/*` |
| Server Components | validar sessão e proteger conteúdo server-side |
| Client Components | formulários, feedback de submissão e ação de logout |
| FastAPI | manter os contratos atuais de conversão, sem autenticação nesta fase |

### 13.3. Estrutura de arquivos desejada

```text
frontend/
|-- drizzle/
|   |-- meta/
|   `-- 0000_*.sql
|-- drizzle.config.ts
|-- src/
|   |-- app/
|   |   |-- api/auth/[...all]/route.ts
|   |   |-- auth/page.tsx
|   |   `-- dashboard/page.tsx
|   |-- config/
|   |   `-- env.ts
|   |-- db/
|   |   |-- index.ts
|   |   `-- schema/
|   |       `-- auth.ts
|   |-- features/auth/
|   |   |-- components/
|   |   |-- model/
|   |   `-- index.ts
|   `-- lib/auth/
|       |-- client.ts
|       `-- server.ts
`-- package.json
```

As páginas deverão permanecer finas. O código exclusivo do servidor não poderá ser importado por Client Components. `server-only` deverá proteger os módulos de banco, configuração secreta e instância do Better Auth.

### 13.4. Dependências

Dependências de runtime esperadas:

- `better-auth`;
- `drizzle-orm`;
- `pg`;
- pacote de tipos de `pg` quando exigido pelo TypeScript.

Dependências de desenvolvimento esperadas:

- `drizzle-kit`;
- CLI oficial do Better Auth, quando necessária para geração reproduzível do schema.

O adapter Drizzle deverá ser importado do caminho suportado pela versão fixada do Better Auth. Não deverão coexistir o adapter incorporado e um pacote de adapter separado para a mesma função.

### 13.5. Conexão com Neon

- O runtime usará `drizzle-orm/node-postgres` com `pg` e a connection string pooled do Neon.
- `DATABASE_URL` será usada somente pelo runtime e deverá apontar para o hostname com `-pooler` e SSL obrigatório.
- `DATABASE_MIGRATION_URL` será usada pelo Drizzle Kit e deverá usar conexão direta, pois migrations são tarefas administrativas.
- O pool deverá ser criado uma única vez por instância do runtime, não por requisição.
- O módulo de conexão só poderá executar em runtime Node.js.
- O Route Handler de autenticação deverá declarar `runtime = "nodejs"` caso isso não seja garantido pela árvore de imports.
- Banco e aplicação deverão, sempre que possível, ser provisionados em regiões próximas.
- Nenhuma connection string poderá usar prefixo `NEXT_PUBLIC_`.

### 13.6. Ambientes Neon

Infraestrutura mínima recomendada:

| Ambiente | Recurso Neon | Uso |
| --- | --- | --- |
| Desenvolvimento | branch `development` | desenvolvimento compartilhado |
| Testes/CI | branch ou database `test` | testes de integração e E2E |
| Produção | branch primária | dados reais |

Testes nunca poderão apontar para produção. Branches efêmeras por pull request são recomendadas quando a automação estiver disponível, mas não bloqueiam o MVP.

### 13.7. Configuração do Better Auth

A instância server-side deverá conter, no mínimo:

- adapter Drizzle com `provider: "pg"` e schema explícito;
- `emailAndPassword.enabled: true`;
- senha mínima de 8 e máxima de 128 caracteres;
- `secret` obtido de `BETTER_AUTH_SECRET`;
- `baseURL` obtida de `BETTER_AUTH_URL`;
- origens confiáveis explícitas;
- sessão com `expiresIn` de 7 dias e `updateAge` de 1 dia;
- cookie cache desabilitado;
- rate limiting habilitado com armazenamento `database`;
- regra de login de no máximo 3 tentativas por 10 segundos por chave/IP;
- regra de cadastro de no máximo 5 tentativas por 60 segundos por chave/IP.

Não serão habilitados plugins nesta fase, exceto algum estritamente exigido pela integração oficial com Next.js. Caso Server Actions sejam usados para operações que definem cookies, `nextCookies()` deverá ser o último plugin. A implementação preferencial deste MVP é o client oficial chamando o Route Handler, o que evita essa necessidade.

### 13.8. Proteção server-side

O `dashboard/page.tsx` deverá obter a sessão com `auth.api.getSession`, encaminhando os headers da requisição. A ausência de sessão causará `redirect()` antes da renderização dos dados.

Um `proxy.ts` do Next.js 16 poderá verificar a presença do cookie para reduzir renderizações desnecessárias, mas não substituirá a consulta server-side. Essa separação evita tratar a simples existência de um cookie como autorização válida.

## 14. Dados e schema

### 14.1. Fonte de verdade

O schema TypeScript versionado será a fonte de verdade da aplicação. A CLI do Better Auth deverá gerar a estrutura compatível com a configuração ativa, e o Drizzle Kit deverá gerar o SQL de migration. Alterações manuais só serão aceitas após comparação com o schema oficial da versão fixada.

### 14.2. Tabelas

| Tabela | Finalidade | Regras principais |
| --- | --- | --- |
| `user` | identidade do usuário | ID UUID, nome, e-mail único, estado de verificação e timestamps |
| `session` | sessões ativas | token único, usuário, expiração, IP/user-agent opcionais e timestamps |
| `account` | métodos de autenticação | usuário, provider `credential`, identificador e hash da senha |
| `verification` | tokens temporários suportados pelo core | identificador, valor, expiração e timestamps |
| `rateLimit` | contadores distribuídos | chave, contagem e instante da última requisição |

Embora verificação de e-mail não seja usada no MVP, a tabela `verification` integra o schema central do Better Auth e deverá permanecer disponível para evolução compatível.

### 14.3. Integridade e índices

- `user.email` terá restrição única.
- `session.token` terá restrição única.
- Chaves estrangeiras de `session` e `account` apontarão para `user`.
- Exclusão de usuário deverá remover sessões e contas associadas por cascade, conforme schema gerado e validado.
- Consultas por `session.token`, `session.userId`, `account.userId`, par de provider/conta e `verification.identifier` deverão possuir índices adequados.
- Datas serão persistidas em tipo temporal do PostgreSQL e tratadas em UTC.
- IDs serão UUIDs representados como string na API TypeScript.
- O hash de senha ficará somente em `account.password`; senha em texto puro não será persistida.

### 14.4. Migrations

Scripts esperados em `frontend/package.json`:

```json
{
  "auth:schema": "auth generate --config ./src/lib/auth/server.ts --output ./src/db/schema/auth.ts --yes",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

Os nomes exatos poderão ser ajustados à CLI fixada, mantendo estas garantias:

1. gerar ou atualizar o schema Better Auth;
2. revisar o diff TypeScript;
3. gerar migration SQL com Drizzle Kit;
4. revisar o SQL;
5. criar ponto de restauração antes de mudanças destrutivas;
6. aplicar no banco principal único;
7. executar as validações opt-in permitidas pela política de banco único;
8. disponibilizar o código dependente somente após migration bem-sucedida.

`drizzle-kit push` não poderá ser usado em produção. Migrations e metadados Drizzle deverão ser versionados. A aplicação não deverá executar migrations automaticamente ao iniciar.

## 15. Variáveis de ambiente

| Variável | Exposição | Obrigatória | Descrição |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Cliente | Sim | base pública do FastAPI, já existente |
| `DATABASE_URL` | Servidor | Sim | conexão pooled do Neon para runtime |
| `DATABASE_MIGRATION_URL` | Ferramenta/CI | Sim para migrations | conexão direta do Neon |
| `BETTER_AUTH_SECRET` | Servidor | Sim | segredo de alta entropia com pelo menos 32 caracteres |
| `BETTER_AUTH_URL` | Servidor | Sim | origem canônica do Next.js, sem path final |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Servidor | Sim | origens permitidas, separadas por vírgula e validadas |

Regras obrigatórias:

- falhar cedo com mensagem contendo o nome da variável ausente ou inválida;
- nunca incluir valores secretos na mensagem;
- separar leitura de ambiente público e privado;
- não importar o ambiente privado em componentes cliente;
- `.env.example` conter apenas placeholders seguros;
- `.env.local`, secrets da plataforma e connection strings reais não serão versionados;
- `BETTER_AUTH_URL` de produção deverá usar HTTPS;
- o banco principal único não poderá receber reset, `truncate`, `drop` ou limpeza ampla durante testes.

## 16. Segurança e privacidade

### 16.1. Credenciais

- O Better Auth será a única camada autorizada a criar e verificar hashes de senha.
- Não será criada implementação própria de criptografia.
- Senha, confirmação, hash, token e cookie não poderão aparecer em logs, traces, analytics ou mensagens de erro.
- O formulário deverá ser servido somente por HTTPS em produção.

### 16.2. Cookies e sessão

- O token será armazenado em cookie `HttpOnly`.
- Em produção, o cookie deverá ser `Secure`.
- O atributo `SameSite` deverá permanecer em `Lax`, salvo necessidade documentada.
- O domínio do cookie deverá ser o host do frontend; compartilhamento entre subdomínios fica desabilitado.
- Logout deverá revogar o registro persistido e expirar o cookie.
- Alterar `BETTER_AUTH_SECRET` sem estratégia de rotação invalidará sessões; rotação deverá usar o mecanismo de múltiplos secrets suportado pela versão adotada.

### 16.3. Origem, redirecionamento e abuso

- `trustedOrigins` deverá ser allowlist explícita.
- `callbackURL` não poderá permitir open redirect.
- Rate limiting deverá usar o banco, pois memória local não é consistente entre instâncias serverless.
- A configuração de IP deverá confiar apenas nos headers sanitizados pela plataforma de deploy.
- Respostas de login não deverão confirmar se um e-mail está cadastrado.
- A ausência de verificação de e-mail será um risco aceito apenas no MVP e deverá estar visível na documentação de release.

### 16.4. Minimização e retenção

- Serão coletados apenas nome, e-mail e metadados técnicos de sessão necessários.
- Arquivos convertidos não serão vinculados à conta nesta entrega.
- Sessões expiradas e registros temporários deverão possuir rotina operacional de limpeza futura; até sua automação, a retenção será monitorada no Neon.
- Solicitações de exclusão de dados serão atendidas operacionalmente até existir fluxo self-service.
- A política de privacidade do produto deverá ser atualizada antes de disponibilizar cadastro ao público.

## 17. Observabilidade e operação

### 17.1. Logs

Eventos mínimos, sem conteúdo sensível:

- falha de inicialização por configuração, sem valor da variável;
- indisponibilidade de banco;
- erro inesperado do handler de autenticação;
- migration iniciada, concluída ou falha;
- contagem agregada de respostas por classe de status.

Não registrar corpo de requests de `/api/auth/*`, headers `Cookie`/`Set-Cookie` ou connection strings.

### 17.2. Saúde e alertas

- O deploy deverá possuir uma verificação de conectividade com o banco sem expor detalhes ao público.
- Alertar sobre aumento sustentado de 5xx no namespace `/api/auth/*`.
- Monitorar uso, armazenamento e limites de conexão do Neon.
- Uma falha do Neon poderá indisponibilizar autenticação, mas não deverá interromper páginas públicas e conversões já independentes.

### 17.3. Recuperação

- Antes da primeira migration de produção, criar ponto de restauração ou branch de segurança no Neon.
- Em falha de migration, interromper o deploy do código dependente.
- Rollback de aplicação só poderá ocorrer se for compatível com o schema já aplicado.
- Mudanças destrutivas futuras deverão seguir estratégia expandir-migrar-contrair; não fazem parte da migration inicial.

## 18. Testes e validação

### 18.1. Testes unitários

- validação e normalização das variáveis privadas;
- validação de `callbackURL` interno;
- regras de nome, e-mail, senha e confirmação;
- mapeamento de erros conhecidos para mensagens seguras;
- estados dos formulários: inicial, inválido, enviando, erro e sucesso;
- renderização da área autenticada com sessão fornecida;
- comportamento do botão de logout;
- preservação dos testes atuais de conversão.

### 18.2. Testes de integração

O projeto adotou um único banco Neon principal. Por isso, esta suíte será opt-in,
serial e executada somente mediante comando explícito. Cada execução deverá usar
identificadores próprios e remover somente os registros que ela criou:

- criar usuário, conta de credencial e sessão;
- impedir e-mail duplicado;
- autenticar senha correta e rejeitar senha incorreta;
- recuperar sessão pelo cookie;
- revogar sessão no logout;
- rejeitar sessão expirada ou revogada;
- aplicar cascade e restrições esperadas;
- persistir e respeitar rate limiting entre requisições;
- confirmar que schema e migrations estão sincronizados.

Os testes usarão e-mails, IPs reservados e chaves únicas, com teardown garantido.
São proibidos `truncate`, `drop`, reset de schema e exclusão de registros
preexistentes. A suíte não fará parte de `npm test` nem do CI padrão enquanto
existir apenas o banco principal.

### 18.3. Testes E2E com Playwright

1. cadastro válido termina em `/dashboard`;
2. cadastro com confirmação divergente não envia request;
3. cadastro com e-mail já existente mostra erro seguro;
4. login válido termina em `/dashboard`;
5. login inválido não cria sessão;
6. recarregar `/dashboard` mantém a sessão;
7. acesso anônimo a `/dashboard` redireciona ao login;
8. `callbackURL` interno retorna ao destino;
9. `callbackURL` externo é ignorado;
10. logout redireciona e bloqueia novo acesso à área protegida;
11. teclado, labels e foco de erro funcionam no fluxo principal;
12. smoke test dos conversores continua chamando o FastAPI diretamente.

### 18.4. Gates obrigatórios

Antes do merge:

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
```

Além disso, o pipeline de integração deverá criar ou selecionar o banco de teste, aplicar `npm run db:migrate` e executar a suíte de autenticação. O build deverá falhar caso importe módulos server-only no cliente ou faltem variáveis obrigatórias no ambiente de validação.

## 19. Plano de implementação

### Fase 1 - Infraestrutura e dependências

- criar projeto/branches no Neon;
- cadastrar secrets por ambiente;
- instalar e fixar dependências compatíveis;
- implementar validação de ambiente privado;
- configurar Drizzle e conexões runtime/migration.

### Fase 2 - Schema e migrations

- configurar Better Auth sem interface;
- gerar o schema oficial;
- adicionar tabela de rate limiting;
- gerar e revisar migration inicial;
- aplicar em desenvolvimento e testes;
- validar constraints e queries básicas.

### Fase 3 - Autenticação server-side

- criar instância Better Auth;
- montar `/api/auth/[...all]`;
- configurar sessão, origins e rate limiting;
- implementar leitura de sessão no servidor;
- proteger `/dashboard`.

### Fase 4 - Interface mínima

- criar página `/auth` e seus dois modos;
- implementar validações e estados;
- criar `/dashboard`;
- implementar logout;
- adicionar navegação mínima a partir da página inicial sem redesenhar o produto.

### Fase 5 - Qualidade e documentação

- adicionar testes unitários, integração e E2E;
- atualizar `.env.example` e README;
- documentar migrations, secrets, rotação e recuperação;
- executar todos os gates e auditoria de segurança.

### Fase 6 - Produção

- criar ponto de restauração no Neon;
- aplicar migration de produção;
- publicar frontend com secrets de produção;
- executar smoke tests de cadastro, login, sessão e logout com conta de teste;
- monitorar erros e conexão nas primeiras 24 horas;
- remover a conta de smoke test quando concluído.

## 20. Critérios de aceite

### 20.1. Cadastro

- [ ] Um visitante consegue cadastrar nome, e-mail e senha válidos.
- [ ] O cadastro persiste usuário e conta de credencial no Neon.
- [ ] A senha não é persistida em texto puro.
- [ ] E-mail duplicado não cria segundo usuário.
- [ ] Campos inválidos apresentam mensagens acessíveis.
- [ ] Cadastro bem-sucedido cria sessão e abre `/dashboard`.

### 20.2. Login e sessão

- [ ] Credenciais válidas criam sessão persistida.
- [ ] Credenciais inválidas não revelam se o e-mail existe.
- [ ] A sessão permanece após recarregar a página.
- [ ] Sessão expirada ou revogada não acessa `/dashboard`.
- [ ] Cookies possuem atributos seguros em produção.
- [ ] Tokens não aparecem em armazenamento Web, HTML ou logs.

### 20.3. Proteção e logout

- [ ] Visitante de `/dashboard` é redirecionado antes de ver conteúdo protegido.
- [ ] `callbackURL` externo não produz redirecionamento aberto.
- [ ] Usuário autenticado vê nome, e-mail e ação de logout.
- [ ] Logout revoga a sessão atual e remove o cookie.
- [ ] Após logout, `/dashboard` volta a exigir login.

### 20.4. Banco e operação

- [ ] As cinco tabelas previstas existem com constraints e índices validados.
- [ ] Schema TypeScript e migration SQL estão versionados.
- [ ] Migration funciona em banco vazio.
- [ ] Runtime usa conexão pooled e migrations usam conexão direta.
- [ ] Desenvolvimento, testes e produção usam bancos/branches separados.
- [ ] Nenhum segredo é exposto por variável pública.
- [ ] Rate limiting usa armazenamento persistente no banco.

### 20.5. Regressão

- [ ] Os cinco conversores permanecem públicos e funcionais.
- [ ] Uploads continuam indo diretamente ao FastAPI.
- [ ] Testes existentes de frontend e backend continuam passando.
- [ ] Lint, typecheck, cobertura, build e E2E passam no CI.

## 21. Definição de pronto

A entrega estará pronta quando:

1. todos os critérios de aceite estiverem atendidos;
2. migrations estiverem revisadas, versionadas e aplicadas nos ambientes;
3. testes automatizados e smoke tests de produção passarem;
4. README e `.env.example` refletirem o setup real;
5. secrets estiverem fora do repositório e isolados por ambiente;
6. a política de privacidade estiver atualizada para nome, e-mail e dados técnicos de sessão;
7. o procedimento de rollback e recuperação estiver documentado;
8. não houver regressão nos contratos de conversão;
9. a premissa sobre conversores públicos estiver confirmada pelo responsável de produto.

## 22. Riscos e mitigação

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Schema manual incompatível com Better Auth | falhas de runtime ou segurança | gerar schema pela CLI da versão fixada e testar migrations |
| Excesso de conexões ao Neon | indisponibilidade intermitente | URL pooled no runtime, pool singleton e monitoramento |
| Migration aplicada com código incompatível | indisponibilidade | aplicar antes do código, testar em branch e bloquear deploy em falha |
| Rate limiting em memória no serverless | proteção inconsistente | persistir contadores no Postgres |
| Vazamento de secrets para o cliente | comprometimento total | separação de env, `server-only`, revisão do bundle e testes |
| Open redirect em `callbackURL` | phishing | aceitar apenas paths internos validados |
| Enumeração de usuários | exposição de contas | mensagens genéricas e rate limiting |
| E-mail não verificado | contas com endereço de terceiros | risco aceito no MVP; priorizar verificação antes de recursos sensíveis |
| Neon indisponível | login e área protegida fora do ar | isolamento do FastAPI, monitoramento e recuperação Neon |
| Mudança incompatível de dependência | build ou sessão quebrada | versões fixas, lockfile, testes e upgrades isolados |
| Teste apontar para produção | perda ou poluição de dados | credenciais exclusivas e guardrail que rejeite host/database de produção |

## 23. Decisões adiadas

- exigir login para converter arquivos;
- associar conversões e histórico ao usuário;
- verificação de e-mail e provedor transacional;
- recuperação e alteração de senha;
- login social;
- painel de sessões e logout em todos os dispositivos;
- exclusão self-service de conta;
- papéis, organizações e planos;
- Redis ou secondary storage;
- analytics de autenticação;
- política automatizada de limpeza de sessões expiradas;
- domínio e plataforma definitivos de hospedagem do frontend.

## 24. Decisão de produto confirmada

Cadastro e login criam a base para recursos futuros, mas não bloqueiam os conversores atuais. Os cinco conversores permanecerão públicos neste MVP e somente `/dashboard` exigirá autenticação.

Qualquer mudança futura que exija autenticação para acessar `/converter/*` ou chamar `/convert/*` deverá ser tratada em novo PRD. Esse escopo precisará definir autenticação entre Next.js e FastAPI, política de CORS com credenciais ou tokens, proteção da API contra chamadas diretas e tratamento de sessão durante uploads.

## 25. Referências técnicas

- [Better Auth - Installation](https://better-auth.com/docs/installation)
- [Better Auth - Next.js integration](https://better-auth.com/docs/integrations/next)
- [Better Auth - Email and password](https://better-auth.com/docs/authentication/email-password)
- [Better Auth - Drizzle adapter](https://better-auth.com/docs/adapters/drizzle)
- [Better Auth - Database schema](https://better-auth.com/docs/concepts/database)
- [Better Auth - Session management](https://better-auth.com/docs/concepts/session-management)
- [Better Auth - Rate limiting](https://better-auth.com/docs/concepts/rate-limit)
- [Drizzle ORM - Neon connection](https://orm.drizzle.team/docs/connect-neon)
- [Drizzle ORM - Migrations](https://orm.drizzle.team/docs/migrations)
- [Neon - Connection pooling](https://neon.com/docs/connect/connection-pooling)

## 26. Resultado esperado

Ao concluir esta entrega, o FileFlow terá autenticação funcional e persistente sem comprometer a separação existente entre frontend e API de conversão. Usuários poderão cadastrar-se, entrar, acessar uma área validada no servidor e sair. A solução terá schema reproduzível, migrations versionadas, segredos isolados, proteção básica contra abuso e uma base clara para histórico, preferências e autorização em entregas futuras.
