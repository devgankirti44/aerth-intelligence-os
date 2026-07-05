// frontend/src/pages/Companies.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Companies.css';

const API = 'https://aerth-intelligence-os.onrender.com-os.onrender.com/api';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get(`${API}/companies`)
      .then(res => {
        setCompanies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const industries = [...new Set(companies.map(c => c.industry))];
  const filtered = filter === 'all'
    ? companies
    : companies.filter(c => c.industry === filter);

  return (
    <div className="companies">
      {/* Header */}
      <header className="companies__header">
        <div>
          <span className="companies__label">INTELLIGENCE</span>
          <h1 className="companies__title">Companies</h1>
          <p className="companies__subtitle">
            {companies.length} companies tracked · Live intelligence from news, GitHub, and market signals
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="companies__filters">
        <button
          className={`chip ${filter === 'all' ? 'chip--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Industries
        </button>
        {industries.map(ind => (
          <button
            key={ind}
            className={`chip ${filter === ind ? 'chip--active' : ''}`}
            onClick={() => setFilter(ind)}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Company Grid */}
      {loading ? (
        <div className="companies__loading">Loading intelligence...</div>
      ) : (
        <div className="companies__grid">
          {filtered.map(company => (
            <CompanyCard key={company.slug} company={company} />
          ))}
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company }) {
  const timeAgo = company.latestEvent
    ? formatTimeAgo(company.latestEvent.publishedAt)
    : 'No recent activity';

  return (
    <Link to={`/companies/${company.slug}`} className="cocard">
      <div className="cocard__top">
        <div className="cocard__logo">
          {company.name.charAt(0)}
        </div>
        <div className="cocard__meta">
          <span className={`cocard__status cocard__status--${company.status}`}>
            {company.status}
          </span>
        </div>
      </div>

      <div className="cocard__body">
        <h3 className="cocard__name">{company.name}</h3>
        <p className="cocard__tagline">{company.tagline}</p>
      </div>

      <div className="cocard__stats">
        <div className="cocard__stat">
          <span className="cocard__stat-label">Industry</span>
          <span className="cocard__stat-value">{company.industry}</span>
        </div>
        {company.valuation && (
          <div className="cocard__stat">
            <span className="cocard__stat-label">Valuation</span>
            <span className="cocard__stat-value">{company.valuation}</span>
          </div>
        )}
      </div>

      <div className="cocard__footer">
        <div className="cocard__events">
          <span className="cocard__events-count">{company.eventCount}</span>
          <span className="cocard__events-label">signals</span>
        </div>
        <span className="cocard__time">{timeAgo}</span>
      </div>
    </Link>
  );
}

function formatTimeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000 / 60);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}