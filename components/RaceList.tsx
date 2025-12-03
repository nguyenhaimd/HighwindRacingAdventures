import React, { useState, useMemo, useEffect } from 'react';
import { ProcessedRaceData, RawRaceData } from '../types';
import { Search, MapPin, Calendar, Timer, Trophy, Filter, Ruler, X, User, Users, Flag, ChevronRight, Calculator, TrendingUp, Hash, Settings2, Check, ArrowUp, ArrowDown, ArrowUpDown, FileText, Save, Edit3, Lock } from 'lucide-react';
import { formatPace } from '../utils';

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
  onUpdate?: (id: string, data: Partial<RawRaceData>) => void;
  readOnly?: boolean;
}

const RaceDetailsModal: React.FC<RaceDetailsModalProps> = ({ race, onClose, onUpdate, readOnly = true }) => {
  const [notes, setNotes] = useState(race.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(notes !== (race.notes || ''));
  }, [notes, race.notes]);

  const handleSave = async () => {
    if (onUpdate && hasChanges && !readOnly) {
        setIsSaving(true);
        await onUpdate(race.id, { notes });
        setIsSaving(false);
        setHasChanges(false);
    }
  };

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
                 <span className="text-xs text-slate-400">{race.distanceMiles} mi</span>
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

            {/* Notes Section - Conditional Edit */}
            <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-slate-500" />
                        Race Notes
                    </h4>
                    {!readOnly && hasChanges && (
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center space-x-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full transition-colors animate-in fade-in"
                        >
                            <Save className="w-3 h-3" />
                            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    )}
                </div>
                
                {readOnly ? (
                  <div className={`w-full p-4 rounded-xl border ${notes ? 'bg-slate-50 border-slate-200' : 'bg-slate-50/50 border-slate-100 border-dashed text-center'}`}>
                    {notes ? (
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{notes}</p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No notes recorded for this race.</p>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                      <textarea 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add your memories, weather conditions, or race strategy here..."
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all min-h-[100px] resize-none"
                      />
                      {!notes && !hasChanges && (
                          <div className="absolute top-3 right-3 text-slate-300 pointer-events-none">
                              <Edit3 className="w-4 h-4" />
                          </div>
                      )}
                      <p className="text-xs text-slate-400 mt-2 text-right">
                        {hasChanges ? 'Unsaved changes' : 'Notes saved'}
                      </p>
                  </div>
                )}
            </div>

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
  onUpdateRace?: (id: string, data: Partial<RawRaceData>) => void;
  isAdmin?: boolean;
}

const RaceList: React.FC<RaceListProps> = ({ data, onUpdateRace, isAdmin = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedRace, setSelectedRace] = useState<ProcessedRaceData | null>(null);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    event: true,
    distance: true,
    location: true,
    time: true,
    pace: true,
    placement: true,
    notes: true
  });
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  const columnLabels: Record<string, string> = {
    date: 'Date',
    event: 'Event',
    distance: 'Distance',
    location: 'Location',
    time: 'Time',
    pace: 'Pace',
    placement: 'Placement',
    notes: 'Notes'
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get unique categories for filter
  const categories = ['All', ...Array.from(new Set(data.map(d => d.category)))].sort();

  // Get unique years for filter (descending)
  const years = ['All', ...Array.from(new Set(data.map(d => d.year))).sort((a, b) => b - a)];

  const filteredData = data.filter(race => {
    const matchesSearch = 
      race.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      race.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      race.year.toString().includes(searchTerm) ||
      (race.notes && race.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || race.category === selectedCategory;
    const matchesYear = selectedYear === 'All' || race.year.toString() === selectedYear;

    return matchesSearch && matchesCategory && matchesYear;
  });

  const sortedData = useMemo(() => {
    let items = [...filteredData];
    if (sortConfig !== null) {
      items.sort((a, b) => {
        let aValue: number | string = 0;
        let bValue: number | string = 0;

        // Determine values based on key
        if (sortConfig.key === 'distance') {
           aValue = a.distanceMiles;
           bValue = b.distanceMiles;
        } else if (sortConfig.key === 'time') {
           aValue = a.totalMinutes;
           bValue = b.totalMinutes;
        } else if (sortConfig.key === 'pace') {
           aValue = a.paceSeconds;
           bValue = b.paceSeconds;
        } else if (sortConfig.key === 'date') {
           aValue = a.dateObj.getTime();
           bValue = b.dateObj.getTime();
        } else if (sortConfig.key === 'notes') {
            aValue = a.notes ? 1 : 0;
            bValue = b.notes ? 1 : 0;
        }

        // Handle 0 values (missing data) - push to bottom for time/pace/distance
        const isNumericSort = ['distance', 'time', 'pace'].includes(sortConfig.key);
        if (isNumericSort) {
            if (aValue === 0 && bValue !== 0) return 1;
            if (aValue !== 0 && bValue === 0) return -1;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return items;
  }, [filteredData, sortConfig]);

  // Calculate Summary Stats based on filtered data (not sorted)
  const summary = useMemo(() => {
    if (filteredData.length === 0) return null;

    const totalRaces = filteredData.length;
    const totalMiles = filteredData.reduce((acc, r) => acc + r.distanceMiles, 0);
    const racesWithPace = filteredData.filter(r => r.paceSeconds > 0);
    const avgPaceSec = racesWithPace.length > 0 
        ? racesWithPace.reduce((acc, r) => acc + r.paceSeconds, 0) / racesWithPace.length
        : 0;

    return {
        count: totalRaces,
        miles: totalMiles.toFixed(1),
        pace: avgPaceSec > 0 ? formatPace(avgPaceSec) : '--:--'
    };
  }, [filteredData]);

  const visibleData = sortedData.slice(0, visibleCount);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-slate-800">Race History Log</h3>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
            {/* Year Filter */}
            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full sm:w-36 pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer text-slate-700 font-medium"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-44 pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer text-slate-700 font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Distances' : cat}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events, notes..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Column Visibility Toggle */}
            <div className="relative">
                <button 
                  onClick={() => setIsColumnMenuOpen(!isColumnMenuOpen)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white hover:border-blue-300 transition-all shadow-sm"
                  title="Customize Columns"
                >
                  <Settings2 className="w-4 h-4" />
                </button>

                {isColumnMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsColumnMenuOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 p-2 animate-in fade-in zoom-in-95 duration-200">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1">Visible Columns</div>
                      {Object.entries(visibleColumns).map(([key, isVisible]) => (
                        <button
                          key={key}
                          onClick={() => toggleColumn(key as keyof typeof visibleColumns)}
                          className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-slate-50 transition-colors group"
                        >
                          <span className={`font-medium ${isVisible ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
                            {columnLabels[key]}
                          </span>
                          {isVisible && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
             </div>
          </div>
        </div>
        
        {/* Filtered Summary Bar */}
        {summary && (
            <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50 border-b border-slate-100">
                <div className="px-4 py-3 flex flex-col items-center justify-center sm:flex-row sm:space-x-3">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md mb-1 sm:mb-0">
                        <Hash className="w-4 h-4" />
                    </div>
                    <div className="text-center sm:text-left">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Races</span>
                        <span className="block text-sm font-bold text-slate-800">{summary.count}</span>
                    </div>
                </div>
                <div className="px-4 py-3 flex flex-col items-center justify-center sm:flex-row sm:space-x-3">
                    <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md mb-1 sm:mb-0">
                        <Ruler className="w-4 h-4" />
                    </div>
                    <div className="text-center sm:text-left">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Distance</span>
                        <span className="block text-sm font-bold text-slate-800">{summary.miles} mi</span>
                    </div>
                </div>
                <div className="px-4 py-3 flex flex-col items-center justify-center sm:flex-row sm:space-x-3">
                    <div className="p-1.5 bg-amber-100 text-amber-600 rounded-md mb-1 sm:mb-0">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div className="text-center sm:text-left">
                        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Pace</span>
                        <span className="block text-sm font-bold text-slate-800">{summary.pace} /mi</span>
                    </div>
                </div>
            </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {visibleColumns.date && (
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortConfig?.key === 'date' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 ml-1 text-blue-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.event && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Event</th>}
                {visibleColumns.distance && (
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                    onClick={() => handleSort('distance')}
                  >
                     <div className="flex items-center">
                      Distance
                      {sortConfig?.key === 'distance' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 ml-1 text-blue-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.location && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>}
                {visibleColumns.time && (
                  <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                    onClick={() => handleSort('time')}
                  >
                     <div className="flex items-center">
                      Time
                      {sortConfig?.key === 'time' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 ml-1 text-blue-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.pace && (
                   <th 
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                    onClick={() => handleSort('pace')}
                  >
                     <div className="flex items-center">
                      Pace
                      {sortConfig?.key === 'pace' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 ml-1 text-blue-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      )}
                    </div>
                  </th>
                )}
                {visibleColumns.placement && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Placement</th>}
                {visibleColumns.notes && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                )}
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
                  {visibleColumns.date && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                        <span className="text-sm font-medium text-slate-700">{race.date}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.event && (
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-800 block">{race.event}</span>
                    </td>
                  )}
                  {visibleColumns.distance && (
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
                  )}
                  {visibleColumns.location && (
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-500">
                        <MapPin className="w-4 h-4 text-slate-400 mr-1" />
                        {race.location}
                      </div>
                    </td>
                  )}
                  {visibleColumns.time && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-bold text-slate-700">
                        <Timer className="w-4 h-4 text-slate-400 mr-2" />
                        {race.time}
                      </div>
                    </td>
                  )}
                  {visibleColumns.pace && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {race.pace}/mi
                    </td>
                  )}
                  {visibleColumns.placement && (
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-slate-500">
                        <span className="flex items-center"><Trophy className="w-3 h-3 mr-1 text-amber-500"/> OA: {race.overall}</span>
                        <span>Div: {race.division}</span>
                      </div>
                    </td>
                  )}
                  {visibleColumns.notes && (
                    <td className="px-6 py-4">
                      {race.notes ? (
                          <div className="text-sm text-slate-600 truncate max-w-[150px]" title={race.notes}>
                              {race.notes}
                          </div>
                      ) : (
                          isAdmin ? (
                            <span className="text-xs text-slate-300 italic group-hover:text-blue-400 flex items-center">
                              <Edit3 className="w-3 h-3 mr-1" />
                              Add note...
                            </span>
                          ) : null
                      )}
                    </td>
                  )}
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
          onUpdate={onUpdateRace}
          readOnly={!isAdmin}
        />
      )}
    </>
  );
};

export default RaceList;