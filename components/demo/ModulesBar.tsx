/* Stopka: pille modułów. Stan każdego pilla (idle / active / done) jest
   WYPROWADZONY z tego samego `state.cards` co OpsConsole — bez osobnego
   strumienia eventów. `cardId` wiąże pill z kartą scenariusza; moduł bez
   `cardId` jest „do dołożenia" i zostaje idle. */
'use client';

import { useEffect, useRef } from 'react';
import type { OpsCard } from '@/lib/demo/reducer';

type PillState = 'idle' | 'active' | 'done';

const MODULES: { label: string; cardId?: string }[] = [
  // Aktywne w scenariuszu — kolejność = kolejność zapalania (zob. climaScenario).
  { label: 'Recepcjonista AI', cardId: 'recepcja' },
  { label: 'Konsultacja / oględziny', cardId: 'konsultacja' },
  { label: 'Zgłoszenie serwisowe / awaria', cardId: 'zgloszenie' },
  { label: 'Przekazanie do człowieka', cardId: 'przekazanie' },
  // Do dołożenia — branża to konfiguracja, nie kod (zawsze idle).
  { label: 'Wyceny i kosztorysy' },
  { label: 'Przeglądy okresowe' },
  { label: 'Dyspozytor ekip' },
  { label: 'Przypomnienia SMS / Email' },
  { label: 'Gwarancje i serwis pogwarancyjny' },
  { label: 'Wielojęzyczność (UA / EN)' },
];

/** idle = brak karty; active = karta w toku (work); done = karta domknięta (ok). */
function deriveState(cardId: string | undefined, cards: OpsCard[]): PillState {
  if (!cardId) return 'idle';
  const card = cards.find((c) => c.id === cardId);
  if (!card) return 'idle';
  return card.done ? 'done' : 'active';
}

export default function ModulesBar({ cards }: { cards: OpsCard[] }) {
  const activeRef = useRef<HTMLSpanElement | null>(null);

  const states = MODULES.map((m) => deriveState(m.cardId, cards));
  // Sygnatura aktywnych modułów — zmiana = inny pill się zapalił.
  const activeKey = MODULES.filter((_, i) => states[i] === 'active')
    .map((m) => m.cardId)
    .join(',');

  // Mobile A: aktywny pill zawsze w polu widzenia (poziomy scroll w .chips).
  useEffect(() => {
    if (!activeKey || !activeRef.current) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    activeRef.current.scrollIntoView({
      inline: 'nearest',
      block: 'nearest',
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, [activeKey]);

  return (
    <div className="modules">
      <h3>Moduły, które możemy dołożyć — branża to konfiguracja, nie kod</h3>
      <div className="chips">
        {MODULES.map((m, i) => {
          const state = states[i];
          return (
            <span
              className={`chip ${state}`}
              key={m.label}
              ref={state === 'active' ? activeRef : undefined}
            >
              {state === 'done' ? (
                <span className="chk" aria-hidden="true">
                  ✓
                </span>
              ) : (
                <span className="d" />
              )}
              {m.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
