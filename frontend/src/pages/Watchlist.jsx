import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Watchlist.css';

const API = 'http://localhost:5000/api';

const STATUS_LABELS = {
  watching: 'Watching',
  investigating: 'Investigating',
  actioned: 'Actioned',
  archived: 'Archived'
};

const TYPE_ICONS = {
  company: '◈',
  trend: '↗',
  opportunity: '◎',
  simulation: '⧉',
  report: '▤',
  signal: '●',
  custom: '✦'
};

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [noteDraft, setNoteDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API}/watchlist`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectItem = (item) => {
    setSelected(item);
    setNoteDraft(item.notes || '');
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await axios.patch(`${API}/watchlist/${selected._id}`, {
        notes: noteDraft
      });
      setSelected(res.data);
      setItems(items.map(i => i._id === res.data._id ? res.data : i));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateField = async (field, value) => {
    if (!selected) return;
    try {
      const res = await axios.patch(`${API}/watchlist/${selected._id}`, {
        [field]: value
      });
      setSelected(res.data);
      if (field === 'status' && value === 'archived') {
        setItems(items.filter(i => i._id !== res.data._id));
        setSelected(null);
      } else {
        setItems(items.map(i => i._id === res.data._id ? res.data : i));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Remove from watchlist?')) return;
    await axios.delete(`${API}/watchlist/${id}`);
    setItems(items.filter(i => i._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  const filtered = filter === 'all'
    ? items
    : items.filter(i => i.itemType === filter);

  const types = [...new Set(items.map(i => i.itemType))];

  return (
    <div className="wl">
      <header className="wl__header">
        <span className="wl__label">RESEARCH WORKSPACE</span>
        <h1 className="wl__title">Watchlist</h1>
        <p className="wl__subtitle">
          Your pinned intelligence. Track companies, trends, opportunities, and scenarios. Attach research notes and investigation status.
        </p>
      </header>

      {loading ? (
        <div className="wl__loading">Loading workspace...</div>
      ) : items.length === 0 ? (
        <div className="wl__empty-state">
          <p>Nothing pinned yet.</p>
          <p className="wl__empty-hint">
            Browse <Link to="/trends">Trends</Link>, <Link to="/opportunities">Opportunities</Link>, or <Link to="/companies">Companies</Link> and pin items to start your research.
          </p>
        </div>
      ) : (
        <>
          <div className="wl__filters">
            <button
              className={`wl-chip ${filter === 'all' ? 'wl-chip--active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({items.length})
            </button>
            {types.map(t => (
              <button
                key={t}
                className={`wl-chip ${filter === t ? 'wl-chip--active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {TYPE_ICONS[t]} {t} ({items.filter(i => i.itemType === t).length})
              </button>
            ))}
          </div>

          <div className="wl__body">
            {/* Item list */}
            <div className="wl__list">
              {filtered.map(item => (
                <div
                  key={item._id}
                  className={`wl-card ${selected?._id === item._id ? 'wl-card--active' : ''} wl-card--${item.priority}`}
                  onClick={() => selectItem(item)}
                >
                  <div className="wl-card__top">
                    <span className="wl-card__type">
                      {TYPE_ICONS[item.itemType]} {item.itemType}
                    </span>
                    <span className={`wl-card__status wl-card__status--${item.status}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  <h3 className="wl-card__title">{item.title}</h3>
                  {item.subtitle && <p className="wl-card__sub">{item.subtitle}</p>}
                  <div className="wl-card__footer">
                    {item.notes && <span className="wl-card__has-notes">✎ notes</span>}
                    <button
                      className="wl-card__remove"
                      onClick={(e) => removeItem(item._id, e)}
                    >×</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div className="wl__detail">
              {selected ? (
                <>
                  <div className="wl-detail__header">
                    <span className="wl-detail__type">
                      {TYPE_ICONS[selected.itemType]} {selected.itemType.toUpperCase()}
                    </span>
                    <h2 className="wl-detail__title">{selected.title}</h2>
                    {selected.subtitle && <p className="wl-detail__sub">{selected.subtitle}</p>}
                    {selected.linkPath && (
                      <Link to={selected.linkPath} className="wl-detail__goto">
                        Open full view →
                      </Link>
                    )}
                  </div>

                  <div className="wl-detail__controls">
                    <div className="wl-control">
                      <label>STATUS</label>
                      <select
                        value={selected.status}
                        onChange={e => updateField('status', e.target.value)}
                      >
                        <option value="watching">Watching</option>
                        <option value="investigating">Investigating</option>
                        <option value="actioned">Actioned</option>
                        <option value="archived">Archive</option>
                      </select>
                    </div>
                    <div className="wl-control">
                      <label>PRIORITY</label>
                      <select
                        value={selected.priority}
                        onChange={e => updateField('priority', e.target.value)}
                      >
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="wl-detail__notes">
                    <label>RESEARCH NOTES</label>
                    <textarea
                      value={noteDraft}
                      onChange={e => setNoteDraft(e.target.value)}
                      placeholder="Your analysis, findings, follow-ups, links..."
                      rows={12}
                    />
                    <button
                      className="wl-detail__save"
                      onClick={saveNotes}
                      disabled={saving || noteDraft === (selected.notes || '')}
                    >
                      {saving ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="wl-detail__empty">
                  Select an item to view and edit research notes.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}