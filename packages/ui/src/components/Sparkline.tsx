interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  className?: string;
}

/** Minimalist line chart, used in stat tiles and trending widgets. */
export function Sparkline({
  values,
  width = 120,
  height = 32,
  stroke = '#7c5cff',
  className,
}: SparklineProps) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={className}>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
