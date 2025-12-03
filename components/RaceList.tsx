import React, { useState } from 'react';
import { ProcessedRaceData } from '../types';
import { Search, MapPin, Calendar, Timer, Trophy, Filter, Ruler, X, User, Users, Flag, ChevronRight } from 'lucide-react';

interface PlacementRowProps {
  label: string;
  value: string;
  icon: React.ElementType;
}

const PlacementRow: React.FC<PlacementRowProps> = ({ label, value, icon: Icon }) => {
  if (!value || value === '--' || value === '') return null;

  const getPercentile = (str: string) => {
    const match = str.match(/(\d+)\s*(?:of|\/)\s*(\d+)/i);
    if (match) {
      const rank = parseInt(match[1]);
      const total = parseInt(match[2]);
      if (total > 0) {
        const pct = Math.round((rank / total) * 100);
        return pct === 0 ? 'Top 1%' : `Top ${pct}%`;
      }
    }
    return null;
  };

  const percentile = getPercentile(value);

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
      <div className="flex items-center">
        <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 mr-3 text-slate-500">
           <Icon className="w-4 h-4" />
        </div>
        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
          <span className="font-mono font-bold text-slate-800">{value}</span>
        </div>
      </div>
      {percentile && (
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
          {percentile}
        </span>
      )}
    </div>
  );
};

interface RaceDetailsModalProps {
  race: ProcessedRaceData;
  onClose: () => void;
}

const RaceDetailsModal: React.FC<RaceDetailsModalProps> = ({ race, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shrink-0">
           <button 
             onClick={onClose} 
             className="absolute top-4 right-4 p-1 text-blue-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
           >
             <X className="w-6 h-6" />
           </button>
           
           <div className="pr-8">
             <div className="flex items-center space-x-2 text-blue-100 text-sm font-medium mb-2">
                <Calendar className="w-4 h-4" />
                <span>{race.date}</span>
                <span>•</span>
                <span>{race.year}</span>
             </div>
             <h3 className="text-2xl font-bold leading-tight">{race.event}</h3>
             <div className="flex items-center mt-3 text-blue-100 text-sm">
               <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
               <span className="truncate">{race.location}</span>
             </div>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
           
           {/* Primary Stats */}
           <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                 <span className="text-xs text-slate-500 uppercase font-bold mb-1">Time</span>
                 <span className="text-lg font-bold text-slate-800 font-mono">{race.time}</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                 <span className="text-xs text-slate-500 uppercase font-bold mb-1">Pace</span>
                 <span className="text-lg font-bold text-slate-800 font-mono">{race.pace}</span>
                 <span className="text-[10px] text-slate-400">/mi</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                 <span className="text-xs text-slate-500 uppercase font-bold mb-1">Distance</span>
                 <span className="text-lg font-bold text-slate-800">{race.distanceLabel}</span>
                 <span className="text-[10px] text-slate-400">{race.distanceMiles} mi</span>
              </div>
           </div>

           {/* Rankings Section */}
           {(race.overall !== '--' || race.gender !== '--' || race.division !== '--') && (
             <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-amber-500" />
                  Performance Rankings
                </h4>
                <div className="space-y-3">
                   <PlacementRow label="Overall Place" value={race.overall} icon={Users} />
                   <PlacementRow label="Gender Place" value={race.gender} icon={User} />
                   <PlacementRow label="Division Place" value={race.division} icon={Flag} />
                </div>
             </div>
           )}

           {/* Additional Info */}
           <div className="flex justify-between items-center text-xs text-slate-400 pt-4 border-t border-slate-100">
              <div>ID: {race.id}</div>
              <div>Category: {race.category}</div>
           </div>
        </div>
      </div>
    </div>
  );
};

interface RaceListProps {
  data: ProcessedRaceData[];
}

const RaceList: React.FC<RaceListProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedRace, setSelectedRace] = useState<ProcessedRaceData | null>(null);

  // Get unique categories for filter
  const categories = ['All', ...Array.from(new Set(data.map(d => d.category)))].sort();

  // Get unique years for filter (descending)
  const years = ['All', ...Array.from(new Set(data.map(d => d.year))).sort((a, b) => b - a)];

  const filteredData = data.filter(race => {
    const matchesSearch = 
      race.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      race.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      race.year.toString().includes(searchTerm);
    
    const matchesCategory = selectedCategory === 'All' || race.category === selectedCategory;
    const matchesYear = selectedYear === 'All' || race.year.toString() === selectedYear;

    return matchesSearch && matchesCategory && matchesYear;
  });

  const visibleData = filteredData.slice(0, visibleCount);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-slate-800">Race History Log</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Year Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full sm:w-40 pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer text-slate-700 font-medium"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer text-slate-700 font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Distances' : cat}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Event</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Distance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pace</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Placement</th>
                <th className="px-4 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleData.map((race) => (
                <tr 
                  key={race.id} 
                  onClick={() => setSelectedRace(race)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-sm font-medium text-slate-700">{race.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-800 block">{race.event}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-blue-700 font-semibold px-2 py-0.5 bg-blue-50 rounded border border-blue-100 mb-1">
                        {race.distanceLabel}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center" title="Distance in miles">
                        <Ruler className="w-3 h-3 mr-1 text-slate-400" />
                        {race.distanceMiles} mi
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center text-sm text-slate-500">
                      <MapPin className="w-4 h-4 text-slate-400 mr-1" />
                      {race.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center text-sm font-bold text-slate-700">
                      <Timer className="w-4 h-4 text-slate-400 mr-2" />
                      {race.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {race.pace}/mi
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                     <div className="flex flex-col text-xs text-slate-500">
                       <span className="flex items-center"><Trophy className="w-3 h-3 mr-1 text-amber-500"/> OA: {race.overall}</span>
                       <span>Div: {race.division}</span>
                     </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length > visibleCount && (
          <div className="p-4 text-center border-t border-slate-100">
            <button 
              onClick={() => setVisibleCount(prev => prev + 20)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            >
              Load More Races
            </button>
          </div>
        )}
        
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No races found matching your search or filter.
          </div>
        )}
      </div>

      {selectedRace && (
        <RaceDetailsModal 
          race={selectedRace} 
          onClose={() => setSelectedRace(null)} 
        />
      )}
    </>
  );
};

export default RaceList;