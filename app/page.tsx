'use client';

import { useState, useMemo, useEffect } from 'react';
import { Lightbulb, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import descoData from '@/data/desco-database.json';
import SearchBox from '@/components/SearchBox';
import ScheduleTimeline from '@/components/ScheduleTimeline';
import LocationSelector from '@/components/LocationSelector';

const TIPS = [
  "Turn off lights and fans when leaving an empty room.",
  "Set your AC to 26°C to significantly reduce power draw.",
  "Unplug chargers and appliances when not in use.",
  "Use natural daylight during the daytime whenever possible.",
  "Switch to LED bulbs for up to 80% lower energy consumption."
];

export default function Home() {
  const [selectedFeederId, setSelectedFeederId] = useState<string | null>(null);
  const [savedFeederId, setSavedFeederId] = useState<string | null>(null);
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { theme, setTheme, systemTheme } = useTheme();

  // Load saved area on initial mount
  useEffect(() => {
    const saved = localStorage.getItem('ondhokar_saved_area');
    if (saved) {
      setSavedFeederId(saved);
      setSelectedFeederId(saved);
    }
    setIsLoaded(true);
  }, []);

  // Rotate electricity tips every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const selectedFeederData = useMemo(() => {
    if (!selectedFeederId) return null;
    return descoData.feeders.find(f => f.id === selectedFeederId) || null;
  }, [selectedFeederId]);

  const toggleSaveArea = () => {
    if (savedFeederId === selectedFeederId) {
      localStorage.removeItem('ondhokar_saved_area');
      setSavedFeederId(null);
    } else if (selectedFeederId) {
      localStorage.setItem('ondhokar_saved_area', selectedFeederId);
      setSavedFeederId(selectedFeederId);
    }
  };

  // Determine current effective theme for the toggle icon
  const currentTheme = theme === 'system' ? systemTheme : theme;

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-ondhokar-bg dark:bg-zinc-950 text-ondhokar-text dark:text-zinc-100 font-sans selection:bg-ondhokar-text dark:selection:bg-zinc-100 selection:text-white dark:selection:text-zinc-900 flex flex-col transition-colors duration-300">
      
      {/* Global Energy Tip Ticker */}
      <div className="bg-ondhokar-text dark:bg-zinc-100 text-white dark:text-zinc-950 w-full py-2.5 px-4 text-center text-xs md:text-sm font-medium flex justify-center items-center gap-2.5 shadow-md z-10 transition-colors duration-300">
        <Lightbulb className="w-4 h-4 text-yellow-400 dark:text-yellow-500 animate-pulse shrink-0" />
        <p key={tipIndex} className="animate-in slide-in-from-top-2 fade-in duration-500 truncate max-w-2xl">
          {TIPS[tipIndex]}
        </p>
      </div>

      {/* Main Navbar */}
      <header className="px-6 py-5 md:px-12 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => { setSelectedFeederId(null); setShowDropdowns(false); }}
        >
          {/* Custom User Logo */}
          <div className="bg-ondhokar-text dark:bg-zinc-800 p-1.5 rounded-xl group-hover:bg-ondhokar-accent dark:group-hover:bg-ondhokar-accent transition-colors shadow-sm flex items-center justify-center">
            <Image 
              src="/icon-192.png" 
              alt="Ondhokar Logo" 
              width={28} 
              height={28} 
              className="rounded-lg object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight group-hover:text-ondhokar-accent transition-colors">Ondhokar</h1>
            <p className="text-[10px] text-ondhokar-muted dark:text-zinc-400 uppercase tracking-wider font-bold mt-0.5">DESCO Schedule</p>
          </div>
        </div>
        
        <nav className="flex items-center space-x-6 text-sm font-semibold text-ondhokar-muted dark:text-zinc-400">
          <a href="#" className="hidden md:block hover:text-ondhokar-text dark:hover:text-zinc-100 transition-colors">Schedule</a>
          <a href="#" className="hidden md:block hover:text-ondhokar-text dark:hover:text-zinc-100 transition-colors">Source</a>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-ondhokar-border dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {currentTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="px-6 md:px-12 flex-grow w-full max-w-5xl mx-auto flex flex-col">
        
        <div className={`transition-all duration-700 ease-in-out ${selectedFeederData ? 'pt-2 pb-6' : 'pt-16 pb-12 flex-grow flex flex-col justify-center'}`}>
          
          {!selectedFeederData && (
            <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-ondhokar-text dark:text-zinc-100 mb-4">
                Check your load-shedding schedule.
              </h2>
              <p className="text-lg text-ondhokar-muted dark:text-zinc-400 max-w-2xl mx-auto">
                Find the scheduled outage hours for your area from the latest DESCO feeder schedule.
              </p>
            </div>
          )}
          
          <div className={`w-full ${selectedFeederData ? 'max-w-3xl mx-auto' : ''}`}>
            <SearchBox onSelect={(id) => { setSelectedFeederId(id); setShowDropdowns(false); }} />
            
            {!selectedFeederData && (
              <div className="mt-6 text-sm text-ondhokar-muted dark:text-zinc-400 text-center animate-in fade-in delay-200">
                Or <button onClick={() => setShowDropdowns(!showDropdowns)} className="underline underline-offset-4 font-medium hover:text-ondhokar-text dark:hover:text-zinc-100 transition-colors">choose your area</button>
              </div>
            )}

            {showDropdowns && !selectedFeederData && (
              <LocationSelector onSelect={(id) => { setSelectedFeederId(id); setShowDropdowns(false); }} />
            )}
          </div>
        </div>

        {/* Selected Result */}
        {selectedFeederData && (
          <div className="w-full max-w-5xl mx-auto animate-in slide-in-from-bottom-8 fade-in duration-500">
            <section className="bg-white dark:bg-zinc-900 border border-ondhokar-border dark:border-zinc-800 p-6 md:p-8 rounded-2xl shadow-utility mb-8 transition-colors duration-300">
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold dark:text-zinc-100">{selectedFeederData.feeder}</h3>
                  <p className="text-ondhokar-muted dark:text-zinc-400 font-medium mt-1">
                    Division: {selectedFeederData.division} • Area: {selectedFeederData.area.substring(0, 45)}{selectedFeederData.area.length > 45 ? '...' : ''}
                  </p>
                </div>
                
                <button 
                  onClick={toggleSaveArea}
                  className={`text-sm font-semibold border px-4 py-2 rounded-lg transition-all whitespace-nowrap ml-4 ${
                    savedFeederId === selectedFeederData.id 
                      ? 'bg-ondhokar-text dark:bg-zinc-100 text-white dark:text-zinc-900 border-ondhokar-text dark:border-zinc-100 shadow-sm' 
                      : 'border-ondhokar-border dark:border-zinc-700 hover:bg-ondhokar-bg dark:hover:bg-zinc-800 text-ondhokar-text dark:text-zinc-300'
                  }`}
                >
                  {savedFeederId === selectedFeederData.id ? '★ Saved' : 'Save area'}
                </button>
              </div>

              <ScheduleTimeline 
                intervals={selectedFeederData.intervals as any} 
                currentTime={new Date()} 
              />

              {/* Expandable Details & Source */}
              <div className="mt-8 pt-6 border-t border-ondhokar-border dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                 <div>
                   <h4 className="font-bold mb-2 dark:text-zinc-200">Area covered</h4>
                   <p className="text-ondhokar-muted dark:text-zinc-400 font-medium leading-relaxed">
                     {selectedFeederData.area}
                   </p>
                 </div>
                 <div>
                   <h4 className="font-bold mb-2 dark:text-zinc-200">Source</h4>
                   <p className="text-ondhokar-muted dark:text-zinc-400 font-medium">
                     Dhaka Electricity Supply PLC (DESCO)<br/>
                     Document: 35aad7b3-a4f6-4c8f-9605-11a82332e69b.pdf<br/>
                     Load Shedding Schedule on 11 KV feeders — Page {selectedFeederData.page}
                   </p>
                 </div>
              </div>
            </section>
          </div>
        )}

      </main>
      
      {/* Footer with Credits */}
      <footer className="px-6 py-8 text-center text-xs w-full border-t border-ondhokar-border dark:border-zinc-800 bg-ondhokar-bg dark:bg-zinc-950 mt-auto transition-colors duration-300">
        <p className="text-ondhokar-muted dark:text-zinc-400 font-medium">Schedules are based on the published DESCO document. Actual power conditions may differ.</p>
        <p className="text-ondhokar-muted dark:text-zinc-400 font-medium mt-1 mb-4">Independent service • Not an official DESCO website</p>
        <p className="text-ondhokar-text dark:text-zinc-300 text-sm font-medium">
          Built by <a href="abdullahnadim.vercel.app" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-ondhokar-accent dark:hover:text-ondhokar-accent hover:underline transition-colors">Abdullah Nadim</a>
        </p>
      </footer>
    </div>
  );
}