/* Pojedyncza karta konsoli ops: ikona + tytuł + status, kv, log.
   Klasa .flash (pomarańczowy highlight) jest przejściowa — jak w
   prototypie znika po 1400 ms (tu: lokalny stan + setTimeout). */
'use client';

import { Fragment, useEffect, useState } from 'react';
import type { OpsCard as OpsCardModel } from '@/lib/demo/reducer';

export default function OpsCard({ card }: { card: OpsCardModel }) {
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setFlash(false), 1400);
    return () => clearTimeout(id);
  }, []);

  const cls = ['card', flash ? 'flash' : '', card.done ? 'done' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls}>
      <div className="card-h">
        <div className="ic">{card.icon}</div>
        <div className="ttl">{card.title}</div>
        {card.status && <div className={`st ${card.statusCls ?? 'work'}`}>{card.status}</div>}
      </div>
      <div className="bd">
        {card.kv.length > 0 && (
          <div className="kv">
            {card.kv.map((p) => (
              <Fragment key={p.key}>
                <span className="k">{p.k}</span>
                <span className={`v ${p.filled ? 'fill' : 'pending'}`}>{p.v}</span>
              </Fragment>
            ))}
          </div>
        )}
        {card.logs.length > 0 && (
          <div className="log">
            {card.logs.map((html, i) => (
              <div className="ln" key={i} dangerouslySetInnerHTML={{ __html: html }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
