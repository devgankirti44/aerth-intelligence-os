// frontend/src/pages/HowItWorks.jsx

export default function HowItWorks() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.eyebrow}>TRANSPARENCY & METHODOLOGY</div>
        <h1 style={styles.title}>How AERTH Works</h1>
        <p style={styles.subtitle}>
          Complete transparency on our data sources, AI methods, and limitations.
          No black boxes. No false claims.
        </p>
      </div>

      {/* WHAT IT IS */}
      <Section title="What AERTH Actually Is">
        <p style={styles.text}>
          AERTH is a <strong>news-based research assistant</strong>. It reads 
          public news articles from trusted sources and helps you find, understand, 
          and connect information across them using AI.
        </p>
        <p style={styles.text}>
          Think of it as: <strong>Google Search + ChatGPT + Citations</strong>, 
          but focused on business, technology, and macro news.
        </p>
      </Section>

      {/* WHAT IT IS NOT */}
      <Section title="What AERTH Is NOT" accent="warning">
        <ul style={styles.list}>
          <li>❌ <strong>Not a prediction system</strong> — We don't forecast stocks, markets, or future events</li>
          <li>❌ <strong>Not a spy tool</strong> — We don't access any private company data</li>
          <li>❌ <strong>Not an oracle</strong> — Our AI can only summarize what's already published</li>
          <li>❌ <strong>Not a replacement for expert analysis</strong> — Just a research accelerator</li>
        </ul>
      </Section>

      {/* DATA SOURCES */}
      <Section title="Where Our Data Comes From">
        <p style={styles.text}>
          100% of our data is from <strong>public, licensed, or open sources</strong>. 
          We do not scrape private data.
        </p>
        <div style={styles.sourcesGrid}>
          <SourceCard 
            name="NewsAPI.org"
            purpose="News article aggregation"
            type="Licensed API"
            details="Aggregates from 80,000+ news sources. We filter to only 16 trusted publishers: Reuters, Bloomberg, WSJ, Financial Times, TechCrunch, The Verge, Ars Technica, Wired, Forbes, Business Insider, VentureBeat, Axios, The Information, Protocol, Engadget, CNBC."
          />
          <SourceCard 
            name="HuggingFace"
            purpose="Text embeddings (RAG)"
            type="Open Model API"
            details="Uses the open-source model 'sentence-transformers/all-MiniLM-L6-v2' to convert text into 384-dimensional vectors for semantic search."
          />
          <SourceCard 
            name="Groq API"
            purpose="LLM inference"
            type="Third-party AI"
            details="Runs Meta's LLaMA 3.3 (70 billion parameters) at high speed. Same model class as ChatGPT alternatives. We only use it to summarize retrieved news articles."
          />
          <SourceCard 
            name="GitHub Public API"
            purpose="Open-source activity signals"
            type="Public API"
            details="Fetches publicly available data: repository names, star counts, commit activity for company GitHub organizations."
          />
          <SourceCard 
            name="MongoDB Atlas"
            purpose="Database + Vector Search"
            type="Cloud Database"
            details="Stores collected articles and their embeddings. Uses Atlas Vector Search for semantic similarity queries."
          />
        </div>
      </Section>

      {/* HOW IT WORKS TECHNICALLY */}
      <Section title="The Complete Technical Flow">
        <div style={styles.steps}>
          <Step 
            n="1"
            title="Data Collection"
            description="Our backend polls NewsAPI for articles mentioning tracked companies. We filter by trusted domain and reject junk content (recipes, celebrity, gossip). Only relevant articles are stored."
            tech="Node.js + Express + NewsAPI"
          />
          <Step 
            n="2"
            title="Storage"
            description="Each article becomes an 'Event' document in MongoDB with fields: title, summary, URL, source, published date, and auto-classified type (funding/product/partnership etc)."
            tech="MongoDB + Mongoose"
          />
          <Step 
            n="3"
            title="Embedding Generation"
            description="Each article's text is sent to HuggingFace which returns a 384-dimensional vector. Similar articles get similar vectors. This enables semantic search."
            tech="HuggingFace Transformers API"
          />
          <Step 
            n="4"
            title="User Asks Question"
            description="When a user asks 'What is happening with AI safety?', we convert their question to a vector using the same HuggingFace model."
            tech="Frontend → Backend API"
          />
          <Step 
            n="5"
            title="Semantic Retrieval"
            description="MongoDB Atlas Vector Search finds the top 8 articles whose vectors are most similar to the question vector. This is called cosine similarity — a standard math operation."
            tech="MongoDB Atlas Vector Search"
          />
          <Step 
            n="6"
            title="AI Answer Generation"
            description="We send the 8 relevant articles + the user's question to Groq's LLaMA model with strict instructions: 'Answer ONLY using these articles. Cite as [Source 1], [Source 2].' The AI cannot make up information — it's forced to use only what we gave it."
            tech="Groq API + Prompt Engineering"
          />
          <Step 
            n="7"
            title="Citations Displayed"
            description="User sees the AI answer with clickable [Source 1] tags. Each source links to the original news article, so users can verify every claim."
            tech="RAG (Retrieval Augmented Generation)"
          />
        </div>
      </Section>

      {/* WHAT ABOUT TRENDS/OPPORTUNITIES */}
      <Section title="How Trends and Opportunities Work">
        <p style={styles.text}>
          <strong>Trends are NOT predictions.</strong> They are AI-generated 
          summaries of patterns in the news we collected.
        </p>
        <p style={styles.text}>
          Process: We take 100 articles from the last 30 days → send them to Groq → 
          ask "What themes appear repeatedly?" → AI returns groups like "AI chip 
          shortage" with the article numbers that support each theme.
        </p>
        <p style={styles.text}>
          It's essentially <strong>AI-assisted summarization at scale</strong>. 
          A human analyst would do the same job in 8 hours; our AI does it in 30 seconds.
        </p>
        <p style={styles.text}>
          <strong>Opportunities</strong> work similarly — AI reads current trends and 
          news, then suggests business plays that seem to fit. These are HYPOTHESES 
          from AI, not investment advice.
        </p>
      </Section>

      {/* HONEST LIMITATIONS */}
      <Section title="Known Limitations (Being Honest)" accent="warning">
        <ul style={styles.list}>
          <li>📰 <strong>Only as good as news sources</strong> — If news is biased or incomplete, our analysis reflects that.</li>
          <li>🤖 <strong>AI can misinterpret</strong> — Language models occasionally misunderstand context. Always verify via [Source] citations.</li>
          <li>⏰ <strong>Not real-time</strong> — News refreshes every 6 hours to save API costs. Not suitable for time-critical decisions.</li>
          <li>🌍 <strong>English-language bias</strong> — Most news sources are English. Regional/vernacular news is underrepresented.</li>
          <li>💰 <strong>Not financial advice</strong> — Nothing here is a recommendation to buy/sell/invest.</li>
          <li>🎯 <strong>Trend detection ≠ prediction</strong> — We detect what's happening NOW, not what will happen.</li>
        </ul>
      </Section>

      {/* WHO SHOULD USE THIS */}
      <Section title="Who This Is Built For">
        <div style={styles.usersGrid}>
          <UserCard 
            icon="🎓"
            title="Students"
            description="Researching a topic for a paper, project, or thesis. Get 10 sources analyzed in 30 seconds instead of Googling for 3 hours."
          />
          <UserCard 
            icon="📰"
            title="Journalists"
            description="Quickly understand what's been reported about a company or topic. Get an overview before writing your own piece."
          />
          <UserCard 
            icon="🔍"
            title="Independent Researchers"
            description="Track multiple companies or macro topics simultaneously without opening 50 browser tabs."
          />
          <UserCard 
            icon="💼"
            title="Founders / Solo Consultants"
            description="Stay informed about competitor moves and industry patterns without a dedicated research team."
          />
        </div>
      </Section>

      {/* WHY BUILD THIS */}
      <Section title="Why We Built AERTH">
        <p style={styles.text}>
          When researching any complex topic today, you have to:
        </p>
        <ol style={styles.orderedList}>
          <li>Open Google</li>
          <li>Try different keywords</li>
          <li>Open 20 tabs</li>
          <li>Read each article</li>
          <li>Take notes</li>
          <li>Try to connect information across articles</li>
          <li>Give up after 3 hours</li>
        </ol>
        <p style={styles.text}>
          AERTH compresses this to: <strong>ask a question → get a cited answer 
          in 5 seconds</strong>. That's the only claim we make.
        </p>
      </Section>
    </div>
  );
}

// Reusable components
function Section({ title, children, accent }) {
  const bgColor = accent === 'warning' ? '#1a1408' : '#0f0f0f';
  const borderColor = accent === 'warning' ? '#3a2a10' : '#1a1a1a';
  
  return (
    <section style={{...styles.section, background: bgColor, borderColor}}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function SourceCard({ name, purpose, type, details }) {
  return (
    <div style={styles.sourceCard}>
      <div style={styles.sourceName}>{name}</div>
      <div style={styles.sourceType}>{type}</div>
      <div style={styles.sourcePurpose}>{purpose}</div>
      <p style={styles.sourceDetails}>{details}</p>
    </div>
  );
}

function Step({ n, title, description, tech }) {
  return (
    <div style={styles.step}>
      <div style={styles.stepNumber}>{n}</div>
      <div style={styles.stepContent}>
        <div style={styles.stepTitle}>{title}</div>
        <p style={styles.stepDesc}>{description}</p>
        <div style={styles.stepTech}>{tech}</div>
      </div>
    </div>
  );
}

function UserCard({ icon, title, description }) {
  return (
    <div style={styles.userCard}>
      <div style={styles.userIcon}>{icon}</div>
      <div style={styles.userTitle}>{title}</div>
      <p style={styles.userDesc}>{description}</p>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    maxWidth: '1100px',
    margin: '0 auto',
    color: '#e8e8e0',
    fontFamily: 'system-ui, sans-serif',
    background: '#0a0a0a',
    minHeight: '100vh'
  },
  header: {
    marginBottom: '48px',
    paddingBottom: '24px',
    borderBottom: '1px solid #1a1a1a'
  },
  eyebrow: {
    color: '#6a8a6a',
    fontSize: '11px',
    letterSpacing: '2px',
    marginBottom: '8px'
  },
  title: {
    fontSize: '48px',
    margin: '0 0 12px 0',
    fontWeight: 300
  },
  subtitle: {
    color: '#8a8a80',
    fontSize: '17px',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '700px'
  },
  section: {
    padding: '32px',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '24px',
    marginTop: 0,
    marginBottom: '16px',
    fontWeight: 400
  },
  text: {
    fontSize: '15px',
    lineHeight: 1.7,
    color: '#c8c8c0',
    marginBottom: '12px'
  },
  list: {
    fontSize: '15px',
    lineHeight: 2,
    color: '#c8c8c0',
    paddingLeft: '0',
    listStyle: 'none'
  },
  orderedList: {
    fontSize: '15px',
    lineHeight: 2,
    color: '#c8c8c0',
    paddingLeft: '24px'
  },
  sourcesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
    marginTop: '16px'
  },
  sourceCard: {
    padding: '18px',
    background: '#0a0a0a',
    border: '1px solid #2a2a2a',
    borderRadius: '8px'
  },
  sourceName: {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '4px',
    color: '#a8c8a8'
  },
  sourceType: {
    fontSize: '11px',
    color: '#6a8a6a',
    letterSpacing: '1px',
    marginBottom: '8px'
  },
  sourcePurpose: {
    fontSize: '13px',
    color: '#8a8a80',
    marginBottom: '8px'
  },
  sourceDetails: {
    fontSize: '13px',
    color: '#a8a8a0',
    lineHeight: 1.5,
    margin: 0
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  step: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start'
  },
  stepNumber: {
    minWidth: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#1a2a1a',
    color: '#a8c8a8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 500,
    border: '1px solid #2a4a2a'
  },
  stepContent: {
    flex: 1
  },
  stepTitle: {
    fontSize: '17px',
    fontWeight: 500,
    marginBottom: '6px'
  },
  stepDesc: {
    fontSize: '14px',
    color: '#a8a8a0',
    lineHeight: 1.6,
    margin: '0 0 6px 0'
  },
  stepTech: {
    fontSize: '11px',
    color: '#6a8a6a',
    fontFamily: 'monospace',
    letterSpacing: '0.5px'
  },
  usersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '12px'
  },
  userCard: {
    padding: '20px',
    background: '#0a0a0a',
    border: '1px solid #2a2a2a',
    borderRadius: '8px'
  },
  userIcon: {
    fontSize: '32px',
    marginBottom: '8px'
  },
  userTitle: {
    fontSize: '16px',
    fontWeight: 500,
    marginBottom: '8px'
  },
  userDesc: {
    fontSize: '13px',
    color: '#a8a8a0',
    lineHeight: 1.5,
    margin: 0
  }
};