"use client";

import type { TrendPoint } from "@repopulse/core";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type GrowthChartLabels = {
  stars: string;
  forks: string;
  downloads: string;
};

type TrafficChartLabels = {
  views: string;
  clones: string;
};

export function GrowthChart({ data, labels }: { data: TrendPoint[]; labels?: GrowthChartLabels }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="stars" name={labels?.stars} stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="forks" name={labels?.forks} stroke="#8b5cf6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="downloads" name={labels?.downloads} stroke="#14b8a6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrafficChart({ data, labels }: { data: TrendPoint[]; labels?: TrafficChartLabels }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="views" name={labels?.views} fill="#ec4899" radius={[4, 4, 0, 0]} />
        <Bar dataKey="clones" name={labels?.clones} fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DownloadsAreaChart({ data, label }: { data: TrendPoint[]; label?: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip />
        <Area type="monotone" dataKey="downloads" name={label} stroke="#14b8a6" fill="#ccfbf1" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
