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

## 2026-06-23 — Nowy wertykal skryptowy: ClimaPolska (HVAC)

Branch `feat/climapolska-demo` z `feat/salon-demo`. Dodanie wertykalu HVAC
(montaż i serwis klimatyzacji / pomp ciepła) jako drugiego scenariusza
skryptowego — **współistnienie**, salon zostaje.

Zrobione:
- `scenarios.ts`: dopisany `export const climaScenario` obok `salonScenario`
  (salon nietknięty). Meta-demo: Allwin → właściciel ClimaPolska. Główny
  przebieg = **lead** (oględziny), drugi krótki beat = **ticket** (awaria).
  Dwa moduły z dokładnymi kontraktami pól:
  - karta `konsultacja` (lead) — KV: typObiektu, liczbaPomieszczen, zakres,
    lokalizacja, preferowanyTermin, imie, telefon; status:
    nowy → termin_zaproponowany → potwierdzony (wypełniane krok po kroku).
  - karta `zgloszenie` (ticket) — KV: typZgloszenia, urzadzenie, objaw,
    pilnosc, lokalizacja, imie, telefon, preferowanyTermin (pełna karta + KV
    od razu gotowe); status: nowe → przyjete → zaplanowane.
  Karty wspierające: `recepcja`, `przekazanie`, `recap` (sentinel `{{elapsed}}`).
- `DemoStage`: przełączony import i użycie `salonScenario` → `climaScenario`
  (l. 14 + 92). Reszta orkiestracji bez zmian.
- `ModulesBar`: `MODULES[]` pod HVAC — aktywne: Recepcjonista AI →
  Konsultacja/oględziny → Zgłoszenie serwisowe/awaria → Przekazanie do
  człowieka; „do dołożenia": Wyceny i kosztorysy, Przeglądy okresowe,
  Dyspozytor ekip, Przypomnienia SMS/Email, Gwarancje, Wielojęzyczność.

Decyzje (zatwierdzone): brand „Allwin" + akcent pomarańczowy bez zmian —
`globals.css`/`layout.tsx`/`CallPanel.tsx` NIE ruszane.

UWAGA / dług: jak w salonie, tryb LIVE (Vapi + `toolMap.ts`) nie został
zmieniony — wciąż wulkanizacja. Skrypt = ClimaPolska, live = tire.

## 2026-06-24 — Nowy route `/panel`: back-office „Panel zgłoszeń" (ClimaPolska)

Branch `feat/climapolska-demo`. Dodanie drugiego widoku obok `/demo`: backoffice,
w którym leady i zgłoszenia serwisowe „złapane z rozmów" lądują jako tablica
kanban (recepcja/dyspozycja). Wzorzec designu: `climapolska-backoffice.jsx`
(kanban + szuflada detali + ślad „z rozmowy"). Demo nadal bezstanowe — seed +
`useState`, bez bazy.

Zrobione:
- `lib/panel/contracts.ts` — kontrakt pól i statusów leada/zgłoszenia (źródło
  prawdy dla `/panel`): `LEAD_FLOW` (nowy → termin_zaproponowany → potwierdzony),
  `SERV_FLOW` (nowe → przyjete → zaplanowane), `LEAD_FIELDS`/`SERV_FIELDS`,
  `PILNOSC`, typy `Lead`/`Ticket`, helpery `statusMeta`/`nextStatus`. Mirroruje
  `climaScenario` (scenarios.ts:260–266) — przy zmianie kontraktu zmienić OBA.
- `lib/panel/seed.ts` — 5 leadów + 4 zgłoszenia (Poznań, spójnie ze scenariuszem;
  L-1042 Marek Kowalski / Grunwald i S-2208 Anna Nowak / biuro wprost z `climaScenario`).
- `components/panel/`: `icons.tsx` (14 inline SVG zamiast lucide), `Pills.tsx`
  (StatusPill + CaptureTag „z rozmowy"), `Card.tsx`, `Column.tsx`, `Drawer.tsx`
  (wiersze pól iterowane po kontrakcie; „Przesuń do: <następny status>"),
  `PanelBoard.tsx` (taby lead/serwis, KPI nowe/pilne/łącznie, tablica + szuflada,
  `advance` przesuwa status lokalnie).
- `app/panel/page.tsx` — route + `metadata`.
- `app/globals.css` — nowe tokeny `--mid`/`--mid-soft` (niebieski, środkowy status)
  + sekcja `.panel-*` (port designu na klasy CSS, jasna paleta na `--paper`,
  akcent `--signal`, domknięcie `--confirm`, szuflada slide-in, responsywność).

Decyzje (zatwierdzone):
- Kontrakt `/panel` osobny (`lib/panel/contracts.ts`); `climaScenario`/`scenarios.ts`
  NIE ruszane — uniknięcie ryzyka regresji działającego demo. Kontrakt mirrorowany,
  nie współdzielony (komentarz „zmień OBA miejsca").
- Środkowy status = nowy token `--mid` (brak istniejącego niebieskiego); jasna
  paleta na `var(--paper)`; zero nowych zależności (lucide → inline SVG, fonty
  jak w projekcie).
- Seed = Poznań (miasto `climaScenario`), nie Warszawa z wzorca jsx.

Dla instrukcji obsługi: nowy ekran pod adresem `/panel` — „Panel zgłoszeń". Pod
górnym paskiem dwie zakładki: **Leady — oględziny** i **Serwis**. Każda pokazuje
tablicę z kolumnami wg etapu (np. dla leadów: Nowy → Termin zaproponowany →
Potwierdzony). W wersji demo to przykładowe pozycje pokazujące, jak zgłoszenia
z rozmów wyglądają w panelu — każda ma znacznik „z rozmowy" i godzinę. Docelowo
na produkcji wpadają tu automatycznie z każdej odebranej rozmowy, bez ręcznego
przepisywania. Awarie pilne mają czerwoną plakietkę „Pilne". Kliknięcie karty otwiera
z prawej szufladę ze szczegółami i telefonem; przyciskiem **„Przesuń do: …"**
przesuwa się zgłoszenie do następnego etapu (np. z „Nowy" na „Termin
zaproponowany"). U góry liczniki: ile nowych dziś, ile pilnych, ile łącznie.
(Nowy ekran — przyda się screenshot do instrukcji.)

Weryfikacja: `npm run build` exit 0 (route `/panel` static, 3,9 kB); `/demo`
bez zmian (8,09 kB). `npm run dev` → `GET /panel` 200, SSR renderuje treść i seed.
KPI z seeda: nowe 3 / pilne 1 / łącznie 9.
