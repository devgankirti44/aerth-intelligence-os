// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import GlobalView from '../components/home/GlobalView.jsx';
import MetricCard from '../components/home/MetricCard.jsx';
import SignalsPanel from '../components/home/SignalsPanel.jsx';
import OpportunitiesPanel from '../components/home/OpportunitiesPanel.jsx';
import TrendMomentum from '../components/home/TrendMomentum.jsx';
import InsightPanel from '../components/home/InsightPanel.jsx';
import LiveTimeline from '../components/home/LiveTimeline.jsx';
import PersonalBand from '../components/home/PersonalBand.jsx';
import { useSocketEvent } from '../hooks/useSocket';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

export default function Home() {
  const [metrics, setMetrics] = useState({
    stability: 78,
    momentum: 18.7,
    signalCount: 0,
    trendCount: 0,
    oppCount: 0
  });

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/world-intel/dashboard`).catch(() => ({ data: {} })),
      axios.get(`${API}/trends`).catch(() => ({ data: [] })),
      axios.get(`${API}/opportunities`).catch(() => ({ data: [] }))
    ]).then(([wi, trends, opps]) => {
      const signalCount = wi.data?.stats?.totalSignals || 0;
      const trendCount = trends.data?.length || 0;
      const oppCount = opps.data?.length || 0;

      const declining = trends.data.filter(t => t.status === 'declining').length;
      const stability = Math.max(30, Math.min(95, 85 - declining * 5));

      const topTrends = trends.data.slice(0, 5);
      const avgMomentum = topTrends.length > 0
        ? topTrends.reduce((sum, t) => sum + (t.momentum || 50), 0) / topTrends.length
        : 50;
      const momentumPct = ((avgMomentum - 50) / 50 * 100).toFixed(1);

      setMetrics({
        stability,
        momentum: momentumPct,
        signalCount,
        trendCount,
        oppCount
      });
    });
  }, []);

  useSocketEvent('metrics:update', (update) => {
    setMetrics(prev => ({ ...prev, ...update }));
  });

  return (
    <div className="home">

      {/* ── WHAT IS AERTH — First thing user sees ── */}
      <WhatIsAerth metrics={metrics} />

      {/* ── PERSONAL BAND ── */}
      <PersonalBand />

      {/* ── METRICS + GLOBE + RAIL ── */}
      <div className="home__grid">
        <div className="home__metrics">
          <MetricCard
            label="Global Stability"
            value={metrics.stability}
            unit="/100"
            trend={`${metrics.signalCount} signals`}
            trendDirection={metrics.stability > 70 ? 'up' : 'down'}
            subtitle="vs last 7 days"
          />
          <MetricCard
            label="System Momentum"
            value={metrics.momentum > 0 ? `+${metrics.momentum}` : metrics.momentum}
            unit="%"
            trend={metrics.momentum > 0 ? 'Stronger' : 'Weaker'}
            trendDirection={metrics.momentum > 0 ? 'up' : 'down'}
          />
          <MetricCard
            label="Opportunities"
            value={metrics.oppCount}
            subtitle={`${metrics.trendCount} trends tracked`}
            valueStyle="gold"
          />
        </div>

        <div className="home__globe">
          <GlobalView />
        </div>

        <div className="home__rail">
          <SignalsPanel />
          <MarketPulse metrics={metrics} />
          <InsightPanel />
        </div>
      </div>

      {/* ── HOW TO USE THIS SITE ── */}
      <JourneyStrip />

      <div className="home__row">
        <OpportunitiesPanel />
        <TrendMomentum />
      </div>

      {/* ── WHAT TO DO NEXT ── */}
      <WhatToDoNext metrics={metrics} />

      <div className="timeline-wrap">
        <LiveTimeline />
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WHAT IS AERTH — One liner explainer at the very top
// ─────────────────────────────────────────────────────────────────────────────
function WhatIsAerth({ metrics }) {
  const [activeTab, setActiveTab] = useState(0);

  const personas = [
    {
      label: 'Student',
      emoji: '🎓',
      oneLiner: 'I read hundreds of news articles daily and tell you which skills to learn and what to build to earn money from what is happening in the world right now.',
      example: 'BSc student, Ludhiana → AERTH detects India agri boom → suggests microgreens farming → 90-day plan → ₹25,000/month'
    },
    {
      label: 'Entrepreneur',
      emoji: '🚀',
      oneLiner: 'I track your competitors, detect market shifts before they hit you, and tell you exactly which threats to worry about — based on real news, not guesswork.',
      example: 'SaaS founder → AERTH detects competitor raised $10M → simulates market impact → surfaces 3 defensive moves'
    },
    {
      label: 'Researcher',
      emoji: '🔬',
      oneLiner: 'I am your research assistant that never sleeps. Ask me anything about current events and I give you a cited answer from real articles — not a hallucinated response.',
      example: 'Ask: "What is China\'s semiconductor strategy?" → Get answer with 6 source links → No hallucination'
    },
    {
      label: 'Investor',
      emoji: '📈',
      oneLiner: 'I detect macro trends before they become obvious, simulate geopolitical scenarios and their market impact, and surface opportunities emerging from global shifts.',
      example: '"India joins BRICS trade settlement" → AERTH cascades impact across 8 sectors → surfaces 4 winners'
    }
  ];

  const active = personas[activeTab];

  return (
    <div className="what-is-aerth">

      {/* Live badge */}
      <div className="aerth-badge">
        <span className="aerth-badge__dot" />
        <span>RAG-powered · Every answer cites its source · Not ChatGPT</span>
      </div>

      {/* Big question */}
      <h1 className="aerth-headline">What is AERTH?</h1>
      <p className="aerth-subline">
        A news research assistant that reads the world for you,
        finds patterns in the noise, and tells you what to do next.
      </p>

      {/* Persona tabs */}
      <div className="aerth-tabs">
        {personas.map((p, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`aerth-tab ${activeTab === i ? 'aerth-tab--active' : ''}`}
          >
            <span>{p.emoji}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* One liner + example */}
      <div className="aerth-persona">
        <div className="aerth-persona__oneliner">
          <p className="aerth-persona__label">
            IF YOU ARE A {active.label.toUpperCase()}, AERTH IS:
          </p>
          <p className="aerth-persona__text">
            "{active.oneLiner}"
          </p>
        </div>
        <div className="aerth-persona__example">
          <p className="aerth-persona__label">REAL EXAMPLE</p>
          <p className="aerth-persona__flow">{active.example}</p>
        </div>
      </div>

      {/* Live numbers */}
      <div className="aerth-stats">
        <div className="aerth-stat">
          <span className="aerth-stat__num">{metrics.signalCount || '—'}</span>
          <span className="aerth-stat__label">Signals Collected</span>
        </div>
        <div className="aerth-stat__divider" />
        <div className="aerth-stat">
          <span className="aerth-stat__num">{metrics.trendCount || '—'}</span>
          <span className="aerth-stat__label">Trends Detected</span>
        </div>
        <div className="aerth-stat__divider" />
        <div className="aerth-stat">
          <span className="aerth-stat__num">{metrics.oppCount || '—'}</span>
          <span className="aerth-stat__label">Opportunities Found</span>
        </div>
        <div className="aerth-stat__divider" />
        <div className="aerth-stat">
          <span className="aerth-stat__num aerth-stat__num--live">LIVE</span>
          <span className="aerth-stat__label">Updates every 30s</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// JOURNEY STRIP — How this site works, step by step
// ─────────────────────────────────────────────────────────────────────────────
function JourneyStrip() {
  const steps = [
    {
      icon: '📰',
      title: 'News Comes In',
      desc: 'We pull from 15+ trusted sources — Reuters, Bloomberg, TechCrunch — every few hours',
      color: '#4A9EFF'
    },
    {
      icon: '🤖',
      title: 'AI Reads It',
      desc: 'Extracts signals, detects event types — funding, launches, geopolitics, regulations',
      color: '#A855F7'
    },
    {
      icon: '📡',
      title: 'Trends Emerge',
      desc: 'Patterns across 100+ articles become named trends with momentum scores',
      color: '#10B981'
    },
    {
      icon: '❓',
      title: 'You Ask Questions',
      desc: 'Type any question — get cited answers from real articles, not hallucinations',
      color: '#F59E0B'
    },
    {
      icon: '💡',
      title: 'Find Your Play',
      desc: 'AI matches global trends to your skills, city, capital and time available',
      color: '#EC4899'
    },
    {
      icon: '✅',
      title: 'Take Action',
      desc: 'Get a 90-day plan with real ₹ numbers and exact first steps',
      color: '#D6C08D'
    }
  ];

  return (
    <div className="journey-strip">
      <p className="journey-strip__label">HOW AERTH WORKS</p>
      <div className="journey-strip__steps">
        {steps.map((step, i) => (
          <div key={i} className="journey-strip__item">
            <div className="journey-step">
              <div
                className="journey-step__icon"
                style={{ borderColor: step.color + '40', background: step.color + '15' }}
              >
                <span>{step.icon}</span>
              </div>
              <div className="journey-step__body">
                <p className="journey-step__title" style={{ color: step.color }}>
                  {step.title}
                </p>
                <p className="journey-step__desc">{step.desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="journey-strip__arrow">→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WHAT TO DO NEXT — Bottom of page, connects all features
// ─────────────────────────────────────────────────────────────────────────────
function WhatToDoNext({ metrics }) {
  const navigate = useNavigate();

  const actions = [
    {
      emoji: '📡',
      title: 'Read the Trend Radar',
      desc: 'See what patterns AI detected from this week\'s news. Pick one that affects your work.',
      why: 'Because trends are where opportunities hide — before everyone else sees them.',
      cta: 'Open Trend Radar',
      path: '/trends',
      color: '#A855F7'
    },
    {
      emoji: '❓',
      title: 'Ask AERTH a Question',
      desc: 'Type anything — "What is OpenAI doing?" or "Which sectors benefit from oil price rise?"',
      why: 'Every answer links to the actual article. No hallucination. No guessing.',
      cta: 'Ask a Question',
      path: null, // triggers modal
      isAsk: true,
      color: '#4A9EFF'
    },
    {
      emoji: '⚡',
      title: 'Run a "What If" Simulation',
      desc: 'Type any scenario — "What if India bans wheat exports?" — get full cascade analysis.',
      why: 'Simulations tell you WHO wins and WHO loses so you can position yourself.',
      cta: 'Open Simulator',
      path: '/simulations',
      color: '#EF4444'
    },
    {
      emoji: '💡',
      title: 'Find Your Income Play',
      desc: 'Tell us your situation — skills, city, capital — and get specific micro-plays for YOU.',
      why: 'Not generic advice. Calculated from your actual constraints and Indian market reality.',
      cta: 'Get My Plays',
      path: '/micro-plays',
      color: '#F59E0B'
    },
    {
      emoji: '🏢',
      title: 'Track What Companies Do',
      desc: 'Watch what OpenAI, NVIDIA, Anthropic are doing — launches, funding, acquisitions.',
      why: 'Every company move creates a gap. Someone loses a customer. You can be the alternative.',
      cta: 'Company Tracker',
      path: '/companies',
      color: '#F97316'
    },
    {
      emoji: '📋',
      title: 'Generate an Intel Report',
      desc: 'Get a structured briefing on any topic — trends, risks, opportunities, recommendations.',
      why: 'Use this to brief your team, impress your investor, or make your next decision.',
      cta: 'Build Report',
      path: '/reports',
      color: '#6366F1'
    }
  ];

  return (
    <div className="what-next">
      <div className="what-next__header">
        <p className="what-next__label">WHAT TO DO NEXT</p>
        <h2 className="what-next__title">
          You have the intelligence. Now use it.
        </h2>
        <p className="what-next__sub">
          Every section of AERTH connects to the next. Here is your recommended path.
        </p>
      </div>

      <div className="what-next__grid">
        {actions.map((action, i) => (
          <div
            key={i}
            className="next-card"
            style={{ '--card-color': action.color }}
            onClick={() => action.path && navigate(action.path)}
          >
            <div className="next-card__top">
              <span className="next-card__emoji">{action.emoji}</span>
              <span className="next-card__num">0{i + 1}</span>
            </div>
            <h3 className="next-card__title">{action.title}</h3>
            <p className="next-card__desc">{action.desc}</p>
            <div className="next-card__why">
              <span className="next-card__why-label">Why?</span>
              <span className="next-card__why-text">{action.why}</span>
            </div>
            <button
              className="next-card__btn"
              style={{ color: action.color, borderColor: action.color + '40' }}
            >
              {action.cta} →
            </button>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="aerth-disclaimer">
        <p>
          <strong>About AERTH:</strong> This platform analyzes publicly available
          news articles using AI (RAG architecture). All answers include citations
          to original sources. This is not financial or investment advice.
          AI summaries may contain errors — always verify via the linked sources.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKET PULSE (unchanged from your original)
// ─────────────────────────────────────────────────────────────────────────────
function MarketPulse({ metrics }) {
  const risk = metrics.stability > 75 ? 'Low' : metrics.stability > 55 ? 'Medium' : 'High';
  const riskClass = metrics.stability > 75 ? 'good' : metrics.stability > 55 ? 'warn' : 'down';

  return (
    <div className="market-pulse">
      <div className="market-pulse__header">
        <span className="panel__label">MARKET PULSE</span>
      </div>
      <div className="market-pulse__body">
        <div className="market-pulse__left">
          <div className="market-pulse__row">
            <span className="market-pulse__key">Global Risk Level</span>
            <span className={`market-pulse__val market-pulse__val--${riskClass}`}>{risk}</span>
          </div>
          <div className="market-pulse__row">
            <span className="market-pulse__key">Active Signals</span>
            <span className="market-pulse__val market-pulse__val--down">{metrics.signalCount}</span>
          </div>
        </div>
        <div className="market-pulse__right">
          <MiniSparkline />
          <div className="market-pulse__number">{metrics.stability}</div>
        </div>
      </div>
    </div>
  );
}

function MiniSparkline() {
  const points = [30, 32, 28, 35, 33, 40, 38, 42, 45, 41, 44, 48, 46, 50];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 140;
  const h = 40;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D6C08D" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D6C08D" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={coords} fill="none" stroke="#D6C08D" strokeWidth="1.4" />
      <polygon points={`0,${h} ${coords} ${w},${h}`} fill="url(#sparkGrad)" />
    </svg>
  );
}