import { useState, useEffect } from 'react';
import axios from 'axios';
import './Simulations.css';

const API = 'http://localhost:5000/api';

const PRESETS = [
  "Trump imposes 60% tariff on all Chinese imports",
  "The US dollar loses reserve currency status",
  "India's 2026 monsoon fails, causing agricultural collapse",
  "Taiwan is blockaded by China for 6 months",
  "OPEC cuts oil production by 40%",
  "A major AI lab achieves AGI in 2026"
];

export default function Simulations() {
  const [sims, setSims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [scenario, setScenario] = useState('');
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSims();
  }, []);

  const fetchSims = async () => {
    try {
      const res = await axios.get(`${API}/simulations`);
      setSims(res.data);
      if (res.data.length > 0 && !selected) {
        loadSim(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSim = async (id) => {
    try {
      const res = await axios.get(`${API}/simulations/${id}`);
      setSelected(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const runNew = async () => {
    if (!scenario.trim()) return;
    setRunning(true);
    setSelected(null);
    try {
      const res = await axios.post(`${API}/simulations/run`, { scenario: scenario.trim() });
      setSelected(res.data);
      setScenario('');
      fetchSims();
    } catch (err) {
      alert('Simulation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setRunning(false);
    }
  };

  const deleteSim = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this simulation?')) return;
    await axios.delete(`${API}/simulations/${id}`);
    if (selected?._id === id) setSelected(null);
    fetchSims();
  };

  return (
    <div className="sim">
      <header className="sim__header">
        <span className="sim__label">SCENARIO INTELLIGENCE</span>
        <h1 className="sim__title">Simulations</h1>
        <p className="sim__subtitle">
          Stress-test hypothetical scenarios against your live intelligence graph. AI runs cascade analysis to predict winners, losers, and second-order effects.
        </p>
      </header>

      {/* Input */}
      <section className="sim__input-block">
        <div className="sim__input-wrap">
          <input
            type="text"
            className="sim__input"
            placeholder="What if..."
            value={scenario}
            onChange={e => setScenario(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !running) runNew(); }}
            disabled={running}
          />
          <button className="sim__run-btn" onClick={runNew} disabled={running || !scenario.trim()}>
            {running ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
        <div className="sim__presets">
          <span className="sim__presets-label">Try:</span>
          {PRESETS.map((p, i) => (
            <button
              key={i}
              className="sim__preset"
              onClick={() => setScenario(p)}
              disabled={running}
            >
              {p}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="sim__loading">Loading simulations...</div>
      ) : (
        <div className="sim__body">
          {/* History sidebar */}
          <aside className="sim__history">
            <div className="sim__history-header">
              <span>HISTORY</span>
              <span className="sim__history-count">{sims.length}</span>
            </div>
            {sims.length === 0 ? (
              <div className="sim__empty">
                No simulations yet. Run your first scenario.
              </div>
            ) : (
              sims.map(s => (
                <div
                  key={s._id}
                  className={`sim-item ${selected?._id === s._id ? 'sim-item--active' : ''}`}
                  onClick={() => loadSim(s._id)}
                >
                  <div className="sim-item__cat">{s.category || 'Scenario'}</div>
                  <div className="sim-item__scenario">{s.scenario}</div>
                  <div className="sim-item__meta">
                    <span className="sim-item__prob">P: {s.analysis?.probability || 0}%</span>
                    <button className="sim-item__delete" onClick={(e) => deleteSim(s._id, e)}>×</button>
                  </div>
                </div>
              ))
            )}
          </aside>

          {/* Analysis view */}
          <main className="sim__view">
            {running ? (
              <div className="sim__running">
                <div className="sim__spinner" />
                <p>Running cascade analysis across trends and signals...</p>
              </div>
            ) : selected ? (
              <SimView sim={selected} />
            ) : (
              <div className="sim__empty-view">
                Run a scenario above or select from history.
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}

function SimView({ sim }) {
  const a = sim.analysis;
  return (
    <article className="simview">
      <header className="simview__header">
        <span className="simview__cat">{sim.category}</span>
        <h2 className="simview__scenario">"{sim.scenario}"</h2>
        <div className="simview__meta-row">
          <div className="simview__gauge">
            <span className="simview__gauge-num">{a.probability}%</span>
            <span className="simview__gauge-label">PROBABILITY</span>
          </div>
          <div className="simview__gauge">
            <span className="simview__gauge-num">{a.confidenceScore}%</span>
            <span className="simview__gauge-label">CONFIDENCE</span>
          </div>
          <div className="simview__gauge">
            <span className="simview__gauge-num" style={{fontSize: '18px'}}>{a.timeToImpact}</span>
            <span className="simview__gauge-label">TIME TO IMPACT</span>
          </div>
        </div>
      </header>

      <section className="simview__verdict">
        <span className="simview__section-label">EXECUTIVE VERDICT</span>
        <p>{a.executiveVerdict}</p>
      </section>

      {a.cascadeChain?.length > 0 && (
        <section className="simview__section">
          <h3>Cascade Chain</h3>
          <div className="cascade">
            {a.cascadeChain.map((step, i) => (
              <div key={i} className="cascade__step">
                <div className="cascade__dot">{i + 1}</div>
                <div className="cascade__text">{step}</div>
                {i < a.cascadeChain.length - 1 && <div className="cascade__line" />}
              </div>
            ))}
          </div>
        </section>
      )}

      {a.trendImpacts?.length > 0 && (
        <section className="simview__section">
          <h3>Trend Impacts</h3>
          <div className="impacts">
            {a.trendImpacts.map((t, i) => (
              <div key={i} className={`impact impact--${t.direction}`}>
                <div className="impact__top">
                  <span className="impact__name">{t.trendName}</span>
                  <span className={`impact__badge impact__badge--${t.direction}`}>
                    {arrowFor(t.direction)} {t.direction}
                  </span>
                </div>
                <p className="impact__reason">{t.reasoning}</p>
                <span className={`impact__mag impact__mag--${t.magnitude}`}>{t.magnitude}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {a.sectorImpacts?.length > 0 && (
        <section className="simview__section">
          <h3>Sector Impacts</h3>
          <div className="sectors">
            {a.sectorImpacts.map((s, i) => (
              <div key={i} className={`sector sector--${s.impact}`}>
                <span className="sector__name">{s.sector}</span>
                <span className="sector__impact">{s.impact.toUpperCase()}</span>
                <p className="sector__reason">{s.reasoning}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="simview__split">
        <div className="wl-col wl-col--winners">
          <h3>Winners</h3>
          {a.winners?.map((w, i) => (
            <div key={i} className="wl-item">
              <span className="wl-item__name">{w.name}</span>
              <span className="wl-item__why">{w.why}</span>
            </div>
          ))}
        </div>
        <div className="wl-col wl-col--losers">
          <h3>Losers</h3>
          {a.losers?.map((l, i) => (
            <div key={i} className="wl-item">
              <span className="wl-item__name">{l.name}</span>
              <span className="wl-item__why">{l.why}</span>
            </div>
          ))}
        </div>
      </section>

      {a.emergingOpportunities?.length > 0 && (
        <section className="simview__section">
          <h3>Emerging Opportunities</h3>
          <ul className="simview__bullets simview__bullets--opps">
            {a.emergingOpportunities.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </section>
      )}

      {a.hiddenRisks?.length > 0 && (
        <section className="simview__section">
          <h3>Hidden Risks</h3>
          <ul className="simview__bullets simview__bullets--risks">
            {a.hiddenRisks.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </section>
      )}

      {a.strategicPlaybook?.length > 0 && (
        <section className="simview__section simview__section--play">
          <h3>Strategic Playbook (Next 90 Days)</h3>
          <ol className="simview__playbook">
            {a.strategicPlaybook.map((p, i) => <li key={i}>{p}</li>)}
          </ol>
        </section>
      )}
    </article>
  );
}

function arrowFor(dir) {
  return {
    accelerate: '↑↑',
    decelerate: '↓',
    reverse: '⇅',
    unchanged: '—'
  }[dir] || '—';
}