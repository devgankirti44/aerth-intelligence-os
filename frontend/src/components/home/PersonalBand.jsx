import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './PersonalBand.css';

const API = 'http://localhost:5000/api';

export default function PersonalBand() {
  const { user, loading: authLoading } = useAuth();
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user?.hasCompany) return;
    setLoading(true);
    axios.get(`${API}/user/company/brief`)
      .then(res => setBrief(res.data?.brief))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  // Don't render at all if user isn't logged in or has no company
  if (authLoading) return null;
  if (!user) return null;
  if (!user.hasCompany) return null;

  const greeting = getGreeting();
  const firstName = user.name?.split(' ')[0] || 'there';
  const criticalThreats = brief?.threats?.filter(t => t.severity === 'critical' || t.severity === 'high').length || 0;
  const topOpps = brief?.opportunities?.filter(o => o.priority === 'high').length || 0;

  return (
    <div className="pband">
      <div className="pband__left">
        <div className="pband__greeting">
          <span className="pband__hello">{greeting},</span>
          <span className="pband__name">{firstName}</span>
        </div>
        <div className="pband__company">
          {user.myCompany.name} · {user.myCompany.sector}
        </div>
      </div>

      <div className="pband__stats">
        {loading ? (
          <div className="pband__loading">Synthesizing your brief...</div>
        ) : brief ? (
          <>
            <div className="pband__stat">
              <span className="pband__stat-num">{criticalThreats}</span>
              <span className="pband__stat-label">Critical Threats</span>
            </div>
            <div className="pband__divider" />
            <div className="pband__stat">
              <span className="pband__stat-num">{topOpps}</span>
              <span className="pband__stat-label">High-Priority Opps</span>
            </div>
            <div className="pband__divider" />
            <div className="pband__stat pband__stat--focus">
              <span className="pband__stat-label">FOCUS THIS WEEK</span>
              <span className="pband__stat-focus">
                {brief.focusMetric?.value || brief.threats?.[0]?.title || 'View full brief'}
              </span>
            </div>
          </>
        ) : (
          <div className="pband__loading">No brief yet</div>
        )}
      </div>

      <Link to="/my-company" className="pband__cta">
        Full Brief →
      </Link>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}