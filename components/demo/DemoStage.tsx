/* ============================================================
   DemoStage — orkiestrator strony /demo.
   • trzyma view-state (useReducer + eventReducer),
   • posiada timer połączenia (Date.now, poza czystym reducerem),
   • wrapper emit() spina OBA źródła zdarzeń (skrypt / Vapi) z reducerem
     i timerem,
   • steruje runnerem skryptowym, sesją live (Vapi) i stanem przycisków.
   ============================================================ */
'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { DemoEvent } from '@/lib/demo/events';
import { eventReducer, initialState } from '@/lib/demo/reducer';
import { salonScenario } from '@/lib/demo/scenarios';
import { runScenario, type RunHandle } from '@/lib/demo/scriptRunner';
import { createVapiSource, type VapiSourceHandle } from '@/lib/demo/vapiSource';
import TopBar from './TopBar';
import CallPanel from './CallPanel';
import OpsConsole from './OpsConsole';
import ModulesBar from './ModulesBar';

const PLAY_IDLE = '▶ Odtwórz przykładową rozmowę';
const PLAY_RUNNING = '● Rozmowa w toku…';
const PLAY_REPLAY = '↺ Odtwórz ponownie';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? '';
const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_DEMO_ASSISTANT_ID ?? '';
const ENV_READY = Boolean(VAPI_PUBLIC_KEY && VAPI_ASSISTANT_ID);

type Mode = 'idle' | 'script' | 'connecting' | 'live';

function formatElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function DemoStage() {
  const [state, dispatch] = useReducer(eventReducer, initialState);

  const [timer, setTimer] = useState('0:00');
  const [mode, setMode] = useState<Mode>('idle');
  const [playLabel, setPlayLabel] = useState(PLAY_IDLE);

  const startedAtRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runHandleRef = useRef<RunHandle | null>(null);
  const sourceRef = useRef<VapiSourceHandle | null>(null);

  const stopTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    stopTick();
    startedAtRef.current = Date.now();
    tickRef.current = setInterval(() => {
      setTimer(formatElapsed(Date.now() - startedAtRef.current));
    }, 250);
  }, [stopTick]);

  // Wspólny punkt emisji dla obu źródeł (skrypt / Vapi).
  // Obsługuje efekty uboczne timera, resztę deleguje do reducera.
  const emit = useCallback(
    (ev: DemoEvent) => {
      if (ev.kind === 'reset') {
        stopTick();
        setTimer('0:00');
      } else if (ev.kind === 'call:start') {
        startTick();
      } else if (ev.kind === 'call:end') {
        stopTick();
      }
      dispatch(ev);
    },
    [startTick, stopTick],
  );

  // --- tryb skryptowy ---
  const handlePlay = useCallback(() => {
    if (mode !== 'idle') return;
    runHandleRef.current?.stop();

    setMode('script');
    setPlayLabel(PLAY_RUNNING);

    emit({ kind: 'reset' });
    emit({ kind: 'meta', sub: 'łączenie…' });

    runHandleRef.current = runScenario(salonScenario, emit, {
      getElapsed: () => formatElapsed(Date.now() - startedAtRef.current),
      onDone: () => {
        setMode('idle');
        setPlayLabel(PLAY_REPLAY);
      },
    });
  }, [mode, emit]);

  // --- tryb live (Vapi) ---
  const handleLive = useCallback(async () => {
    // Klik w trakcie rozmowy = rozłącz.
    if (mode === 'live') {
      sourceRef.current?.stop('user');
      return;
    }
    if (mode !== 'idle' || !ENV_READY) return;

    setMode('connecting');

    // Gate click-to-talk: najpierw rate-limit, dopiero potem mikrofon.
    try {
      const res = await fetch('/api/demo/session', { method: 'POST' });
      if (res.status === 429) {
        const data = (await res.json().catch(() => ({}))) as { retryAfter?: number };
        const mins = Math.ceil((data.retryAfter ?? 600) / 60);
        emit({
          kind: 'notice',
          text: `Wykorzystano limit prób z tego adresu. Spróbuj ponownie za ok. ${mins} min lub odtwórz przykładową rozmowę.`,
        });
        setMode('idle');
        return;
      }
      if (!res.ok) throw new Error(`session ${res.status}`);
    } catch {
      emit({ kind: 'notice', text: 'Nie udało się rozpocząć rozmowy. Spróbuj ponownie.' });
      setMode('idle');
      return;
    }

    // Czysta plansza pod rozmowę na żywo.
    emit({ kind: 'reset' });
    emit({ kind: 'meta', sub: 'łączenie…' });

    let closed = false;
    try {
      const handle = await createVapiSource({
        publicKey: VAPI_PUBLIC_KEY,
        assistantId: VAPI_ASSISTANT_ID,
        emit,
        onClose: () => {
          closed = true;
          sourceRef.current = null;
          setMode('idle');
        },
        onError: () => {
          emit({
            kind: 'notice',
            text: 'Problem z połączeniem głosowym. Spróbuj ponownie lub odtwórz przykładową rozmowę.',
          });
        },
      });
      sourceRef.current = handle;
      if (!closed) setMode('live');
    } catch {
      emit({ kind: 'notice', text: 'Nie udało się uruchomić trybu głosowego.' });
      setMode('idle');
    }
  }, [mode, emit]);

  // Sprzątanie przy odmontowaniu.
  useEffect(() => {
    return () => {
      runHandleRef.current?.stop();
      sourceRef.current?.stop('user');
      stopTick();
    };
  }, [stopTick]);

  // --- stany przycisku live ---
  const liveLabel =
    mode === 'connecting' ? 'łączenie…' : mode === 'live' ? '■ Zakończ rozmowę' : 'Zadzwoń sam';
  const liveShowMic = mode === 'idle' || mode === 'script';
  const liveDisabled = !ENV_READY || mode === 'script' || mode === 'connecting';
  const liveTitle = ENV_READY
    ? 'Zadzwoń z mikrofonu — demo na żywo (limit 90 s)'
    : 'Skonfiguruj NEXT_PUBLIC_VAPI_PUBLIC_KEY i NEXT_PUBLIC_VAPI_DEMO_ASSISTANT_ID, aby włączyć tryb live';

  return (
    <>
      <TopBar live={state.live} timer={timer} />
      <div className="stage">
        <CallPanel
          sub={state.sub}
          rows={state.transcript}
          typing={state.typing}
          voiceDegraded={state.voiceDegraded}
          notice={state.notice}
          onPlay={handlePlay}
          playLabel={playLabel}
          playDisabled={mode !== 'idle'}
          scriptHighlight={state.voiceDegraded}
          onLive={handleLive}
          liveLabel={liveLabel}
          liveDisabled={liveDisabled}
          liveShowMic={liveShowMic}
          liveTitle={liveTitle}
        />
        <OpsConsole cards={state.cards} opsMeta={state.opsMeta} />
      </div>
      <ModulesBar cards={state.cards} />
    </>
  );
}
