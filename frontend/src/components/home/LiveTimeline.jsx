import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocketEvent } from '../../hooks/useSocket';
import './LiveTimeline.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

export default function LiveTimeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const trackRef = useRef(null);
  const scrollPos = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/world-intel/dashboard`)
      .then(res => {
        const latest = (res.data.latestSignals || []).slice(0, 12);
        setEvents(latest);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Listen for new signals from WebSocket → prepend to list
  useSocketEvent('signal:new', (newSignal) => {
    setEvents(prev => {
      if (prev.some(e => e._id === newSignal._id)) return prev;
      return [newSignal, ...prev].slice(0, 12);
    });
  });

  // Auto-scroll animation
  useEffect(() => {
    if (!playing || !trackRef.current) return;

    const track = trackRef.current;
    const scroll = () => {
      if (!trackRef.current) return;
      scrollPos.current += 0.5 * speed;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (scrollPos.current > maxScroll) {
        scrollPos.current = 0;
      }
      track.scrollLeft = scrollPos.current;
      rafRef.current = requestAnimationFrame(scroll);
    };

    rafRef.current = requestAnimationFrame(scroll);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speed]);

  const togglePlay = () => setPlaying(p => !p);
  const cycleSpeed = () => setSpeed(s => s === 1 ? 2 : s === 2 ? 4 : 1);

  return (
    <div className="timeline">
      <div className="timeline__header">
        <span className="panel__label">LIVE TIMELINE</span>
        <div className="timeline__live">
          <span className="timeline__live-dot" />
          <span>Live · {events.length}</span>
        </div>
      </div>

      <div className="timeline__body">
        <button 
          className="timeline__play"
          onClick={togglePlay}
          title={playing ? 'Pause auto-scroll' : 'Play auto-scroll'}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="timeline__track" ref={trackRef}>
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
          <button 
            className="timeline__ctrl" 
            onClick={togglePlay}
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button 
            className="timeline__ctrl timeline__ctrl--speed"
            onClick={cycleSpeed}
            title="Cycle speed"
          >
            {speed}x
          </button>
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
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l12 7-12 7V5z"/></svg>;
}
function PauseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="3" height="14"/><rect x="14" y="5" width="3" height="14"/></svg>;
}