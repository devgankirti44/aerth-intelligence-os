import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './OpportunitiesPanel.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

export default function OpportunitiesPanel() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/opportunities`)
      .then(res => setOpps(res.data.slice(0, 5)))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="opps">
      <div className="opps__header">
        <span className="panel__label">EMERGING OPPORTUNITIES</span>
        <Link to="/opportunities" className="opps__link">View all</Link>
      </div>

      <div className="opps__list">
        {loading ? (
          <div style={{ padding: 20, color: 'var(--platinum)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            Loading...
          </div>
        ) : opps.length === 0 ? (
          <div style={{ padding: 20, color: 'var(--platinum)', fontSize: 12 }}>
            No opportunities yet
          </div>
        ) : (
          opps.map(o => (
            <Link key={o._id} to="/opportunities" className="opp">
              <div className="opp__icon"><OppIcon type={iconFor(o.sector)} /></div>
              <span className="opp__title">{truncate(o.title, 45)}</span>
              <span className="opp__score">{o.score}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function iconFor(sector) {
  const s = (sector || '').toLowerCase();
  if (s.includes('agri')) return 'leaf';
  if (s.includes('semi') || s.includes('hardware')) return 'grid';
  if (s.includes('space')) return 'sat';
  if (s.includes('robot')) return 'robot';
  if (s.includes('defense') || s.includes('security')) return 'shield';
  return 'grid';
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function OppIcon({ type }) {
  const props = { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 };
  if (type === 'shield') return <svg {...props}><path d="M12 3l8 3v6c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3zM9 12l2 2 4-4"/></svg>;
  if (type === 'robot')  return <svg {...props}><rect x="5" y="8" width="14" height="10" rx="2"/><path d="M9 12v2M15 12v2M12 4v4"/></svg>;
  if (type === 'grid')   return <svg {...props}><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></svg>;
  if (type === 'sat')    return <svg {...props}><path d="M8 8l8 8M6 6l3 3M15 15l3 3M4 12a8 8 0 018-8M12 20a8 8 0 008-8"/></svg>;
  if (type === 'leaf')   return <svg {...props}><path d="M6 20c0-8 6-14 14-14 0 8-6 14-14 14zM6 20l14-14"/></svg>;
  return null;
}