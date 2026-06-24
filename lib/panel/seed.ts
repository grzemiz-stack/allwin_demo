/* ============================================================
   Dane demo /panel — Poznań (HVAC, ClimaPolska). Spójne 1:1 z
   climaScenario (scenarios.ts): lokalizacja = Poznań. Dwie pozycje
   pochodzą wprost ze scenariusza:
   • L-1042 Marek Kowalski / Grunwald (lead → potwierdzony),
   • S-2208 Anna Nowak / biuro (serwis → zaplanowane).
   Reszta uzupełnia tablicę w dzielnicach Poznania.
   Bez bazy — to seed do useState w PanelBoard.
   ============================================================ */

import type { Lead, Ticket } from './contracts';

export const SEED_LEADS: Lead[] = [
  // — ze scenariusza (climaScenario): Marek Kowalski, Grunwald —
  {
    id: 'L-1042',
    imie: 'Marek Kowalski',
    telefon: '+48 600 100 200',
    lokalizacja: 'Poznań, Grunwald',
    typObiektu: 'Dom jednorodzinny',
    liczbaPomieszczen: 3,
    zakres: 'Montaż klimatyzacji, multisplit',
    preferowanyTermin: 'Środa, 14:00',
    status: 'potwierdzony',
    callTime: '14:00',
  },
  {
    id: 'L-1044',
    imie: 'Robert Maj',
    telefon: '+48 533 270 884',
    lokalizacja: 'Poznań, Jeżyce',
    typObiektu: 'Mieszkanie',
    liczbaPomieszczen: 1,
    zakres: 'Klimatyzator ścienny, 1 jednostka',
    preferowanyTermin: 'Dowolny, najszybciej',
    status: 'nowy',
    callTime: '15:10',
  },
  {
    id: 'L-1043',
    imie: 'Marta Kowalczyk',
    telefon: '+48 512 884 201',
    lokalizacja: 'Poznań, Wilda',
    typObiektu: 'Mieszkanie',
    liczbaPomieszczen: 2,
    zakres: 'Montaż klimatyzacji, multisplit',
    preferowanyTermin: 'Poniedziałek rano',
    status: 'nowy',
    callTime: '14:32',
  },
  {
    id: 'L-1041',
    imie: 'Tomasz Wiśniewski',
    telefon: '+48 604 117 350',
    lokalizacja: 'Poznań, Łazarz',
    typObiektu: 'Biuro',
    liczbaPomieszczen: 4,
    zakres: 'Multisplit + rekuperacja',
    preferowanyTermin: 'Środa po 15:00',
    status: 'termin_zaproponowany',
    callTime: '13:08',
  },
  {
    id: 'L-1039',
    imie: 'Anna Lewandowska',
    telefon: '+48 698 442 019',
    lokalizacja: 'Poznań, Winogrady',
    typObiektu: 'Dom jednorodzinny',
    liczbaPomieszczen: 5,
    zakres: 'Rekuperacja',
    preferowanyTermin: 'Czwartek przedpołudnie',
    status: 'potwierdzony',
    callTime: '11:51',
  },
];

export const SEED_TICKETS: Ticket[] = [
  {
    id: 'S-2207',
    imie: 'Piotr Zając',
    telefon: '+48 660 902 145',
    lokalizacja: 'Poznań, Górczyn',
    typZgloszenia: 'Awaria',
    urzadzenie: 'Daikin, jednostka ścienna',
    objaw: 'Nie chłodzi, miga kontrolka',
    pilnosc: 'wysoka',
    preferowanyTermin: 'Dziś / jutro',
    status: 'nowe',
    callTime: '15:35',
  },
  {
    id: 'S-2206',
    imie: 'Katarzyna Nowak',
    telefon: '+48 692 008 771',
    lokalizacja: 'Poznań, Rataje',
    typZgloszenia: 'Przegląd',
    urzadzenie: 'Mitsubishi, multisplit (3 jednostki)',
    objaw: 'Przegląd sezonowy',
    pilnosc: 'niska',
    preferowanyTermin: 'W przyszłym tygodniu',
    status: 'przyjete',
    callTime: '12:40',
  },
  // — ze scenariusza (climaScenario): Anna Nowak, biuro (awaria) —
  {
    id: 'S-2208',
    imie: 'Anna Nowak',
    telefon: '+48 600 300 400',
    lokalizacja: 'Poznań, biuro',
    typZgloszenia: 'Awaria',
    urzadzenie: 'Klimatyzacja (split)',
    objaw: 'Nie chłodzi, błąd E5',
    pilnosc: 'wysoka',
    preferowanyTermin: 'Dziś po 15:00',
    status: 'zaplanowane',
    callTime: '15:22',
  },
  {
    id: 'S-2205',
    imie: 'Grzegorz Lis',
    telefon: '+48 501 663 220',
    lokalizacja: 'Poznań, Dębiec',
    typZgloszenia: 'Awaria',
    urzadzenie: 'Rotenso, jednostka zewnętrzna',
    objaw: 'Głośna praca, wibracje',
    pilnosc: 'srednia',
    preferowanyTermin: 'Do końca tygodnia',
    status: 'zaplanowane',
    callTime: '10:15',
  },
];
