# SPEC técnica — Redesign da interface com Tailwind CSS e shadcn/ui

## 1. Identificação e fontes

- **Status:** Proposta
- **Data:** 29 de julho de 2026
- **Implementa:** [PRD — Redesign da interface com Tailwind CSS e shadcn/ui](PRD-redesign-ui-shadcn.md)
- **Execução:** [Tasks — Redesign da interface com Tailwind CSS e shadcn/ui](TASKS-redesign-ui-shadcn.md)
- **Workspace afetado:** `frontend/`
- **Back-end afetado:** nenhum contrato ou código planejado

Esta especificação transforma o PRD em contratos implementáveis. Em caso de conflito:

1. comportamento funcional já coberto por testes e contrato do backend;
2. decisões explícitas do PRD;
3. contratos desta SPEC;
4. referências visuais;
5. detalhes cosméticos deixados ao implementador.

Mudanças de produto descobertas durante a execução exigem atualização do PRD e aprovação antes de serem implementadas.

## 2. Referências visuais versionadas

As duas imagens abaixo são referências de identidade, não assets de produção:

| Arquivo | Papel | SHA-256 |
| --- | --- | --- |
| [`assets/redesign-ui/fileflow-mark-reference.png`](assets/redesign-ui/fileflow-mark-reference.png) | geometria, progressão e paleta do símbolo | `F18C77170E7D90E9F2BF39E8059F23C35909372EE8C7AB1C5E941BCBFDC89956` |
| [`assets/redesign-ui/fileflow-logo-lockup-reference.png`](assets/redesign-ui/fileflow-logo-lockup-reference.png) | relação entre símbolo e wordmark | `EE4EE385A577AB61A3B19B1B618FEEB11933015627C2699E20B5725FAEC7F9FF` |

Regras:

- manter os PNGs somente em `docs/assets/redesign-ui/`;
- não importar esses caminhos no frontend;
- não copiá-los para `frontend/public/`;
- não recortar, redimensionar ou converter os PNGs para uso em runtime;
- reconstruir a marca final como SVG determinístico;
- usar os PNGs para proporção, direção e linguagem, não para reprodução pixel a pixel;
- registrar qualquer substituição futura com novo nome e hash, sem sobrescrever silenciosamente a referência aprovada.

## 3. Baseline funcional invariável

O redesign não pode alterar:

- rotas `/`, `/auth`, `/converter/{from}/{to}`, `/dashboard` e 404;
- proteção server-side das rotas autenticadas;
- validação de `callbackURL` interno;
- login e cadastro por Better Auth;
- catálogo único dos cinco conversores;
- endpoints `/convert/*`;
- campo multipart `file`;
- upload direto do navegador ao FastAPI;
- formato de erro `{"detail": string}`;
- nome de download vigente;
- download automático desktop;
- fallback de download em mobile legado;
- cleanup de object URLs;
- inexistência de histórico, batch, preview ou recuperação de senha.

Qualquer teste existente que proteja esses comportamentos deve ser migrado, não removido.

## 4. Dependências e configuração

### 4.1. Inicialização do shadcn/ui

Executar dentro de `frontend/`:

```powershell
npx shadcn@latest init -d --base radix
```

Configuração esperada de `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Se a CLI gerar formato diferente por evolução compatível da ferramenta, registrar o desvio no PR e preservar os mesmos caminhos e responsabilidades.

### 4.2. Componentes shadcn permitidos

Instalar somente quando usados pelo grupo correspondente:

```text
alert
avatar
badge
breadcrumb
button
card
dropdown-menu
input
label
progress
separator
sheet
skeleton
tabs
tooltip
```

Não usar `add --all`. Antes de instalar um componente, consultar sua documentação pela CLI da versão resolvida.

### 4.3. Dependências novas esperadas

- dependências diretas geradas pela CLI para os componentes escolhidos;
- `lucide-react` para ícones;
- dependências de `cn` e variantes adicionadas pelo shadcn.

Não adicionar:

- `next-themes`;
- React Hook Form;
- Zod;
- biblioteca de dropzone;
- biblioteca de animação;
- biblioteca de estado global;
- segunda biblioteca de ícones.

Exceção exige justificativa no PR e atualização desta SPEC.

## 5. Estrutura de arquivos alvo

```text
frontend/
├── components.json
├── public/
│   └── brand/
│       ├── favicon.svg
│       ├── fileflow-logo.svg
│       ├── fileflow-mark-monochrome.svg
│       └── fileflow-mark.svg
└── src/
    ├── app/
    │   ├── auth/page.tsx
    │   ├── converter/[fromFormat]/[toFormat]/page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── brand/
    │   │   └── fileflow-logo.tsx
    │   ├── layout/
    │   │   ├── app-header.tsx
    │   │   ├── mobile-navigation.tsx
    │   │   ├── page-container.tsx
    │   │   └── user-menu.tsx
    │   └── ui/
    ├── features/
    │   ├── auth/components/
    │   │   ├── auth-form.tsx
    │   │   ├── auth-mode-tabs.tsx
    │   │   └── auth-shell.tsx
    │   └── conversion/
    │       ├── components/
    │       │   ├── conversion-form.tsx
    │       │   ├── conversion-steps.tsx
    │       │   ├── converter-card.tsx
    │       │   ├── converter-catalog.tsx
    │       │   ├── converter-page.tsx
    │       │   ├── file-dropzone.tsx
    │       │   └── selected-file.tsx
    │       └── config/converters.ts
    └── lib/utils.ts
```

A implementação pode colocalizar testes junto aos arquivos atuais. Não criar wrappers sem consumidor real.

## 6. Tokens de design

### 6.1. Tokens raiz

Definir em `globals.css`, compatível com Tailwind CSS 4:

```css
:root {
  --radius: 0.875rem;

  --background: oklch(0.985 0.006 250);
  --foreground: oklch(0.22 0.055 265);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.22 0.055 265);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.22 0.055 265);
  --primary: oklch(0.58 0.22 260);
  --primary-foreground: oklch(0.99 0 0);
  --secondary: oklch(0.96 0.015 255);
  --secondary-foreground: oklch(0.28 0.05 265);
  --muted: oklch(0.955 0.01 255);
  --muted-foreground: oklch(0.48 0.035 260);
  --accent: oklch(0.95 0.025 255);
  --accent-foreground: oklch(0.28 0.05 265);
  --destructive: oklch(0.58 0.22 25);
  --border: oklch(0.90 0.018 255);
  --input: oklch(0.90 0.018 255);
  --ring: oklch(0.58 0.22 260);

  --success: oklch(0.62 0.17 150);
  --brand-violet: oklch(0.60 0.25 292);
  --brand-blue: oklch(0.58 0.22 260);
  --brand-cyan: oklch(0.74 0.16 210);
}
```

Valores podem ser ajustados somente se:

- o papel semântico for preservado;
- contraste for medido;
- screenshots forem revisadas;
- alteração for registrada no PR do design system.

### 6.2. Regras de uso

- superfícies usam tokens semânticos, não classes `slate-*` ou hex repetidos;
- violeta e ciano são acentos, não cores concorrentes de ação;
- sucesso usa `--success`; erro usa `--destructive`;
- foco usa `--ring` e permanece visível;
- sombra não substitui borda;
- `transition-all` é proibido no código novo;
- gradientes não aparecem em grandes superfícies, exceto decoração com baixa opacidade.

## 7. Tipografia

### 7.1. Fonte

Usar `Nunito_Sans` por `next/font/google` em `layout.tsx`:

```ts
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito-sans",
});
```

O nome e os parâmetros finais devem ser validados contra a versão do Next.js instalada.

Regras:

- classe de variável no `html`;
- `body` com antialiasing;
- fallback literal no tema Tailwind;
- nenhuma referência circular como `--font-sans: var(--font-sans)`;
- wordmark de produção convertido em paths no SVG.

### 7.2. Escala

| Uso | Mobile | Desktop | Peso |
| --- | --- | --- | --- |
| Hero | 36 px | 56 px | 800 |
| H1 de página | 30 px | 40 px | 700 |
| H2 | 24 px | 30 px | 700 |
| H3/card | 18 px | 20 px | 700 |
| Corpo | 16 px | 16 px | 400 |
| Label/ação | 14 px | 14–16 px | 600 |
| Helper | 12–14 px | 12–14 px | 400 |

Escala deve usar classes Tailwind estáveis, sem valores arbitrários repetidos.

## 8. Marca de produção

### 8.1. SVGs

Contratos:

- `fileflow-mark.svg`: somente as três formas;
- `fileflow-logo.svg`: marca + wordmark;
- `fileflow-mark-monochrome.svg`: uma cor controlável;
- `favicon.svg`: símbolo simplificado legível em 16 px.

Todos os SVGs deverão:

- declarar `viewBox`;
- evitar dimensões rígidas como única forma de escala;
- não conter base64, filtros raster, metadata de editor ou scripts;
- não depender de fonte externa;
- ser otimizados sem deformar paths;
- ter fundo transparente;
- respeitar as proporções das referências.

### 8.2. Componente React

Interface mínima:

```ts
type FileFlowLogoProps = Readonly<{
  className?: string;
  compact?: boolean;
  priority?: boolean;
}>;
```

Comportamento:

- `compact=false`: lockup completo;
- `compact=true`: apenas símbolo;
- link pai fornece nome acessível `FileFlow — página inicial`;
- SVG interno decorativo usa `aria-hidden` quando o link já tem nome;
- dimensões reservadas para evitar layout shift.

## 9. Primitivas shadcn e extensões

### 9.1. Regra de propriedade

Os componentes gerados pertencem ao repositório. Customizações globais devem ocorrer no source do componente somente quando forem reutilizadas por pelo menos duas telas. Ajustes locais permanecem por `className`.

### 9.2. Variantes previstas

`Button`:

- `default` para ação principal;
- `outline` para ação secundária;
- `ghost` para navegação e ícones;
- `destructive` somente para ações destrutivas reais;
- tamanhos mantêm alvo mínimo de 44 px em fluxos principais.

`Badge`:

- padrão neutro;
- formato/documento com acentos de marca;
- sucesso e erro não dependem somente de cor.

`Card`:

- superfície base sem gradiente;
- borda `border-border`;
- sombra discreta apenas em cards principais.

`Alert`:

- padrão informativo;
- destrutivo para erro;
- sucesso pode ser extensão local tipada se usado em mais de um fluxo.

## 10. App shell

### 10.1. `PageContainer`

```ts
type PageContainerProps = Readonly<{
  children: ReactNode;
  className?: string;
  as?: "div" | "main" | "section";
}>;
```

Layout:

- `w-full`;
- largura máxima aproximada de 1440 px;
- padding horizontal 16 px mobile, 24 px tablet e 32 px desktop;
- centralizado;
- não cria `main` aninhado quando `as` não for informado.

### 10.2. `AppHeader`

```ts
type AppHeaderProps = Readonly<{
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
}>;
```

Desktop:

- logo à esquerda;
- links `Conversores` e `Como funciona`;
- menu do usuário à direita.

Mobile:

- símbolo ou lockup reduzido;
- botão de menu com nome acessível;
- `Sheet` com navegação e logout.

### 10.3. `UserMenu`

- `Avatar` com imagem, ou iniciais determinísticas;
- `DropdownMenu` com nome/e-mail;
- ação `Sair` usa `LogoutButton` ou lógica pública da feature auth;
- não adicionar configurações, perfil ou links sem rota real;
- fecha por Escape e restaura foco ao gatilho.

## 11. Autenticação

### 11.1. Modelo de modo

Reutilizar `AuthMode = "login" | "cadastro"`.

Conversão URL → modo:

```text
modo=cadastro -> cadastro
ausente/outro  -> login
```

### 11.2. `AuthModeTabs`

```ts
type AuthModeTabsProps = Readonly<{
  mode: AuthMode;
  callbackUrl: string;
  disabled: boolean;
}>;
```

Contrato:

- base Radix Tabs;
- tabs `Entrar` e `Criar conta`;
- navegação atualiza URL sem aceitar destino externo;
- `callbackURL` é serializado com `encodeURIComponent`;
- indicador visual desliza entre duas metades iguais;
- duração 150–250 ms;
- sem animação quando `prefers-reduced-motion: reduce`;
- disabled durante submissão;
- links alternativos no rodapé do formulário mantêm a mesma navegação.

### 11.3. `AuthShell`

Desktop `lg+`:

- duas colunas equilibradas;
- painel de marca à esquerda;
- formulário à direita;
- controle de modo no topo direito da página.

Mobile/tablet:

- uma coluna;
- painel de marca oculto ou reduzido sem duplicar conteúdo essencial;
- controle segmentado acima do formulário;
- largura máxima do form aproximadamente 448 px.

### 11.4. Formulário

Preservar modelo, validações, Better Auth e tratamento de erro atuais.

Login:

```text
E-mail
Senha
Entrar
```

Cadastro:

```text
Nome
E-mail
Senha
Confirmar senha
Criar minha conta
```

Olho de senha:

- opcional no primeiro PR de auth visual;
- se implementado, botão `type=button`;
- nomes acessíveis `Mostrar senha` e `Ocultar senha`;
- não alterar valor, autocomplete ou validação.

## 12. Home

### 12.1. Catálogo

Estender dados de apresentação de forma tipada:

```ts
type ConverterCategory = "documents" | "images";
type ConverterIconKey = "file-text" | "file-type" | "image";
```

Cada definição recebe:

- `category`;
- `iconKey`;
- opcionalmente `shortDescription` se `homeDescription` não for suficiente.

Não armazenar componente React ou elemento JSX mutável no catálogo. Resolver `iconKey` em um mapa visual próximo ao consumidor.

Mapeamento:

| Conversor | Categoria |
| --- | --- |
| PDF para Word | `documents` |
| Word para PDF | `documents` |
| PDF para SVG | `documents` |
| JPG para PNG | `images` |
| PNG para JPG | `images` |

### 12.2. Filtro

```ts
type ConverterFilter = "all" | ConverterCategory;
```

- `all` ativo por padrão;
- filtro em Client Component pequeno;
- sem query string nesta fase;
- ordem original do catálogo preservada;
- região de resultados recebe label acessível;
- mudança anuncia contagem em região live discreta.

### 12.3. Grid

```text
base: 1 coluna
sm:   2 colunas se largura útil permitir
lg:   3 colunas
xl:   5 colunas com largura mínima legível
```

Cards não usam `aspect-square`. Todos os cards da mesma linha devem alinhar ações no final por layout flex.

### 12.4. Âncoras

- `#conversores` no catálogo;
- `#como-funciona` na faixa de benefícios/explicação;
- CTA do hero aponta para `#conversores` e move foco logicamente após navegação por teclado quando necessário.

## 13. Página de conversão

### 13.1. Estado

Preservar união discriminada existente:

```ts
type ConversionState =
  | { status: "idle" }
  | { status: "selected"; file: File }
  | { status: "converting"; file: File }
  | { status: "success"; filename: string; downloadUrl?: string }
  | { status: "error"; message: string };
```

Se o estado de erro precisar preservar o arquivo para retry sem ler novamente o input, a alteração deverá ser explícita e coberta:

```ts
| { status: "error"; message: string; file: File }
```

Não adicionar booleanos paralelos que permitam estados inválidos.

### 13.2. `ConversionSteps`

```ts
type ConversionStepsProps = Readonly<{
  status: ConversionState["status"];
}>;
```

Regras:

- três itens: selecionar, converter, baixar;
- item atual com `aria-current="step"`;
- item de erro identificado por ícone e texto, não apenas vermelho;
- lista semântica ordenada;
- conectores decorativos ocultos de leitores de tela.

### 13.3. `FileDropzone`

```ts
type FileDropzoneProps = Readonly<{
  accept: readonly `.${string}`[];
  disabled: boolean;
  file?: File;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onInvalidFile: (message: string) => void;
}>;
```

Contrato:

- input real dentro do componente;
- label ou botão associado ao input;
- uma seleção por vez;
- drag handlers somente enriquecem o fluxo;
- `dropEffect=copy` para arquivo válido;
- validar extensão case-insensitive;
- `.jpeg` aceito quando listado;
- arquivo inválido não substitui seleção válida existente sem confirmação;
- reset do input permite selecionar novamente o mesmo arquivo;
- nome não é enviado a logs;
- tamanho formatado é informativo, não limite;
- estado drag-over não permanece após leave/drop;
- disabled bloqueia clique, drop e remoção durante conversão.

### 13.4. Fluxo de submissão

- manter `event.preventDefault`;
- ler arquivo de fonte única, evitando divergência entre estado e input;
- bloquear reentrada;
- manter `convertFile` como transporte único;
- não interpretar erro HTTP no componente visual;
- manter cleanup em unmount e nova tentativa;
- sucesso desktop inicia download;
- sucesso mobile expõe link acionável.

### 13.5. Layout

Desktop `lg+`:

- coluna principal `minmax(0, 2fr)`;
- painel `Como funciona` `minmax(280px, 1fr)`;
- card principal contém etapas, formatos, dropzone, ação e alert.

Mobile/tablet:

- card principal primeiro;
- painel de explicação abaixo;
- breadcrumb pode quebrar linha sem truncar título crítico.

## 14. Responsividade e movimento

### 14.1. Viewports de referência

- mobile: 375 × 812;
- mobile mínimo: 320 × 568;
- tablet: 768 × 1024;
- desktop: configuração `desktopProject` existente;
- desktop amplo: 1440 × 900 ou equivalente.

### 14.2. Movimento

Permitido:

- indicador deslizante de auth;
- transição de cor/borda em hover e foco;
- spinner de processamento;
- leve deslocamento de ícone em CTA.

Proibido:

- parallax;
- animação contínua decorativa;
- transição de altura que esconda foco;
- `transition-all`;
- movimento necessário para compreender estado.

Com movimento reduzido, duração deve chegar a zero ou quase zero e spinner deve manter texto equivalente.

## 15. Acessibilidade

### 15.1. Critérios automáticos

- integrar `@axe-core/playwright` somente se compatível e justificado no grupo de hardening;
- zero violações críticas ou sérias nas rotas testadas;
- contraste validado por ferramenta;
- HTML sem IDs duplicados.

### 15.2. Critérios manuais

- fluxo completo por teclado;
- foco inicial e retorno de menus corretos;
- zoom 200% sem perda de conteúdo;
- labels anunciados;
- erros anunciados e focados;
- estados de conversão anunciados uma única vez;
- dropzone operável sem drag;
- tabs de auth usam setas e Tab conforme padrão ARIA;
- menu mobile não deixa foco escapar quando aberto.

## 16. Contratos de teste

### 16.1. Seletores

Testes devem preferir:

1. `getByRole` com nome acessível;
2. `getByLabel`;
3. texto estável de produto;
4. `data-testid` somente quando não houver semântica apropriada.

Não selecionar por classes Tailwind, estrutura de `div` ou nomes internos do shadcn.

### 16.2. Unitários

- componentes shadcn não precisam repetir testes da biblioteca;
- extensões e composição precisam de testes próprios;
- cada regressão funcional existente permanece coberta;
- testes de snapshot estrutural amplo são evitados.

### 16.3. Visuais

Capturas obrigatórias:

```text
auth-login-desktop.png
auth-signup-desktop.png
auth-login-mobile.png
home-all-desktop.png
home-documents-desktop.png
home-mobile.png
converter-idle-desktop.png
converter-selected-desktop.png
converter-converting-desktop.png
converter-success-desktop.png
converter-error-desktop.png
converter-idle-mobile.png
```

Capturas são artefatos de teste, não devem ser versionadas salvo decisão futura explícita. O teste atual usa `testInfo.outputPath`.

### 16.4. Layout assertions

- ausência de scroll horizontal;
- cards em uma coluna mobile;
- cinco colunas desktop apenas quando largura suficiente;
- auth duas colunas desktop e uma mobile;
- conversor duas colunas desktop e uma mobile;
- alvos principais com altura mínima de 44 px.

## 17. Gates por grupo

### 17.1. Grupo documental

```powershell
git diff --check
```

### 17.2. Grupos de componentes/páginas

```powershell
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
```

Executar E2E focal quando o grupo alterar fluxo coberto.

### 17.3. Hardening e release

```powershell
cd frontend
npm ci
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

Suites de banco principal permanecem opt-in e fora do redesign, salvo alteração direta no auth server-side, que não está planejada.

## 18. Critérios de revisão técnica

Todo PR de implementação deverá responder:

- quais contratos desta SPEC foram implementados;
- quais arquivos e componentes foram criados ou alterados;
- como Server/Client boundaries foram preservadas;
- quais testes foram adicionados ou atualizados;
- quais viewports foram inspecionados;
- se houve mudança nos valores de tokens;
- se houve desvio visual em relação às referências;
- por que qualquer dependência nova é necessária;
- como fazer rollback do grupo sem quebrar o seguinte.

## 19. Desvios

Um desvio é permitido somente quando:

1. a implementação prevista for incompatível com versões reais fixadas;
2. o comportamento desejado violar acessibilidade ou contrato existente;
3. uma alternativa mais simples cumprir integralmente o PRD;
4. o PR registrar causa, decisão e impacto;
5. PRD, SPEC ou TASKS forem atualizados quando a mudança afetar grupos seguintes.

Não são desvios aceitáveis:

- ignorar teste por dificuldade;
- adicionar feature não planejada;
- usar PNG de referência em produção para ganhar tempo;
- instalar pacote para evitar implementar um componente pequeno;
- converter páginas inteiras em Client Components;
- remover comportamento mobile existente.

## 20. Definição técnica de pronto

A SPEC estará implementada quando:

- arquivos de referência permanecerem isolados em `docs/assets/redesign-ui`;
- SVGs finais existirem em `frontend/public/brand` e forem usados pela aplicação;
- tokens e fonte forem a base de todas as páginas redesenhadas;
- shell, auth, home e conversores cumprirem os contratos descritos;
- upload continuar direto ao FastAPI;
- todos os estados e downloads existentes funcionarem;
- acessibilidade e responsividade passarem por validação;
- gates finais estiverem verdes;
- nenhuma dependência, asset ou abstração não utilizada permanecer;
- PRD, SPEC, TASKS e README refletirem o estado real.
