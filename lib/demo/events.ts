/* ============================================================
   WSPÓLNY KONTRAKT ZDARZEŃ DEMO
   To jest sedno portu: imperatywne kroki z prototypu (say/typing/
   card/kv/fill/setStatus/logline) zostały rozłożone na strumień
   DemoEvent. Strumień emitują DWA źródła:
     • scriptRunner.ts  — deterministyczny scenariusz z timingiem
     • vapiSource.ts    — [faza 2] vapi.on('message') na żywo
   Oba trafiają do tego samego reducera i tych samych komponentów.
   ============================================================ */

export type Role = 'bot' | 'user';
export type StatusCls = 'work' | 'ok';

/** Pojedynczy wiersz klucz-wartość w karcie ops. */
export interface KvPair {
  /** Etykieta (lewa kolumna). */
  k: string;
  /** Wartość początkowa (prawa kolumna). */
  v: string;
  /** Stabilny klucz wiersza — używany przez zdarzenie `fill` do aktualizacji. */
  key: string;
  /** Czy wartość jest od razu „wypełniona" (białe), czy „pending" (przygaszone). */
  filled?: boolean;
}

export type DemoEvent =
  // --- ramka połączenia ---
  | { kind: 'reset' }
  | { kind: 'call:start'; session: string }
  | { kind: 'call:end'; opsMeta?: string }
  | { kind: 'meta'; sub?: string; opsMeta?: string }
  // --- lewa: transkrypcja ---
  | { kind: 'typing'; on: boolean }
  | { kind: 'transcript'; role: Role; text: string }
  // --- prawa: konsola ops ---
  | { kind: 'card'; id: string; icon: string; title: string; status?: string; statusCls?: StatusCls }
  | { kind: 'status'; id: string; text: string; cls: StatusCls }
  | { kind: 'kv'; id: string; pairs: KvPair[] }
  | { kind: 'fill'; id: string; key: string; val: string }
  | { kind: 'log'; id: string; html: string }
  // --- live: komunikaty / degradacja audio ---
  | { kind: 'notice'; text: string }
  | { kind: 'voice:degraded' };
