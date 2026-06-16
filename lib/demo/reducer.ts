/* ============================================================
   REDUCER: DemoEvent → DemoState (czysta funkcja, źródło-agnostyczna)
   Odpowiednik imperatywnych mutacji DOM z prototypu, ale deklaratywnie.
   Timer NIE żyje tutaj (reducer jest czysty, bez Date.now) — liczy go
   DemoStage i renderuje TopBar. Klasa .flash kart jest lokalna w OpsCard.
   ============================================================ */

import type { DemoEvent, KvPair, Role, StatusCls } from './events';

export interface OpsCard {
  id: string;
  icon: string;
  title: string;
  status?: string;
  statusCls?: StatusCls;
  /** border-left zielony (confirm) — ustawiane gdy status osiąga 'ok'. */
  done: boolean;
  kv: KvPair[];
  /** Linie logu (gotowy HTML, jak w prototypie). */
  logs: string[];
}

export interface DemoState {
  session: string | null;
  /** Połączenie aktywne (sterowanie wskaźnikiem LIVE + timerem). */
  live: boolean;
  sub: string;
  opsMeta: string;
  transcript: { role: Role; text: string }[];
  typing: boolean;
  cards: OpsCard[];
  voiceDegraded: boolean;
  /** Komunikat informacyjny (cap 90 s / rate-limit). null = brak. */
  notice: string | null;
}

export const initialState: DemoState = {
  session: null,
  live: false,
  sub: 'asystent głosowy · gotowy',
  opsMeta: 'oczekiwanie',
  transcript: [],
  typing: false,
  cards: [],
  voiceDegraded: false,
  notice: null,
};

function patchCard(cards: OpsCard[], id: string, patch: (c: OpsCard) => OpsCard): OpsCard[] {
  return cards.map((c) => (c.id === id ? patch(c) : c));
}

export function eventReducer(state: DemoState, ev: DemoEvent): DemoState {
  switch (ev.kind) {
    case 'reset':
      return { ...initialState };

    case 'call:start':
      return { ...state, live: true, session: ev.session };

    case 'call:end':
      return {
        ...state,
        live: false,
        typing: false,
        opsMeta: ev.opsMeta ?? state.opsMeta,
      };

    case 'meta':
      return {
        ...state,
        sub: ev.sub ?? state.sub,
        opsMeta: ev.opsMeta ?? state.opsMeta,
      };

    case 'typing':
      return { ...state, typing: ev.on };

    case 'transcript':
      // say() w prototypie zawsze najpierw untype() — to samo tutaj.
      return {
        ...state,
        typing: false,
        transcript: [...state.transcript, { role: ev.role, text: ev.text }],
      };

    case 'card': {
      const card: OpsCard = {
        id: ev.id,
        icon: ev.icon,
        title: ev.title,
        status: ev.status,
        statusCls: ev.statusCls,
        done: ev.statusCls === 'ok',
        kv: [],
        logs: [],
      };
      // Idempotencja: jeśli karta o tym id istnieje, podmień (live może powtórzyć).
      const exists = state.cards.some((c) => c.id === ev.id);
      return {
        ...state,
        cards: exists ? patchCard(state.cards, ev.id, () => card) : [...state.cards, card],
      };
    }

    case 'status':
      return {
        ...state,
        cards: patchCard(state.cards, ev.id, (c) => ({
          ...c,
          status: ev.text,
          statusCls: ev.cls,
          done: c.done || ev.cls === 'ok',
        })),
      };

    case 'kv':
      return {
        ...state,
        cards: patchCard(state.cards, ev.id, (c) => ({ ...c, kv: ev.pairs })),
      };

    case 'fill':
      return {
        ...state,
        cards: patchCard(state.cards, ev.id, (c) => ({
          ...c,
          kv: c.kv.map((p: KvPair) =>
            p.key === ev.key ? { ...p, v: ev.val, filled: true } : p,
          ),
        })),
      };

    case 'log':
      return {
        ...state,
        cards: patchCard(state.cards, ev.id, (c) => ({ ...c, logs: [...c.logs, ev.html] })),
      };

    case 'notice':
      return { ...state, notice: ev.text };

    case 'voice:degraded':
      return { ...state, voiceDegraded: true };

    default: {
      // Wyczerpalność unii — błąd kompilacji przy nieobsłużonym wariancie.
      const _exhaustive: never = ev;
      return state;
    }
  }
}
