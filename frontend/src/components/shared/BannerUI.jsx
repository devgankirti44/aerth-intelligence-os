// src/components/shared/BannerUI.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, ChevronDown, ChevronUp } from 'lucide-react';

const colorMap = {
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-400',   btn: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', btn: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', btn: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300' },
  red:    { bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',    btn: 'bg-red-500/20 hover:bg-red-500/30 text-red-300' },
  teal:   { bg: 'bg-teal-500/10',   border: 'border-teal-500/30',   text: 'text-teal-400',   btn: 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', btn: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', btn: 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300' },
  green:  { bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-400',  btn: 'bg-green-500/20 hover:bg-green-500/30 text-green-300' },
};

export default function BannerUI({ config }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gray-900 border border-gray-700/50 rounded-xl overflow-hidden mb-6">

      {/* Top strip — always visible */}
      <div
        className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{config.emoji}</span>
          <div>
            <span className="text-gray-500 text-xs">{config.reading} </span>
            <span className="text-white text-xs font-semibold">{config.readingBold}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-xs hidden sm:block">
            What to do next?
          </span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-500" />
            : <ChevronDown className="w-4 h-4 text-gray-500" />
          }
          <button
            onClick={e => { e.stopPropagation(); setDismissed(true); }}
            className="text-gray-700 hover:text-gray-400 transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded — So What + Next Steps */}
      {expanded && (
        <div className="border-t border-gray-800 px-5 py-4 space-y-4">

          {/* The "So What" explanation */}
          <div className="bg-gray-800/50 rounded-lg px-4 py-3">
            <p className="text-yellow-400 text-xs font-bold mb-1.5">
              💬 {config.sowhat}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              {config.action}
            </p>
          </div>

          {/* Next Step Buttons */}
          <div>
            <p className="text-gray-600 text-xs font-bold tracking-widest mb-3">
              YOUR NEXT STEPS
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {config.steps.map((step, i) => {
                const colors = colorMap[step.color] || colorMap.blue;
                return (
                  <button
                    key={i}
                    onClick={() => navigate(step.path)}
                    className={`
                      flex flex-col items-start gap-1.5 p-3 rounded-lg border
                      ${colors.bg} ${colors.border}
                      hover:scale-[1.02] transition-all text-left
                    `}
                  >
                    <p className="text-gray-400 text-xs">{step.label}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-semibold ${colors.text}`}>
                        {step.cta}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 ${colors.text}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}