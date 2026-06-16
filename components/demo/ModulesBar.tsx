/* Stopka: moduły konfiguracyjne (statyczne chipy). */

const MODULES: { label: string; active?: boolean }[] = [
  { label: 'Recepcjonista', active: true },
  { label: 'Dyspozytor', active: true },
  { label: 'Rezerwacja terminu', active: true },
  { label: 'Magazyn / stany', active: true },
  { label: 'Płatność / zaliczka' },
  { label: 'Follow-up po usłudze' },
  { label: 'Opinia Google' },
  { label: 'Eskalacja do człowieka' },
  { label: 'Wielojęzyczność (UA / EN)' },
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
