# PRD técnico — Separação do frontend e migração para Next.js

## 1. Identificação

- **Status:** Em andamento — Grupo 14 adiado
- **Data:** 20 de julho de 2026
- **Última auditoria:** 21 de julho de 2026
- **Tipo:** Refatoração arquitetural
- **Objetivo:** separar integralmente frontend e backend e substituir o frontend Jinja2/HTML/JavaScript por uma aplicação Next.js tipada, organizada e testável
- **Escopo da entrega:** reorganização física do repositório, criação do frontend Next.js, adaptação operacional do FastAPI para atuar somente como API e remoção completa do frontend legado
- **Estratégia:** migração incremental orientada por paridade, com remoção do legado antes da conclusão

## 2. Contexto

Antes desta migração, o FileFlow utilizava uma única aplicação FastAPI para duas responsabilidades diferentes:

1. expor cinco endpoints de conversão de arquivos;
2. renderizar a interface por meio de Jinja2, servir JavaScript estático e manter metadados de apresentação.

Na implementação legada, as rotas de conversão conviviam com `StaticFiles`, `Jinja2Templates`, o catálogo visual `CONVERTER_CONFIG` e as rotas HTML. Esse frontend distribuído entre `templates/` e `static/` foi removido nos Grupos 6–12 e permanece disponível somente no histórico Git e no baseline textual.

A refatoração estrutural anterior consolidou os adapters, os testes dos contratos HTTP e o ciclo de vida dos arquivos temporários. Essa base permite agora extrair a interface sem reimplementar a lógica de conversão.

Esta entrega deverá alterar a arquitetura, mas não o produto percebido pelo usuário.

## 3. Objetivos

1. Transformar o FastAPI em um backend exclusivamente orientado a API.
2. Criar um frontend independente com Next.js, App Router e TypeScript estrito.
3. Preservar a aparência, os textos, as URLs de navegação e os cinco fluxos existentes.
4. Remover completamente os templates, scripts e integrações do frontend legado.
5. Organizar o frontend por funcionalidade, com dependências direcionais e responsabilidades explícitas.
6. Manter os contratos HTTP atuais protegidos pelos testes existentes.
7. Adicionar validações automatizadas de tipos, lint, build e comportamento do novo frontend.
8. Permitir desenvolvimento e implantação separados para frontend e backend.

## 4. Não objetivos

Esta entrega não deverá:

- alterar layout, identidade visual, textos ou responsividade intencionalmente;
- adicionar conversores, formatos ou processamento em lote;
- adicionar autenticação, histórico, preview, banco de dados ou armazenamento externo;
- alterar o comportamento das engines de conversão;
- introduzir fila de jobs, workers ou acompanhamento de progresso;
- versionar ou redesenhar os endpoints de conversão;
- criar um endpoint de descoberta de conversores;
- padronizar um novo formato de erro do backend;
- adicionar estado global sem necessidade demonstrada;
- manter o frontend antigo como fallback;
- usar Route Handlers ou Server Actions do Next.js como uma segunda API de conversão.

Melhorias identificadas durante a implementação deverão ser registradas em backlog separado.

## 5. Baseline funcional a preservar

### 5.1. Rotas da interface

| URL | Comportamento atual |
| --- | --- |
| `GET /` | Exibe a página inicial com os cinco conversores |
| `GET /converter/pdf/docx` | Exibe o fluxo PDF para Word |
| `GET /converter/docx/pdf` | Exibe o fluxo Word para PDF |
| `GET /converter/pdf/svg` | Exibe o fluxo PDF para SVG |
| `GET /converter/jpg/png` | Exibe o fluxo JPG para PNG |
| `GET /converter/png/jpg` | Exibe o fluxo PNG para JPG |
| Par não suportado | Exibe uma resposta/página 404 |

### 5.2. Contratos da API

| Endpoint | Entrada | Saída de sucesso |
| --- | --- | --- |
| `POST /convert/pdf-to-docx` | `.pdf` | DOCX |
| `POST /convert/docx-to-pdf` | `.docx` | PDF |
| `POST /convert/pdf-to-svg` | `.pdf` | SVG |
| `POST /convert/jpg-to-png` | `.jpg` ou `.jpeg` | PNG |
| `POST /convert/png-to-jpg` | `.png` | JPEG |

Os endpoints, o campo multipart `file`, os status HTTP, os tipos MIME, os arquivos retornados e o formato atual de erro `{"detail": string}` deverão permanecer compatíveis.

### 5.3. Comportamento da interface

- mostrar os mesmos cinco cards na página inicial;
- navegar para as mesmas URLs de conversão;
- permitir a seleção de um arquivo compatível;
- bloquear reenvio enquanto a conversão estiver em andamento;
- mostrar os estados atuais de processamento, sucesso e erro;
- iniciar o download após uma conversão bem-sucedida;
- manter o link de download visível usado atualmente em dispositivos móveis;
- gerar o nome de download a partir do nome original com o sufixo `_convertido`;
- voltar à página inicial pelo link existente.

## 6. Arquitetura desejada

### 6.1. Estrutura de alto nível

```text
FileFlow/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── converters/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── config/
│   │   ├── features/
│   │   └── lib/
│   ├── tests/
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   └── Dockerfile
├── docs/
├── compose.yaml
└── README.md
```

Frontend e backend continuarão no mesmo repositório, mas deverão ser aplicações independentes. Cada aplicação terá dependências, comandos, testes, configuração e imagem de container próprios.

### 6.2. Responsabilidades

| Componente | Responsabilidade |
| --- | --- |
| `backend/app/main.py` | construir e configurar a aplicação FastAPI |
| `backend/app/api/` | definir o contrato HTTP e coordenar conversões |
| `backend/app/converters/` | integrar as engines por meio dos adapters |
| `backend/app/services/` | gerenciar serviços internos, incluindo arquivos temporários |
| `frontend/src/app/` | definir rotas, layouts, metadados e composição de páginas |
| `frontend/src/features/conversion/` | conter catálogo, estados, API e componentes específicos de conversão |
| `frontend/src/components/ui/` | conter componentes visuais reutilizáveis e sem regras de conversão |
| `frontend/src/lib/` | conter infraestrutura pequena e transversal, como HTTP e download |
| `frontend/src/config/` | validar configuração e variáveis de ambiente |

### 6.3. Topologia HTTP

No desenvolvimento:

- Next.js e FastAPI poderão executar em portas diferentes;
- o navegador enviará o upload diretamente ao FastAPI;
- o backend aceitará somente origens explicitamente configuradas por CORS;
- a URL pública do backend será validada a partir de variável de ambiente.

Em produção:

- um proxy reverso deverá direcionar as páginas ao frontend e `/convert/*` diretamente ao backend;
- o upload não deverá atravessar uma Route Handler do Next.js;
- a topologia deverá preservar as URLs públicas atuais;
- frontend e backend deverão executar como processos independentes.

## 7. Arquitetura do frontend

### 7.1. Organização por funcionalidade

```text
frontend/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── not-found.tsx
│   ├── globals.css
│   └── converter/
│       └── [fromFormat]/
│           └── [toFormat]/
│               └── page.tsx
├── features/
│   └── conversion/
│       ├── api/
│       │   └── convert-file.ts
│       ├── components/
│       ├── config/
│       │   └── converters.ts
│       ├── model/
│       ├── types/
│       └── index.ts
├── components/
│   └── ui/
├── config/
│   └── env.ts
└── lib/
    ├── download/
    └── http/
```

As páginas do App Router deverão ser finas: validam parâmetros de rota, selecionam a configuração correspondente e compõem componentes da feature. Estados, chamadas HTTP e manipulação de downloads não deverão ser implementados diretamente em `page.tsx`.

### 7.2. Regras de dependência

O fluxo permitido será:

```text
app -> features -> components/lib/config
```

Regras obrigatórias:

- módulos compartilhados não poderão importar código de `app` ou de uma feature;
- a feature de conversão exporá uma API pública explícita por `index.ts`;
- consumidores não importarão detalhes internos da feature por caminhos profundos;
- não serão criadas pastas globais vagas como `common`, `helpers` ou um único `utils.ts` genérico;
- arquivos deverão permanecer coesos e pequenos o suficiente para possuir uma responsabilidade identificável;
- abstrações sem consumidor real ou destinadas apenas a uma possível evolução futura não serão adicionadas;
- aliases de importação deverão ser configurados e consistentes;
- regras relevantes deverão ser verificadas por lint, e não depender apenas de convenção documental.

### 7.3. Server e Client Components

- layouts e páginas permanecerão Server Components por padrão;
- a diretiva `"use client"` será aplicada no menor limite interativo possível;
- seleção de arquivo, submissão, estado da conversão e download ficarão em um Client Component dedicado;
- catálogo, textos e composição estática não deverão aumentar desnecessariamente o bundle do cliente;
- módulos que acessam `window`, `navigator`, `File` ou `URL.createObjectURL` deverão permanecer no limite cliente;
- valores exclusivos do servidor não poderão ser importados por componentes cliente.

### 7.4. Catálogo de conversores

Os metadados atualmente mantidos em `CONVERTER_CONFIG` deverão existir uma única vez no frontend, em um catálogo tipado e imutável. Cada item conterá somente dados necessários à interface, como:

- formatos de origem e destino;
- labels;
- título;
- descrição;
- ícone;
- extensões aceitas;
- endpoint existente;
- extensão usada no download.

O backend não manterá títulos, ícones, descrições ou configuração de navegação. A API continuará sendo a autoridade sobre a validação e a conversão; a validação equivalente no navegador será apenas feedback antecipado ao usuário.

### 7.5. Estado da conversão

O estado deverá ser modelado como união discriminada, evitando combinações inválidas de booleanos:

```ts
type ConversionState =
  | { status: "idle" }
  | { status: "selected"; file: File }
  | { status: "converting"; file: File }
  | { status: "success"; filename: string; downloadUrl?: string }
  | { status: "error"; message: string };
```

A implementação final poderá ajustar os campos, desde que continue tornando estados incompatíveis irrepresentáveis.

### 7.6. Cliente HTTP e downloads

- haverá uma única função responsável por montar `FormData` e chamar a API;
- respostas não bem-sucedidas deverão interpretar com segurança o formato atual `detail` e possuir fallback para respostas inválidas;
- a resposta binária será tratada como `Blob`;
- URLs criadas por `URL.createObjectURL` deverão ser revogadas de maneira determinística;
- o cliente deverá preservar o comportamento móvel e desktop existente;
- componentes visuais não montarão endpoints nem interpretarão respostas HTTP diretamente;
- não será introduzido um estado global ou uma biblioteca de cache remoto para este fluxo isolado.

## 8. Tipagem e qualidade estática

### 8.1. TypeScript

O frontend deverá usar TypeScript sem arquivos JavaScript de aplicação. O `tsconfig.json` deverá habilitar, no mínimo:

- `strict`;
- `noUncheckedIndexedAccess`;
- `exactOptionalPropertyTypes`;
- `noImplicitOverride`;
- `noFallthroughCasesInSwitch`;
- `noUncheckedSideEffectImports` quando compatível com a versão selecionada;
- alias `@/*` para `src/*`.

Também serão obrigatórios:

- ausência de `any` explícito no código da aplicação;
- ausência de type assertions usadas apenas para silenciar erros;
- validação de valores externos antes de tratá-los como tipos internos;
- formatos e pares de conversão representados por unions literais;
- verificações exaustivas em estados e variantes;
- `typedRoutes` habilitado no Next.js;
- variáveis de ambiente acessadas por um módulo validado e tipado.

### 8.2. Contrato com o backend

O OpenAPI produzido pelo FastAPI será a referência do contrato HTTP. Nesta etapa, a geração automática de um cliente completo será adotada somente se puder ocorrer de forma determinística e sem alterar a API.

No mínimo, o frontend deverá:

- tipar o corpo de erro atual;
- limitar endpoints aos cinco valores válidos;
- manter testes de integração que detectem divergências de rota, campo multipart e tipo de resposta;
- documentar o comando usado para atualizar qualquer artefato gerado;
- impedir edição manual de arquivos gerados, caso existam.

Tipos de apresentação, estados da interface e objetos do navegador não deverão ser colocados no OpenAPI nem compartilhados artificialmente com Python.

### 8.3. Dependências e versões

- Next.js, React, TypeScript e ferramentas deverão usar versões estáveis e mutuamente suportadas no início da implementação;
- as versões resolvidas deverão ser fixadas por `package-lock.json`;
- o projeto utilizará uma versão LTS do Node.js registrada na configuração do repositório e no campo `engines`;
- dependências deverão ser adicionadas somente com justificativa concreta;
- o frontend não adotará Redux ou biblioteca equivalente nesta etapa;
- Tailwind CSS será instalado como dependência de build, substituindo o CDN atual;
- a fonte Inter deverá ser integrada pelo mecanismo do Next.js sem alterar os pesos visuais existentes.

## 9. Alterações no backend

### 9.1. Backend somente API

Deverão ser removidos do backend:

- imports de `Request`, `StaticFiles` e `Jinja2Templates` quando não houver outro consumidor;
- montagem de `/static`;
- configuração de templates;
- `CONVERTER_CONFIG`;
- handlers HTML de `/` e `/converter/{from_format}/{to_format}`;
- dependências Jinja2 e MarkupSafe quando deixarem de ser transitivamente necessárias;
- qualquer texto ou metadado pertencente exclusivamente à interface.

As cinco rotas de conversão e o serviço de arquivos temporários deverão preservar seu comportamento.

### 9.2. Reorganização física

O pacote Python, os testes e os arquivos de dependência serão movidos para `backend/`. A mudança deverá:

- preservar imports internos claros e absolutos;
- ajustar comandos de desenvolvimento, testes e container;
- manter testes determinísticos e independentes das engines reais;
- não duplicar temporariamente módulos Python na raiz e em `backend/` na entrega final;
- atualizar todos os caminhos documentados e automatizados.

### 9.3. CORS e configuração

- origens permitidas serão fornecidas por configuração explícita;
- curingas não serão usados em produção;
- a configuração terá um exemplo versionado, sem segredos;
- CORS será aplicado apenas ao necessário para o frontend separado;
- testes deverão cobrir ao menos uma origem permitida e uma origem não permitida.

## 10. Remoção do frontend legado

A migração só estará concluída quando não existirem:

- `templates/home.html`;
- `templates/converter.html`;
- `templates/index.html`;
- `static/script.js`;
- diretórios `templates/` e `static/` vazios;
- referências a Jinja2 ou `StaticFiles` no código da aplicação;
- `window.converterConfig`;
- Tailwind carregado por CDN;
- uma segunda implementação dos cinco fluxos fora do Next.js.

Não será aceito manter arquivos antigos “por segurança”. A segurança da migração deverá vir dos testes, do histórico Git e da validação de paridade.

## 11. Testes e validação

### 11.1. Backend

- mover e manter verdes todos os testes existentes;
- preservar testes dos cinco endpoints de sucesso;
- preservar rejeição de extensões inválidas e falhas dos adapters;
- manter testes do ciclo de arquivos temporários;
- adicionar cobertura da configuração de CORS;
- confirmar que nenhuma rota HTML ou montagem estática permanece registrada.

### 11.2. Frontend

Testes automatizados deverão cobrir:

- renderização dos cinco cards;
- links para todas as URLs suportadas;
- resolução de cada par de formatos;
- 404 para um par inválido;
- seleção de extensões aceitas, incluindo `.jpeg` no fluxo JPG;
- estado de processamento e bloqueio de reenvio;
- sucesso, erro JSON conhecido e erro HTTP não estruturado;
- construção correta do multipart com o campo `file`;
- download em desktop;
- link de download no comportamento móvel;
- revogação da object URL;
- restauração da interface após sucesso ou falha.

### 11.3. End-to-end

Uma suíte mínima deverá validar no navegador:

1. acesso à home;
2. navegação para um conversor;
3. seleção e envio de arquivo;
4. chamada ao endpoint correto;
5. feedback de sucesso e início do download;
6. feedback de erro retornado pela API.

Os testes E2E poderão interceptar a conversão para permanecer rápidos e determinísticos. A integração real entre os dois processos deverá possuir ao menos um smoke test separado, sem exigir as engines reais no conjunto rápido.

### 11.4. Gates obrigatórios

Antes da conclusão deverão passar:

- testes Python;
- lint Python já adotado, caso existente;
- testes do frontend;
- lint do frontend;
- verificação TypeScript sem emissão;
- build de produção do Next.js;
- testes E2E definidos para a migração;
- build das imagens de frontend e backend;
- `git diff --check`.

## 12. Estratégia de migração

A implementação deverá seguir esta ordem lógica:

1. registrar o baseline visual, funcional, HTTP e de rotas;
2. criar a separação física do backend sem alterar comportamento;
3. criar o esqueleto tipado do Next.js e seus gates de qualidade;
4. implementar o catálogo tipado e as rotas de página;
5. reproduzir a home com paridade visual;
6. reproduzir o fluxo compartilhado de conversão;
7. integrar diretamente o navegador ao FastAPI;
8. adicionar testes de frontend e E2E;
9. configurar execução conjunta e containers independentes;
10. remover integralmente o frontend legado do backend;
11. remover dependências e configurações obsoletas;
12. executar auditoria final de paridade e ausência de duplicação.

Os commits deverão ser pequenos, funcionais e reversíveis. O plano detalhado e a divisão exata dos commits serão definidos em um documento de tasks posterior.

## 13. Critérios de aceite

### 13.1. Separação

- frontend e backend existem em diretórios próprios;
- cada aplicação pode instalar dependências, testar, executar e gerar build independentemente;
- FastAPI não renderiza páginas HTML do produto nem serve assets do frontend;
- Next.js não implementa ou intermedeia a conversão no servidor;
- o navegador envia arquivos diretamente ao backend.

### 13.2. Paridade

- as seis URLs de interface mantêm o comportamento esperado;
- os cinco conversores mantêm textos, ícones e aparência equivalente ao baseline;
- upload, estados, erros e downloads preservam o comportamento atual;
- os cinco contratos de API permanecem compatíveis;
- nenhuma funcionalidade nova aparece na interface.

### 13.3. Organização e tipos

- TypeScript estrito passa sem erros;
- não existe `any` explícito no código da aplicação;
- páginas não contêm lógica de transporte HTTP ou download;
- existe um único catálogo de apresentação dos conversores;
- dependências respeitam as direções definidas;
- Client Components estão limitados às fronteiras interativas;
- rotas internas do Next.js são tipadas;
- configuração pública é validada e não contém segredos.

### 13.4. Ausência de redundância

- `templates/` e `static/` foram removidos;
- Jinja2, `StaticFiles` e `CONVERTER_CONFIG` não permanecem no backend;
- não existem duas implementações da home ou do conversor;
- não existem cópias do pacote Python na raiz e em `backend/`;
- nenhuma dependência obsoleta permanece declarada diretamente;
- buscas automatizadas confirmam a ausência das referências legadas.

### 13.5. Qualidade operacional

- todos os gates da seção 11.4 passam;
- os serviços executam juntos no ambiente local documentado;
- CORS funciona apenas para origens configuradas;
- os containers de frontend e backend são construídos separadamente;
- README e documentação refletem somente a arquitetura nova;
- o working tree termina limpo.

## 14. Definição de pronto

Esta entrega estará concluída quando:

- o novo frontend Next.js substituir integralmente o frontend Jinja2;
- não houver mudança funcional ou visual intencional;
- o backend expuser apenas API e documentação técnica própria;
- todo código legado do frontend tiver sido removido;
- frontend e backend forem aplicações fisicamente independentes;
- os cinco fluxos funcionarem de ponta a ponta;
- testes, lint, tipos, builds e containers passarem;
- a ausência de redundância tiver sido auditada;
- documentação e comandos de execução estiverem atualizados.

## 15. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Migração alterar discretamente a interface | Registrar baseline e usar comparações visuais nas páginas principais |
| Next.js concentrar lógica em `app/` | Manter páginas finas e impor arquitetura por feature com lint |
| Uso excessivo de Client Components | Aplicar `"use client"` somente no limite interativo e revisar o bundle |
| Contratos Python e TypeScript divergirem | Tratar OpenAPI como referência e testar a integração multipart/binária |
| Upload ser duplicado por proxy do Next.js | Enviar o arquivo diretamente ao FastAPI |
| Configuração pública ficar congelada incorretamente no build | Documentar o comportamento de `NEXT_PUBLIC_*` e validar a estratégia por ambiente |
| CORS permissivo demais | Usar allowlist configurável e testes positivos e negativos |
| Frontend legado permanecer como fallback oculto | Incluir buscas de ausência e exclusão integral na definição de pronto |
| Reorganização quebrar imports ou Docker | Separar a movimentação física da migração visual e validar cada aplicação isoladamente |
| Abstrações prematuras aumentarem a complexidade | Exigir responsabilidade e consumidor concretos para cada abstração |
| Testes E2E dependerem de engines pesadas | Interceptar conversões na suíte rápida e manter smoke de integração separado |

## 16. Decisões adiadas

Ficam explicitamente para entregas posteriores:

- redesenho visual e criação de design system abrangente;
- novo contrato versionado em `/api/v1`;
- geração obrigatória de um SDK completo a partir do OpenAPI;
- progresso real de upload ou conversão;
- fila de jobs e processamento assíncrono externo;
- histórico e autenticação;
- analytics, telemetria de produto e SEO avançado;
- múltiplos idiomas;
- gerenciamento de estado global;
- monorepo tooling adicional além do necessário para as duas aplicações atuais.

## 17. Referências técnicas

- [Next.js — Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js — `use client`](https://nextjs.org/docs/app/api-reference/directives/use-client)
- [Next.js — Typed Routes](https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes)
- [Next.js — Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables)
- [Next.js — Self-hosting](https://nextjs.org/docs/app/guides/self-hosting)

## 18. Resultado esperado

Ao final, o FileFlow terá duas aplicações claramente delimitadas: um backend FastAPI responsável apenas por conversão e contratos HTTP e um frontend Next.js responsável apenas pela experiência do usuário. A interface permanecerá funcionalmente equivalente, enquanto a base passará a oferecer tipagem estrita, organização por funcionalidade, testes próprios, builds independentes e ausência completa do frontend legado.

## 19. Estado da execução

Em 21 de julho de 2026, os Grupos 1–13 estavam incorporados. O backend atua somente como API, o frontend Next.js substituiu integralmente o Jinja2 e os cinco fluxos possuem cobertura unitária, de integração, end-to-end e visual controlada.

O responsável decidiu adiar o Grupo 14. Por isso, ainda não existem imagem independente do frontend, proxy reverso ou `compose.yaml`, e os gates de container/topologia da seção 11.4 não foram executados. Esta lacuna impede que o status seja alterado para `Concluído` e que a definição de pronto da seção 14 seja considerada integralmente atendida.

O Grupo 15 atualizou a documentação do runtime local, auditou ausência de redundância e repetiu todos os gates não relacionados a containers. O relatório detalhado, os resultados, os desvios e a rastreabilidade estão em [`docs/auditoria-migracao-nextjs.md`](auditoria-migracao-nextjs.md).
