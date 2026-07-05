// frontend/src/components/briefing/OpportunityStrip.jsx

import './OpportunityStrip.css';

const OPPORTUNITIES = [
  {
    id: 1,
    title: 'Agentic Browser Automation',
    score: 91,
    trend: 'AI Agents',
    confidence: 'High',
    color: 'var(--accent-violet)'
  },
  {
    id: 2,
    title: 'AI Security & Red Teaming',
    score: 88,
    trend: 'Cybersecurity',
    confidence: 'High',
    color: 'var(--accent-rose)'
  },
  {
    id: 3,
    title: 'Synthetic Data Pipelines',
    score: 84,
    trend: 'AI Infrastructure',
    confidence: 'Medium',
    color: 'var(--accent-blue)'
  },
  {
    id: 4,
    title: 'Humanoid Robot OS',
    score: 81,
    trend: 'Robotics',
    confidence: 'Medium',
    color: 'var(--accent-emerald)'
  }
];

export default function OpportunityStrip() {
  return (
    <div className="opportunity-strip">
      <div className="opportunity-strip__header">
        <span className="opportunity-strip__label">TOP OPPORTUNITIES THIS WEEK</span>
        <a href="/opportunities" className="opportunity-strip__link">
          View all →
        </a>
      </div>

      <div className="opportunity-strip__grid">
        {OPPORTUNITIES.map(opp => (
          <OpportunityCard key={opp.id} opportunity={opp} />
        ))}
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity: opp }) {
  return (
    <div className="opp-card">
      <div className="opp-card__top">
        <div
          className="opp-card__score"
          style={{ color: opp.color }}
        >
          {opp.score}
        </div>
        <span
          className="opp-card__confidence"
          style={{
            color: opp.confidence === 'High'
              ? 'var(--accent-emerald)'
              : 'var(--accent-amber)'
          }}
        >
          {opp.confidence}
        </span>
      </div>

      <h3 className="opp-card__title">{opp.title}</h3>

      <div className="opp-card__trend">
        <div
          className="opp-card__trend-dot"
          style={{ background: opp.color }}
        />
        <span>{opp.trend}</span>
      </div>
    </div>
  );
}