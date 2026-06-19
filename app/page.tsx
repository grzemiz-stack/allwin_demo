import type { Metadata } from 'next';
import LandingHero from '@/components/landing/Hero';
import LandingModules from '@/components/landing/ModulesSection';

export const metadata: Metadata = {
  title: 'Allwin — AI Voice OS dla firm usługowych i sprzedażowych',
  description:
    'Asystent głosowy + konsola operacyjna, która odbiera połączenia, kwalifikuje klientów, umawia spotkania i zbiera płatności.',
};

export default function Home() {
  return (
    <main className="landing">
      <LandingHero />
      <LandingModules />
    </main>
  );
}
