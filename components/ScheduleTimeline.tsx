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

  const activeInterval = intervals.find(i => parseInt(i.start.split(':')[0]) === currentHour);
  const isOutageNow = activeInterval?.status === 'SCHEDULED_OUTAGE';
  
  const outageIntervals = intervals.filter(i => i.status === 'SCHEDULED_OUTAGE');
  const totalOutages = outageIntervals.length;
  const nextOutage = outageIntervals.find(i => parseInt(i.start.split(':')[0]) > currentHour);

  return (
    <div className="w-full mt-10 animate-in fade-in duration-300">
      
      {/* 1. Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-semibold tracking-tight text-ondhokar-text">Today's Schedule</h2>
        <p className="text-ondhokar-muted mt-1">{dateString} • Current published schedule</p>
      </div>

      {/* 2. PREMIUM GLANCE CARDS */}
      <div className="mb-10">
        {isOutageNow ? (
          <div className="bg-ondhokar-elevated/70 backdrop-blur-md border border-ondhokar-border rounded-2xl p-6 flex items-start gap-5 shadow-glass relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]"></div>
            <div className="p-2.5 bg-red-500/10 rounded-full shrink-0">
              <ZapOff className="w-6 h-6 text-red-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ondhokar-text tracking-tight">Load shedding happening now.</h3>
              <p className="text-ondhokar-muted font-medium mt-1">
                Electricity expected back at <span className="font-bold text-ondhokar-text">{format12Hour(parseInt(activeInterval.end))}</span>
              </p>
            </div>
          </div>
        ) : !isOutageNow && nextOutage ? (
          <div className="bg-ondhokar-elevated/70 backdrop-blur-md border border-ondhokar-border rounded-2xl p-6 flex items-start gap-5 shadow-glass relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"></div>
            <div className="p-2.5 bg-amber-500/10 rounded-full shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ondhokar-text tracking-tight">Electricity is available.</h3>
              <p className="text-ondhokar-muted font-medium mt-1">
                Next scheduled outage starts at <span className="text-ondhokar-text font-bold">{format12Hour(parseInt(nextOutage.start))}</span> 
                <span className="text-amber-500/90 font-semibold ml-2">
                  (in {parseInt(nextOutage.start) - currentHour} {parseInt(nextOutage.start) - currentHour === 1 ? 'hour' : 'hours'})
                </span>
              </p>
            </div>
          </div>
        ) : totalOutages > 0 ? (
          <div className="bg-ondhokar-elevated/70 backdrop-blur-md border border-ondhokar-border rounded-2xl p-6 flex items-start gap-5 shadow-glass relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
            <div className="p-2.5 bg-emerald-500/10 rounded-full shrink-0">
              <Zap className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ondhokar-text tracking-tight">Electricity is available.</h3>
              <p className="text-ondhokar-muted font-medium mt-1">All scheduled load shedding for today has passed.</p>
            </div>
          </div>
        ) : (
          <div className="bg-ondhokar-elevated/70 backdrop-blur-md border border-ondhokar-border rounded-2xl p-6 flex items-start gap-5 shadow-glass relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
            <div className="p-2.5 bg-emerald-500/10 rounded-full shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ondhokar-text tracking-tight">No load shedding today.</h3>
              <p className="text-ondhokar-muted font-medium mt-1">According to the published DESCO schedule, electricity should be available all day.</p>
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
        
        <div className="relative w-full h-12 bg-ondhokar-elevated/50 backdrop-blur-sm rounded-xl overflow-hidden border border-ondhokar-border shadow-inner">
          {intervals.map((interval, idx) => {
            const hour = parseInt(interval.start.split(':')[0]);
            const isOutage = interval.status === 'SCHEDULED_OUTAGE';
            const isPast = hour < currentHour;
            const isCurrent = hour === currentHour;

            return (
              <div 
                key={idx}
                className={`absolute top-0 bottom-0 border-r border-ondhokar-border/40 transition-all
                  ${isOutage ? 'bg-ondhokar-text/85' : 'bg-transparent'}
                  ${isPast && isOutage ? 'opacity-30' : ''}
                `}
                style={{ left: `${(idx / 24) * 100}%`, width: `${(1 / 24) * 100}%` }}
              >
                {isCurrent && (
                  <div className="absolute -top-1 bottom-0 left-0 right-0 border-x-2 border-ondhokar-accent bg-ondhokar-accent/15 z-10 flex items-start justify-center">
                    <span className="bg-ondhokar-accent text-ondhokar-bg text-[10px] font-bold px-1.5 py-0.5 rounded-b-sm shadow-sm tracking-widest">
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
             <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-md transition-colors ${
               isCurrent 
                 ? 'border-ondhokar-accent ring-1 ring-ondhokar-accent bg-ondhokar-accent/5' 
                 : 'border-ondhokar-border bg-ondhokar-surface/60'
             }`}>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-semibold text-ondhokar-muted w-16">{format12Hour(hour)}</span>
                  <span className={`text-sm ${isOutage ? 'font-bold text-ondhokar-text' : 'font-medium text-ondhokar-muted'}`}>
                    {isOutage ? 'Outage in this window' : 'Available'}
                  </span>
                </div>
                {isCurrent && <span className="text-[10px] font-bold text-ondhokar-bg bg-ondhokar-accent px-2 py-1 rounded tracking-widest shadow-sm">NOW</span>}
             </div>
           );
         })}
      </div>

      {/* 5. SCHEDULED OUTAGES LIST */}
      {totalOutages > 0 && (
        <div className="bg-ondhokar-surface/60 backdrop-blur-xl border border-ondhokar-border rounded-2xl p-6 mt-6 shadow-glass">
          <h4 className="font-semibold text-ondhokar-text mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-ondhokar-muted" />
            All Scheduled Outages Today
          </h4>
          <div className="flex flex-wrap gap-3">
            {outageIntervals.map((interval, idx) => {
              const isPast = parseInt(interval.end) <= currentHour;
              return (
                <div key={idx} className={`flex items-center gap-2 text-sm font-medium px-4 py-2 border rounded-xl transition-all ${
                  isPast 
                    ? 'bg-ondhokar-elevated/50 border-ondhokar-border text-ondhokar-muted backdrop-blur-sm' 
                    : 'bg-ondhokar-text border-ondhokar-text text-ondhokar-bg shadow-sm'
                }`}>
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