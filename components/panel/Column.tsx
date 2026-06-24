/* Kolumna tablicy = jeden status przepływu. Nagłówek (kropka tonu + etykieta +
   licznik) i lista kart; pusty etap pokazuje placeholder. */
import type { FlowStep, Kind, Lead, Ticket } from '@/lib/panel/contracts';
import Card from './Card';

export default function Column({
  step,
  items,
  kind,
  onCard,
}: {
  step: FlowStep;
  items: (Lead | Ticket)[];
  kind: Kind;
  onCard: (item: Lead | Ticket) => void;
}) {
  return (
    <div className="panel-col">
      <div className="panel-col-head">
        <span className={`panel-dot tone-${step.tone}`} />
        <span className="panel-col-title">{step.label}</span>
        <span className="panel-col-count">{items.length}</span>
      </div>
      <div className="panel-col-body">
        {items.map((it) => (
          <Card key={it.id} item={it} kind={kind} onClick={() => onCard(it)} />
        ))}
        {items.length === 0 && (
          <div className="panel-col-empty">Brak zgłoszeń na tym etapie</div>
        )}
      </div>
    </div>
  );
}
