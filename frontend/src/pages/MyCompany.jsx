import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './MyCompany.css';

const API = 'http://localhost:5000/api';

export default function MyCompany() {
  const { user, loading: authLoading } = useAuth();
  const [brief, setBrief] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [competitorEvents, setCompetitorEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    if (!user.hasCompany) { navigate('/onboarding'); return; }
    loadAll();
  }, [user, authLoading]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [briefRes, compRes, evRes] = await Promise.all([
        axios.get(`${API}/user/company/brief`),
        axios.get(`${API}/user/company/competitors`),
        axios.get(`${API}/user/company/competitor-events`)
      ]);
      setBrief(briefRes.data);
      setCompetitors(compRes.data);
      setCompetitorEvents(evRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    setGenerating(true);
    try {
      // Force refresh — bypasses 6h cache
      const res = await axios.get(`${API}/user/company/brief?refresh=1`);
      setBrief(res.data);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const switchCompany = () => {
    if (window.confirm(`This will replace your current company (${user.myCompany.name}) with a new one. Your existing brief data will be lost. Continue?`)) {
      navigate('/onboarding');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mc__loading">
        <div className="mc__spinner" />
        <p>Analyzing world intelligence through your company's lens...</p>
      </div>
    );
  }

  if (!user?.myCompany) return null;
  const c = user.myCompany;
  const b = brief?.brief;

  return (
    <div className="mc">
      <header className="mc__header">
        <div>
          <span className="mc__label">
            YOUR PERSONALIZED INTELLIGENCE
            {brief?.cached && <span style={{ color: 'var(--platinum)', marginLeft: 12, fontSize: 10 }}>· cached {timeAgo(brief.cachedAt)}</span>}
          </span>
          <h1 className="mc__title">{c.name}</h1>
          <div className="mc__meta">
            <span>{c.sector}</span>
            <span>·</span>
            <span>{c.size}</span>
            {c.country && <><span>·</span><span>{c.country}</span></>}
          </div>
        </div>
        <div className="mc__header-actions">
          <button className="mc__regen" onClick={() => navigate('/onboarding?edit=1')}>
            ✎ Edit Details
          </button>
          <button className="mc__regen" onClick={switchCompany}>
            + Switch Company
          </button>
          <button className="mc__regen mc__regen--primary" onClick={regenerate} disabled={generating}>
            {generating ? 'Regenerating...' : 'Regenerate Brief'}
          </button>
        </div>
      </header>

      {b && (
        <>
          <section className="mc__section mc__brief">
            <span className="mc__section-tag">EXECUTIVE BRIEF</span>
            <p className="mc__brief-text">{b.executiveBrief}</p>
            {b.focusMetric && (
              <div className="mc__focus">
                <span className="mc__focus-label">WATCH:</span>
                <span className="mc__focus-value">{b.focusMetric.value}</span>
                <span className="mc__focus-why">— {b.focusMetric.why}</span>
              </div>
            )}
          </section>

          <div className="mc__split">
            {b.threats?.length > 0 && (
              <section className="mc__section mc__col">
                <h2 className="mc__section-title">Threats to Your Company</h2>
                <div className="mc__cards">
                  {b.threats.map((t, i) => (
                    <div key={i} className={`mc-card mc-card--severity-${t.severity}`}>
                      <div className="mc-card__top">
                        <span className="mc-card__title">{t.title}</span>
                        <span className={`mc-card__badge mc-card__badge--${t.severity}`}>{t.severity}</span>
                      </div>
                      <p className="mc-card__reason">{t.reasoning}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {b.opportunities?.length > 0 && (
              <section className="mc__section mc__col">
                <h2 className="mc__section-title">Opportunities for You</h2>
                <div className="mc__cards">
                  {b.opportunities.map((o, i) => (
                    <div key={i} className={`mc-card mc-card--priority-${o.priority}`}>
                      <div className="mc-card__top">
                        <span className="mc-card__title">{o.title}</span>
                        <span className={`mc-card__badge mc-card__badge--${o.priority}`}>{o.priority}</span>
                      </div>
                      <p className="mc-card__reason">{o.match}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {b.competitorMoves?.length > 0 && (
            <section className="mc__section">
              <h2 className="mc__section-title">Competitor Moves</h2>
              <div className="mc__competitor-moves">
                {b.competitorMoves.map((m, i) => (
                  <div key={i} className="mc-move">
                    <div className="mc-move__comp">{m.competitor}</div>
                    <div className="mc-move__body">
                      <div className="mc-move__what">{m.move}</div>
                      <div className="mc-move__implication">→ {m.implication}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {b.recommendations?.length > 0 && (
            <section className="mc__section mc__recs">
              <h2 className="mc__section-title">Strategic Recommendations — This Quarter</h2>
              <ol className="mc__rec-list">
                {b.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ol>
            </section>
          )}
        </>
      )}

      {competitors.length > 0 && (
        <section className="mc__section">
          <h2 className="mc__section-title">Tracked Competitors ({competitors.length})</h2>
          <div className="mc__comp-grid">
            {competitors.map(c => (
              <Link key={c.slug} to={`/companies/${c.slug}`} className="mc-comp-card">
                <div className="mc-comp-card__name">{c.name}</div>
                <div className="mc-comp-card__sector">{c.sector}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {competitorEvents.length > 0 && (
        <section className="mc__section">
          <h2 className="mc__section-title">Live Competitor Activity</h2>
          <div className="mc__events">
            {competitorEvents.slice(0, 10).map(e => (
              <a key={e._id} href={e.url} target="_blank" rel="noreferrer" className="mc-event">
                <span className="mc-event__comp">{e.companySlug}</span>
                <div className="mc-event__body">
                  <div className="mc-event__title">{e.title}</div>
                  <div className="mc-event__meta">{e.source} · {timeAgo(e.publishedAt)}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {brief?.meta && (
        <div className="mc__meta-footer">
          Brief generated from {brief.meta.trendsAnalyzed} trends · {brief.meta.opportunitiesConsidered} opportunities · {brief.meta.signalsProcessed} world signals · {brief.meta.competitorEvents} competitor events
        </div>
      )}
    </div>
  );
}

function timeAgo(date) {
  const d = new Date(date);
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}