import { useId } from 'react';

export interface HexAxis {
  label: string;
  value: number; // 0–1
}

interface HexProps {
  axes: HexAxis[]; // 6 axes ideally
  size?: number;
  className?: string;
}

/**
 * Hexagonal radar chart used in "Your Emotional Profile". Pure SVG, no chart
 * library. 6 axes by default; renders a regular polygon and the value polygon
 * filled with the accent color.
 */
export function Hex({ axes, size = 240, className }: HexProps) {
  const gradientId = useId();
  const n = Math.max(axes.length, 3);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 28;

  // Top-vertex hexagon: rotate so the first axis is at the top.
  const angleFor = (i: number): number => (2 * Math.PI * i) / n - Math.PI / 2;
  const pointAt = (i: number, r: number): [number, number] => [
    cx + Math.cos(angleFor(i)) * r,
    cy + Math.sin(angleFor(i)) * r,
  ];

  const ringRadii = [0.25, 0.5, 0.75, 1].map((r) => r * radius);
  const valuePoints = axes
    .map((a, i) => {
      const v = Math.min(Math.max(a.value, 0), 1);
      const [x, y] = pointAt(i, v * radius);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Emotional profile radar"
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c5cff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7c5cff" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* concentric ring grid */}
      {ringRadii.map((r, ri) => {
        const pts = Array.from({ length: n }, (_, i) => pointAt(i, r).join(',')).join(' ');
        return (
          <polygon
            key={ri}
            points={pts}
            fill="none"
            stroke="#26262a"
            strokeWidth={ri === ringRadii.length - 1 ? 1.5 : 1}
          />
        );
      })}

      {/* axis spokes */}
      {axes.map((_, i) => {
        const [x, y] = pointAt(i, radius);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#26262a" strokeWidth={1} />;
      })}

      {/* filled value polygon */}
      <polygon
        points={valuePoints}
        fill={`url(#${gradientId})`}
        stroke="#7c5cff"
        strokeWidth={2}
      />
      {/* value dots */}
      {axes.map((a, i) => {
        const v = Math.min(Math.max(a.value, 0), 1);
        const [x, y] = pointAt(i, v * radius);
        return <circle key={`d-${i}`} cx={x} cy={y} r={3} fill="#9b85ff" />;
      })}

      {/* axis labels */}
      {axes.map((a, i) => {
        const [x, y] = pointAt(i, radius + 16);
        return (
          <text
            key={`l-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#8e8e94"
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
