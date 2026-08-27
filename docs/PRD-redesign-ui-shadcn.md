# PRD — Redesign da interface com Tailwind CSS e shadcn/ui

## 1. Identificação

- **Status:** Proposto
- **Data:** 29 de julho de 2026
- **Tipo:** Redesign de produto e evolução do design system
- **Produto:** FileFlow
- **Área afetada:** frontend Next.js
- **Responsável de produto:** a definir
- **Objetivo:** substituir a apresentação atual por uma experiência coesa, arredondada, acessível e responsiva, preservando autenticação, rotas, contratos de conversão e downloads existentes
- **Estratégia:** implantação incremental por fundação visual, componentes compartilhados e páginas, com testes de regressão a cada etapa
- **Especificação:** [SPEC técnica do redesign](SPEC-redesign-ui-shadcn.md)
- **Execução:** [Backlog sequencial do redesign](TASKS-redesign-ui-shadcn.md)

## 2. Resumo executivo

O FileFlow já possui frontend Next.js, Tailwind CSS 4, autenticação com Better Auth e cinco fluxos de conversão integrados diretamente ao FastAPI. A interface atual é funcional, porém usa estilos utilitários ad hoc, emojis como ícones, componentes HTML repetidos e não possui um design system explícito.

Esta entrega criará uma nova identidade visual e aplicará shadcn/ui como fonte de componentes acessíveis e customizáveis. A linguagem aprovada é clara, amigável e arredondada, com azul como cor principal, violeta e ciano como acentos e uma marca composta por três formas triangulares arredondadas em progressão crescente, representando fluxo contínuo.

O redesign abrangerá:

1. identidade visual e tokens;
2. cabeçalho e navegação compartilhados;
3. página de autenticação unificada para login e cadastro;
4. página inicial autenticada com filtros e cinco conversores;
5. template reutilizável para as páginas de conversão;
6. estados de carregamento, validação, erro e sucesso;
7. responsividade, acessibilidade e cobertura automatizada.

Duas imagens aprovadas da marca são versionadas exclusivamente como referências documentais em [`docs/assets/redesign-ui/`](assets/redesign-ui/). Esses bitmaps não são fonte de runtime, não poderão ser importados pela aplicação e não substituem a reconstrução vetorial. Os mockups de páginas permanecem somente na conversa de produto. A implementação visual deverá ser reproduzível por código e assets SVG revisados.

## 3. Contexto e problema

### 3.1. Baseline atual

O frontend atual:

- usa Next.js 16, React 19, TypeScript e App Router;
- usa Tailwind CSS 4 sem shadcn/ui inicializado;
- protege `/`, `/converter/*` e `/dashboard` por sessão;
- preserva o destino solicitado por `callbackURL` durante a autenticação;
- mantém login e cadastro na rota `/auth`, com cadastro selecionado por `?modo=cadastro`;
- apresenta cinco conversores definidos por catálogo tipado e imutável;
- envia uploads diretamente do navegador ao FastAPI;
- inicia download automático após sucesso em desktop;
- mantém fallback de download por link em dispositivos móveis legados;
- possui testes unitários, E2E, smoke e validações visuais em desktop e mobile.

### 3.2. Problemas percebidos

- Falta uma identidade visual própria e consistente.
- Cores, raios, sombras e espaçamentos são definidos diretamente em cada componente.
- Botões, inputs, cartões e mensagens de estado não compartilham primitivas.
- Emojis não oferecem consistência visual entre sistemas operacionais.
- A navegação do usuário autenticado é pouco expressiva.
- A home não organiza os conversores por categoria.
- A tela de conversão depende de um input de arquivo nativo pouco orientativo.
- Login e cadastro parecem modos separados, embora compartilhem o mesmo fluxo.
- Estados de erro, carregamento e sucesso funcionam, mas não têm tratamento visual sistêmico.

## 4. Visão do produto

O FileFlow deverá transmitir que converter um arquivo é um fluxo curto, previsível e sem atrito. A interface deve parecer um produto confiável e acessível, não uma ferramenta técnica ou um painel administrativo.

Princípios:

1. **A ação principal é sempre evidente.** O usuário não deve procurar onde iniciar uma conversão.
2. **A interface explica o próximo passo.** Cada estado deve indicar o que aconteceu e o que pode ser feito.
3. **A marca nasce do produto.** Progressão, movimento e transformação aparecem na logo, nas formas e nas transições.
4. **Arredondado, não infantil.** Curvas suaves e tipografia amigável, com hierarquia e contraste profissionais.
5. **Uma linguagem, várias telas.** Autenticação, home e conversores compartilham tokens, componentes e navegação.
6. **Acessibilidade é comportamento, não acabamento.** Teclado, foco, leitores de tela e movimento reduzido fazem parte da definição de pronto.

## 5. Objetivos

1. Criar um design system mínimo baseado em Tailwind CSS 4 e shadcn/ui.
2. Implementar a identidade arredondada aprovada sem depender de imagens rasterizadas.
3. Redesenhar autenticação, home e conversores sem alterar contratos do backend.
4. Reduzir repetição de estilos e elementos interativos.
5. Preservar todas as rotas, regras de sessão, validações e downloads existentes.
6. Melhorar a clareza dos estados de conversão.
7. Garantir experiência consistente de 320 px até telas desktop amplas.
8. Atender WCAG 2.2 nível AA nos fluxos principais.
9. Atualizar testes automatizados e validações visuais para a nova composição.

## 6. Não objetivos

Esta entrega não deverá:

- adicionar novos formatos ou endpoints de conversão;
- alterar engines, payloads, tipos MIME ou respostas do FastAPI;
- encaminhar upload por Route Handler ou Server Action do Next.js;
- adicionar conversão em lote;
- adicionar histórico, favoritos persistidos ou armazenamento de arquivos;
- adicionar preview de documentos ou imagens;
- adicionar recuperação de senha, verificação de e-mail ou login social;
- adicionar planos, pagamentos, limites comerciais ou publicidade;
- adicionar tema escuro nesta fase;
- adicionar analytics ou plataforma de telemetria;
- criar um dashboard analítico;
- substituir Better Auth, Drizzle ou Neon;
- usar os mockups rasterizados como assets de produção;
- fazer alegações de segurança, retenção, criptografia ou limites que não estejam confirmadas pela implementação e pela política do produto.

## 7. Usuários e necessidades

### 7.1. Usuário recorrente

Precisa entrar rapidamente, reconhecer o conversor desejado, selecionar um arquivo e obter o download com o mínimo de decisões.

### 7.2. Usuário novo

Precisa compreender a proposta do FileFlow, criar uma conta, reconhecer os formatos suportados e receber orientação suficiente para concluir a primeira conversão.

### 7.3. Usuário mobile

Precisa selecionar arquivos pelo seletor do sistema, acompanhar o estado sem perda de contexto e acionar manualmente o download quando o navegador exigir.

### 7.4. Usuário de tecnologia assistiva

Precisa navegar por teclado, ouvir labels e erros úteis, identificar o estado da conversão e operar seleção, envio e download sem depender de cor, hover ou arrastar e soltar.

## 8. Escopo funcional e rotas

| Rota | Requisito após o redesign |
| --- | --- |
| `/auth` | formulário unificado, modo login ativo por padrão |
| `/auth?modo=cadastro` | mesmo layout, modo cadastro ativo |
| `/auth?callbackURL=...` | preservar retorno interno seguro após autenticação |
| `/` | home autenticada com hero, filtros e cinco conversores |
| `/converter/pdf/docx` | template de conversão PDF para Word |
| `/converter/docx/pdf` | template de conversão Word para PDF |
| `/converter/pdf/svg` | template de conversão PDF para SVG |
| `/converter/jpg/png` | template de conversão JPG para PNG |
| `/converter/png/jpg` | template de conversão PNG para JPG |
| `/dashboard` | preservar o comportamento vigente de redirecionamento para `/` |
| par desconhecido | preservar página 404 |

### 8.1. Regra de autenticação

- Visitantes de `/`, `/converter/*` e `/dashboard` deverão ser redirecionados para `/auth`.
- O redirecionamento deverá preservar um `callbackURL` interno validado.
- Usuário já autenticado que acessar `/auth` deverá retornar para a aplicação.
- Nenhum conteúdo protegido deverá piscar antes da validação da sessão.

## 9. Identidade visual

### 9.1. Marca

A marca deverá ser recriada como SVG determinístico, revisável e responsivo.

Referências documentais aprovadas:

- [`fileflow-mark-reference.png`](assets/redesign-ui/fileflow-mark-reference.png), para geometria e progressão do símbolo;
- [`fileflow-logo-lockup-reference.png`](assets/redesign-ui/fileflow-logo-lockup-reference.png), para relação entre símbolo e wordmark.

Esses PNGs não poderão ser copiados para `frontend/public`, importados por componentes ou usados como fallback visual.

Requisitos do símbolo:

- exatamente três formas direcionais separadas;
- formas triangulares apontando para a direita;
- progressão do menor para o maior;
- cantos e pontas generosamente arredondados;
- leve sensação de inclinação e fluxo, sem aparência agressiva;
- violeta no primeiro elemento, azul no segundo e ciano no terceiro;
- leitura preservada em 16 px, 24 px, 32 px e tamanhos maiores;
- versão colorida e versão monocromática;
- sem sombras, texturas, 3D ou detalhes dependentes de rasterização.

Requisitos do wordmark:

- texto exato `FileFlow`;
- `File` em azul-marinho e `Flow` em azul principal na versão clara;
- desenho arredondado e legível;
- preferencialmente texto vetorial convertido em paths somente no asset final da marca;
- acessibilidade fornecida pelo componente, não pelo conteúdo interno do SVG.

Assets mínimos:

```text
frontend/public/brand/
├── fileflow-mark.svg
├── fileflow-logo.svg
├── fileflow-mark-monochrome.svg
└── favicon.svg
```

Os SVGs deverão ser produzidos manualmente ou em ferramenta vetorial, otimizados e revisados. Não deverão ser vetorização automática de PNG gerado.

### 9.2. Tipografia

- Fonte de interface preferencial: **Nunito Sans**, carregada por `next/font`.
- Pesos previstos: 400, 600, 700 e 800 somente se usado no hero.
- Fallback: `ui-sans-serif`, `system-ui`, `sans-serif`.
- O wordmark não deverá depender da fonte instalada em runtime.
- Títulos usarão peso 700; corpo 400; labels e ações 600.
- Tamanho mínimo de texto funcional: 14 px; helper text poderá usar 12 px com contraste AA.

### 9.3. Paleta semântica inicial

Os valores poderão receber ajuste fino durante a implementação, mas os papéis semânticos não poderão ser substituídos por classes de paleta espalhadas pelos componentes.

| Token | Papel | Valor inicial sugerido |
| --- | --- | --- |
| `--background` | fundo da aplicação | `oklch(0.985 0.006 250)` |
| `--foreground` | texto principal | `oklch(0.22 0.055 265)` |
| `--card` | superfície de cartões | `oklch(1 0 0)` |
| `--card-foreground` | texto em cartões | `var(--foreground)` |
| `--primary` | ações principais | `oklch(0.58 0.22 260)` |
| `--primary-foreground` | texto sobre primário | `oklch(0.99 0 0)` |
| `--secondary` | superfícies secundárias | `oklch(0.96 0.015 255)` |
| `--muted` | áreas inativas | `oklch(0.955 0.01 255)` |
| `--muted-foreground` | texto secundário | `oklch(0.48 0.035 260)` |
| `--border` | bordas | `oklch(0.90 0.018 255)` |
| `--ring` | foco | `var(--primary)` |
| `--destructive` | erro | `oklch(0.58 0.22 25)` |
| `--success` | sucesso | `oklch(0.62 0.17 150)` |
| `--brand-violet` | acento da marca | `oklch(0.60 0.25 292)` |
| `--brand-blue` | acento principal | `var(--primary)` |
| `--brand-cyan` | acento da marca | `oklch(0.74 0.16 210)` |

### 9.4. Raios, sombras e densidade

- `--radius`: `0.875rem` como base.
- Botões e inputs: raio entre `var(--radius-md)` e `var(--radius-lg)`.
- Cards principais: raio `var(--radius-xl)`.
- Cápsulas, badges e controle segmentado: `9999px` quando semanticamente apropriado.
- Sombras deverão ser discretas e usadas somente para separar planos.
- Uma página deverá usar densidade confortável: `gap-6`, `p-6` e `p-8` em desktop.
- Gradientes serão restritos à marca, acentos pequenos e fundos decorativos de baixa opacidade.

### 9.5. Ícones

- Usar `lucide-react`.
- Tamanhos padrão: 16 px, 20 px e 24 px.
- Emojis deverão ser removidos do catálogo visual.
- O catálogo deverá apontar para uma chave ou componente de ícone tipado, sem armazenar JSX mutável se isso comprometer sua função como dados.
- Ícones decorativos usarão `aria-hidden`; ícones que representam ações terão nome acessível no controle.

## 10. Design system e shadcn/ui

### 10.1. Inicialização

Inicializar shadcn/ui dentro de `frontend/` de forma não interativa e com Radix:

```powershell
cd frontend
npx shadcn@latest init -d --base radix
```

Antes de aceitar alterações automáticas, revisar o diff de `globals.css`, `layout.tsx`, aliases e fonte. A inicialização não poderá remover configurações existentes nem criar referência circular de fonte.

### 10.2. Componentes previstos

Adicionar somente os componentes usados:

- `alert`;
- `avatar`;
- `badge`;
- `breadcrumb`;
- `button`;
- `card`;
- `dropdown-menu`;
- `input`;
- `label`;
- `progress`;
- `separator`;
- `sheet`;
- `skeleton`;
- `tabs`;
- `tooltip`.

Não instalar `--all`. Não introduzir React Hook Form ou Zod apenas para substituir a validação existente, salvo decisão técnica separada e justificada.

### 10.3. Organização desejada

```text
frontend/src/
├── app/
├── components/
│   ├── brand/
│   │   └── fileflow-logo.tsx
│   ├── layout/
│   │   ├── app-header.tsx
│   │   ├── page-container.tsx
│   │   └── user-menu.tsx
│   └── ui/
├── features/
│   ├── auth/
│   └── conversion/
└── lib/
    └── utils.ts
```

Regras:

- `components/ui` conterá fontes shadcn e extensões visuais genéricas.
- `components/layout` conterá composição compartilhada sem regra de conversão.
- componentes específicos continuarão dentro da feature correspondente.
- páginas do App Router permanecerão Server Components por padrão.
- interatividade ficará no menor limite Client Component possível.

## 11. Requisitos da navegação compartilhada

### 11.1. Cabeçalho autenticado

O cabeçalho deverá conter:

- logo FileFlow à esquerda, ligada à home;
- link `Conversores`, apontando para `/#conversores`;
- link `Como funciona`, apontando para `/#como-funciona`;
- avatar com iniciais ou imagem disponível;
- menu do usuário com nome, e-mail quando disponível e ação `Sair`;
- menu mobile em `Sheet` abaixo do breakpoint de navegação completa.

### 11.2. Comportamento

- Cabeçalho com altura estável e borda inferior discreta.
- Foco visível em todos os links e ações.
- Menu fecha com Escape, clique externo e seleção.
- Logout usa a lógica existente e invalida a sessão.
- Logo possui nome acessível `FileFlow`.

## 12. Requisitos da página de autenticação

### 12.1. Layout

Desktop:

- logo no canto superior esquerdo;
- controle segmentado `Entrar` e `Criar conta` no canto superior direito;
- superfície principal em duas colunas;
- painel de marca à esquerda;
- formulário à direita.

Mobile:

- logo e controle segmentado permanecem visíveis;
- painel ilustrativo é ocultado ou reduzido a uma faixa curta;
- formulário ocupa a largura disponível;
- nenhum campo fica encoberto pelo teclado virtual.

### 12.2. Controle segmentado

- Implementar com semântica de `Tabs`, não como `Switch` binário.
- A opção ativa deverá usar uma cápsula azul deslizante.
- A animação deverá durar entre 150 ms e 250 ms.
- Com `prefers-reduced-motion`, a troca deverá ser imediata.
- Seleção de `Criar conta` atualiza a URL para `?modo=cadastro` preservando `callbackURL`.
- Seleção de `Entrar` remove apenas o parâmetro `modo`, preservando `callbackURL`.
- Atualização/reabertura da URL deverá restaurar o modo correto.
- Teclas de seta deverão alternar tabs segundo o padrão ARIA.

### 12.3. Login

Conteúdo:

- título `Boas-vindas de volta`;
- descrição `Entre com seus dados para acessar o FileFlow.`;
- campo `E-mail`;
- campo `Senha`;
- ação opcional para exibir/ocultar senha, com nome acessível;
- botão `Entrar`;
- link textual para `Criar conta` como alternativa ao controle superior.

### 12.4. Cadastro

Conteúdo:

- título `Crie sua conta`;
- descrição orientada ao acesso aos conversores;
- campo `Nome`;
- campo `E-mail`;
- campo `Senha`;
- campo `Confirmar senha`;
- botão `Criar minha conta`;
- link textual para `Entrar`.

### 12.5. Validação e estados

- Preservar regras atuais de validação.
- Erros de campo aparecem junto ao campo e são associados por `aria-describedby`.
- Resumo de erro usa `Alert` e recebe foco quando necessário.
- Credenciais inválidas não revelam se o e-mail existe.
- Durante envio, campos e alternador ficam desabilitados quando uma troca puder invalidar o request.
- Botão informa `Aguarde...` durante submissão.
- Senhas são limpas após falha de autenticação conforme comportamento atual.
- Login social, recuperação de senha e checkbox de permanência não aparecem.

### 12.6. Painel de marca

- Formas abstratas derivadas da logo serão produzidas em CSS ou SVG inline de baixa opacidade.
- Não carregar imagem decorativa rasterizada.
- Benefícios deverão usar textos factuais e revisados.
- O painel não pode competir com o formulário nem prejudicar contraste.

## 13. Requisitos da página inicial

### 13.1. Hero

- Badge curto de valor, sujeito a revisão de copy.
- Título principal: `Seus arquivos, no fluxo certo.`
- Descrição: `Converta documentos e imagens em poucos cliques.`
- Botão `Escolher conversão` move foco/rolagem para a seção de conversores.
- Formas da marca poderão aparecer ao fundo em baixa opacidade.
- Hero não deverá ocupar mais que aproximadamente 45% da primeira viewport desktop.

### 13.2. Catálogo de conversores

- Título `O que você quer converter?`.
- Tabs `Todos`, `Documentos` e `Imagens`.
- `Todos` ativo por padrão.
- Filtro ocorre no cliente sem nova requisição.
- Categoria `Documentos`: PDF para Word, Word para PDF e PDF para SVG.
- Categoria `Imagens`: JPG para PNG e PNG para JPG.
- Troca de filtro deverá anunciar a quantidade de resultados sem movimentação excessiva.
- Cada card inteiro deverá ser um link para a rota existente.

### 13.3. Card de conversor

Cada card deverá conter:

- ícone Lucide coerente;
- título do catálogo;
- badges do formato de entrada e saída;
- seta direcional decorativa;
- descrição curta;
- indicação `Converter`;
- estados hover, focus-visible e active;
- nome acessível que inclua o título da conversão.

O card não deverá usar `aspect-square`; sua altura deverá derivar do conteúdo e permanecer consistente na linha.

### 13.4. Faixa de confiança

Exibir até três benefícios curtos. Textos iniciais candidatos:

- `Fluxo direto`;
- `Download automático`;
- `Conversões sem etapas extras`.

Termos como `seguro`, `sem limites`, `protegido`, `criptografado` e promessas sobre armazenamento somente poderão ser publicados após validação técnica e de produto.

### 13.5. Rodapé

- Ano obtido dinamicamente.
- Remover `Powered by Docker` da interface de produto.
- Manter rodapé pequeno, com marca e informações legais quando existirem.

## 14. Requisitos da página de conversão

### 14.1. Template

Uma única composição deverá receber um item do catálogo e renderizar todos os pares suportados. Não duplicar páginas nem lógica por formato.

### 14.2. Contexto

- Cabeçalho compartilhado.
- Breadcrumb `Conversores / {título}`.
- Ação `Voltar aos conversores`.
- Ícone, título e descrição vindos do catálogo.
- Par de formatos exibido por badges.

### 14.3. Indicador de etapas

Etapas visuais:

1. `Selecionar arquivo`;
2. `Converter`;
3. `Baixar`.

O indicador representa o estado existente; não cria páginas ou requests adicionais.

| Estado interno | Etapa visual |
| --- | --- |
| `idle` | etapa 1 ativa |
| `selected` | etapa 1 concluída; etapa 2 disponível |
| `converting` | etapa 2 ativa |
| `success` | etapas 1 e 2 concluídas; etapa 3 ativa/concluída |
| `error` | etapa 2 marcada com erro; seleção preservada para nova tentativa |

### 14.4. FileDropzone

Criar componente específico da feature com:

- input `type=file` real e acessível;
- seleção por clique e teclado;
- suporte a drag and drop em navegadores compatíveis;
- fallback integral para seletor nativo;
- destaque visual em drag-over;
- extensões `accept` vindas do catálogo;
- texto específico do formato;
- validação antecipada de extensão como conveniência, sem substituir o backend;
- suporte a `.jpg` e `.jpeg` no conversor JPG para PNG;
- apenas um arquivo por conversão;
- nenhuma alegação ou validação de tamanho enquanto não houver limite formal.

No estado selecionado, exibir:

- nome do arquivo;
- tamanho formatado apenas como informação;
- extensão;
- ação para remover/trocar;
- botão principal habilitado.

### 14.5. Ação de conversão

- Label derivado: `Converter para {formato de destino}`.
- Desabilitado sem arquivo e durante conversão.
- Durante request: `Processando...` e indicador visual não dependente apenas de animação.
- Impedir submissões concorrentes.
- Continuar enviando `multipart/form-data` diretamente ao FastAPI no campo `file`.

### 14.6. Sucesso e download

- Anunciar conclusão em região `role=status` com `aria-live=polite`.
- Desktop deverá preservar o início automático do download.
- Mobile legado deverá preservar o link acionável de download.
- A etapa `Baixar` deverá receber estado concluído quando o download for iniciado ou disponibilizado.
- Nome de saída continuará usando o nome original e o sufixo vigente.
- Object URLs deverão ser revogadas deterministicamente em troca de arquivo, nova conversão ou desmontagem.
- A interface deverá permitir iniciar uma nova conversão sem recarregar a rota.

### 14.7. Erro

- Exibir `Alert` destrutivo dentro do card principal.
- Preservar mensagem segura retornada pela camada de API.
- Preservar arquivo selecionado quando for seguro tentar novamente.
- Reabilitar a ação após falha.
- Foco deverá ir para o alerta ou resumo quando necessário.
- Nunca exibir stack trace, resposta bruta ou detalhes internos.

### 14.8. Painel `Como funciona`

- Três etapas curtas e específicas ao conversor.
- Ação `Escolher outro conversor` retorna à seção da home.
- Em mobile, o painel aparece abaixo do formulário.
- Não repetir cards dentro de cards.

## 15. Estados globais e feedback

### 15.1. Loading

- Usar `Skeleton` apenas quando houver conteúdo assíncrono cujo espaço precise ser reservado.
- Sessão resolvida no servidor não deverá produzir skeleton desnecessário.
- Spinner deve acompanhar texto, nunca substituí-lo.

### 15.2. Erro

- `Alert` para erros recuperáveis no contexto.
- `error.tsx` somente para falhas de rota que escapem do fluxo local.
- Mensagens devem explicar o próximo passo.

### 15.3. Vazio

- Filtro sem resultados deverá ter estado vazio, embora o catálogo inicial sempre produza resultados nas categorias previstas.
- Não deixar regiões vazias sem explicação.

## 16. Responsividade

### 16.1. Breakpoints comportamentais

| Faixa | Comportamento |
| --- | --- |
| 320–639 px | uma coluna, navegação em Sheet, cards empilhados |
| 640–767 px | uma ou duas colunas conforme espaço útil |
| 768–1023 px | catálogo em duas colunas; auth em uma coluna |
| 1024–1279 px | conversão em duas colunas; catálogo em três colunas |
| 1280 px ou mais | catálogo em cinco colunas quando preservar largura mínima |

### 16.2. Regras gerais

- Sem scroll horizontal a 320 px.
- Áreas de toque mínimas de 44 × 44 px.
- Conteúdo principal com padding mínimo de 16 px no mobile.
- Textos não dependem de truncamento para compreensão.
- Dropzone reduz altura, mas mantém seleção nativa acessível.
- Controle segmentado de autenticação não pode cortar labels.

## 17. Acessibilidade

Meta: WCAG 2.2 AA nos fluxos principais.

Requisitos:

- landmarks `header`, `nav`, `main` e `footer` corretos;
- um único `h1` por página;
- hierarquia de headings sem saltos arbitrários;
- contraste AA para texto, ícones funcionais, bordas de input e foco;
- foco visível com `ring` sem remoção por `outline-none` isolado;
- ordem de tabulação equivalente à ordem visual;
- skip link para o conteúdo principal;
- labels persistentes em todos os campos;
- mensagens associadas por `aria-describedby`;
- `aria-invalid` apenas quando aplicável;
- regiões live para autenticação e conversão;
- ícones decorativos ocultos de leitores de tela;
- menus, tabs e tooltips seguindo padrões Radix;
- drag and drop nunca obrigatório;
- animações respeitam `prefers-reduced-motion`;
- nenhuma informação comunicada somente por cor;
- testes com teclado e axe ou ferramenta equivalente no CI/E2E.

## 18. Conteúdo e localização

- Idioma padrão: `pt-BR`.
- Manter nomenclatura consistente: `Word` na comunicação, `DOCX` em badges técnicos.
- Usar frases curtas e orientadas a ação.
- Evitar jargão de infraestrutura, incluindo Docker, FastAPI, Neon e multipart.
- Não prometer características não verificadas.
- Centralizar textos repetidos quando houver benefício real; não criar um sistema de i18n nesta fase.
- Corrigir qualquer problema de encoding visível em fonte ou testes alterados.

## 19. Requisitos técnicos

### 19.1. Arquitetura

- Manter App Router.
- Páginas e layouts são Server Components por padrão.
- `AuthForm`, controle segmentado, menu mobile e fluxo de conversão são Client Components nos menores limites possíveis.
- Não mover upload para o servidor Next.js.
- Não adicionar estado global.
- Catálogo permanece fonte única para rotas, formatos, extensões e copy específica.
- Assets SVG serão servidos localmente pelo frontend.

### 19.2. Dependências

Dependências novas esperadas:

- `lucide-react`;
- dependências instaladas pelo shadcn para `cn`, variantes e primitivas Radix utilizadas;
- `next-themes` não será adicionado nesta fase.

Toda dependência deverá:

- ser fixada pelo lockfile;
- ter uso concreto;
- passar por auditoria de bundle e licença aplicável;
- não duplicar capacidade já fornecida por React, Next.js ou CSS.

### 19.3. CSS

- Tokens em `globals.css` usando Tailwind CSS 4.
- Superfícies fundamentais usam tokens como `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border` e `ring-ring`.
- Cores de marca específicas poderão ter tokens próprios.
- Evitar hex e classes de paleta ad hoc em componentes de produto.
- Evitar `transition-all`; transicionar somente propriedades necessárias.

### 19.4. Fonte

- Integrar Nunito Sans com `next/font`.
- Manter variáveis de fonte no elemento `html` quando exigido pela integração.
- Revisar qualquer alteração feita pelo `shadcn init` para impedir referências CSS circulares.
- Não bloquear renderização por fonte externa em runtime.

## 20. Segurança e privacidade

- Não alterar atributos e políticas de cookie do Better Auth.
- Não registrar nome de arquivo, conteúdo, credenciais ou respostas binárias em analytics/logs do frontend.
- Não persistir arquivos em localStorage, sessionStorage, IndexedDB ou banco.
- Não expor secrets em variáveis públicas.
- `callbackURL` continuará aceitando apenas caminho interno validado.
- Mensagens de autenticação continuarão resistentes a enumeração de usuário.
- Copy de segurança e retenção precisa de validação antes de publicação.

## 21. Desempenho

Metas de engenharia:

- preservar ou reduzir o JavaScript inicial das páginas estáticas;
- não transformar home ou páginas inteiras em Client Components;
- ícones importados individualmente e tree-shakeable;
- logo e decorações em SVG;
- nenhuma imagem hero rasterizada;
- evitar layout shift reservando dimensões de logo, avatar e cards;
- manter auditoria de bundle existente verde;
- nenhuma regressão material em Core Web Vitals atribuível ao redesign.

Metas indicativas em produção, p75 mobile, sujeitas à infraestrutura:

- LCP ≤ 2,5 s;
- CLS ≤ 0,1;
- INP ≤ 200 ms.

## 22. Métricas de sucesso

Como analytics não faz parte desta entrega, as métricas serão inicialmente verificadas por testes e avaliação de usabilidade:

- 100% dos cinco conversores encontrados em até uma interação a partir da home;
- 100% dos fluxos concluíveis somente por teclado;
- zero regressões nos endpoints e nomes de download;
- zero violações críticas de acessibilidade automatizada nas três páginas principais;
- layouts aprovados em desktop e mobile;
- redução de estilos repetidos por adoção dos componentes compartilhados;
- todos os gates do frontend verdes.

Instrumentação quantitativa de funil deverá ser especificada em entrega própria antes de coletar dados de usuários.

## 23. Testes e validação

### 23.1. Testes unitários e de componentes

Cobrir:

- renderização da logo e nomes acessíveis;
- controle segmentado de auth e sincronização com query string;
- preservação de `callbackURL` ao trocar modo;
- campos corretos em login e cadastro;
- validações e foco no resumo de erro;
- menu do usuário e logout;
- tabs de categoria e filtragem do catálogo;
- cards e links dos cinco conversores;
- FileDropzone por clique, teclado e drop;
- rejeição antecipada de extensão incompatível;
- seleção `.jpeg` no fluxo JPG;
- remoção e troca de arquivo;
- mapeamento dos estados para o indicador de etapas;
- estados disabled, converting, success e error;
- cleanup de object URLs.

### 23.2. E2E

Preservar e atualizar cenários existentes:

1. visitante é redirecionado para auth;
2. troca entre login e cadastro preserva URL e callback;
3. autenticação retorna ao destino original;
4. home exibe e filtra os cinco conversores;
5. card abre a rota correta;
6. breadcrumb e retorno funcionam;
7. cada conversor envia multipart ao endpoint correto;
8. botão bloqueia reenvio enquanto processa;
9. sucesso inicia download com nome esperado;
10. erro restaura ação e permite nova tentativa;
11. comportamento mobile de download permanece funcional;
12. rota desconhecida continua 404;
13. logout encerra sessão e protege as rotas novamente.

### 23.3. Validação visual

Atualizar `visual.e2e.spec.ts` para validar a nova composição:

- home desktop: até cinco cards na linha quando o viewport permitir;
- home mobile: uma coluna e ordem vertical;
- auth desktop: duas colunas e controle no topo;
- auth mobile: formulário prioritário e sem overflow;
- conversor desktop: grid principal + painel lateral;
- conversor mobile: painel lateral abaixo do formulário;
- capturas de idle, selected, converting, success e error;
- animações desabilitadas nas capturas;
- ausência de scroll horizontal.

### 23.4. Revisão manual

- Chrome, Firefox e Safari/WebKit suportados pela matriz do Playwright;
- Android e iOS em viewport e, quando possível, dispositivo real;
- zoom do navegador em 200%;
- navegação completa por teclado;
- leitor de tela em pelo menos um fluxo de auth e um de conversão;
- `prefers-reduced-motion`;
- contraste de todos os tokens finais.

### 23.5. Gates obrigatórios

```powershell
cd frontend
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run audit:bundle
npm run test:e2e
npm run test:e2e:smoke
npm run test:e2e:visual
```

Testes que exigem banco principal continuarão opt-in e não deverão ser executados incidentalmente por esta entrega.

## 24. Plano de implementação

### Fase 1 — Fundação

- inicializar shadcn/ui com Radix;
- revisar alterações automáticas;
- criar tokens, fonte e utilitário `cn`;
- instalar componentes mínimos;
- adicionar Lucide;
- criar assets vetoriais da marca;
- criar testes básicos do design system.

### Fase 2 — Estrutura compartilhada

- implementar logo React;
- implementar `PageContainer`;
- implementar cabeçalho, navegação mobile e menu do usuário;
- integrar logout;
- adicionar skip link e providers estritamente necessários.

### Fase 3 — Autenticação

- criar layout em duas colunas;
- implementar controle segmentado sincronizado com URL;
- migrar inputs, labels, buttons e alerts;
- preservar validação e callbacks;
- atualizar testes unitários e E2E.

### Fase 4 — Home

- implementar hero;
- tipar categorias do catálogo;
- migrar cards e ícones;
- implementar tabs e âncoras;
- criar faixa de benefícios com copy validada;
- atualizar responsividade e testes.

### Fase 5 — Conversores

- criar Breadcrumb e cabeçalho do conversor;
- criar indicador de etapas;
- criar FileDropzone;
- migrar estados para Alert, Progress e Button;
- criar painel `Como funciona`;
- validar os cinco pares e downloads.

### Fase 6 — Hardening

- revisão de acessibilidade;
- revisão de copy e alegações;
- validação visual desktop/mobile;
- auditoria de bundle;
- execução completa dos gates;
- atualização de README quando houver mudança de setup.

## 25. Critérios de aceite

### 25.1. Design system

- [ ] shadcn/ui está inicializado com Radix e apenas componentes usados foram adicionados.
- [ ] Tokens semânticos controlam cores, raios, bordas e foco.
- [ ] Nunito Sans é carregada por `next/font` sem regressão de renderização.
- [ ] Não há emojis como ícones de conversores.
- [ ] Logo final é SVG revisado, não bitmap gerado.
- [ ] Os dois PNGs aprovados permanecem somente em `docs/assets/redesign-ui` e não entram no runtime.
- [ ] Não há mockups de páginas, bitmaps de produção ou cópias das referências em `frontend/public`.

### 25.2. Autenticação

- [ ] Login e cadastro compartilham uma única página e composição.
- [ ] Controle segmentado funciona por mouse, toque e teclado.
- [ ] Cápsula ativa anima e respeita movimento reduzido.
- [ ] Modo e `callbackURL` sobrevivem a atualização da página.
- [ ] Campos, validações, erros e estados de envio permanecem corretos.
- [ ] Usuário autenticado retorna ao destino esperado.

### 25.3. Home

- [ ] Hero apresenta proposta e leva à seção de conversores.
- [ ] Os cinco conversores aparecem em `Todos`.
- [ ] Categorias filtram 3 conversores de documentos e 2 de imagens.
- [ ] Todos os cards apontam para as rotas existentes.
- [ ] Cabeçalho e menu do usuário funcionam em desktop e mobile.
- [ ] Nenhuma copy não verificada é publicada.

### 25.4. Conversão

- [ ] Um template atende os cinco pares.
- [ ] Seleção funciona por input, teclado e drag and drop.
- [ ] Extensões aceitas vêm do catálogo.
- [ ] Botão é habilitado somente com arquivo válido.
- [ ] Estados visual e interno permanecem sincronizados.
- [ ] Upload continua direto ao FastAPI.
- [ ] Download desktop e fallback mobile permanecem funcionais.
- [ ] Erro permite nova tentativa sem reload.
- [ ] Object URLs são revogadas corretamente.

### 25.5. Qualidade

- [ ] WCAG 2.2 AA é atendido nos fluxos principais.
- [ ] Não existe scroll horizontal a 320 px.
- [ ] Testes unitários, E2E, smoke e visuais passam.
- [ ] Lint, typecheck, cobertura, build e auditoria de bundle passam.
- [ ] Os contratos do FastAPI não foram alterados.
- [ ] Rotas desconhecidas continuam retornando 404.

## 26. Riscos e mitigação

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| `shadcn init` sobrescrever CSS ou fonte | regressão global | revisar diff imediatamente e restaurar configurações intencionais |
| excesso de Client Components | bundle e hidratação maiores | manter páginas e composição estática no servidor |
| arredondamento reduzir hierarquia | aparência infantil | limitar cápsulas a controles apropriados e manter tipografia/contraste fortes |
| drag and drop excluir usuários | fluxo inacessível | input nativo e teclado como caminhos equivalentes |
| claims de segurança não comprovadas | risco de confiança e legal | revisão técnica e de produto antes da publicação |
| SVG gerado automaticamente ter baixa qualidade | marca inconsistente | reconstrução vetorial manual e revisão em múltiplos tamanhos |
| regressão de auth por troca de modo | perda de callback ou estado | testes de query string, histórico e callback interno |
| mudança visual quebrar E2E por seletores frágeis | CI instável | selecionar por roles e nomes acessíveis |
| cinco cards ficarem estreitos | legibilidade ruim | usar cinco colunas somente quando largura mínima for preservada |
| manter object URL por tempo excessivo | uso de memória | cleanup em troca, reset e desmontagem |
| copy divergir do comportamento real | expectativa incorreta | catálogo e PRD como fontes; revisão de copy antes do aceite |

## 27. Dependências e decisões pendentes

### 27.1. Dependências

- aprovação do SVG final da marca;
- validação de licença e uso da Nunito Sans;
- revisão de copy sobre segurança e limites;
- disponibilidade dos ambientes usados pelos E2E atuais.

### 27.2. Decisões adiadas

- tema escuro;
- recuperação de senha;
- login social;
- histórico e favoritos reais;
- upload múltiplo;
- limites de tamanho e planos;
- página pública sem autenticação;
- analytics de funil;
- internacionalização;
- animações avançadas entre rotas;
- editor ou preview de arquivos.

## 28. Definição de pronto

A entrega estará pronta quando:

1. todas as três experiências — autenticação, home e conversão — usarem o novo design system;
2. os critérios de aceite estiverem atendidos;
3. os cinco conversores mantiverem comportamento e contratos;
4. a sessão e o `callbackURL` continuarem seguros e funcionais;
5. testes automatizados e revisão manual passarem;
6. a logo SVG e a copy final forem aprovadas;
7. somente os dois PNGs de referência documental estiverem versionados, sem mockups de páginas ou bitmaps carregados pela aplicação;
8. documentação de setup refletir dependências e comandos reais;
9. não houver alterações não relacionadas incluídas na entrega.

## 29. Resultado esperado

Ao concluir este PRD, o FileFlow terá uma identidade reconhecível e uma experiência contínua desde a autenticação até o download. O usuário encontrará qualquer conversor rapidamente, compreenderá o estado do processo e poderá operar o produto em desktop, mobile, teclado ou tecnologia assistiva. A implementação continuará simples: catálogo único, páginas server-first, upload direto ao FastAPI e componentes visuais pertencentes ao próprio código por meio do shadcn/ui.
