
import React from 'react';
import { ProcessedRaceData } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Globe, Mountain, Map, Anchor } from 'lucide-react';

interface Props {
  data: ProcessedRaceData[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// --- 1. Distance Equivalents Component ---

export const DistanceEquivalents: React.FC<Props> = ({ data }) => {
  const totalMiles = data.reduce((acc, r) => acc + r.distanceMiles, 0);

  // Constants
  const EARTH_CIRCUMFERENCE = 24901;
  const APPALACHIAN_TRAIL = 2190;
  const NY_TO_LA = 2790;
  const EVEREST_HEIGHT_MILES = 5.5; // Vertical miles, just for fun comparison concepts if we had elevation, but let's stick to distance.
  const MARATHON_DIST = 26.2;

  const items = [
    {
      label: 'Cross-Country Trips',
      subLabel: 'NY to LA (2,790 mi)',
      value: (totalMiles / NY_TO_LA).toFixed(2),
      icon: Map,
      color: 'text-blue-500 bg-blue-50'
    },
    {
      label: 'Appalachian Trails',
      subLabel: 'Full Thru-Hike (2,190 mi)',
      value: (totalMiles / APPALACHIAN_TRAIL).toFixed(2),
      icon: Mountain,
      color: 'text-emerald-500 bg-emerald-50'
    },
    {
      label: 'Equators Run',
      subLabel: 'Earth Circumference',
      value: (totalMiles / EARTH_CIRCUMFERENCE).toFixed(4),
      icon: Globe,
      color: 'text-indigo-500 bg-indigo-50'
    },
    {
      label: 'Total Marathons',
      subLabel: 'Distance Equivalent',
      value: (totalMiles / MARATHON_DIST).toFixed(1),
      icon: Anchor,
      color: 'text-rose-500 bg-rose-50'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Distance Perspectives</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
        {items.map((item, idx) => {
            const Icon = item.icon;
            return (
                <div key={idx} className="flex items-center p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className={`p-3 rounded-full mr-4 ${item.color}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{item.value}x</div>
                        <div className="text-sm font-semibold text-slate-600">{item.label}</div>
                        <div className="text-xs text-slate-400">{item.subLabel}</div>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

// --- 2. Weekday Analysis ---

export const WeekdayChart: React.FC<Props> = ({ data }) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const dayCounts = data.reduce((acc, race) => {
    const dayIndex = race.dateObj.getDay();
    acc[dayIndex] = (acc[dayIndex] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const chartData = days.map((day, index) => ({
    name: day,
    short: day.substring(0, 3),
    count: dayCounts[index] || 0
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Racing Days</h3>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="short" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Races" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- 3. Performance Tiers (Pie Chart) ---

export const PerformanceTiersChart: React.FC<Props> = ({ data }) => {
  const getPercentile = (str: string) => {
    const match = str.match(/(\d+)\s*(?:of|\/)\s*(\d+)/i);
    if (match) {
      const rank = parseInt(match[1]);
      const total = parseInt(match[2]);
      if (total > 0) return rank / total;
    }
    return null;
  };

  const buckets = {
    'Top 10%': 0,
    'Top 25%': 0,
    'Top 50%': 0,
    'Finisher': 0
  };

  let totalRanked = 0;

  data.forEach(race => {
    // Try Overall first, then Gender
    let pct = getPercentile(race.overall);
    if (pct === null) pct = getPercentile(race.gender);

    if (pct !== null) {
      totalRanked++;
      if (pct <= 0.10) buckets['Top 10%']++;
      else if (pct <= 0.25) buckets['Top 25%']++;
      else if (pct <= 0.50) buckets['Top 50%']++;
      else buckets['Finisher']++;
    }
  });

  const chartData = [
    { name: 'Top 10%', value: buckets['Top 10%'] },
    { name: 'Top 25%', value: buckets['Top 25%'] },
    { name: 'Top 50%', value: buckets['Top 50%'] },
    { name: 'Finisher', value: buckets['Finisher'] },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Tiers</h3>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend verticalAlign="bottom" height={36} iconType="circle"/>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-center text-slate-400 mt-2">Based on {totalRanked} races with rank data</p>
    </div>
  );
};
