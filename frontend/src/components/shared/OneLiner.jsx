// src/components/shared/OneLiner.jsx
// Put this at the very TOP of your homepage
// This is the first thing every user reads

import { useState } from 'react';

export default function OneLiner() {
  const [activeTab, setActiveTab] = useState(0);

  const personas = [
    {
      label: 'Student',
      icon: '🎓',
      line: 'I read 500 news articles a day so you don\'t have to — then tell you which skills to learn and what to build to earn money from what\'s happening in the world right now.',
      example: 'BSc student in Ludhiana → AERTH detects India agri boom → suggests microgreens farming → 90-day plan → ₹25,000/month'
    },
    {
      label: 'Entrepreneur',
      icon: '🚀',
      line: 'I track your competitors, detect market shifts before they hit you, and tell you exactly which threats to worry about and which opportunities to chase — based on real news, not guesswork.',
      example: 'SaaS founder → AERTH detects competitor raised $10M → simulates market impact → surfaces 3 defensive moves'
    },
    {
      label: 'Researcher',
      icon: '🔬',
      line: 'I am your research assistant that never sleeps — ask me anything about current events and I\'ll give you a cited answer from real articles, not a hallucinated response.',
      example: 'Ask: "What is China\'s semiconductor strategy?" → Get answer with 6 source links → No hallucination'
    },
    {
      label: 'Investor',
      icon: '📈',
      line: 'I detect macro trends before they become obvious, simulate geopolitical scenarios and their market impact, and surface non-obvious opportunities emerging from global shifts.',
      example: 'Scenario: "India joins BRICS trade settlement" → AERTH cascades impact across 8 sectors → surfaces 4 winners'
    }
  ];

  const active = personas[activeTab];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-2xl overflow-hidden mb-6">

      {/* Big Headline */}
      <div className="px-6 pt-6 pb-4 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-blue-400 text-xs font-semibold">
            RAG-powered news intelligence — every answer cites its source
          </span>
        </div>

        <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-2">
          What is AERTH?
        </h1>
        <p className="text-gray-400 text-base max-w-2xl mx-auto">
          A news research assistant that reads the world for you,
          finds patterns in the noise, and tells you what to do next.
        </p>
      </div>

      {/* Persona Tabs */}
      <div className="px-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {personas.map((p, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all flex-shrink-0
                ${activeTab === i
                  ? 'bg-gray-700 text-white font-medium'
                  : 'text-gray-500 hover:text-gray-300'
                }
              `}
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Persona Content */}
      <div className="px-6 py-4 space-y-3">
        {/* The one-liner */}
        <div className="bg-gray-800/60 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2 font-bold tracking-wider">
            IF YOU ARE A {active.label.toUpperCase()}, AERTH IS:
          </p>
          <p className="text-white text-sm leading-relaxed font-medium">
            "{active.line}"
          </p>
        </div>

        {/* Real example flow */}
        <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
          <p className="text-xs text-gray-500 mb-2 font-bold tracking-wider">
            REAL EXAMPLE
          </p>
          <p className="text-gray-300 text-sm leading-relaxed font-mono">
            {active.example}
          </p>
        </div>
      </div>

      {/* The journey map — always visible */}
      <div className="border-t border-gray-800 px-6 py-4">
        <p className="text-gray-600 text-xs font-bold tracking-widest mb-3 text-center">
          THE AERTH JOURNEY
        </p>
        <JourneyMap />
      </div>

    </div>
  );
}

function JourneyMap() {
  const steps = [
    { icon: '📰', label: 'News comes in', sub: 'NewsAPI + trusted sources' },
    { icon: '🤖', label: 'AI reads it', sub: 'Extracts signals & patterns' },
    { icon: '📡', label: 'Trends detected', sub: 'You see what\'s moving' },
    { icon: '❓', label: 'You ask questions', sub: 'Cited answers only' },
    { icon: '💡', label: 'You find your play', sub: 'Matched to your situation' },
    { icon: '✅', label: 'You take action', sub: '90-day plan, real numbers' },
  ];

  return (
    <div className="flex items-start justify-between gap-1 overflow-x-auto">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-1 flex-shrink-0">
          <div className="flex flex-col items-center text-center w-16">
            <span className="text-2xl mb-1">{step.icon}</span>
            <p className="text-white text-[11px] font-medium leading-tight">{step.label}</p>
            <p className="text-gray-600 text-[10px] mt-0.5 leading-tight">{step.sub}</p>
          </div>
          {i < steps.length - 1 && (
            <div className="text-gray-700 text-lg mb-4 flex-shrink-0">→</div>
          )}
        </div>
      ))}
    </div>
  );
}