import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './TrendMomentum.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

export default function TrendMomentum() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/trends`)
      .then(res => setTrends(res.data.slice(0, 5)))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="trends">
      <div className="trends__header">
        <span className="panel__label">TREND MOMENTUM</span>
        <Link to="/trends" className="trends__link">All Trends</Link>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--platinum)', fontSize: 12 }}>
          Loading trends...
        </div>
      ) : (
        <>
          <div className="trends__grid">
            {trends.map((t, i) => (
              <TrendOrb key={t._id || i} trend={t} hot={i === 0} />
            ))}
          </div>

          <div className="trends__dots">
            {trends.map((_, i) => (
              <span key={i} className={`trends__dot ${i === 0 ? 'trends__dot--active' : ''}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TrendOrb({ trend, hot }) {
  const score = trend.momentum || 50;
  const size = 80 + Math.max(0, score - 50) * 1.5;

  return (
    <Link to={`/trends/${trend.slug}`} className="orb-wrap">
      <div
        className={`orb ${hot ? 'orb--hot' : ''}`}
        style={{ width: size, height: size }}
      >
        <div className="orb__inner">
          <span className="orb__name">{trend.name}</span>
          <span className="orb__score">{score}</span>
        </div>
      </div>
    </Link>
  );
}