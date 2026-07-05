import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSocketEvent } from '../../hooks/useSocket';
import './SignalsPanel.css';

const API = 'http://localhost:5000/api';

export default function SignalsPanel() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSignalIds, setNewSignalIds] = useState(new Set());

  useEffect(() => {
    axios.get(`${API}/world-intel/dashboard`)
      .then(res => {
        setSignals(res.data.latestSignals?.slice(0, 5) || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Listen for new signals via WebSocket
  const handleNewSignal = useCallback((newSignal) => {
    console.log('⚡ New signal received:', newSignal.title);
    
    setSignals(prev => {
      // Avoid duplicates
      if (prev.some(s => s._id === newSignal._id)) return prev;
      // Prepend and keep only 5
      return [newSignal, ...prev].slice(0, 5);
    });

    // Mark as "new" for animation
    setNewSignalIds(prev => new Set(prev).add(newSignal._id));
    
    // Remove "new" flag after animation
    setTimeout(() => {
      setNewSignalIds(prev => {
        const next = new Set(prev);
        next.delete(newSignal._id);
        return next;
      });
    }, 3000);
  }, []);

  useSocketEvent('signal:new', handleNewSignal);

  return (
    <div className="signals">
      <div className="signals__header">
        <span className="panel__label">
          TODAY'S TOP SIGNALS
          <span className="signals__live-indicator" title="Live via WebSocket">●</span>
        </span>
        <Link to="/world-intelligence" className="signals__view-all">View all</Link>
      </div>

      <div className="signals__list">
        {loading ? (
          <div style={{ padding: 20, color: 'var(--platinum)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            Loading signals...
          </div>
        ) : signals.length === 0 ? (
          <div style={{ padding: 20, color: 'var(--platinum)', fontSize: 12 }}>
            No signals yet
          </div>
        ) : (
          signals.map(s => {
            const iconMeta = iconFor(s.domain);
            const isNew = newSignalIds.has(s._id);
            return (
              <a 
                key={s._id} 
                href={s.url} 
                target="_blank" 
                rel="noreferrer" 
                className={`signal ${isNew ? 'signal--new' : ''}`}
              >
                <div className={`signal__icon signal__icon--${iconMeta.tone}`}>
                  <SignalIcon type={iconMeta.icon} />
                </div>
                <div className="signal__body">
                  <p className="signal__title">{truncate(s.title, 65)}</p>
                  <div className="signal__meta">
                    <span>{isNew ? 'just now' : timeAgo(s.publishedAt)}</span>
                    <span className="signal__dot">•</span>
                    <span>{domainLabel(s.domain)}</span>
                  </div>
                </div>
                <div className="signal__trend signal__trend--up">↑</div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}

function iconFor(domain) {
  const map = {
    india_agriculture: { icon: 'leaf', tone: 'green' },
    food_security: { icon: 'doc', tone: 'amber' },
    commodities: { icon: 'gov', tone: 'gold' },
    currency_macro: { icon: 'doc', tone: 'gold' },
    geopolitics: { icon: 'shield', tone: 'crimson' },
    energy_transition: { icon: 'box', tone: 'green' },
    india_manufacturing: { icon: 'box', tone: 'blue' }
  };
  return map[domain] || { icon: 'doc', tone: 'blue' };
}

function domainLabel(d) {
  return (d || 'signal').replace(/_/g, ' ');
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function timeAgo(date) {
  const d = new Date(date);
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}

function SignalIcon({ type }) {
  const props = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 };
  if (type === 'gov')    return <svg {...props}><path d="M4 20h16M6 20v-8M10 20v-8M14 20v-8M18 20v-8M4 12h16M12 4l10 6H2l10-6z"/></svg>;
  if (type === 'users')  return <svg {...props}><circle cx="12" cy="8" r="3"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>;
  if (type === 'shield') return <svg {...props}><path d="M12 3l8 3v6c0 5-3 8-8 10-5-2-8-5-8-10V6l8-3z"/></svg>;
  if (type === 'box')    return <svg {...props}><path d="M12 3l9 5v8l-9 5-9-5V8l9-5zM12 3v18M3 8l9 5 9-5"/></svg>;
  if (type === 'doc')    return <svg {...props}><path d="M6 3h9l5 5v13H6V3zM14 3v6h6M9 13h6M9 17h4"/></svg>;
  if (type === 'leaf')   return <svg {...props}><path d="M6 20c0-8 6-14 14-14 0 8-6 14-14 14zM6 20l14-14"/></svg>;
  return null;
}