// frontend/src/components/assistant/AskAerthModal.jsx

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AskAerthModal.css';

const API = 'http://localhost:5000/api';

const SUGGESTED = [
  'What are the biggest strategic moves this week?',
  'Which companies are hiring aggressively?',
  'What geopolitical shifts should I watch?',
  'Show me emerging opportunities in AI',
  'What trends are accelerating right now?'
];

export default function AskAerthModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleAsk = async (question) => {
    if (!question.trim() || loading) return;

    const userMsg = { role: 'user', content: question, _id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Try global RAG endpoint (searches across all data)
      const { data } = await axios.post(`${API}/ask`, {
        question,
        sessionId: 'global-assistant'
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        _id: Date.now() + 1
      }]);
    } catch (error) {
      // Fallback: try any company's ask endpoint as demo
      try {
        const { data } = await axios.post(
          `${API}/companies/openai/ask`,
          { question, sessionId: 'global-assistant' }
        );

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer,
          sources: data.sources || [],
          _id: Date.now() + 1
        }]);
      } catch (fallbackError) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or refresh intelligence first.',
          _id: Date.now() + 1
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="ask-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="ask-modal">
        {/* Header */}
        <div className="ask-modal__header">
          <div className="ask-modal__title-block">
            <div className="ask-modal__icon">
              <SparkIcon />
            </div>
            <div>
              <h2 className="ask-modal__title">AERTH AI Analyst</h2>
              <p className="ask-modal__subtitle">
                Your strategic intelligence assistant
              </p>
            </div>
          </div>

          <div className="ask-modal__actions">
            {messages.length > 0 && (
              <button className="ask-modal__clear" onClick={handleClear}>
                Clear
              </button>
            )}
            <button className="ask-modal__close" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="ask-modal__body" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="ask-modal__empty">
              <div className="ask-modal__empty-icon">
                <SparkIconLarge />
              </div>
              <h3 className="ask-modal__empty-title">
                Ask anything about the world's intelligence
              </h3>
              <p className="ask-modal__empty-desc">
                I analyze news, trends, and signals across all tracked
                companies and sectors to answer your strategic questions
                with real source citations.
              </p>

              <div className="ask-modal__suggestions">
                <span className="ask-modal__suggestions-label">
                  TRY ASKING
                </span>
                {SUGGESTED.map((q, i) => (
                  <button
                    key={i}
                    className="ask-modal__suggestion"
                    onClick={() => handleAsk(q)}
                  >
                    <ArrowIcon />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="ask-modal__messages">
              {messages.map((msg) => (
                <Message key={msg._id} message={msg} />
              ))}

              {loading && (
                <div className="ask-modal__thinking">
                  <div className="ask-modal__thinking-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="ask-modal__thinking-text">
                    Analyzing intelligence...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          className="ask-modal__form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(input);
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="ask-modal__input"
            placeholder="Ask AERTH AI anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="ask-modal__send"
            disabled={loading || !input.trim()}
          >
            <SendIcon />
          </button>
        </form>

        {/* Footer hint */}
        <div className="ask-modal__footer">
          <span>Powered by RAG + MongoDB Atlas Vector Search</span>
          <kbd>ESC to close</kbd>
        </div>
      </div>
    </>
  );
}

function Message({ message }) {
  return (
    <div className={`ask-msg ask-msg--${message.role}`}>
      {message.role === 'assistant' && (
        <div className="ask-msg__avatar">
          <SparkIcon />
        </div>
      )}

      <div className="ask-msg__body">
        <div className="ask-msg__content">{message.content}</div>

        {message.sources?.length > 0 && (
          <div className="ask-msg__sources">
            <span className="ask-msg__sources-label">SOURCES</span>
            <div className="ask-msg__sources-list">
              {message.sources.slice(0, 5).map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ask-msg__source"
                >
                  <span className="ask-msg__source-num">[{i + 1}]</span>
                  <span className="ask-msg__source-title">{s.title}</span>
                  <span className="ask-msg__source-meta">
                    {s.source}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Icons
function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/>
    </svg>
  );
}

function SparkIconLarge() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.3">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6">
      <path d="M5 12h14M13 5l7 7-7 7"/>
    </svg>
  );
}