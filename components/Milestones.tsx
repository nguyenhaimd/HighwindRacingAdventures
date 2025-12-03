
import React from 'react';
import { ProcessedRaceData, RaceCategory } from '../types';
import { Flag, Trophy, Medal, Footprints, Star } from 'lucide-react';

interface MilestonesProps {
  data: ProcessedRaceData[];
}

interface MilestoneEvent {
  title: string;
  date: string;
  eventName: string;
  icon: React.ElementType;
  color: string;
  dateObj: Date;
}

const Milestones: React.FC<MilestonesProps> = ({ data }) => {
  // Sort data chronologically (oldest first)
  const sortedData = [...data].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  
  const milestones: MilestoneEvent[] = [];

  if (sortedData.length > 0) {
    // 1. First Race
    milestones.push({
      title: 'The Journey Begins',
      date: sortedData[0].date,
      eventName: sortedData[0].event,
      icon: Flag,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
      dateObj: sortedData[0].dateObj
    });

    let totalMiles = 0;
    let hasMarathon = false;
    let hasUltra = false;
    let hasHalf = false;
    const mileMarkers = [100, 500, 1000, 2000, 5000];
    const reachedMarkers = new Set<number>();

    sortedData.forEach((race, index) => {
      totalMiles += race.distanceMiles;

      // Distance Milestones
      mileMarkers.forEach(marker => {
        if (totalMiles >= marker && !reachedMarkers.has(marker)) {
          milestones.push({
            title: `${marker} Mile Club`,
            date: race.date,
            eventName: `Crossed at ${race.event}`,
            icon: Footprints,
            color: 'text-blue-500 bg-blue-50 border-blue-100',
            dateObj: race.dateObj
          });
          reachedMarkers.add(marker);
        }
      });

      // Category Firsts
      if (!hasHalf && race.category === RaceCategory.HALF) {
         milestones.push({
            title: 'First Half Marathon',
            date: race.date,
            eventName: race.event,
            icon: Medal,
            color: 'text-amber-500 bg-amber-50 border-amber-100',
            dateObj: race.dateObj
         });
         hasHalf = true;
      }

      if (!hasMarathon && race.category === RaceCategory.MARATHON) {
        milestones.push({
          title: 'First Marathon',
          date: race.date,
          eventName: race.event,
          icon: Trophy,
          color: 'text-purple-500 bg-purple-50 border-purple-100',
          dateObj: race.dateObj
        });
        hasMarathon = true;
      }

      if (!hasUltra && (race.category.includes('Ultra') || race.category.includes('50K') || race.category.includes('50 Miler'))) {
        milestones.push({
          title: 'Ultra Runner Status',
          date: race.date,
          eventName: race.event,
          icon: Star,
          color: 'text-rose-500 bg-rose-50 border-rose-100',
          dateObj: race.dateObj
        });
        hasUltra = true;
      }

      // Race Count Milestones
      if (index + 1 === 50) {
         milestones.push({
            title: '50th Race',
            date: race.date,
            eventName: race.event,
            icon: Medal,
            color: 'text-indigo-500 bg-indigo-50 border-indigo-100',
            dateObj: race.dateObj
         });
      }
      if (index + 1 === 100) {
        milestones.push({
           title: '100th Race Hall of Fame',
           date: race.date,
           eventName: race.event,
           icon: Trophy,
           color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
           dateObj: race.dateObj
        });
     }
    });
  }

  // Sort milestones newest first for display
  const displayMilestones = milestones.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
         <Star className="w-5 h-5 mr-2 text-yellow-500" />
         Journey Milestones
      </h3>
      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {displayMilestones.map((m, idx) => {
            const Icon = m.icon;
            return (
                <div key={idx} className="flex items-start p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className={`p-2 rounded-lg shrink-0 mr-3 border ${m.color}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">{m.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">{m.date}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{m.eventName}</p>
                    </div>
                </div>
            );
        })}
        {displayMilestones.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-10">Start racing to unlock milestones!</p>
        )}
      </div>
    </div>
  );
};

export default Milestones;
