import { useState, useEffect } from 'react';
import axios from 'axios';
import './WorldIntel.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

const DOMAIN_LABELS = {
  india_agriculture: 'India Agriculture',
  food_security: 'Food Security',
  commodities: 'Commodities',
  currency_macro: 'Currency & Macro',
  geopolitics: 'Geopolitics',
  energy_transition: 'Energy Transition',
  india_manufacturing: 'India Manufacturing',
  company: 'Corporate'
};

export default function WorldIntel() {
  const [dashboard, setDashboard] = useState(null);
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [briefLoading, setBriefLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);

  useEffect(() => {
    fetchDashboard();
    fetchBrief();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API}/world-intel/dashboard`);
      setDashboard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrief = async () => {
    setBriefLoading(true);
    try {
      const res = await axios.get(`${API}/world-intel/brief`);
      setBrief(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setBriefLoading(false);
    }
  };

  if (loading) return <div className="wi__loading">Loading world intelligence...</div>;
  if (!dashboard) return <div className="wi__loading">No data available</div>;

  const { stats, byDomain, byRegion, latestSignals } = dashboard;
  const maxDomainCount = Math.max(...byDomain.map(d => d.count), 1);

  const filteredSignals = selectedDomain
    ? latestSignals.filter(s => s.domain === selectedDomain)
    : latestSignals;

  return (
    <div className="wi">
      <header className="wi__header">
        <span className="wi__label">MACRO INTELLIGENCE COMMAND</span>
        <h1 className="wi__title">World Intelligence</h1>
        <p className="wi__subtitle">
          Real-time global signal aggregation across geopolitics, commodities, currency, and macro shifts.
        </p>
      </header>

      {/* Stats bar */}
      <div className="wi__stats">
        <div className="wi-stat">
          <span className="wi-stat__num">{stats.totalSignals}</span>
          <span className="wi-stat__label">Signals (7d)</span>
        </div>
        <div className="wi-stat">
          <span className="wi-stat__num">{stats.last24h}</span>
          <span className="wi-stat__label">Last 24h</span>
        </div>
        <div className="wi-stat">
          <span className="wi-stat__num">{stats.activeDomains}</span>
          <span className="wi-stat__label">Active Domains</span>
        </div>
        <div className="wi-stat">
          <span className="wi-stat__num">{stats.activeRegions}</span>
          <span className="wi-stat__label">Regions</span>
        </div>
      </div>

      {/* AI Macro Brief */}
      <section className="wi__section wi__brief">
        <div className="wi__section-header">
          <div>
            <span className="wi__section-tag">DAILY INTELLIGENCE BRIEF</span>
            <h2 className="wi__section-title">The State of the World</h2>
          </div>
          <button className="wi__refresh" onClick={fetchBrief} disabled={briefLoading}>
            {briefLoading ? 'Analyzing...' : 'Regenerate'}
          </button>
        </div>
        {briefLoading ? (
          <div className="wi__brief-loading">AI synthesizing global signals...</div>
        ) : brief?.brief ? (
          <div className="wi__brief-text">
            {brief.brief.split('\n\n').filter(p => p.trim()).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <div className="wi__brief-loading">No brief available</div>
        )}
      </section>

      {/* Domain heat map */}
      <section className="wi__section">
        <h2 className="wi__section-title">Signal Domains</h2>
        <div className="wi__domains">
          {byDomain.map(d => {
            const intensity = (d.count / maxDomainCount) * 100;
            return (
              <div
                key={d._id}
                className={`wi-domain ${selectedDomain === d._id ? 'wi-domain--active' : ''}`}
                onClick={() => setSelectedDomain(selectedDomain === d._id ? null : d._id)}
              >
                <div className="wi-domain__bar" style={{ height: `${intensity}%` }} />
                <div className="wi-domain__content">
                  <span className="wi-domain__name">{DOMAIN_LABELS[d._id] || d._id}</span>
                  <span className="wi-domain__count">{d.count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Regional split */}
      <section className="wi__section">
        <h2 className="wi__section-title">Regional Activity</h2>
        <div className="wi__regions">
          {byRegion.map(r => (
            <div key={r._id} className="wi-region">
              <span className="wi-region__name">{r._id || 'Unknown'}</span>
              <div className="wi-region__bar-wrap">
                <div
                  className="wi-region__bar"
                  style={{ width: `${(r.count / stats.totalSignals) * 100}%` }}
                />
              </div>
              <span className="wi-region__count">{r.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Signal feed */}
      <section className="wi__section">
        <div className="wi__section-header">
          <h2 className="wi__section-title">
            {selectedDomain ? `${DOMAIN_LABELS[selectedDomain]} Signals` : 'Live Signal Feed'}
          </h2>
          {selectedDomain && (
            <button className="wi__refresh" onClick={() => setSelectedDomain(null)}>
              Clear filter
            </button>
          )}
        </div>
        <div className="wi__feed">
          {filteredSignals.length === 0 ? (
            <div className="wi__brief-loading">No signals in this domain</div>
          ) : (
            filteredSignals.map(s => (
              <a key={s._id} href={s.url} target="_blank" rel="noreferrer" className="wi-signal">
                <div className="wi-signal__meta">
                  <span className="wi-signal__domain">{DOMAIN_LABELS[s.domain] || s.domain}</span>
                  <span className="wi-signal__source">{s.source}</span>
                  <span className="wi-signal__time">{timeAgo(s.publishedAt)}</span>
                </div>
                <h4 className="wi-signal__title">{s.title}</h4>
                {s.summary && <p className="wi-signal__summary">{s.summary}</p>}
              </a>
            ))
          )}
        </div>
      </section>
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