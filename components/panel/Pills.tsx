/* Wspólne mikro-elementy /panel: pill statusu i znacznik „z rozmowy". */
import { statusMeta, type FlowStep } from '@/lib/panel/contracts';
import { PhoneIncoming } from './icons';

/** Pill statusu — kolor z tonu kroku przepływu (.tone-new/-mid/-done). */
export function StatusPill({ flow, status }: { flow: FlowStep[]; status: string }) {
  const m = statusMeta(flow, status);
  return (
    <span className={`panel-pill tone-${m.tone}`}>
      <span className="panel-dot" />
      {m.label}
    </span>
  );
}

/** Ślad pochodzenia: pozycja złapana z połączenia przychodzącego. */
export function CaptureTag({ time }: { time: string }) {
  return (
    <span className="panel-capture">
      <PhoneIncoming size={12} strokeWidth={2.2} />
      z rozmowy · <span className="panel-capture-time">{time}</span>
    </span>
  );
}
