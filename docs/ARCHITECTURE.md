# front-end-site-rainsaver — Documentação Técnica

> **Integrado aos backends.** Autenticação via `go-auth-service` (JWT com `aud=rain-saver`); endereços e cálculo pluvial via `rain-saver`. O mapa de estações do Dashboard lê a rota pública `GET /estacoes` do `rain-saver`. Além dos backends, a única chamada de rede é para a API pública ViaCEP.

## Stack / Tooling

- **React 19** + **react-dom 19**.
- **react-router-dom v7** (`BrowserRouter`/`Routes`/`Route`).
- **Vite 8** (`@vitejs/plugin-react`, usa Oxc, não SWC) + **TypeScript ~6.0** (`tsc -b` só faz type-check; a transpilação é toda do Vite, `noEmit: true`).
- **Tailwind CSS v4** via `@tailwindcss/vite` — **config CSS-first** (sem `tailwind.config.js`), tokens em `@theme` dentro de `src/index.css`.
- **oxlint** (linter em Rust) — **não há ESLint** neste projeto.
- **react-leaflet + leaflet** — mapa interativo da dashboard de estações.
- **lucide-react** — ícones.
- Sem lib de state management (Redux/Zustand/etc.) — só `useState` + um Context (`AuthContext`). Sem lib de HTTP client (axios/react-query/swr) — só `fetch` nativo, e só para o ViaCEP.

`vite.config.ts`:
```ts
export default defineConfig(({ command }) => ({
  // GitHub Pages serve este projeto em /front-end-site-rainsaver/, então só
  // prefixa o base path no build de produção — o dev server fica em "/".
  base: command === 'build' ? '/front-end-site-rainsaver/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
}))
```

Scripts: `dev`, `build` (`tsc -b && vite build`), `lint` (`oxlint`), `preview`.

## Estrutura de pastas

```
src/
  App.tsx            — tabela de rotas (fonte única de verdade de routing)
  main.tsx           — render do root React
  index.css          — import do Tailwind + tokens @theme
  config.ts          — base URLs dos backends (VITE_*) e o sistema/audience pedido no login
  api/               — http.ts (fetch + ApiError/NetworkError), tokens.ts (localStorage + decode do JWT),
                       auth.ts (endpoints do go-auth-service), session.ts (authorized(): refresh automático),
                       rainsaver.ts (endereços e economia pluvial no rain-saver)
  auth/               — AuthContext.tsx, context.ts, errors.ts, useAuth.ts, ProtectedRoute.tsx
  pages/
    auth/LoginPage.tsx
    DashboardPage.tsx (home pública), PluvialCalculatorPage.tsx, SolarCalculatorPage.tsx, SettingsPage.tsx
    NotFoundPage.tsx
  components/
    layout/    — AppLayout.tsx, AuthLayout.tsx, Header.tsx, SideNav.tsx, Logo.tsx, PageHeader.tsx
    ui/        — primitivos: Button, ButtonLink, Input, Select, Card, Alert, Modal, Tabs, Skeleton, StatTile, PageSpinner (barrel em index.ts)
    ads/       — AdSlot.tsx (espaço reservado para anúncio; desligado por padrão)
    address/   — AddressForm.tsx, AddressTable.tsx
    map/       — StationsMap.tsx (Leaflet)
  lib/         — format.ts, validation.ts, viaCep.ts, authErrors.ts / apiErrors.ts (mensagens pt-BR)
  types/       — user.ts, address.ts, station.ts, pluvial.ts, index.ts
```

`src/api/` fala com o `go-auth-service` e o `rain-saver`.

## Rotas

| Path | Componente | Protegida? | Layout |
|---|---|---|---|
| `/` | `DashboardPage` — **página inicial pública** (visitante vê CTA de cadastro; logado vê o painel com seus endereços) | **não** | `AppLayout` |
| `/assinatura` | `SubscriptionPage` — planos, assinar, cancelar (só existe com `VITE_SUBSCRIPTION_MODE=mock`; com `off` redireciona para `/`) | **não** (visitante vê os planos) | `AppLayout` |
| `/login` | `LoginPage` | não | `AuthLayout` |
| `/cadastro` | `SignupPage` | não | `AuthLayout` |
| `/dashboard` | redireciona para `/` (links antigos) | não | nenhum |
| `/pluvial` | `PluvialCalculatorPage` | **sim** | `AppLayout` |
| `/solar` | `SolarCalculatorPage` | **sim** | `AppLayout` |
| `/settings` | `SettingsPage` | **sim** | `AppLayout` |
| `*` | `NotFoundPage` | não | nenhum |

O `AppLayout` (cabeçalho + menu) envolve a home e as features; só as features (`/pluvial`, `/solar`, `/settings`) ficam dentro de `<ProtectedRoute />`: enquanto a sessão salva é validada (`status === 'loading'`) mostra um spinner na área de conteúdo; se anônimo, redireciona para `/login` preservando a rota tentada no state do router (login e cadastro devolvem o usuário a ela). Para visitantes o menu mostra as features com cadeado e o cabeçalho tem "Entrar"/"Criar conta". A home **nunca** chama endpoints autenticados como visitante: `authorized()` sem tokens expira a sessão e mostraria o aviso "sessão expirou" no login. Qualquer pessoa cria a conta em `/cadastro` (ver Autenticação); admins também podem criar contas pelo `go-auth-service`.

## Autenticação (go-auth-service)

Configuração em `.env` (ver `.env.example`; valores embutidos no build pelo Vite): `VITE_AUTH_API_URL` (default `http://localhost:8080`) e `VITE_RAINSAVER_API_URL` (default `http://localhost:8081`). Em produção o auth roda na Azure (`https://ca-auth.lemonmoss-8726f7e4.northcentralus.azurecontainerapps.io`). O auth libera a origem pelas `web_origins` do sistema `rain-saver` (`deploy/auth-system.json` do rain-saver, que já lista `https://davi-os.github.io`), e o rain-saver libera pelo `CORS_ALLOWED_ORIGINS` dele.

- **Senha definida pelo admin** (`LoginPage`): se o login responde 403 `password_change_required` (`PasswordChangeRequiredError`), a mesma tela pede nova senha + confirmação (política de `lib/validation.ts`: 10–128 caracteres), chama `POST /password/change {email, current_password, new_password}` (sem sessão) e loga com a nova senha. 403 `initial_password_expired` só mostra a mensagem: a senha inicial venceu e o admin precisa redefinir.
- **Cadastro** (`SignupPage`, `api/auth.ts` → `signup`): `POST /signup {email, password, system: "rain-saver"}` cria a conta com uma **org pessoal** do RainSaver (a pessoa é `owner`) e já devolve o par de tokens; o `AuthProvider` abre a sessão como no login (`startSession`). E-mail que já tem conta (por exemplo, em outro sistema do auth): com a senha dessa conta, o RainSaver é ativado nela; senha errada → 409 `email is already registered`; conta que já usa o RainSaver → 409 `already registered in this system` ("Entre com ela"). Conta com senha provisória → mensagem mandando para o login, que faz a troca. 429 (rate limit por IP do auth) → "Muitas tentativas".
- **Login** (`api/auth.ts`): `POST /login` com `system: "rain-saver"`. Se a conta pertence a várias organizações, o servidor responde 409 `org_required` e a `LoginPage` mostra um seletor de organização e reenvia com `org`. Um token **sem claim `org`** (conta sem acesso ao RainSaver) é recusado no front (`NoAccessError`) e revogado. Depois do login, `GET /me` traz `{id, email}`.
- **Tokens** (`api/tokens.ts`): par access/refresh em `localStorage['rainsaver:tokens:v1']`, compartilhado entre abas (logout em uma aba encerra as outras via evento `storage`). Trade-off: exposto a XSS; a alternativa seria refresh token em cookie httpOnly, que o `go-auth-service` ainda não suporta.
- **Refresh** (`api/session.ts`): `authorized(call)` renova o access token se faltarem <30s para expirar e, num 401, faz **um** refresh e repete a chamada. Refreshes concorrentes são unificados (o refresh token é rotacionado a cada uso; duas renovações paralelas derrubariam a sessão). Se a renovação falhar, a sessão expira: tokens limpos, `onSessionExpired` notifica o `AuthProvider` e o login mostra "Sua sessão expirou".
- **Inicialização**: com tokens salvos, o `AuthProvider` começa em `loading` e valida a sessão com `GET /me` (via `authorized`, então renova se preciso).
- **Logout**: limpa a sessão local e chama `POST /logout` (revoga o refresh token e o access token no servidor) em best effort.
- **Troca de senha** (aba Conta em Configurações): `POST /me/password`; o servidor encerra **todas** as sessões, então o front volta ao login com aviso.
- Mensagens de erro para o usuário: `lib/authErrors.ts`.

## Funcionalidades

### Configurações (`SettingsPage.tsx`)
Duas abas:
- **Conta**: mostra o email da conta e permite trocar a senha (ver Autenticação). Nome/sobrenome/gênero saíram da UI: o `go-auth-service` só guarda email; onde o perfil vai morar será decidido quando houver necessidade.
- **Endereços**: listar, criar e excluir via `rain-saver` (`api/rainsaver.ts`). O formulário (`AddressForm`) preenche logradouro/bairro/cidade/UF pelo ViaCEP e **não pede coordenadas**: o backend geocodifica (Nominatim) e responde 422 se não localizar o endereço. Não há edição — os cálculos guardam a estação escolhida para a localização original; para corrigir, exclui e cria de novo (excluir apaga também os cálculos do endereço).

### Calculadora Pluvial (`PluvialCalculatorPage.tsx`)
O cálculo é feito pelo **backend**: `POST /enderecos/:id/pluvial-economy` com a área do telhado devolve a captação **mensal** dos últimos 12 meses medidos pela estação INMET mais próxima do endereço (`station_code`, `distance_km`), com `litros = área(m²) × chuva(mm)` — sem coeficiente de eficiência. Ao escolher um endereço, o último cálculo dele é carregado (`GET`, 404 = nenhum ainda). A tarifa (R$/m³) é só apresentação: a economia em R$ é `litros / 1000 × tarifa`, calculada no client. O antigo motor trimestral com eficiência de 0,8 (`lib/pluvial.ts`) foi removido.

### Dashboard — Estações Meteorológicas (`DashboardPage.tsx`)
Mostra todas as estações INMET mapeadas (`GET /estacoes` do `rain-saver`, rota pública, sem token) em um mapa Leaflet (`StationsMap.tsx`), tiles do OpenStreetMap público, um marcador por círculo com nome, UF e código no popup. Sem clustering (~600 marcadores renderizam bem). Não há ranking de chuva: a rota só devolve código, nome, coordenadas e UF.

### Calculadora Solar (`SolarCalculatorPage.tsx`)
**Placeholder puro**, sem nenhuma lógica:
```tsx
export function SolarCalculatorPage() {
  return (
    <Card className="flex flex-col items-center gap-3 py-16 text-center">
      <Sun className="h-10 w-10 text-amber-400" />
      <h1 className="text-lg font-semibold text-slate-900">Economia Solar</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Essa calculadora ainda está em construção...
      </p>
    </Card>
  )
}
```
Roteada em `/solar` e listada na navegação lateral, mas sem inputs nem cálculo.

## Integração com API — o que existe hoje

- `go-auth-service`: autenticação completa (seção acima), via `src/api/`.
- `rain-saver` (`api/rainsaver.ts`, sempre via `authorized()`): `/enderecos` (listar, criar, excluir) e `/enderecos/:id/pluvial-economy` (calcular, último cálculo). Erros (403 sem permissão, 422 endereço não localizado, 503 geocodificação/estações indisponíveis) viram mensagens em `lib/apiErrors.ts`.
- ViaCEP: `src/lib/viaCep.ts` (`fetch('https://viacep.com.br/ws/{cep}/json/')`).

## Estilo

Tailwind v4, tokens em `src/index.css`:
```css
@import "tailwindcss";
@theme {
  --color-brand-50: #ecf9fc;      /* água: escala completa até --color-brand-950 (600 = #0e7c93) */
  --color-sun-50: #fff6ee;        /* acento quente: escala até --color-sun-900 */
  --color-canvas: #f7fbfc;        /* fundo da página */
  --color-ink: #12303a;           /* texto do corpo */
  --font-sans: "Noto Sans", system-ui, "Segoe UI", Roboto, sans-serif;
  --font-display: "Nunito", system-ui, sans-serif;   /* h1–h3 */
  /* + raios (--radius-md..2xl) e sombras tingidas; ver o arquivo */
}
html { color-scheme: light; }
```
Direção visual: friendly + vibrant adaptada a água e sol; pares de cor com contraste AA (ver `docs/UI-AUDIT.md`). Fontes via Google Fonts. Sem dark mode configurado. Sem biblioteca de componentes de terceiros (nada de shadcn/ui, Ant Design, MUI) — tudo em `src/components/ui/` é feito à mão (variantes via template literals, sem `cva`/`clsx`).

## Legado — `reference/greentech-legacy`

Projeto anterior ("GreenTech"), mantido só como referência histórica — **não é buildado nem importado** pelo app atual. Era Create React App + React 18 + Ant Design + axios + `.env` real, ou seja, **tinha** integração de backend de verdade. O app atual (`front-end-site-rainsaver`) é uma reescrita completa em TypeScript/Vite/Tailwind com a integração real removida e substituída pela camada mockada em `localStorage`.

## Build & Deploy

`.github/workflows/deploy.yml` → GitHub Pages:
- **Triggers**: push em `main` + `workflow_dispatch` manual.
- **Job build**: checkout → `setup-node@v4` (Node 24, cache npm) → `npm ci` → `npm run build` (`tsc -b && vite build`, gera `dist/` com base `/front-end-site-rainsaver/`) → `cp dist/index.html dist/404.html` (fallback de SPA, já que GitHub Pages não tem rewrite server-side) → `configure-pages@v5` → `upload-pages-artifact@v3`.
- **Job deploy**: `deploy-pages@v4`, ambiente `github-pages`.
- **URLs dos backends**: o passo de build lê as **variáveis do repositório** `VITE_AUTH_API_URL` e `VITE_RAINSAVER_API_URL` (Settings → Secrets and variables → Actions → Variables). São variáveis, não secrets, porque acabam no bundle. O `vite.config.ts` faz um build de produção sem `VITE_AUTH_API_URL` falhar, para o site nunca ir ao ar apontando para `localhost`. Enquanto o rain-saver não tiver deploy, `VITE_RAINSAVER_API_URL` fica vazia: o login funciona, mas endereços e cálculo pluvial não.

## Próximos passos (integração real)

1. ~~Login real contra o `go-auth-service`~~ — feito.
2. ~~Endereços e cálculo pluvial via `rain-saver`~~ — feito (geocodificação no backend).
3. ~~Dashboard com estações reais~~ — feito (`GET /estacoes`).
4. Deploy: cadastrar o sistema `rain-saver` no auth da Azure (`POST /systems`), publicar o rain-saver e preencher as variáveis do repositório (ver Build & Deploy). Domínio próprio pode esperar até abrir para usuários reais. Se o ambiente da Azure for recriado, o FQDN muda, e com ele o `AUTH_ISSUER`, as `web_origins` e as `VITE_*`.

## Assinatura e anúncios

**Anúncios.** `components/ads/AdSlot.tsx` reserva uma caixa rotulada "Publicidade". Fica **desligada** (não renderiza nada) a menos que `VITE_ADS_ENABLED=true` no build; ligada, mostra só o espaço vazio (`data-ad-slot`), sem script de terceiros nem requisição externa. Aparece em dois lugares: abaixo do mapa da home e **abaixo do resultado de cada cálculo** (solar e pluvial) que o usuário dispara. A `key` do `AdSlot` é o contador de cálculos, então ele é remontado (renovado) a cada cálculo; o resultado pré-carregado ao abrir a página ou ao trocar de endereço **não** ganha anúncio, e o anúncio fica fora da região `aria-live`. **Assinante não vê anúncio em lugar nenhum**: o `AdSlot` não renderiza para ele, nem enquanto ainda se descobre se é assinante (`ready`), para o anúncio não piscar para quem paga. Antes de ligar de verdade faltam: integração da rede de anúncios, banner de consentimento (LGPD), política de privacidade e `ads.txt`.

**Quem é assinante.** `useSubscription()` (`src/subscription/`) responde. `isSubscriber` é verdadeiro quando o **token de acesso traz a permissão `plan:subscriber`** em `perms` (caminho real, lido no cliente: serve para UX, nunca para autorizar algo no servidor) ou, no modo `mock`, quando o fake local tem uma assinatura ativa ou em cancelamento para o usuário. A permissão só vai existir quando o auth a emitir; um flag novo no token aparece no máximo 15 min depois (TTL do access token) ou no próximo login.

**Interruptor `VITE_SUBSCRIPTION_MODE`.** `off` (padrão; produção nunca define): sem item de menu, `/assinatura` redireciona para `/`, ninguém é assinante pelo mock. `mock`: as telas funcionam contra `subscription/mockClient.ts`, um fake **só do navegador** (estado em `localStorage`, por usuário, latência de ~600 ms, renova ou encerra sozinho quando o período acaba). `VITE_SUBSCRIPTION_MOCK_FAIL=subscribe|cancel|resume` faz a ação falhar, para testar os estados de erro.

**Telas (`/assinatura`).** Visitante: planos e "Criar conta"/"Já tenho conta" (voltam para a página). Logado sem assinatura: seletor de plano (radios nativos), "Assinar" e um modal de confirmação **sem campos de pagamento** e com o aviso de demonstração. Assinante: cartão de status e "Cancelar assinatura" (modal que explica que o acesso segue até o fim do período e põe o foco em "Manter assinatura"). Cancelamento agendado: aviso com a data e "Reativar assinatura". Os planos e preços **vêm do backend** (`GET /planos`, abaixo); a tela mostra carregando, erro com "Tentar de novo" e lista vazia.

**Planos e preços (`GET /planos`).** Rota **pública** (visitante precisa ver os preços) no rain-saver (`VITE_RAINSAVER_API_URL`, como `/estacoes`), sem token. Resposta 200, a **ordem do array é a ordem de exibição**:
```json
[{ "id": "mensal", "name": "Mensal", "price_cents": 990, "currency": "BRL", "interval": "month", "highlight": null },
 { "id": "anual",  "name": "Anual",  "price_cents": 9900, "currency": "BRL", "interval": "year", "highlight": "Mais econômico" }]
```
`price_cents` é inteiro (sem ponto flutuante), `interval` é `month` ou `year`, `highlight` é opcional e o plano que o traz vem selecionado por padrão (senão o primeiro). O front (`listPlans` em `api/rainsaver.ts`) **descarta sem quebrar** plano com moeda diferente de BRL, intervalo desconhecido, preço inválido ou id repetido. A assinatura guarda um **snapshot do plano contratado** (nome, preço, período): o catálogo pode mudar ou o plano sair do ar sem alterar quem já assinou. Assinar, cancelar e reativar continuam no mock do navegador; só o catálogo vem do servidor.

**Servidor de mock para desenvolvimento (`dev/mock-api/`).** `npm run mock:api` sobe, só em `127.0.0.1`, um fake do auth (porta 8080) e do rain-saver (8081): login/cadastro, estações, endereços, cálculos e `GET /planos`. Fora do build e do deploy. Para ver a assinatura: `npm run mock:api` e, em outro terminal, `VITE_SUBSCRIPTION_MODE=mock npm run dev` (acrescente `VITE_ADS_ENABLED=true` para ver os anúncios). Contas de teste: qualquer e-mail e senha entram; `erro...` é recusado (401); `assinante...` recebe um token com `plan:subscriber`. O catálogo servido é `dev/mock-api/plans.json`, relido a cada requisição (edite e recarregue). Variáveis: `MOCK_AUTH_PORT`, `MOCK_RAINSAVER_PORT`, `MOCK_PLANS_MODE=error|empty` (500 ou lista vazia) e `MOCK_LATENCY_MS` (padrão 250). Em desenvolvimento o React (StrictMode) dispara o efeito duas vezes, então `/planos` aparece duas vezes no log; em produção é uma.

**Caminho para a etapa dos serviços.** (0) rain-saver: implementar `GET /planos` com o contrato acima (o front já o consome); (1) auth/rain-saver: papel `subscriber` com a permissão `plan:subscriber` no catálogo do sistema `rain-saver`, concedido por quem cobra (o dono da org não consegue se conceder: a anti-escalação exige já ter as permissões do papel); (2) uma implementação "live" de `SubscriptionClient` (`subscription/client.ts`) para a cobrança, com checkout hospedado em vez de formulário próprio, escolhida em `subscription/store.ts`; (3) remover o mock e o modo `mock`.
