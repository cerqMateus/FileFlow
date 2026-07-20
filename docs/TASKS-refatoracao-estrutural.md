# Tasks — Refatoração estrutural do FileFlow

## 1. Referência e regras de execução

Este backlog implementa o [PRD técnico de refatoração estrutural](PRD-refatoracao-estrutural.md).

Regras aplicáveis a todas as tasks:

- executar as tasks na ordem numérica;
- manter cada mudança dentro do commit indicado em seu grupo;
- não versionar `venv/`, `.venv/`, caches ou arquivos temporários;
- usar Python 3.10 para instalação e validação;
- não alterar endpoints, nomes de download nem tipos MIME;
- executar `git diff --check` antes de cada commit;
- executar a suíte completa a partir do momento em que ela existir;
- marcar uma task como concluída somente depois de validar seu critério de aceite.

Estados sugeridos:

- `[ ]` pendente;
- `[-]` em andamento;
- `[x]` concluída;
- `[!]` bloqueada, acompanhada do motivo.

## 2. Grupo 1 — Higiene do repositório

**Commit do grupo:** `chore(repo): ignore generated Python artifacts`

### Task 1 — Registrar o baseline do repositório

- [x] Confirmar branch atual e correspondência com `origin/main`.
- [x] Registrar os arquivos modificados e não rastreados antes da implementação.
- [x] Listar os caches Python atualmente versionados.
- [x] Confirmar que `venv/` e os novos caches são apenas artefatos locais.

**Validação:** o inventário distingue arquivos do projeto, documentos aprovados e artefatos gerados.

### Task 2 — Criar o `.gitignore`

- [x] Adicionar regras para `__pycache__/` e `*.py[cod]`.
- [x] Adicionar regras para `.pytest_cache/`, `.coverage` e `htmlcov/`.
- [x] Adicionar regras para `.venv/` e `venv/`.
- [x] Ignorar o conteúdo runtime de `temp/`.
- [x] Ignorar `.env`, preservando explicitamente `.env.example`.

**Validação:** `git check-ignore -v` identifica corretamente um exemplo de cada artefato.

**Dependência:** Task 1.

### Task 3 — Retirar caches Python do índice Git

- [x] Remover do índice todos os `__pycache__` e `.pyc` já rastreados.
- [x] Não excluir o ambiente virtual nem outros arquivos locais do usuário.
- [x] Confirmar que nenhum arquivo-fonte foi incluído na remoção.

**Validação:** `git ls-files` não retorna caminhos contendo `__pycache__` ou terminados em `.pyc`.

**Dependência:** Task 2.

### Task 4 — Validar a higiene do working tree

- [x] Executar uma compilação de bytecode do pacote `app`.
- [x] Confirmar que a compilação não cria novas entradas em `git status`.
- [x] Confirmar que `venv/` não aparece em `git status`.
- [x] Executar `git diff --check`.

**Validação:** somente `.gitignore`, documentos de planejamento e remoções esperadas do índice aparecem no diff do grupo.

**Dependência:** Task 3.

### Task 5 — Criar o commit de higiene

- [x] Revisar o diff completo do grupo.
- [x] Incluir `.gitignore`, este backlog e o PRD aprovado.
- [x] Criar o commit `chore(repo): ignore generated Python artifacts`.
- [x] Confirmar o commit com `git show --stat --oneline HEAD`.

**Validação:** o primeiro commit é atômico e não contém alteração funcional.

**Dependência:** Task 4.

## 3. Grupo 2 — Conclusão da migração para adapters

**Commit do grupo:** `chore(converters): complete adapter migration`

### Task 6 — Criar o pacote de serviços

- [ ] Criar `app/services/__init__.py`.
- [ ] Criar `app/services/temporary_files.py`.
- [ ] Manter o novo módulo independente das bibliotecas de conversão.

**Validação:** o pacote pode ser importado isoladamente.

**Dependência:** Task 5.

### Task 7 — Migrar a remoção idempotente de arquivos

- [ ] Implementar em `temporary_files.py` a operação atualmente fornecida por `remove_file`.
- [ ] Preservar o comportamento idempotente para caminhos inexistentes.
- [ ] Utilizar tipagem compatível com os consumidores atuais.

**Validação:** remover um arquivo existente funciona e repetir a remoção não lança exceção.

**Dependência:** Task 6.

### Task 8 — Atualizar o consumidor em `app/main.py`

- [ ] Trocar o import de `app.converter` pelo novo serviço.
- [ ] Manter inalteradas as chamadas de limpeza nas cinco rotas.
- [ ] Confirmar que as factories continuam sendo a única entrada para conversores.

**Validação:** `app.main` pode ser importado e registra as cinco rotas de conversão.

**Dependência:** Task 7.

### Task 9 — Remover o módulo legado

- [ ] Excluir `app/converter.py`.
- [ ] Buscar imports remanescentes de `app.converter`.
- [ ] Buscar implementações duplicadas de conversão fora de `app/converters/adapters/`.

**Validação:** as buscas não encontram referências ao módulo excluído nem conversões duplicadas.

**Dependência:** Task 8.

### Task 10 — Executar a regressão estrutural da migração

- [ ] Compilar o pacote `app`.
- [ ] Inspecionar as rotas registradas pela aplicação.
- [ ] Confirmar que URLs, tipos MIME e nomes de download não mudaram.
- [ ] Executar `git diff --check`.

**Validação:** somente o novo pacote de serviço, o import atualizado e a exclusão do legado fazem parte do diff.

**Dependência:** Task 9.

### Task 11 — Criar o commit da migração

- [ ] Revisar o diff completo do grupo.
- [ ] Criar o commit `chore(converters): complete adapter migration`.
- [ ] Confirmar o commit com `git show --stat --oneline HEAD`.

**Validação:** o segundo commit remove a duplicação sem introduzir a centralização completa planejada para o Grupo 4.

**Dependência:** Task 10.

## 4. Grupo 3 — Testes das rotas com adapters falsos

**Commit do grupo:** `chore(tests): cover conversion routes with fake adapters`

### Task 12 — Preparar as dependências de teste

- [ ] Criar `requirements-dev.txt` referenciando as dependências da aplicação.
- [ ] Adicionar versões compatíveis de `pytest` e `httpx`.
- [ ] Instalar as dependências no ambiente Python 3.10.
- [ ] Confirmar que `pytest --version` e a importação de `TestClient` funcionam.

**Validação:** uma instalação limpa de `requirements-dev.txt` disponibiliza o runner e o cliente HTTP de teste.

**Dependência:** Task 11.

### Task 13 — Criar a infraestrutura compartilhada de testes

- [ ] Criar `tests/__init__.py` somente se necessário para imports explícitos.
- [ ] Criar `tests/conftest.py` com o `TestClient` e isolamento por `tmp_path`.
- [ ] Impedir que testes escrevam no diretório `temp/` real.
- [ ] Definir mecanismo de restauração automática dos patches após cada teste.

**Validação:** um smoke test do cliente responde sem abrir porta de rede e sem criar arquivos em `temp/`.

**Dependência:** Task 12.

### Task 14 — Implementar os adapters falsos

- [ ] Criar `tests/fakes.py`.
- [ ] Implementar fake de PDF para DOCX.
- [ ] Implementar fake de DOCX para PDF.
- [ ] Implementar fake de PDF para SVG.
- [ ] Implementar fake de imagem para as duas direções.
- [ ] Fazer cada fake produzir bytes determinísticos e registrar suas chamadas.
- [ ] Permitir configurar sucesso ou falha sem usar bibliotecas externas.

**Validação:** os fakes respeitam os protocolos e criam somente os arquivos solicitados pelo teste.

**Dependência:** Task 13.

### Task 15 — Testar `POST /convert/pdf-to-docx`

- [ ] Substituir a factory pelo fake correspondente.
- [ ] Enviar um upload `.pdf` mínimo.
- [ ] Verificar HTTP 200, mídia DOCX e `Content-Disposition`.
- [ ] Verificar conteúdo, invocação do fake e limpeza dos temporários.

**Validação:** o teste passa sem executar `pdf2docx`.

**Dependência:** Task 14.

### Task 16 — Testar `POST /convert/docx-to-pdf`

- [ ] Substituir a factory pelo fake correspondente.
- [ ] Enviar um upload `.docx` mínimo.
- [ ] Verificar HTTP 200, mídia PDF e `Content-Disposition`.
- [ ] Verificar conteúdo, invocação do fake e limpeza dos temporários.

**Validação:** o teste passa sem executar LibreOffice.

**Dependência:** Task 14.

### Task 17 — Testar `POST /convert/pdf-to-svg`

- [ ] Substituir a factory pelo fake correspondente.
- [ ] Enviar um upload `.pdf` mínimo.
- [ ] Verificar HTTP 200, mídia SVG e `Content-Disposition`.
- [ ] Verificar conteúdo, invocação do fake e limpeza dos temporários.

**Validação:** o teste passa sem executar PyMuPDF.

**Dependência:** Task 14.

### Task 18 — Testar `POST /convert/jpg-to-png`

- [ ] Substituir a factory pelo fake de imagem.
- [ ] Enviar uploads `.jpg` e `.jpeg` em casos parametrizados.
- [ ] Verificar HTTP 200, mídia PNG e `Content-Disposition`.
- [ ] Verificar conteúdo, método chamado no fake e limpeza dos temporários.

**Validação:** os testes passam sem executar Pillow.

**Dependência:** Task 14.

### Task 19 — Testar `POST /convert/png-to-jpg`

- [ ] Substituir a factory pelo fake de imagem.
- [ ] Enviar um upload `.png` mínimo.
- [ ] Verificar HTTP 200, mídia JPEG e `Content-Disposition`.
- [ ] Verificar conteúdo, método chamado no fake e limpeza dos temporários.

**Validação:** o teste passa sem executar Pillow.

**Dependência:** Task 14.

### Task 20 — Testar validações de extensão

- [ ] Criar casos parametrizados para as cinco rotas.
- [ ] Enviar uma extensão não permitida para cada rota.
- [ ] Verificar HTTP 400 e a mensagem de erro correspondente.
- [ ] Confirmar que nenhum adapter é chamado e nenhum temporário é criado.

**Validação:** todos os contratos de rejeição passam de forma determinística.

**Dependência:** Tasks 15 a 19.

### Task 21 — Testar falhas de conversão

- [ ] Configurar um fake booleano para retornar falha.
- [ ] Configurar o fake de DOCX para PDF para retornar `None`.
- [ ] Verificar HTTP 500.
- [ ] Confirmar a remoção do upload e de qualquer saída parcial criada pelo fake.

**Validação:** nenhuma falha testada deixa resíduos no diretório isolado.

**Dependência:** Tasks 15 a 19.

### Task 22 — Consolidar e executar a suíte

- [ ] Remover duplicação nos testes por meio de fixtures e parametrização onde isso não prejudicar a leitura.
- [ ] Executar `pytest -q` mais de uma vez para detectar dependência de ordem ou resíduos.
- [ ] Confirmar que nenhuma engine externa foi acionada.
- [ ] Executar `git diff --check`.

**Validação:** a suíte completa passa repetidamente e não escreve no diretório temporário real.

**Dependência:** Tasks 20 e 21.

### Task 23 — Criar o commit dos testes

- [ ] Revisar o diff completo do grupo.
- [ ] Criar o commit `chore(tests): cover conversion routes with fake adapters`.
- [ ] Confirmar o commit com `git show --stat --oneline HEAD`.

**Validação:** o terceiro commit contém somente dependências e código de teste.

**Dependência:** Task 22.

## 5. Grupo 4 — Centralização do ciclo de arquivos temporários

**Commit do grupo:** `chore(api): centralize temporary file lifecycle`

### Task 24 — Definir o contrato do serviço temporário

- [ ] Criar a `dataclass` tipada para caminhos de entrada e saída.
- [ ] Definir a interface pública de alocação, persistência, remoção e agendamento.
- [ ] Fazer o serviço receber o diretório-base no construtor.
- [ ] Normalizar internamente caminhos com `pathlib.Path`.

**Validação:** a interface cobre todo o ciclo descrito no PRD sem conhecer adapters ou respostas HTTP.

**Dependência:** Task 23.

### Task 25 — Implementar criação e alocação de caminhos

- [ ] Garantir a criação idempotente do diretório-base.
- [ ] Normalizar extensões com ou sem ponto.
- [ ] Gerar um UUID por conversão.
- [ ] Produzir caminhos de entrada e saída com o mesmo identificador.
- [ ] Impedir que extensões introduzam componentes adicionais de caminho.

**Validação:** múltiplas alocações produzem pares únicos e contidos no diretório-base.

**Dependência:** Task 24.

### Task 26 — Implementar persistência assíncrona do upload

- [ ] Gravar `UploadFile` em blocos usando `aiofiles`.
- [ ] Evitar carregar todo o upload na memória.
- [ ] Garantir fechamento adequado do arquivo de destino.
- [ ] Propagar falhas de I/O para que a rota possa executar a limpeza.

**Validação:** uploads com mais de um bloco são gravados integralmente e falhas não deixam handles abertos.

**Dependência:** Task 25.

### Task 27 — Implementar limpeza imediata e pós-resposta

- [ ] Permitir a remoção idempotente de um ou mais caminhos.
- [ ] Ignorar com segurança arquivos que não chegaram a ser criados.
- [ ] Registrar tarefas de limpeza em `BackgroundTasks` no sucesso.
- [ ] Disponibilizar limpeza imediata para exceções e retornos de erro.

**Validação:** arquivos permanecem disponíveis durante a resposta e são removidos ao final; erros removem resíduos imediatamente.

**Dependência:** Task 26.

### Task 28 — Centralizar a configuração do diretório temporário

- [ ] Criar uma única instância ou provider do serviço usado pelas rotas.
- [ ] Remover fontes duplicadas de configuração de `TEMP_FOLDER`.
- [ ] Preservar a criação do diretório durante a inicialização da aplicação.
- [ ] Manter o diretório injetável ou substituível nos testes.

**Validação:** produção e testes escolhem o diretório sem alterar constantes em múltiplos módulos.

**Dependência:** Task 27.

### Task 29 — Migrar a rota PDF para DOCX

- [ ] Substituir UUID, caminhos, upload e limpeza manuais pelo serviço.
- [ ] Preservar validação, adapter, resposta e mensagens de erro.
- [ ] Executar o teste específico da rota.

**Validação:** o teste passa e a rota não contém lógica manual do ciclo temporário.

**Dependência:** Task 28.

### Task 30 — Migrar a rota DOCX para PDF

- [ ] Substituir UUID, caminhos, upload e limpeza manuais pelo serviço.
- [ ] Adaptar a chamada que fornece uma pasta de saída ao LibreOffice.
- [ ] Preservar resposta e mensagens de erro.
- [ ] Executar o teste específico da rota.

**Validação:** o teste passa e o caminho retornado pelo adapter permanece sob gestão do serviço.

**Dependência:** Task 29.

### Task 31 — Migrar a rota PDF para SVG

- [ ] Substituir UUID, caminhos, upload e limpeza manuais pelo serviço.
- [ ] Preservar validação, adapter, resposta e mensagens de erro.
- [ ] Executar o teste específico da rota.

**Validação:** o teste passa e a rota não contém lógica manual do ciclo temporário.

**Dependência:** Task 30.

### Task 32 — Migrar a rota JPG/JPEG para PNG

- [ ] Substituir UUID, caminhos, upload e limpeza manuais pelo serviço.
- [ ] Preservar suporte a `.jpg` e `.jpeg`.
- [ ] Preservar resposta e mensagens de erro.
- [ ] Executar os testes específicos da rota.

**Validação:** ambos os casos passam e a rota não contém lógica manual do ciclo temporário.

**Dependência:** Task 31.

### Task 33 — Migrar a rota PNG para JPG

- [ ] Substituir UUID, caminhos, upload e limpeza manuais pelo serviço.
- [ ] Preservar validação, adapter, resposta e mensagens de erro.
- [ ] Executar o teste específico da rota.

**Validação:** o teste passa e nenhuma das cinco rotas mantém lógica manual duplicada.

**Dependência:** Task 32.

### Task 34 — Testar diretamente o serviço temporário

- [ ] Testar normalização das extensões.
- [ ] Testar unicidade em várias alocações consecutivas.
- [ ] Testar contenção dos caminhos no diretório-base.
- [ ] Testar persistência em múltiplos blocos.
- [ ] Testar remoção idempotente.
- [ ] Testar limpeza de arquivo parcial após falha simulada.

**Validação:** as garantias do serviço são verificadas sem passar pelas rotas HTTP.

**Dependência:** Tasks 27 e 33.

### Task 35 — Executar regressão e revisar duplicação

- [ ] Executar toda a suíte com `pytest -q` pelo menos duas vezes.
- [ ] Buscar geração manual de UUID nas rotas.
- [ ] Buscar gravações `open(..., "wb")` nas rotas.
- [ ] Confirmar que existe uma única configuração de diretório temporário.
- [ ] Revisar status, mídia, nome de download e conteúdo das cinco respostas.
- [ ] Executar `git diff --check`.

**Validação:** todos os critérios do Grupo 4 e os testes do Grupo 3 passam sem regressão.

**Dependência:** Task 34.

### Task 36 — Criar o commit da centralização

- [ ] Revisar o diff completo do grupo.
- [ ] Criar o commit `chore(api): centralize temporary file lifecycle`.
- [ ] Confirmar o commit com `git show --stat --oneline HEAD`.

**Validação:** o quarto commit contém o serviço completo, a migração das rotas e os testes específicos do serviço.

**Dependência:** Task 35.

## 6. Encerramento do PRD

### Task 37 — Executar a validação final

- [ ] Executar a suíte completa em Python 3.10.
- [ ] Importar a aplicação e listar as rotas registradas.
- [ ] Confirmar que não há caches ou ambientes virtuais rastreados.
- [ ] Confirmar que `app/converter.py` não existe.
- [ ] Confirmar que as cinco rotas usam adapters e o serviço temporário.
- [ ] Confirmar que o working tree está limpo.

**Validação:** todos os itens da definição de pronto do PRD foram atendidos.

**Dependência:** Task 36.

### Task 38 — Auditar a série de commits

- [ ] Confirmar que existem exatamente os quatro commits estruturais planejados.
- [ ] Confirmar a ordem e as mensagens Conventional Commits.
- [ ] Revisar o conteúdo de cada commit isoladamente.
- [ ] Registrar qualquer desvio técnico aprovado durante a implementação.

**Validação:** o histórico apresenta uma evolução compreensível, reversível por etapa e alinhada ao PRD.

**Dependência:** Task 37.

## 7. Ordem resumida

| Faixa | Resultado | Commit associado |
| --- | --- | --- |
| Tasks 1–5 | Repositório sem artefatos gerados | `chore(repo): ignore generated Python artifacts` |
| Tasks 6–11 | Migração para adapters concluída | `chore(converters): complete adapter migration` |
| Tasks 12–23 | Cinco rotas protegidas por testes com fakes | `chore(tests): cover conversion routes with fake adapters` |
| Tasks 24–36 | Ciclo temporário centralizado | `chore(api): centralize temporary file lifecycle` |
| Tasks 37–38 | PRD validado e histórico auditado | Sem novo commit |
