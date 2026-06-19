/* Proste inline SVG dla kafelków modułów (Etap 1 landingu).
   Bez zależności zewnętrznych. Kolor dziedziczony przez currentColor —
   akcent ustawia kontener (.lm-ic { color: var(--signal) }). */
import type { ReactNode, SVGProps } from 'react';

function Svg({ children, ...rest }: { children: ReactNode } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Recepcjonista AI — słuchawki z mikrofonem. */
export function IconReceptionist() {
  return (
    <Svg>
      <path d="M5 12a7 7 0 0 1 14 0" />
      <rect x="3.5" y="12" width="3.5" height="6" rx="1.2" />
      <rect x="17" y="12" width="3.5" height="6" rx="1.2" />
      <path d="M18.7 18v1.4a2 2 0 0 1-2 2H13" />
    </Svg>
  );
}

/** Kwalifikacja leadów — schowek z ptaszkiem. */
export function IconQualify() {
  return (
    <Svg>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <rect x="9" y="2.5" width="6" height="3.5" rx="1" />
      <path d="M9 13.5l2 2 4-4" />
    </Svg>
  );
}

/** Rezerwacja terminów — kalendarz. */
export function IconCalendar() {
  return (
    <Svg>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
      <rect x="7.5" y="12.5" width="3.2" height="3.2" rx="0.6" />
    </Svg>
  );
}

/** Przekazanie do człowieka — wymiana / przełączenie. */
export function IconHandoff() {
  return (
    <Svg>
      <path d="M6 9h11M14 6l3 3-3 3" />
      <path d="M18 15H7M10 12l-3 3 3 3" />
    </Svg>
  );
}

/** Follow-up SMS / Email — dymek wiadomości. */
export function IconFollowup() {
  return (
    <Svg>
      <path d="M5 6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10l-4 3v-3a2 2 0 0 1-1-1.7z" />
      <path d="M9 8.5h6M9 11.5h4" />
    </Svg>
  );
}

/** Wielojęzyczność — globus. */
export function IconLanguages() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="8" />
      <ellipse cx="12" cy="12" rx="4" ry="8" />
      <path d="M4 12h16M12 4v16" />
    </Svg>
  );
}

/** Płatności i zaliczki — karta płatnicza. */
export function IconPayments() {
  return (
    <Svg>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M7 14.5h4" />
    </Svg>
  );
}

/** Raporty i analityka — słupki. */
export function IconReports() {
  return (
    <Svg>
      <path d="M4 20h16" />
      <rect x="6" y="13" width="3" height="6" rx="0.6" fill="currentColor" stroke="none" />
      <rect x="10.5" y="9" width="3" height="10" rx="0.6" fill="currentColor" stroke="none" />
      <rect x="15" y="15" width="3" height="4" rx="0.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}
