/* Górny pasek: brand + tag DEMO + wskaźnik LIVE z timerem. */

interface TopBarProps {
  live: boolean;
  timer: string;
}

export default function TopBar({ live, timer }: TopBarProps) {
  return (
    <div className="bar">
      <div className="brand">
        <span className="dot" />
        Allwin
      </div>
      <span className="tag">DEMO</span>
      <div className="bar-spacer" />
      <div className={`live${live ? ' on' : ''}`}>
        <span className="pulse" />
        POŁĄCZENIE NA ŻYWO
        <span className="timer">{timer}</span>
      </div>
    </div>
  );
}
