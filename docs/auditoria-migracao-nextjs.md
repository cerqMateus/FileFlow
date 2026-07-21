# Auditoria da migração para Next.js

## Estado em 21 de julho de 2026

Os Grupos 1–13 foram incorporados e substituíram integralmente o frontend Jinja2 pelo frontend Next.js. O responsável decidiu adiar o Grupo 14, portanto imagens independentes de frontend/backend, proxy reverso e `compose.yaml` não fazem parte do estado atual.

Esta auditoria executa o escopo possível do Grupo 15 sem antecipar a conclusão do PRD. O status permanece **Em andamento — Grupo 14 adiado**.

## Resultado funcional

- o FastAPI expõe somente as cinco rotas de conversão e as quatro rotas técnicas de OpenAPI/Swagger;
- o Next.js expõe a home, os cinco pares suportados e uma página 404 para pares desconhecidos;
- há exatamente um catálogo visual com cinco conversores;
- o navegador usa uma única função de transporte e envia `multipart/form-data` diretamente ao FastAPI;
- sucesso, download desktop/mobile, erro FastAPI, recuperação e bloqueio de reenvio estão cobertos;
- não foram adicionados autenticação, histórico, preview, batch, novos conversores ou outras funcionalidades adiadas.

## Auditoria de ausência de redundância

As buscas foram executadas em `backend/` e `frontend/src/`, excluindo dependências e artefatos gerados.

| Verificação | Resultado |
| --- | --- |
| `templates/`, `static/`, `Jinja2Templates`, `StaticFiles` e `CONVERTER_CONFIG` | ausentes do código executável; existe apenas uma referência negativa no teste de ausência |
| `window.converterConfig` e Tailwind CDN | ausentes |
| Route Handlers e Server Actions de conversão | ausentes |
| Pacote Python executável | somente `backend/app/` |
| Catálogo visual | somente `frontend/src/features/conversion/config/converters.ts`, com cinco entradas |
| Transporte HTTP | somente `frontend/src/features/conversion/api/convert-file.ts` chama `fetch` |
| Implementação de download | somente `frontend/src/features/conversion/browser/download.ts` cria e aciona o anchor |
| Pastas genéricas `utils`, `helpers`, `common`, `shared` ou `services` no frontend | ausentes |
| `any` explícito no código da aplicação | ausente |

Os testes de arquitetura e o lint continuam protegendo as fronteiras públicas da feature e impedindo imports profundos indevidos.

## Paridade e contratos

O catálogo atual mantém os textos, ícones, ordem, URLs e cinco pares registrados em `docs/baselines/frontend-legado.md`. A suíte visual valida a composição desktop de quatro cards na primeira linha, a composição mobile de uma coluna e os estados estáveis do conversor. As capturas são efêmeras e nenhum PNG é versionado, conforme decisão explícita do responsável no Grupo 13.

Os cinco endpoints preservam método `POST`, campo multipart `file`, extensões, status HTTP, MIME binário, `Content-Disposition` e erro `{"detail": string}`. A suíte rápida intercepta e valida todos os contratos; o smoke usa uma entrada inválida determinística para alcançar o FastAPI real sem acionar engine externa.

## Gates executados

| Gate | Resultado |
| --- | --- |
| `pip check` no ambiente Python 3.10 existente | aprovado |
| Backend, primeira passagem | 52/52 testes |
| Backend, segunda passagem | 52/52 testes |
| `npm ci` pelo lockfile | aprovado; 482 pacotes instalados |
| Lint frontend | aprovado, zero warnings |
| TypeScript | aprovado |
| Testes frontend | 49/49 testes |
| Coverage frontend | 89,61% statements; 81% branches; 97,36% functions; 89,54% lines |
| Build Next.js de produção | aprovado; oito páginas estáticas geradas |
| E2E rápido, primeira passagem | 8/8 cenários |
| E2E rápido, segunda passagem | 8/8 cenários |
| Smoke Next.js ↔ FastAPI | 1/1 cenário |
| Auditoria visual desktop/mobile | 4/4 cenários |
| `git diff --check` | aprovado |

O `npm ci` reportou duas vulnerabilidades moderadas já conhecidas; nenhuma correção forçada ou atualização fora do escopo foi aplicada.

## Gates não concluídos

### Instalação Python limpa

Foi criado um ambiente descartável Python 3.10 e iniciado `pip install -r backend/requirements-dev.txt`. O download das versões fixadas funcionou, mas a instalação parou com `No space left on device`. O ambiente descartável foi removido. Como fallback, `pip check` e os testes foram executados no ambiente Python 3.10 existente e passaram.

Uma tentativa anterior com o Python global 3.14 também demonstrou que `numpy==2.2.6` não possui wheel compatível nesse runtime. Por isso, o README agora exige Python 3.10.x.

### Containers e topologia de produção

Por decisão do responsável, o Grupo 14 foi adiado. Não foram executados:

- build das imagens de frontend e backend;
- proxy reverso para `/convert/*`;
- `compose.yaml` e seus healthchecks;
- E2E através de uma entrada pública composta;
- inspeção de tamanho e conteúdo das imagens.

O repositório contém apenas o Dockerfile histórico do backend. Ele não representa a implantação completa do produto.

## Rastreabilidade

| Etapa | PR | Situação |
| --- | --- | --- |
| Base estrutural anterior | [#1](https://github.com/cerqMateus/FileFlow/pull/1) | incorporado |
| Grupo 1 — planejamento | [#2](https://github.com/cerqMateus/FileFlow/pull/2) | incorporado |
| Grupo 2 — workspace backend | [#3](https://github.com/cerqMateus/FileFlow/pull/3) | incorporado |
| Grupo 3 — rotas backend | [#4](https://github.com/cerqMateus/FileFlow/pull/4) | incorporado |
| Grupo 4 — scaffold frontend | [#5](https://github.com/cerqMateus/FileFlow/pull/5) | incorporado |
| Grupo 5 — catálogo tipado | [#6](https://github.com/cerqMateus/FileFlow/pull/6) | incorporado |
| Grupo 6 — home | [#7](https://github.com/cerqMateus/FileFlow/pull/7) | incorporado |
| Grupo 7 — página de conversão | [#8](https://github.com/cerqMateus/FileFlow/pull/8) | incorporado |
| Grupo 8 — fluxo interativo | [#9](https://github.com/cerqMateus/FileFlow/pull/9) | incorporado |
| Grupo 9 — testes de páginas | [#10](https://github.com/cerqMateus/FileFlow/pull/10) | incorporado |
| Grupo 10 — testes de conversão | [#11](https://github.com/cerqMateus/FileFlow/pull/11) | incorporado |
| Grupo 11 — CORS | [#12](https://github.com/cerqMateus/FileFlow/pull/12) | incorporado |
| Grupo 12 — remoção do legado | [#13](https://github.com/cerqMateus/FileFlow/pull/13) | incorporado |
| Grupo 13 — E2E | [#14](https://github.com/cerqMateus/FileFlow/pull/14) | incorporado |
| Grupo 14 — containers e proxy | — | adiado por decisão do responsável |

## Pendências para concluir o PRD

1. Executar o Grupo 14 em ambiente com Docker disponível.
2. Repetir a instalação Python limpa em volume com espaço suficiente.
3. Construir e inspecionar as duas imagens sem cache.
4. Validar proxy, Compose, resposta binária e E2E pela entrada pública.
5. Somente então alterar o PRD para `Concluído` e fechar os itens finais do backlog.
