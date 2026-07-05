// frontend/src/components/companyProfile/AskPanel.jsx

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './AskPanel.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

const SUGGESTED = [
  'What is their most recent strategic move?',
  'How is their competitive position changing?',
  'What risks are emerging?',
  'What partnerships have been announced?'
];

export default function AskPanel({ companySlug, companyName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Load history
    axios.get(`${API}/companies/${companySlug}/history`)
      .then(res => setMessages(res.data))
      .catch(() => {});
  }, [companySlug]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  const handleAsk = async (question) => {
    if (!question.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: question,
      _tempId: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API}/companies/${companySlug}/ask`,
        { question }
      );

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        _tempId: Date.now() + 1
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        _tempId: Date.now() + 1
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ask-panel">
      {/* Empty state */}
      {messages.length === 0 && (
        <div className="ask-empty">
          <div className="ask-empty__icon">◈</div>
          <h3 className="ask-empty__title">Ask anything about {companyName}</h3>
          <p className="ask-empty__desc">
            Powered by RAG over {companyName}'s news, events, and intelligence signals.
            Answers include source citations.
          </p>
          <div className="ask-empty__suggestions">
            {SUGGESTED.map((s, i) => (
              <button
                key={i}
                className="suggestion"
                onClick={() => handleAsk(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="ask-messages" ref={scrollRef}>
          {messages.map((msg) => (
            <Message key={msg._id || msg._tempId} message={msg} />
          ))}
          {loading && (
            <div className="ask-thinking">
              <div className="ask-thinking__dot" />
              <div className="ask-thinking__dot" />
              <div className="ask-thinking__dot" />
              <span>Searching intelligence...</span>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <form
        className="ask-form"
        onSubmit={(e) => { e.preventDefault(); handleAsk(input); }}
      >
        <input
          type="text"
          className="ask-input"
          placeholder={`Ask about ${companyName}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="ask-send"
          disabled={loading || !input.trim()}
        >
          ↑
        </button>
      </form>
    </div>
  );
}

function Message({ message }) {
  return (
    <div className={`msg msg--${message.role}`}>
      <div className="msg__role">
        {message.role === 'user' ? 'YOU' : 'AERTH AI'}
      </div>
      <div className="msg__content">{message.content}</div>

      {message.sources?.length > 0 && (
        <div className="msg__sources">
          <span className="msg__sources-label">SOURCES</span>
          <div className="msg__sources-list">
            {message.sources.slice(0, 5).map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="source-chip"
              >
                <span className="source-chip__num">[{i + 1}]</span>
                <span className="source-chip__title">{s.title}</span>
                <span className="source-chip__meta">
                  {s.source} · {formatDate(s.publishedAt)}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}