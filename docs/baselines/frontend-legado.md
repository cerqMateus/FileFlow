# Baseline do frontend legado

## 1. Finalidade

Este documento registra o comportamento observável do frontend Jinja2/HTML/JavaScript antes da migração para Next.js. Ele é a referência de paridade para os Grupos 6, 7, 8, 13 e 15 do [backlog da migração](../TASKS-migracao-frontend-nextjs.md).

O baseline descreve o produto existente; não aprova melhorias nem transforma limitações atuais em requisitos permanentes quando o PRD já determina um comportamento diferente.

## 2. Ambiente de referência

- **Aplicação:** FastAPI/Uvicorn local
- **URL base:** `http://127.0.0.1:8000`
- **Idioma do documento:** `pt-br`
- **Fonte:** Inter, pesos 400, 600 e 700, carregada pelo Google Fonts
- **CSS:** Tailwind CSS carregado por CDN
- **Data do registro:** 20 de julho de 2026

Não foram versionadas capturas de tela. A integração de navegador permaneceu indisponível nesta sessão e o responsável dispensou essas evidências em 20 de julho de 2026. Este baseline textual e o código legado preservado no histórico Git serão as referências desta etapa.

## 3. Rotas públicas da interface

| Método | URL | Resultado |
| --- | --- | --- |
| `GET` | `/` | Home com os cinco cards de conversão |
| `GET` | `/converter/pdf/docx` | Página PDF para Word |
| `GET` | `/converter/docx/pdf` | Página Word para PDF |
| `GET` | `/converter/pdf/svg` | Página PDF para SVG |
| `GET` | `/converter/jpg/png` | Página JPG para PNG |
| `GET` | `/converter/png/jpg` | Página PNG para JPG |
| `GET` | `/converter/{origem}/{destino}` com par desconhecido | HTTP 404 com erro FastAPI |

`templates/index.html` existe no repositório, mas não é servido por nenhuma rota registrada.

## 4. Conteúdo da home

### 4.1. Cabeçalho e rodapé

- título: `FileFlow`;
- subtítulo: `Converta documentos com segurança e sem limites`;
- título da aba: `FileFlow - Conversor Universal`;
- rodapé: `© 2025 FileFlow. Powered by Docker.`.

### 4.2. Cards, ordem e navegação

| Ordem | Par | Ícone | Título | Descrição na home | URL |
| --- | --- | --- | --- | --- | --- |
| 1 | PDF → DOCX | 📄 | PDF para Word | Converta arquivos PDF em documentos Word editáveis | `/converter/pdf/docx` |
| 2 | DOCX → PDF | 📝 | Word para PDF | Converta documentos Word em arquivos PDF universais | `/converter/docx/pdf` |
| 3 | PDF → SVG | 🎨 | PDF para SVG | Converta arquivos PDF em imagens vetoriais SVG | `/converter/pdf/svg` |
| 4 | JPG → PNG | 🖼️ | JPG para PNG | Converta imagens JPG em formato PNG | `/converter/jpg/png` |
| 5 | PNG → JPG | 🖼️ | PNG para JPG | Converta imagens PNG em formato JPG comprimido | `/converter/png/jpg` |

Todos os cards exibem `Converter →`.

### 4.3. Layout responsivo

- fundo geral `slate-50`;
- conteúdo com largura máxima equivalente a `max-w-6xl` e padding horizontal;
- grade com uma coluna por padrão;
- duas colunas a partir do breakpoint `md`;
- quatro colunas a partir do breakpoint `lg`;
- cards brancos, quadrados, com cantos arredondados, borda e sombra;
- hover aumenta a sombra, altera a borda, amplia o ícone e desloca a chamada para a direita.

## 5. Catálogo exibido nas páginas de conversão

| Par | Título | Descrição | Origem exibida | Destino exibido | `accept` legado |
| --- | --- | --- | --- | --- | --- |
| PDF → DOCX | PDF para Word | Converta arquivos PDF em documentos Word editáveis | PDF | Word | `.pdf` |
| DOCX → PDF | Word para PDF | Converta documentos Word em arquivos PDF universais | Word | PDF | `.docx` |
| PDF → SVG | PDF para SVG | Converta arquivos PDF em imagens vetoriais SVG | PDF | SVG | `.pdf` |
| JPG → PNG | JPG para PNG | Converta imagens JPG em formato PNG com transparência | JPG | PNG | `.jpg` |
| PNG → JPG | PNG para JPG | Converta imagens PNG em formato JPG comprimido | PNG | JPG | `.png` |

O backend aceita `.jpg` e `.jpeg`, mas o seletor legado anuncia apenas `.jpg`. O PRD aprovado exige que o novo seletor aceite ambos; essa correção de paridade entre cliente e contrato não autoriza outras mudanças de interface.

## 6. Estrutura da página de conversão

- link absoluto no canto superior esquerdo: `Voltar`;
- card central com largura máxima equivalente a `max-w-md`;
- ícone, título e descrição vindos de `CONVERTER_CONFIG`;
- label: `Selecione seu arquivo {formato de origem}`;
- ajuda: `Suporta apenas arquivos .{formato de origem}`;
- botão: `Converter para {formato de destino}`;
- spinner inicialmente oculto;
- região de status inicialmente oculta;
- rodapé: `© 2025 FileFlow. Powered by Docker.`.

## 7. Fluxo interativo legado

### 7.1. Ausência de arquivo

Ao submeter sem arquivo, a página abre um alerta com:

```text
Por favor, selecione um arquivo.
```

Nenhuma requisição é enviada.

### 7.2. Processamento

Durante a requisição:

- botão desabilitado;
- opacidade reduzida e cursor bloqueado;
- spinner visível;
- texto do botão: `Processando...`;
- status: `Aguarde, estamos convertendo seu arquivo...`.

### 7.3. Sucesso em desktop

- resposta é consumida como `Blob`;
- uma object URL é criada;
- um anchor temporário é inserido, clicado e removido;
- status: `Sucesso! Seu download deve começar em breve.`;
- object URL é revogada após 10 segundos.

### 7.4. Sucesso em dispositivo móvel

O legado identifica mobile pela expressão aplicada ao user agent:

```text
iPhone|iPad|iPod|Android
```

Nesse caminho:

- status inicia com `Conversão concluída! `;
- é exibido o link `Clique aqui para baixar seu arquivo`;
- o link recebe a mesma object URL e o atributo `download`;
- um clique automático é tentado após 100 ms;
- a object URL é revogada após 10 segundos.

### 7.5. Erro

- para JSON FastAPI, usa `detail` quando presente;
- para corpo não interpretável, usa `Erro {status}: {statusText}`;
- fallback inicial: `Erro na conversão.`;
- texto exibido na região de status: `Erro: {mensagem}`;
- o erro também é enviado ao console;
- o botão é restaurado no bloco final.

### 7.6. Nome do download

O nome original perde somente a última extensão e recebe:

```text
{nome_original_sem_extensão}_convertido.{formato_destino}
```

Exemplo: `relatorio.final.pdf` resulta em `relatorio.final_convertido.docx`.

## 8. Contratos HTTP protegidos

Todas as conversões usam `POST`, `multipart/form-data` e o campo `file`.

| Endpoint | Entrada aceita | MIME de sucesso | Nome informado pelo backend |
| --- | --- | --- | --- |
| `/convert/pdf-to-docx` | `.pdf` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `FileFlow_Converted.docx` |
| `/convert/docx-to-pdf` | `.docx` | `application/pdf` | `FileFlow_Convertido.pdf` |
| `/convert/pdf-to-svg` | `.pdf` | `image/svg+xml` | `FileFlow_Converted.svg` |
| `/convert/jpg-to-png` | `.jpg`, `.jpeg` | `image/png` | `FileFlow_Converted.png` |
| `/convert/png-to-jpg` | `.png` | `image/jpeg` | `FileFlow_Converted.jpg` |

Extensão inválida retorna HTTP 400. Falha da conversão retorna HTTP 500. O formato atual de erro é `{"detail": string}`.

## 9. Evidência de paridade disponível

Por decisão do responsável, este grupo não contém capturas de tela. A paridade poderá ser auditada por:

- inventário textual deste documento;
- `templates/home.html` no histórico Git;
- `templates/converter.html` no histórico Git;
- `static/script.js` no histórico Git;
- catálogo `CONVERTER_CONFIG` no histórico Git;
- testes dos contratos HTTP;
- revisão manual durante a migração das páginas.

## 10. Validação do baseline

Na criação deste baseline:

- a suíte Python concluiu com 28 testes passando;
- foram confirmados os cinco endpoints `POST /convert/*`;
- foram confirmadas a home, a rota dinâmica de conversor e a montagem `/static`;
- nenhuma engine real precisa ser acionada para as capturas visuais;
- nenhum comportamento do frontend legado foi alterado.
