/* ============================================================
   KONTRAKT /panel — pola i statusy leada (oględziny) oraz zgłoszenia
   serwisowego. Strona /panel jest BEZSTANOWA (seed + useState), bez bazy.

   ŹRÓDŁO PRAWDY mirroruje climaScenario (scenarios.ts:260–266) —
   przy zmianie kontraktu (pola / statusy / klucze) ZMIEŃ OBA MIEJSCA.
   Tu trzymamy lowercase-klucze statusów (przepływ kanban); scenariusz
   trzyma te same przejścia jako UPPERCASE-etykiety display.
   ============================================================ */

/** Wizualny ton statusu — mapowany na klasy CSS (.tone-new/-mid/-done). */
export type Tone = 'new' | 'mid' | 'done';

export interface FlowStep {
  /** Stabilny klucz statusu (lowercase, jak w climaScenario). */
  key: string;
  /** Etykieta widoczna w UI. */
  label: string;
  /** Ton koloru: new = --signal, mid = --mid, done = --confirm. */
  tone: Tone;
}

/** Lead / oględziny: nowy → termin_zaproponowany → potwierdzony. */
export const LEAD_FLOW: FlowStep[] = [
  { key: 'nowy', label: 'Nowy', tone: 'new' },
  { key: 'termin_zaproponowany', label: 'Termin zaproponowany', tone: 'mid' },
  { key: 'potwierdzony', label: 'Potwierdzony', tone: 'done' },
];

/** Serwis / awaria: nowe → przyjete → zaplanowane. */
export const SERV_FLOW: FlowStep[] = [
  { key: 'nowe', label: 'Nowe', tone: 'new' },
  { key: 'przyjete', label: 'Przyjęte', tone: 'mid' },
  { key: 'zaplanowane', label: 'Zaplanowane', tone: 'done' },
];

/** Pilność zgłoszenia serwisowego (badge na karcie). */
export type Pilnosc = 'wysoka' | 'srednia' | 'niska';
export const PILNOSC: Record<Pilnosc, { label: string; cls: 'high' | 'mid' | 'low' }> = {
  wysoka: { label: 'Pilne', cls: 'high' },
  srednia: { label: 'Średnie', cls: 'mid' },
  niska: { label: 'Standard', cls: 'low' },
};

/** Definicja pola w szufladzie detali. */
export interface FieldDef {
  key: string;
  label: string;
  /** Wartość renderowana fontem mono (np. telefon). */
  mono?: boolean;
}

/** Pola leada — mirror KV karty `konsultacja` (scenarios.ts). */
export const LEAD_FIELDS: FieldDef[] = [
  { key: 'typObiektu', label: 'Typ obiektu' },
  { key: 'liczbaPomieszczen', label: 'Liczba pomieszczeń' },
  { key: 'zakres', label: 'Zakres' },
  { key: 'lokalizacja', label: 'Lokalizacja' },
  { key: 'preferowanyTermin', label: 'Preferowany termin' },
  { key: 'imie', label: 'Imię' },
  { key: 'telefon', label: 'Telefon', mono: true },
];

/** Pola zgłoszenia serwisowego — mirror KV karty `zgloszenie` (scenarios.ts). */
export const SERV_FIELDS: FieldDef[] = [
  { key: 'typZgloszenia', label: 'Typ zgłoszenia' },
  { key: 'urzadzenie', label: 'Urządzenie' },
  { key: 'objaw', label: 'Objaw' },
  { key: 'pilnosc', label: 'Pilność' },
  { key: 'lokalizacja', label: 'Lokalizacja' },
  { key: 'preferowanyTermin', label: 'Preferowany termin' },
  { key: 'imie', label: 'Imię' },
  { key: 'telefon', label: 'Telefon', mono: true },
];

export interface Lead {
  id: string;
  imie: string;
  telefon: string;
  lokalizacja: string;
  typObiektu: string;
  liczbaPomieszczen: number;
  zakres: string;
  preferowanyTermin: string;
  status: string;
  /** Godzina połączenia (ślad „z rozmowy"). */
  callTime: string;
}

export interface Ticket {
  id: string;
  imie: string;
  telefon: string;
  lokalizacja: string;
  typZgloszenia: string;
  urzadzenie: string;
  objaw: string;
  pilnosc: Pilnosc;
  preferowanyTermin: string;
  status: string;
  callTime: string;
}

export type Kind = 'lead' | 'serv';

/** Metadane statusu (z fallbackiem na pierwszy krok). */
export function statusMeta(flow: FlowStep[], key: string): FlowStep {
  return flow.find((s) => s.key === key) ?? flow[0];
}

/** Następny status w przepływie lub null, gdy etap domknięty. */
export function nextStatus(flow: FlowStep[], key: string): string | null {
  const i = flow.findIndex((s) => s.key === key);
  return i >= 0 && i < flow.length - 1 ? flow[i + 1].key : null;
}
