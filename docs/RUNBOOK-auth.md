# Runbook de autenticação

Este runbook cobre setup, testes, migration, preview, rollout e recuperação da autenticação do FileFlow. Ele não contém credenciais reais.

## 1. Invariantes de segurança

- O projeto usa somente o banco Neon principal.
- Testes persistentes são opt-in, seriais e removem somente registros próprios identificados exatamente.
- Migrations nunca são executadas por testes nem pelo início da aplicação.
- Runtime usa URL pooled; Drizzle Kit usa URL direta.
- Secrets e connection strings ficam fora do repositório e nunca usam prefixo `NEXT_PUBLIC_`.
- Os cinco conversores e o FastAPI permanecem públicos e independentes da sessão.
- Uploads continuam indo diretamente do navegador ao FastAPI.

## 2. Variáveis por ambiente

| Variável | Classificação | Regra |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | pública/build-time | origem HTTP(S) ou caminho relativo do FastAPI |
| `DATABASE_URL` | privada/runtime | URL pooled do Neon com `sslmode=require` |
| `DATABASE_MIGRATION_URL` | privada/administração | URL direta do mesmo endpoint/database |
| `BETTER_AUTH_SECRET` | privada/runtime | valor aleatório com pelo menos 32 caracteres |
| `BETTER_AUTH_URL` | privada/runtime | origem canônica do frontend, sem path/query/fragment |
| `BETTER_AUTH_TRUSTED_ORIGINS` | privada/runtime | allowlist explícita, separada por vírgula |

Crie `frontend/.env.local` a partir de `.env.example` e substitua placeholders localmente. Em GitHub Actions, use environments e secrets; nunca grave valores em YAML, comentários, artefatos ou logs.

## 3. Setup e validação local

```powershell
cd frontend
npm ci
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run audit:bundle
```

Para confirmar que o schema oficial, os índices exigidos e a migration versionada continuam sincronizados:

```powershell
npm run audit:auth:schema
```

Esse comando gera artefatos localmente e falha se surgir qualquer diferença versionável. Ele usa uma URL direta fictícia apenas para validar a configuração do Drizzle e não abre conexão.

## 4. Testes no banco principal

Execute somente quando não houver outra suíte de autenticação ativa:

```powershell
npm run test:auth:primary
npm run test:auth:primary:e2e
```

As suítes exigem `ALLOW_PRIMARY_AUTH_TESTS=true`, definido apenas pelos scripts npm. Cada execução usa UUID, e-mails `@fileflow.test`, IPs reservados e chaves conhecidas de rate limit. O teardown exclui e confirma somente esses valores. Se o processo for interrompido, use o run ID exibido no artefato/trace para localizar os e-mails exatos; não use `TRUNCATE`, padrões amplos ou limpeza por data.

O workflow manual `.github/workflows/auth-primary.yml` exige:

1. environment GitHub chamado `primary-database`, preferencialmente com aprovação;
2. secret `PRIMARY_DATABASE_URL` contendo somente a URL pooled;
3. confirmação `RUN_PRIMARY_AUTH_TESTS`;
4. ausência de outra execução, garantida por `concurrency`.

Ele não recebe URL direta, não aplica migrations e não faz limpeza estrutural.

## 5. Migration

Antes de qualquer migration:

1. revisar o SQL em `frontend/drizzle/`;
2. executar `npm run audit:auth:schema`;
3. criar restore point ou branch de segurança no Neon;
4. confirmar que `DATABASE_MIGRATION_URL` é direta e aponta para o banco principal correto;
5. registrar commit, operador e horário;
6. executar `npm run db:migrate` uma única vez;
7. interromper o deploy se o comando falhar;
8. validar a tabela `drizzle.__drizzle_migrations` e as tabelas de autenticação.

Não use `drizzle-kit push` em produção. Mudanças destrutivas futuras devem seguir expandir–migrar–contrair.

## 6. Preview/staging

Antes de validar um preview, registre plataforma, URL HTTPS e commit implantado. Como há somente um banco principal, o preview deve receber a menor permissão operacional possível e ser removido após a validação.

Checklist:

- `BETTER_AUTH_URL` corresponde exatamente à URL canônica HTTPS;
- `BETTER_AUTH_TRUSTED_ORIGINS` contém somente origens necessárias;
- headers de IP são aceitos apenas quando a plataforma documenta o proxy confiável;
- commit implantado corresponde ao SHA do PR;
- cookies de sessão são `Secure`, `HttpOnly` e `SameSite=Lax`;
- cadastro, login, reload, dashboard, callback e logout passam;
- os cinco conversores continuam públicos;
- conexões pooled permanecem dentro dos limites do Neon;
- conta, sessões e rate limits criados pelo smoke são removidos exatamente.

Sem plataforma e domínio definidos, esta etapa permanece pendente e produção não está autorizada.

## 7. Rotação de secret

1. programar janela e comunicar que sessões podem exigir novo login;
2. armazenar o novo valor no gerenciador de secrets;
3. atualizar todas as instâncias de forma coordenada;
4. publicar novamente o frontend;
5. executar login, reload e logout com conta de smoke;
6. revogar o valor anterior e registrar a rotação.

Nunca imprima o valor anterior ou novo. Em incidente de exposição, trate todas as sessões como potencialmente comprometidas.

## 8. Rollout de produção

1. confirmar backup/restore point e secrets;
2. aplicar migration antes do código dependente;
3. publicar exatamente o commit incorporado à `main`;
4. executar smoke com conta exclusiva;
5. confirmar autenticação e conversores públicos;
6. remover os dados exatos da conta de smoke;
7. monitorar `/api/auth/*`, conexões e limites Neon por pelo menos 24 horas.

Sinais mínimos: taxa de 5xx por classe, falhas de inicialização sem valores de env, indisponibilidade do banco e uso/conexões Neon. Logs podem conter rota, status e duração, mas nunca senha, confirmação, hash, token, cookie ou corpo de autenticação.

## 9. Rollback e recuperação

Se o deploy falhar sem mudança de schema incompatível, reverta a aplicação ao último SHA saudável e mantenha o schema aditivo. Se a migration falhar, interrompa o deploy e use o restore point/branch Neon somente após avaliar os dados escritos desde sua criação.

Não reverta uma migration destrutivamente por improviso. Registre motivo, SHA, horário, impacto, decisão de restore e resultado. Após recuperação, repita os smoke tests e monitore erros/conexões.

## 10. Privacidade e retenção

A política de privacidade deve cobrir nome, e-mail, IP/user-agent e metadados de sessão antes do lançamento público. Solicitações de exclusão são operacionais até existir fluxo self-service. Sessões expiradas e rate limits devem ser monitorados; uma política automatizada de retenção permanece fora deste escopo.
