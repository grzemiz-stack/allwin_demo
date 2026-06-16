/* ============================================================
   GATE rate-limitu sesji LIVE — in-memory, best-effort.
   3 starty / 15 min per IP. Demo jest bezstanowe; to nie jest
   zabezpieczenie (public key i tak jest po stronie klienta), tylko
   hamulec, żeby otwarta/odświeżana karta nie paliła minut Vapi.

   Uwaga: stan jest per-instancja procesu (Map modułowa). Na
   serverless/multi-instance resetuje się przy redeployu i nie jest
   współdzielony między instancjami — akceptowalne dla demo.
   ============================================================ */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_STARTS = 3;

const hits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_STARTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - recent[0])) / 1000);
    return NextResponse.json(
      { ok: false, retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  recent.push(now);
  hits.set(ip, recent);
  return NextResponse.json({ ok: true, remaining: MAX_STARTS - recent.length });
}
