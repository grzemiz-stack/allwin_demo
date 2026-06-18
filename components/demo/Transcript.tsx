/* Lewa kolumna: transkrypcja bąbelkowa + wskaźnik pisania.
   role 'bot' → .row.bot (etykieta „Ołłin"),
   role 'user' → .row.client (etykieta „Klient" — klient w przykładzie),
   role 'owner' → .row.owner (etykieta „Właściciel" — rozmówca demo). */
'use client';

import { useEffect, useRef } from 'react';
import type { Role } from '@/lib/demo/events';

interface TranscriptProps {
  rows: { role: Role; text: string }[];
  typing: boolean;
}

export default function Transcript({ rows, typing }: TranscriptProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Auto-scroll do dołu przy każdym nowym bąbelku / pojawieniu się typing.
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [rows, typing]);

  return (
    <div className="transcript" ref={ref}>
      {rows.map((r, i) => {
        const cls = r.role === 'bot' ? 'bot' : r.role === 'owner' ? 'owner' : 'client';
        const label = r.role === 'bot' ? 'Ołłin' : r.role === 'owner' ? 'Właściciel' : 'Klient';
        return (
          <div className={`row ${cls}`} key={i}>
            <div className="bubble">
              <div className="lbl">{label}</div>
              {r.text}
            </div>
          </div>
        );
      })}
      {typing && (
        <div className="row bot">
          <div className="bubble typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
    </div>
  );
}
