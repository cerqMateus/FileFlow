# FileFlow

![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.123.4-009688?logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

**FileFlow** é uma aplicação web moderna para conversão de documentos e imagens. Desenvolvida com foco em simplicidade, performance e experiência do usuário, oferece uma solução completa para conversão de múltiplos formatos sem limites ou necessidade de cadastro.

## 🚀 Features

### Conversões Suportadas

#### Documentos
- **PDF → DOCX**: Conversão de documentos PDF para formato Word (.docx)
- **DOCX → PDF**: Conversão de documentos Word para formato PDF
- **PDF → SVG**: Conversão da primeira página de PDF em imagem vetorial SVG

#### Imagens
- **JPG → PNG**: Conversão de imagens JPG/JPEG para formato PNG com suporte a transparência
- **PNG → JPG**: Conversão de imagens PNG para formato JPG com qualidade otimizada

### Características Principais

- ✅ **Conversão multiformato** entre PDF, DOCX, SVG, PNG e JPG
- ✅ **Interface intuitiva** com design moderno e responsivo
- ✅ **Processamento assíncrono** com feedback visual em tempo real
- ✅ **Limpeza automática** de arquivos temporários após conversão
- ✅ **Download automático** do arquivo convertido
- ✅ **Sem limites de uso** ou necessidade de cadastro
- ✅ **Containerização** com Docker para fácil deployment
- ✅ **Validação de arquivos** no cliente e servidor

## 🏗️ Arquitetura

### Padrões de Projeto

O FileFlow utiliza o **Adapter Pattern** para isolar as dependências de bibliotecas externas, garantindo que alterações nas APIs das bibliotecas não causem mudanças catastróficas no código da aplicação. Esta arquitetura permite:

- **Baixo acoplamento**: A aplicação depende de interfaces (protocols), não de implementações concretas
- **Fácil manutenção**: Troca de bibliotecas sem modificar a lógica de negócio
- **Testabilidade**: Facilita a criação de mocks e testes unitários
- **Proteção contra breaking changes**: Mudanças em bibliotecas externas são isoladas nos adaptadores

### Stack Tecnológico

#### Backend

- **[FastAPI](https://fastapi.tiangolo.com/)** - Framework web moderno e performático
- **[Uvicorn](https://www.uvicorn.org/)** - Servidor ASGI para aplicações assíncronas
- **[pdf2docx](https://github.com/ArtifexSoftware/pdf2docx)** - Biblioteca para conversão PDF → DOCX
- **[LibreOffice](https://www.libreoffice.org/)** - Engine para conversão DOCX → PDF
- **[python-docx](https://python-docx.readthedocs.io/)** - Manipulação de arquivos Word
- **[PyMuPDF](https://pymupdf.readthedocs.io/)** - Processamento de PDFs e conversão para SVG
- **[Pillow (PIL)](https://pillow.readthedocs.io/)** - Processamento e conversão de imagens

#### Frontend

- **[Next.js](https://nextjs.org/)** com App Router
- **TypeScript estrito** - Tipagem e verificações estáticas obrigatórias
- **[Tailwind CSS](https://tailwindcss.com/)** - Dependência local de build, sem CDN
- **Inter via `next/font`** - Fonte incorporada ao build

O workspace Next.js ainda é um scaffold técnico. Até a conclusão da migração, a interface funcional continua sendo servida temporariamente pelo frontend legado do backend.

#### DevOps

- **Docker** - Containerização da aplicação
- **Python 3.10 Slim** - Imagem base otimizada

### Estrutura do Projeto

```
file_flow/
├── backend/
│   ├── app/
│   │   ├── api/routes/           # Rotas HTTP de conversão
│   │   ├── config.py             # Caminhos compartilhados do backend
│   │   ├── converters/           # Protocolos, factory e adapters
│   │   ├── legacy_frontend.py    # Composição temporária do frontend Jinja2
│   │   ├── main.py               # Composição da aplicação FastAPI
│   │   └── services/             # Serviços da aplicação
│   ├── tests/                     # Testes do backend
│   ├── static/                    # JavaScript legado temporário
│   ├── templates/                 # Templates legados temporários
│   ├── temp/                      # Arquivos temporários em runtime
│   ├── Dockerfile
│   ├── requirements.txt
│   └── requirements-dev.txt
├── frontend/
│   ├── src/
│   │   ├── app/                   # App Router e estilos globais
│   │   ├── config/                # Ambiente público validado
│   │   └── features/conversion/   # Domínio e catálogo de conversores
│   ├── .env.example              # Configuração pública de exemplo
│   ├── eslint.config.mjs         # Qualidade e fronteiras arquiteturais
│   ├── next.config.ts            # Configuração do Next.js
│   ├── package.json              # Scripts e dependências fixadas
│   └── tsconfig.json             # TypeScript estrito
├── docs/                          # PRDs, backlogs e baselines
├── scripts/
│   └── 01.md                     # Documentação de refatoração
└── README.md                     # Documentação principal
```

Os diretórios `backend/templates/` e `backend/static/` permanecem apenas durante a migração para Next.js e serão removidos quando o backend passar a servir exclusivamente a API.

## 🔧 Instalação e Configuração

### Pré-requisitos

- **Python 3.10+**
- **Node.js 24.18.0** e **npm 11.16.0** para o frontend
- **LibreOffice** (para conversão DOCX → PDF)
- **Docker** (opcional, para containerização)

### Instalação Local

#### 1. Clone o repositório

```bash
git clone https://github.com/cerqMateus/FileFlow.git
cd FileFlow
```

#### 2. Crie um ambiente virtual

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

#### 3. Instale as dependências

```powershell
cd backend
pip install -r requirements.txt
```

#### 4. Instale o LibreOffice

No Windows, baixe e instale o [LibreOffice](https://www.libreoffice.org/download/download/) e adicione ao PATH:

```powershell
# Adicione ao PATH do sistema (exemplo)
$env:PATH += ";C:\Program Files\LibreOffice\program"
```

No Linux/macOS:

```bash
# Ubuntu/Debian
sudo apt-get install libreoffice-writer

# macOS
brew install --cask libreoffice
```

#### 5. Execute a aplicação

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Alternativamente, a partir da raiz do repositório:

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8000
```

Acesse: [http://localhost:8000](http://localhost:8000)

### Scaffold do frontend Next.js

O frontend pode ser instalado e validado independentemente:

```powershell
cd frontend
npm ci
npm run lint
npm run typecheck
npm run build
npm run dev
```

O servidor de desenvolvimento responde em [http://localhost:3000](http://localhost:3000). A home já é renderizada pelo Next.js; as páginas e os fluxos de conversão ainda não foram migrados.

Copie `frontend/.env.example` para `frontend/.env.local` ao executar frontend e backend em portas diferentes. `NEXT_PUBLIC_API_BASE_URL` aceita uma URL HTTP(S) absoluta, uma base relativa iniciada por `/` ou valor vazio para same-origin. Variáveis `NEXT_PUBLIC_*` são incorporadas ao bundle durante o build; cada ambiente deve defini-las antes de executar `npm run build`.

### Instalação com Docker

Execute os comandos desta seção a partir da raiz do repositório.

#### 1. Build da imagem

```powershell
docker build -t fileflow:latest backend
```

#### 2. Execute o container

```powershell
docker run -d -p 8000:8000 --name fileflow fileflow:latest
```

#### 3. Acesse a aplicação

Navegue até [http://localhost:8000](http://localhost:8000)

#### Comandos úteis

```powershell
# Ver logs
docker logs -f fileflow

# Parar container
docker stop fileflow

# Remover container
docker rm fileflow

# Rebuild e restart
docker stop fileflow; docker rm fileflow; docker build -t fileflow:latest backend; docker run -d -p 8000:8000 --name fileflow fileflow:latest
```

## 🛠️ Detalhes Técnicos

### API Endpoints

#### `POST /convert/pdf-to-docx`

Converte arquivo PDF para DOCX.

**Request:**

- **Content-Type:** `multipart/form-data`
- **Body:** `file` (arquivo .pdf)

**Response:**

- **Success (200):** Retorna arquivo .docx
- **Error (400):** Formato de arquivo inválido
- **Error (500):** Falha na conversão

**Exemplo:**

```javascript
const formData = new FormData();
formData.append("file", pdfFile);

const response = await fetch("/convert/pdf-to-docx", {
  method: "POST",
  body: formData,
});

const blob = await response.blob();
```

#### `POST /convert/docx-to-pdf`

Converte arquivo DOCX para PDF.

**Request:**

- **Content-Type:** `multipart/form-data`
- **Body:** `file` (arquivo .docx)

**Response:**

- **Success (200):** Retorna arquivo .pdf
- **Error (400):** Formato de arquivo inválido
- **Error (500):** Falha na conversão

#### `POST /convert/pdf-to-svg`

Converte a primeira página de um arquivo PDF para imagem vetorial SVG.

**Request:**

- **Content-Type:** `multipart/form-data`
- **Body:** `file` (arquivo .pdf)

**Response:**

- **Success (200):** Retorna arquivo .svg
- **Error (400):** Formato de arquivo inválido
- **Error (500):** Falha na conversão

#### `POST /convert/jpg-to-png`

Converte imagem JPG/JPEG para formato PNG.

**Request:**

- **Content-Type:** `multipart/form-data`
- **Body:** `file` (arquivo .jpg ou .jpeg)

**Response:**

- **Success (200):** Retorna arquivo .png
- **Error (400):** Formato de arquivo inválido
- **Error (500):** Falha na conversão

#### `POST /convert/png-to-jpg`

Converte imagem PNG para formato JPG com qualidade 95%.

**Request:**

- **Content-Type:** `multipart/form-data`
- **Body:** `file` (arquivo .png)

**Response:**

- **Success (200):** Retorna arquivo .jpg
- **Error (400):** Formato de arquivo inválido
- **Error (500):** Falha na conversão

#### `GET /`

Página principal da aplicação.

**Response:**

- **Success (200):** Retorna interface HTML

#### `GET /converter/{from_format}/{to_format}`

Página de conversão específica para um par de formatos.

**Response:**

- **Success (200):** Retorna interface HTML personalizada
- **Error (404):** Conversor não encontrado

### Fluxo de Conversão

#### PDF → DOCX

1. **Upload:** Cliente envia arquivo PDF via multipart/form-data
2. **Validação:** Servidor valida extensão `.pdf`
3. **Armazenamento:** Arquivo salvo temporariamente com UUID único
4. **Conversão:** Biblioteca `pdf2docx` processa o arquivo
5. **Resposta:** FileResponse com arquivo .docx
6. **Limpeza:** BackgroundTasks remove arquivos temporários

#### DOCX → PDF

1. **Upload:** Cliente envia arquivo DOCX via multipart/form-data
2. **Validação:** Servidor valida extensão `.docx`
3. **Armazenamento:** Arquivo salvo temporariamente com UUID único
4. **Conversão:** LibreOffice processa via subprocess
5. **Resposta:** FileResponse com arquivo .pdf
6. **Limpeza:** BackgroundTasks remove arquivos temporários

#### PDF → SVG

1. **Upload:** Cliente envia arquivo PDF via multipart/form-data
2. **Validação:** Servidor valida extensão `.pdf`
3. **Armazenamento:** Arquivo salvo temporariamente com UUID único
4. **Conversão:** PyMuPDF extrai a primeira página como SVG
5. **Resposta:** FileResponse com arquivo .svg
6. **Limpeza:** BackgroundTasks remove arquivos temporários

#### Conversões de Imagem (JPG ↔ PNG)

1. **Upload:** Cliente envia arquivo de imagem via multipart/form-data
2. **Validação:** Servidor valida extensão do arquivo
3. **Armazenamento:** Arquivo salvo temporariamente com UUID único
4. **Conversão:** Pillow (PIL) processa a imagem
   - **PNG → JPG:** Converte transparência para fundo branco, qualidade 95%
   - **JPG → PNG:** Preserva ou converte para RGB conforme necessário
5. **Resposta:** FileResponse com arquivo convertido
6. **Limpeza:** BackgroundTasks remove arquivos temporários

### Gerenciamento de Arquivos Temporários

```python
# Geração de UUID único para evitar conflitos
filename_id = str(uuid.uuid4())

# BackgroundTasks garante limpeza após resposta
background_tasks.add_task(remove_file, input_path)
background_tasks.add_task(remove_file, output_path)
```

### Segurança e Validações

- ✅ Validação de extensão de arquivo no servidor
- ✅ Validação de tipo MIME via `accept` no input HTML
- ✅ Timeout de 60 segundos para conversões com LibreOffice
- ✅ Isolamento de arquivos via UUID únicos
- ✅ Limpeza automática de arquivos temporários
- ✅ Error handling com HTTPException

### Performance

- **Processamento Assíncrono:** FastAPI permite múltiplas requisições simultâneas
- **Background Tasks:** Limpeza de arquivos não bloqueia a resposta
- **Streaming de Arquivos:** FileResponse otimiza transferência
- **Docker Multi-stage:** Imagem slim reduz tamanho e tempo de deploy

## 📊 Dependências Principais

```
fastapi==0.123.4           # Framework web
uvicorn==0.38.0            # Servidor ASGI
pdf2docx==0.5.8            # Conversão PDF → DOCX
python-docx==1.2.0         # Manipulação de DOCX
PyMuPDF==1.26.6            # Processamento de PDF e conversão para SVG
Pillow==11.1.0             # Processamento e conversão de imagens
python-multipart==0.0.20   # Upload de arquivos
Jinja2==3.1.6              # Template engine
```

## 🐳 Docker

### Dockerfile Explicado

```dockerfile
FROM python:3.10-slim           # Imagem base leve

ENV PYTHONDONTWRITEBYTECODE=1   # Evita arquivos .pyc
ENV PYTHONUNBUFFERED=1          # Log em tempo real

# Instala LibreOffice e dependências
RUN apt-get update && apt-get install -y \
    libreoffice-java-common \
    libreoffice-writer \
    fonts-liberation \
    fonts-dejavu \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p temp               # Diretório para arquivos temporários

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build Otimizado

A imagem Docker é construída com:

- **Base slim:** Reduz tamanho final
- **Multi-layer caching:** requirements.txt copiado antes do código
- **Limpeza de cache:** `apt-get clean` remove arquivos temporários
- **Non-root user:** Pode ser adicionado para maior segurança

## 🎨 Frontend

### Estado da migração

- O scaffold Next.js usa App Router, TypeScript estrito, Tailwind local e rotas tipadas.
- O domínio de conversão expõe um catálogo imutável com somente os cinco pares suportados.
- O lint impede `any` explícito, JavaScript de aplicação, dependências não declaradas e violações das fronteiras arquiteturais.
- A home foi reproduzida no Next.js a partir do catálogo; páginas e fluxos de conversão permanecem nos próximos grupos.
- O frontend Jinja2 permanece temporariamente ativo, sem duplicação funcional no Next.js neste estágio.

### Componentes UI

- **Sistema de Tabs:** Alterna entre modos de conversão
- **Upload Drag & Drop Ready:** Preparado para expansão
- **Loading States:** Feedback visual durante processamento
- **Notificações:** Sistema de mensagens de sucesso/erro

### Responsividade

- Mobile-first design
- Container max-width adaptável
- Componentes responsivos via Tailwind

## 🔄 Roadmap

### Próximas Features

- [ ] Suporte a múltiplos arquivos (batch processing)
- [ ] Preview de documentos antes do download
- [ ] Conversão de múltiplas páginas PDF para SVG
- [ ] Redimensionamento e edição de imagens
- [ ] Conversão entre mais formatos de imagem (WebP, GIF, BMP)
- [ ] Histórico de conversões
- [ ] API key para integração externa
- [ ] Suporte a mais formatos (PPTX, XLSX, etc.)
- [ ] Compressão de PDFs e imagens
- [ ] OCR para PDFs escaneados
- [ ] Testes unitários e de integração
- [ ] CI/CD pipeline

### Melhorias Técnicas

- [ ] Rate limiting
- [ ] Autenticação opcional
- [ ] Monitoramento com Prometheus
- [ ] Logs estruturados
- [ ] Health check endpoints
- [ ] Documentação OpenAPI/Swagger

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Mateus Cerqueira**

- GitHub: [@cerqMateus](https://github.com/cerqMateus)

## 🙏 Agradecimentos

- FastAPI pela excelente documentação
- pdf2docx pela biblioteca de conversão
- LibreOffice pela engine de conversão
- Tailwind CSS pelo framework de design

---

**⭐ Se este projeto foi útil, considere dar uma estrela no GitHub!**
