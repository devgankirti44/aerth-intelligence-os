// src/components/shared/SoWhatBanner.jsx
// This ONE component goes on every page
// It connects what the user is seeing → to what they should DO next

export default function SoWhatBanner({ context }) {
  // context tells the banner WHERE the user is
  // so it gives relevant "so what" advice

  const banners = {
    trends: {
      emoji: '📡',
      reading: 'You are reading:',
      readingBold: 'Trends detected from this week\'s news',
      sowhat: 'So what?',
      action: 'Pick a trend that affects your work or business → Run a simulation to see what happens next → Find your opportunity inside it',
      steps: [
        { label: 'Curious about a trend?', cta: 'Ask AERTH AI about it', path: '/ask', color: 'blue' },
        { label: 'Want to act on it?', cta: 'Find your micro-play', path: '/personal', color: 'yellow' },
        { label: 'Need the full picture?', cta: 'Generate a report', path: '/reports', color: 'indigo' }
      ]
    },
    world: {
      emoji: '🌍',
      reading: 'You are reading:',
      readingBold: 'Global signals — geopolitics, markets, macro events',
      sowhat: 'So what?',
      action: 'These signals are the raw material. They become trends. Trends become opportunities. Opportunities become YOUR next move.',
      steps: [
        { label: 'See what this means for business', cta: 'View Trend Radar', path: '/trends', color: 'purple' },
        { label: 'Simulate a scenario', cta: 'Open Simulator', path: '/simulations', color: 'red' },
        { label: 'Save a signal to track', cta: 'Add to Watchlist', path: '/watchlist', color: 'teal' }
      ]
    },
    simulation: {
      emoji: '⚡',
      reading: 'You just simulated:',
      readingBold: 'A "what if" scenario with cascade effects',
      sowhat: 'So what?',
      action: 'A simulation tells you WHO wins and WHO loses. Now find out if YOU can be a winner — match this scenario to your skills and situation.',
      steps: [
        { label: 'Who are the winners?', cta: 'Track those companies', path: '/companies', color: 'orange' },
        { label: 'Is there money in this?', cta: 'Find your micro-play', path: '/personal', color: 'yellow' },
        { label: 'Save your analysis', cta: 'Write a research note', path: '/research', color: 'teal' }
      ]
    },
    opportunities: {
      emoji: '🎯',
      reading: 'You are viewing:',
      readingBold: 'Strategic opportunities detected by AI from global signals',
      sowhat: 'So what?',
      action: 'These are macro opportunities — big picture plays for businesses and investors. If you are an individual, scroll down to find YOUR personal version of this opportunity.',
      steps: [
        { label: 'Individual or student?', cta: 'Get your personal micro-plays', path: '/personal', color: 'yellow' },
        { label: 'Research this opportunity', cta: 'Ask AERTH AI', path: '/ask', color: 'blue' },
        { label: 'Track this space', cta: 'Add to Watchlist', path: '/watchlist', color: 'teal' }
      ]
    },
    reports: {
      emoji: '📋',
      reading: 'You are reading:',
      readingBold: 'An AI-generated intelligence report with cited sources',
      sowhat: 'So what?',
      action: 'Reports synthesize everything — trends, signals, opportunities — into one document. Use this to brief your team, impress your investor, or make your next decision.',
      steps: [
        { label: 'Something surprised you?', cta: 'Simulate that scenario', path: '/simulations', color: 'red' },
        { label: 'Found an opportunity?', cta: 'Find your entry play', path: '/personal', color: 'yellow' },
        { label: 'Want to save your findings?', cta: 'Write a research note', path: '/research', color: 'teal' }
      ]
    },
    personal: {
      emoji: '💡',
      reading: 'You are viewing:',
      readingBold: 'Income plays matched to YOUR specific situation',
      sowhat: 'So what?',
      action: 'These are NOT generic advice. They are calculated from your city, skills, capital and time. Each play has a 90-day action plan. Pick one and start.',
      steps: [
        { label: 'Understand the market behind this play', cta: 'Read Trend Radar', path: '/trends', color: 'purple' },
        { label: 'Research your play deeply', cta: 'Ask AERTH AI', path: '/ask', color: 'blue' },
        { label: 'Track your progress', cta: 'Write a research note', path: '/research', color: 'teal' }
      ]
    },
    research: {
      emoji: '📝',
      reading: 'You are in:',
      readingBold: 'Your personal knowledge base — notes, tags, AI summaries',
      sowhat: 'So what?',
      action: 'Great researchers do not just consume — they connect dots. Use your notes to build your own thesis, track your ideas, and remember what you discovered.',
      steps: [
        { label: 'Ready to act on your research?', cta: 'Find your micro-play', path: '/personal', color: 'yellow' },
        { label: 'Want a formal output?', cta: 'Generate a report', path: '/reports', color: 'indigo' },
        { label: 'Go deeper on a topic', cta: 'Ask AERTH AI', path: '/ask', color: 'blue' }
      ]
    },
    companies: {
      emoji: '🏢',
      reading: 'You are tracking:',
      readingBold: 'What companies are doing — launches, funding, acquisitions',
      sowhat: 'So what?',
      action: 'Watching companies is not enough. The question is: what does their move mean for YOU? Every company action creates a ripple — someone loses a customer, someone gains a gap to fill.',
      steps: [
        { label: 'What does this mean for the market?', cta: 'Check Trend Radar', path: '/trends', color: 'purple' },
        { label: 'Simulate the impact', cta: 'Run a scenario', path: '/simulations', color: 'red' },
        { label: 'Find the gap they created', cta: 'View Opportunities', path: '/opportunities', color: 'green' }
      ]
    }
  };

  const config = banners[context] || banners.trends;

  return <BannerUI config={config} />;
}