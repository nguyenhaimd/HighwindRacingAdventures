import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LabelList
} from 'recharts';
import { ProcessedRaceData } from '../types';
import { formatPace } from '../utils';

interface ChartsProps {
  data: ProcessedRaceData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f97316'];

// --- HELPERS ---

const getDayOfYear = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// --- EXISTING CHARTS ---

export const RacesPerYearChart: React.FC<ChartsProps> = ({ data }) => {
  const racesPerYear = data.reduce((acc, race) => {
    acc[race.year] = (acc[race.year] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const chartData = Object.entries(racesPerYear)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Racing Frequency</h3>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
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

export const DistanceDistributionChart: React.FC<ChartsProps> = ({ data }) => {
  const distribution = data.reduce((acc, race) => {
    acc[race.distanceLabel] = (acc[race.distanceLabel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Events by Distance (Distribution)</h3>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              iconType="circle" 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const DistanceBarChart: React.FC<ChartsProps> = ({ data }) => {
  const distribution = data.reduce((acc, race) => {
    acc[race.distanceLabel] = (acc[race.distanceLabel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Race Counts by Distance</h3>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} 
              width={90}
              interval={0}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24}>
               <LabelList dataKey="value" position="right" fill="#64748b" fontSize={12} fontWeight={600} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const CumulativeMilesChart: React.FC<ChartsProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  
  let total = 0;
  const chartData = sortedData.map(race => {
    total += race.distanceMiles;
    return {
      date: race.dateObj.getTime(),
      dateStr: race.date,
      totalMiles: Math.round(total)
    };
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Cumulative Racing Miles</h3>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorMiles" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              type="number" 
              domain={['dataMin', 'dataMax']} 
              tickFormatter={(unixTime) => new Date(unixTime).getFullYear().toString()}
              tick={{ fill: '#64748b', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip 
               labelFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
               contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="totalMiles" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#colorMiles)" 
              name="Total Miles"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const PerformanceScatterChart: React.FC<ChartsProps> = ({ data }) => {
  const categories = Array.from(new Set(data.map(d => d.distanceLabel)));
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Matrix (Pace vs Date)</h3>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="dateObj" 
              name="Date"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(unixTime: number) => new Date(unixTime).getFullYear().toString()}
              tick={{ fill: '#64748b', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false}
            />
            <YAxis 
              dataKey="paceSeconds" 
              name="Pace" 
              tickFormatter={(val) => formatPace(val)}
              reversed={true} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <ZAxis range={[60, 60]} /> 
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white p-3 shadow-lg rounded-lg border border-slate-100 text-sm">
                      <p className="font-bold text-slate-800">{d.event}</p>
                      <p className="text-slate-500">{new Date(d.dateObj).toLocaleDateString()}</p>
                      <p className="text-blue-600 font-medium mt-1">Pace: {formatPace(d.paceSeconds)}/mi</p>
                      <p className="text-xs text-slate-400">{d.distanceLabel} • {d.time}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {categories.map((cat, index) => (
              <Scatter 
                key={cat} 
                name={cat} 
                data={data.filter(d => d.distanceLabel === cat)} 
                fill={COLORS[index % COLORS.length]} 
                shape="circle"
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SeasonalityRadarChart: React.FC<ChartsProps> = ({ data }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthCounts = data.reduce((acc, race) => {
    const monthIndex = race.dateObj.getMonth();
    acc[monthIndex] = (acc[monthIndex] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const chartData = months.map((month, index) => ({
    month,
    races: monthCounts[index] || 0
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Racing Seasonality</h3>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
            <Radar
              name="Races"
              dataKey="races"
              stroke="#ec4899"
              fill="#ec4899"
              fillOpacity={0.5}
            />
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const YearlyMileageChart: React.FC<ChartsProps> = ({ data }) => {
  const milesPerYear = data.reduce((acc, race) => {
    acc[race.year] = (acc[race.year] || 0) + race.distanceMiles;
    return acc;
  }, {} as Record<number, number>);

  const chartData = Object.entries(milesPerYear)
    .map(([year, miles]) => ({ year: parseInt(year), miles: Math.round(miles) }))
    .sort((a, b) => a.year - b.year);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Total Miles per Year</h3>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="miles" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Miles" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const AveragePaceByDistanceChart: React.FC<ChartsProps> = ({ data }) => {
  const stats = data.reduce((acc: Record<string, { sumPace: number; count: number; distance: number }>, race) => {
    if (race.paceSeconds > 0) {
      if (!acc[race.distanceLabel]) {
        acc[race.distanceLabel] = { sumPace: 0, count: 0, distance: race.distanceMiles };
      }
      acc[race.distanceLabel].sumPace += race.paceSeconds;
      acc[race.distanceLabel].count += 1;
    }
    return acc;
  }, {} as Record<string, { sumPace: number; count: number; distance: number }>);

  const chartData = Object.entries(stats)
    .map(([label, val]: [string, any]) => ({
      label,
      avgPace: val.sumPace / val.count,
      distance: val.distance
    }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Average Pace by Distance</h3>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
                dataKey="label" 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                axisLine={false} 
                tickLine={false} 
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
            />
            <YAxis 
                type="number" 
                domain={['dataMin - 30', 'dataMax + 30']} 
                tickFormatter={(val) => formatPace(val)}
                tick={{ fill: '#64748b', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false} 
            />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              formatter={(val: number) => [formatPace(val) + '/mi', 'Avg Pace']}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="avgPace" fill="#10b981" radius={[4, 4, 0, 0]} name="Avg Pace (min/mi)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- NEW STRAVA-STYLE CHARTS ---

export const YearlyProgressChart: React.FC<ChartsProps> = ({ data }) => {
  // 1. Get unique years, sort descending
  const years = (Array.from(new Set(data.map(d => d.year))) as number[]).sort((a: number, b: number) => b - a);
  // Compare top 5 most recent years
  const displayYears = years.slice(0, 5);

  // 2. Build data structure [ { day: 1, 2023: 10, 2024: 12 }, ... ]
  const chartData = Array.from({ length: 366 }, (_, i) => {
    const day = i + 1;
    const obj: any = { day };
    displayYears.forEach(y => obj[y] = 0);
    return obj;
  });

  // 3. Fill cumulative miles
  displayYears.forEach(year => {
    const yearRaces = data.filter(d => d.year === year).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    let cumulative = 0;
    
    // Create a map for quick lookup: dayOfYear -> miles
    const milesByDay: Record<number, number> = {};
    yearRaces.forEach(r => {
      const d = getDayOfYear(r.dateObj);
      milesByDay[d] = (milesByDay[d] || 0) + r.distanceMiles;
    });

    const today = new Date();
    const currentDayOfYear = getDayOfYear(today);
    const isCurrentYear = year === today.getFullYear();

    for (let d = 1; d <= 366; d++) {
       if (milesByDay[d]) {
         cumulative += milesByDay[d];
       }
       
       // Stop plotting future dates for current year
       if (isCurrentYear && d > currentDayOfYear) {
         chartData[d-1][year] = null;
       } else {
         chartData[d-1][year] = Math.round(cumulative);
       }
    }
  });

  // Month ticks (approximate start of months)
  const monthTicks = [1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Yearly Progress Comparison</h3>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="day" 
              type="number"
              domain={[1, 366]}
              ticks={monthTicks}
              tickFormatter={(val: number) => {
                const d = new Date(2023, 0, val);
                return d.toLocaleString('default', { month: 'short' });
              }}
              tick={{ fill: '#64748b', fontSize: 11 }} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip 
               labelFormatter={(day) => {
                  const d = new Date(2023, 0, Number(day));
                  return d.toLocaleString('default', { month: 'long', day: 'numeric' });
               }}
               contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="top" height={36} iconType="plainline"/>
            {displayYears.map((year, i) => (
              <Line 
                key={year}
                type="monotone"
                dataKey={year}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={i === 0 ? 3 : 2} // Make most recent year thicker
                dot={false}
                activeDot={{ r: 4 }}
                strokeOpacity={i === 0 ? 1 : 0.6}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const PaceDistributionChart: React.FC<ChartsProps> = ({ data }) => {
  const buckets = [
    { label: '< 6:00', max: 360, count: 0 },
    { label: '6:00-7:00', max: 420, count: 0 },
    { label: '7:00-8:00', max: 480, count: 0 },
    { label: '8:00-9:00', max: 540, count: 0 },
    { label: '9:00-10:00', max: 600, count: 0 },
    { label: '10:00+', max: 9999, count: 0 },
  ];

  data.forEach(race => {
    if (race.paceSeconds > 0) {
      for (const bucket of buckets) {
        if (race.paceSeconds < bucket.max) {
          bucket.count++;
          break;
        }
      }
    }
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Pace Zones Distribution</h3>
      <div className="flex-grow min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={buckets}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Races">
               <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const MonthlyHeatmap: React.FC<ChartsProps> = ({ data }) => {
  const years = (Array.from(new Set(data.map(d => d.year))) as number[]).sort((a, b) => b - a);
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  // Data map: year -> monthIdx -> count
  const heatmapData: Record<number, Record<number, number>> = {};
  
  data.forEach(race => {
    const y = race.year;
    const m = race.dateObj.getMonth();
    if (!heatmapData[y]) heatmapData[y] = {};
    heatmapData[y][m] = (heatmapData[y][m] || 0) + 1;
  });

  const getColor = (count: number) => {
    if (!count) return 'bg-slate-100';
    if (count === 1) return 'bg-blue-200';
    if (count === 2) return 'bg-blue-400';
    return 'bg-blue-600';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Consistency</h3>
      <div className="flex-grow flex items-center justify-center overflow-auto">
        <div className="grid grid-cols-[auto_repeat(12,_minmax(0,_1fr))] gap-2">
          {/* Header Row */}
          <div className="h-6"></div> {/* Spacer for Year column */}
          {months.map((m, i) => (
            <div key={i} className="flex items-center justify-center text-xs font-bold text-slate-400 h-6">
              {m}
            </div>
          ))}

          {/* Data Rows */}
          {years.map(year => (
            <React.Fragment key={year}>
              <div className="text-xs font-medium text-slate-500 pr-2 flex items-center h-8">
                {year}
              </div>
              {Array.from({ length: 12 }).map((_, monthIdx) => {
                const count = heatmapData[year]?.[monthIdx] || 0;
                return (
                  <div 
                    key={monthIdx}
                    title={`${new Date(year, monthIdx).toLocaleString('default', { month: 'long' })} ${year}: ${count} Races`}
                    className={`h-8 w-full min-w-[20px] rounded-md transition-all hover:ring-2 hover:ring-blue-300 ${getColor(count)}`}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
       <div className="mt-4 flex items-center justify-end text-xs text-slate-500 space-x-2">
         <span>Less</span>
         <div className="flex space-x-1">
            <div className="w-3 h-3 bg-slate-100 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
         </div>
         <span>More</span>
       </div>
    </div>
  );
};