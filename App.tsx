import React, { useMemo, useState, useEffect } from 'react';
import { RACE_DATA as INITIAL_RACE_DATA } from './data';
import { processData } from './utils';
import { Trophy, CalendarDays, Activity, Map, Timer, Zap, Plus, AlertCircle, Gauge, TrendingUp } from 'lucide-react';
import StatCard from './components/StatCard';
import { 
  RacesPerYearChart, 
  DistanceDistributionChart, 
  CumulativeMilesChart, 
  PerformanceScatterChart, 
  SeasonalityRadarChart, 
  DistanceBarChart,
  YearlyMileageChart,
  AveragePaceByDistanceChart,
  YearlyProgressChart,
  MonthlyHeatmap,
  PaceDistributionChart
} from './components/Charts';
import RaceList from './components/RaceList';
import PersonalBests from './components/PersonalBests';
import FunStats from './components/FunStats';
import RaceMap from './components/RaceMap';
import { RaceCategory, RawRaceData } from './types';
import AddRaceForm from './components/AddRaceForm';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, query } from 'firebase/firestore';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<RawRaceData[]>(INITIAL_RACE_DATA);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Fetch from Firebase
  useEffect(() => {
    if (db) {
      setIsFirebaseConnected(true);
      // Query collection 'races', order by date is optional here as we sort in utils, but good practice
      const q = query(collection(db, "races"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firebaseRaces = snapshot.docs.map(doc => doc.data() as RawRaceData);
        
        if (firebaseRaces.length > 0) {
          setRawData(firebaseRaces);
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Failed to fetch races from Firebase:", error);
        setIsLoading(false); 
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
      setIsFirebaseConnected(false);
    }
  }, []);

  const data = useMemo(() => processData(rawData), [rawData]);

  const stats = useMemo(() => {
    const totalRaces = data.length;
    
    const totalMiles = data.reduce((acc, race) => acc + race.distanceMiles, 0);

    // Guard against empty data
    if (totalRaces === 0) {
        return {
            totalRaces: 0,
            totalMiles: 0,
            yearsRange: 'N/A',
            marathonPB: 'N/A',
            marathonPBDate: '',
            halfPB: 'N/A',
            fastestPace: 'N/A',
            fastestPaceMeta: ''
        };
    }

    const years = data.map(r => r.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    const marathons = data.filter(r => r.category === RaceCategory.MARATHON && r.totalMinutes > 0);
    const marathonPB = marathons.sort((a, b) => a.totalMinutes - b.totalMinutes)[0];

    const halfs = data.filter(r => r.category === RaceCategory.HALF && r.totalMinutes > 0);
    const halfPB = halfs.sort((a, b) => a.totalMinutes - b.totalMinutes)[0];

    const racesWithPace = data.filter(r => r.paceSeconds > 0);
    const fastestRace = racesWithPace.sort((a, b) => a.paceSeconds - b.paceSeconds)[0];

    return {
      totalRaces,
      totalMiles: Math.round(totalMiles),
      yearsRange: `${minYear} - ${maxYear}`,
      marathonPB: marathonPB ? marathonPB.time : 'N/A',
      marathonPBDate: marathonPB ? marathonPB.year : '',
      halfPB: halfPB ? halfPB.time : 'N/A',
      fastestPace: fastestRace ? fastestRace.pace : 'N/A',
      fastestPaceMeta: fastestRace ? `${fastestRace.event} (${fastestRace.date})` : ''
    };
  }, [data]);

  const handleAddRace = async (newRace: RawRaceData) => {
    if (db) {
      try {
        await addDoc(collection(db, "races"), newRace);
      } catch (e) {
        console.error("Error adding document: ", e);
        alert("Failed to save to database. Check console for details.");
        // Optimistic update
        setRawData(prev => [newRace, ...prev]);
      }
    } else {
      // Local state update only
      setRawData(prev => [newRace, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg text-white shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">HighWind's Racing Adventures</h1>
          </div>
          <div className="flex items-center space-x-4">
             {!isFirebaseConnected && (
               <div className="hidden md:flex items-center text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                  <AlertCircle className="w-3 h-3 mr-1.5" />
                  Demo Mode (Local Data)
               </div>
             )}
             <div className="hidden sm:flex items-center text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              <CalendarDays className="w-4 h-4 mr-2 text-slate-400" />
              {stats.yearsRange}
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-colors flex items-center justify-center"
              title="Log new race"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Hero / Stats Row */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
            <div>
               <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Runner Dashboard</h2>
               <p className="text-slate-500 mt-1">Career visualization & performance analytics</p>
            </div>
            <div className="hidden md:block">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {isLoading ? 'Loading...' : (isFirebaseConnected ? 'Live Database' : 'Static Demo Data')}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <StatCard 
              label="Fastest Pace" 
              value={stats.fastestPace !== 'N/A' ? `${stats.fastestPace}/mi` : 'N/A'} 
              subValue={stats.fastestPaceMeta}
              icon={Gauge} 
              colorClass="text-rose-500 bg-rose-500" 
            />
            <StatCard 
              label="Marathon PB" 
              value={stats.marathonPB} 
              subValue={stats.marathonPBDate ? `Set in ${stats.marathonPBDate}` : ''}
              icon={Trophy} 
              colorClass="text-yellow-500 bg-yellow-500" 
            />
            <StatCard 
              label="Half Marathon PB" 
              value={stats.halfPB} 
              subValue="Fastest 13.1 time" 
              icon={Timer} 
              colorClass="text-emerald-500 bg-emerald-500" 
            />
            <StatCard 
              label="Total Miles" 
              value={stats.totalMiles.toLocaleString()} 
              subValue="Race distance covered" 
              icon={Map} 
              colorClass="text-blue-500 bg-blue-500" 
            />
            <StatCard 
              label="Races Completed" 
              value={stats.totalRaces} 
              subValue="Across all distances" 
              icon={Zap} 
              colorClass="text-indigo-500 bg-indigo-500" 
            />
          </div>
        </div>

        {/* Fun Stats Row */}
        <FunStats data={data} />

        {/* Personal Bests Section */}
        <PersonalBests data={data} />

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
              <PerformanceScatterChart data={data} />
           </div>
           <div className="lg:col-span-1">
              <DistanceBarChart data={data} />
           </div>
        </div>

        {/* Map & Secondary Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
               <RaceMap data={data} />
            </div>
        </div>

        {/* New Training Trends Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Training & Consistency Trends
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <YearlyProgressChart data={data} />
              <MonthlyHeatmap data={data} />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PaceDistributionChart data={data} />
              <YearlyMileageChart data={data} />
           </div>
        </div>

        {/* New Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AveragePaceByDistanceChart data={data} />
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SeasonalityRadarChart data={data} />
          </div>
          <div className="lg:col-span-1">
             <RacesPerYearChart data={data} />
          </div>
          <div className="lg:col-span-1">
             <DistanceDistributionChart data={data} />
          </div>
        </div>

        {/* Tertiary Chart */}
        <div className="grid grid-cols-1 gap-8">
           <CumulativeMilesChart data={data} />
        </div>

        {/* Detailed List */}
        <div className="pt-4">
           <RaceList data={data} />
        </div>

      </main>

      <footer className="bg-white border-t border-slate-200 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} HighWind's Racing Adventures. Created with React & Recharts.</p>
        </div>
      </footer>

      {showAddForm && (
        <AddRaceForm 
          onClose={() => setShowAddForm(false)} 
          onAdd={handleAddRace} 
        />
      )}
    </div>
  );
};

export default App;