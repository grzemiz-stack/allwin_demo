/* Szuflada detali zgłoszenia. Wiersze pól iterowane po LEAD_FIELDS/SERV_FIELDS
   (kontrakt = źródło prawdy). Stopka: przejście do następnego statusu lub baner
   „etap domknięty" + przycisk telefonu. */
import {
  LEAD_FIELDS,
  PILNOSC,
  SERV_FIELDS,
  nextStatus,
  statusMeta,
  type FieldDef,
  type FlowStep,
  type Kind,
  type Lead,
  type Pilnosc,
  type Ticket,
} from '@/lib/panel/contracts';
import { CaptureTag, StatusPill } from './Pills';
import { ArrowRight, Check, Phone, X } from './icons';

function fieldValue(item: Lead | Ticket, field: FieldDef): string {
  if (field.key === 'pilnosc') {
    return PILNOSC[(item as Ticket).pilnosc as Pilnosc].label;
  }
  const raw = (item as unknown as Record<string, unknown>)[field.key];
  return String(raw ?? '—');
}

export default function Drawer({
  item,
  kind,
  flow,
  onClose,
  onAdvance,
}: {
  item: Lead | Ticket;
  kind: Kind;
  flow: FlowStep[];
  onClose: () => void;
  onAdvance: (item: Lead | Ticket, next: string) => void;
}) {
  const fields = kind === 'lead' ? LEAD_FIELDS : SERV_FIELDS;
  const next = nextStatus(flow, item.status);
  const nextLabel = next ? statusMeta(flow, next).label : null;

  return (
    <>
      <div className="panel-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="panel-drawer" role="dialog" aria-label={`Zgłoszenie ${item.id}`}>
        <div className="panel-drawer-head">
          <div className="panel-drawer-head-left">
            <span className="panel-card-id">{item.id}</span>
            <StatusPill flow={flow} status={item.status} />
          </div>
          <button type="button" className="panel-drawer-close" onClick={onClose} aria-label="Zamknij">
            <X size={18} />
          </button>
        </div>

        <div className="panel-drawer-body">
          <div className="panel-drawer-name">{item.imie}</div>
          <div className="panel-drawer-capture">
            <CaptureTag time={item.callTime} />
          </div>

          {fields.map((f) => (
            <div className="panel-row" key={f.key}>
              <span className="panel-row-label">{f.label}</span>
              <span className={`panel-row-value${f.mono ? ' mono' : ''}`}>
                {fieldValue(item, f)}
              </span>
            </div>
          ))}
        </div>

        <div className="panel-drawer-foot">
          {next ? (
            <button type="button" className="panel-btn-advance" onClick={() => onAdvance(item, next)}>
              Przesuń do: {nextLabel} <ArrowRight size={16} />
            </button>
          ) : (
            <div className="panel-done-banner">
              <Check size={16} /> Etap domknięty
            </div>
          )}
          <button type="button" className="panel-btn-call">
            <Phone size={15} /> Zadzwoń do klienta
          </button>
        </div>
      </aside>
    </>
  );
}
