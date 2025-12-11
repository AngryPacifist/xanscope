type SparklineProps = {
  values: number[];
  accent?: string;
};

export function Sparkline({
  values,
  accent = "rgb(94, 234, 212)",
}: SparklineProps) {
  if (!values.length) {
    return null;
  }

  const width = 160;
  const height = 60;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-12 w-full"
      role="img"
      aria-label="sparkline chart"
    >
      <polyline
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
