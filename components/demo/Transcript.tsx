/* Lewa kolumna: transkrypcja bąbelkowa + wskaźnik pisania.
   role 'user' renderuje się jako .row.client (etykieta „Klient"),
   role 'bot' jako .row.bot (etykieta „Asystent") — jak w prototypie. */
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
        const cls = r.role === 'bot' ? 'bot' : 'client';
        const label = r.role === 'bot' ? 'Asystent' : 'Klient';
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
