import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

export default function Settings() {
  const { user, loading, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login'); return; }
    setProfile({ name: user.name || '', email: user.email || '' });
  }, [user, loading]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await axios.patch(`${API}/user/profile`, profile);
      await refreshUser();
      showMsg('success', 'Profile updated');
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      showMsg('error', 'New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await axios.patch(`${API}/user/password`, {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      setPasswords({ current: '', new: '', confirm: '' });
      showMsg('success', 'Password changed');
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Password change failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const removeCompany = async () => {
    if (!confirm('Remove your registered company? All cached briefs will be lost.')) return;
    try {
      await axios.delete(`${API}/user/company`);
      await refreshUser();
      showMsg('success', 'Company removed');
    } catch (err) {
      showMsg('error', 'Failed to remove company');
    }
  };

  const deleteAccount = async () => {
    if (!confirm('DELETE your entire account? This is permanent and cannot be undone.')) return;
    if (!confirm('Are you absolutely sure? Type OK in next prompt to confirm.')) return;
    const check = prompt('Type DELETE to confirm account deletion:');
    if (check !== 'DELETE') return;
    try {
      await axios.delete(`${API}/user/account`);
      logout();
      navigate('/home');
    } catch (err) {
      showMsg('error', 'Failed to delete account');
    }
  };

  if (loading || !user) {
    return <div className="settings__loading">Loading...</div>;
  }

  return (
    <div className="settings">
      <header className="settings__header">
        <span className="settings__label">ACCOUNT & PREFERENCES</span>
        <h1 className="settings__title">Settings</h1>
        <p className="settings__subtitle">Manage your account, profile, and workspace preferences.</p>
      </header>

      {msg.text && (
        <div className={`settings__msg settings__msg--${msg.type}`}>
          {msg.text}
        </div>
      )}

      {/* Profile Section */}
      <section className="settings__section">
        <h2 className="settings__section-title">Profile</h2>
        <div className="settings__card">
          <div className="settings__field">
            <label>Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="settings__field">
            <label>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={e => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <button className="settings__btn" onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </section>

      {/* Password Section */}
      <section className="settings__section">
        <h2 className="settings__section-title">Security</h2>
        <div className="settings__card">
          <div className="settings__field">
            <label>Current Password</label>
            <input
              type="password"
              value={passwords.current}
              onChange={e => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="Enter current password"
            />
          </div>
          <div className="settings__field">
            <label>New Password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={e => setPasswords({ ...passwords, new: e.target.value })}
              placeholder="Minimum 6 characters"
            />
          </div>
          <div className="settings__field">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="Re-enter new password"
            />
          </div>
          <button className="settings__btn" onClick={changePassword} disabled={savingPassword || !passwords.current || !passwords.new}>
            {savingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </section>

      {/* Company Section */}
      <section className="settings__section">
        <h2 className="settings__section-title">Company</h2>
        <div className="settings__card">
          {user.myCompany?.name ? (
            <>
              <div className="settings__info-row">
                <span className="settings__info-key">Registered Company</span>
                <span className="settings__info-val">{user.myCompany.name}</span>
              </div>
              <div className="settings__info-row">
                <span className="settings__info-key">Sector</span>
                <span className="settings__info-val">{user.myCompany.sector}</span>
              </div>
              <div className="settings__info-row">
                <span className="settings__info-key">Size</span>
                <span className="settings__info-val">{user.myCompany.size}</span>
              </div>
              <div className="settings__actions">
                <button className="settings__btn" onClick={() => navigate('/onboarding?edit=1')}>
                  Edit Details
                </button>
                <button className="settings__btn settings__btn--danger" onClick={removeCompany}>
                  Remove Company
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="settings__empty">No company registered.</p>
              <button className="settings__btn" onClick={() => navigate('/onboarding')}>
                Register Your Company
              </button>
            </>
          )}
        </div>
      </section>

      {/* Preferences Section */}
      <section className="settings__section">
        <h2 className="settings__section-title">Preferences</h2>
        <div className="settings__card">
          <div className="settings__pref-row">
            <div>
              <div className="settings__pref-title">Real-time Updates</div>
              <div className="settings__pref-desc">Live WebSocket signal streaming</div>
            </div>
            <span className="settings__badge settings__badge--on">Enabled</span>
          </div>
          <div className="settings__pref-row">
            <div>
              <div className="settings__pref-title">Weekly Briefing</div>
              <div className="settings__pref-desc">Auto-generated weekly intelligence report</div>
            </div>
            <span className="settings__badge">Coming soon</span>
          </div>
          <div className="settings__pref-row">
            <div>
              <div className="settings__pref-title">Email Alerts</div>
              <div className="settings__pref-desc">Critical threat notifications</div>
            </div>
            <span className="settings__badge">Coming soon</span>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="settings__section">
        <h2 className="settings__section-title settings__section-title--danger">Danger Zone</h2>
        <div className="settings__card settings__card--danger">
          <div className="settings__danger-row">
            <div>
              <div className="settings__pref-title">Sign Out</div>
              <div className="settings__pref-desc">End your current session</div>
            </div>
            <button className="settings__btn" onClick={() => { logout(); navigate('/home'); }}>
              Sign Out
            </button>
          </div>
          <div className="settings__danger-row">
            <div>
              <div className="settings__pref-title">Delete Account</div>
              <div className="settings__pref-desc">Permanently delete your account and all data</div>
            </div>
            <button className="settings__btn settings__btn--danger" onClick={deleteAccount}>
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}