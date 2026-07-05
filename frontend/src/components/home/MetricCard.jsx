// frontend/src/components/home/MetricCard.jsx

import './MetricCard.css';

export default function MetricCard({
  label, value, unit, trend, trendDirection, subtitle, valueStyle
}) {
  return (
    <div className="metric">
      <span className="metric__label">{label}</span>

      <div className="metric__value-row">
        <span className={`metric__value ${valueStyle === 'gold' ? 'metric__value--gold' : ''}`}>
          {value}
          {unit && <span className="metric__unit">{unit}</span>}
        </span>
        {trend && (
          <span className={`metric__trend metric__trend--${trendDirection}`}>
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>

      <MetricSparkline direction={trendDirection} valueStyle={valueStyle} />

      {subtitle && <span className="metric__subtitle">{subtitle}</span>}
    </div>
  );
}

function MetricSparkline({ direction, valueStyle }) {
  // Rising jagged pattern for up, falling for down, wavy for gold
  let points;
  if (valueStyle === 'gold') {
    points = [30, 35, 28, 40, 32, 45, 38, 42, 35, 48, 40, 44, 38, 50];
  } else if (direction === 'up') {
    points = [15, 18, 14, 22, 20, 28, 25, 32, 30, 38, 35, 42, 45, 52];
  } else {
    points = [50, 47, 52, 44, 48, 40, 42, 35, 38, 30, 32, 25, 22, 18];
  }

  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 200;
  const h = 56;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / (max - min)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  let color, glowColor;
  if (valueStyle === 'gold') {
    color = '#D6C08D';
    glowColor = 'rgba(214, 192, 141, 0.4)';
  } else if (direction === 'up') {
    color = '#6BAF77';
    glowColor = 'rgba(107, 175, 119, 0.45)';
  } else {
    color = '#C46B6B';
    glowColor = 'rgba(196, 107, 107, 0.4)';
  }

  const gradId = `spark-${valueStyle || direction}-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none" className="metric__spark">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
        <filter id={`glow-${gradId}`}>
          <feGaussianBlur stdDeviation="1" />
        </filter>
      </defs>

      {/* Fill */}
      <polygon
        points={`0,${h} ${coords} ${w},${h}`}
        fill={`url(#${gradId})`}
      />

      {/* Glow line underneath */}
      <polyline
        points={coords}
        fill="none"
        stroke={glowColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#glow-${gradId})`}
      />

      {/* Main crisp line */}
      <polyline
        points={coords}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}