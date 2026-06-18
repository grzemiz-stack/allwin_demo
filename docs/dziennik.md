# Dziennik prac — Allwin demo

## 2026-06-16 — Faza 1: szkielet + tryb skryptowy

Scaffold `~/dev/agentro` (Next.js 14.2, App Router, TS, bez Tailwinda, bez ESLint).

Zrobione:
- Port prototypu `allwin-demo.html` na route `/demo`.
- Wspólny kontrakt zdarzeń `DemoEvent` (`lib/demo/events.ts`) + czysty
  `eventReducer` (`lib/demo/reducer.ts`).
- `scenarios.ts` — scenariusz „flak na S11" przeniesiony 1:1 (wszystkie
  opóźnienia `t` zachowane). Sentinel `{{elapsed}}` na karcie zamknięcia.
- `scriptRunner.ts` — harmonogram setTimeout + cleanup + podstawienie elapsed.
- Komponenty: `DemoStage` (orkiestrator, timer, `emit`), `TopBar`, `CallPanel`,
  `Transcript`, `OpsConsole`, `OpsCard`, `ModulesBar`.
- Style `globals.css` portowane 1:1; fonty przez `next/font`.
- Seamy fazy 2 wbudowane: flaga `voiceDegraded`, klasa `.highlight`, pasek
  `.voice-degraded`, zdarzenia `reset` / `voice:degraded`.
- Przycisk „Zadzwoń sam" widoczny, na razie `disabled` (live niepodpięty — nie
  detekcja przeglądarki).

Decyzje:
- Lokalizacja: nowy `~/dev/agentro`. Demo bezstanowe — bez bazy.
- Guardraile (faza 2): in-memory + client-side cap.
- Watchdog: degraded → potem ciche rozłączenie (kolejność krytyczna).

Następne (faza 2): `vapiSource.ts`, `/api/demo/tool`, `/api/demo/session`,
gate click-to-talk, cap 90 s, watchdog audio.

## 2026-06-16 — Faza 2: tryb LIVE (Vapi) + guardraile + izolacja client-side

Zainstalowano `@vapi-ai/web@2.5.2`.

Zrobione:
- `lib/demo/vapiSource.ts` — drugie źródło `DemoEvent`. Dynamiczny import SDK
  (unika SSR). Mapuje transcript(final)→bąbelek, function-call/tool-calls→
  `mapToolCall`→karty + `vapi.send` z fabrykowanym wynikiem. Eventy
  call-start/end/error/volume-level/speech-start. Idempotentny `stop()`.
- `lib/demo/toolMap.ts` — kontrakt narzędzi client-side (izolacja). Handlery:
  checkTireInventory / findNearestMechanic / bookService / sendSmsConfirmation +
  fallback. Wartości z modelu escapowane przed wstrzyknięciem do HTML logów.
- `app/api/demo/session/route.ts` — in-memory rate-limit 3/15 min per IP (Node
  runtime, sliding window). 429 + Retry-After.
- `DemoStage` — tryb `idle/script/connecting/live`, gate (session→Vapi), live
  przycisk (Zadzwoń / łączenie… / ■ Zakończ), wzajemna blokada trybów, czytanie
  ENV (brak → live disabled).
- `events.ts`/`reducer.ts` — wariant `notice` + pole `notice`.
- `CallPanel` — stany live + pasek `notice`; `globals.css` — `.notice`.

ZMIANA vs pierwotny plan: **brak `/api/demo/tool`** — narzędzia client-side,
tool-calls obsługiwane na froncie. Public key tylko jako `NEXT_PUBLIC_`.

Decyzje: kontrakt narzędzi definiujemy my (toolMap), asystent demo w Vapi do
skonfigurowania pod te nazwy; rate-limit 3/15 min; watchdog degraded→komunikat→
rozłączenie (grace ~1,5 s).

Weryfikacja: `tsc` + `build` czyste; `/demo` regresja skryptu OK; rate-limit
200/200/200/429 (retryAfter 900); Vapi dynamicznie importowany (initial bundle
`/demo` 7,3 kB). Pełne e2e live wymaga skonfigurowanego asystenta demo + ENV
(po stronie użytkownika).

Doprecyzowanie kontraktu narzędzi (dokładne nazwy z system promptu asystenta,
po polsku): `utworz_zlecenie(usluga,pojazd?,rozmiar?)`→Zlecenie,
`sprawdz_magazyn(rozmiar)`→Magazyn, `znajdz_mechanika(lokalizacja)`→Dyspozytor
(jedno wywołanie = cała choreografia), `wyslij_sms(numer?)`→SMS wysłany. Dodano
`docs/vapi-assistant-setup.md`.

Staggerowanie choreografii (spójność trybów): `ToolOutcome` zwraca teraz
`steps: ScenarioStep[]` (z odstępami) zamiast płaskiej listy zdarzeń. Wydzielono
`scheduleSteps()` ze `scriptRunner` — wspólny scheduler dla obu trybów;
`runScenario` to jego alias. `vapiSource.handleTool` planuje choreografię przez
`scheduleSteps` (uchwyty anulowane przy `stop()`/cap/rozłączeniu), a wynik wraca
do asystenta od razu (bot mówi, ops kaskaduje równolegle). `znajdz_mechanika`
rozkłada się na ~3,5 s (0/700/1200/1700/2500/3500 ms), magazyn i zlecenie też
mają naturalny rytm. Tryb skryptowy i live używają identycznej mechaniki czasu.

## 2026-06-18 — Nowy scenariusz skryptowy: meta-demo gabinet kosmetyczny

Podmiana scenariusza skryptowego (tire → salon) wg skryptu Marcina
(„SKRYPT POKAZOWY — wersja robocza do akceptacji").

Zrobione:
- `scenarios.ts`: `s11Scenario` → `salonScenario`. Meta-demo: Ołłin przedstawia
  się właścicielowi, słyszy branżę (gabinet kosmetyczny) i odgrywa przykładowe
  połączenie z klientką. 10 kroków 1:1 ze skryptem; moduły zapalają się na
  zielono kolejno: Recepcjonista AI → Kwalifikacja leadów → Rezerwacja terminów
  → Płatności i zaliczki → Follow-up SMS/Email → (opcjonalnie) Przekazanie do
  człowieka. Karta „Podsumowanie" z sentinelem `{{elapsed}}`.
- Trzeci mówca: `Role` rozszerzony o `'owner'` (właściciel/rozmówca demo).
  `Transcript` mapuje: bot→„Ołłin", user→„Klient" (klient w przykładzie),
  owner→„Właściciel". Nowy styl `.row.owner` (akcent --signal, prawa strona).
- `CallPanel`: nagłówek „Szybka Guma — wulkanizacja" → „Ołłin — asystent Allwin"
  (avatar AI). `ModulesBar`: chipy dopasowane do scenariusza salon.
- `DemoStage` używa `salonScenario`.

Weryfikacja: `tsc --noEmit` czysty, `npm run build` czysty (/demo 7,33 kB).

UWAGA / dług: tryb LIVE nie został zmieniony. Asystent Vapi + `toolMap.ts`
(`utworz_zlecenie`/`sprawdz_magazyn`/`znajdz_mechanika`/`wyslij_sms`) to wciąż
wertykal wulkanizacji. Aby „Zadzwoń sam" pasował do demo salonu, trzeba
przekonfigurować asystenta demo w Vapi (po polsku) i `toolMap` pod moduły
kosmetyczne (rezerwacja/zaliczka/follow-up). Skrypt = salon, live = tire.
