// frontend/src/pages/Trends.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Trends.css';

const API = 'http://localhost:5000/api';

export default function Trends() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get(`${API}/trends`)
      .then(res => {
        setTrends(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const categories = [...new Set(trends.map(t => t.category))];
  const filtered = filter === 'all' ? trends : trends.filter(t => t.category === filter);

  return (
    <div className="trends">
      <header className="trends__header">
        <div>
          <span className="trends__label">WORLD INTELLIGENCE</span>
          <h1 className="trends__title">Trends</h1>
          <p className="trends__subtitle">
            {trends.length} trends tracked · Real-time momentum detection across all signals
          </p>
        </div>
      </header>

      <div className="trends__filters">
        <button
          className={`chip ${filter === 'all' ? 'chip--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`chip ${filter === cat ? 'chip--active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="trends__loading">Analyzing world signals...</div>
      ) : (
        <div className="trends__grid">
          {filtered.map(trend => (
            <TrendCard key={trend.slug} trend={trend} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrendCard({ trend }) {
  return (
    <Link to={`/trends/${trend.slug}`} className="trendcard">
      <div className="trendcard__top">
        <span className={`trendcard__status trendcard__status--${trend.status}`}>
          {trend.status}
        </span>
        <span className="trendcard__velocity">
          {trend.velocity > 0 ? '↑' : trend.velocity < 0 ? '↓' : '—'}
          {' '}{Math.abs(trend.velocity)}%
        </span>
      </div>

      <h3 className="trendcard__name">{trend.name}</h3>
      <p className="trendcard__desc">{trend.description}</p>

      <div className="trendcard__momentum">
        <div className="trendcard__momentum-bar">
          <div
            className={`trendcard__momentum-fill trendcard__momentum-fill--${trend.status}`}
            style={{ width: `${trend.momentum}%` }}
          />
        </div>
        <span className="trendcard__momentum-value">{trend.momentum}</span>
      </div>

      <div className="trendcard__footer">
        <span className="trendcard__meta">{trend.signals?.eventCount || 0} signals · 7d</span>
        <span className="trendcard__category">{trend.category}</span>
      </div>
    </Link>
  );
}