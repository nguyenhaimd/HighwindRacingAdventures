
import React from 'react';
import { ProcessedRaceData, RaceCategory } from '../types';
import { Trophy, Timer, Calendar } from 'lucide-react';

interface PersonalBestsProps {
  data: ProcessedRaceData[];
}

const DISTANCE_ORDER = [
  RaceCategory.ONE_MILE,
  RaceCategory.THREE_K,
  RaceCategory.TWO_MILE,
  RaceCategory.FIVE_K,
  RaceCategory.FIVE_MILE,
  RaceCategory.EIGHT_K,
  RaceCategory.TEN_K,
  RaceCategory.TEN_MILE,
  RaceCategory.HALF,
  RaceCategory.METRIC_MARATHON,
  RaceCategory.MARATHON,
  RaceCategory.ULTRA_50_K,
  RaceCategory.ULTRA_50_MILE,
  RaceCategory.ULTRA_100_MILE
];

const PersonalBests: React.FC<PersonalBestsProps> = ({ data }) => {
  const bests = DISTANCE_ORDER.map(category => {
    const races = data.filter(r => r.category === category && r.totalMinutes > 0);
    if (races.length === 0) return null;
    
    // Sort by time ascending
    const pb = races.sort((a, b) => a.totalMinutes - b.totalMinutes)[0];
    
    return {
      category: pb.distanceLabel,
      race: pb
    };
  }).filter(Boolean);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800 flex items-center">
        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
        Personal Bests
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {bests.map((item) => (
          <div key={item!.category} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 transition hover:shadow-md relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                        {item!.category}
                    </span>
                    <span className="text-2xl font-bold text-slate-800 tracking-tight">
                        {item!.race.time}
                    </span>
                </div>
                
                <h4 className="text-sm font-medium text-slate-600 line-clamp-1 mb-1" title={item!.race.event}>
                    {item!.race.event}
                </h4>
                
                <div className="flex items-center text-xs text-slate-400 mt-2 space-x-3">
                    <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {item!.race.date}
                    </div>
                    <div className="flex items-center">
                        <Timer className="w-3 h-3 mr-1" />
                        {item!.race.pace}/mi
                    </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalBests;
