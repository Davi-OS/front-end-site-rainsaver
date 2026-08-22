# front-end-site-rainsaver — Documentação Técnica

> ⚠️ **Este frontend não fala com nenhum backend real.** Toda a "persistência" (usuários, sessão, endereços, estações meteorológicas, cálculos) é simulada inteiramente em `localStorage` no navegador. Login/registro comparam senha em texto puro — **não há JWT, não há hashing, não há chamada de rede para o `rain-saver`**. A única requisição de rede real do app inteiro é para a API pública ViaCEP (autocomplete de CEP). Trate tudo neste documento como um protótipo client-side navegável, não como um cliente do backend `rain-saver` real.

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
  auth/               — AuthContext.tsx, context.ts, useAuth.ts, ProtectedRoute.tsx
  pages/
    auth/LoginPage.tsx, auth/RegisterPage.tsx
    DashboardPage.tsx, PluvialCalculatorPage.tsx, SolarCalculatorPage.tsx, SettingsPage.tsx
    RootRedirect.tsx, NotFoundPage.tsx
  components/
    layout/    — AppLayout.tsx, AuthLayout.tsx, Header.tsx, SideNav.tsx
    ui/        — primitivos: Button, Input, Select, Card, Alert, Modal, Tabs (barrel em index.ts)
    address/   — AddressForm.tsx, AddressTable.tsx
    map/       — StationsMap.tsx (Leaflet)
  db/          — o "backend fake": storage.ts, users.ts, addresses.ts, calculations.ts, stations.ts, seed.ts
  lib/         — pluvial.ts (motor de cálculo), format.ts, validation.ts, viaCep.ts (única chamada de rede real)
  types/       — user.ts, address.ts, station.ts, pluvial.ts, db.ts, index.ts
```

Não existe `services/`/`api/` para um backend real — quem cumpre esse papel é `src/db/` (funções TS síncronas lendo/escrevendo um blob JSON único em `localStorage`).

## Rotas

| Path | Componente | Protegida? | Layout |
|---|---|---|---|
| `/` | `RootRedirect` — redireciona para `/dashboard` se autenticado, senão `/login` | n/a | nenhum |
| `/login` | `LoginPage` | não | `AuthLayout` |
| `/register` | `RegisterPage` | não | `AuthLayout` |
| `/dashboard` | `DashboardPage` | **sim** | `AppLayout` |
| `/pluvial` | `PluvialCalculatorPage` | **sim** | `AppLayout` |
| `/solar` | `SolarCalculatorPage` | **sim** | `AppLayout` |
| `/settings` | `SettingsPage` | **sim** | `AppLayout` |
| `*` | `NotFoundPage` | não | nenhum |

Proteção via `<Route element={<ProtectedRoute />}>` envolvendo o grupo `AppLayout`, checando `useAuth().isAuthenticated` e redirecionando para `/login` (preservando a rota tentada no state do router).

## "Autenticação" (mockada)

- `src/db/storage.ts` — chaves usadas: `localStorage['rainsaver:db:v1']` (banco inteiro) e `localStorage['rainsaver:session:v1']` (sessão).
- **Login** (`verifyCredentials` em `src/db/users.ts`): comparação de senha **em texto puro** (`user.password !== password`) contra o array de usuários no blob localStorage. Sem hashing, sem token — sucesso grava `{ userId }` em `SESSION_KEY`.
- **Registro** (`createUser`): checa email duplicado, gera `crypto.randomUUID()`, cria o usuário + um endereço vinculado, loga automaticamente.
- **Logout**: `setSession(null)` (remove a chave), limpa o state React, navega para `/login`.
- **Sem JWT, sem expiração/refresh, sem header Authorization** — não existe nada para anexar, porque não existe requisição de API autenticada nenhuma.
- `AuthProvider` (`src/auth/AuthContext.tsx`) resolve o usuário atual lendo a sessão do localStorage a cada carregamento de página.

## Funcionalidades

### Login / Registro
Descrito acima. Registro também coleta endereço via `AddressForm` (que usa o ViaCEP real para autocomplete por CEP).

### Configurações / Perfil (`SettingsPage.tsx`)
Duas abas:
- **Perfil**: edita nome via `useAuth().updateProfile()` → `updateUserProfile()` (localStorage).
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

Não há client HTTP tipado, nem base URL configurável, nem `.env`/variável de ambiente de backend neste repositório (diferente do app legado, que usava `axios` + `.env`). O único código que faz `fetch` é `src/lib/viaCep.ts`:
```ts
async function lookupCep(cep: string) { /* fetch('https://viacep.com.br/ws/{cep}/json/') */ }
```
Tudo o mais é `src/db/*` operando sobre `JSON.parse(localStorage.getItem(...))`.

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

## Próximos passos (integração real)

`src/db/*` é o ponto de integração natural para plugar o backend `rain-saver` de verdade: as assinaturas de função (`createUser`, `verifyCredentials`, `listAddressesByUser`, `saveCalculation`, `listStations`, etc.) já espelham o que os endpoints reais oferecem. Para integrar de fato seria necessário:
1. Substituir a "autenticação" local por login real contra o `go-auth-service` (via `rain-saver` ou diretamente), guardando o JWT (não mais um `userId` puro) e anexando `Authorization: Bearer`.
2. Trocar as funções de `src/db/` por chamadas HTTP ao `rain-saver` (`/enderecos`, `/enderecos/:id/pluvial-economy`), com uma base URL configurável via env var.
3. Remover o dataset mockado de estações (`DEFAULT_STATIONS`) em favor dos dados reais servidos pelo `rain-saver` (que já busca a estação mais próxima via Haversine e usa dados agregados pelo `inmet-rain-ingestor`).
4. Ajustar a fórmula do cálculo pluvial no frontend para bater com a do backend real (sem coeficiente de eficiência, agregação mensal em vez de trimestral) — ou simplesmente parar de calcular no client e exibir o resultado que a API já retorna.
