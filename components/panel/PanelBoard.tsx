/* ============================================================
   PanelBoard — backoffice „Panel zgłoszeń" (port App z wzorca jsx na
   konwencje projektu). Bezstanowy: seed → useState, bez bazy. Dwie
   tablice kanban (lead / serwis) + szuflada detali z przejściem statusu.
   ============================================================ */
'use client';

import { useMemo, useState } from 'react';
import {
  LEAD_FLOW,
  SERV_FLOW,
  type Kind,
  type Lead,
  type Ticket,
} from '@/lib/panel/contracts';
import { SEED_LEADS, SEED_TICKETS } from '@/lib/panel/seed';
import Column from './Column';
import Drawer from './Drawer';
import { Layers, Snowflake } from './icons';

type Selection = { item: Lead | Ticket; kind: Kind } | null;

export default function PanelBoard() {
  const [tab, setTab] = useState<Kind>('lead');
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS);
  const [sel, setSel] = useState<Selection>(null);

  const flow = tab === 'lead' ? LEAD_FLOW : SERV_FLOW;
  const data: (Lead | Ticket)[] = tab === 'lead' ? leads : tickets;

  const kpis = useMemo(() => {
    const nowe =
      leads.filter((l) => l.status === 'nowy').length +
      tickets.filter((t) => t.status === 'nowe').length;
    const pilne = tickets.filter((t) => t.pilnosc === 'wysoka' && t.status !== 'zaplanowane').length;
    return { total: leads.length + tickets.length, nowe, pilne };
  }, [leads, tickets]);

  const advance = (item: Lead | Ticket, next: string) => {
    if (tab === 'lead') {
      setLeads((arr) => arr.map((x) => (x.id === item.id ? { ...x, status: next } : x)));
    } else {
      setTickets((arr) => arr.map((x) => (x.id === item.id ? { ...x, status: next } : x)));
    }
    setSel((s) => (s ? { ...s, item: { ...s.item, status: next } } : s));
  };

  const Tab = ({ id, label, count }: { id: Kind; label: string; count: number }) => (
    <button
      type="button"
      className={`panel-tab${tab === id ? ' active' : ''}`}
      onClick={() => {
        setTab(id);
        setSel(null);
      }}
    >
      {label}
      <span className="panel-tab-count">{count}</span>
    </button>
  );

  return (
    <div className="panel">
      {/* Header */}
      <header className="panel-header">
        <div className="panel-header-inner">
          <div className="panel-brand">
            <span className="panel-brand-ic">
              <Snowflake size={20} strokeWidth={2.2} />
            </span>
            <div>
              <div className="panel-brand-name">
                ClimaPolska <span className="muted">· Panel zgłoszeń</span>
              </div>
              <div className="panel-brand-sub">Recepcja i dyspozycja</div>
            </div>
          </div>
          <div className="panel-status-live">
            <span className="panel-status-live-dot" />
            Allwin odbiera
          </div>
        </div>
      </header>

      {/* Pasek: taby + KPI */}
      <div className="panel-toolbar">
        <div className="panel-toolbar-row">
          <div className="panel-tabs">
            <Tab id="lead" label="Leady — oględziny" count={leads.length} />
            <Tab id="serv" label="Serwis" count={tickets.length} />
          </div>
          <div className="panel-kpis">
            <div className="panel-kpi">
              <span className="panel-kpi-v new">{kpis.nowe}</span>
              <span className="panel-kpi-l">nowe dziś</span>
            </div>
            <div className="panel-kpi">
              <span className={`panel-kpi-v${kpis.pilne ? ' alert' : ''}`}>{kpis.pilne}</span>
              <span className="panel-kpi-l">pilne</span>
            </div>
            <div className="panel-kpi">
              <span className="panel-kpi-v">{kpis.total}</span>
              <span className="panel-kpi-l">łącznie</span>
            </div>
          </div>
        </div>
        <div className="panel-capture-note">
          <Layers size={13} />
          Wszystkie pozycje złapane automatycznie z połączeń przychodzących — zero ręcznego wpisywania.
        </div>
      </div>

      {/* Tablica */}
      <main className="panel-board">
        <div className="panel-columns">
          {flow.map((step) => (
            <Column
              key={step.key}
              step={step}
              kind={tab}
              items={data.filter((d) => d.status === step.key)}
              onCard={(item) => setSel({ item, kind: tab })}
            />
          ))}
        </div>
      </main>

      {sel && (
        <Drawer
          item={sel.item}
          kind={sel.kind}
          flow={sel.kind === 'lead' ? LEAD_FLOW : SERV_FLOW}
          onClose={() => setSel(null)}
          onAdvance={advance}
        />
      )}
    </div>
  );
}
