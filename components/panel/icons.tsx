/* Inline SVG dla /panel — zastępują lucide-react (zero nowych zależności).
   Wzór jak components/landing/icons.tsx: stroke=currentColor, kolor dziedziczony
   z kontenera. `size` steruje width/height (domyślnie 16). */
import type { ReactNode, SVGProps } from 'react';

function Svg({
  children,
  size = 16,
  strokeWidth = 1.8,
  ...rest
}: { children: ReactNode; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

type IconProps = { size?: number; strokeWidth?: number };

/** Płatek śniegu — znak marki HVAC (chłód). */
export function Snowflake(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2v20M4.2 6.5l15.6 9M19.8 6.5l-15.6 9" />
      <path d="M12 5l2.2 2.2M12 5l-2.2 2.2M12 19l2.2-2.2M12 19l-2.2-2.2" />
    </Svg>
  );
}

/** Połączenie przychodzące — ślad „z rozmowy". */
export function PhoneIncoming(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M15 3v5h5M20.5 8.5L15 3" />
      <path d="M5 4h3l1.6 4-2 1.4a12 12 0 0 0 5 5l1.4-2 4 1.6V18a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4z" />
    </Svg>
  );
}

/** Pinezka lokalizacji. */
export function MapPin(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

/** Kalendarz — preferowany termin. */
export function CalendarDays(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M4 9.5h16M8 3v4M16 3v4" />
    </Svg>
  );
}

/** Strzałka „w głąb" — wejście w kartę. */
export function ChevronRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

/** Zamknięcie szuflady. */
export function X(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

/** Strzałka w prawo — „przesuń do". */
export function ArrowRight(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

/** Dom jednorodzinny. */
export function Home(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v9h12v-9" />
    </Svg>
  );
}

/** Budynek — mieszkanie / biuro. */
export function Building2(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </Svg>
  );
}

/** Klucz płaski — urządzenie / serwis. */
export function Wrench(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M15 4.5a4 4 0 0 0-5 5l-6 6 2.5 2.5 6-6a4 4 0 0 0 5-5l-2.4 2.4-2.1-.5-.5-2.1z" />
    </Svg>
  );
}

/** Trójkąt ostrzegawczy — pilność. */
export function AlertTriangle(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17.5v.01" />
    </Svg>
  );
}

/** Ptaszek — etap domknięty. */
export function Check(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 12.5l4 4 10-10" />
    </Svg>
  );
}

/** Słuchawka — „zadzwoń do klienta". */
export function Phone(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 4h3l1.6 4-2 1.4a12 12 0 0 0 5 5l1.4-2 4 1.6V18a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4z" />
    </Svg>
  );
}

/** Warstwy — „złapane automatycznie z połączeń". */
export function Layers(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </Svg>
  );
}
