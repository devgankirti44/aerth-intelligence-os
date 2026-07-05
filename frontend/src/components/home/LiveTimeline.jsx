import { useState, useEffect } from 'react';
import axios from 'axios';
import './LiveTimeline.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

export default function LiveTimeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/world-intel/dashboard`)
      .then(res => {
        const latest = (res.data.latestSignals || []).slice(0, 8);
        setEvents(latest);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="timeline">
      <div className="timeline__header">
        <span className="panel__label">LIVE TIMELINE</span>
        <div className="timeline__live">
          <span className="timeline__live-dot" />
          <span>Live</span>
        </div>
      </div>

      <div className="timeline__body">
        <button className="timeline__play">
          <PlayIcon />
        </button>

        <div className="timeline__track">
          <div className="timeline__line" />
          {loading ? (
            <div style={{ padding: 20, color: 'var(--platinum)', fontSize: 12 }}>Loading...</div>
          ) : (
            events.map((e, i) => (
              <a key={e._id || i} href={e.url} target="_blank" rel="noreferrer" className="timeline__event">
                <div className="timeline__event-dot" />
                <span className="timeline__event-time">{formatTime(e.publishedAt)}</span>
                <span className="timeline__event-title">{truncate(e.title, 60)}</span>
              </a>
            ))
          )}
        </div>

        <div className="timeline__controls">
          <button className="timeline__ctrl"><PauseIcon /></button>
          <button className="timeline__ctrl timeline__ctrl--speed">1x</button>
        </div>
      </div>
    </div>
  );
}

function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function PlayIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l12 7-12 7V5z"/></svg>;
}
function PauseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3" height="14"/><rect x="14" y="5" width="3" height="14"/></svg>;
}