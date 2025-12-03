
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { RACE_DATA as INITIAL_RACE_DATA } from './data';
import { processData } from './utils';
import { Trophy, Activity, Map as MapIcon, Zap, Plus, AlertCircle, Gauge, DatabaseBackup } from 'lucide-react';
import StatCard from './components/StatCard';
import { 
  RacesPerYearChart, 
  CumulativeMilesChart, 
  SeasonalityRadarChart, 
  YearlyMileageChart,
  AveragePaceByDistanceChart,
} from './components/Charts';
import { DistanceEquivalents, WeekdayChart, PerformanceTiersChart } from './components/NewInfographics';
import RaceList from './components/RaceList';
import PersonalBests from './components/PersonalBests';
import FunStats from './components/FunStats';
import RaceMap from './components/RaceMap';
import DistanceTable from './components/DistanceTable';
import Milestones from './components/Milestones';
import { RawRaceData } from './types';
import AddRaceForm from './components/AddRaceForm';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, query, writeBatch, doc } from 'firebase/firestore';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<RawRaceData[]>(INITIAL_RACE_DATA);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const hasAutoSeeded = useRef(false);

  // Helper to populate DB with initial data
  const seedDatabase = async () => {
    if (!db) return;
    setIsLoading(true);
    try {
        const batch = writeBatch(db);
        // Firestore batches are limited to 500 operations. Our data is ~100 items.
        INITIAL_RACE_DATA.forEach(race => {
            const docRef = doc(collection(db, "races"));
            batch.set(docRef, race);
        });
        await batch.commit();
        console.log("Database seeded successfully with demo data");
    } catch (e) {
        console.error("Error seeding database: ", e);
        alert("Failed to restore data. Check console for details.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleRestoreData = async () => {
    if (window.confirm("This will upload the default 80+ historical races to your database. Continue?")) {
        await seedDatabase();
    }
  };

  // Fetch from Firebase
  useEffect(() => {
    if (db) {
      setIsFirebaseConnected(true);
      try {
        const q = query(collection(db, "races"));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const firebaseRaces = snapshot.docs.map(doc => doc.data() as RawRaceData);
          
          if (firebaseRaces.length > 0) {
            setRawData(firebaseRaces);
          } else if (snapshot.empty && !hasAutoSeeded.current) {
            // If DB is empty on first load, auto-seed it so the user doesn't lose the "demo" view
            hasAutoSeeded.current = true;
            console.log("Empty database detected. Auto-seeding...");
            await seedDatabase();
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Failed to fetch races from Firebase:", error);
          setIsLoading(false); 
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up Firebase listener:", err);
        setIsLoading(false);
      }
    } else {
      // Simulate loading for demo data
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const data = useMemo(() => {
    try {
      return processData(rawData);
    } catch (e) {
      console.error("Error processing data:", e);
      return [];
    }
  }, [rawData]);

  const stats = useMemo(() => {
    if (data.length === 0) return { totalRaces: 0, totalMiles: 0, avgDistance: 0, avgPace: '--:--' };

    const totalRaces = data.length;
    const totalMiles = data.reduce((acc, curr) => acc + curr.distanceMiles, 0);
    const avgDistance = totalRaces > 0 ? totalMiles / totalRaces : 0;
    const validPaceRaces = data.filter(r => r.paceSeconds > 0).length;
    const avgPaceSeconds = validPaceRaces > 0 
      ? data.reduce((acc, curr) => acc + curr.paceSeconds, 0) / validPaceRaces 
      : 0;
    
    return {
      totalRaces,
      totalMiles: totalMiles.toFixed(1),
      avgDistance: avgDistance.toFixed(1),
      avgPace: avgPaceSeconds > 0 
        ? new Date(avgPaceSeconds * 1000).toISOString().substr(14, 5) 
        : '--:--'
    };
  }, [data]);

  const handleAddRace = async (newRace: RawRaceData) => {
    if (db) {
        try {
            await addDoc(collection(db, "races"), newRace);
        } catch (e) {
            console.error("Error adding document: ", e);
            setRawData(prev => [newRace, ...prev]);
        }
    } else {
        setRawData(prev => [newRace, ...prev]);
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Syncing Racing Data...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 hidden sm:block">
               HighWind's Racing Adventures
             </h1>
             <h1 className="text-xl font-bold text-slate-800 sm:hidden">Racing Log</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {!isFirebaseConnected && (
                <div className="hidden md:flex items-center text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    <AlertCircle className="w-3 h-3 mr-1.5" />
                    Demo Mode
                </div>
            )}
            
            {/* Recovery Button: Visible if connected but data seems wiped out (low count) */}
            {isFirebaseConnected && data.length < 10 && (
                <button 
                  onClick={handleRestoreData}
                  className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  title="Restore default demo data"
                >
                  <DatabaseBackup className="w-4 h-4" />
                  <span className="hidden sm:inline">Restore Defaults</span>
                </button>
            )}

            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm active:transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log Race</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total Races" 
            value={stats.totalRaces} 
            icon={Trophy} 
            colorClass="bg-blue-500" 
            subValue="Across all distances"
          />
          <StatCard 
            label="Total Miles" 
            value={stats.totalMiles} 
            icon={Gauge} 
            colorClass="bg-indigo-500" 
            subValue="Lifetime racing mileage"
          />
          <StatCard 
            label="Avg Distance" 
            value={stats.avgDistance} 
            icon={MapIcon} 
            colorClass="bg-emerald-500" 
            subValue="Miles per race"
          />
          <StatCard 
            label="Avg Pace" 
            value={`${stats.avgPace}/mi`} 
            icon={Zap} 
            colorClass="bg-amber-500" 
            subValue="All time average"
          />
        </div>

        {/* Fun Stats Row */}
        <FunStats data={data} />

        {/* Race Count Table */}
        <DistanceTable data={data} />

        {/* Personal Bests - Full Width */}
        <div className="w-full">
          <PersonalBests data={data} />
        </div>

        {/* Milestones & New Infographics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-1">
              <Milestones data={data} />
           </div>
           <div className="lg:col-span-2">
              <DistanceEquivalents data={data} />
           </div>
        </div>

        {/* Fun Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <WeekdayChart data={data} />
           <PerformanceTiersChart data={data} />
        </div>

        {/* Cumulative Miles (Full Width) */}
        <CumulativeMilesChart data={data} />

        {/* Charts Grid 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <RacesPerYearChart data={data} />
           <YearlyMileageChart data={data} />
        </div>

        {/* Map & Seasonality */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2">
              <RaceMap data={data} />
           </div>
           <div>
              <SeasonalityRadarChart data={data} />
           </div>
        </div>

        {/* Pace Chart */}
        <div className="w-full">
           <AveragePaceByDistanceChart data={data} />
        </div>

        {/* List */}
        <RaceList data={data} />

      </main>

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
