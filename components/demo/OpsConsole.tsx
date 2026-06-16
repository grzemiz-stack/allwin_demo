/* Prawa kolumna: konsola operacyjna. Renderuje karty z view-state.
   Ten sam komponent obsługuje tryb skryptowy i live — różni je tylko
   źródło zdarzeń, nie sposób renderowania. */
'use client';

import type { OpsCard as OpsCardModel } from '@/lib/demo/reducer';
import OpsCard from './OpsCard';

interface OpsConsoleProps {
  cards: OpsCardModel[];
  opsMeta: string;
}

export default function OpsConsole({ cards, opsMeta }: OpsConsoleProps) {
  return (
    <section className="ops">
      <div className="ops-head">
        <h2>Konsola operacyjna</h2>
        <span className="meta">{opsMeta}</span>
      </div>
      <div className="ops-body">
        {cards.length === 0 ? (
          <div className="ops-empty">
            System w gotowości.
            <br />
            <span className="blink">▸</span> Uruchom rozmowę, aby zobaczyć, co dzieje się po
            stronie systemu.
          </div>
        ) : (
          cards.map((c) => <OpsCard card={c} key={c.id} />)
        )}
      </div>
    </section>
  );
}
