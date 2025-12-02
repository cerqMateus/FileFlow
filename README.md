# FileFlow

![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.123.4-009688?logo=fastapi)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![License](https://img.shields.io/badge/License-MIT-green)

**FileFlow** é uma aplicação web moderna para conversão bidirecional de documentos entre PDF e DOCX. Desenvolvida com foco em simplicidade, performance e experiência do usuário, oferece uma solução completa para conversão de documentos sem limites ou necessidade de cadastro.

## 🚀 Features

### Conversões Suportadas

- **PDF → DOCX**: Conversão de documentos PDF para formato Word (.docx)
- **DOCX → PDF**: Conversão de documentos Word para formato PDF

### Características Principais

- ✅ **Conversão bidirecional** entre formatos PDF e DOCX
- ✅ **Interface intuitiva** com design moderno e responsivo
- ✅ **Processamento assíncrono** com feedback visual em tempo real
- ✅ **Limpeza automática** de arquivos temporários após conversão
- ✅ **Download automático** do arquivo convertido
- ✅ **Sem limites de uso** ou necessidade de cadastro
- ✅ **Containerização** com Docker para fácil deployment
- ✅ **Validação de arquivos** no cliente e servidor

## 🏗️ Arquitetura

### Stack Tecnológico

#### Backend

- **[FastAPI](https://fastapi.tiangolo.com/)** - Framework web moderno e performático
- **[Uvicorn](https://www.uvicorn.org/)** - Servidor ASGI para aplicações assíncronas
- **[pdf2docx](https://github.com/ArtifexSoftware/pdf2docx)** - Biblioteca para conversão PDF → DOCX
- **[LibreOffice](https://www.libreoffice.org/)** - Engine para conversão DOCX → PDF
- **[python-docx](https://python-docx.readthedocs.io/)** - Manipulação de arquivos Word
- **[PyMuPDF](https://pymupdf.readthedocs.io/)** - Processamento de PDFs

#### Frontend

- **HTML5** + **CSS3** (via Tailwind CSS)
- **JavaScript Vanilla** - Sem dependências externas
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário via CDN
- **Google Fonts (Inter)** - Tipografia moderna

#### DevOps

- **Docker** - Containerização da aplicação
- **Python 3.10 Slim** - Imagem base otimizada

### Estrutura do Projeto

```
file_flow/
├── app/
│   ├── __init__.py           # Módulo Python
│   ├── main.py               # API FastAPI e rotas
│   └── converter.py          # Lógica de conversão
├── static/
│   └── script.js             # JavaScript do frontend
├── templates/
│   └── index.html            # Interface do usuário
├── temp/                     # Diretório para arquivos temporários
├── Dockerfile                # Configuração do container
├── requirements.txt          # Dependências Python
└── README.md                 # Documentação
```

## 🔧 Instalação e Configuração

### Pré-requisitos

- **Python 3.10+**
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

Acesse: [http://localhost:8000](http://localhost:8000)

### Instalação com Docker

#### 1. Build da imagem

```powershell
docker build -t fileflow:latest .
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
docker stop fileflow; docker rm fileflow; docker build -t fileflow:latest .; docker run -d -p 8000:8000 --name fileflow fileflow:latest
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

#### `GET /`

Página principal da aplicação.

**Response:**

- **Success (200):** Retorna interface HTML

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
PyMuPDF==1.26.6            # Processamento de PDF
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

### Tecnologias

- **Tailwind CSS:** Design system moderno e responsivo
- **Vanilla JavaScript:** Sem frameworks, máxima performance
- **Fetch API:** Requisições HTTP modernas
- **Blob API:** Download de arquivos no cliente

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
- [ ] Histórico de conversões
- [ ] API key para integração externa
- [ ] Suporte a mais formatos (PPTX, XLSX, etc.)
- [ ] Compressão de PDFs
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
