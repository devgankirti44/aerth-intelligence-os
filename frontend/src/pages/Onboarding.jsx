import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Onboarding.css';

const API = 'http://localhost:5000/api';

const SECTORS = [
  'AI / Machine Learning',
  'Semiconductors / Hardware',
  'Software / SaaS',
  'Fintech / Finance',
  'E-commerce / Retail',
  'Agriculture / Agri-Tech',
  'Energy / Renewables',
  'Healthcare / Biotech',
  'Defense / Aerospace',
  'Space',
  'Manufacturing',
  'Media / Content',
  'Logistics / Supply Chain',
  'Real Estate / PropTech',
  'Education / EdTech',
  'Other'
];

const SIZES = [
  { value: 'startup', label: 'Startup (1-10)' },
  { value: 'small', label: 'Small (11-50)' },
  { value: 'medium', label: 'Medium (51-250)' },
  { value: 'large', label: 'Large (251-1000)' },
  { value: 'enterprise', label: 'Enterprise (1000+)' }
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    sector: '',
    size: 'startup',
    country: '',
    description: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [competitors, setCompetitors] = useState([]);
  const [error, setError] = useState('');
  const { refreshUser, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';

  // Pre-fill form when editing existing company
  useEffect(() => {
    if (isEdit && user?.myCompany) {
      setForm({
        name: user.myCompany.name || '',
        sector: user.myCompany.sector || '',
        size: user.myCompany.size || 'startup',
        country: user.myCompany.country || '',
        description: user.myCompany.description || '',
        website: user.myCompany.website || ''
      });
    }
  }, [isEdit, user]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const canProceedStep1 = form.name && form.sector && form.size;
  const canProceedStep2 = form.description.length >= 100;

  const analyze = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/user/company`, form);
      const cRes = await axios.get(`${API}/user/company/competitors`);
      setCompetitors(cRes.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    await refreshUser();
    navigate('/my-company');
  };

  return (
    <div className="onb">
      <div className="onb__card">
        <div className="onb__progress">
          {[1, 2, 3].map(n => (
            <div key={n} className={`onb__dot ${step >= n ? 'onb__dot--active' : ''}`}>
              {n}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="onb__title">
              {isEdit ? 'Update your company' : 'Tell us about your company'}
            </h1>
            <p className="onb__subtitle">
              {isEdit 
                ? 'Refine your details for sharper AI analysis.'
                : "The basics. We'll use this to personalize your intelligence."}
            </p>

            <div className="onb__form">
              <div className="onb__field">
                <label>Company Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="e.g., Acme AI"
                  autoFocus
                />
              </div>

              <div className="onb__field">
                <label>Sector</label>
                <select value={form.sector} onChange={e => update('sector', e.target.value)}>
                  <option value="">Select a sector...</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="onb__field">
                <label>Company Size</label>
                <div className="onb__size-grid">
                  {SIZES.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      className={`onb__size-btn ${form.size === s.value ? 'onb__size-btn--active' : ''}`}
                      onClick={() => update('size', s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="onb__field">
                <label>Country (optional)</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={e => update('country', e.target.value)}
                  placeholder="e.g., India"
                />
              </div>
            </div>

            <div className="onb__actions">
              <button
                className="onb__next"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
              >
                Continue →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="onb__title">What does your company do?</h1>
            <p className="onb__subtitle">The AI's analysis is only as sharp as your description. Be specific.</p>

            <div className="onb__example-box">
              <div className="onb__example-title">✦ WRITE A DESCRIPTION LIKE ONE OF THESE:</div>
              <div className="onb__example">
                <b>UtilityBridge:</b> "SaaS platform for electrical utility contractors in India. We digitize meter connection paperwork, DISCOM compliance filings, and inspection reports. Currently used by 50+ contractor firms in Punjab and Haryana. B2B subscription model, ₹5000-15000/month per firm."
              </div>
              <div className="onb__example">
                <b>Skyroot Aerospace:</b> "Private space launch company building small-satellite rockets. Focus on 500kg-to-LEO payloads for Indian and international customers. Vikram-I orbital rocket. Competing with SpaceX and Rocket Lab in cost-per-kg. Series C funded."
              </div>
              <div className="onb__example">
                <b>Zerodha alternative:</b> "Discount brokerage app for retail Indian investors. Zero brokerage on delivery trades, ₹20 flat on intraday. 2M users, primarily tier-2/3 cities. Also offer mutual fund SIPs and F&O. Competing with Zerodha, Groww, Upstox."
              </div>
              <div className="onb__example-hint">
                Include: what you build, who your customers are, geography, pricing/scale, traction, and who you compete with.
              </div>
            </div>

            <div className="onb__form">
              <div className="onb__field">
                <label>Detailed Description (min 100 chars)</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="Copy the format from examples above. Be specific about product, customers, geography, and competitors."
                  rows={8}
                  autoFocus
                />
                <span className="onb__hint">
                  {form.description.length} / 100 minimum
                  {form.description.length < 100 && ' — the more specific, the sharper the AI'}
                </span>
              </div>

              <div className="onb__field">
                <label>Website (optional)</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={e => update('website', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            {error && <div className="onb__error">{error}</div>}

            <div className="onb__actions">
              <button className="onb__back" onClick={() => setStep(1)}>← Back</button>
              <button
                className="onb__next"
                disabled={!canProceedStep2 || loading}
                onClick={analyze}
              >
                {loading ? 'AI analyzing...' : (isEdit ? 'Update →' : 'Detect Competitors →')}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="onb__title">
              {isEdit ? 'Company updated' : 'Your competitive landscape'}
            </h1>
            <p className="onb__subtitle">
              {competitors.length > 0
                ? `AI identified ${competitors.length} competitors for ${form.name}. We'll track these across our intelligence system.`
                : `No direct matches in our database — but the AI will still analyze your sector broadly and reason about real-world competitors in your niche.`}
            </p>

            <div className="onb__competitors">
              {competitors.length === 0 ? (
                <div className="onb__no-comp">
                  Your company operates in a specialized niche not yet in our tracked companies DB. That's fine — your AI brief will still generate personalized intelligence based on your description.
                </div>
              ) : (
                competitors.map(c => (
                  <div key={c.slug} className="onb-comp">
                    <div className="onb-comp__name">{c.name}</div>
                    <div className="onb-comp__sector">{c.sector}</div>
                  </div>
                ))
              )}
            </div>

            <div className="onb__actions">
              <button className="onb__next" onClick={finish}>
                Enter my dashboard →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}