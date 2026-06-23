# Allwin — strona pokazowa (agentro)

Strona pokazowa asystenta głosowego Allwin: lewa kolumna = ekran połączenia z
transkrypcją, prawa = konsola operacyjna zapalająca się w rytm rozmowy.
Demo **bezstanowe** — bez bazy danych.

## Stack
- Next.js 14 (App Router, TypeScript), React 18.
- Bez Tailwinda — style portowane 1:1 z prototypu w `app/globals.css`.
- Fonty przez `next/font/google` (Space Grotesk / Inter / JetBrains Mono).

## Uruchomienie
```bash
npm run dev      # http://localhost:3000/demo
npm run build    # produkcja
```
Tryb skryptowy działa bez żadnych zmiennych środowiskowych.

## Architektura — wspólny strumień zdarzeń
Sedno portu: imperatywne kroki prototypu rozłożone na strumień `DemoEvent`,
emitowany przez **dwa źródła** i konsumowany przez jeden reducer + te same
komponenty.

- `lib/demo/events.ts` — typ `DemoEvent` (kontrakt obu źródeł).
- `lib/demo/reducer.ts` — `eventReducer`: `DemoEvent` → `DemoState` (czysty, bez timera).
- `lib/demo/scenarios.ts` — scenariusze skryptowe (`ScenarioStep[]`); **podmiana
  wertykalu = inny eksport + przełączony import w `DemoStage`**, brak logiki
  renderowania. Współistnieją:
  `salonScenario` (gabinet kosmetyczny) i `climaScenario` (ClimaPolska, HVAC:
  montaż/serwis klimatyzacji). **Aktualny aktywny: `climaScenario`** — meta-demo
  Allwin → właściciel firmy HVAC; główny przebieg = lead (konsultacja/oględziny),
  drugi krótki beat = ticket (zgłoszenie serwisowe/awaria).
- `lib/demo/scriptRunner.ts` — odpala scenariusz (setTimeout + cleanup), podstawia
  sentinel `{{elapsed}}` żywym czasem.
- `lib/demo/vapiSource.ts` — `@vapi-ai/web` → `DemoEvent` (transcript→bąbelek,
  function-call/tool-calls→karty); tu żyją guardraile (cap 90 s, watchdog audio).
- `lib/demo/toolMap.ts` — kontrakt narzędzi client-side: `mapToolCall(name,args)`
  → karty ops + **fabrykowany sukces**. To jest izolacja.

Komponenty (`components/demo/`): `DemoStage` (orkiestrator + timer + `emit`),
`TopBar`, `CallPanel`, `Transcript`, `OpsConsole`, `OpsCard`, `ModulesBar`.

## Tryby
- **Skryptowy** ("Odtwórz przykładową rozmowę") — deterministyczny port 1:1.
- **Live** ("Zadzwoń sam") — `@vapi-ai/web`, klient dzwoni z mikrofonu. Zawsze
  widoczny obok skryptowego (tryb skryptowy = fallback dla każdej przeglądarki).
  Bez ENV przycisk jest `disabled` z tooltipem.

> **Uwaga (rozjazd wertykali):** tryb skryptowy to **ClimaPolska / HVAC**
> (`climaScenario`; `salonScenario` współistnieje, nieaktywny), a tryb live
> (asystent Vapi + `toolMap.ts`) to wciąż **wulkanizacja**
> (`utworz_zlecenie`/`sprawdz_magazyn`/`znajdz_mechanika`/`wyslij_sms`). Aby
> „Zadzwoń sam" pasował do demo HVAC, trzeba przekonfigurować asystenta demo
> w Vapi i `toolMap` pod moduły klimatyzacyjne (oględziny/zgłoszenie serwisowe).

## Izolacja (krytyczne — nic realnie nie dispatchujemy)
**Narzędzia są client-side.** Demo-asystent w Vapi wywołuje narzędzia, które
obsługuje przeglądarka (`lib/demo/toolMap.ts`): `mapToolCall` zwraca karty ops +
**fabrykowany sukces**, a wynik wraca do asystenta przez `vapi.send`. **Nie ma
`/api/demo/tool` ani żadnego serwerowego wykonania narzędzi** — zero realnego
EscalationService/dispatchu/Twilio. Public key tylko jako `NEXT_PUBLIC_`.

Kontrakt narzędzi (nazwy/parametry MUSZĄ pasować do system promptu asystenta
demo w Vapi — po polsku; zob. `docs/vapi-assistant-setup.md`):
- `utworz_zlecenie(usluga, pojazd?, rozmiar?)` → karta „Zlecenie"
- `sprawdz_magazyn(rozmiar)` → karta „Magazyn" (dostępna ✓)
- `znajdz_mechanika(lokalizacja)` → karta „Dyspozytor" (jedno wywołanie = cała
  choreografia: skan ekip → Haversine → ekipa #2 4.2 km → CAS ✓)
- `wyslij_sms(numer?)` → karta „SMS wysłany"

Nieznane narzędzie → generyczna karta OK (też sukces). Lista: `KNOWN_TOOLS`.

## Guardraile
- **Gate click-to-talk:** mikrofon dopiero po kliknięciu; przed startem `POST
  /api/demo/session`.
- **Cap 90 s:** twardy, w `vapiSource` — komunikat (`notice`) + auto-rozłączenie.
- **Rate-limit:** in-memory **3 starty / 15 min per IP** w
  `app/api/demo/session/route.ts` (best-effort, per-instancja procesu).
- **Watchdog audio (Safari/iOS):** po starcie, jeśli ~3 s brak sygnału audio z
  Vapi (`volume-level`/`speech-start`) → **najpierw** `voice:degraded` (pasek +
  podświetlony przycisk skryptowy), **potem** (po ~1,5 s grace) ciche
  rozłączenie. Prospekt widzi komunikat i fallback ZANIM połączenie zniknie.

ENV: `NEXT_PUBLIC_VAPI_PUBLIC_KEY`, `NEXT_PUBLIC_VAPI_DEMO_ASSISTANT_ID` (zob. `.env.example`).

## Konwencje
- Brak autonomicznych commitów bez zgody.
- `CLAUDE.md` + `docs/dziennik.md` aktualizowane na bieżąco.
