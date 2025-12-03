
import { RaceCategory, RawRaceData, ProcessedRaceData } from './types';

// Helper to convert "MM:SS" or "HH:MM:SS" to total minutes
export const parseDurationToMinutes = (timeStr: string): number => {
  if (!timeStr || timeStr === '--') return 0;
  
  const parts = timeStr.split(':').map(Number);
  let minutes = 0;

  if (parts.length === 3) {
    // HH:MM:SS
    minutes = parts[0] * 60 + parts[1] + parts[2] / 60;
  } else if (parts.length === 2) {
    // MM:SS
    minutes = parts[0] + parts[1] / 60;
  }
  
  return parseFloat(minutes.toFixed(2));
};

// Helper to convert pace "MM:SS" to seconds per mile
export const parsePaceToSeconds = (paceStr: string): number => {
  if (!paceStr || paceStr === '--') return 0;
  const parts = paceStr.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
};

const DISTANCE_MAP: Record<string, number> = {
  [RaceCategory.ULTRA_100_MILE]: 100,
  [RaceCategory.ULTRA_50_MILE]: 50,
  [RaceCategory.ULTRA_50_K]: 31.07,
  [RaceCategory.MARATHON]: 26.2,
  [RaceCategory.METRIC_MARATHON]: 16.3,
  [RaceCategory.HALF]: 13.1,
  [RaceCategory.TEN_MILE]: 10,
  [RaceCategory.TEN_K]: 6.2,
  [RaceCategory.EIGHT_K]: 4.97,
  [RaceCategory.FIVE_MILE]: 5,
  [RaceCategory.FIVE_K]: 3.1,
  [RaceCategory.TWO_MILE]: 2,
  [RaceCategory.THREE_K]: 1.86,
  [RaceCategory.ONE_MILE]: 1,
  [RaceCategory.OTHER]: 0
};

// Categorize race based on event name, time hints, and user overrides
export const categorizeRace = (event: string, timeStr: string, paceStr: string, manualCategory?: string): { category: RaceCategory; label: string; distance: number } => {
  // If a manual override is provided (from the dropdown), use it
  if (manualCategory && manualCategory !== '' && manualCategory !== 'Auto Detect' && DISTANCE_MAP[manualCategory] !== undefined) {
      return { 
          category: manualCategory as RaceCategory, 
          label: manualCategory, 
          distance: DISTANCE_MAP[manualCategory] 
      };
  }

  const lowerEvent = event.toLowerCase();
  const minutes = parseDurationToMinutes(timeStr);
  
  // --- User Specific Overrides & Edge Cases ---
  if (lowerEvent.includes('club challenge')) {
    return { category: RaceCategory.TEN_MILE, label: '10 Miler', distance: 10 };
  }
  if (lowerEvent.includes('turkey burnoff')) {
    return { category: RaceCategory.TEN_MILE, label: '10 Miler', distance: 10 };
  }
  if (lowerEvent.includes('jingle bell jog')) {
    return { category: RaceCategory.EIGHT_K, label: '8K', distance: 4.97 };
  }
  if (lowerEvent.includes('warrior dash')) {
    return { category: RaceCategory.FIVE_K, label: '5K', distance: 3.1 };
  }
  if (lowerEvent.includes('june bugs cross country')) {
    return { category: RaceCategory.FIVE_K, label: '5K', distance: 3.1 };
  }
  
  // New User Requests
  if (lowerEvent.includes('kensington parkrun')) {
    return { category: RaceCategory.FIVE_K, label: '5K', distance: 3.1 };
  }
  if (lowerEvent.includes("damien's run")) {
    return { category: RaceCategory.FIVE_K, label: '5K', distance: 3.1 };
  }
  if (lowerEvent.includes("rotary remembrance run")) {
    return { category: RaceCategory.FIVE_K, label: '5K', distance: 3.1 };
  }
  if (lowerEvent.includes("going green track meet")) {
    return { category: RaceCategory.TWO_MILE, label: '2 Miler', distance: 2.0 };
  }
  if (lowerEvent.includes("firebirds mile")) {
    return { category: RaceCategory.ONE_MILE, label: '1 Mile', distance: 1.0 };
  }
  if (lowerEvent.includes("piece of cake")) {
    return { category: RaceCategory.TEN_K, label: '10K', distance: 6.2 };
  }
  if (lowerEvent.includes("rock n roll usa") || lowerEvent.includes("rock 'n' roll usa")) {
     // If it's the specific "Rock n Roll USA" event which is ambiguous or defined as Marathon
     // Checking time is safer: > 2.5 hours (150 mins) usually implies Marathon
     if (minutes > 150) {
        return { category: RaceCategory.MARATHON, label: 'Marathon', distance: 26.2 };
     }
     return { category: RaceCategory.HALF, label: 'Half Marathon', distance: 13.1 };
  }
  if (lowerEvent.includes("hamptons marathon")) {
     if (minutes > 150) {
        return { category: RaceCategory.MARATHON, label: 'Marathon', distance: 26.2 };
     }
     return { category: RaceCategory.HALF, label: 'Half Marathon', distance: 13.1 };
  }

  // Specific distance overrides for non-standard events
  if (lowerEvent.includes('seneca slopes 9k')) {
    return { category: RaceCategory.OTHER, label: '9K', distance: 5.59 };
  }
  if (lowerEvent.includes('seneca slopes 8.5k')) {
    return { category: RaceCategory.OTHER, label: '8.5K', distance: 5.28 };
  }

  if (lowerEvent.includes('national police challenge') || lowerEvent.includes('npc')) {
    // Differentiate between 5K and 50K based on time if name is ambiguous
    if (minutes > 120) {
       return { category: RaceCategory.ULTRA_50_K, label: '50K', distance: 31.1 };
    }
    return { category: RaceCategory.FIVE_K, label: '5K', distance: 3.1 };
  }
  if (lowerEvent.includes('country road run')) {
    return { category: RaceCategory.FIVE_MILE, label: '5 Miler', distance: 5 };
  }
  if (lowerEvent.includes('ymca') && lowerEvent.includes('turkey chase')) {
    return { category: RaceCategory.TEN_K, label: '10K', distance: 6.2 };
  }

  // --- Specific Logic for B&A (Baltimore and Annapolis) ---
  if (lowerEvent.includes('baltimore and annapolis') || lowerEvent.includes('b&a') || lowerEvent.includes('b & a')) {
    if (minutes > 140) {
        return { category: RaceCategory.MARATHON, label: 'Marathon', distance: 26.2 };
    }
    return { category: RaceCategory.HALF, label: 'Half Marathon', distance: 13.1 };
  }
  
  // --- Logic for Combined Events (Marathon & Half) ---
  if (lowerEvent.includes('baltimore running festival')) {
    if (lowerEvent.includes('half')) return { category: RaceCategory.HALF, label: 'Half Marathon', distance: 13.1 };
    // If time > 2h 25m (145 mins), assume Marathon for this runner
    if (minutes > 145) return { category: RaceCategory.MARATHON, label: 'Marathon', distance: 26.2 };
    return { category: RaceCategory.HALF, label: 'Half Marathon', distance: 13.1 };
  }

  // --- Ultra Splits ---
  if (lowerEvent.includes('100') && (lowerEvent.includes('mile') || lowerEvent.includes('endurance') || lowerEvent.includes('vermont'))) {
     return { category: RaceCategory.ULTRA_100_MILE, label: '100 Miler', distance: 100 };
  }
  if (lowerEvent.includes('50 mile') || lowerEvent.includes('50 mi') || lowerEvent.includes('jfk')) {
     return { category: RaceCategory.ULTRA_50_MILE, label: '50 Miler', distance: 50 };
  }
  if (lowerEvent.includes('50k') || lowerEvent.includes('50 k') || lowerEvent.includes('endurance challenge')) {
     return { category: RaceCategory.ULTRA_50_K, label: '50K', distance: 31.1 };
  }

  // --- Standard Distances & Generic Logic ---

  if (lowerEvent.includes('metric marathon')) {
    return { category: RaceCategory.METRIC_MARATHON, label: 'Metric Marathon', distance: 16.3 };
  }

  // Generic Logic for events named "X Marathon and Half Marathon"
  // If the event name contains both keywords, check the time.
  // This catches things like Rehoboth, Frederick, Suntrust, etc.
  if (lowerEvent.includes('marathon') && lowerEvent.includes('half')) {
     if (minutes > 150) { // 2.5 hours
        return { category: RaceCategory.MARATHON, label: 'Marathon', distance: 26.2 };
     }
     return { category: RaceCategory.HALF, label: 'Half Marathon', distance: 13.1 };
  }
  
  if (lowerEvent.includes('half')) {
    return { category: RaceCategory.HALF, label: 'Half Marathon', distance: 13.1 };
  }
  
  if (lowerEvent.includes('marathon')) {
    return { category: RaceCategory.MARATHON, label: 'Marathon', distance: 26.2 };
  }
  
  if (lowerEvent.includes('10 mile') || lowerEvent.includes('10-mile') || lowerEvent.includes('10m') || lowerEvent.includes('cherry blossom') || lowerEvent.includes('army ten')) {
    return { category: RaceCategory.TEN_MILE, label: '10 Miler', distance: 10 };
  }
  
  if (lowerEvent.includes('10k')) {
    return { category: RaceCategory.TEN_K, label: '10K', distance: 6.2 };
  }
  
  if (lowerEvent.includes('8k')) {
    return { category: RaceCategory.EIGHT_K, label: '8K', distance: 4.97 };
  }

  if (lowerEvent.includes('5 mile') || lowerEvent.includes('5-miler')) {
    return { category: RaceCategory.FIVE_MILE, label: '5 Miler', distance: 5 };
  }

  if (lowerEvent.includes('5k')) {
    return { category: RaceCategory.FIVE_K, label: '5K', distance: 3.1 };
  }
  
  if (lowerEvent.includes('3k')) {
    return { category: RaceCategory.THREE_K, label: '3K', distance: 1.86 };
  }

  if (lowerEvent.includes('2 miler') || lowerEvent.includes('2 mile')) {
    return { category: RaceCategory.TWO_MILE, label: '2 Miler', distance: 2.0 };
  }
  
  if (lowerEvent.includes('mile') && !lowerEvent.includes('10') && !lowerEvent.includes('5') && !lowerEvent.includes('50') && !lowerEvent.includes('100')) {
     // Matches "Mile" but not 10 Mile, 5 Mile, 50 Mile etc.
     return { category: RaceCategory.ONE_MILE, label: '1 Mile', distance: 1.0 };
  }

  // Default fallback
  return { category: RaceCategory.OTHER, label: 'Other', distance: 5 }; 
};

// --- COORDINATES MAP ---
// This is a static lookup for the cities present in the dataset.
// In a production app, you would use a Geocoding API (like Google Maps or Mapbox).
const CITY_COORDINATES: Record<string, [number, number]> = {
    "severna park, md": [39.0857, -76.5516],
    "columbia, md": [39.2037, -76.8610],
    "gaithersburg, md": [39.1434, -77.2014],
    "alexandria, va": [38.8048, -77.0469],
    "boyds, md": [39.1852, -77.3190],
    "montgomery county, md": [39.1547, -77.2405],
    "rockville, md": [39.0840, -77.1528],
    "sparks, md": [39.5359, -76.6666],
    "bristow, va": [38.7214, -77.5376],
    "germantown, md": [39.1732, -77.2717],
    "bethesda, md": [38.9847, -77.0947],
    "washington, dc": [38.9072, -77.0369],
    "washington, d. c., dc": [38.9072, -77.0369],
    "erie, pa": [42.1292, -80.0850],
    "baltimore, md": [39.2904, -76.6122],
    "rehoboth beach, de": [38.7209, -75.0760],
    "damascus, md": [39.2893, -77.2030],
    "east hampton, ny": [40.9634, -72.1848],
    "york, pa": [39.9626, -76.7277],
    "olney, md": [39.1532, -77.0669],
    "allentown, pa": [40.6023, -75.4714],
    "ellicott city, md": [39.2673, -76.7983],
    "baltimore county, md": [39.4609, -76.6713],
    "laurel, md": [39.0993, -76.8483],
    "howard county, md": [39.2475, -76.9286],
    "triangle, va": [38.5457, -77.3044],
    "upper marlboro, md": [38.8159, -76.7497],
    "flintstone, md": [39.7023, -78.5728],
    "west windsor township, vt": [43.4687, -72.4975], 
    "derwood, md": [39.1234, -77.1628],
    "capon, wv": [39.3000, -78.5000], // Approx
    "clifton, va": [38.7796, -77.3872],
    "westminster, md": [39.5754, -76.9959],
    "richmond, va": [37.5407, -77.4360],
    "forest city, pa": [41.6506, -75.4666],
    "west ocean city, md": [38.3365, -75.1054],
    "elkridge, md": [39.2140, -76.7077],
    "mechanicsville, md": [38.4357, -76.7328],
    "manassas, va": [38.7509, -77.4753],
    "potomac, md": [39.0180, -77.2090],
    "great falls, va": [38.9959, -77.2889],
    "mt. airy, md": [39.3768, -77.1547],
    "corning, ny": [42.1428, -77.0547],
    "annapolis, md": [38.9784, -76.4922],
    "poolesville, md": [39.1462, -77.4172],
    "montgomery, md": [39.1547, -77.2405],
    "college park, md": [38.9897, -76.9378],
    "beltsville, md": [39.0348, -76.9075],
    "boonsboro, md": [39.5068, -77.6536],
    "rockville to bethesda, md": [39.0350, -77.1250], // Midpoint approx
};

export const getCoordinates = (locationStr: string): [number, number] | null => {
    // Basic normalization: lowercase and remove "usa" if present to match key
    const normalized = locationStr.toLowerCase().replace(', usa', '').trim();
    return CITY_COORDINATES[normalized] || null;
};


export const processData = (data: RawRaceData[]): ProcessedRaceData[] => {
  return data.map((race, index) => {
    // Generate a simple ID if not present
    const id = (race as any).id || `race-${index}-${Date.now()}`;
    const { category, label, distance } = categorizeRace(race.event, race.time, race.pace, race.distanceType);
    return {
      ...race,
      id,
      dateObj: new Date(race.date),
      paceSeconds: parsePaceToSeconds(race.pace),
      totalMinutes: parseDurationToMinutes(race.time),
      category,
      distanceLabel: label,
      distanceMiles: distance
    };
  }).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
};

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const s = Math.round((minutes - Math.floor(minutes)) * 60);
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const formatPace = (seconds: number): string => {
  if (!seconds) return '--';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};
