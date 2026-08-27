# Guia de Onboarding — FileFlow

Bem-vindo ao **FileFlow**! Este documento serve como ponto de partida para desenvolvedores e mantenedores do projeto. Ele descreve a arquitetura atual, detalha cada funcionalidade, explica a organização do código e fornece o passo a passo para configurar o ambiente de desenvolvimento local e executar a suíte de testes.

---

## 1. Visão Geral do Produto

O **FileFlow** é uma aplicação web focada na conversão rápida, segura e privada de documentos e imagens. 

### Principais Características
- **5 Conversores Especializados**: PDF para Word, Word para PDF, PDF para SVG, JPG para PNG e PNG para JPG.
- **Arquitetura Desacoplada**: Frontend em Next.js e API de processamento em FastAPI operam como workspaces independentes.
- **Processamento Direto**: O navegador envia arquivos via `multipart/form-data` diretamente ao backend FastAPI, que processa a conversão e devolve os bytes binários para download no cliente, sem sobrecarregar o servidor do frontend.
- **Autenticação Segura e Persistente**: Sistema de contas e sessões gerenciado com Better Auth, persistido em PostgreSQL (Neon Serverless) via Drizzle ORM.
- **Ciclo de Vida Efêmero de Arquivos**: O backend não armazena arquivos permanentemente; arquivos temporários são alocados com UUIDs únicos e removidos automaticamente após o streaming da resposta ou em caso de erro.

---

## 2. Stack Tecnológica

| Camada | Tecnologias Principais | Finalidade |
| :--- | :--- | :--- |
| **Backend API** | Python 3.10, FastAPI 0.123.4, Pydantic, Uvicorn | Endpoints de conversão e orquestração de arquivos |
| **Engines de Conversão** | `pdf2docx`, `pymupdf` (PyMuPDF), `Pillow` (PIL), LibreOffice CLI | Motores especializados para transformação de formatos |
| **Frontend** | Next.js 16.2.10 (App Router), React 19, TypeScript 6.0, Tailwind CSS v4 | Interface de usuário, páginas públicas, painel e rotas |
| **Autenticação** | Better Auth 1.6.25 | Gerenciamento de credenciais, cookies de sessão e rate-limiting |
| **Banco de Dados** | Neon PostgreSQL Serverless, Drizzle ORM 0.45.2, Drizzle Kit | Persistência de usuários, contas e sessões |
| **Qualidade & Testes** | Vitest, Playwright, Pytest, ESLint, TypeScript compiler | Testes unitários, de integração, E2E, visuais e validação estática |

---

## 3. Arquitetura do Sistema

A arquitetura do FileFlow é dividida em duas camadas autônomas que se comunicam através do navegador do usuário:

```mermaid
graph TD
    subgraph ClientBrowser["Navegador do Usuário"]
        UI["Interface Next.js (React 19)"]
        BlobDownloader["Blob & Download Manager"]
    end

    subgraph FrontendServer["Frontend Server (Next.js / Node.js)"]
        AppRouter["App Router (SSR & Static Pages)"]
        AuthHandler["Route Handler (/api/auth/*)"]
        BetterAuth["Better Auth Core"]
        Drizzle["Drizzle ORM"]
    end

    subgraph Database["Database (Neon PostgreSQL)"]
        NeonDB[("PostgreSQL Serverless")]
    end

    subgraph BackendAPI["Backend API (FastAPI / Python)"]
        FastAPIApp["FastAPI App (CORS Middleware)"]
        TempService["TemporaryFileService (/temp)"]
        AdapterFactory["Converter Adapters & Engines"]
        LibreOffice["LibreOffice / PyMuPDF / pdf2docx / Pillow"]
    end

    UI -->|"1. Renderização de Páginas"| AppRouter
    UI -->|"2. Login / Cadastro"| AuthHandler
    AuthHandler --> BetterAuth
    BetterAuth --> Drizzle
    Drizzle -->|"Pooled Connection (runtime)"| NeonDB

    UI -->|"3. Upload & Conversão Direta (POST multipart/form-data)"| FastAPIApp
    FastAPIApp --> TempService
    FastAPIApp --> AdapterFactory
    AdapterFactory --> LibreOffice
    FastAPIApp -->|"4. Stream Binário (FileResponse)"| BlobDownloader
```

### Decisões Arquiteturais Fundamentais
1. **Uploads sem Intermediação**: O servidor Next.js **nunca** recebe os arquivos de upload dos usuários. O tráfego pesado de arquivos vai diretamente do navegador para o FastAPI.
2. **CORS Estrito**: O backend FastAPI rejeita wildcards (`*`) e aceita apenas origens HTTP(S) explicitamente configuradas via `BACKEND_CORS_ORIGINS`.
3. **Conexões do Banco**:
   - `DATABASE_URL`: Utiliza conexão *pooled* do Neon (`-pooler.sa-east-1.aws.neon.tech`) para as operações normais de runtime da aplicação.
   - `DATABASE_MIGRATION_URL`: Utiliza conexão direta sem pooling para migrações do Drizzle Kit (`db:migrate`).
4. **Isolamento de Secrets**: Segredos de banco e auth nunca utilizam o prefixo `NEXT_PUBLIC_` e são protegidos por scripts de auditoria automatizados.

---

## 4. Estrutura de Diretórios Detalhada

```text
FileFlow/
├── .github/
│   └── workflows/
│       ├── quality.yml                 # Pipeline de CI: lint, typecheck, testes unitários, e2e, build e bundle audit
│       └── auth-primary.yml            # Pipeline manual protegido para testes de auth no banco primário
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── conversions.py      # Endpoints REST de conversão
│   │   ├── converters/
│   │   │   ├── adapters/
│   │   │   │   ├── docx_adapter.py     # Adapter do LibreOffice (DOCX -> PDF)
│   │   │   │   ├── image_adapter.py    # Adapter do Pillow (JPG <-> PNG)
│   │   │   │   └── pdf_adapter.py      # Adapters do pdf2docx e PyMuPDF (PDF -> DOCX, PDF -> SVG)
│   │   │   ├── base.py                 # Protocolos abstratos dos conversores
│   │   │   └── factory.py              # Fábrica de instâncias dos adapters
│   │   ├── services/
│   │   │   └── temporary_files.py      # Gerenciador de arquivos efêmeros e limpeza em background
│   │   ├── config.py                   # Validação de origens CORS com Pydantic
│   │   └── main.py                     # Inicialização da aplicação FastAPI e middlewares
│   ├── tests/
│   │   ├── conftest.py                 # Fixtures Pytest e diretórios temporários isolados
│   │   ├── fakes.py                    # Implementações fake dos conversores para testes sem engines externas
│   │   ├── test_api_only.py            # Validação de que o backend é estritamente uma API (sem HTML)
│   │   ├── test_conversion_routes.py   # Testes unitários/integração de todas as rotas de conversão
│   │   ├── test_cors.py                # Testes de segurança e normalização de origens CORS
│   │   └── test_temporary_files.py     # Testes de isolamento de path e limpeza de arquivos
│   ├── requirements.txt                # Dependências de produção do backend
│   ├── requirements-dev.txt            # Dependências de desenvolvimento e testes (pytest, httpx, etc.)
│   └── Dockerfile                      # Imagem Docker histórica do backend
├── frontend/
│   ├── drizzle/                        # Migrações SQL versionadas
│   │   ├── 0000_initial_auth_schema.sql
│   │   └── meta/                       # Metadados e snapshots do Drizzle Kit
│   ├── e2e/                            # Testes End-to-End com Playwright
│   │   ├── auth-primary.e2e.spec.ts    # Fluxo de login/cadastro real contra banco
│   │   ├── conversion.e2e.spec.ts      # Testes determinísticos dos 5 conversores (com mock de rede)
│   │   ├── smoke.e2e.spec.ts           # Smoke test de ponta a ponta (Next.js + FastAPI reais)
│   │   └── visual.e2e.spec.ts          # Testes de layout responsivo (desktop e mobile)
│   ├── scripts/
│   │   ├── audit-auth-schema.mjs       # Garante sincronia entre schema Better Auth, Drizzle e SQL
│   │   ├── audit-static-bundle.mjs     # Varre o bundle estático gerado para evitar vazamento de secrets
│   │   └── ensure-auth-schema-indexes.mjs # Injeta índices necessários após geração do schema
│   ├── src/
│   │   ├── app/                        # Next.js App Router
│   │   │   ├── api/auth/[...all]/      # Route Handler que delega endpoints para o Better Auth
│   │   │   ├── auth/                   # Página de Login e Cadastro (?modo=cadastro)
│   │   │   ├── converter/[fromFormat]/[toFormat]/ # Rota dinâmica dos conversores
│   │   │   ├── dashboard/              # Redirecionamento autenticado
│   │   │   ├── globals.css             # Configurações globais e Tailwind CSS v4
│   │   │   ├── layout.tsx              # Layout raiz com fontes e metadados base
│   │   │   └── page.tsx                # Página inicial (Home) com catálogo de conversores
│   │   ├── config/                     # Validação estrita de variáveis de ambiente
│   │   │   ├── env.ts                  # Variáveis públicas (NEXT_PUBLIC_API_BASE_URL)
│   │   │   ├── private-env.ts          # Leitor de variáveis privadas do servidor
│   │   │   └── private-env-schema.ts   # Validação de URLs Neon, secret length e trusted origins
│   │   ├── db/                         # Configuração do banco de dados
│   │   │   ├── schema/
│   │   │   │   └── auth.ts             # Schema das tabelas de autenticação no Drizzle
│   │   │   └── index.ts                # Pool de conexões pg e instância Drizzle
│   │   ├── features/                   # Módulos de domínio
│   │   │   ├── auth/                   # Componentes, formulários e validações de autenticação
│   │   │   └── conversion/             # Componentes de formulário de conversão, catálogo e client API
│   │   └── lib/                        # Utilitários compartilhados
│   │       └── auth/                   # Instâncias de cliente e servidor do Better Auth
│   ├── drizzle.config.ts               # Configuração do Drizzle Kit para migrações
│   ├── package.json                    # Dependências e scripts do frontend
│   └── playwright.config.ts            # Configurações de execução do Playwright
├── docs/                               # Documentações de PRDs, Tasks e Runbooks
└── README.md                           # Visão geral rápida do projeto
```

---

## 5. Módulos e Funcionalidades

### 5.1. Módulo de Conversões (Backend & Frontend)

O sistema suporta exatamente cinco conversões de arquivos:

| Conversão | Rota Frontend | Endpoint Backend | Engine Utilizada | Formato MIME de Retorno |
| :--- | :--- | :--- | :--- | :--- |
| **PDF → Word** | `/converter/pdf/docx` | `POST /convert/pdf-to-docx` | `pdf2docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| **Word → PDF** | `/converter/docx/pdf` | `POST /convert/docx-to-pdf` | LibreOffice (`soffice --headless`) | `application/pdf` |
| **PDF → SVG** | `/converter/pdf/svg` | `POST /convert/pdf-to-svg` | PyMuPDF (`fitz`) | `image/svg+xml` |
| **JPG → PNG** | `/converter/jpg/png` | `POST /convert/jpg-to-png` | Pillow (`PIL.Image`) | `image/png` |
| **PNG → JPG** | `/converter/png/jpg` | `POST /convert/png-to-jpg` | Pillow (`PIL.Image`) | `image/jpeg` |

#### Padrão de Projeto no Backend (Adapter Pattern)
- **Protocolos (`app/converters/base.py`)**: Define as interfaces que cada adaptador deve respeitar.
- **Adapters (`app/converters/adapters/`)**: Cada biblioteca externa é encapsulada em uma classe específica. Exemplo: `LibreOfficeAdapter` lida com a chamada subprocess em modo headless com timeout de 60s.
- **Factory (`app/converters/factory.py`)**: Provê os conversores para as rotas FastAPI. Durante os testes, os adaptadores reais são substituídos por fakes sem necessidade de instalar as ferramentas externas.

#### Gerenciamento de Arquivos Temporários (`TemporaryFileService`)
- Cada requisição gera um par de caminhos com identificador UUID: `temp/<uuid>.<ext_in>` e `temp/<uuid>.<ext_out>`.
- O método `_contained_path()` previne ataques de **Path Traversal**, garantindo que nenhum arquivo fora de `backend/temp/` seja acessado ou removido.
- Se a conversão for bem-sucedida, a remoção dos arquivos é registrada nas `BackgroundTasks` do FastAPI para execução após o envio do streaming. Em caso de exceção durante o upload ou conversão, os arquivos já criados são removidos imediatamente no bloco `except`.

#### Lógica no Cliente (`frontend/src/features/conversion`)
- `convertFile(converter, file)` envia uma requisição `POST` com `FormData` para a URL configurada em `NEXT_PUBLIC_API_BASE_URL`.
- O arquivo retornado é transformado em um `Blob` e uma URL de objeto (`URL.createObjectURL`) é gerada.
- **Gerenciamento de Memória**: O componente `ConversionForm` utiliza um timer de 10 segundos para revogar URLs criadas (`URL.revokeObjectURL`) ou as revoga imediatamente na desmontagem do componente, evitando vazamento de memória no navegador.
- **Suporte Mobile**: Dispositivos móveis legados recebem um botão explícito para acionamento do download via clique direto.

---

### 5.2. Módulo de Autenticação e Sessões

A autenticação é construída sobre o **Better Auth**, integrado nativamente ao Next.js e ao **PostgreSQL** via **Drizzle ORM**.

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuário
    participant Client as Frontend (React / AuthForm)
    participant RouteHandler as Next.js (/api/auth/*)
    participant BetterAuth as Better Auth Core
    participant DB as Neon PostgreSQL

    User->>Client: Preenche credenciais e clica em Entrar/Cadastrar
    Client->>Client: Validações de formato (email, tamanho de senha)
    Client->>RouteHandler: POST /api/auth/sign-in/email ou /sign-up/email
    RouteHandler->>BetterAuth: Processa requisição de auth
    BetterAuth->>DB: Consulta/insere em user, account, rate_limit
    DB-->>BetterAuth: Confirmação
    BetterAuth-->>RouteHandler: Cria Session Token & Cookie HTTP-Only
    RouteHandler-->>Client: Set-Cookie (better-auth.session_token) + JSON
    Client->>Client: Redireciona para callbackURL validada
```

#### Tabelas de Autenticação no Schema (`frontend/src/db/schema/auth.ts`)
1. **`user`**: Armazena `id` (UUID), `name`, `email` (único), `emailVerified`, `image`, `createdAt`, `updatedAt`.
2. **`session`**: Armazena `id` (UUID), `userId` (FK cascade com `user`), `token` (único), `expiresAt`, `ipAddress`, `userAgent`, `createdAt`, `updatedAt`. Possui índice em `userId`.
3. **`account`**: Armazena credenciais e provedores (`providerId`, `accountId`, `password` com hash Argon2, `userId`). Possui índices compostos e em `userId`.
4. **`verification`**: Tokens de verificação efêmeros. Possui índice em `identifier`.
5. **`rate_limit`**: Controle de abuso e limitação de tentativas no banco de dados.

#### Proteção e Redirecionamentos
- **Validação de Open Redirect**: O utilitário `resolveInternalCallbackUrl` decodifica e valida a URL de destino após o login, garantindo que o usuário só seja redirecionado para rotas internas seguras iniciadas com `/`, bloqueando esquemas maliciosos (como `//external.com` ou `javascript:`).
- **Proteção de Páginas**: As rotas `/` e `/converter/*/*` invocam `getServerSession(await headers())`. Usuários não autenticados são redirecionados para `/auth` preservando a URL de retorno. Usuários já logados que tentam acessar `/auth` são direcionados automaticamente para a Home `/`.
- **Taxas de Limite (Rate Limiting)**:
  - Login (`/sign-in/email`): Máximo de 3 requisições a cada 10 segundos.
  - Cadastro (`/sign-up/email`): Máximo de 5 requisições a cada 60 segundos.

---

## 6. Guia Passo a Passo para Desenvolvimento Local

### Pré-requisitos
- **Node.js**: Versão `>= 24.18.0` (recomendado: 24.18.x)
- **npm**: Versão `>= 11.16.0`
- **Python**: Versão `3.10.x` (as bibliotecas fixadas requerem Python 3.10)
- **LibreOffice**: Necessário no sistema operacional para testar a engine real de DOCX → PDF (opcional para testes unitários com fakes).
  - *Windows*: Adicionar `C:\Program Files\LibreOffice\program` ao `PATH`.
  - *Linux (Ubuntu/Debian)*: `sudo apt-get install libreoffice-writer`

---

### 6.1. Configurando o Backend (FastAPI)

1. Abra um terminal e navegue até a raiz do projeto:
   ```powershell
   cd C:\Projects\FileFlow
   ```
2. Crie e ative o ambiente virtual Python:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
3. Atualize o `pip` e instale as dependências:
   ```powershell
   python -m pip install --upgrade pip
   python -m pip install -r backend/requirements-dev.txt
   ```
4. Inicie o servidor FastAPI:
   ```powershell
   $env:BACKEND_CORS_ORIGINS = "http://localhost:3000"
   python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
   ```
5. A documentação OpenAPI interativa estará disponível em: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

### 6.2. Configurando o Frontend (Next.js)

1. Em outro terminal, navegue até a pasta `frontend`:
   ```powershell
   cd C:\Projects\FileFlow\frontend
   ```
2. Instale as dependências do Node.js:
   ```powershell
   npm ci
   ```
3. Crie o arquivo de variáveis de ambiente locais:
   ```powershell
   Copy-Item .env.example .env.local
   ```
4. Preencha as variáveis em `.env.local`:
   ```dotenv
   # Endpoint da API de Conversão
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

   # Configurações do Banco Neon (PostgreSQL)
   # Conexão pooled para runtime da aplicação:
   DATABASE_URL=postgresql://usuario:senha@ep-exemplo-pooler.sa-east-1.aws.neon.tech/fileflow?sslmode=require
   # Conexão direta usada apenas pelo Drizzle Kit para migrations:
   DATABASE_MIGRATION_URL=postgresql://usuario:senha@ep-exemplo.sa-east-1.aws.neon.tech/fileflow?sslmode=require

   # Better Auth
   BETTER_AUTH_SECRET=sua_chave_secreta_com_pelo_menos_32_caracteres_aleatorios
   BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000
   ```
5. Inicie o servidor de desenvolvimento:
   ```powershell
   npm run dev
   ```
6. Acesse a aplicação no navegador: [http://localhost:3000](http://localhost:3000).

---

## 7. Validação, Testes e Qualidade de Código

O FileFlow possui uma rigorosa esteira de qualidade com validações estáticas e dinâmicas.

### 7.1. Testes do Backend (Pytest)
Com o ambiente virtual ativado na raiz:
```powershell
python -m pytest backend/tests
```
Os testes do backend cobrem:
- Verificação de rotas públicas e respostas binárias.
- Testes isolados com **fakes** que garantem que o backend não dependa do LibreOffice instalado para passar na CI.
- Isolamento e remoção completa de arquivos em `temp/`.
- Validação estrita de origens no middleware CORS.

---

### 7.2. Testes do Frontend (Vitest & Playwright)
No diretório `frontend`:

```powershell
# 1. Linting e Verificação de Tipos
npm run lint
npm run typecheck

# 2. Testes Unitários e Cobertura
npm test
npm run test:coverage

# 3. Auditoria de Schema (garante sincronia entre Drizzle e Better Auth)
npm run audit:auth:schema

# 4. Compilação e Auditoria de Bundle (previne vazamento de secrets)
npm run build
npm run audit:bundle

# 5. Testes E2E (Determinísticos / Mockados)
npm run test:e2e

# 6. Testes Visuais e Responsividade
npm run test:e2e:visual
```

#### Testes de Smoke e Persistência Real
- **`npm run test:e2e:smoke`**: Inicia tanto o Next.js quanto o FastAPI e valida uma conversão real de ponta a ponta sem intermediários.
- **`npm run test:auth:primary`**: Executa testes de autenticação reais contra o banco Neon configurado. *(Atenção: execute apenas com opt-in explícito e nunca em paralelo)*.

---

## 8. Segurança e Invariantes do Projeto

Ao realizar alterações no código, certifique-se de preservar os seguintes invariantes:

1. **Nunca exponha credenciais**: Variáveis de conexão com o banco (`DATABASE_URL`, `DATABASE_MIGRATION_URL`) e segredos de criptografia (`BETTER_AUTH_SECRET`) jamais devem ter o prefixo `NEXT_PUBLIC_` ou ser importadas em arquivos com diretiva `"use client"`. O script `npm run audit:bundle` valida isso no build.
2. **Não use Wildcard (`*`) no CORS**: O backend deve aceitar apenas origens canônicas explícitas sem path ou credenciais na URL.
3. **Não execute Migrations no Startup**: O Drizzle ORM não deve rodar `migrate` automaticamente ao subir a aplicação. Migrações são sempre manuais via `npm run db:migrate` conforme o [Runbook de Autenticação](file:///C:/Projects/FileFlow/docs/RUNBOOK-auth.md).
4. **Respeite o Protocolo de Arquivos Temporários**: Qualquer novo endpoint que manipule arquivos deve utilizar o `TemporaryFileService` para garantir alocação única via UUID, contenção de path e limpeza via `BackgroundTasks`.
5. **Preserve a API Desacoplada**: Não introduza Route Handlers no Next.js para repassar uploads ao backend. O navegador deve sempre conversar diretamente com o FastAPI.

---

## 9. Próximos Passos e Links Úteis

- [README Principal](file:///C:/Projects/FileFlow/README.md): Instruções resumidas do repositório.
- [Runbook de Autenticação](file:///C:/Projects/FileFlow/docs/RUNBOOK-auth.md): Procedimentos de migração, rollback, rotação de secrets e operação do banco.
- [PRD - Autenticação Better Auth](file:///C:/Projects/FileFlow/docs/PRD-autenticacao-better-auth-neon-drizzle.md): Especificação de requisitos da camada de autenticação.
- [PRD - Migração Frontend Next.js](file:///C:/Projects/FileFlow/docs/PRD-migracao-frontend-nextjs.md): Especificação da arquitetura do frontend em App Router.
- [GitHub Quality Workflow](file:///C:/Projects/FileFlow/.github/workflows/quality.yml): Pipeline de integração contínua do projeto.
