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
import './Home.css';

const API = 'http://localhost:5000/api';

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

  // Listen for live metric updates via WebSocket
  useSocketEvent('metrics:update', (update) => {
    setMetrics(prev => ({ ...prev, ...update }));
  });

  return (
    <div className="home">
      <PersonalBand />

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

      <div className="home__row">
        <OpportunitiesPanel />
        <TrendMomentum />
      </div>

      <div className="timeline-wrap">
        <LiveTimeline />
      </div>
    </div>
  );
}

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
          <stop offset="0%" stopColor="#D6C08D" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#D6C08D" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={coords} fill="none" stroke="#D6C08D" strokeWidth="1.4" />
      <polygon points={`0,${h} ${coords} ${w},${h}`} fill="url(#sparkGrad)" />
    </svg>
  );
}