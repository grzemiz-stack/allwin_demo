/* Karta zgłoszenia na tablicy. Lead vs serwis rozróżnia `kind`; serwis ma
   badge pilności + objaw. Cała karta to <button> — klik otwiera szufladę. */
import { PILNOSC, type Kind, type Lead, type Ticket } from '@/lib/panel/contracts';
import { CaptureTag } from './Pills';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ChevronRight,
  Home,
  MapPin,
  Wrench,
} from './icons';

export default function Card({
  item,
  kind,
  onClick,
}: {
  item: Lead | Ticket;
  kind: Kind;
  onClick: () => void;
}) {
  const isServ = kind === 'serv';
  const lead = item as Lead;
  const serv = item as Ticket;
  const p = isServ ? PILNOSC[serv.pilnosc] : null;

  return (
    <button type="button" className="panel-card" onClick={onClick}>
      <div className="panel-card-top">
        <div className="panel-card-top-left">
          <span className="panel-card-id">{item.id}</span>
          {isServ && p && (
            <span className={`panel-urg ${p.cls}`}>
              {serv.pilnosc === 'wysoka' && <AlertTriangle size={11} strokeWidth={2.4} />}
              {p.label}
            </span>
          )}
        </div>
        <ChevronRight size={15} />
      </div>

      <div className="panel-card-name">{item.imie}</div>

      <div className="panel-card-rows">
        <span className="panel-card-row">
          <MapPin size={13} /> {item.lokalizacja}
        </span>
        <span className="panel-card-row">
          {isServ ? (
            <Wrench size={13} />
          ) : lead.typObiektu.includes('Dom') ? (
            <Home size={13} />
          ) : (
            <Building2 size={13} />
          )}
          {isServ ? serv.urzadzenie : `${lead.typObiektu} · ${lead.zakres}`}
        </span>
        {isServ && <span className="panel-card-row ink">{serv.objaw}</span>}
        <span className="panel-card-row">
          <CalendarDays size={13} /> {item.preferowanyTermin}
        </span>
      </div>

      <div className="panel-card-foot">
        <span className="panel-card-phone">{item.telefon}</span>
        <CaptureTag time={item.callTime} />
      </div>
    </button>
  );
}
