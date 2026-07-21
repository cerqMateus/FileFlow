# FileFlow

![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.123.4-009688?logo=fastapi)
![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black?logo=next.js)

O FileFlow converte documentos e imagens por meio de dois workspaces independentes: uma interface Next.js e uma API FastAPI. O navegador envia o arquivo diretamente ao backend, recebe a resposta binária e inicia o download localmente.

## Conversões suportadas

| Conversão | Entrada | Saída | Endpoint |
| --- | --- | --- | --- |
| PDF → DOCX | `.pdf` | DOCX | `POST /convert/pdf-to-docx` |
| DOCX → PDF | `.docx` | PDF | `POST /convert/docx-to-pdf` |
| PDF → SVG | `.pdf` | SVG da primeira página | `POST /convert/pdf-to-svg` |
| JPG → PNG | `.jpg`, `.jpeg` | PNG | `POST /convert/jpg-to-png` |
| PNG → JPG | `.png` | JPEG | `POST /convert/png-to-jpg` |

Todas as requisições usam `multipart/form-data` e o campo `file`. Erros da API seguem o formato `{"detail": string}`.

## Arquitetura atual

```text
FileFlow/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # endpoints FastAPI
│   │   ├── converters/       # adapters das engines
│   │   ├── services/         # arquivos temporários
│   │   ├── config.py         # allowlist de CORS
│   │   └── main.py           # composição da API
│   ├── tests/
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── Dockerfile            # imagem histórica somente do backend
├── frontend/
│   ├── e2e/                  # Playwright
│   ├── src/
│   │   ├── app/              # App Router e páginas
│   │   ├── config/           # configuração pública validada
│   │   └── features/conversion/
│   ├── package.json
│   └── package-lock.json
├── docs/
└── README.md
```

O FastAPI serve somente a API e sua documentação técnica. A home e as páginas de conversão são renderizadas exclusivamente pelo Next.js. Não existem templates Jinja2, arquivos estáticos legados, Route Handlers ou Server Actions intermediando uploads.

### Rotas da interface

| URL | Resultado |
| --- | --- |
| `/` | Home com os cinco conversores |
| `/converter/pdf/docx` | PDF para Word |
| `/converter/docx/pdf` | Word para PDF |
| `/converter/pdf/svg` | PDF para SVG |
| `/converter/jpg/png` | JPG para PNG |
| `/converter/png/jpg` | PNG para JPG |
| Qualquer par não suportado | Página 404 |

## Pré-requisitos

- Python 3.10.x (as dependências fixadas não suportam o Python 3.14 disponível neste ambiente);
- Node.js 24.18.x e npm 11.16.x;
- LibreOffice disponível no `PATH` para DOCX → PDF;
- Chromium do Playwright para os testes end-to-end.

No Windows, instale o LibreOffice e, se necessário, adicione seu diretório de programas à sessão:

```powershell
$env:PATH += ";C:\Program Files\LibreOffice\program"
```

Em Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install libreoffice-writer
```

## Instalação local

Clone o repositório e entre no diretório:

```powershell
git clone https://github.com/cerqMateus/FileFlow.git
cd FileFlow
```

### Backend

Crie um ambiente virtual na raiz e instale as dependências de desenvolvimento:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r backend/requirements-dev.txt
```

Opcionalmente, copie `backend/.env.example` para um arquivo local ignorado ou defina a variável na sessão. A aplicação não lê arquivos `.env` automaticamente.

```powershell
$env:BACKEND_CORS_ORIGINS = "http://localhost:3000"
python -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

A documentação da API estará em [http://localhost:8000/docs](http://localhost:8000/docs). Uma resposta 404 em `http://localhost:8000/` é esperada: o backend não serve mais páginas HTML.

### Frontend

Em outro terminal:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

A interface estará em [http://localhost:3000](http://localhost:3000).

## Configuração

### `NEXT_PUBLIC_API_BASE_URL`

Define a base pública usada pelo navegador para chamar os endpoints de conversão. Aceita:

- URL HTTP(S) absoluta, como `http://localhost:8000`;
- caminho relativo iniciado por `/`;
- string vazia ou `/` para same-origin.

Variáveis `NEXT_PUBLIC_*` são incorporadas ao bundle durante `npm run build`. Portanto, o valor precisa estar definido antes do build e não pode ser trocado apenas ao iniciar o servidor já compilado.

No desenvolvimento com portas separadas, use:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### `BACKEND_CORS_ORIGINS`

É uma lista de origens HTTP(S) separadas por vírgula. O backend remove espaços e duplicatas, mas rejeita wildcard, credenciais, paths, queries e fragments.

```powershell
$env:BACKEND_CORS_ORIGINS = "http://localhost:3000,https://app.example.com"
```

Somente `POST` e o header `Content-Type` são permitidos pelo middleware de CORS; credenciais não são habilitadas.

## Arquivos temporários

Uploads e resultados são gravados em `backend/temp/` com nomes UUID. A aplicação cria o diretório ao iniciar, restringe operações a esse diretório e agenda a remoção dos arquivos de entrada e saída após a resposta. Em falhas de upload ou conversão, ela tenta remover imediatamente os artefatos já criados.

## Validação e testes

### Backend

A partir da raiz, com o ambiente virtual ativo:

```powershell
python -m pytest backend/tests
python -m pytest backend/tests
```

### Frontend

```powershell
cd frontend
npm ci
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
```

### End-to-end

Instale o Chromium uma vez:

```powershell
cd frontend
npx playwright install chromium
```

Depois execute:

```powershell
npm run test:e2e
npm run test:e2e:smoke
npm run test:e2e:visual
```

- `test:e2e` usa respostas de rede determinísticas, cobre os cinco conversores e não aciona engines reais;
- `test:e2e:smoke` inicia Next.js e FastAPI separadamente e valida uma chamada real, CORS e ausência de API intermediária;
- `test:e2e:visual` usa o build de produção, valida layouts desktop/mobile e gera capturas efêmeras em `test-results/`.

Capturas, traces e relatórios são ignorados pelo Git. Não há snapshots PNG versionados.

## Contrato da API

| Endpoint | MIME de sucesso | Download informado pelo backend |
| --- | --- | --- |
| `/convert/pdf-to-docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `FileFlow_Converted.docx` |
| `/convert/docx-to-pdf` | `application/pdf` | `FileFlow_Convertido.pdf` |
| `/convert/pdf-to-svg` | `image/svg+xml` | `FileFlow_Converted.svg` |
| `/convert/jpg-to-png` | `image/png` | `FileFlow_Converted.png` |
| `/convert/png-to-jpg` | `image/jpeg` | `FileFlow_Converted.jpg` |

Extensão inválida retorna HTTP 400. Falha de conversão retorna HTTP 500. O frontend preserva a mensagem `detail`, bloqueia reenvio durante o processamento e gera o nome local `{nome}_convertido.{extensão}`.

## Containers e proxy

A separação de runtime planejada foi adiada. Atualmente:

- existe somente o `backend/Dockerfile` histórico;
- não existe imagem independente do frontend;
- não existe `compose.yaml` nem proxy reverso;
- builds de container e uma topologia de produção conjunta não estão validados.

Não trate o Dockerfile atual como implantação completa do produto. Até a implementação dessa etapa, execute frontend e backend como processos locais separados conforme as instruções acima.

## Limites intencionais

O produto possui exatamente cinco conversores. Autenticação, histórico, preview, processamento em lote, fila de jobs, progresso real, analytics e novos formatos não fazem parte da implementação atual.

## Contribuindo

Antes de abrir um PR, execute os gates dos workspaces afetados e mantenha mudanças de frontend, backend e infraestrutura em escopos claros.
