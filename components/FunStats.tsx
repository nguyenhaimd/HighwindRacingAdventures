import React from 'react';
import { ProcessedRaceData } from '../types';
import { Clock, Calendar, Medal, Globe } from 'lucide-react';

interface FunStatsProps {
  data: ProcessedRaceData[];
}

const FunStats: React.FC<FunStatsProps> = ({ data }) => {
  // 1. Calculate Total Time Spent Racing
  const totalMinutes = data.reduce((acc, curr) => acc + curr.totalMinutes, 0);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);

  // 2. Favorite Month
  const monthCounts = data.reduce((acc, race) => {
    const monthName = race.dateObj.toLocaleString('default', { month: 'long' });
    acc[monthName] = (acc[monthName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const favoriteMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0];

  // 3. Podium Finishes (Rough estimation based on strings like "1 of 50" or "3 of 200")
  let podiumCount = 0;
  data.forEach(race => {
    const checkPodium = (str: string) => {
        const match = str.match(/^(\d+)\s+of/);
        if (match && parseInt(match[1]) <= 3) return true;
        return false;
    };
    if (checkPodium(race.division) || checkPodium(race.gender) || checkPodium(race.overall)) {
        podiumCount++;
    }
  });

  // 4. Unique Locations
  const uniqueCities = new Set(data.map(r => r.location.split(',')[0].trim())).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Time Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Clock className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Time on Feet</p>
          <h4 className="text-3xl font-bold mt-2">{days}d {hours}h</h4>
          <p className="text-indigo-100 text-xs mt-1">Total time spent racing</p>
        </div>
      </div>

      {/* Season Card */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Calendar className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <p className="text-pink-100 text-sm font-medium uppercase tracking-wider">Peak Season</p>
          <h4 className="text-3xl font-bold mt-2">{favoriteMonth ? favoriteMonth[0] : 'N/A'}</h4>
          <p className="text-pink-100 text-xs mt-1">Most active month ({favoriteMonth ? favoriteMonth[1] : 0} races)</p>
        </div>
      </div>

      {/* Podium Card */}
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Medal className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <p className="text-amber-100 text-sm font-medium uppercase tracking-wider">Podium Finishes</p>
          <h4 className="text-3xl font-bold mt-2">{podiumCount}</h4>
          <p className="text-amber-100 text-xs mt-1">Top 3 in Div/Gender/Overall</p>
        </div>
      </div>

      {/* Traveler Card */}
      <div className="bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Globe className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <p className="text-teal-100 text-sm font-medium uppercase tracking-wider">Traveler</p>
          <h4 className="text-3xl font-bold mt-2">{uniqueCities}</h4>
          <p className="text-teal-100 text-xs mt-1">Unique cities visited</p>
        </div>
      </div>

    </div>
  );
};

export default FunStats;
