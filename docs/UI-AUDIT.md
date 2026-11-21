# Auditoria de UI — RainSaver

Primeira auditoria em 2026-11-21 (estática, sobre `origin/main`); reauditoria no fim da branch `feature/ui-refresh`.
Regras: `web-design-guidelines` (Vercel, snapshot pinado) + contraste WCAG calculado sobre os tokens.
Direção visual: friendly + vibrant adaptada a água e sol (tokens `brand` e `sun` em `src/index.css`).

## Estado final

Verificado: `npm run build` (inclui `tsc -b`) e `oxlint` sem achados em `src/`; fluxo exercitado num Chrome headless contra backends mockados (login com erro, painel, calculadoras, configurações, modais, drawer) em 390 px e 1280 px. A verificação por navegador é de captura de tela e de foco/ARIA lidos via script; **não** houve teste com leitor de tela real nem em dispositivo físico.

### Bloqueantes (todos resolvidos)

| # | Achado | Resolução |
|---|---|---|
| B1 | Layout não responsivo (sidebar fixa) | Drawer abaixo de `lg` (Esc, clique no fundo, foco ao abrir/fechar, fora da ordem de tab quando fechado); páginas em uma coluna; tabela de endereços vira cartões; mapa com altura fluida |
| B2 | Foco visível ausente | `focus-visible` em todos os primitivos e na navegação; rede de segurança global em `index.css` |
| B3 | Erros de campo sem ligação | `aria-invalid`, `aria-describedby`, `role="alert"` em `Input`/`Select` |
| B4 | Modal sem semântica/teclado | `<dialog>` nativo (`showModal`): focus trap, Esc, `aria-labelledby`, foco restaurado, trava de rolagem, `overscroll-contain` |
| B5 | `lang="en"` com UI em pt-BR | `lang="pt-BR"` |
| B6 | Erros/carregamento não anunciados | `Alert` com `role` por variante; "Carregando…" com `role="status"`; resultados em região `aria-live` |
| B7 | Contraste < 4,5:1 | Placeholder 2,56→4,76; verde de valores 3,77→5,48; borda de campo 1,4→4,8 (limite de componente: 3:1) |

### Consistência e usabilidade (resolvidos, salvo a lista abaixo)

Skip link e landmarks (`nav`/`main` rotulados) · `aria-hidden` em ícones decorativos · Tabs com padrão ARIA e setas/Home/End · confirmação de exclusão em modal (fim do `confirm()` nativo) · foco no primeiro erro após enviar (`Alert focusOnMount`) · `autocomplete`/`inputMode`/`spellCheck` nos campos · `…` nos placeholders e estados de carregamento · `tabular-nums`, `scope`, `caption` nas tabelas · `text-wrap: balance` nos títulos · fontes carregadas (Noto Sans / Nunito) com `preconnect` · título do documento por página (`usePageTitle`) · `theme-color` e `description` · favicon da marca · cópia padronizada ("E-mail", botões específicos como "Salvar endereço") · `Intl.*` já usado em todos os formatos (`lib/format.ts`) · marca com `translate="no"`.

### Identidade (feito)

Paleta `brand` (água) + `sun` (acento quente), fonte de títulos serifada, cantos arredondados e sombras com tom da marca; Dashboard com indicadores, atalhos e mapa; resultado das calculadoras com número em destaque; telas de login, cadastro e 404 com a logo.

## O que ficou de fora (decisões em aberto)

1. **Modo escuro**: `color-scheme: light` fixo. Os tokens estão centralizados em `@theme`, então é viável, mas dobra o trabalho de contraste.
2. **Alternativa textual ao mapa**: o mapa tem rótulo de região, mas não há lista/busca de estações para quem não usa mouse. Com centenas de estações exigiria busca e paginação.
3. **Aviso de alterações não salvas** (formulários de endereço e senha) e **foco no `h1` a cada troca de rota**: não implementados.
4. **Validação nativa**: campos com `min`/`max`/`required` mostram o balão do navegador (ex.: potência acima de 1000 W) em vez do `Alert` do app.
5. **Fontes pelo Google Fonts**: uma requisição externa a mais; self-hospedar (ex.: `@fontsource`) elimina a dependência e melhora privacidade.
6. **Teste com tecnologia assistiva real** (NVDA/VoiceOver) e em aparelho físico.
7. `docs/ARCHITECTURE.md` ainda descreve a UI antiga (lista de primitivos sem `Skeleton`/`StatTile`, sem `PageHeader`/`Logo`, tokens azuis).

## Mapa das mudanças

- Fundação: `index.html`, `src/index.css`, `public/favicon.svg`
- Primitivos (`src/components/ui/`): `Button`, `Input`, `Select`, `Modal`, `Tabs`, `Alert`, `FullPageSpinner`; novos `fieldStyles.ts`, `Skeleton`, `StatTile`
- Layout (`src/components/layout/`): `AppLayout`, `Header`, `SideNav`, `AuthLayout`; novos `Logo`, `PageHeader`
- Páginas: `DashboardPage`, `PluvialCalculatorPage`, `SolarCalculatorPage`, `SettingsPage`, `NotFoundPage`, `LoginPage`, `SignupPage`
- Outros: `AddressTable`, `AddressForm`, `StationsMap`, `lib/authErrors.ts` ("E-mail"), novo `lib/usePageTitle.ts`
