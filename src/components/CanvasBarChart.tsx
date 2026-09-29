import React, { useEffect, useRef } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface CanvasBarChartProps {
  data: DataPoint[];
  height?: number;
}

export const CanvasBarChart: React.FC<CanvasBarChartProps> = ({ data, height = 160 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const chartHeight = rect.height;

    // Clear background
    ctx.clearRect(0, 0, width, chartHeight);

    const paddingBottom = 28;
    const paddingTop = 14;
    const availableHeight = chartHeight - paddingBottom - paddingTop;
    const maxValue = Math.max(...data.map(d => d.value), 100);

    const barCount = data.length;
    const barWidth = Math.min(36, (width / barCount) * 0.55);
    const spacing = (width - (barCount * barWidth)) / (barCount + 1);

    // Draw grid baseline
    ctx.beginPath();
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1;
    ctx.moveTo(10, chartHeight - paddingBottom);
    ctx.lineTo(width - 10, chartHeight - paddingBottom);
    ctx.stroke();

    // Draw bars matching Jetpack Compose Canvas logic
    data.forEach((item, index) => {
      const x = spacing + index * (barWidth + spacing);
      const barHeight = (item.value / maxValue) * availableHeight;
      const y = chartHeight - paddingBottom - barHeight;

      // Primary gradient for the bar (Yellow for latest month, Purple for previous)
      const isLatest = index === data.length - 1;
      const barColor = isLatest ? '#F4B400' : '#7B1FA2';
      const topGlowColor = isLatest ? '#FFE082' : '#BA68C8';

      // Rounded rectangle path
      const radius = 6;
      ctx.beginPath();
      ctx.fillStyle = barColor;
      ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
      ctx.fill();

      // Top highlight strip
      ctx.beginPath();
      ctx.fillStyle = topGlowColor;
      ctx.roundRect(x, y, barWidth, 3, [radius, radius, 0, 0]);
      ctx.fill();

      // Value label on top of bar
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.value}`, x + barWidth / 2, y - 5);

      // Month text below bar
      ctx.fillStyle = isLatest ? '#F4B400' : '#9E9E9E';
      ctx.font = isLatest ? 'bold 11px Plus Jakarta Sans, sans-serif' : '500 11px Plus Jakarta Sans, sans-serif';
      ctx.fillText(item.label, x + barWidth / 2, chartHeight - 8);
    });
  }, [data, height]);

  return (
    <div className="w-full relative" style={{ height }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
