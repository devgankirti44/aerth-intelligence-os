import { useState, useEffect } from 'react';
import axios from 'axios';
import './PinButton.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

export default function PinButton({ itemType, refId, title, subtitle, linkPath }) {
  const [pinned, setPinned] = useState(false);
  const [itemId, setItemId] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!refId) return;
    axios.get(`${API}/watchlist/check/${itemType}/${refId}`)
      .then(res => {
        setPinned(res.data.pinned);
        setItemId(res.data.item?._id || null);
      })
      .catch(() => {});
  }, [itemType, refId]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      if (pinned && itemId) {
        await axios.delete(`${API}/watchlist/${itemId}`);
        setPinned(false);
        setItemId(null);
      } else {
        const res = await axios.post(`${API}/watchlist`, {
          itemType, refId, title, subtitle, linkPath
        });
        setPinned(true);
        setItemId(res.data._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className={`pin-btn ${pinned ? 'pin-btn--pinned' : ''}`}
      onClick={toggle}
      title={pinned ? 'Remove from watchlist' : 'Add to watchlist'}
    >
      {pinned ? '★ Watching' : '☆ Watch'}
    </button>
  );
}