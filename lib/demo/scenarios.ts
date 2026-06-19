/* ============================================================
   SCENARIUSZE SKRYPTOWE (deterministyczne)
   Każdy krok = {delay, events} — opóźnienie w ms (jak oryginalne `t`)
   + lista DemoEvent do emisji. Podmiana scenariusza = podmiana tego
   pliku / eksportu. Nic poza danymi tutaj nie ma — żadnej logiki
   renderowania.

   Scenariusz: meta-demo Allwin → właściciel gabinetu
   kosmetycznego. Allwin przedstawia się, słyszy branżę i odgrywa
   przykładowe połączenie z klientką, w którym kolejne moduły
   zapalają się na zielono (recepcja → kwalifikacja → rezerwacja →
   zaliczka → follow-up), a na końcu wraca do właściciela z CTA.
   Skrypt roboczy do akceptacji Marcina.
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

export const salonScenario: ScenarioStep[] = [
  // — Krok 1: przywitanie (Allwin → właściciel) —
  {
    delay: 300,
    events: [
      { kind: 'call:start', session: 'DEMO-01' },
      { kind: 'meta', sub: 'rozmowa z Allwin', opsMeta: 'demo · sesja #DEMO-01' },
    ],
  },
  { delay: 500, events: [{ kind: 'typing', on: true }] },
  {
    delay: 1200,
    events: [
      {
        kind: 'transcript',
        role: 'bot',
        text: 'Cześć, z tej strony Allwin — wirtualny pracownik głosowy dla firm. Powiedz mi, czym się zajmujesz, a pokażę Ci na żywo, jak mogę odciążyć Twój telefon.',
      },
    ],
  },

  // — Krok 2: rozmówca podaje branżę —
  {
    delay: 1600,
    events: [
      {
        kind: 'transcript',
        role: 'owner',
        text: 'Prowadzę gabinet kosmetyczny. Telefon dzwoni cały czas, a my często jesteśmy przy zabiegu i nie odbieramy.',
      },
    ],
  },

  // — Krok 3: Allwin proponuje mini-demo —
  { delay: 600, events: [{ kind: 'typing', on: true }] },
  {
    delay: 1300,
    events: [
      {
        kind: 'transcript',
        role: 'bot',
        text: 'Znam to. Pokażę Ci, co dzieje się, gdy w takiej chwili dzwoni klient, a ja odbieram zamiast Was. Słuchaj.',
      },
    ],
  },
  {
    delay: 600,
    events: [
      { kind: 'meta', sub: 'przykładowe połączenie', opsMeta: 'połączenie przykładowe' },
      { kind: 'card', id: 'recepcja', icon: '🎧', title: 'Recepcjonista AI', status: 'ODBIERAM', statusCls: 'work' },
      { kind: 'log', id: 'recepcja', html: '<span class="ok">✓</span> <span class="w">odbieram zamiast Was</span>' },
    ],
  },

  // — Krok 4: przykładowy telefon, klient —
  {
    delay: 1200,
    events: [
      {
        kind: 'transcript',
        role: 'user',
        text: 'Dzień dobry, chciałabym umówić się na zabieg oczyszczania twarzy, najlepiej w tym tygodniu.',
      },
      { kind: 'status', id: 'recepcja', text: 'AKTYWNY', cls: 'ok' },
    ],
  },

  // — Krok 5: Allwin kwalifikuje —
  { delay: 600, events: [{ kind: 'typing', on: true }] },
  {
    delay: 1300,
    events: [
      {
        kind: 'transcript',
        role: 'bot',
        text: 'Jasne. To pierwszy raz u nas, czy była Pani już wcześniej? I czy chodzi o klasyczne oczyszczanie, czy z peelingiem?',
      },
      { kind: 'card', id: 'kwal', icon: '🎯', title: 'Kwalifikacja leadów', status: 'ZBIERAM', statusCls: 'work' },
      {
        kind: 'kv',
        id: 'kwal',
        pairs: [
          { k: 'Wizyta', v: '—', key: 'w' },
          { k: 'Zabieg', v: '—', key: 'z' },
        ],
      },
    ],
  },
  { delay: 1500, events: [{ kind: 'transcript', role: 'user', text: 'Pierwszy raz. Poproszę oczyszczanie z peelingiem.' }] },
  {
    delay: 600,
    events: [
      { kind: 'fill', id: 'kwal', key: 'w', val: 'Pierwsza wizyta' },
      { kind: 'fill', id: 'kwal', key: 'z', val: 'Oczyszczanie + peeling' },
      { kind: 'status', id: 'kwal', text: 'OK', cls: 'ok' },
    ],
  },

  // — Krok 6: Allwin sprawdza termin i proponuje —
  { delay: 500, events: [{ kind: 'typing', on: true }] },
  {
    delay: 1200,
    events: [
      { kind: 'transcript', role: 'bot', text: 'Mam wolny czwartek o 16:00 albo piątek o 11:00. Który pasuje?' },
      { kind: 'card', id: 'rezerw', icon: '📅', title: 'Rezerwacja terminów', status: 'SPRAWDZAM', statusCls: 'work' },
      { kind: 'log', id: 'rezerw', html: '<span class="hl">›</span> wolne terminy: czw 16:00 · pt 11:00' },
    ],
  },
  { delay: 1400, events: [{ kind: 'transcript', role: 'user', text: 'Czwartek o 16.' }] },
  {
    delay: 600,
    events: [
      { kind: 'log', id: 'rezerw', html: '<span class="ok">✓</span> <span class="w">wpis do kalendarza — czwartek 16:00</span>' },
      {
        kind: 'kv',
        id: 'rezerw',
        pairs: [
          { k: 'Termin', v: 'czwartek, 16:00', key: 't', filled: true },
          { k: 'Zabieg', v: 'Oczyszczanie + peeling', key: 'z', filled: true },
        ],
      },
      { kind: 'status', id: 'rezerw', text: 'ZAREZERWOWANE', cls: 'ok' },
    ],
  },

  // — Krok 7: zaliczka / anty-no-show —
  { delay: 600, events: [{ kind: 'typing', on: true }] },
  {
    delay: 1300,
    events: [
      {
        kind: 'transcript',
        role: 'bot',
        text: 'Zarezerwowane. Żeby potwierdzić termin, wyślę link do zaliczki 50 zł — odliczymy ją od ceny zabiegu.',
      },
      { kind: 'card', id: 'platnosc', icon: '💳', title: 'Płatności i zaliczki', status: 'WYSYŁAM LINK', statusCls: 'work' },
      {
        kind: 'kv',
        id: 'platnosc',
        pairs: [
          { k: 'Zaliczka', v: '50 zł', key: 'z', filled: true },
          { k: 'Status', v: 'link wysłany', key: 's', filled: true },
        ],
      },
    ],
  },
  {
    delay: 1000,
    events: [
      { kind: 'log', id: 'platnosc', html: '<span class="ok">✓</span> <span class="w">płatność potwierdzona — termin zablokowany</span>' },
      { kind: 'status', id: 'platnosc', text: 'POTWIERDZONA', cls: 'ok' },
    ],
  },

  // — Krok 8: follow-up —
  { delay: 500, events: [{ kind: 'typing', on: true }] },
  {
    delay: 1300,
    events: [
      {
        kind: 'transcript',
        role: 'bot',
        text: 'Gotowe. Dzień przed wizytą wyślę przypomnienie SMS-em, a po zabiegu krótką wiadomość, czy wszystko ok.',
      },
      { kind: 'card', id: 'followup', icon: '✉️', title: 'Follow-up SMS / Email', status: 'PLANUJĘ', statusCls: 'work' },
      { kind: 'log', id: 'followup', html: '<span class="ok">✓</span> <span class="w">przypomnienie SMS — dzień przed wizytą</span>' },
      { kind: 'log', id: 'followup', html: '<span class="ok">✓</span> <span class="w">wiadomość po zabiegu — kontrola jakości</span>' },
    ],
  },
  { delay: 700, events: [{ kind: 'status', id: 'followup', text: 'USTAWIONE', cls: 'ok' }] },

  // — Krok 9: Allwin wraca do rozmówcy (właściciela) —
  {
    delay: 700,
    events: [
      { kind: 'meta', sub: 'rozmowa z Allwin', opsMeta: 'podsumowanie demo' },
      { kind: 'typing', on: true },
    ],
  },
  {
    delay: 1400,
    events: [
      {
        kind: 'transcript',
        role: 'bot',
        text: 'I tyle. Klient umówiony, zaliczka pobrana, przypomnienie ustawione — a Ty nawet nie odrywałeś się od pracy.',
      },
      { kind: 'card', id: 'recap', icon: '✅', title: 'Podsumowanie', status: 'GOTOWE', statusCls: 'ok' },
      {
        kind: 'kv',
        id: 'recap',
        pairs: [
          { k: 'Klient', v: 'umówiony ✓', key: 'k', filled: true },
          { k: 'Zaliczka', v: 'pobrana ✓', key: 'z', filled: true },
          { k: 'Przypomnienie', v: 'ustawione ✓', key: 'p', filled: true },
          { k: 'Czas rozmowy', v: ELAPSED, key: 'c', filled: true },
        ],
      },
    ],
  },

  // — Krok 10: zakończenie z zastrzeżeniem (+ opcjonalne przekazanie) —
  { delay: 700, events: [{ kind: 'typing', on: true }] },
  {
    delay: 1500,
    events: [
      {
        kind: 'transcript',
        role: 'bot',
        text: 'To był tylko przykład dla gabinetu — dokładnie te same moduły dobiera się i ustawia indywidualnie pod Twoją firmę i sposób pracy. Chcesz pogadać, jak by to wyglądało u Ciebie? Zostaw kontakt albo zadzwoń.',
      },
      { kind: 'card', id: 'przekazanie', icon: '🤝', title: 'Przekazanie do człowieka', status: 'GOTOWY', statusCls: 'work' },
      { kind: 'log', id: 'przekazanie', html: '<span class="hl">›</span> na życzenie łączę z zespołem' },
    ],
  },
  {
    delay: 800,
    events: [
      { kind: 'call:end', opsMeta: 'zakończono · demo #DEMO-01' },
      { kind: 'meta', sub: 'rozmowa zakończona' },
    ],
  },
];
