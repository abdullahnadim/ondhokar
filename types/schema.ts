export type ScheduleStatus = 'AVAILABLE' | 'SCHEDULED_OUTAGE';

export interface Interval {
  start: string; // e.g., "20:00"
  end: string;   // e.g., "21:00"
  status: ScheduleStatus;
}

export interface Feeder {
  id: string;
  name: string;
  areaId: string;
  sourcePage: number; // For trust/verification
}

export interface Area {
  id: string;
  name: string;
  sdDivisionId: string;
  description: string; // The long DESCO neighborhood text
}

export interface SDDivision {
  id: string;
  name: string;
}

export interface Schedule {
  id: string;
  feederId: string;
  day: string; // e.g., "Saturday"
  datePublished?: string;
  intervals: Interval[];
}