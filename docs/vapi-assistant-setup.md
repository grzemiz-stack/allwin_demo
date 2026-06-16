# Konfiguracja asystenta demo w Vapi

Tryb LIVE strony `/demo` używa **osobnego asystenta DEMO** w Vapi z narzędziami
**client-side** (obsługiwanymi w przeglądarce). Dzięki temu żaden tool-call nie
wychodzi na backend — front fabrykuje sukces i emituje karty konsoli ops. To jest
warstwa izolacji: zero realnego dispatchu / Twilio / EscalationService.

## ENV (front)
Utwórz `.env.local` (wzór w `.env.example`):
```
NEXT_PUBLIC_VAPI_PUBLIC_KEY=pk_...
NEXT_PUBLIC_VAPI_DEMO_ASSISTANT_ID=asst_...
```
Bez tych zmiennych przycisk „Zadzwoń sam" jest wyłączony (tryb skryptowy działa
zawsze).

## Narzędzia (client-side) — kontrakt
Nazwy i parametry MUSZĄ pokrywać się z `lib/demo/toolMap.ts` (`KNOWN_TOOLS`).
Każde narzędzie skonfiguruj jako **client-side / async** (wykonywane w
przeglądarce, nie przez `server.url`). Front zwraca wynik do asystenta przez
`vapi.send({ type:'add-message', message:{ role:'tool', ... } })`, więc asystent
kontynuuje rozmowę.

| Narzędzie         | Parametry                          | Karta w konsoli ops |
|-------------------|------------------------------------|---------------------|
| `utworz_zlecenie` | `usluga` (req), `pojazd?`, `rozmiar?` | „Zlecenie" — wypełnia usługa/pojazd/rozmiar |
| `sprawdz_magazyn` | `rozmiar` (req)                    | „Magazyn" — dostępna ✓ (4 szt.) |
| `znajdz_mechanika`| `lokalizacja` (req)                | „Dyspozytor" — skan ekip → Haversine → ekipa #2 4.2 km → CAS ✓ |
| `wyslij_sms`      | `numer?`                           | „SMS wysłany" |

Nieznane narzędzie → generyczna karta „Akcja: <nazwa>" (status OK). Nic nie psuje.

### Zwracane wyniki (fabrykowane, zawsze sukces)
- `utworz_zlecenie` → `{ orderId:"A-2041", usluga, pojazd, rozmiar }`
- `sprawdz_magazyn` → `{ available:true, quantity:4, rozmiar }`
- `znajdz_mechanika` → `{ teamId:"#2", distanceKm:4.2, etaMinutes:25, lokalizacja }`
- `wyslij_sms` → `{ sent:true }`

## Format wiadomości (zgodny z @vapi-ai/web 2.5.x)
- Transkrypt: `message.type==='transcript'`, używamy `transcriptType==='final'`,
  `role` ('assistant'→bąbelek bota, 'user'→bąbelek klienta), tekst w `transcript`.
- Tool-call: `message.type==='function-call'` (`functionCall.{name,parameters}`)
  albo `'tool-calls'` (`toolCalls[].function.{name,arguments}` — `arguments` to
  JSON string). Front obsługuje oba.

## Guardraile (po stronie strony, nie Vapi)
- Cap 90 s — twarde auto-rozłączenie + komunikat.
- Rate-limit 3 starty / 15 min per IP (`/api/demo/session`).
- Watchdog audio (Safari/iOS): brak sygnału ~3 s → komunikat + fallback →
  ciche rozłączenie.

## Test e2e
1. Ustaw `.env.local`, `npm run dev`, otwórz `/demo`.
2. „Zadzwoń sam" → zezwól na mikrofon → rozmawiaj.
3. Sprawdź: bąbelki transkrypcji + karty ops pojawiające się przy tool-callach.
4. W zakładce Network potwierdź, że tool-calle NIE generują żądań do żadnego
   backendu narzędzi (jest tylko jednorazowy `POST /api/demo/session`).
