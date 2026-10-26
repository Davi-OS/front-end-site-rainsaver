# front-end-site-rainsaver — Documentação Técnica

> **Integrado aos backends.** Autenticação via `go-auth-service` (JWT com `aud=rain-saver`); endereços e cálculo pluvial via `rain-saver`. **Só o mapa/ranking de estações do Dashboard continua simulado** em `localStorage` (`DEFAULT_STATIONS`). Além dos backends, a única chamada de rede é para a API pública ViaCEP.

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
    DashboardPage.tsx, PluvialCalculatorPage.tsx, SolarCalculatorPage.tsx, SettingsPage.tsx
    RootRedirect.tsx, NotFoundPage.tsx
  components/
    layout/    — AppLayout.tsx, AuthLayout.tsx, Header.tsx, SideNav.tsx
    ui/        — primitivos: Button, Input, Select, Card, Alert, Modal, Tabs (barrel em index.ts)
    address/   — AddressForm.tsx, AddressTable.tsx
    map/       — StationsMap.tsx (Leaflet)
  db/          — dados ainda simulados (só estações do Dashboard): storage.ts, stations.ts, seed.ts
  lib/         — format.ts, validation.ts, viaCep.ts, authErrors.ts / apiErrors.ts (mensagens pt-BR)
  types/       — user.ts, address.ts, station.ts, pluvial.ts, db.ts, index.ts
```

`src/api/` fala com o `go-auth-service` e o `rain-saver`; `src/db/` só guarda o dataset simulado de estações do Dashboard.

## Rotas

| Path | Componente | Protegida? | Layout |
|---|---|---|---|
| `/` | `RootRedirect` — redireciona para `/dashboard` se autenticado, senão `/login` | n/a | nenhum |
| `/login` | `LoginPage` | não | `AuthLayout` |
| `/cadastro` | `SignupPage` | não | `AuthLayout` |
| `/dashboard` | `DashboardPage` | **sim** | `AppLayout` |
| `/pluvial` | `PluvialCalculatorPage` | **sim** | `AppLayout` |
| `/solar` | `SolarCalculatorPage` | **sim** | `AppLayout` |
| `/settings` | `SettingsPage` | **sim** | `AppLayout` |
| `*` | `NotFoundPage` | não | nenhum |

Proteção via `<Route element={<ProtectedRoute />}>` envolvendo o grupo `AppLayout`: enquanto a sessão salva é validada (`status === 'loading'`) mostra um spinner; se anônimo, redireciona para `/login` preservando a rota tentada no state do router. Qualquer pessoa cria a conta em `/cadastro` (ver Autenticação); admins também podem criar contas pelo `go-auth-service`.

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
- `rain-saver` (`api/rainsaver.ts`, sempre via `authorized()`): `/enderecos` (listar, criar, excluir) e `/enderecos/:id/pluvial-economy` (calcular, último cálculo). Erros (403 sem permissão, 422 endereço não localizado, 503 geocodificação/estações indisponíveis) viram mensagens em `lib/apiErrors.ts`.
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
- **URLs dos backends**: o passo de build lê as **variáveis do repositório** `VITE_AUTH_API_URL` e `VITE_RAINSAVER_API_URL` (Settings → Secrets and variables → Actions → Variables). São variáveis, não secrets, porque acabam no bundle. O `vite.config.ts` faz um build de produção sem `VITE_AUTH_API_URL` falhar, para o site nunca ir ao ar apontando para `localhost`. Enquanto o rain-saver não tiver deploy, `VITE_RAINSAVER_API_URL` fica vazia: o login funciona, mas endereços e cálculo pluvial não.

## Próximos passos (integração real)

1. ~~Login real contra o `go-auth-service`~~ — feito.
2. ~~Endereços e cálculo pluvial via `rain-saver`~~ — feito (geocodificação no backend).
3. Dashboard: trocar o dataset mockado de estações (`DEFAULT_STATIONS`) por dados reais do `rain-saver` — exige um endpoint de listagem de estações, que ainda não existe.
4. Deploy: cadastrar o sistema `rain-saver` no auth da Azure (`POST /systems`), publicar o rain-saver e preencher as variáveis do repositório (ver Build & Deploy). Domínio próprio pode esperar até abrir para usuários reais. Se o ambiente da Azure for recriado, o FQDN muda, e com ele o `AUTH_ISSUER`, as `web_origins` e as `VITE_*`.
