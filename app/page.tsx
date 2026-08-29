'use client';

import { useState, useMemo } from 'react';
import descoData from '@/data/desco-database.json';
import SearchBox from '@/components/SearchBox';
import ScheduleTimeline from '@/components/ScheduleTimeline';
import LocationSelector from '@/components/LocationSelector';

export default function Home() {
  const [selectedFeederId, setSelectedFeederId] = useState<string | null>(null);
  const [showDropdowns, setShowDropdowns] = useState(false);

  const selectedFeederData = useMemo(() => {
    if (!selectedFeederId) return null;
    return descoData.feeders.find(f => f.id === selectedFeederId) || null;
  }, [selectedFeederId]);

  return (
    <div className="min-h-screen bg-ondhokar-bg text-ondhokar-text font-sans selection:bg-ondhokar-text selection:text-white flex flex-col">
      
      {/* Minimal Header */}
      <header className="px-6 py-6 md:px-12 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div 
          className="cursor-pointer" 
          onClick={() => { setSelectedFeederId(null); setShowDropdowns(false); }}
        >
          <h1 className="text-xl font-bold tracking-tight">Ondhokar</h1>
          <p className="text-xs text-ondhokar-muted mt-1">DESCO schedule viewer</p>
        </div>
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-ondhokar-muted">
          <a href="#" className="hover:text-ondhokar-text transition-colors">Schedule</a>
          <a href="#" className="hover:text-ondhokar-text transition-colors">Source</a>
          <a href="#" className="hover:text-ondhokar-text transition-colors">About</a>
        </nav>
      </header>

      {/* Main Content Area - Flex grows to push footer down */}
      <main className="px-6 md:px-12 flex-grow w-full max-w-5xl mx-auto flex flex-col">
        
        {/* Dynamic Wrapper: Expands when empty, collapses when result is shown */}
        <div className={`transition-all duration-700 ease-in-out ${selectedFeederData ? 'pt-2 pb-6' : 'pt-20 pb-12 flex-grow flex flex-col justify-center'}`}>
          
          {/* Hide the giant text if a schedule is actively displayed to save screen space */}
          {!selectedFeederData && (
            <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-ondhokar-text mb-4">
                Check your load-shedding schedule.
              </h2>
              <p className="text-lg text-ondhokar-muted max-w-2xl mx-auto">
                Find the scheduled outage hours for your area from the latest DESCO feeder schedule.
              </p>
            </div>
          )}
          
          {/* Search Box - Centers initially, then anchors to top when result shown */}
          <div className={`w-full ${selectedFeederData ? 'max-w-3xl mx-auto' : ''}`}>
            <SearchBox onSelect={(id) => { setSelectedFeederId(id); setShowDropdowns(false); }} />
            
            {!selectedFeederData && (
              <div className="mt-6 text-sm text-ondhokar-muted text-center animate-in fade-in delay-200">
                Or <button onClick={() => setShowDropdowns(!showDropdowns)} className="underline underline-offset-4 hover:text-ondhokar-text transition-colors">choose your area</button>
              </div>
            )}

            {showDropdowns && !selectedFeederData && (
              <LocationSelector onSelect={(id) => { setSelectedFeederId(id); setShowDropdowns(false); }} />
            )}
          </div>
        </div>

        {/* Selected Result - Now perfectly fits on one screen */}
        {selectedFeederData && (
          <section className="bg-white border border-ondhokar-border p-6 md:p-8 rounded-xl shadow-utility animate-in slide-in-from-bottom-8 fade-in duration-500 mb-8">
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-semibold">{selectedFeederData.feeder}</h3>
                <p className="text-ondhokar-muted mt-1">
                  Division: {selectedFeederData.division} • Area: {selectedFeederData.area.substring(0, 45)}{selectedFeederData.area.length > 45 ? '...' : ''}
                </p>
              </div>
              <button className="text-sm font-medium border border-ondhokar-border px-4 py-2 rounded-lg hover:bg-ondhokar-bg transition-colors whitespace-nowrap ml-4">
                Save area
              </button>
            </div>

            <ScheduleTimeline 
              intervals={selectedFeederData.intervals as any} 
              currentTime={new Date()} 
            />

            {/* Expandable Details & Source */}
            <div className="mt-8 pt-6 border-t border-ondhokar-border grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
               <div>
                 <h4 className="font-semibold mb-2">Area covered</h4>
                 <p className="text-ondhokar-muted leading-relaxed">
                   {selectedFeederData.area}
                 </p>
               </div>
               <div>
                 <h4 className="font-semibold mb-2">Source</h4>
                 <p className="text-ondhokar-muted">
                   Dhaka Electricity Supply PLC (DESCO)<br/>
                   Document: 35aad7b3-a4f6-4c8f-9605-11a82332e69b.pdf<br/>
                   Load Shedding Schedule on 11 KV feeders — Page {selectedFeederData.page}
                 </p>
               </div>
            </div>
          </section>
        )}

      </main>
      
      {/* Footer */}
      <footer className="px-6 py-6 text-center text-xs text-ondhokar-muted w-full border-t border-ondhokar-border bg-ondhokar-bg">
        <p>Schedules are based on the published DESCO document. Actual power conditions may differ.</p>
        <p className="mt-1">Independent service • Not an official DESCO website</p>
      </footer>
    </div>
  );
}