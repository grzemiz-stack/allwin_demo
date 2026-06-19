/* HERO landingu (Etap 1). Server component — statyczny, tylko next/link.
   Wizual po prawej (panel „Konsola operacyjna" + telefon) to STATYCZNY
   OZDOBNIK: żadnych danych, czysty HTML/CSS/SVG. Na <840px panel znika,
   zostaje wycentrowany telefon pod tekstem. */
import Link from 'next/link';

const NAV = ['Pulpit', 'Rozmowy', 'Leady', 'Kalendarz', 'Zadania', 'Płatności', 'Raporty'];

const STATS = [
  { l: 'Rozmowy', v: '128', d: '+12%' },
  { l: 'Terminy', v: '27', d: '+18%' },
  { l: 'Leady', v: '43', d: '+21%' },
  { l: 'Płatności', v: '18 450 zł', d: '+15%' },
];

const UPCOMING = [
  { t: '14:00', n: 'Anna K.' },
  { t: '15:30', n: 'Marek W.' },
  { t: '16:15', n: 'Zofia L.' },
];

export default function LandingHero() {
  return (
    <section className="landing-hero">
      <header className="bar landing-bar">
        <div className="brand">
          <span className="dot" />
          Allwin
        </div>
        <span className="tag">DEMO</span>
      </header>

      <div className="hero-grid">
        <div className="hero-copy">
          <h1 className="hero-h1">
            <span className="accent">AI Voice OS</span> dla firm usługowych i sprzedażowych
          </h1>
          <p className="hero-lead">
            Asystent głosowy + konsola operacyjna, która odbiera połączenia, kwalifikuje
            klientów, umawia spotkania, zbiera płatności i prowadzi proces do końca.
          </p>
          <div className="hero-cta">
            <Link href="/demo" className="hero-btn primary">
              Zobacz demo →
            </Link>
            <Link href="/demo" className="hero-btn ghost">
              ▶ Zobacz jak to działa
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-dashboard">
            <div className="dash-head">
              <span className="dash-title">Konsola operacyjna</span>
              <span className="dash-live">● na żywo</span>
            </div>

            <div className="dash-body">
              <nav className="dash-nav">
                {NAV.map((item, i) => (
                  <span className={i === 0 ? 'on' : ''} key={item}>
                    {item}
                  </span>
                ))}
              </nav>

              <div className="dash-main">
                <div className="dash-stats">
                  {STATS.map((s) => (
                    <div className="stat" key={s.l}>
                      <span className="stat-l">{s.l}</span>
                      <span className="stat-v">{s.v}</span>
                      <span className="stat-d">{s.d}</span>
                    </div>
                  ))}
                </div>

                <div className="dash-chart">
                  <svg viewBox="0 0 300 60" preserveAspectRatio="none">
                    <path
                      className="area"
                      d="M0 44 L43 38 L86 41 L129 28 L172 32 L215 19 L258 23 L300 11 L300 60 L0 60 Z"
                    />
                    <path
                      className="line"
                      d="M0 44 L43 38 L86 41 L129 28 L172 32 L215 19 L258 23 L300 11"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>

                <div className="dash-upcoming">
                  <div className="uh">Nadchodzące terminy</div>
                  {UPCOMING.map((u) => (
                    <div className="u" key={u.t}>
                      <time>{u.t}</time>
                      <span>{u.n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hero-phone">
            <div className="phone-screen">
              <div className="phone-status">Połączenie przychodzące</div>
              <div className="phone-avatar">📞</div>
              <div className="phone-name">Allwin AI</div>
              <div className="phone-actions">
                <span className="pa decline" />
                <span className="pa accept" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
