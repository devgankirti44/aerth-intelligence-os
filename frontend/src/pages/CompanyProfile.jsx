// frontend/src/pages/CompanyProfile.jsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AskPanel from '../components/companyProfile/AskPanel.jsx';
import axios from 'axios';
import './CompanyProfile.css';

const API = 'https://aerth-intelligence-os.onrender.comgence-os.onrender.comgence-os.onrender.com/api';

export default function CompanyProfile() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    load();
  }, [slug]);

  const load = () => {
    setLoading(true);
    axios.get(`${API}/companies/${slug}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await axios.post(`${API}/companies/${slug}/refresh`);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <div className="profile__loading">Loading intelligence...</div>;
  }

  if (!data || !data.company) {
    return <div className="profile__loading">Company not found</div>;
  }

  const { company, events, insight, github } = data;

  return (
    <div className="profile">
      {/* Breadcrumb */}
      <nav className="profile__breadcrumb">
        <Link to="/companies">Companies</Link>
        <span>/</span>
        <span>{company.name}</span>
      </nav>

      {/* Header */}
      <header className="profile__header">
        <div className="profile__header-left">
          <div className="profile__logo">
            {company.name.charAt(0)}
          </div>
          <div>
            <h1 className="profile__name">{company.name}</h1>
            <p className="profile__tagline">{company.tagline}</p>
          </div>
        </div>

        <div className="profile__actions">
          {company.website && (
            <a href={company.website} target="_blank" rel="noreferrer" className="btn-ghost">
              Website ↗
            </a>
          )}
          <button className="btn-primary" onClick={refresh} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh Intelligence'}
          </button>
        </div>
      </header>

      {/* Meta stats */}
      <div className="profile__meta">
        <MetaItem label="Industry" value={company.industry} />
        <MetaItem label="Founded" value={company.founded} />
        <MetaItem label="Headquarters" value={company.headquarters} />
        <MetaItem label="Employees" value={company.employees} />
        <MetaItem label="Valuation" value={company.valuation} />
        <MetaItem label="Status" value={company.status} />
      </div>

      {/* Tabs */}
      <div className="profile__tabs">
        {['overview', 'events', 'github', 'competitors'].map(tab => (
          <button
            key={tab}
            className={`profile__tab ${activeTab === tab ? 'profile__tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="profile__content">
        {activeTab === 'overview' && (
          <OverviewTab company={company} insight={insight} events={events} />
        )}
        {activeTab === 'events' && (
          <EventsTab events={events} />
        )}
        {activeTab === 'github' && (
          <GithubTab github={github} />
        )}
        {activeTab === 'competitors' && (
          <CompetitorsTab competitors={company.competitors} />
        )}
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  if (!value) return null;
  return (
    <div className="meta-item">
      <span className="meta-item__label">{label}</span>
      <span className="meta-item__value">{value}</span>
    </div>
  );
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ company, insight, events }) {
  return (
    <div className="tab-overview">
      {/* Description */}
      <section className="tab-section">
        <h2 className="section-title">About</h2>
        <p className="section-text">{company.description}</p>
      </section>

      {/* AI Insight */}
      {insight ? (
        <section className="tab-section">
          <div className="section-header">
            <h2 className="section-title">AI Intelligence Summary</h2>
            <span className="ai-badge">Generated {formatDate(insight.generatedAt)}</span>
          </div>
          <p className="section-text section-text--large">{insight.summary}</p>

          {insight.themes?.length > 0 && (
            <div className="themes">
              <span className="themes__label">STRATEGIC THEMES</span>
              <div className="themes__list">
                {insight.themes.map((t, i) => (
                  <span key={i} className="theme-chip">{t}</span>
                ))}
              </div>
            </div>
          )}

          {insight.strategicMoves?.length > 0 && (
            <div className="moves">
              <span className="moves__label">DETECTED STRATEGIC MOVES</span>
              {insight.strategicMoves.map((m, i) => (
                <div key={i} className="move">
                  <div className="move__num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="move__content">
                    <p className="move__text">{m.move}</p>
                    <p className="move__evidence">{m.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {insight.opportunities?.length > 0 && (
            <div className="split">
              <div className="split__col">
                <span className="split__label">OPPORTUNITIES</span>
                <ul className="split__list">
                  {insight.opportunities.map((o, i) => (
                    <li key={i}>{o}</li>
                  ))}
                </ul>
              </div>
              <div className="split__col">
                <span className="split__label">RISKS</span>
                <ul className="split__list">
                  {insight.risks?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="tab-section">
          <p className="section-text">
            AI analysis will appear here once events are collected. Click "Refresh Intelligence" to fetch news and generate analysis.
          </p>
        </section>
      )}

      {/* Recent events preview */}
      {events.length > 0 && (
        <section className="tab-section">
          <h2 className="section-title">Recent Signals</h2>
          <div className="events-preview">
            {events.slice(0, 5).map(e => (
              <EventRow key={e._id} event={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ─── EVENTS TAB ─── */
function EventsTab({ events }) {
  if (events.length === 0) {
    return <div className="empty">No events yet. Refresh to fetch.</div>;
  }
  return (
    <div className="tab-events">
      {events.map(e => <EventRow key={e._id} event={e} />)}
    </div>
  );
}

function EventRow({ event }) {
  return (
    <a href={event.url} target="_blank" rel="noreferrer" className="event-row">
      <div className={`event-row__type event-row__type--${event.significance}`}>
        {event.type.replace('_', ' ')}
      </div>
      <div className="event-row__body">
        <h4 className="event-row__title">{event.title}</h4>
        {event.summary && (
          <p className="event-row__summary">{event.summary}</p>
        )}
        <div className="event-row__meta">
          <span>{event.source}</span>
          <span className="event-row__dot">·</span>
          <span>{formatDate(event.publishedAt)}</span>
        </div>
      </div>
    </a>
  );
}

/* ─── GITHUB TAB ─── */
function GithubTab({ github }) {
  if (!github) {
    return <div className="empty">No GitHub data available.</div>;
  }
  return (
    <div className="tab-github">
      <div className="gh-stats">
        <GhStat label="Public Repos" value={github.publicRepos} />
        <GhStat label="Followers" value={github.followers} />
        <GhStat label="Total Stars" value={github.totalStars.toLocaleString()} />
        <GhStat label="Total Forks" value={github.totalForks.toLocaleString()} />
      </div>

      <h3 className="section-title">Top Repositories</h3>
      <div className="gh-repos">
        {github.topRepos.map(r => (
          <a key={r.name} href={r.url} target="_blank" rel="noreferrer" className="repo">
            <div className="repo__header">
              <h4 className="repo__name">{r.name}</h4>
              <span className="repo__stars">★ {r.stars.toLocaleString()}</span>
            </div>
            {r.description && <p className="repo__desc">{r.description}</p>}
            <div className="repo__meta">
              {r.language && <span>{r.language}</span>}
              <span className="repo__dot">·</span>
              <span>Updated {formatDate(r.updatedAt)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function GhStat({ label, value }) {
  return (
    <div className="gh-stat">
      <span className="gh-stat__value">{value}</span>
      <span className="gh-stat__label">{label}</span>
    </div>
  );
}

/* ─── COMPETITORS TAB ─── */
function CompetitorsTab({ competitors }) {
  if (!competitors || competitors.length === 0) {
    return <div className="empty">No competitors mapped.</div>;
  }
  return (
    <div className="tab-competitors">
      {competitors.map(slug => (
        <Link key={slug} to={`/companies/${slug}`} className="competitor">
          <div className="competitor__logo">
            {slug.charAt(0).toUpperCase()}
          </div>
          <span className="competitor__name">
            {slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </span>
          <span className="competitor__arrow">→</span>
        </Link>
      ))}
    </div>
  );
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d) / 1000 / 60);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 43200) return `${Math.floor(diff / 1440)}d ago`;
  return d.toLocaleDateString();
}