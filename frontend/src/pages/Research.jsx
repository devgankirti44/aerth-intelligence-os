import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Research.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

export default function Research() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ title: '', content: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchNotes();
  }, [user, authLoading]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/research`);
      setNotes(res.data);
      if (res.data.length > 0 && !selected) selectNote(res.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectNote = (note) => {
    setSelected(note);
    setDraft({ title: note.title, content: note.content || '' });
  };

  const createNote = async () => {
    const title = prompt('Research topic / title:');
    if (!title) return;
    setCreating(true);
    try {
      const res = await axios.post(`${API}/research`, { title });
      const updated = [res.data, ...notes];
      setNotes(updated);
      selectNote(res.data);
    } catch (err) {
      alert('Failed to create');
    } finally {
      setCreating(false);
    }
  };

  const saveDraft = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await axios.patch(`${API}/research/${selected._id}`, draft);
      setSelected(res.data);
      setNotes(notes.map(n => n._id === res.data._id ? res.data : n));
    } catch (err) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const analyze = async () => {
    if (!selected) return;
    // save first
    await saveDraft();
    setAnalyzing(true);
    try {
      const res = await axios.post(`${API}/research/${selected._id}/analyze`);
      setSelected(res.data);
      setNotes(notes.map(n => n._id === res.data._id ? res.data : n));
    } catch (err) {
      alert(err.response?.data?.error || 'AI analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteNote = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this research note?')) return;
    try {
      await axios.delete(`${API}/research/${id}`);
      const filtered = notes.filter(n => n._id !== id);
      setNotes(filtered);
      if (selected?._id === id) {
        setSelected(filtered[0] || null);
        if (filtered[0]) setDraft({ title: filtered[0].title, content: filtered[0].content || '' });
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  if (authLoading || loading) {
    return <div className="research__loading">Loading research workspace...</div>;
  }

  return (
    <div className="research">
      <header className="research__header">
        <div>
          <span className="research__label">INVESTIGATION WORKSPACE</span>
          <h1 className="research__title">Research</h1>
          <p className="research__subtitle">
            Save findings, track investigations, and let AI deepen your research with live intelligence context.
          </p>
        </div>
        <button className="research__new-btn" onClick={createNote} disabled={creating}>
          {creating ? 'Creating...' : '+ New Research'}
        </button>
      </header>

      <div className="research__body">
        {/* Sidebar list */}
        <aside className="research__list">
          <div className="research__list-header">
            <span>NOTES</span>
            <span className="research__list-count">{notes.length}</span>
          </div>
          {notes.length === 0 ? (
            <div className="research__empty">
              No research notes yet. Create one to start investigating a topic.
            </div>
          ) : (
            notes.map(n => (
              <div
                key={n._id}
                className={`research-item ${selected?._id === n._id ? 'research-item--active' : ''}`}
                onClick={() => selectNote(n)}
              >
                <div className="research-item__title">{n.title}</div>
                <div className="research-item__meta">
                  <span>{formatDate(n.updatedAt)}</span>
                  {n.aiSummary && <span className="research-item__badge">✦ AI</span>}
                  <button className="research-item__delete" onClick={(e) => deleteNote(n._id, e)}>×</button>
                </div>
              </div>
            ))
          )}
        </aside>

        {/* Main editor */}
        <main className="research__editor">
          {!selected ? (
            <div className="research__empty-view">
              Select a note or create a new research topic.
            </div>
          ) : (
            <>
              <div className="research__editor-header">
                <input
                  type="text"
                  className="research__title-input"
                  value={draft.title}
                  onChange={e => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Research title..."
                />
                <div className="research__actions">
                  <button 
                    className="research__btn" 
                    onClick={saveDraft}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="research__btn research__btn--primary" 
                    onClick={analyze}
                    disabled={analyzing}
                  >
                    {analyzing ? 'AI analyzing...' : '✦ AI Analyze'}
                  </button>
                </div>
              </div>

              <textarea
                className="research__content"
                value={draft.content}
                onChange={e => setDraft({ ...draft, content: e.target.value })}
                placeholder="Write your research notes, questions, findings, links, hypotheses...

The AI Analyze button will read your notes + current world intelligence and produce a deep analysis with key insights and related trends."
              />

              {selected.aiSummary && (
                <section className="research__ai-block">
                  <div className="research__ai-header">
                    <span className="research__ai-tag">✦ AI DEEP ANALYSIS</span>
                  </div>
                  <p className="research__ai-summary">{selected.aiSummary}</p>

                  {selected.aiKeyPoints?.length > 0 && (
                    <div className="research__ai-section">
                      <h4>Key Insights</h4>
                      <ul>
                        {selected.aiKeyPoints.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  )}

                  {selected.aiRelatedTrends?.length > 0 && (
                    <div className="research__ai-section">
                      <h4>Related Trends</h4>
                      <div className="research__trend-chips">
                        {selected.aiRelatedTrends.map((t, i) => (
                          <span key={i} className="research__trend-chip">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function formatDate(date) {
  const d = new Date(date);
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}