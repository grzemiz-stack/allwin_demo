/* ============================================================
   SCENARIUSZE SKRYPTOWE (deterministyczne)
   Port tablicy script[] z prototypu 1:1. Każdy krok = {delay, events}
   — opóźnienie w ms (jak oryginalne `t`) + lista DemoEvent do emisji.
   Podmiana scenariusza = podmiana tego pliku / eksportu. Nic poza
   danymi tutaj nie ma — żadnej logiki renderowania.

   Scenariusz: flak na S11 → mobilny dojazd ekipy.
   ============================================================ */

import type { DemoEvent } from './events';

export interface ScenarioStep {
  /** Opóźnienie względem poprzedniego kroku (ms) — odpowiednik `t`. */
  delay: number;
  /** Zdarzenia wyemitowane po upływie opóźnienia. */
  events: DemoEvent[];
}

/** Sentinel: runner podstawia tu żywy czas połączenia (mm:ss). */
export const ELAPSED = '{{elapsed}}';

export const s11Scenario: ScenarioStep[] = [
  {
    delay: 300,
    events: [
      { kind: 'call:start', session: 'A-2041' },
      { kind: 'meta', sub: 'połączenie przychodzące…', opsMeta: 'sesja #A-2041' },
      { kind: 'card', id: 'crm', icon: '👤', title: 'Identyfikacja klienta', status: 'SZUKAM', statusCls: 'work' },
      {
        kind: 'kv',
        id: 'crm',
        pairs: [
          { k: 'Numer', v: '+48 502 ••• 619', key: 'num', filled: true },
          { k: 'Status', v: '—', key: 'stat' },
        ],
      },
    ],
  },
  {
    delay: 1300,
    events: [
      { kind: 'fill', id: 'crm', key: 'stat', val: 'Nowy klient' },
      { kind: 'status', id: 'crm', text: 'NOWY', cls: 'ok' },
    ],
  },
  { delay: 600, events: [{ kind: 'typing', on: true }] },
  { delay: 1100, events: [{ kind: 'transcript', role: 'bot', text: 'Wulkanizacja Szybka Guma, dzień dobry. W czym mogę pomóc?' }] },
  { delay: 1500, events: [{ kind: 'transcript', role: 'user', text: 'Dzień dobry, złapałem gwoździa, mam flaka. Potrzebuję wymiany opony.' }] },
  {
    delay: 700,
    events: [
      { kind: 'card', id: 'intent', icon: '🎯', title: 'Rozpoznana intencja', status: 'OK', statusCls: 'ok' },
      {
        kind: 'kv',
        id: 'intent',
        pairs: [
          { k: 'Usługa', v: 'Wymiana opony', key: 'x', filled: true },
          { k: 'Tryb', v: 'Awaria / pilne', key: 'y', filled: true },
        ],
      },
    ],
  },
  { delay: 600, events: [{ kind: 'typing', on: true }] },
  { delay: 1100, events: [{ kind: 'transcript', role: 'bot', text: 'Już pomagam. Jaki to samochód i jaki rozmiar opony?' }] },
  { delay: 1600, events: [{ kind: 'transcript', role: 'user', text: 'Skoda Octavia, 205/55 R16.' }] },
  {
    delay: 700,
    events: [
      { kind: 'card', id: 'order', icon: '📋', title: 'Zlecenie #A-2041', status: 'UZUPEŁNIANIE', statusCls: 'work' },
      {
        kind: 'kv',
        id: 'order',
        pairs: [
          { k: 'Pojazd', v: '—', key: 'poj' },
          { k: 'Rozmiar', v: '—', key: 'roz' },
          { k: 'Lokalizacja', v: '—', key: 'lok' },
        ],
      },
    ],
  },
  { delay: 500, events: [{ kind: 'fill', id: 'order', key: 'poj', val: 'Skoda Octavia' }] },
  { delay: 500, events: [{ kind: 'fill', id: 'order', key: 'roz', val: '205/55 R16' }] },
  {
    delay: 700,
    events: [
      { kind: 'card', id: 'mag', icon: '📦', title: 'Magazyn', status: 'SPRAWDZAM', statusCls: 'work' },
      { kind: 'log', id: 'mag', html: '<span class="hl">›</span> zapytanie: 205/55 R16' },
    ],
  },
  {
    delay: 1000,
    events: [
      { kind: 'log', id: 'mag', html: '<span class="ok">✓</span> <span class="w">dostępna — 4 szt. na stanie</span>' },
      { kind: 'status', id: 'mag', text: 'DOSTĘPNA', cls: 'ok' },
    ],
  },
  { delay: 500, events: [{ kind: 'typing', on: true }] },
  { delay: 1200, events: [{ kind: 'transcript', role: 'bot', text: 'Mamy tę oponę na stanie. Gdzie Pan się znajduje? Możemy dojechać.' }] },
  { delay: 1700, events: [{ kind: 'transcript', role: 'user', text: 'Jestem na S11, parking przy Stęszewie, kierunek Poznań.' }] },
  {
    delay: 600,
    events: [
      { kind: 'fill', id: 'order', key: 'lok', val: 'S11 / Stęszew' },
      { kind: 'status', id: 'order', text: 'KOMPLETNE', cls: 'ok' },
      { kind: 'card', id: 'geo', icon: '📍', title: 'Geolokalizacja', status: 'OK', statusCls: 'ok' },
      {
        kind: 'kv',
        id: 'geo',
        pairs: [
          { k: 'Punkt', v: 'S11, węzeł Stęszew', key: 'a', filled: true },
          { k: 'Współrzędne', v: '52.288, 16.706', key: 'b', filled: true },
        ],
      },
    ],
  },
  { delay: 600, events: [{ kind: 'typing', on: true }] },
  { delay: 1100, events: [{ kind: 'transcript', role: 'bot', text: 'Sekundę, szukam najbliższego mechanika…' }] },
  {
    delay: 600,
    events: [
      { kind: 'card', id: 'disp', icon: '🛰️', title: 'Dyspozytor', status: 'LICZĘ', statusCls: 'work' },
      { kind: 'log', id: 'disp', html: '<span class="hl">›</span> Haversine: skan 3 ekip w terenie' },
    ],
  },
  { delay: 900, events: [{ kind: 'log', id: 'disp', html: '&nbsp;&nbsp;ekipa #1 — 11.4 km' }] },
  { delay: 500, events: [{ kind: 'log', id: 'disp', html: '&nbsp;&nbsp;<span class="w">ekipa #2 — 4.2 km ◂ najbliższa</span>' }] },
  { delay: 500, events: [{ kind: 'log', id: 'disp', html: '&nbsp;&nbsp;ekipa #3 — 18.0 km' }] },
  { delay: 800, events: [{ kind: 'log', id: 'disp', html: '<span class="hl">›</span> ping → ekipa #2 (PIN_WAIT 90s)' }] },
  {
    delay: 1100,
    events: [
      { kind: 'log', id: 'disp', html: '<span class="ok">✓</span> <span class="w">potwierdzenie (CAS) — przyjęte</span>' },
      { kind: 'status', id: 'disp', text: 'PRZYDZIELONE', cls: 'ok' },
    ],
  },
  { delay: 700, events: [{ kind: 'typing', on: true }] },
  { delay: 1300, events: [{ kind: 'transcript', role: 'bot', text: 'Mechanik dojedzie za około 25 minut. Potwierdzam wszystko SMS-em.' }] },
  {
    delay: 700,
    events: [
      { kind: 'card', id: 'book', icon: '📅', title: 'Rezerwacja', status: 'OK', statusCls: 'ok' },
      {
        kind: 'kv',
        id: 'book',
        pairs: [
          { k: 'Ekipa', v: '#2 (4.2 km)', key: 'e', filled: true },
          { k: 'Przyjazd', v: 'ok. 14:25', key: 'f', filled: true },
          { k: 'ETA', v: '~25 min', key: 'g', filled: true },
        ],
      },
    ],
  },
  {
    delay: 700,
    events: [
      { kind: 'card', id: 'sms', icon: '✉️', title: 'Powiadomienie SMS', status: 'WYSŁANO', statusCls: 'ok' },
      { kind: 'log', id: 'sms', html: '<span class="ok">✓</span> <span class="w">SMS → +48 502 ••• 619</span>' },
      { kind: 'log', id: 'sms', html: '&nbsp;&nbsp;„Mechanik Szybka Guma w drodze, ETA 25 min. Zlecenie A-2041.”' },
    ],
  },
  { delay: 900, events: [{ kind: 'transcript', role: 'user', text: 'Super, dziękuję bardzo!' }] },
  { delay: 600, events: [{ kind: 'typing', on: true }] },
  { delay: 1000, events: [{ kind: 'transcript', role: 'bot', text: 'Do usłyszenia. Wszystkie szczegóły są w SMS-ie. Miłego dnia!' }] },
  {
    delay: 900,
    events: [
      { kind: 'card', id: 'close', icon: '✅', title: 'Zlecenie domknięte', status: 'POTWIERDZONE', statusCls: 'ok' },
      {
        kind: 'kv',
        id: 'close',
        pairs: [
          { k: 'Nr', v: '#A-2041', key: 'n', filled: true },
          { k: 'Czas rozmowy', v: ELAPSED, key: 'c', filled: true },
          { k: 'Obsługa', v: 'w pełni automatyczna', key: 'o', filled: true },
        ],
      },
    ],
  },
  {
    delay: 600,
    events: [
      { kind: 'call:end', opsMeta: 'zakończono · #A-2041' },
      { kind: 'meta', sub: 'połączenie zakończone' },
    ],
  },
];
