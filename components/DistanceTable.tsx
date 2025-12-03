
import React from 'react';
import { ProcessedRaceData } from '../types';

interface DistanceTableProps {
  data: ProcessedRaceData[];
}

const DistanceTable: React.FC<DistanceTableProps> = ({ data }) => {
  const stats = data.reduce((acc, race) => {
    acc[race.distanceLabel] = (acc[race.distanceLabel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedStats = Object.entries(stats)
    .sort((a, b) => b[1] - a[1]); // Sort by count descending

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-800">Race Counts by Distance</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {sortedStats.map(([label, count]) => (
             <div key={label} className="flex flex-col items-center p-3 bg-slate-50 rounded-lg border border-slate-100 transition hover:bg-blue-50 hover:border-blue-100">
                <span className="text-2xl font-bold text-blue-600">{count}</span>
                <span className="text-xs font-medium text-slate-500 text-center">{label}</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DistanceTable;
