/* Stopka: moduły konfiguracyjne (statyczne chipy). */

const MODULES: { label: string; active?: boolean }[] = [
  // Aktywne = moduły użyte w przykładowej rozmowie (zob. salonScenario).
  { label: 'Recepcjonista AI', active: true },
  { label: 'Kwalifikacja leadów', active: true },
  { label: 'Rezerwacja terminów', active: true },
  { label: 'Płatności i zaliczki', active: true },
  { label: 'Follow-up SMS / Email', active: true },
  { label: 'Przekazanie do człowieka', active: true },
  // Dostępne do dołożenia — branża to konfiguracja, nie kod.
  { label: 'Opinie Google' },
  { label: 'Wielojęzyczność (UA / EN)' },
  { label: 'Magazyn / stany' },
  { label: 'Raport zmianowy' },
];

export default function ModulesBar() {
  return (
    <div className="modules">
      <h3>Moduły, które możemy dołożyć — branża to konfiguracja, nie kod</h3>
      <div className="chips">
        {MODULES.map((m) => (
          <span className={`chip${m.active ? ' active' : ''}`} key={m.label}>
            <span className="d" />
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
