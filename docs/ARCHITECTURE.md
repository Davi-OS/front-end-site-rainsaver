# front-end-site-rainsaver — Documentação Técnica

> ⚠️ **Integração parcial.** A **autenticação é real**: login, refresh, logout e troca de senha falam com o `go-auth-service` (JWT com `aud=rain-saver`). **Endereços, estações e cálculo pluvial ainda são simulados** em `localStorage` — a migração para o backend `rain-saver` é a próxima etapa (fase 4b). Além do auth, a única chamada de rede é para a API pública ViaCEP.

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
                       auth.ts (endpoints do go-auth-service), session.ts (authorized(): refresh automático)
  auth/               — AuthContext.tsx, context.ts, errors.ts, useAuth.ts, ProtectedRoute.tsx
  pages/
    auth/LoginPage.tsx
    DashboardPage.tsx, PluvialCalculatorPage.tsx, SolarCalculatorPage.tsx, SettingsPage.tsx
    RootRedirect.tsx, NotFoundPage.tsx
  components/
    layout/    — AppLayout.tsx, AuthLayout.tsx, Header.tsx, SideNav.tsx
    ui/        — primitivos: Button, Input, Select, Card, Alert, Modal, Tabs (barrel em index.ts)
    address/   — AddressForm.tsx, AddressTable.tsx
    map/       — StationsMap.tsx (Leaflet)
  db/          — dados ainda simulados: storage.ts, addresses.ts, calculations.ts, stations.ts, seed.ts
  lib/         — pluvial.ts (motor de cálculo), format.ts, validation.ts, viaCep.ts, authErrors.ts (mensagens pt-BR)
  types/       — user.ts, address.ts, station.ts, pluvial.ts, db.ts, index.ts
```

`src/api/` fala com o `go-auth-service`; `src/db/` continua sendo o "backend fake" (funções síncronas sobre um blob JSON em `localStorage`) para endereços, estações e cálculos.

## Rotas

| Path | Componente | Protegida? | Layout |
|---|---|---|---|
| `/` | `RootRedirect` — redireciona para `/dashboard` se autenticado, senão `/login` | n/a | nenhum |
| `/login` | `LoginPage` | não | `AuthLayout` |
| `/dashboard` | `DashboardPage` | **sim** | `AppLayout` |
| `/pluvial` | `PluvialCalculatorPage` | **sim** | `AppLayout` |
| `/solar` | `SolarCalculatorPage` | **sim** | `AppLayout` |
| `/settings` | `SettingsPage` | **sim** | `AppLayout` |
| `*` | `NotFoundPage` | não | nenhum |

Proteção via `<Route element={<ProtectedRoute />}>` envolvendo o grupo `AppLayout`: enquanto a sessão salva é validada (`status === 'loading'`) mostra um spinner; se anônimo, redireciona para `/login` preservando a rota tentada no state do router. Não há cadastro público: contas são criadas por um administrador da organização (`POST /orgs/{orgID}/users` no `go-auth-service`).

## Autenticação (go-auth-service)

Configuração em `.env` (ver `.env.example`; valores embutidos no build pelo Vite): `VITE_AUTH_API_URL` (default `http://localhost:8080`) e `VITE_RAINSAVER_API_URL` (default `http://localhost:8081`). Os backends precisam liberar a origem do front em `CORS_ALLOWED_ORIGINS`.

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
- **Endereços**: CRUD completo via `src/db/addresses.ts`, em um `Modal` reaproveitando `AddressForm`.

### Calculadora Pluvial (`PluvialCalculatorPage.tsx`)
Lógica real, sobre **dados de entrada totalmente mockados**:
1. Usuário escolhe um endereço salvo + área do telhado (m²) + tarifa de água (R$/m³).
2. `findStationByEstado(estado)` busca uma estação de referência **fixa por estado** em `DEFAULT_STATIONS` (`src/db/seed.ts`) — dataset escrito à mão, uma estação por capital, com chuva mensal "aproximação plausível" (comentário no código diz textualmente que não é meteorologicamente autoritativo).
3. Motor de cálculo, `calculatePluvialEconomy()` (`src/lib/pluvial.ts`):
   ```ts
   export const RUNOFF_EFFICIENCY = 0.8
   export function calculatePluvialEconomy({ roofAreaM2, monthlyRainfallMm, tariffPerM3, efficiency = RUNOFF_EFFICIENCY, ... }) {
     // por trimestre:
     // litersCaptured = roofAreaM2 * rainfallMm(trimestre) * efficiency
     // savingsBRL = (litersCaptured / 1000) * tariffPerM3
   }
   ```
   Note a diferença em relação ao backend real (`rain-saver`): aqui há um coeficiente de eficiência de 0.8 aplicado, e a agregação é **trimestral** (4 blocos: Jan-Mar, Abr-Jun, Jul-Set, Out-Dez) + total anual — o `rain-saver` real não aplica eficiência (1mm/m² = 1L exato) e agrega **mensal**.
4. `src/db/calculations.ts` define `saveCalculation()`/`listCalculationsByUser()` para um histórico, mas é **código morto** — `PluvialCalculatorPage.tsx` nunca chama `saveCalculation`, então o resultado é mostrado mas não persistido/rastreado.

### Dashboard — Estações Meteorológicas (`DashboardPage.tsx`)
Mostra o mesmo dataset mockado `DEFAULT_STATIONS` (27 entradas, uma por capital + DF) em:
- Mapa Leaflet (`StationsMap.tsx`), tiles do OpenStreetMap público, marcadores por círculo dimensionados/coloridos pela chuva anual estimada.
- Lista lateral ranqueada (top-10 por chuva anual), calculada no client.
Sem chamada de backend — tudo estático/mockado renderizado no navegador.

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
- `rain-saver`: ainda nenhuma chamada — endereços, estações e cálculo seguem em `src/db/*` sobre `localStorage`. `RAINSAVER_API_URL` e `authorized()` já estão prontos para a fase 4b.
- ViaCEP: `src/lib/viaCep.ts` (`fetch('https://viacep.com.br/ws/{cep}/json/')`).

## Estilo

Tailwind v4, tokens em `src/index.css`:
```css
@import "tailwindcss";
@theme {
  --color-brand-50: #eff9ff;
  /* ... escala brand completa até --color-brand-950 */
  --font-sans: "Inter", system-ui, "Segoe UI", Roboto, sans-serif;
}
html { color-scheme: light; }
```
Sem dark mode configurado. Sem biblioteca de componentes de terceiros (nada de shadcn/ui, Ant Design, MUI) — tudo em `src/components/ui/` é feito à mão (variantes via template literals, sem `cva`/`clsx`).

## Legado — `reference/greentech-legacy`

Projeto anterior ("GreenTech"), mantido só como referência histórica — **não é buildado nem importado** pelo app atual. Era Create React App + React 18 + Ant Design + axios + `.env` real, ou seja, **tinha** integração de backend de verdade. O app atual (`front-end-site-rainsaver`) é uma reescrita completa em TypeScript/Vite/Tailwind com a integração real removida e substituída pela camada mockada em `localStorage`.

## Build & Deploy

`.github/workflows/deploy.yml` → GitHub Pages:
- **Triggers**: push em `main` + `workflow_dispatch` manual.
- **Job build**: checkout → `setup-node@v4` (Node 24, cache npm) → `npm ci` → `npm run build` (`tsc -b && vite build`, gera `dist/` com base `/front-end-site-rainsaver/`) → `cp dist/index.html dist/404.html` (fallback de SPA, já que GitHub Pages não tem rewrite server-side) → `configure-pages@v5` → `upload-pages-artifact@v3`.
- **Job deploy**: `deploy-pages@v4`, ambiente `github-pages`.
- ⚠️ O build ainda não define `VITE_AUTH_API_URL`/`VITE_RAINSAVER_API_URL`, então o site publicado apontaria para `localhost`. Antes de levar esta integração para `main`, os backends precisam estar publicados e as URLs entrar no `env:` do passo de build.

## Próximos passos (integração real)

1. ~~Login real contra o `go-auth-service`~~ — feito (seção Autenticação).
2. Trocar `src/db/addresses.ts` por chamadas ao `rain-saver` (`/enderecos`) via `authorized()`. O `rain-saver` exige latitude/longitude e não tem `bairro` nem edição de endereço; decisão tomada: **geocodificar no backend** a partir de CEP/endereço.
3. Remover o dataset mockado de estações (`DEFAULT_STATIONS`) em favor de dados reais do `rain-saver` (hoje não há endpoint de listagem de estações).
4. Parar de calcular a economia pluvial no client e exibir o resultado de `/enderecos/:id/pluvial-economy` (mensal, sem coeficiente de eficiência, sem tarifa — alinhar a apresentação).
