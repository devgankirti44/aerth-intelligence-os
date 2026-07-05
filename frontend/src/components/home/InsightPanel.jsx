import { useState, useEffect } from 'react';
import axios from 'axios';
import './InsightPanel.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

export default function InsightPanel() {
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    // Use top trend's aiSummary as insight
    axios.get(`${API}/trends`)
      .then(res => {
        const top = res.data?.[0];
        if (top) {
          setInsight({
            text: top.aiSummary || top.description || top.aiPrediction,
            source: 'AERTH AI Analyst'
          });
        }
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="insight">
      <div className="insight__header">
        <span className="panel__label">INSIGHT OF THE DAY</span>
      </div>

      <div className="insight__body">
        <div className="insight__quote">"</div>
        <p className="insight__text">
          {insight?.text 
            ? truncate(insight.text, 240)
            : 'Synthesizing global signals into strategic insight...'}
        </p>
      </div>

      <div className="insight__footer">
        <SparkIcon />
        <span>{insight?.source || 'AERTH AI Analyst'}</span>
      </div>

      <div className="insight__decor">
        <NetworkDecor />
      </div>
    </div>
  );
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function SparkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/>
  </svg>;
}

function NetworkDecor() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
      <g stroke="rgba(214, 192, 141, 0.3)" strokeWidth="0.5">
        <circle cx="60" cy="60" r="40"/>
        <circle cx="60" cy="60" r="30"/>
        <circle cx="60" cy="60" r="50"/>
        <line x1="20" y1="60" x2="100" y2="60"/>
        <line x1="60" y1="20" x2="60" y2="100"/>
        <line x1="30" y1="30" x2="90" y2="90"/>
        <line x1="90" y1="30" x2="30" y2="90"/>
      </g>
      <g fill="rgba(214, 192, 141, 0.6)">
        <circle cx="60" cy="20" r="2"/>
        <circle cx="60" cy="100" r="2"/>
        <circle cx="20" cy="60" r="2"/>
        <circle cx="100" cy="60" r="2"/>
        <circle cx="60" cy="60" r="3" fill="#D6C08D"/>
      </g>
    </svg>
  );
}