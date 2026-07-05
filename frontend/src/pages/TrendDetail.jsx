import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './TrendDetail.css';
import PinButton from '../components/common/PinButton';

const API = 'http://localhost:5000/api';

export default function TrendDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/trends/${slug}`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="td__loading">Analyzing trend...</div>;
  if (!data?.trend) return <div className="td__loading">Trend not found</div>;

  const { trend, events } = data;

  return (
    <div className="td">
      <nav className="td__breadcrumb">
        <Link to="/trends">Trends</Link>
        <span>/</span>
        <span>{trend.name}</span>
      </nav>

      <header className="td__header">
        <div className="td__title-block">
          <span className={`td__status td__status--${trend.status}`}>{trend.status}</span>
          <h1 className="td__name">{trend.name}</h1>
          <p className="td__desc">{trend.description}</p>
          <div style={{ marginTop: '16px' }}>
            <PinButton
              itemType="trend"
              refId={trend.slug}
              title={trend.name}
              subtitle={trend.category}
              linkPath={`/trends/${trend.slug}`}
            />
          </div>
        </div>

        <div className="td__score">
          <div className="td__momentum-num">{trend.momentum}</div>
          <div className="td__momentum-label">MOMENTUM</div>
          <div className={`td__velocity ${trend.velocity > 0 ? 'td__velocity--up' : 'td__velocity--down'}`}>
            {trend.velocity > 0 ? '↑' : '↓'} {Math.abs(trend.velocity)}%
          </div>
        </div>
      </header>

      <div className="td__stats">
        <StatCard label="Events (7d)" value={trend.signals?.eventCount || 0} />
        <StatCard label="Companies" value={trend.signals?.companiesInvolved?.length || 0} />
        <StatCard label="Category" value={trend.category} />
        <StatCard label="Status" value={trend.status} />
      </div>

      {trend.aiSummary && (
        <section className="td__section">
          <div className="td__section-header">
            <h2 className="td__section-title">AI Analysis</h2>
            <span className="td__ai-badge">GPT-4</span>
          </div>
          <p className="td__ai-text">{trend.aiSummary}</p>
        </section>
      )}

      {trend.aiPrediction && (
        <section className="td__section">
          <h2 className="td__section-title">Prediction</h2>
          <p className="td__ai-text td__ai-text--prediction">{trend.aiPrediction}</p>
        </section>
      )}

      {trend.aiOpportunities?.length > 0 && (
        <section className="td__section">
          <h2 className="td__section-title">Emerging Opportunities</h2>
          <div className="td__opps">
            {trend.aiOpportunities.map((opp, i) => (
              <div key={i} className="td__opp">
                <span className="td__opp-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="td__opp-text">{opp}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {trend.signals?.companiesInvolved?.length > 0 && (
        <section className="td__section">
          <h2 className="td__section-title">Companies Driving This Trend</h2>
          <div className="td__companies">
            {trend.signals.companiesInvolved.map(slug => (
              <Link key={slug} to={`/companies/${slug}`} className="td__company">
                {slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="td__section">
          <h2 className="td__section-title">Signals Feeding This Trend</h2>
          <div className="td__events">
            {events.map(e => (
              <a key={e._id} href={e.url} target="_blank" rel="noreferrer" className="td__event">
                <span className="td__event-tag">{e.type.replace('_', ' ')}</span>
                <div className="td__event-body">
                  <h4 className="td__event-title">{e.title}</h4>
                  <p className="td__event-summary">{e.summary}</p>
                  <div className="td__event-meta">
                    <span>{e.source}</span>
                    <span>·</span>
                    <span>{formatDate(e.publishedAt)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="td__stat">
      <span className="td__stat-value">{value}</span>
      <span className="td__stat-label">{label}</span>
    </div>
  );
}

function formatDate(date) {
  const d = new Date(date);
  const diff = Math.floor((Date.now() - d) / 1000 / 60);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}