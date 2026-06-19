/* Sekcja „Jeden system. Wiele możliwości." (Etap 1). Server component,
   8 kafelków modułów. Copy 1:1 ze specyfikacji. */
import type { ReactNode } from 'react';
import {
  IconReceptionist,
  IconQualify,
  IconCalendar,
  IconHandoff,
  IconFollowup,
  IconLanguages,
  IconPayments,
  IconReports,
} from './icons';

const MODULES: { icon: ReactNode; title: string; desc: string }[] = [
  { icon: <IconReceptionist />, title: 'Recepcjonista AI', desc: 'Odbiera każdy telefon 24/7' },
  { icon: <IconQualify />, title: 'Kwalifikacja leadów', desc: 'Zadaje pytania, zbiera dane' },
  { icon: <IconCalendar />, title: 'Rezerwacja terminów', desc: 'Umawia spotkania w kalendarzu' },
  { icon: <IconHandoff />, title: 'Przekazanie do człowieka', desc: 'Płynne przełączenie, pełen kontekst' },
  { icon: <IconFollowup />, title: 'Follow-up SMS / Email', desc: 'Przypomnienia, follow-up, ankiety' },
  { icon: <IconLanguages />, title: 'Wielojęzyczność', desc: 'Obsługa wielu języków' },
  { icon: <IconPayments />, title: 'Płatności i zaliczki', desc: 'Linki do płatności, zaliczki, faktury' },
  { icon: <IconReports />, title: 'Raporty i analityka', desc: 'Statystyki, skuteczność, pełna kontrola' },
];

export default function LandingModules() {
  return (
    <section className="landing-modules">
      <div className="lm-head">
        <h2>Jeden system. Wiele możliwości.</h2>
        <p>Moduły, które możesz dowolnie łączyć i dopasować do swojej branży.</p>
      </div>
      <div className="lm-grid">
        {MODULES.map((m) => (
          <div className="lm-card" key={m.title}>
            <span className="lm-ic">{m.icon}</span>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
