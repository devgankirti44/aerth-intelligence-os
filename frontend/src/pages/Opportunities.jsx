import { useState, useEffect } from 'react';
import axios from 'axios';
import './Opportunities.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

export default function Opportunities() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);

  const fetchOpps = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/opportunities`);
      setOpps(res.data);
      if (res.data.length > 0) {
        setActiveTab(res.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps();
  }, []);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/opportunities/discover`);
      await fetchOpps();
    } catch (err) {
      console.error('Regeneration failed:', err);
      setLoading(false);
    }
  };

  const selectedOpp = opps.find(o => o._id === activeTab);

  return (
    <div className="opportunities">
      <header className="opportunities__header">
        <div>
          <span className="opportunities__label">ALGORITHMIC ALPHA GENERATION</span>
          <h1 className="opportunities__title">Strategic Opportunities</h1>
          <p className="opportunities__subtitle">
            Cross-referencing global signals and macro trends to generate high-yield actionable interventions.
          </p>
        </div>
        <button className="regenerate-btn" onClick={handleRegenerate} disabled={loading}>
          {loading ? 'Analyzing...' : 'Re-Run Strategy Engine'}
        </button>
      </header>

      {loading ? (
        <div className="opportunities__loading">
          <div className="loading-spinner"></div>
          <p>Running macro-scenario modeling...</p>
        </div>
      ) : (
        <div className="opportunities__content">
          <div className="opportunities__sidebar-list">
            {opps.map(opp => (
              <div
                key={opp._id}
                className={`opp-list-card ${activeTab === opp._id ? 'opp-list-card--active' : ''}`}
                onClick={() => setActiveTab(opp._id)}
              >
                <div className="opp-list-card__top">
                  <span className="opp-list-card__sector">{opp.sector}</span>
                  <span className="opp-list-card__score">{opp.score}</span>
                </div>
                <h3 className="opp-list-card__title">{opp.title}</h3>
                <span className={`opp-list-card__horizon horizon--${opp.horizon}`}>
                  {opp.horizon.toUpperCase()} TERM
                </span>
              </div>
            ))}
          </div>

          <div className="opportunities__detail">
            {selectedOpp ? (
              <div className="opp-detail-view">
                <div className="opp-detail-view__header">
                  <div>
                    <span className="opp-detail-view__sector">{selectedOpp.sector}</span>
                    <h2 className="opp-detail-view__title">{selectedOpp.title}</h2>
                    <p className="opp-detail-view__desc">{selectedOpp.description}</p>
                  </div>
                  <div className="opp-detail-view__score-badge">
                    <span className="score-num">{selectedOpp.score}</span>
                    <span className="score-label">MATCH SCORE</span>
                  </div>
                </div>

                <div className="opp-detail-view__section">
                  <h3>Strategic Rationale</h3>
                  <p className="rationale-text">{selectedOpp.strategicRationale}</p>
                </div>

                <div className="opp-detail-view__split">
                  <div className="split-column">
                    <h3>Operational Action Plan</h3>
                    <ul className="action-list">
                      {selectedOpp.actionPlan?.map((step, idx) => (
                        <li key={idx}>
                          <span className="step-idx">0{idx + 1}</span>
                          <span className="step-text">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="split-column">
                    <h3>Risk Vectors & Barriers</h3>
                    <ul className="risk-list">
                      {selectedOpp.risks?.map((risk, idx) => (
                        <li key={idx}>
                          <span className="risk-icon">⚠️</span>
                          <span className="risk-text">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-opportunity">No opportunity selected</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}