'use client';

import { CheckCircle2, AlertTriangle, Clock, ZapOff, Zap } from 'lucide-react';

export type ScheduleStatus = 'AVAILABLE' | 'SCHEDULED_OUTAGE';

export interface Interval {
  start: string;
  end: string;
  status: ScheduleStatus;
}

interface ScheduleTimelineProps {
  intervals: Interval[];
  currentTime: Date;
}

// Helper to convert "14:00" to "2:00 PM"
const format12Hour = (hour24: number) => {
  if (hour24 === 0 || hour24 === 24) return '12:00 AM';
  if (hour24 === 12) return '12:00 PM';
  return hour24 > 12 ? `${hour24 - 12}:00 PM` : `${hour24}:00 AM`;
};

export default function ScheduleTimeline({ intervals, currentTime }: ScheduleTimelineProps) {
  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Dhaka'
  });
  
  const currentHour = currentTime.getHours();

  // Find active and upcoming outages
  const activeInterval = intervals.find(i => parseInt(i.start.split(':')[0]) === currentHour);
  const isOutageNow = activeInterval?.status === 'SCHEDULED_OUTAGE';
  
  const outageIntervals = intervals.filter(i => i.status === 'SCHEDULED_OUTAGE');
  const totalOutages = outageIntervals.length;
  
  // Calculate the Next Outage
  const nextOutage = outageIntervals.find(i => parseInt(i.start.split(':')[0]) > currentHour);

  return (
    <div className="w-full mt-10 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-semibold tracking-tight text-ondhokar-text">Today's Schedule</h2>
        <p className="text-ondhokar-muted mt-1">{dateString} • Current published schedule</p>
      </div>

      {/* 2. THE 5-SECOND GLANCE CARD */}
      <div className="mb-10">
        {isOutageNow ? (
          // OUTAGE ACTIVE STATE
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <ZapOff className="w-8 h-8 text-red-600 shrink-0 mt-1 animate-pulse" />
            <div>
              <h3 className="text-2xl font-bold text-red-900 tracking-tight">Load shedding happening now.</h3>
              <p className="text-red-700 font-medium text-lg mt-1">
                Electricity expected back at {format12Hour(parseInt(activeInterval.end))}
              </p>
            </div>
          </div>
        ) : !isOutageNow && nextOutage ? (
          // OUTAGE COMING STATE
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold text-amber-900 tracking-tight">Electricity is available.</h3>
              <p className="text-amber-700 font-medium text-lg mt-1">
                Next scheduled outage starts at <span className="font-bold">{format12Hour(parseInt(nextOutage.start))}</span> 
                <span className="text-amber-600/80 text-base ml-2">
                  (in {parseInt(nextOutage.start) - currentHour} {parseInt(nextOutage.start) - currentHour === 1 ? 'hour' : 'hours'})
                </span>
              </p>
            </div>
          </div>
        ) : totalOutages > 0 ? (
          // OUTAGES EXISTED, BUT ALL CLEAR FOR REST OF DAY
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <Zap className="w-8 h-8 text-green-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold text-green-900 tracking-tight">Electricity is available.</h3>
              <p className="text-green-700 font-medium text-lg mt-1">All scheduled load shedding for today has passed.</p>
            </div>
          </div>
        ) : (
          // NO OUTAGES SCHEDULED ALL DAY
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold text-green-900 tracking-tight">No load shedding today.</h3>
              <p className="text-green-700 font-medium text-lg mt-1">According to the published DESCO schedule, electricity should be available all day.</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. VISUAL 24H TIMELINE */}
      <div className="hidden md:block mb-10">
        <div className="flex justify-between text-xs font-semibold text-ondhokar-muted mb-2 px-1">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>12 AM</span>
        </div>
        
        <div className="relative w-full h-14 bg-gray-100 rounded-md overflow-hidden border border-gray-200 shadow-inner">
          {intervals.map((interval, idx) => {
            const hour = parseInt(interval.start.split(':')[0]);
            const isOutage = interval.status === 'SCHEDULED_OUTAGE';
            const isPast = hour < currentHour;
            const isCurrent = hour === currentHour;

            return (
              <div 
                key={idx}
                className={`absolute top-0 bottom-0 border-r border-white/20 transition-all
                  ${isOutage ? 'bg-zinc-900' : 'bg-transparent'}
                  ${isPast && isOutage ? 'opacity-40' : ''}
                `}
                style={{ left: `${(idx / 24) * 100}%`, width: `${(1 / 24) * 100}%` }}
              >
                {isCurrent && (
                  <div className="absolute -top-1 bottom-0 left-0 right-0 border-x-2 border-ondhokar-accent bg-ondhokar-accent/20 z-10 flex items-start justify-center">
                    <span className="bg-ondhokar-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-b-sm shadow-sm tracking-widest">
                      NOW
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. MOBILE-FRIENDLY VERTICAL LIST */}
      <div className="md:hidden mt-6 space-y-2 mb-8">
         {intervals.filter((_, idx) => idx % 2 === 0).map((interval, idx) => {
           const hour = parseInt(interval.start.split(':')[0]);
           const isOutage = interval.status === 'SCHEDULED_OUTAGE' || intervals[hour+1]?.status === 'SCHEDULED_OUTAGE';
           const isCurrent = hour === currentHour || hour + 1 === currentHour;

           return (
             <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${isCurrent ? 'border-ondhokar-accent ring-1 ring-ondhokar-accent bg-orange-50/30' : 'border-ondhokar-border'} ${isOutage ? 'bg-zinc-50' : 'bg-white'}`}>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-semibold text-ondhokar-muted w-16">{format12Hour(hour)}</span>
                  <span className={`text-sm ${isOutage ? 'font-bold text-zinc-900' : 'font-medium text-ondhokar-muted'}`}>
                    {isOutage ? 'Outage in this window' : 'Available'}
                  </span>
                </div>
                {isCurrent && <span className="text-xs font-bold text-white bg-ondhokar-accent px-2 py-1 rounded tracking-widest">NOW</span>}
             </div>
           );
         })}
      </div>

      {/* 5. SCHEDULED OUTAGES LIST (Only renders if outages exist) */}
      {totalOutages > 0 && (
        <div className="bg-white border border-ondhokar-border rounded-xl p-6">
          <h4 className="font-semibold text-ondhokar-text mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-ondhokar-muted" />
            All Scheduled Outages Today
          </h4>
          <div className="flex flex-wrap gap-3">
            {outageIntervals.map((interval, idx) => {
              const isPast = parseInt(interval.end) <= currentHour;
              return (
                <div key={idx} className={`flex items-center gap-2 font-medium px-4 py-2 border rounded-lg ${isPast ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-zinc-900 border-zinc-900 text-white shadow-sm'}`}>
                  {format12Hour(parseInt(interval.start))} — {format12Hour(parseInt(interval.end))}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
    </div>
  );
}