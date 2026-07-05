import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import './KnowledgeGraph.css';

const API = 'https://aerth-intelligence-os.onrender.comgence-os.onrender.com/api';

const TYPE_COLORS = {
  company: '#A8A69C',
  trend: '#4A7A55',
  opportunity: '#8A6A35',
  domain: '#6B9575',
  signal: '#7A3838'
};

const TYPE_LABELS = {
  company: 'Companies',
  trend: 'Trends',
  opportunity: 'Opportunities',
  domain: 'Domains',
  signal: 'Signals'
};

export default function KnowledgeGraph() {
  const [data, setData] = useState({ nodes: [], links: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filters, setFilters] = useState({
    company: true,
    trend: true,
    opportunity: true,
    domain: true
  });
  const fgRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/graph`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredData = {
    nodes: data.nodes.filter(n => filters[n.type]),
    links: data.links.filter(l => {
      const srcType = (typeof l.source === 'object' ? l.source.type : data.nodes.find(n => n.id === l.source)?.type);
      const tgtType = (typeof l.target === 'object' ? l.target.type : data.nodes.find(n => n.id === l.target)?.type);
      return filters[srcType] && filters[tgtType];
    })
  };

  const toggleFilter = (type) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 800);
      fgRef.current.zoom(3, 800);
    }
  }, []);

  const navigateToNode = () => {
    if (!selectedNode) return;
    const [type, slug] = selectedNode.id.split(':');
    if (type === 'company') navigate(`/companies/${slug}`);
    else if (type === 'trend') navigate(`/trends/${slug}`);
    else if (type === 'opportunity') navigate(`/opportunities`);
    else if (type === 'domain') navigate(`/world-intelligence`);
  };

  const drawNode = (node, ctx, globalScale) => {
    const label = node.label || node.id;
    const fontSize = 12 / globalScale;
    const nodeSize = node.val || 6;
    const color = TYPE_COLORS[node.type] || '#888';

    // Glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 15 / globalScale;

    // Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Label (only if zoomed in enough)
    if (globalScale > 1.5) {
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#E4DFD1';
      ctx.fillText(label.length > 25 ? label.slice(0, 25) + '…' : label, node.x, node.y + nodeSize + 2);
    }
  };

  return (
    <div className="kg">
      <header className="kg__header">
        <span className="kg__label">ENTITY RELATIONSHIP GRAPH</span>
        <h1 className="kg__title">Knowledge Graph</h1>
        <p className="kg__subtitle">
          Every company, trend, opportunity, and macro domain in AERTH — connected. Drag to reposition, scroll to zoom, click to inspect.
        </p>
      </header>

      {loading ? (
        <div className="kg__loading">Building intelligence graph...</div>
      ) : (
        <>
          {/* Stats bar */}
          <div className="kg__stats">
            <div className="kg-stat"><span>{data.stats.nodeCount}</span> Nodes</div>
            <div className="kg-stat"><span>{data.stats.linkCount}</span> Connections</div>
            <div className="kg-stat"><span>{data.stats.companies}</span> Companies</div>
            <div className="kg-stat"><span>{data.stats.trends}</span> Trends</div>
            <div className="kg-stat"><span>{data.stats.opportunities}</span> Opportunities</div>
            <div className="kg-stat"><span>{data.stats.domains}</span> Domains</div>
          </div>

          {/* Filter chips */}
          <div className="kg__filters">
            {Object.keys(TYPE_LABELS).filter(t => t !== 'signal').map(type => (
              <button
                key={type}
                className={`kg-chip ${filters[type] ? 'kg-chip--active' : ''}`}
                onClick={() => toggleFilter(type)}
                style={filters[type] ? { borderColor: TYPE_COLORS[type], color: TYPE_COLORS[type] } : {}}
              >
                <span className="kg-chip__dot" style={{ background: TYPE_COLORS[type] }} />
                {TYPE_LABELS[type]}
              </button>
            ))}
          </div>

          <div className="kg__body">
            <div className="kg__canvas">
              <ForceGraph2D
                ref={fgRef}
                graphData={filteredData}
                nodeCanvasObject={drawNode}
                nodeLabel={n => `${n.label} (${n.type})`}
                linkColor={() => 'rgba(168, 166, 156, 0.15)'}
                linkWidth={0.6}
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={1.5}
                linkDirectionalParticleSpeed={0.004}
                linkDirectionalParticleColor={() => 'rgba(74, 122, 85, 0.6)'}
                backgroundColor="#0C0D10"
                width={900}
                height={620}
                onNodeClick={handleNodeClick}
                cooldownTicks={200}
                d3AlphaDecay={0.02}
              />
            </div>

            <aside className="kg__inspector">
              {selectedNode ? (
                <>
                  <div className="kg-node-info">
                    <span className="kg-node-info__type" style={{ color: TYPE_COLORS[selectedNode.type] }}>
                      {selectedNode.type.toUpperCase()}
                    </span>
                    <h3 className="kg-node-info__label">{selectedNode.label}</h3>

                    <div className="kg-node-info__meta">
                      {selectedNode.category && (
                        <div className="kg-meta"><span>Category</span><b>{selectedNode.category}</b></div>
                      )}
                      {selectedNode.sector && (
                        <div className="kg-meta"><span>Sector</span><b>{selectedNode.sector}</b></div>
                      )}
                      {selectedNode.momentum !== undefined && (
                        <div className="kg-meta"><span>Momentum</span><b>{selectedNode.momentum}</b></div>
                      )}
                      {selectedNode.score !== undefined && (
                        <div className="kg-meta"><span>Score</span><b>{selectedNode.score}</b></div>
                      )}
                      {selectedNode.count !== undefined && (
                        <div className="kg-meta"><span>Signals</span><b>{selectedNode.count}</b></div>
                      )}
                    </div>

                    <button className="kg-node-info__nav" onClick={navigateToNode}>
                      Open full view →
                    </button>
                  </div>
                </>
              ) : (
                <div className="kg-inspector-empty">
                  <p className="kg-inspector-empty__hint">Click any node to inspect.</p>
                  <div className="kg-legend">
                    <span className="kg-legend__title">LEGEND</span>
                    {Object.entries(TYPE_COLORS).filter(([k]) => k !== 'signal').map(([type, color]) => (
                      <div key={type} className="kg-legend__item">
                        <span className="kg-legend__dot" style={{ background: color }} />
                        <span>{TYPE_LABELS[type]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </>
      )}
    </div>
  );
}