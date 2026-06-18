/* ============================================================
   KONTRAKT NARZĘDZI DEMO (client-side) — to jest IZOLACJA.
   Demo-asystent w Vapi wywołuje narzędzia, które obsługujemy w
   PRZEGLĄDARCE: mapToolCall() zwraca CHOREOGRAFIĘ (steps: ScenarioStep[]
   z odstępami czasu) dla konsoli ops ORAZ spreparowany wynik sukcesu.
   Żaden tool-call nie wychodzi na backend — zero realnego dispatchu.

   Choreografia jest planowana tym samym schedulerem co tryb skryptowy
   (scheduleSteps), więc kaskada „systemu myślącego na żywo" wygląda
   identycznie w obu trybach.

   Nazwy narzędzi i parametry MUSZĄ pokrywać się z system promptem
   asystenta demo w Vapi (po polsku). Nieznane narzędzie → generyczna
   karta OK (też sukces). Zob. docs/vapi-assistant-setup.md.
   ============================================================ */

import type { DemoEvent } from './events';
import type { ScenarioStep } from './scenarios';

export interface ToolOutcome {
  /** Choreografia konsoli ops — kroki z odstępami (kaskada w czasie). */
  steps: ScenarioStep[];
  /** Spreparowany wynik zwracany asystentowi (zawsze sukces). */
  result: Record<string, unknown>;
}

type Args = Record<string, unknown>;

/** Escape wartości z modelu wstrzykiwanych do HTML logów (dangerouslySetInnerHTML). */
function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Wartość opcjonalna: string albo undefined (gdy brak / pusta). */
function opt(args: Args, key: string): string | undefined {
  const v = args[key];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

type Handler = (args: Args) => ToolOutcome;

const handlers: Record<string, Handler> = {
  // utworz_zlecenie(usluga, pojazd?, rozmiar?) → karta "Zlecenie".
  // Pola wypełniają się na żywo, kolejno (efekt uzupełniania zlecenia).
  utworz_zlecenie: (args) => {
    const usluga = opt(args, 'usluga') ?? 'Wymiana opony';
    const pojazd = opt(args, 'pojazd');
    const rozmiar = opt(args, 'rozmiar');
    const steps: ScenarioStep[] = [
      {
        delay: 0,
        events: [
          { kind: 'card', id: 'order', icon: '📋', title: 'Zlecenie', status: 'UZUPEŁNIANIE', statusCls: 'work' },
          {
            kind: 'kv',
            id: 'order',
            pairs: [
              { k: 'Usługa', v: '—', key: 'u' },
              { k: 'Pojazd', v: '—', key: 'p' },
              { k: 'Rozmiar', v: '—', key: 'r' },
            ],
          },
        ],
      },
      { delay: 450, events: [{ kind: 'fill', id: 'order', key: 'u', val: usluga }] },
    ];
    if (pojazd) steps.push({ delay: 450, events: [{ kind: 'fill', id: 'order', key: 'p', val: pojazd }] });
    if (rozmiar) steps.push({ delay: 450, events: [{ kind: 'fill', id: 'order', key: 'r', val: rozmiar }] });
    steps.push({ delay: 450, events: [{ kind: 'status', id: 'order', text: 'PRZYJĘTE', cls: 'ok' }] });
    return {
      steps,
      result: { orderId: 'A-2041', usluga, pojazd: pojazd ?? null, rozmiar: rozmiar ?? null },
    };
  },

  // sprawdz_magazyn(rozmiar) → karta "Magazyn" (zapytanie → po chwili dostępna ✓).
  sprawdz_magazyn: (args) => {
    const rozmiar = opt(args, 'rozmiar') ?? '205/55 R16';
    return {
      steps: [
        {
          delay: 0,
          events: [
            { kind: 'card', id: 'mag', icon: '📦', title: 'Magazyn', status: 'SPRAWDZAM', statusCls: 'work' },
            { kind: 'log', id: 'mag', html: `<span class="hl">›</span> zapytanie: ${esc(rozmiar)}` },
          ],
        },
        {
          delay: 900,
          events: [
            { kind: 'log', id: 'mag', html: '<span class="ok">✓</span> <span class="w">dostępna — 4 szt. na stanie</span>' },
            { kind: 'status', id: 'mag', text: 'DOSTĘPNA', cls: 'ok' },
          ],
        },
      ],
      result: { available: true, quantity: 4, rozmiar },
    };
  },

  // znajdz_mechanika(lokalizacja) → karta "Dyspozytor".
  // JEDNO wywołanie = cała choreografia KASKADUJĄCA W CZASIE:
  // skan ekip → Haversine → ekipa #2 4.2km ◂ najbliższa → ping → CAS ✓.
  znajdz_mechanika: (args) => {
    const lokalizacja = opt(args, 'lokalizacja') ?? 'S11 / Stęszew';
    return {
      steps: [
        {
          delay: 0,
          events: [
            { kind: 'card', id: 'disp', icon: '🛰️', title: 'Dyspozytor', status: 'LICZĘ', statusCls: 'work' },
            { kind: 'log', id: 'disp', html: `<span class="hl">›</span> lokalizacja: ${esc(lokalizacja)}` },
            { kind: 'log', id: 'disp', html: '<span class="hl">›</span> Haversine: skan 3 ekip w terenie' },
          ],
        },
        { delay: 700, events: [{ kind: 'log', id: 'disp', html: '&nbsp;&nbsp;ekipa #1 — 11.4 km' }] },
        { delay: 500, events: [{ kind: 'log', id: 'disp', html: '&nbsp;&nbsp;<span class="w">ekipa #2 — 4.2 km ◂ najbliższa</span>' }] },
        { delay: 500, events: [{ kind: 'log', id: 'disp', html: '&nbsp;&nbsp;ekipa #3 — 18.0 km' }] },
        { delay: 800, events: [{ kind: 'log', id: 'disp', html: '<span class="hl">›</span> ping → ekipa #2 (PIN_WAIT 90s)' }] },
        {
          delay: 1000,
          events: [
            { kind: 'log', id: 'disp', html: '<span class="ok">✓</span> <span class="w">potwierdzenie (CAS) — przyjęte</span>' },
            { kind: 'status', id: 'disp', text: 'PRZYDZIELONE', cls: 'ok' },
          ],
        },
      ],
      result: { teamId: '#2', distanceKm: 4.2, etaMinutes: 25, lokalizacja },
    };
  },

  // wyslij_sms(numer?) → karta "SMS wysłany" (wysyłka → po chwili treść).
  wyslij_sms: (args) => {
    const numer = opt(args, 'numer') ?? '+48 502 ••• 619';
    return {
      steps: [
        {
          delay: 0,
          events: [
            { kind: 'card', id: 'sms', icon: '✉️', title: 'SMS wysłany', status: 'WYSŁANO', statusCls: 'ok' },
            { kind: 'log', id: 'sms', html: `<span class="ok">✓</span> <span class="w">SMS → ${esc(numer)}</span>` },
          ],
        },
        {
          delay: 600,
          events: [
            { kind: 'log', id: 'sms', html: '&nbsp;&nbsp;„Mechanik Kołomir w drodze, ETA 25 min. Zlecenie A-2041.”' },
          ],
        },
      ],
      result: { sent: true },
    };
  },
};

/** Generyczna karta dla nieznanego narzędzia — także sukces (izolacja). */
function fallback(name: string, args: Args): ToolOutcome {
  const entries = Object.entries(args).slice(0, 4);
  return {
    steps: [
      {
        delay: 0,
        events: [
          { kind: 'card', id: `tool-${name}`, icon: '⚙️', title: `Akcja: ${name}`, status: 'OK', statusCls: 'ok' },
          ...(entries.length
            ? [
                {
                  kind: 'kv' as const,
                  id: `tool-${name}`,
                  pairs: entries.map(([k, v], i) => ({ k, v: String(v), key: `p${i}`, filled: true })),
                },
              ]
            : []),
        ],
      },
    ],
    result: { ok: true },
  };
}

/**
 * Mapuje pojedyncze wywołanie narzędzia na choreografię ops + spreparowany wynik.
 * `args` powinno być już znormalizowanym obiektem (vapiSource parsuje JSON z
 * formatu 'tool-calls').
 */
export function mapToolCall(name: string, args: Args = {}): ToolOutcome {
  const handler = handlers[name];
  return handler ? handler(args) : fallback(name, args);
}

/** Lista obsługiwanych nazw — musi pokrywać się z system promptem asystenta demo. */
export const KNOWN_TOOLS = Object.keys(handlers);
