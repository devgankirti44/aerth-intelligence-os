import { useState, useEffect, useRef } from 'react';
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
            AI-generated strategic briefings synthesized from live trends,
            opportunities, and world signals.
          </p>
        </div>
        <button
          className="reports__generate-btn"
          onClick={() => setShowModal(true)}
          disabled={generating}
        >
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
                    <button
                      className="report-item__delete"
                      onClick={(e) => deleteReport(r._id, e)}
                    >
                      ×
                    </button>
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
              Leave blank for a comprehensive weekly briefing,
              or enter a specific focus topic.
            </p>
            <input
              type="text"
              className="modal__input"
              placeholder="e.g., India semiconductor sovereignty, Dollar decline..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              autoFocus
            />
            <div className="modal__actions">
              <button
                className="modal__btn modal__btn--secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal__btn modal__btn--primary"
                onClick={generateNew}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT VIEW — with download buttons
// ─────────────────────────────────────────────────────────────────────────────
function ReportView({ report }) {
  const s = report.sections;
  const printRef = useRef();

  // ── Download as plain text ──────────────────────────────────────────────
  const downloadText = () => {
    const lines = [];

    lines.push('═'.repeat(60));
    lines.push(`AERTH INTELLIGENCE REPORT`);
    lines.push(`Type: ${report.type?.toUpperCase()} BRIEFING`);
    lines.push(`Generated: ${formatDate(report.generatedAt)}`);
    lines.push(`Signals Analyzed: ${report.meta?.signalsAnalyzed || 0}`);
    lines.push(`Trends Referenced: ${report.meta?.trendsReferenced || 0}`);
    lines.push('═'.repeat(60));
    lines.push('');

    lines.push(report.title?.toUpperCase());
    lines.push('');

    if (s.executiveSummary) {
      lines.push('EXECUTIVE SUMMARY');
      lines.push('─'.repeat(40));
      lines.push(s.executiveSummary);
      lines.push('');
    }

    if (s.stateOfWorld) {
      lines.push('STATE OF THE WORLD');
      lines.push('─'.repeat(40));
      lines.push(s.stateOfWorld);
      lines.push('');
    }

    if (s.topTrends?.length > 0) {
      lines.push('TOP TRENDS');
      lines.push('─'.repeat(40));
      s.topTrends.forEach((t, i) => {
        lines.push(`${i + 1}. ${t.name}`);
        lines.push(`   ${t.insight}`);
        lines.push('');
      });
    }

    if (s.opportunities?.length > 0) {
      lines.push('STRATEGIC OPPORTUNITIES');
      lines.push('─'.repeat(40));
      s.opportunities.forEach((o, i) => {
        lines.push(`${i + 1}. [Score: ${o.score}] ${o.title}`);
        lines.push(`   ${o.rationale}`);
        lines.push('');
      });
    }

    if (s.risks?.length > 0) {
      lines.push('RISK VECTORS');
      lines.push('─'.repeat(40));
      s.risks.forEach((r, i) => {
        lines.push(`• ${r}`);
      });
      lines.push('');
    }

    if (s.recommendations?.length > 0) {
      lines.push('STRATEGIC RECOMMENDATIONS (NEXT 90 DAYS)');
      lines.push('─'.repeat(40));
      s.recommendations.forEach((r, i) => {
        lines.push(`${i + 1}. ${r}`);
      });
      lines.push('');
    }

    lines.push('═'.repeat(60));
    lines.push('Generated by AERTH Intelligence Platform');
    lines.push('Note: AI analysis of public news. Not financial advice.');
    lines.push('═'.repeat(60));

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AERTH-Report-${report.title?.slice(0, 30).replace(/\s+/g, '-') || 'briefing'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Download as PDF (via browser print) ────────────────────────────────
  const downloadPDF = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${report.title}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Georgia', serif;
              color: #1a1a1a;
              background: #ffffff;
              padding: 48px;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.7;
            }
            .pdf-header {
              border-bottom: 3px solid #1a1a1a;
              padding-bottom: 24px;
              margin-bottom: 32px;
            }
            .pdf-brand {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.15em;
              color: #666;
              margin-bottom: 12px;
            }
            .pdf-type {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.1em;
              color: #888;
              margin-bottom: 8px;
            }
            .pdf-title {
              font-size: 28px;
              font-weight: 700;
              line-height: 1.2;
              margin-bottom: 12px;
              color: #0a0a0a;
            }
            .pdf-meta {
              font-size: 12px;
              color: #888;
              display: flex;
              gap: 16px;
            }
            .pdf-section {
              margin-bottom: 32px;
              page-break-inside: avoid;
            }
            .pdf-section h2 {
              font-size: 13px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              color: #444;
              border-bottom: 1px solid #e0e0e0;
              padding-bottom: 8px;
              margin-bottom: 16px;
            }
            .pdf-summary {
              font-size: 16px;
              line-height: 1.8;
              color: #1a1a1a;
              font-style: italic;
              background: #f8f8f8;
              padding: 20px 24px;
              border-left: 4px solid #1a1a1a;
            }
            .pdf-prose {
              font-size: 14px;
              color: #333;
              margin-bottom: 14px;
            }
            .pdf-item {
              display: flex;
              gap: 16px;
              margin-bottom: 16px;
              padding-bottom: 16px;
              border-bottom: 1px solid #f0f0f0;
            }
            .pdf-num {
              font-size: 22px;
              font-weight: 700;
              color: #ddd;
              min-width: 40px;
              font-family: monospace;
            }
            .pdf-item h4 {
              font-size: 14px;
              font-weight: 700;
              margin-bottom: 4px;
              color: #111;
            }
            .pdf-item p {
              font-size: 13px;
              color: #555;
              line-height: 1.6;
            }
            .pdf-score {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: #111;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 700;
              min-width: 36px;
            }
            .pdf-bullets li {
              font-size: 13px;
              color: #444;
              margin-bottom: 8px;
              padding-left: 8px;
            }
            .pdf-recs li {
              font-size: 13px;
              color: #333;
              margin-bottom: 10px;
              padding-left: 8px;
              line-height: 1.6;
            }
            .pdf-footer {
              margin-top: 48px;
              padding-top: 16px;
              border-top: 1px solid #e0e0e0;
              font-size: 11px;
              color: #aaa;
            }
            @media print {
              body { padding: 24px; }
              .pdf-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="pdf-header">
            <div class="pdf-brand">AERTH INTELLIGENCE PLATFORM</div>
            <div class="pdf-type">${report.type?.toUpperCase()} BRIEFING</div>
            <div class="pdf-title">${report.title}</div>
            <div class="pdf-meta">
              <span>${formatDate(report.generatedAt)}</span>
              <span>${report.meta?.signalsAnalyzed || 0} signals analyzed</span>
              <span>${report.meta?.trendsReferenced || 0} trends referenced</span>
            </div>
          </div>

          ${s.executiveSummary ? `
            <div class="pdf-section">
              <h2>Executive Summary</h2>
              <div class="pdf-summary">${s.executiveSummary}</div>
            </div>
          ` : ''}

          ${s.stateOfWorld ? `
            <div class="pdf-section">
              <h2>State of the World</h2>
              ${s.stateOfWorld.split('\n\n').filter(p => p.trim()).map(p =>
                `<p class="pdf-prose">${p}</p>`
              ).join('')}
            </div>
          ` : ''}

          ${s.topTrends?.length > 0 ? `
            <div class="pdf-section">
              <h2>Top Trends</h2>
              ${s.topTrends.map((t, i) => `
                <div class="pdf-item">
                  <div class="pdf-num">${String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <h4>${t.name}</h4>
                    <p>${t.insight}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${s.opportunities?.length > 0 ? `
            <div class="pdf-section">
              <h2>Strategic Opportunities</h2>
              ${s.opportunities.map((o, i) => `
                <div class="pdf-item">
                  <div class="pdf-score">${o.score}</div>
                  <div>
                    <h4>${o.title}</h4>
                    <p>${o.rationale}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${s.risks?.length > 0 ? `
            <div class="pdf-section">
              <h2>Risk Vectors</h2>
              <ul class="pdf-bullets">
                ${s.risks.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${s.recommendations?.length > 0 ? `
            <div class="pdf-section">
              <h2>Strategic Recommendations — Next 90 Days</h2>
              <ol class="pdf-recs">
                ${s.recommendations.map(r => `<li>${r}</li>`).join('')}
              </ol>
            </div>
          ` : ''}

          <div class="pdf-footer">
            Generated by AERTH Intelligence Platform · 
            AI analysis of public news articles · 
            Not financial or investment advice · 
            Verify all claims via primary sources
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Small delay so styles load
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // ── Print directly ──────────────────────────────────────────────────────
  const printReport = () => {
    downloadPDF(); // same as PDF but user picks print instead of save
  };

  return (
    <article className="report" ref={printRef}>

      {/* ── DOWNLOAD TOOLBAR ── */}
      <div className="report__toolbar">
        <div className="report__toolbar-left">
          <span className="report__tag">{report.type?.toUpperCase()} BRIEFING</span>
        </div>
        <div className="report__toolbar-actions">
          <button
            className="report__action-btn"
            onClick={downloadText}
            title="Download as text file"
          >
            ⬇ TXT
          </button>
          <button
            className="report__action-btn report__action-btn--primary"
            onClick={downloadPDF}
            title="Download as PDF"
          >
            ⬇ PDF
          </button>
          <button
            className="report__action-btn"
            onClick={printReport}
            title="Print report"
          >
            🖨 Print
          </button>
        </div>
      </div>

      {/* ── REPORT CONTENT ── */}
      <header className="report__header">
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

      {/* Disclaimer inside report */}
      <div className="report__disclaimer">
        AI analysis of public news articles · Not financial advice ·
        Verify via primary sources
      </div>

    </article>
  );
}

function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}