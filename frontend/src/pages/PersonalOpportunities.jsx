import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './PersonalOpportunities.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

const SITUATIONS = [
  { value: 'student', label: 'Student' },
  { value: 'homemaker', label: 'Homemaker' },
  { value: 'employed', label: 'Employed (looking for side income)' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'retired', label: 'Retired' },
  { value: 'other', label: 'Other' }
];

const CITY_TIERS = [
  { value: 'metro', label: 'Metro (Delhi/Mumbai/Bangalore/Chennai)' },
  { value: 'tier2', label: 'Tier-2 (Pune/Jaipur/Chandigarh/Lucknow)' },
  { value: 'tier3', label: 'Tier-3 (Smaller city)' },
  { value: 'rural', label: 'Rural / Village' }
];

const GOALS = [
  { value: 'side_income', label: 'Side income (₹5-25K/month)' },
  { value: 'full_income', label: 'Full income (₹30K+/month)' },
  { value: 'skill_learning', label: 'Learn new skill first' },
  { value: 'business', label: 'Start a real business' },
  { value: 'exploring', label: 'Just exploring' }
];

export default function PersonalOpportunities() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [opps, setOpps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const [form, setForm] = useState({
    situation: 'student',
    degree: '',
    currentSkills: '',
    interests: '',
    city: '',
    cityTier: 'tier2',
    hoursPerDay: 3,
    capital: 0,
    goal: 'side_income',
    targetMonthlyIncome: 20000
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    loadProfile();
  }, [user, authLoading]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/personal/profile`);
      if (res.data) {
        setProfile(res.data);
        setForm({
          situation: res.data.situation || 'student',
          degree: res.data.degree || '',
          currentSkills: (res.data.currentSkills || []).join(', '),
          interests: (res.data.interests || []).join(', '),
          city: res.data.city || '',
          cityTier: res.data.cityTier || 'tier2',
          hoursPerDay: res.data.hoursPerDay || 3,
          capital: res.data.capital || 0,
          goal: res.data.goal || 'side_income',
          targetMonthlyIncome: res.data.targetMonthlyIncome || 20000
        });
        // Auto-load cached opportunities if exist
        loadOpportunities();
      } else {
        setShowEditor(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadOpportunities = async () => {
    try {
      const res = await axios.get(`${API}/personal/opportunities`);
      setOpps(res.data);
    } catch (err) {
      // No profile yet or other error
    }
  };

  const saveProfile = async () => {
    setGenerating(true);
    try {
      const payload = {
        ...form,
        currentSkills: form.currentSkills.split(',').map(s => s.trim()).filter(Boolean),
        interests: form.interests.split(',').map(s => s.trim()).filter(Boolean),
        hoursPerDay: Number(form.hoursPerDay),
        capital: Number(form.capital),
        targetMonthlyIncome: Number(form.targetMonthlyIncome)
      };
      const res = await axios.post(`${API}/personal/profile`, payload);
      setProfile(res.data);
      setShowEditor(false);
      
      // Generate opportunities immediately
      const oppsRes = await axios.get(`${API}/personal/opportunities`);
      setOpps(oppsRes.data);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const regenerate = async () => {
    setGenerating(true);
    try {
      const res = await axios.get(`${API}/personal/opportunities?refresh=1`);
      setOpps(res.data);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="mp__loading">Loading your workspace...</div>;
  }

  return (
    <div className="mp">
      <header className="mp__header">
        <div>
          <span className="mp__label">PERSONAL OPPORTUNITY INTELLIGENCE</span>
          <h1 className="mp__title">Micro Plays</h1>
          <p className="mp__subtitle">
            AI-generated micro-business and skill plays personalized to your situation, skills, capital, and time.
          </p>
        </div>
        {profile && !showEditor && (
          <div className="mp__actions">
            <button className="mp__btn" onClick={() => setShowEditor(true)}>
              ✎ Edit Profile
            </button>
            <button className="mp__btn mp__btn--primary" onClick={regenerate} disabled={generating}>
              {generating ? 'Generating...' : '✦ Regenerate'}
            </button>
          </div>
        )}
      </header>

      {/* Profile editor */}
      {(showEditor || !profile) && (
        <section className="mp__editor">
          <h2 className="mp__editor-title">Tell us about yourself</h2>
          <p className="mp__editor-hint">The more specific, the better the AI can match plays to you.</p>

          <div className="mp__form">
            <div className="mp__field">
              <label>Your Situation</label>
              <select value={form.situation} onChange={e => setForm({ ...form, situation: e.target.value })}>
                {SITUATIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="mp__field">
              <label>Education / Degree</label>
              <input
                type="text"
                value={form.degree}
                onChange={e => setForm({ ...form, degree: e.target.value })}
                placeholder="e.g., BSc Botany, BTech CS, Class 12, MBA"
              />
            </div>

            <div className="mp__field">
              <label>Current Skills (comma-separated)</label>
              <input
                type="text"
                value={form.currentSkills}
                onChange={e => setForm({ ...form, currentSkills: e.target.value })}
                placeholder="e.g., Python, cooking, photography, Excel, English writing"
              />
            </div>

            <div className="mp__field">
              <label>Interests (comma-separated)</label>
              <input
                type="text"
                value={form.interests}
                onChange={e => setForm({ ...form, interests: e.target.value })}
                placeholder="e.g., agriculture, content creation, crafts, teaching"
              />
            </div>

            <div className="mp__row">
              <div className="mp__field">
                <label>City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g., Ludhiana, Bangalore, Jaipur"
                />
              </div>
              <div className="mp__field">
                <label>City Tier</label>
                <select value={form.cityTier} onChange={e => setForm({ ...form, cityTier: e.target.value })}>
                  {CITY_TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="mp__row">
              <div className="mp__field">
                <label>Hours per Day Available</label>
                <input
                  type="number"
                  min="1"
                  max="16"
                  value={form.hoursPerDay}
                  onChange={e => setForm({ ...form, hoursPerDay: e.target.value })}
                />
              </div>
              <div className="mp__field">
                <label>Starting Capital (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.capital}
                  onChange={e => setForm({ ...form, capital: e.target.value })}
                  placeholder="0 = start with nothing"
                />
              </div>
            </div>

            <div className="mp__field">
              <label>Your Goal</label>
              <select value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
                {GOALS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>

            <div className="mp__field">
              <label>Target Monthly Income (₹)</label>
              <input
                type="number"
                min="5000"
                value={form.targetMonthlyIncome}
                onChange={e => setForm({ ...form, targetMonthlyIncome: e.target.value })}
              />
            </div>

            <div className="mp__editor-actions">
              {profile && (
                <button className="mp__btn" onClick={() => setShowEditor(false)}>
                  Cancel
                </button>
              )}
              <button 
                className="mp__btn mp__btn--primary" 
                onClick={saveProfile}
                disabled={generating || !form.city}
              >
                {generating ? 'AI analyzing your profile...' : '✦ Generate Micro Plays'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Opportunities list */}
      {opps?.opportunities?.length > 0 && !showEditor && (
        <section className="mp__opps">
          <div className="mp__opps-header">
            <span className="mp__opps-count">{opps.opportunities.length} personalized plays</span>
            {opps.cached && <span className="mp__opps-cached">cached · updates every 6h</span>}
          </div>

          <div className="mp__grid">
            {opps.opportunities.map((o, i) => (
              <div 
                key={i} 
                className={`mp-card ${expanded === i ? 'mp-card--expanded' : ''} mp-card--${o.difficulty?.toLowerCase()}`}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <div className="mp-card__header">
                  <span className="mp-card__cat">{o.category}</span>
                  <span className={`mp-card__diff mp-card__diff--${o.difficulty?.toLowerCase()}`}>
                    {o.difficulty}
                  </span>
                </div>

                <h3 className="mp-card__title">{o.title}</h3>
                <p className="mp-card__desc">{o.shortDescription}</p>

                <div className="mp-card__stats">
                  <div className="mp-card__stat">
                    <span className="mp-card__stat-label">Investment</span>
                    <span className="mp-card__stat-val">₹{o.investment.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="mp-card__stat">
                    <span className="mp-card__stat-label">Monthly Revenue</span>
                    <span className="mp-card__stat-val mp-card__stat-val--rev">
                      ₹{(o.monthlyRevenueMin/1000).toFixed(0)}K–{(o.monthlyRevenueMax/1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="mp-card__stat">
                    <span className="mp-card__stat-label">First Income</span>
                    <span className="mp-card__stat-val">{o.timeToFirstIncome}</span>
                  </div>
                </div>

                {expanded === i && (
                  <div className="mp-card__detail">
                    <div className="mp-detail__section">
                      <h4>Why This Fits You</h4>
                      <p>{o.whyThisFits}</p>
                    </div>

                    {o.skillsToLearn?.length > 0 && (
                      <div className="mp-detail__section">
                        <h4>Skills to Learn</h4>
                        <div className="mp-detail__skills">
                          {o.skillsToLearn.map((s, si) => (
                            <div key={si} className="mp-skill">
                              <span className="mp-skill__name">{s.skill}</span>
                              <span className="mp-skill__time">{s.timeToLearn}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mp-detail__section">
                      <h4>30 / 60 / 90 Day Plan</h4>
                      <div className="mp-plan">
                        <div className="mp-plan__step">
                          <span className="mp-plan__day">30 DAYS</span>
                          <p>{o.step30Day}</p>
                        </div>
                        <div className="mp-plan__step">
                          <span className="mp-plan__day">60 DAYS</span>
                          <p>{o.step60Day}</p>
                        </div>
                        <div className="mp-plan__step">
                          <span className="mp-plan__day">90 DAYS</span>
                          <p>{o.step90Day}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mp-detail__section">
                      <h4>Where to Find Customers</h4>
                      <p>{o.whereToFindCustomers}</p>
                    </div>

                    <div className="mp-detail__section">
                      <h4>Real Examples</h4>
                      <p>{o.realExamples}</p>
                    </div>

                    {o.risks?.length > 0 && (
                      <div className="mp-detail__section">
                        <h4>Risks to Consider</h4>
                        <ul className="mp-risks">
                          {o.risks.map((r, ri) => <li key={ri}>{r}</li>)}
                        </ul>
                      </div>
                    )}

                    {o.relatedTrend && (
                      <div className="mp-detail__section">
                        <h4>Related Macro Trend</h4>
                        <span className="mp-trend-chip">{o.relatedTrend}</span>
                      </div>
                    )}
                  </div>
                )}

                <button className="mp-card__toggle">
                  {expanded === i ? 'Collapse ↑' : 'Full Plan ↓'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {opps?.stale && (
        <div className="mp__stale-notice">
          ⚠ Showing cached data — AI is currently rate-limited. Try regenerating later.
        </div>
      )}
    </div>
  );
}