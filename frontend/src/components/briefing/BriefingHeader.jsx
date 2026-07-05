// frontend/src/components/briefing/BriefingHeader.jsx

import './BriefingHeader.css';

export default function BriefingHeader({ date, meta, summary, actions, loading }) {
  const formatted = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric'
  });

  return (
    <header className="briefing-header">
      {/* Top row: date + signal count */}
      <div className="briefing-header__top">
        <div className="briefing-header__date-block">
          <span className="briefing-header__label">DAILY BRIEFING</span>
          <h1 className="briefing-header__date">{formatted}</h1>
        </div>
        <div className="briefing-header__meta">
          {meta?.critical > 0 && (
            <div className="briefing-header__badge briefing-header__badge--critical">
              <span>{meta.critical}</span>
              <span>Critical</span>
            </div>
          )}
          {meta?.high > 0 && (
            <div className="briefing-header__badge briefing-header__badge--high">
              <span>{meta.high}</span>
              <span>High</span>
            </div>
          )}
          <div className="briefing-header__badge briefing-header__badge--total">
            <span>{meta?.total || 0}</span>
            <span>Signals</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="briefing-header__divider" />

      {/* Executive Summary */}
      <div className="briefing-header__summary">
        <div className="briefing-header__summary-label">
          <span className="briefing-header__label">EXECUTIVE SUMMARY</span>
          <span className="briefing-header__ai-tag">AI Generated</span>
        </div>

        {loading ? (
          <div className="briefing-header__skeleton">
            <div className="skeleton-line skeleton-line--80" />
            <div className="skeleton-line skeleton-line--60" />
            <div className="skeleton-line skeleton-line--70" />
          </div>
        ) : (
          <p className="briefing-header__summary-text">
            {summary || 'Generating executive summary...'}
          </p>
        )}
      </div>

      {/* Recommended Actions */}
      {actions && actions.length > 0 && (
        <div className="briefing-header__actions">
          <span className="briefing-header__label">RECOMMENDED ACTIONS</span>
          <div className="briefing-header__action-list">
            {actions.map((action, i) => (
              <div key={i} className="briefing-header__action">
                <span className="briefing-header__action-num">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="briefing-header__action-text">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}