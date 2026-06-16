/* ============================================================
   SCHEDULER + SCRIPT RUNNER.
   scheduleSteps() kumuluje opóźnienia i odpala step.events przez emit()
   — wspólna mechanika czasowa dla OBU źródeł:
     • tryb skryptowy (cały scenariusz),
     • tryb live (fragment-choreografia z pojedynczego tool-calla).
   Dzięki temu kaskada „systemu myślącego na żywo" wygląda identycznie
   w skrypcie i w rozmowie z Vapi. Podstawia sentinel ELAPSED żywym
   czasem (używane tylko przez scenariusz). Zwraca uchwyt z stop().
   ============================================================ */

import type { DemoEvent } from './events';
import { ELAPSED, type ScenarioStep } from './scenarios';

export interface RunHandle {
  stop: () => void;
}

export interface ScheduleOptions {
  /** Zwraca aktualny czas połączenia (mm:ss) do podstawienia ELAPSED. */
  getElapsed?: () => string;
  /** Wywoływane po wyemitowaniu zdarzeń ostatniego kroku. */
  onDone?: () => void;
}

function substElapsed(ev: DemoEvent, elapsed: string): DemoEvent {
  if (ev.kind === 'kv') {
    return { ...ev, pairs: ev.pairs.map((p) => (p.v === ELAPSED ? { ...p, v: elapsed } : p)) };
  }
  if (ev.kind === 'fill' && ev.val === ELAPSED) {
    return { ...ev, val: elapsed };
  }
  return ev;
}

/** Planuje sekwencję kroków (każdy = {delay, events}) względem teraz. */
export function scheduleSteps(
  steps: ScenarioStep[],
  emit: (ev: DemoEvent) => void,
  opts: ScheduleOptions = {},
): RunHandle {
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  let acc = 0;

  steps.forEach((step, i) => {
    acc += step.delay;
    timeouts.push(
      setTimeout(() => {
        const elapsed = opts.getElapsed?.() ?? '';
        step.events.forEach((ev) => emit(substElapsed(ev, elapsed)));
        if (i === steps.length - 1) opts.onDone?.();
      }, acc),
    );
  });

  return {
    stop: () => {
      timeouts.forEach(clearTimeout);
      timeouts.length = 0;
    },
  };
}

/** Odpala cały scenariusz skryptowy (alias scheduleSteps z czytelną nazwą). */
export function runScenario(
  steps: ScenarioStep[],
  emit: (ev: DemoEvent) => void,
  opts: ScheduleOptions = {},
): RunHandle {
  return scheduleSteps(steps, emit, opts);
}
