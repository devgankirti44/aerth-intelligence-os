// backend/src/seed/seedCompanies.js

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company.js';

dotenv.config();

const COMPANIES = [
  // AI / Tech
  { slug: 'openai', name: 'OpenAI', industry: 'Artificial Intelligence', headquarters: 'San Francisco, USA', founded: 2015, valuation: '$157B', status: 'private', github: 'openai', competitors: ['anthropic','google-deepmind','xai'], categories: ['LLM','AGI'], tagline: 'Safe AGI for humanity', description: 'Creator of ChatGPT, GPT-4, DALL·E' },
  { slug: 'anthropic', name: 'Anthropic', industry: 'Artificial Intelligence', headquarters: 'San Francisco, USA', founded: 2021, valuation: '$40B', status: 'private', github: 'anthropics', competitors: ['openai','google-deepmind'], categories: ['LLM','AI Safety'], tagline: 'AI safety research', description: 'Creator of Claude' },
  { slug: 'nvidia', name: 'NVIDIA', industry: 'Semiconductors', headquarters: 'Santa Clara, USA', founded: 1993, valuation: '$3.4T', status: 'public', github: 'NVIDIA', competitors: ['amd','intel','tsmc'], categories: ['GPU','AI Chips'], tagline: 'The engine of AI', description: 'GPU and AI infrastructure' },
  { slug: 'perplexity', name: 'Perplexity', industry: 'Artificial Intelligence', headquarters: 'San Francisco, USA', founded: 2022, valuation: '$9B', status: 'private', competitors: ['openai','google'], categories: ['AI Search'], tagline: 'Where knowledge begins', description: 'AI answer engine' },
  { slug: 'mistral', name: 'Mistral AI', industry: 'Artificial Intelligence', headquarters: 'Paris, France', founded: 2023, valuation: '$6B', status: 'private', github: 'mistralai', competitors: ['openai','meta-ai'], categories: ['LLM','Open Source'], tagline: 'Frontier AI in your hands', description: 'European open-weight AI' },
  { slug: 'meta-ai', name: 'Meta AI', industry: 'Artificial Intelligence', headquarters: 'Menlo Park, USA', status: 'public', github: 'facebookresearch', competitors: ['openai','anthropic'], categories: ['LLM','Open Source'], tagline: 'AI for everyone', description: 'Creator of Llama' },
  { slug: 'xai', name: 'xAI', industry: 'Artificial Intelligence', headquarters: 'San Francisco, USA', founded: 2023, valuation: '$50B', status: 'private', competitors: ['openai','anthropic'], categories: ['LLM','AGI'], tagline: 'Understand the universe', description: 'Elon Musk AI company' },
  { slug: 'deepseek', name: 'DeepSeek', industry: 'Artificial Intelligence', headquarters: 'Hangzhou, China', founded: 2023, status: 'private', github: 'deepseek-ai', competitors: ['openai','mistral'], categories: ['LLM','Open Source'], tagline: 'Deep intelligence for all', description: 'Chinese efficient models' },
  { slug: 'google-deepmind', name: 'Google DeepMind', industry: 'Artificial Intelligence', headquarters: 'London, UK', status: 'public', competitors: ['openai','anthropic'], categories: ['LLM','Research'], tagline: 'Solving intelligence', description: 'Creator of Gemini' },

  // Semiconductors
  { slug: 'tsmc', name: 'TSMC', industry: 'Semiconductors', headquarters: 'Hsinchu, Taiwan', founded: 1987, valuation: '$900B', status: 'public', competitors: ['samsung','intel'], categories: ['Foundry'], tagline: 'Foundry for the world', description: 'Largest chip foundry' },
  { slug: 'asml', name: 'ASML', industry: 'Semiconductors', headquarters: 'Veldhoven, Netherlands', status: 'public', competitors: [], categories: ['Lithography'], tagline: 'Enabling Moores Law', description: 'EUV lithography monopoly' },
  { slug: 'samsung', name: 'Samsung', industry: 'Semiconductors', headquarters: 'Seoul, South Korea', status: 'public', competitors: ['tsmc','intel'], categories: ['Memory','Foundry'], tagline: 'Do what you cant', description: 'Memory and foundry giant' },
  { slug: 'amd', name: 'AMD', industry: 'Semiconductors', headquarters: 'Santa Clara, USA', status: 'public', competitors: ['nvidia','intel'], categories: ['GPU','CPU'], tagline: 'Together we advance', description: 'GPU and CPU challenger' },
  { slug: 'intel', name: 'Intel', industry: 'Semiconductors', headquarters: 'Santa Clara, USA', status: 'public', competitors: ['amd','tsmc'], categories: ['CPU','Foundry'], tagline: 'Experience whats inside', description: 'x86 CPU leader' },

  // Agriculture / AgTech
  { slug: 'john-deere', name: 'John Deere', industry: 'Agriculture', headquarters: 'Moline, USA', founded: 1837, status: 'public', competitors: ['mahindra-agri','agco'], categories: ['Farm Equipment','Precision Agriculture'], tagline: 'Nothing runs like a Deere', description: 'Smart farming leader' },
  { slug: 'mahindra-agri', name: 'Mahindra Agri', industry: 'Agriculture', headquarters: 'Mumbai, India', status: 'public', competitors: ['john-deere','tafe'], categories: ['Farm Equipment','India'], tagline: 'Rise for a better world', description: 'India tractor leader' },
  { slug: 'bayer-crop', name: 'Bayer Crop Science', industry: 'Agriculture', headquarters: 'Leverkusen, Germany', status: 'public', competitors: ['syngenta','corteva'], categories: ['Seeds','Agrochemicals'], tagline: 'Science for a better life', description: 'Seeds and crop protection' },
  { slug: 'syngenta', name: 'Syngenta', industry: 'Agriculture', headquarters: 'Basel, Switzerland', status: 'private', competitors: ['bayer-crop','corteva'], categories: ['Seeds','Agrochemicals'], tagline: 'Bringing plant potential to life', description: 'Seeds and agrochemicals' },
  { slug: 'corteva', name: 'Corteva', industry: 'Agriculture', headquarters: 'Indianapolis, USA', status: 'public', competitors: ['bayer-crop','syngenta'], categories: ['Seeds','Digital Ag'], tagline: 'Grow what matters', description: 'Agriculture innovation' },
  { slug: 'itc-agri', name: 'ITC Agri Business', industry: 'Agriculture', headquarters: 'Kolkata, India', status: 'public', competitors: ['mahindra-agri'], categories: ['India','Agri Value Chain'], tagline: 'Enduring value', description: 'India agri exports' },

  // Indian Giants
  { slug: 'reliance', name: 'Reliance Industries', industry: 'Conglomerate', headquarters: 'Mumbai, India', founded: 1966, valuation: '$220B', status: 'public', competitors: ['tata','adani'], categories: ['Energy','Telecom','Retail'], tagline: 'Growth is life', description: 'Indias largest conglomerate' },
  { slug: 'tcs', name: 'Tata Consultancy Services', industry: 'IT Services', headquarters: 'Mumbai, India', valuation: '$180B', status: 'public', competitors: ['infosys','wipro'], categories: ['IT Services','Consulting'], tagline: 'Building on belief', description: 'IT services giant' },
  { slug: 'infosys', name: 'Infosys', industry: 'IT Services', headquarters: 'Bengaluru, India', valuation: '$85B', status: 'public', competitors: ['tcs','wipro'], categories: ['IT Services'], tagline: 'Navigate your next', description: 'IT services' },
  { slug: 'adani', name: 'Adani Group', industry: 'Infrastructure', headquarters: 'Ahmedabad, India', status: 'public', competitors: ['reliance','tata'], categories: ['Ports','Energy','Airports'], tagline: 'Growth with goodness', description: 'Infrastructure conglomerate' },
  { slug: 'tata', name: 'Tata Group', industry: 'Conglomerate', headquarters: 'Mumbai, India', founded: 1868, status: 'public', competitors: ['reliance','adani'], categories: ['Steel','Auto','IT'], tagline: 'Leadership with trust', description: 'Diversified conglomerate' },
  { slug: 'jio', name: 'Jio Platforms', industry: 'Telecom', headquarters: 'Mumbai, India', founded: 2016, status: 'private', competitors: ['airtel','vodafone-idea'], categories: ['Telecom','Digital'], tagline: 'Digital life', description: 'Indias telecom disruptor' },
  { slug: 'paytm', name: 'Paytm', industry: 'Fintech', headquarters: 'Noida, India', status: 'public', competitors: ['phonepe','razorpay'], categories: ['Payments','India'], tagline: 'Payments for India', description: 'Digital payments pioneer' },
  { slug: 'zomato', name: 'Zomato', industry: 'Food Tech', headquarters: 'Gurugram, India', status: 'public', competitors: ['swiggy'], categories: ['Food Delivery','India'], tagline: 'Better food for more people', description: 'Food delivery leader' },

  // Chinese Tech
  { slug: 'alibaba', name: 'Alibaba', industry: 'E-commerce', headquarters: 'Hangzhou, China', valuation: '$200B', status: 'public', competitors: ['bytedance','tencent'], categories: ['E-commerce','Cloud'], tagline: 'To make it easy to do business anywhere', description: 'Chinese e-commerce giant' },
  { slug: 'bytedance', name: 'ByteDance', industry: 'Technology', headquarters: 'Beijing, China', valuation: '$300B', status: 'private', competitors: ['meta','alibaba'], categories: ['Social Media','AI'], tagline: 'Inspire creativity', description: 'TikTok parent company' },
  { slug: 'huawei', name: 'Huawei', industry: 'Telecom Equipment', headquarters: 'Shenzhen, China', status: 'private', competitors: ['ericsson','nokia'], categories: ['Telecom','Smartphones'], tagline: 'Building a fully connected world', description: 'Telecom equipment leader' },
  { slug: 'smic', name: 'SMIC', industry: 'Semiconductors', headquarters: 'Shanghai, China', status: 'public', competitors: ['tsmc','samsung'], categories: ['Foundry','China'], tagline: 'Boundless silicon', description: 'Chinese chip foundry' },

  // Energy
  { slug: 'adani-green', name: 'Adani Green Energy', industry: 'Renewable Energy', headquarters: 'Ahmedabad, India', status: 'public', competitors: ['renew','tata-power'], categories: ['Solar','Wind','India'], tagline: 'Powering positive change', description: 'Renewable energy' },
  { slug: 'renew', name: 'ReNew Power', industry: 'Renewable Energy', headquarters: 'Gurugram, India', status: 'public', competitors: ['adani-green','tata-power'], categories: ['Solar','Wind'], tagline: 'Green energy for all', description: 'Renewable energy' },
  { slug: 'tata-power', name: 'Tata Power', industry: 'Energy', headquarters: 'Mumbai, India', status: 'public', competitors: ['adani-green','renew'], categories: ['Power','Solar'], tagline: 'Lighting up lives', description: 'Integrated power' },
  { slug: 'exxonmobil', name: 'ExxonMobil', industry: 'Oil & Gas', headquarters: 'Irving, USA', status: 'public', competitors: ['aramco','shell'], categories: ['Oil','Gas'], tagline: 'Energy lives here', description: 'Oil and gas giant' },
  { slug: 'aramco', name: 'Saudi Aramco', industry: 'Oil & Gas', headquarters: 'Dhahran, Saudi Arabia', status: 'public', valuation: '$1.8T', competitors: ['exxonmobil'], categories: ['Oil','Gas'], tagline: 'Energy for the world', description: 'Largest oil company' },

  // Defense
  { slug: 'palantir', name: 'Palantir', industry: 'Defense Tech', headquarters: 'Denver, USA', status: 'public', competitors: ['anduril','lockheed'], categories: ['Data Analytics','Defense'], tagline: 'Powering the future of intelligence', description: 'Defense data analytics' },
  { slug: 'anduril', name: 'Anduril', industry: 'Defense Tech', headquarters: 'Costa Mesa, USA', founded: 2017, status: 'private', valuation: '$14B', competitors: ['palantir','lockheed'], categories: ['Autonomous','Defense'], tagline: 'Rebuilding western military', description: 'Autonomous defense systems' },
  { slug: 'lockheed', name: 'Lockheed Martin', industry: 'Defense', headquarters: 'Bethesda, USA', status: 'public', competitors: ['boeing','raytheon'], categories: ['Aerospace','Defense'], tagline: 'Your mission is ours', description: 'Aerospace and defense' },
  { slug: 'hal', name: 'Hindustan Aeronautics', industry: 'Defense', headquarters: 'Bengaluru, India', status: 'public', competitors: ['lockheed'], categories: ['Aerospace','India'], tagline: 'Air power for a strong nation', description: 'Indias aerospace giant' },

  // Space
  { slug: 'spacex', name: 'SpaceX', industry: 'Space', headquarters: 'Hawthorne, USA', founded: 2002, valuation: '$350B', status: 'private', competitors: ['rocket-lab','isro'], categories: ['Launch','Satellites'], tagline: 'Making humanity multi-planetary', description: 'Reusable rockets and Starlink' },
  { slug: 'isro', name: 'ISRO', industry: 'Space', headquarters: 'Bengaluru, India', founded: 1969, status: 'government', competitors: ['spacex','nasa'], categories: ['Launch','India'], tagline: 'Space technology for national development', description: 'Indian space agency' },
  { slug: 'rocket-lab', name: 'Rocket Lab', industry: 'Space', headquarters: 'Long Beach, USA', status: 'public', competitors: ['spacex'], categories: ['Launch','Small Satellites'], tagline: 'Frequent, reliable access to space', description: 'Small satellite launcher' },
  { slug: 'skyroot', name: 'Skyroot Aerospace', industry: 'Space', headquarters: 'Hyderabad, India', founded: 2018, status: 'private', competitors: ['agnikul','rocket-lab'], categories: ['Launch','India'], tagline: 'Opening space for all', description: 'Indian private space company' },

  // Healthcare / Biotech
  { slug: 'moderna', name: 'Moderna', industry: 'Biotech', headquarters: 'Cambridge, USA', status: 'public', competitors: ['pfizer','biontech'], categories: ['mRNA','Vaccines'], tagline: 'Medicines for a new era', description: 'mRNA vaccines and therapeutics' },
  { slug: 'novo-nordisk', name: 'Novo Nordisk', industry: 'Pharmaceuticals', headquarters: 'Bagsvaerd, Denmark', valuation: '$400B', status: 'public', competitors: ['eli-lilly'], categories: ['Diabetes','Obesity'], tagline: 'Driving change to defeat diabetes', description: 'Ozempic maker' },
  { slug: 'sun-pharma', name: 'Sun Pharmaceutical', industry: 'Pharmaceuticals', headquarters: 'Mumbai, India', status: 'public', competitors: ['dr-reddys','cipla'], categories: ['Generics','India'], tagline: 'Reaching people, touching lives', description: 'Indias largest pharma' },
  { slug: 'serum-institute', name: 'Serum Institute', industry: 'Biotech', headquarters: 'Pune, India', status: 'private', competitors: ['bharat-biotech'], categories: ['Vaccines','India'], tagline: 'Health for all', description: 'Worlds largest vaccine maker' },

  // EV / Mobility
  { slug: 'tesla', name: 'Tesla', industry: 'Electric Vehicles', headquarters: 'Austin, USA', valuation: '$1.1T', status: 'public', competitors: ['byd','tata-motors'], categories: ['EV','Energy'], tagline: 'Accelerating sustainable energy', description: 'EV and energy pioneer' },
  { slug: 'byd', name: 'BYD', industry: 'Electric Vehicles', headquarters: 'Shenzhen, China', status: 'public', competitors: ['tesla'], categories: ['EV','Batteries'], tagline: 'Build your dreams', description: 'Worlds largest EV maker' },
  { slug: 'ola-electric', name: 'Ola Electric', industry: 'Electric Vehicles', headquarters: 'Bengaluru, India', status: 'public', competitors: ['ather','tvs'], categories: ['EV','India'], tagline: 'End ICE age', description: 'Indian EV scooters' },
  { slug: 'tata-motors', name: 'Tata Motors', industry: 'Automotive', headquarters: 'Mumbai, India', status: 'public', competitors: ['mahindra','ola-electric'], categories: ['Auto','EV','India'], tagline: 'Connecting aspirations', description: 'Auto with EV push' },

  // Finance
  { slug: 'jpmorgan', name: 'JPMorgan Chase', industry: 'Finance', headquarters: 'New York, USA', status: 'public', competitors: ['goldman-sachs'], categories: ['Banking','Investment'], tagline: 'The way forward', description: 'Largest US bank' },
  { slug: 'goldman-sachs', name: 'Goldman Sachs', industry: 'Finance', headquarters: 'New York, USA', status: 'public', competitors: ['jpmorgan'], categories: ['Investment Banking'], tagline: 'Progress is everyones business', description: 'Investment banking' },
  { slug: 'hdfc-bank', name: 'HDFC Bank', industry: 'Finance', headquarters: 'Mumbai, India', status: 'public', competitors: ['icici','sbi'], categories: ['Banking','India'], tagline: 'We understand your world', description: 'Indias largest private bank' },
  { slug: 'zerodha', name: 'Zerodha', industry: 'Fintech', headquarters: 'Bengaluru, India', status: 'private', competitors: ['groww','upstox'], categories: ['Brokerage','India'], tagline: 'Making markets accessible', description: 'Indias largest broker' }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  for (const company of COMPANIES) {
    await Company.findOneAndUpdate(
      { slug: company.slug },
      company,
      { upsert: true, new: true }
    );
    console.log(`✓ Seeded ${company.name}`);
  }

  console.log(`\n${COMPANIES.length} companies seeded successfully`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});