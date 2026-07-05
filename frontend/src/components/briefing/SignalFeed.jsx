// frontend/src/components/briefing/SignalFeed.jsx

import './SignalFeed.css';

const CATEGORY_CONFIG = {
  product_launch: { label: 'Launch',      color: 'var(--accent-blue)',    short: 'L' },
  funding:        { label: 'Funding',     color: 'var(--accent-emerald)', short: 'F' },
  acquisition:    { label: 'Acquisition', color: 'var(--accent-violet)',  short: 'A' },
  regulation:     { label: 'Regulation',  color: 'var(--accent-amber)',   short: 'R' },
  partnership:    { label: 'Partnership', color: 'var(--accent-blue)',    short: 'P' },
  hiring:         { label: 'Hiring',      color: '#94a3b8',               short: 'H' },
  research:       { label: 'Research',    color: 'var(--accent-violet)',  short: 'Rs' },
  geopolitical:   { label: 'Geopolitical', color: 'var(--accent-amber)', short: 'G' },
};

const IMPORTANCE_CONFIG = {
  critical: { label: 'Critical', color: 'var(--accent-rose)' },
  high:     { label: 'High',     color: 'var(--accent-amber)' },
  medium:   { label: 'Medium',   color: 'var(--text-tertiary)' },
  low:      { label: 'Low',      color: 'var(--text-tertiary)' },
};

export default function SignalFeed({ signals, loading }) {
  if (loading) {
    return (
      <div className="signal-feed">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="signal-feed__skeleton">
            <div className="skeleton-block skeleton-block--sm" />
            <div className="skeleton-block skeleton-block--lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="signal-feed">
      <div className="signal-feed__header">
        <span className="signal-feed__title">SIGNAL FEED</span>
        <span className="signal-feed__count">{signals.length} signals</span>
      </div>

      <div className="signal-feed__list">
        {signals.map((signal, index) => (
          <SignalRow
            key={signal._id}
            signal={signal}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

function SignalRow({ signal, index }) {
  const category = CATEGORY_CONFIG[signal.category] || CATEGORY_CONFIG.research;
  const importance = IMPORTANCE_CONFIG[signal.importance] || IMPORTANCE_CONFIG.medium;

  const timeAgo = getTimeAgo(signal.publishedAt);

  return (
    <div className="signal-row">
      {/* Left: importance indicator */}
      <div
        className="signal-row__bar"
        style={{
          background: signal.importance === 'critical' || signal.importance === 'high'
            ? importance.color
            : 'transparent',
          borderColor: importance.color
        }}
      />

      {/* Category tag */}
      <div
        className="signal-row__category"
        style={{ color: category.color, borderColor: category.color + '30', background: category.color + '10' }}
      >
        {category.label}
      </div>

      {/* Content */}
      <div className="signal-row__content">
        <div className="signal-row__title-row">
          <h3 className="signal-row__title">{signal.title}</h3>
          {signal.importance === 'critical' && (
            <span className="signal-row__critical">Critical</span>
          )}
        </div>
        <p className="signal-row__summary">{signal.summary}</p>
        <div className="signal-row__meta">
          {signal.company && (
            <span className="signal-row__entity">{signal.company}</span>
          )}
          {signal.country && (
            <span className="signal-row__entity">{signal.country}</span>
          )}
          {signal.source?.name && (
            <span className="signal-row__source">
              via {signal.source.name}
            </span>
          )}
          <span className="signal-row__time">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000 / 60);

  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}