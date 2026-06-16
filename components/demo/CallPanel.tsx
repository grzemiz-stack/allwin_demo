/* Lewa kolumna: ekran połączenia (head + transkrypcja + stopka z akcjami).
   Oba przyciski są zawsze widoczne — tryb skryptowy to bezpieczny fallback
   dostępny obok live na każdej przeglądarce. */
'use client';

import type { Role } from '@/lib/demo/events';
import Transcript from './Transcript';

interface CallPanelProps {
  sub: string;
  rows: { role: Role; text: string }[];
  typing: boolean;
  voiceDegraded: boolean;
  notice: string | null;
  // tryb skryptowy
  onPlay: () => void;
  playLabel: string;
  playDisabled: boolean;
  scriptHighlight: boolean;
  // tryb live
  onLive: () => void;
  liveLabel: string;
  liveDisabled: boolean;
  liveShowMic: boolean;
  liveTitle?: string;
}

export default function CallPanel({
  sub,
  rows,
  typing,
  voiceDegraded,
  notice,
  onPlay,
  playLabel,
  playDisabled,
  scriptHighlight,
  onLive,
  liveLabel,
  liveDisabled,
  liveShowMic,
  liveTitle,
}: CallPanelProps) {
  return (
    <section className="call">
      <div className="call-head">
        <div className="avatar">SG</div>
        <div className="who">
          <div className="name">Szybka Guma — wulkanizacja</div>
          <div className="sub">{sub}</div>
        </div>
      </div>

      <Transcript rows={rows} typing={typing} />

      {voiceDegraded && (
        <div className="voice-degraded" role="status">
          Tryb głosowy działa najlepiej w Chrome — lub zobacz przykładową rozmowę.
        </div>
      )}
      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}

      <div className="call-foot">
        <button
          className={`btn btn-primary${scriptHighlight ? ' highlight' : ''}`}
          onClick={onPlay}
          disabled={playDisabled}
        >
          {playLabel}
        </button>
        <button className="btn btn-ghost" onClick={onLive} disabled={liveDisabled} title={liveTitle}>
          {liveShowMic && <span className="mic">🎤</span>} {liveLabel}
        </button>
      </div>
    </section>
  );
}
