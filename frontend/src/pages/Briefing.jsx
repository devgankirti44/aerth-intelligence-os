// frontend/src/pages/Briefing.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import BriefingHeader from '../components/briefing/BriefingHeader.jsx';
import SignalFeed from '../components/briefing/SignalFeed.jsx';
import OpportunityStrip from '../components/briefing/OpportunityStrip.jsx';
import './Briefing.css';

const API = 'http://localhost:5000/api';

export default function Briefing() {
  const [signals, setSignals] = useState([]);
  const [meta, setMeta] = useState(null);
  const [date, setDate] = useState(new Date().toISOString());
  const [summary, setSummary] = useState('');
  const [actions, setActions] = useState([]);
  const [loadingSignals, setLoadingSignals] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const fetchBriefing = async () => {
      try {
        const { data } = await axios.get(`${API}/briefing`);
        setSignals(data.signals);
        setMeta(data.meta);
        setDate(data.date);
        setLoadingSignals(false);
        fetchSummary(data.signals);
      } catch (error) {
        console.error('Failed to fetch briefing:', error);
        setLoadingSignals(false);
      }
    };

    fetchBriefing();
  }, []);

  const fetchSummary = async (signals) => {
    setLoadingSummary(true);
    try {
      const { data } = await axios.post(`${API}/briefing/summary`, { signals });
      setSummary(data.summary);
      setActions(data.actions);
    } catch (error) {
      setSummary(
        'Multiple high-priority developments emerged today across AI infrastructure, ' +
        'regulatory frameworks, and competitive positioning.'
      );
      setActions([
        'Monitor OpenAI GPT-5 enterprise adoption for competitive displacement signals',
        'Assess EU AI Act compliance requirements for any European market exposure',
        'Evaluate browser automation opportunity before large incumbents consolidate'
      ]);
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="briefing-page">
      <BriefingHeader
        date={date}
        meta={meta}
        summary={summary}
        actions={actions}
        loading={loadingSummary}
      />

      <OpportunityStrip />

      <SignalFeed
        signals={signals}
        loading={loadingSignals}
      />
    </div>
  );
}