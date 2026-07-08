"use client";

import type { TrendPoint } from "@repopulse/core";

type GrowthChartLabels = {
  stars: string;
  forks: string;
  downloads: string;
};

type TrafficChartLabels = {
  views: string;
  clones: string;
};

const chart = { width: 560, height: 260, left: 42, right: 16, top: 18, bottom: 38 };
const plotWidth = chart.width - chart.left - chart.right;
const plotHeight = chart.height - chart.top - chart.bottom;

export function GrowthChart({ data, labels }: { data: TrendPoint[]; labels?: GrowthChartLabels }) {
  const max = maxValue(data, ["stars", "forks", "downloads"]);
  return (
    <ChartFrame>
      <Axis data={data} max={max} />
      <Polyline data={data} max={max} dataKey="stars" color="#f59e0b" />
      <Polyline data={data} max={max} dataKey="forks" color="#8b5cf6" />
      <Polyline data={data} max={max} dataKey="downloads" color="#14b8a6" />
      <Legend items={[{ label: labels?.stars, color: "#f59e0b" }, { label: labels?.forks, color: "#8b5cf6" }, { label: labels?.downloads, color: "#14b8a6" }]} />
    </ChartFrame>
  );
}

export function TrafficChart({ data, labels }: { data: TrendPoint[]; labels?: TrafficChartLabels }) {
  const max = maxValue(data, ["views", "clones"]);
  const groupWidth = plotWidth / Math.max(data.length, 1);
  const barWidth = Math.max(4, Math.min(10, groupWidth / 3));

  return (
    <ChartFrame>
      <Axis data={data} max={max} />
      {data.map((point, index) => {
        const baseX = chart.left + index * groupWidth + groupWidth / 2 - barWidth;
        return (
          <g key={point.date}>
            <BarShape x={baseX} value={point.views} max={max} width={barWidth} color="#ec4899" />
            <BarShape x={baseX + barWidth + 2} value={point.clones} max={max} width={barWidth} color="#2563eb" />
          </g>
        );
      })}
      <Legend items={[{ label: labels?.views, color: "#ec4899" }, { label: labels?.clones, color: "#2563eb" }]} />
    </ChartFrame>
  );
}

export function DownloadsAreaChart({ data, label }: { data: TrendPoint[]; label?: string }) {
  const max = maxValue(data, ["downloads"]);
  const points = linePoints(data, max, "downloads");
  const area = points ? `${chart.left},${chart.top + plotHeight} ${points} ${chart.left + plotWidth},${chart.top + plotHeight}` : "";

  return (
    <ChartFrame>
      <Axis data={data} max={max} />
      {area ? <polygon points={area} fill="#ccfbf1" /> : null}
      <Polyline data={data} max={max} dataKey="downloads" color="#14b8a6" />
      <Legend items={[{ label, color: "#14b8a6" }]} />
    </ChartFrame>
  );
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <svg className="h-[260px] min-w-[560px] w-full" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img">
        {children}
      </svg>
    </div>
  );
}

function Axis({ data, max }: { data: TrendPoint[]; max: number }) {
  const first = data[0]?.date.slice(5);
  const last = data[data.length - 1]?.date.slice(5);

  return (
    <g>
      {[0, 0.5, 1].map((ratio) => {
        const y = chart.top + plotHeight * ratio;
        return <line key={ratio} x1={chart.left} x2={chart.left + plotWidth} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />;
      })}
      <text x={chart.left - 8} y={chart.top + 4} textAnchor="end" className="fill-slate-400 text-[11px]">{max}</text>
      <text x={chart.left - 8} y={chart.top + plotHeight + 4} textAnchor="end" className="fill-slate-400 text-[11px]">0</text>
      <text x={chart.left} y={chart.height - 10} className="fill-slate-400 text-[11px]">{first}</text>
      <text x={chart.left + plotWidth} y={chart.height - 10} textAnchor="end" className="fill-slate-400 text-[11px]">{last}</text>
    </g>
  );
}

function Polyline({ data, max, dataKey, color }: { data: TrendPoint[]; max: number; dataKey: keyof TrendPoint; color: string }) {
  const points = linePoints(data, max, dataKey);
  return points ? <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> : null;
}

function BarShape({ x, value, max, width, color }: { x: number; value: number; max: number; width: number; color: string }) {
  const height = max === 0 ? 0 : (value / max) * plotHeight;
  return <rect x={x} y={chart.top + plotHeight - height} width={width} height={height} rx="3" fill={color} />;
}

function Legend({ items }: { items: Array<{ label?: string; color: string }> }) {
  return (
    <g>
      {items.filter((item) => item.label).map((item, index) => (
        <g key={`${item.label}-${item.color}`} transform={`translate(${chart.left + index * 104}, ${chart.top - 6})`}>
          <circle r="4" fill={item.color} />
          <text x="10" y="4" className="fill-slate-500 text-[11px]">{item.label}</text>
        </g>
      ))}
    </g>
  );
}

function linePoints(data: TrendPoint[], max: number, dataKey: keyof TrendPoint) {
  if (data.length === 0) return "";
  return data.map((point, index) => {
    const x = chart.left + (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
    const value = Number(point[dataKey]) || 0;
    const y = chart.top + plotHeight - (max === 0 ? 0 : (value / max) * plotHeight);
    return `${x},${y}`;
  }).join(" ");
}

function maxValue(data: TrendPoint[], keys: Array<keyof TrendPoint>) {
  return Math.max(1, ...data.flatMap((point) => keys.map((key) => Number(point[key]) || 0)));
}
