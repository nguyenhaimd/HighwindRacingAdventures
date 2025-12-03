
export interface RawRaceData {
  event: string;
  date: string;
  location: string;
  overall: string;
  gender: string;
  division: string;
  pace: string;
  time: string;
  year: number;
  distanceType?: string;
}

export interface ProcessedRaceData extends RawRaceData {
  id: string;
  dateObj: Date;
  paceSeconds: number; // Pace in seconds per mile
  totalMinutes: number; // Total duration in minutes
  category: RaceCategory;
  distanceLabel: string;
  distanceMiles: number;
}

export enum RaceCategory {
  ULTRA_100_MILE = '100 Miler',
  ULTRA_50_MILE = '50 Miler',
  ULTRA_50_K = '50K',
  MARATHON = 'Marathon',
  METRIC_MARATHON = 'Metric Marathon',
  HALF = 'Half Marathon',
  TEN_MILE = '10 Miler',
  TEN_K = '10K',
  EIGHT_K = '8K',
  FIVE_MILE = '5 Miler',
  FIVE_K = '5K',
  TWO_MILE = '2 Miler',
  THREE_K = '3K',
  ONE_MILE = '1 Mile',
  OTHER = 'Other'
}