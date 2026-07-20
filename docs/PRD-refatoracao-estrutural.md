# PRD técnico — Refatoração estrutural do FileFlow

## 1. Identificação

- **Status:** Concluído
- **Data de conclusão:** 20 de julho de 2026
- **Tipo:** Manutenção estrutural
- **Objetivo:** preparar a base do FileFlow para evolução segura, testes automatizados e operação por múltiplos usuários
- **Escopo desta entrega:** higiene do repositório, conclusão da migração para adapters, testes das rotas de conversão e centralização do ciclo de vida dos arquivos temporários
- **Estratégia de entrega:** quatro commits atômicos, todos seguindo Conventional Commits com o tipo `chore`
- **Plano de execução:** [TASKS-refatoracao-estrutural.md](TASKS-refatoracao-estrutural.md)

## 2. Contexto

O FileFlow já oferece cinco conversões por meio de uma API FastAPI e possui adapters que isolam `pdf2docx`, PyMuPDF, LibreOffice e Pillow. A refatoração anterior, porém, deixou código legado em `app/converter.py`, arquivos de cache do Python versionados, ausência de testes e lógica repetida nas rotas para receber uploads, criar caminhos temporários e remover arquivos.

Essas condições aumentam o risco de regressões e dificultam mudanças necessárias para transformar o MVP local em um serviço operável por várias pessoas. Esta etapa não adicionará novas conversões: ela estabelecerá uma base confiável para as próximas evoluções.

## 3. Objetivos

1. Manter o repositório livre de artefatos locais e gerados automaticamente.
2. Garantir que toda conversão seja executada exclusivamente pela camada de adapters.
3. Criar uma suíte rápida e determinística para as cinco rotas de conversão.
4. Unificar o ciclo de vida de arquivos temporários, reduzindo duplicação e risco de vazamento de arquivos.
5. Preservar os endpoints, formatos de resposta e comportamento percebido pelo usuário.

## 4. Fora do escopo

- Adicionar autenticação, rate limiting ou filas de processamento.
- Implementar armazenamento em nuvem ou banco de dados.
- Alterar o layout do frontend.
- Adicionar novos formatos de conversão.
- Executar conversões em workers externos.
- Resolver nesta etapa o processamento síncrono e intensivo em CPU dentro das rotas assíncronas.
- Adicionar limites de upload, observabilidade ou políticas de retenção. Esses itens deverão compor uma etapa posterior de produção.

## 5. Princípios técnicos

- **Commits atômicos:** cada tarefa deve produzir um commit independente e funcional.
- **Compatibilidade:** nenhuma URL pública ou mídia de resposta será alterada.
- **Inversão de dependência:** testes não devem carregar ou executar bibliotecas reais de conversão.
- **Testes determinísticos:** cada teste utilizará um diretório temporário isolado.
- **Responsabilidade única:** rotas coordenam HTTP; adapters convertem; o serviço temporário gerencia arquivos.
- **Falha segura:** arquivos já criados devem ser removidos tanto em sucesso quanto em erro.

## 6. Arquitetura desejada

```text
Cliente
  -> rota FastAPI
      -> valida entrada
      -> serviço de arquivos temporários
          -> reserva caminhos únicos
          -> persiste upload em blocos
      -> factory fornece o adapter
      -> adapter executa a conversão
      -> FileResponse entrega o resultado
      -> BackgroundTasks solicita a limpeza ao serviço temporário
```

Responsabilidades após a refatoração:

| Componente | Responsabilidade |
| --- | --- |
| `app/main.py` | Contrato HTTP, validação da requisição e coordenação do fluxo |
| `app/converters/base.py` | Protocolos dos conversores |
| `app/converters/factory.py` | Criação dos adapters concretos |
| `app/converters/adapters/` | Integração exclusiva com bibliotecas externas |
| `app/services/temporary_files.py` | Criação de caminhos, gravação do upload e limpeza |
| `tests/fakes.py` | Implementações determinísticas dos protocolos para testes |
| `tests/test_conversion_routes.py` | Contratos HTTP das cinco conversões |

## 7. Tarefas

### 7.1. Higiene do repositório

**Commit:** `chore(repo): ignore generated Python artifacts`

#### Problema

O repositório contém diretórios `__pycache__` e arquivos `.pyc` versionados. Novos caches e o ambiente virtual local também aparecem como arquivos não rastreados.

#### Implementação

- Criar `.gitignore` na raiz.
- Ignorar, no mínimo:
  - `__pycache__/`
  - `*.py[cod]`
  - `.pytest_cache/`
  - `.coverage`
  - `htmlcov/`
  - `.venv/` e `venv/`
  - conteúdo de `temp/`
  - arquivos `.env`, preservando um eventual `.env.example`
- Remover todos os caches Python já rastreados apenas do índice Git.
- Manter os arquivos locais intactos; a remoção física dos caches não é requisito.
- Incluir este PRD no commit, pois ele documenta a série de mudanças estruturais.

#### Tecnologia e metodologia

- Regras nativas do Git por meio de `.gitignore`.
- Auditoria com `git ls-files` para garantir que nenhum `.pyc` permaneça rastreado.
- Commit pequeno, sem alterações funcionais.

#### Critérios de aceite

- `git ls-files` não retorna `__pycache__` nem arquivos `.pyc`.
- Criar ou executar bytecode Python não suja o working tree.
- O ambiente `venv/` não aparece em `git status`.
- A aplicação não sofre alteração de comportamento.

### 7.2. Conclusão da migração de `app/converter.py`

**Commit:** `chore(converters): complete adapter migration`

#### Problema

`app/converter.py` ainda duplica todas as implementações presentes nos adapters. Apenas `remove_file` continua sendo importada por `app/main.py`. Isso cria duas fontes possíveis para a mesma regra de conversão.

#### Implementação

- Criar `app/services/temporary_files.py` inicialmente com a operação idempotente de remoção.
- Atualizar `app/main.py` para importar a remoção desse novo módulo.
- Confirmar que todas as conversões continuam sendo obtidas por `app.converters.factory`.
- Excluir `app/converter.py` após eliminar seu último consumidor.
- Não alterar assinaturas, URLs, nomes de download ou tipos MIME.

O novo módulo será deliberadamente pequeno neste commit. Ele será expandido na tarefa 7.4, mantendo este commit focado exclusivamente na remoção do legado.

#### Tecnologia e metodologia

- Adapter Pattern já adotado pelo projeto.
- Protocolos de `typing` como fronteira entre aplicação e integrações.
- Busca estática com `rg` para identificar imports ou chamadas remanescentes.
- Verificação de importação da aplicação antes do commit.

#### Critérios de aceite

- `app/converter.py` não existe mais.
- Não há implementações de conversão fora de `app/converters/adapters/`.
- `app/main.py` utiliza apenas factories para obter conversores.
- A aplicação pode ser importada e as rotas existentes permanecem registradas.

### 7.3. Testes das cinco rotas com adapters falsos

**Commit:** `chore(tests): cover conversion routes with fake adapters`

#### Problema

Não existe proteção automatizada para os contratos HTTP. Testes com conversores reais seriam lentos, dependeriam do LibreOffice e produziriam resultados variáveis.

#### Implementação

- Adicionar dependências de desenvolvimento em `requirements-dev.txt`.
- Utilizar `pytest`, `httpx` e `fastapi.testclient.TestClient`.
- Criar adapters falsos que respeitem os quatro protocolos existentes:
  - PDF para DOCX;
  - DOCX para PDF;
  - PDF para SVG;
  - imagem, cobrindo JPG para PNG e PNG para JPG.
- Os fakes devem criar arquivos mínimos e determinísticos, sem importar nem chamar engines externas.
- Substituir as factories referenciadas por `app.main` com `monkeypatch`.
- Redirecionar o diretório temporário para o fixture `tmp_path` em cada teste.
- Cobrir as cinco rotas de sucesso:
  - `POST /convert/pdf-to-docx`;
  - `POST /convert/docx-to-pdf`;
  - `POST /convert/pdf-to-svg`;
  - `POST /convert/jpg-to-png`;
  - `POST /convert/png-to-jpg`.
- Para cada rota, verificar status, `Content-Type`, nome sugerido para download, conteúdo retornado e chamada correta ao fake.
- Cobrir também a rejeição de extensões inválidas e ao menos um cenário de falha do adapter.
- Confirmar que os arquivos temporários são removidos após a resposta.

#### Tecnologia e metodologia

- **pytest:** runner, fixtures e parametrização.
- **TestClient/httpx:** chamadas HTTP em processo, sem abrir porta de rede.
- **Test doubles:** adapters falsos em vez de mocks das bibliotecas de terceiros.
- **Monkeypatch:** substituição explícita das factories no limite da aplicação.
- **Arrange, Act, Assert:** organização uniforme dos testes.
- **Testes de contrato:** foco no comportamento observável da API, não em detalhes internos.

#### Critérios de aceite

- As cinco rotas possuem teste de sucesso executado sem LibreOffice, Pillow, PyMuPDF ou `pdf2docx` reais.
- Extensões inválidas retornam HTTP 400.
- Falha de conversão retorna HTTP 500.
- Arquivos de resposta e temporários são tratados corretamente.
- `pytest -q` termina com sucesso em uma instalação limpa das dependências de desenvolvimento.
- Os testes não escrevem no diretório `temp/` real do projeto.

### 7.4. Centralização do ciclo de vida dos arquivos temporários

**Commit:** `chore(api): centralize temporary file lifecycle`

#### Problema

As cinco rotas repetem a geração de UUID, composição de nomes, gravação do upload e agendamento da remoção. A duplicação facilita comportamentos divergentes e pode deixar resíduos quando uma conversão falha parcialmente.

#### Implementação

- Expandir `app/services/temporary_files.py` com um serviço dedicado.
- Representar os caminhos de entrada e saída com uma `dataclass` ou estrutura tipada equivalente.
- O serviço deverá:
  - receber o diretório-base por injeção;
  - garantir que o diretório exista;
  - gerar um identificador UUID único;
  - criar caminhos de entrada e saída a partir de extensões normalizadas;
  - persistir `UploadFile` em blocos, usando I/O assíncrono;
  - remover arquivos de forma idempotente;
  - limpar imediatamente os arquivos em fluxos de erro;
  - registrar a limpeza pós-resposta em `BackgroundTasks` no fluxo de sucesso.
- Utilizar `pathlib.Path` para composição e validação de caminhos.
- Reescrever as cinco rotas para consumir o serviço e eliminar os blocos duplicados.
- Preservar nos adapters os contratos atuais de caminho de entrada e saída.
- Manter a saída disponível até o término do envio de `FileResponse`.

Uma interface inicial sugerida é:

```python
@dataclass(frozen=True)
class ConversionPaths:
    input: Path
    output: Path


class TemporaryFileService:
    def allocate(self, input_extension: str, output_extension: str) -> ConversionPaths: ...
    async def save_upload(self, upload: UploadFile, destination: Path) -> None: ...
    def remove(self, *paths: Path) -> None: ...
    def schedule_cleanup(self, tasks: BackgroundTasks, *paths: Path) -> None: ...
```

A assinatura final pode variar durante a implementação, desde que mantenha as responsabilidades e os critérios de aceite deste documento.

#### Tecnologia e metodologia

- `pathlib` para manipulação segura e portável de caminhos.
- `uuid` para isolamento entre requisições concorrentes.
- `aiofiles`, já presente nas dependências, para escrita assíncrona em blocos.
- `BackgroundTasks` para limpeza somente após o envio da resposta.
- Injeção do diretório temporário para isolamento de testes.
- Refactoring by abstraction: introduzir o serviço e migrar uma responsabilidade repetida de cada vez, mantendo os testes verdes.

#### Critérios de aceite

- Não há geração manual de UUID nem `open(..., "wb")` duplicados nas rotas.
- A configuração do diretório temporário possui uma única fonte.
- Sucesso e falha removem todos os arquivos que chegaram a ser criados.
- Requisições simultâneas não compartilham nomes de arquivos.
- Os contratos HTTP permanecem iguais.
- Todos os testes da tarefa 7.3 continuam passando.

## 8. Plano de commits

Os commits devem ser produzidos nesta ordem:

| Ordem | Commit | Conteúdo exclusivo |
| --- | --- | --- |
| 1 | `chore(repo): ignore generated Python artifacts` | `.gitignore`, retirada dos caches do índice e inclusão deste PRD |
| 2 | `chore(converters): complete adapter migration` | nova localização da remoção e exclusão de `app/converter.py` |
| 3 | `chore(tests): cover conversion routes with fake adapters` | dependências de desenvolvimento, fakes e testes das rotas |
| 4 | `chore(api): centralize temporary file lifecycle` | serviço temporário completo e redução da duplicação nas rotas |

Antes de cada commit:

1. Revisar `git diff --check`.
2. Executar `pytest -q` assim que a suíte existir.
3. Confirmar que o diff contém somente o escopo da tarefa.
4. Verificar `git status --short` após o commit.

## 9. Definição de pronto

Esta etapa estará concluída quando:

- os quatro commits existirem separadamente e na ordem planejada;
- o repositório não rastrear artefatos Python gerados;
- não houver código legado em `app/converter.py`;
- as cinco rotas forem cobertas por testes determinísticos com adapters falsos;
- upload, caminhos temporários e limpeza forem responsabilidade de um único serviço;
- a suíte completa passar em Python 3.10;
- os cinco endpoints e seus formatos de resposta permanecerem compatíveis.

## 10. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Limpeza ocorrer antes de `FileResponse` terminar | Agendar remoção com `BackgroundTasks` apenas no caminho de sucesso |
| Testes chamarem conversores reais acidentalmente | Substituir todas as factories e fazer os fakes registrarem chamadas |
| Arquivo parcial permanecer após exceção | Limpeza imediata e idempotente no bloco de erro |
| Testes dependerem do diretório global `temp/` | Injetar `tmp_path` por teste |
| Refatoração alterar contrato público | Validar headers, nomes de download, mídia e status nos testes |
| Commit misturar tarefas | Conferir o diff e adicionar ao índice somente os arquivos da etapa atual |

## 11. Evoluções recomendadas após esta etapa

Após concluir este PRD, as próximas iniciativas de produção deverão considerar:

- limite configurável de tamanho de upload;
- validação de conteúdo além da extensão;
- execução das conversões fora do event loop;
- fila de jobs para tarefas pesadas;
- rate limiting e proteção contra abuso;
- logs estruturados, métricas e health checks;
- configuração por variáveis de ambiente;
- container executado como usuário não-root;
- CI para testes, análise estática e build da imagem;
- política de expiração para resíduos após reinício inesperado.

## 12. Encerramento

O PRD foi concluído com os quatro commits estruturais planejados. A validação final confirmou 28 testes passando em Python 3.10, cinco rotas de conversão registradas, ausência de artefatos gerados no versionamento e centralização do ciclo de arquivos temporários.

Durante a implementação, foram adotados três aprimoramentos diretamente relacionados ao escopo:

- migração do evento de startup depreciado para o lifespan atual do FastAPI;
- validação de contenção para impedir caminhos temporários fora do diretório configurado;
- ampliação da suíte com testes unitários do serviço temporário e simulação de saídas parciais.

Esses ajustes não alteraram endpoints, nomes de download, tipos MIME ou formatos suportados.
