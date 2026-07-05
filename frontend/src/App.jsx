import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar.jsx';
import TopBar from './components/layout/TopBar.jsx';
import Home from './pages/Home.jsx';
import Companies from './pages/Companies.jsx';
import CompanyProfile from './pages/CompanyProfile.jsx';
import Trends from './pages/Trends.jsx';
import TrendDetail from './pages/TrendDetail.jsx';
import Opportunities from './pages/Opportunities';
import WorldIntel from './pages/WorldIntel';
import Reports from './pages/Reports';
import Simulations from './pages/Simulations';
import Watchlist from './pages/Watchlist';
import KnowledgeGraph from './pages/KnowledgeGraph';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import MyCompany from './pages/MyCompany';
import './App.css';

const FULLSCREEN_ROUTES = ['/login', '/signup', '/onboarding'];

export default function App() {
  const location = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.includes(location.pathname);

  if (isFullscreen) {
    return (
      <Routes>
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    );
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="app__body">
        <TopBar />
        <main className="app__main">
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:slug" element={<CompanyProfile />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/trends/:slug" element={<TrendDetail />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/world-intelligence" element={<WorldIntel />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/simulations" element={<Simulations />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/knowledge" element={<KnowledgeGraph />} />
            <Route path="/my-company" element={<MyCompany />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}