/* ============================================================
   VAPI SOURCE — drugie źródło strumienia DemoEvent (tryb LIVE).
   Mapuje zdarzenia Vapi Web SDK na ten sam DemoEvent, co scriptRunner:
     • transcript (final)        → bąbelek (role assistant→bot, user→user)
     • function-call / tool-calls→ mapToolCall() → karty ops + wynik
   Tu też żyją guardraile:
     • cap 90 s          → notice + rozłączenie
     • watchdog audio 3 s→ voice:degraded → (grace) → ciche rozłączenie
   Izolacja: tool-calle obsługiwane w przeglądarce (mapToolCall),
   wynik wraca do asystenta przez vapi.send — nic nie idzie na backend.
   ============================================================ */

import type { DemoEvent } from './events';
import { mapToolCall } from './toolMap';
import { scheduleSteps, type RunHandle } from './scriptRunner';

export type CloseReason = 'ended' | 'cap' | 'degraded' | 'user' | 'error';

export interface VapiSourceOptions {
  publicKey: string;
  assistantId: string;
  emit: (ev: DemoEvent) => void;
  onClose?: (reason: CloseReason) => void;
  onError?: (err: unknown) => void;
  /** Twardy cap rozmowy (ms). */
  capMs?: number;
  /** Okno watchdoga audio od startu (ms). */
  watchdogMs?: number;
  /** Czas na przeczytanie komunikatu degradacji przed rozłączeniem (ms). */
  degradedGraceMs?: number;
}

export interface VapiSourceHandle {
  stop: (reason?: CloseReason) => void;
}

const CAP_NOTICE = 'Demo ma limit 90 sekund — dziękujemy za rozmowę. Możesz odtworzyć przykładową rozmowę lub zadzwonić ponownie.';

export async function createVapiSource(opts: VapiSourceOptions): Promise<VapiSourceHandle> {
  const {
    emit,
    onClose,
    onError,
    capMs = 90_000,
    watchdogMs = 3_000,
    degradedGraceMs = 1_500,
  } = opts;

  // Import dynamiczny — SDK dotyka window/Daily, więc nigdy w SSR.
  const { default: Vapi } = await import('@vapi-ai/web');
  const vapi = new Vapi(opts.publicKey);

  let stopped = false;
  let audioAlive = false;
  let capTimer: ReturnType<typeof setTimeout> | null = null;
  let watchdogTimer: ReturnType<typeof setTimeout> | null = null;
  let degradedTimer: ReturnType<typeof setTimeout> | null = null;
  // Choreografie tool-calli w toku (kaskady) — do anulowania przy stop().
  const toolHandles: RunHandle[] = [];

  const clearTimers = () => {
    [capTimer, watchdogTimer, degradedTimer].forEach((t) => t && clearTimeout(t));
    capTimer = watchdogTimer = degradedTimer = null;
    toolHandles.forEach((h) => h.stop());
    toolHandles.length = 0;
  };

  const handleStop = (reason: CloseReason) => {
    if (stopped) return;
    stopped = true;
    clearTimers();
    try {
      vapi.removeAllListeners?.();
    } catch {
      /* noop */
    }
    try {
      vapi.stop();
    } catch {
      /* noop */
    }
    emit({ kind: 'call:end' });
    onClose?.(reason);
  };

  const clearWatchdog = () => {
    if (audioAlive) return;
    audioAlive = true;
    if (watchdogTimer) {
      clearTimeout(watchdogTimer);
      watchdogTimer = null;
    }
  };

  // Watchdog: brak audio z Vapi w oknie → degraded → grace → rozłączenie.
  // Kolejność krytyczna: prospekt widzi komunikat + fallback ZANIM zniknie połączenie.
  const fireWatchdog = () => {
    if (stopped || audioAlive) return;
    emit({ kind: 'voice:degraded' });
    degradedTimer = setTimeout(() => handleStop('degraded'), degradedGraceMs);
  };

  const armTimers = () => {
    capTimer = setTimeout(() => {
      emit({ kind: 'notice', text: CAP_NOTICE });
      handleStop('cap');
    }, capMs);
    watchdogTimer = setTimeout(fireWatchdog, watchdogMs);
  };

  const handleTool = (name: string, args: unknown, toolCallId?: string) => {
    const safeArgs = args && typeof args === 'object' ? (args as Record<string, unknown>) : {};
    const { steps, result } = mapToolCall(name, safeArgs);
    // Choreografia kaskaduje w czasie (ten sam scheduler co tryb skryptowy).
    if (!stopped) toolHandles.push(scheduleSteps(steps, emit));
    const content = JSON.stringify(result);
    const message = toolCallId
      ? { role: 'tool', tool_call_id: toolCallId, content }
      : { role: 'function', name, content };
    try {
      // Wynik fabrykowany wraca do asystenta, żeby kontynuował rozmowę.
      vapi.send({ type: 'add-message', message, triggerResponseEnabled: true } as never);
    } catch {
      /* UI już zaktualizowane — brak powrotu wyniku nie psuje demo */
    }
  };

  // --- audio alive ---
  vapi.on('volume-level', (v: number) => {
    if (v > 0.02) clearWatchdog();
  });
  vapi.on('speech-start', () => clearWatchdog());

  // --- strumień zdarzeń ---
  vapi.on('message', (msg: Record<string, unknown> | null) => {
    if (!msg || typeof msg !== 'object') return;
    const type = msg.type as string | undefined;

    if (type === 'transcript') {
      if (msg.transcriptType !== 'final') return;
      const role = msg.role === 'user' ? 'user' : 'bot';
      const text = String(msg.transcript ?? '').trim();
      if (text) emit({ kind: 'transcript', role, text });
      return;
    }

    if (type === 'function-call' && msg.functionCall) {
      const fc = msg.functionCall as { name: string; parameters?: unknown };
      handleTool(fc.name, fc.parameters);
      return;
    }

    if (type === 'tool-calls' || type === 'tool-call') {
      const calls = (msg.toolCalls ?? msg.toolCallList ?? []) as Array<{
        id?: string;
        function?: { name: string; arguments?: unknown };
      }>;
      for (const c of calls) {
        const fn = c.function;
        if (!fn?.name) continue;
        let args: unknown = {};
        try {
          args = typeof fn.arguments === 'string' ? JSON.parse(fn.arguments || '{}') : fn.arguments ?? {};
        } catch {
          args = {};
        }
        handleTool(fn.name, args, c.id);
      }
      return;
    }
  });

  vapi.on('call-end', () => handleStop('ended'));
  vapi.on('error', (err: unknown) => {
    onError?.(err);
    handleStop('error');
  });

  // --- start ---
  try {
    const call = await vapi.start(opts.assistantId);
    if (stopped) {
      // Użytkownik anulował zanim połączenie wystartowało.
      vapi.stop();
      return { stop: () => {} };
    }
    const session = call?.id ? String(call.id).slice(0, 8) : 'live';
    emit({ kind: 'call:start', session });
    armTimers();
  } catch (err) {
    onError?.(err);
    handleStop('error');
  }

  return { stop: (reason: CloseReason = 'user') => handleStop(reason) };
}
