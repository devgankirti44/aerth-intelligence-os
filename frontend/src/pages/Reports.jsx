import { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/reports`);
      setReports(res.data);
      if (res.data.length > 0 && !selected) {
        loadReport(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (id) => {
    try {
      const res = await axios.get(`${API}/reports/${id}`);
      setSelected(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateNew = async () => {
    setGenerating(true);
    setShowModal(false);
    try {
      const res = await axios.post(`${API}/reports/generate`, {
        topic: topic.trim() || null,
        type: topic.trim() ? 'custom' : 'weekly'
      });
      setSelected(res.data);
      setTopic('');
      await fetchReports();
    } catch (err) {
      alert('Generation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const deleteReport = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this report?')) return;
    await axios.delete(`${API}/reports/${id}`);
    if (selected?._id === id) setSelected(null);
    fetchReports();
  };

  return (
    <div className="reports">
      <header className="reports__header">
        <div>
          <span className="reports__label">EXECUTIVE INTELLIGENCE</span>
          <h1 className="reports__title">Reports</h1>
          <p className="reports__subtitle">
            AI-generated strategic briefings synthesized from live trends, opportunities, and world signals.
          </p>
        </div>
        <button className="reports__generate-btn" onClick={() => setShowModal(true)} disabled={generating}>
          {generating ? 'Synthesizing...' : '+ New Report'}
        </button>
      </header>

      {loading ? (
        <div className="reports__loading">Loading reports...</div>
      ) : (
        <div className="reports__body">
          {/* Sidebar list */}
          <aside className="reports__list">
            <div className="reports__list-header">
              <span>ARCHIVE</span>
              <span className="reports__list-count">{reports.length}</span>
            </div>
            {reports.length === 0 ? (
              <div className="reports__empty">
                No reports yet. Generate your first briefing.
              </div>
            ) : (
              reports.map(r => (
                <div
                  key={r._id}
                  className={`report-item ${selected?._id === r._id ? 'report-item--active' : ''}`}
                  onClick={() => loadReport(r._id)}
                >
                  <div className="report-item__type">{r.type}</div>
                  <div className="report-item__title">{r.title}</div>
                  <div className="report-item__meta">
                    <span>{formatDate(r.generatedAt)}</span>
                    <button className="report-item__delete" onClick={(e) => deleteReport(r._id, e)}>×</button>
                  </div>
                </div>
              ))
            )}
          </aside>

          {/* Report view */}
          <main className="reports__view">
            {generating ? (
              <div className="reports__generating">
                <div className="spinner" />
                <p>Synthesizing intelligence across trends, opportunities, and signals...</p>
              </div>
            ) : selected ? (
              <ReportView report={selected} />
            ) : (
              <div className="reports__empty-view">
                Select a report or generate a new briefing to begin.
              </div>
            )}
          </main>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Generate Intelligence Report</h3>
            <p className="modal__hint">
              Leave blank for a comprehensive weekly briefing, or enter a specific focus topic.
            </p>
            <input
              type="text"
              className="modal__input"
              placeholder="e.g., India semiconductor sovereignty, Dollar decline, Food security..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              autoFocus
            />
            <div className="modal__actions">
              <button className="modal__btn modal__btn--secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="modal__btn modal__btn--primary" onClick={generateNew}>
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportView({ report }) {
  const s = report.sections;
  return (
    <article className="report">
      <header className="report__header">
        <span className="report__tag">{report.type.toUpperCase()} BRIEFING</span>
        <h1 className="report__title">{report.title}</h1>
        <div className="report__meta">
          <span>{formatDate(report.generatedAt)}</span>
          <span>·</span>
          <span>{report.meta?.signalsAnalyzed || 0} signals analyzed</span>
          <span>·</span>
          <span>{report.meta?.trendsReferenced || 0} trends</span>
        </div>
      </header>

      <section className="report__section report__section--summary">
        <h2>Executive Summary</h2>
        <p className="report__summary">{s.executiveSummary}</p>
      </section>

      <section className="report__section">
        <h2>State of the World</h2>
        {s.stateOfWorld?.split('\n\n').filter(p => p.trim()).map((para, i) => (
          <p key={i} className="report__prose">{para}</p>
        ))}
      </section>

      {s.topTrends?.length > 0 && (
        <section className="report__section">
          <h2>Top Trends</h2>
          <div className="report__list">
            {s.topTrends.map((t, i) => (
              <div key={i} className="report__list-item">
                <span className="report__list-num">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h4>{t.name}</h4>
                  <p>{t.insight}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {s.opportunities?.length > 0 && (
        <section className="report__section">
          <h2>Strategic Opportunities</h2>
          <div className="report__list">
            {s.opportunities.map((o, i) => (
              <div key={i} className="report__list-item">
                <span className="report__list-score">{o.score}</span>
                <div>
                  <h4>{o.title}</h4>
                  <p>{o.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {s.risks?.length > 0 && (
        <section className="report__section">
          <h2>Risk Vectors</h2>
          <ul className="report__bullets">
            {s.risks.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </section>
      )}

      {s.recommendations?.length > 0 && (
        <section className="report__section report__section--recs">
          <h2>Strategic Recommendations (Next 90 Days)</h2>
          <ol className="report__recs">
            {s.recommendations.map((r, i) => <li key={i}>{r}</li>)}
          </ol>
        </section>
      )}
    </article>
  );
}

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}