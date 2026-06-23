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

/* ============================================================
   Scenariusz: meta-demo Allwin → właściciel firmy HVAC
   („ClimaPolska" — montaż i serwis klimatyzacji / pomp ciepła).
   Główny przebieg = LEAD (konsultacja/oględziny): Allwin kwalifikuje
   zapytanie o montaż i umawia bezpłatne oględziny. Drugi, krótki beat
   = TICKET (zgłoszenie serwisowe/awaria): pełna karta + KV od razu
   gotowe, przyjęcie i zaplanowanie ekipy. Na końcu recap + CTA.

   Kontrakty pól (MUSZĄ pasować do kart/ModulesBar):
   • karta `konsultacja` (lead) — KV: typObiektu, liczbaPomieszczen,
     zakres, lokalizacja, preferowanyTermin, imie, telefon
     status: nowy → termin_zaproponowany → potwierdzony
   • karta `zgloszenie` (ticket) — KV: typZgloszenia, urzadzenie, objaw,
     pilnosc, lokalizacja, imie, telefon, preferowanyTermin
     status: nowe → przyjete → zaplanowane
   ============================================================ */
export const climaScenario: ScenarioStep[] = [
  // — Krok 1: przywitanie (Allwin → właściciel) —
  {
    delay: 300,
    events: [
      { kind: 'call:start', session: 'DEMO-02' },
      { kind: 'meta', sub: 'rozmowa z Allwin', opsMeta: 'demo · sesja #DEMO-02' },
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
        text: 'Mam firmę od klimatyzacji i pomp ciepła — ClimaPolska. Telefon dzwoni bez przerwy, a ekipy są w terenie i nie mają jak odbierać.',
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
        text: 'Znam to. Pokażę Ci, co dzieje się, gdy w takiej chwili dzwoni klient po wycenę montażu, a ja odbieram zamiast Was. Słuchaj.',
      },
    ],
  },
  {
    delay: 600,
    events: [
      { kind: 'meta', sub: 'przykładowe połączenie · oględziny', opsMeta: 'połączenie przykładowe' },
      { kind: 'card', id: 'recepcja', icon: '🎧', title: 'Recepcjonista AI', status: 'ODBIERAM', statusCls: 'work' },
      { kind: 'log', id: 'recepcja', html: '<span class="ok">✓</span> <span class="w">odbieram zamiast Was</span>' },
    ],
  },

  // — Krok 4: przykładowy telefon, klient (LEAD) —
  {
    delay: 1200,
    events: [
      {
        kind: 'transcript',
        role: 'user',
        text: 'Dzień dobry, chciałbym wycenę montażu klimatyzacji w domu. Najlepiej, żeby ktoś podjechał i obejrzał.',
      },
      { kind: 'status', id: 'recepcja', text: 'AKTYWNY', cls: 'ok' },
    ],
  },

  // — Krok 5: Allwin otwiera kartę konsultacji i kwalifikuje (status: nowy) —
  { delay: 600, events: [{ kind: 'typing', on: true }] },
  {
    delay: 1300,
    events: [
      {
        kind: 'transcript',
        role: 'bot',
        text: 'Jasne, umówimy bezpłatne oględziny. Żeby dobrać wycenę: to dom czy mieszkanie, ile pomieszczeń ma być klimatyzowanych i czy chodzi o samą klimatyzację, czy też pompę ciepła?',
      },
      // status: NOWY — zgłoszenie leada dopiero co utworzone.
      { kind: 'card', id: 'konsultacja', icon: '🔍', title: 'Konsultacja / oględziny', status: 'NOWY', statusCls: 'work' },
      {
        kind: 'kv',
        id: 'konsultacja',
        pairs: [
          { k: 'Typ obiektu', v: '—', key: 'typObiektu' },
          { k: 'Liczba pomieszczeń', v: '—', key: 'liczbaPomieszczen' },
          { k: 'Zakres', v: '—', key: 'zakres' },
          { k: 'Lokalizacja', v: '—', key: 'lokalizacja' },
          { k: 'Preferowany termin', v: '—', key: 'preferowanyTermin' },
          { k: 'Imię', v: '—', key: 'imie' },
          { k: 'Telefon', v: '—', key: 'telefon' },
        ],
      },
    ],
  },
  {
    delay: 1700,
    events: [
      {
        kind: 'transcript',
        role: 'user',
        text: 'Dom jednorodzinny, trzy pomieszczenia: salon i dwie sypialnie. Sama klimatyzacja. Jesteśmy w Poznaniu, Grunwald.',
      },
    ],
  },
  {
    delay: 700,
    events: [
      { kind: 'fill', id: 'konsultacja', key: 'typObiektu', val: 'Dom jednorodzinny' },
      { kind: 'fill', id: 'konsultacja', key: 'liczbaPomieszczen', val: '3 (salon + 2 sypialnie)' },
      { kind: 'fill', id: 'konsultacja', key: 'zakres', val: 'Montaż klimatyzacji (multi-split)' },
      { kind: 'fill', id: 'konsultacja', key: 'lokalizacja', val: 'Poznań, Grunwald' },
    ],
  },

  // — Krok 6: Allwin proponuje termin oględzin (status: termin_zaproponowany) —
  { delay: 500, events: [{ kind: 'typing', on: true }] },
  {
    delay: 1300,
    events: [
      {
        kind: 'transcript',
        role: 'bot',
        text: 'Mam wolny termin na oględziny: wtorek 10:00 albo środa 14:00. Który Panu pasuje?',
      },
      { kind: 'log', id: 'konsultacja', html: '<span class="hl">›</span> wolne oględziny: wt 10:00 · śr 14:00' },
      { kind: 'status', id: 'konsultacja', text: 'TERMIN ZAPROPONOWANY', cls: 'work' },
    ],
  },
  {
    delay: 1500,
    events: [
      {
        kind: 'transcript',
        role: 'user',
        text: 'Środa o 14 będzie idealnie. Marek Kowalski, telefon 600 100 200.',
      },
    ],
  },

  // — Krok 7: potwierdzenie oględzin (status: potwierdzony) —
  {
    delay: 700,
    events: [
      { kind: 'fill', id: 'konsultacja', key: 'preferowanyTermin', val: 'środa, 14:00' },
      { kind: 'fill', id: 'konsultacja', key: 'imie', val: 'Marek Kowalski' },
      { kind: 'fill', id: 'konsultacja', key: 'telefon', val: '600 100 200' },
      { kind: 'log', id: 'konsultacja', html: '<span class="ok">✓</span> <span class="w">oględziny umówione — środa 14:00, Grunwald</span>' },
      { kind: 'status', id: 'konsultacja', text: 'POTWIERDZONY', cls: 'ok' },
    ],
  },
  { delay: 500, events: [{ kind: 'typing', on: true }] },
  {
    delay: 1200,
    events: [
      {
        kind: 'transcript',
        role: 'bot',
        text: 'Potwierdzone. Technik przyjedzie w środę o 14:00 na bezpłatne oględziny, a dzień wcześniej wyślę SMS z przypomnieniem.',
      },
    ],
  },

  // — Krok 8: drugi beat — TICKET (awaria/serwis), pełna karta + KV gotowe —
  {
    delay: 800,
    events: [
      { kind: 'typing', on: true },
      { kind: 'meta', sub: 'przykładowe połączenie · awaria', opsMeta: 'połączenie przykładowe · serwis' },
    ],
  },
  {
    delay: 1300,
    events: [
      {
        kind: 'transcript',
        role: 'bot',
        text: 'A gdy zamiast nowego montażu dzwoni ktoś, komu sprzęt nawalił w upał? Wtedy odbieram tak —',
      },
    ],
  },
  {
    delay: 1200,
    events: [
      {
        kind: 'transcript',
        role: 'user',
        text: 'Dzień dobry, klimatyzacja w biurze przestała chłodzić i wyświetla błąd, a u nas 30 stopni. Da się jeszcze dziś?',
      },
    ],
  },
  // status: NOWE — zgłoszenie serwisowe przyjmowane; pełna karta + KV od razu gotowe.
  {
    delay: 700,
    events: [
      { kind: 'card', id: 'zgloszenie', icon: '🛠️', title: 'Zgłoszenie serwisowe / awaria', status: 'NOWE', statusCls: 'work' },
      {
        kind: 'kv',
        id: 'zgloszenie',
        pairs: [
          { k: 'Typ zgłoszenia', v: 'Awaria', key: 'typZgloszenia', filled: true },
          { k: 'Urządzenie', v: 'Klimatyzacja (split)', key: 'urzadzenie', filled: true },
          { k: 'Objaw', v: 'Nie chłodzi, błąd E5', key: 'objaw', filled: true },
          { k: 'Pilność', v: 'Pilne (dziś)', key: 'pilnosc', filled: true },
          { k: 'Lokalizacja', v: 'Poznań, biuro', key: 'lokalizacja', filled: true },
          { k: 'Imię', v: 'Anna Nowak', key: 'imie', filled: true },
          { k: 'Telefon', v: '600 300 400', key: 'telefon', filled: true },
          { k: 'Preferowany termin', v: 'dziś po 15:00', key: 'preferowanyTermin', filled: true },
        ],
      },
    ],
  },
  // status: PRZYJĘTE
  {
    delay: 700,
    events: [
      { kind: 'log', id: 'zgloszenie', html: '<span class="ok">✓</span> <span class="w">zgłoszenie przyjęte — priorytet pilny</span>' },
      { kind: 'status', id: 'zgloszenie', text: 'PRZYJĘTE', cls: 'work' },
    ],
  },
  { delay: 500, events: [{ kind: 'typing', on: true }] },
  {
    delay: 1300,
    events: [
      {
        kind: 'transcript',
        role: 'bot',
        text: 'Już przyjąłem zgłoszenie. Widzę wolną ekipę serwisową dziś po 15:00 — planuję wizytę, a technik zadzwoni przed przyjazdem.',
      },
    ],
  },
  // status: ZAPLANOWANE
  {
    delay: 700,
    events: [
      { kind: 'log', id: 'zgloszenie', html: '<span class="ok">✓</span> <span class="w">ekipa #2 zaplanowana — dziś, okno 15:00–17:00</span>' },
      { kind: 'status', id: 'zgloszenie', text: 'ZAPLANOWANE', cls: 'ok' },
    ],
  },

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
        text: 'I tyle. Jeden klient umówiony na oględziny, drugi z awarią przyjęty i przypisany do ekipy — a Twoje ekipy nawet nie odrywały się od montażu.',
      },
      { kind: 'card', id: 'recap', icon: '✅', title: 'Podsumowanie', status: 'GOTOWE', statusCls: 'ok' },
      {
        kind: 'kv',
        id: 'recap',
        pairs: [
          { k: 'Lead (oględziny)', v: 'umówiony ✓', key: 'lead', filled: true },
          { k: 'Serwis (awaria)', v: 'zaplanowany ✓', key: 'serwis', filled: true },
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
        text: 'To był tylko przykład dla firmy od klimatyzacji — dokładnie te same moduły dobiera się i ustawia indywidualnie pod Twoją firmę i sposób pracy. Chcesz pogadać, jak by to wyglądało u Ciebie? Zostaw kontakt albo zadzwoń.',
      },
      { kind: 'card', id: 'przekazanie', icon: '🤝', title: 'Przekazanie do człowieka', status: 'GOTOWY', statusCls: 'work' },
      { kind: 'log', id: 'przekazanie', html: '<span class="hl">›</span> na życzenie łączę z zespołem' },
    ],
  },
  {
    delay: 800,
    events: [
      { kind: 'call:end', opsMeta: 'zakończono · demo #DEMO-02' },
      { kind: 'meta', sub: 'rozmowa zakończona' },
    ],
  },
];
