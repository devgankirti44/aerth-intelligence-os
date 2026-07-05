import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Auth({ mode = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const isSignup = mode === 'signup';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = isSignup
        ? await register(email, password, name)
        : await login(email, password);
      
      // If they don't have a company yet, send them to onboarding
      if (!user.hasCompany) {
        navigate('/onboarding');
      } else {
        navigate('/my-company');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__brand">
          <span className="auth__brand-name">AERTH</span>
          <span className="auth__brand-sub">INTELLIGENCE OS</span>
        </div>

        <h1 className="auth__title">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="auth__subtitle">
          {isSignup 
            ? 'Register to unlock personalized intelligence for your company.'
            : 'Sign in to your intelligence workspace.'}
        </p>

        <form className="auth__form" onSubmit={submit}>
          {isSignup && (
            <div className="auth__field">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
                placeholder="Your name"
              />
            </div>
          )}
          <div className="auth__field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="auth__field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Minimum 6 characters"
            />
          </div>

          {error && <div className="auth__error">{error}</div>}

          <button type="submit" className="auth__submit" disabled={loading}>
            {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="auth__switch">
          {isSignup ? (
            <>Already have an account? <Link to="/login">Sign in</Link></>
          ) : (
            <>New to AERTH? <Link to="/signup">Create account</Link></>
          )}
        </div>

        <Link to="/home" className="auth__skip">
          Continue as guest →
        </Link>
      </div>
    </div>
  );
}