// src/pages/HomePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Globe, Target, Zap, PlayCircle,
  FileText, ArrowRight, ChevronRight, AlertCircle,
  Activity, Clock, ExternalLink, Brain, BarChart3
} from 'lucide-react';
import OneLiner from '../components/shared/OneLiner';
import AppShell from '../components/layout/AppShell';
export default function HomePage() {
  return (
    <AppShell
      pageTitle="AERTH Intelligence"
      pageSubtitle="News research assistant"
    >
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">

        {/* ① What is this site — persona explainer */}
        <OneLiner />

        {/* ② Everything else from previous answer */}
        {/* TodaysBrief, TrendSnapshot, ActionCards, QuickAsk */}

      </div>
    </AppShell>
  );
}


export default function HomePage() {
  const navigate = useNavigate();
  const [briefingData, setBriefingData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/briefing').then(r => r.json()),
      fetch('/api/trends').then(r => r.json())
    ]).then(([b, t]) => {
      setBriefingData(b);
      setTrends(t.slice(0, 4));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <AppShell
      pageTitle="Intelligence Dashboard"
      pageSubtitle="Your real-time window into what matters"
    >
      <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">

        {/* ── HOW THIS WORKS (First time user explanation) ── */}
        <HowItWorksStrip />

        {/* ── TODAY'S BRIEF — The entry point ── */}
        <TodaysBrief data={briefingData} loading={loading} />

        {/* ── THE CONNECTED JOURNEY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">

            {/* Live Trend Snapshot */}
            <TrendSnapshot trends={trends} loading={loading} />

            {/* What you can DO with this */}
            <ActionCards />
          </div>

          <div className="space-y-4">
            {/* Quick Ask */}
            <QuickAsk />

            {/* Critical Signals */}
            <CriticalSignals data={briefingData} loading={loading} />
          </div>
        </div>

        {/* Disclaimer */}
        <Disclaimer />
      </div>
    </AppShell>
  );
}

// ─── How It Works Strip ───────────────────────────────────────────────────────
function HowItWorksStrip() {
  const steps = [
    {
      icon: Globe,
      color: 'text-blue-400 bg-blue-400/10',
      step: '1',
      title: 'We Read the News',
      desc: 'Hundreds of articles from trusted sources, daily'
    },
    {
      icon: Brain,
      color: 'text-purple-400 bg-purple-400/10',
      step: '2',
      title: 'AI Finds Patterns',
      desc: 'Detects trends, signals & strategic moves'
    },
    {
      icon: Target,
      color: 'text-green-400 bg-green-400/10',
      step: '3',
      title: 'You See What Matters',
      desc: 'Cited answers, not hallucinated guesses'
    },
    {
      icon: Zap,
      color: 'text-yellow-400 bg-yellow-400/10',
      step: '4',
      title: 'You Take Action',
      desc: 'Find opportunities matched to YOUR situation'
    }
  ];

  return (
    <div className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-4">
      <p className="text-gray-500 text-xs font-bold tracking-widest mb-3">
        HOW AERTH WORKS
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              {/* Arrow between steps */}
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${step.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{step.title}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">{step.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-700 flex-shrink-0 mt-2 hidden lg:block" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Today's Brief ────────────────────────────────────────────────────────────
function TodaysBrief({ data, loading }) {
  const navigate = useNavigate();
  const critical = data?.signals?.filter(s => s.importance === 'critical') || [];
  const high = data?.signals?.filter(s => s.importance === 'high') || [];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <div>
            <h2 className="text-white font-semibold">Today's Intelligence Brief</h2>
            <p className="text-gray-500 text-xs mt-0.5">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/briefing')}
          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm"
        >
          Full Briefing <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Row */}
      {!loading && data && (
        <div className="grid grid-cols-3 border-b border-gray-800">
          <StatCell
            label="Critical Signals"
            value={critical.length}
            color="text-red-400"
          />
          <StatCell
            label="High Priority"
            value={high.length}
            color="text-orange-400"
          />
          <StatCell
            label="Total Signals"
            value={data.meta?.total || 0}
            color="text-blue-400"
          />
        </div>
      )}

      {/* Top 3 signals preview */}
      <div className="divide-y divide-gray-800/50">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <SkeletonSignal key={i} />
          ))
        ) : (
          (data?.signals || []).slice(0, 3).map((signal, i) => (
            <SignalPreviewRow key={i} signal={signal} />
          ))
        )}
      </div>

      {/* CTA */}
      <div className="px-5 py-3 bg-gray-900/50">
        <button
          onClick={() => navigate('/briefing')}
          className="w-full py-2 border border-gray-700 hover:border-gray-600 rounded-lg text-gray-400 hover:text-white text-sm transition-all flex items-center justify-center gap-2"
        >
          View All {data?.meta?.total || ''} Signals Today
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StatCell({ label, value, color }) {
  return (
    <div className="px-5 py-3 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-gray-500 text-xs mt-0.5">{label}</p>
    </div>
  );
}

function SignalPreviewRow({ signal }) {
  const importanceConfig = {
    critical: { color: 'bg-red-500', label: 'CRITICAL' },
    high: { color: 'bg-orange-500', label: 'HIGH' },
    medium: { color: 'bg-yellow-500', label: 'MEDIUM' },
    low: { color: 'bg-gray-500', label: 'LOW' }
  };

  const config = importanceConfig[signal.importance] || importanceConfig.medium;

  return (
    <div className="px-5 py-3 hover:bg-gray-800/30 transition-colors group cursor-pointer">
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
            {signal.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.color} bg-opacity-20 text-white`}>
              {config.label}
            </span>
            {signal.company && (
              <span className="text-gray-500 text-xs">{signal.company}</span>
            )}
            {signal.category && (
              <span className="text-gray-600 text-xs capitalize">
                {signal.category.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonSignal() {
  return (
    <div className="px-5 py-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-1.5 h-1.5 bg-gray-800 rounded-full mt-2" />
        <div className="flex-1">
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-800 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

// ─── Trend Snapshot ───────────────────────────────────────────────────────────
function TrendSnapshot({ trends, loading }) {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Trending Right Now
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">
            AI-detected patterns from this week's news
          </p>
        </div>
        <button
          onClick={() => navigate('/trends')}
          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
        >
          All Trends <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-gray-800/50">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonTrend key={i} />)
        ) : trends.length > 0 ? (
          trends.map((trend, i) => (
            <TrendRow key={i} trend={trend} onClick={() => navigate(`/trends/${trend.slug}`)} />
          ))
        ) : (
          <EmptyState
            message="No trends detected yet. Run trend discovery first."
            action={() => navigate('/trends')}
            actionLabel="Go to Trends"
          />
        )}
      </div>
    </div>
  );
}

function TrendRow({ trend, onClick }) {
  const statusColors = {
    accelerating: 'text-green-400',
    emerging: 'text-blue-400',
    peaking: 'text-yellow-400',
    declining: 'text-red-400',
    stable: 'text-gray-400'
  };

  const momentumWidth = Math.min(100, Math.max(10, trend.momentum || 50));

  return (
    <div
      onClick={onClick}
      className="px-5 py-3.5 hover:bg-gray-800/30 transition-colors cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-white text-sm font-medium group-hover:text-purple-300 transition-colors">
          {trend.name}
        </p>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium capitalize ${statusColors[trend.status] || 'text-gray-400'}`}>
            {trend.status}
          </span>
          <span className="text-gray-600 text-xs">{trend.momentum}%</span>
        </div>
      </div>

      {/* Momentum Bar */}
      <div className="w-full bg-gray-800 rounded-full h-1">
        <div
          className="bg-purple-500 h-1 rounded-full transition-all"
          style={{ width: `${momentumWidth}%` }}
        />
      </div>

      {trend.category && (
        <p className="text-gray-600 text-[11px] mt-1.5">{trend.category}</p>
      )}
    </div>
  );
}

function SkeletonTrend() {
  return (
    <div className="px-5 py-3.5 animate-pulse">
      <div className="flex justify-between mb-2">
        <div className="h-4 bg-gray-800 rounded w-1/2" />
        <div className="h-4 bg-gray-800 rounded w-16" />
      </div>
      <div className="h-1 bg-gray-800 rounded w-full" />
    </div>
  );
}

// ─── Action Cards (The Connected Flow) ───────────────────────────────────────
function ActionCards() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: PlayCircle,
      color: 'from-red-500/10 to-orange-500/10 border-red-500/20',
      iconColor: 'text-red-400',
      title: 'Run a "What If" Simulation',
      desc: 'Type any scenario — "What if India bans wheat exports?" — and get a cascade analysis of who wins, who loses, and what to do.',
      example: '"What if US raises tariffs on India?"',
      action: () => navigate('/simulations'),
      actionLabel: 'Open Simulator'
    },
    {
      icon: Zap,
      color: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20',
      iconColor: 'text-yellow-400',
      title: 'Find Your Personal Income Play',
      desc: 'Tell us your situation — skills, city, capital, hours available — and get specific micro-business plays that fit YOUR life.',
      example: 'BSc student, Tier-2 city, ₹5000 capital',
      action: () => navigate('/personal'),
      actionLabel: 'Get My Plays'
    },
    {
      icon: FileText,
      color: 'from-indigo-500/10 to-blue-500/10 border-indigo-500/20',
      iconColor: 'text-indigo-400',
      title: 'Generate an Intelligence Report',
      desc: 'Get a structured executive report on any topic — with trends, opportunities, risks and strategic recommendations.',
      example: '"Agri-Tech in India, 2025"',
      action: () => navigate('/reports'),
      actionLabel: 'Build Report'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`bg-gradient-to-br ${card.color} border rounded-xl p-4 cursor-pointer hover:scale-[1.01] transition-all`}
            onClick={card.action}
          >
            <Icon className={`w-6 h-6 ${card.iconColor} mb-3`} />
            <h3 className="text-white font-semibold text-sm mb-1.5">{card.title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">{card.desc}</p>
            <p className="text-gray-600 text-[11px] italic mb-3">e.g. {card.example}</p>
            <button className={`flex items-center gap-1.5 ${card.iconColor} text-xs font-semibold hover:gap-2.5 transition-all`}>
              {card.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Quick Ask ────────────────────────────────────────────────────────────────
function QuickAsk() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');

  const exampleQuestions = [
    'What is OpenAI doing this week?',
    'Which sectors benefit from rising oil prices?',
    'What are the biggest risks for Indian farmers?'
  ];

  const handleAsk = () => {
    if (question.trim()) {
      navigate('/ask', { state: { question } });
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-blue-400" />
        <h3 className="text-white font-semibold text-sm">Ask AERTH AI</h3>
      </div>
      <p className="text-gray-500 text-xs mb-3">
        Ask anything about the news we've collected. Every answer cites its source.
      </p>

      <div className="relative mb-3">
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAsk()}
          placeholder="What do you want to know?"
          rows={2}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <button
        onClick={handleAsk}
        disabled={!question.trim()}
        className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm rounded-lg transition-colors font-medium"
      >
        Get Answer with Sources
      </button>

      <div className="mt-3 space-y-1.5">
        <p className="text-gray-600 text-[11px]">Try asking:</p>
        {exampleQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => setQuestion(q)}
            className="block w-full text-left text-gray-500 hover:text-blue-400 text-[11px] transition-colors"
          >
            → {q}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Critical Signals Sidebar ─────────────────────────────────────────────────
function CriticalSignals({ data, loading }) {
  const navigate = useNavigate();
  const critical = data?.signals?.filter(s => s.importance === 'critical') || [];

  return (
    <div className="bg-gray-900 border border-red-900/30 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-red-900/30 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <h3 className="text-white font-semibold text-sm">Critical Today</h3>
      </div>

      <div className="divide-y divide-gray-800/50">
        {loading ? (
          Array(2).fill(0).map((_, i) => <SkeletonSignal key={i} />)
        ) : critical.length > 0 ? (
          critical.map((signal, i) => (
            <div key={i} className="px-4 py-3">
              <p className="text-white text-xs font-medium leading-snug mb-1.5">
                {signal.title}
              </p>
              <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">
                {signal.summary}
              </p>
              {signal.company && (
                <p className="text-red-400 text-[11px] mt-1.5 font-medium">
                  {signal.company}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="px-4 py-4 text-center">
            <p className="text-gray-600 text-xs">No critical signals today</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Disclaimer ───────────────────────────────────────────────────────────────
function Disclaimer() {
  return (
    <div className="border border-gray-800/50 rounded-xl px-5 py-4 bg-gray-900/30">
      <p className="text-gray-600 text-xs leading-relaxed">
        <span className="text-gray-500 font-medium">About AERTH: </span>
        This platform analyzes publicly available news articles using AI. All answers include
        citations to original sources. This is not financial or investment advice.
        AI summaries may contain errors — always verify via the linked sources.
        News data sourced from trusted outlets via NewsAPI.
      </p>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ message, action, actionLabel }) {
  return (
    <div className="px-5 py-6 text-center">
      <p className="text-gray-500 text-sm mb-3">{message}</p>
      {action && (
        <button
          onClick={action}
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mx-auto"
        >
          {actionLabel} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}