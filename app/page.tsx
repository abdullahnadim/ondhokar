'use client';

import { useState, useMemo, useEffect } from 'react';
import { Lightbulb, Phone } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Image from 'next/image';
import descoData from '@/data/desco-database.json';
import SearchBox from '@/components/SearchBox';
import ScheduleTimeline from '@/components/ScheduleTimeline';
import LocationSelector from '@/components/LocationSelector';

// Premium Localization Dictionary
const DICT = {
  EN: {
    heroTitle: "Check your load-shedding schedule.",
    heroSub: "Find the scheduled outage hours for your area from the latest DESCO feeder schedule.",
    orChoose: "Or choose your area",
    hotline: "Hotline:",
    footerText: "Schedules are based on the published DESCO document. Actual power conditions may differ.",
    footerSub: "Independent service • Not an official DESCO website",
    builtBy: "Built by",
    saveArea: "Save area",
    saved: "★ Saved",
    division: "Division:",
    area: "Area:",
    sourceTitle: "Source",
    sourceText1: "Dhaka Electricity Supply PLC (DESCO)",
    sourceText2: "Load Shedding Schedule on 11 KV feeders — Page",
    areaCovered: "Area covered",
    tips: [
      "Turn off lights and fans when leaving an empty room.",
      "Set your AC to 26°C to significantly reduce power draw.",
      "Unplug chargers and appliances when not in use.",
      "Use natural daylight during the daytime whenever possible.",
      "Switch to LED bulbs for up to 80% lower energy consumption."
    ]
  },
  BN: {
    heroTitle: "আপনার লোডশেডিংয়ের সময়সূচি চেক করুন।",
    heroSub: "সর্বশেষ ডেসকো ফিডার শিডিউল থেকে আপনার এলাকার বিদ্যুৎ বিভ্রাটের সময়গুলো জেনে নিন।",
    orChoose: "অথবা আপনার এলাকা নির্বাচন করুন",
    hotline: "হটলাইন:",
    footerText: "এই সময়সূচিটি ডেসকো-এর প্রকাশিত ডকুমেন্টের ওপর ভিত্তি করে তৈরি। বাস্তব পরিস্থিতি ভিন্ন হতে পারে।",
    footerSub: "একটি স্বাধীন উদ্যোগ • এটি ডেসকো-এর কোনো অফিসিয়াল ওয়েবসাইট নয়",
    builtBy: "ডেভেলপার:",
    saveArea: "এলাকা সেভ করুন",
    saved: "★ সেভ করা হয়েছে",
    division: "বিভাগ:",
    area: "এলাকা:",
    sourceTitle: "সূত্র",
    sourceText1: "ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি লিমিটেড (ডেসকো)",
    sourceText2: "১১ কেভি ফিডারের লোডশেডিং শিডিউল — পৃষ্ঠা",
    areaCovered: "অন্তর্ভুক্ত এলাকা",
    tips: [
      "অপ্রয়োজনে ঘরের লাইট এবং ফ্যান বন্ধ রাখুন।",
      "বিদ্যুৎ সাশ্রয় করতে এসির তাপমাত্রা ২৬°C এ সেট করুন।",
      "ব্যবহার না হলে চার্জার এবং প্লাগ খুলে রাখুন।",
      "দিনের বেলা সম্ভব হলে প্রাকৃতিক আলো ব্যবহার করুন।",
      "বিদ্যুৎ বিল ৮০% পর্যন্ত কমাতে এলইডি (LED) বাল্ব ব্যবহার করুন।"
    ]
  }
};

export default function Home() {
  const [lang, setLang] = useState<'EN' | 'BN'>('EN');
  const [selectedFeederId, setSelectedFeederId] = useState<string | null>(null);
  const [savedFeederId, setSavedFeederId] = useState<string | null>(null);
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const t = DICT[lang];

  useEffect(() => {
    const saved = localStorage.getItem('ondhokar_saved_area');
    const savedLang = localStorage.getItem('ondhokar_lang') as 'EN' | 'BN';
    if (saved) {
      setSavedFeederId(saved);
      setSelectedFeederId(saved);
    }
    if (savedLang) setLang(savedLang);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % t.tips.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [t.tips.length]);

  const toggleLang = () => {
    const newLang = lang === 'EN' ? 'BN' : 'EN';
    setLang(newLang);
    localStorage.setItem('ondhokar_lang', newLang);
  };

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

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-ondhokar-bg text-ondhokar-text font-sans selection:bg-ondhokar-text selection:text-ondhokar-bg flex flex-col relative overflow-hidden transition-colors duration-300">
      
      {/* 1. AMBIENT AURORA GRADIENT CANVAS */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-br from-amber-400/15 via-orange-300/10 to-transparent dark:from-amber-500/10 dark:via-yellow-500/5 blur-[120px]" />
        <div className="absolute top-[35%] -right-[10%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-gradient-to-bl from-sky-400/10 via-indigo-300/10 to-transparent dark:from-zinc-700/15 dark:via-zinc-800/10 blur-[130px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Global Energy Tip Ticker (Glass) */}
        <div className="bg-ondhokar-surface/60 backdrop-blur-xl border-b border-ondhokar-border w-full py-2.5 px-4 text-center text-xs md:text-sm font-medium flex justify-center items-center gap-2.5 shadow-sm transition-colors duration-300">
          <Lightbulb className="w-4 h-4 text-ondhokar-accent animate-pulse shrink-0" />
          <p key={`${lang}-${tipIndex}`} className="animate-in slide-in-from-top-2 fade-in duration-500 truncate max-w-2xl text-ondhokar-text">
            {t.tips[tipIndex]}
          </p>
        </div>

        {/* Main Navbar */}
        <header className="px-6 py-5 md:px-12 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => { setSelectedFeederId(null); setShowDropdowns(false); }}
          >
            <div className="bg-ondhokar-surface/70 backdrop-blur-md border border-ondhokar-border p-1.5 rounded-xl group-hover:border-ondhokar-muted transition-colors shadow-sm flex items-center justify-center">
              <Image src="/icon-192.png" alt="Ondhokar Logo" width={28} height={28} className="rounded-lg object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-ondhokar-text group-hover:text-ondhokar-accent transition-colors">Ondhokar</h1>
              <p className="text-[10px] text-ondhokar-muted uppercase tracking-wider font-bold mt-0.5">DESCO Schedule</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-3 text-sm font-semibold text-ondhokar-muted">
            {/* Language Toggle Pill */}
            <button 
              onClick={toggleLang}
              className="flex items-center gap-1.5 bg-ondhokar-surface/70 backdrop-blur-md border border-ondhokar-border px-3 py-1.5 rounded-full hover:bg-ondhokar-elevated transition-all text-xs font-bold shadow-sm"
            >
              <span className={lang === 'EN' ? 'text-ondhokar-text' : 'text-ondhokar-muted'}>EN</span>
              <span className="text-ondhokar-border">|</span>
              <span className={lang === 'BN' ? 'text-ondhokar-text' : 'text-ondhokar-muted'}>বাং</span>
            </button>

            {/* DESCO Hotline Pill */}
            <a 
              href="tel:16120" 
              className="hidden sm:flex items-center gap-2 bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-600/20 px-3.5 py-1.5 rounded-full hover:bg-emerald-500/20 transition-all text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{t.hotline} <strong className="font-bold">16120</strong></span>
            </a>
            
            <ThemeToggle />
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="px-6 md:px-12 flex-grow w-full max-w-5xl mx-auto flex flex-col relative">
          
          <div className={`transition-all duration-700 ease-in-out ${selectedFeederData ? 'pt-2 pb-6' : 'pt-16 pb-12 flex-grow flex flex-col justify-center'}`}>
            
            {!selectedFeederData && (
              <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-ondhokar-text mb-4">
                  {t.heroTitle}
                </h2>
                <p className="text-lg text-ondhokar-muted max-w-2xl mx-auto">
                  {t.heroSub}
                </p>
              </div>
            )}
            
            <div className={`w-full ${selectedFeederData ? 'max-w-3xl mx-auto' : ''}`}>
              <SearchBox lang={lang} onSelect={(id) => { setSelectedFeederId(id); setShowDropdowns(false); }} />
              
              {!selectedFeederData && (
                <div className="mt-6 text-sm text-ondhokar-muted text-center animate-in fade-in delay-200">
                  <button onClick={() => setShowDropdowns(!showDropdowns)} className="underline underline-offset-4 font-medium hover:text-ondhokar-text transition-colors">
                    {t.orChoose}
                  </button>
                </div>
              )}

              {showDropdowns && !selectedFeederData && (
                <div className="mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
                  <LocationSelector lang={lang} onSelect={(id) => { setSelectedFeederId(id); setShowDropdowns(false); }} />
                </div>
              )}
            </div>
          </div>

          {/* Selected Result Card */}
          {selectedFeederData && (
            <div className="w-full max-w-5xl mx-auto animate-in slide-in-from-bottom-8 fade-in duration-500">
              <section className="bg-ondhokar-surface/80 backdrop-blur-2xl border border-ondhokar-border p-6 md:p-9 rounded-3xl shadow-glass transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-ondhokar-text">
                      {lang === 'BN' && selectedFeederData.feeder_bn ? selectedFeederData.feeder_bn : selectedFeederData.feeder}
                    </h3>
                    <p className="text-ondhokar-muted font-medium mt-1">
                      {t.division} {lang === 'BN' && selectedFeederData.division_bn ? selectedFeederData.division_bn : selectedFeederData.division} • {t.area} {(lang === 'BN' && selectedFeederData.area_bn ? selectedFeederData.area_bn : selectedFeederData.area).substring(0, 45)}{selectedFeederData.area.length > 45 ? '...' : ''}
                    </p>
                  </div>
                  
                  <button 
                    onClick={toggleSaveArea}
                    className={`text-sm font-semibold border px-4 py-2 rounded-xl transition-all whitespace-nowrap ml-4 backdrop-blur-md ${
                      savedFeederId === selectedFeederData.id 
                        ? 'bg-ondhokar-text/90 text-ondhokar-bg border-transparent shadow-md' 
                        : 'bg-ondhokar-surface/40 border-ondhokar-border hover:bg-ondhokar-elevated text-ondhokar-text shadow-sm'
                    }`}
                  >
                    {savedFeederId === selectedFeederData.id ? t.saved : t.saveArea}
                  </button>
                </div>

                {/* You can also pass lang down to ScheduleTimeline if you want to translate "Electricity is available" later */}
                <ScheduleTimeline 
                  intervals={selectedFeederData.intervals as any} 
                  currentTime={new Date()} 
                />

                <div className="mt-8 pt-6 border-t border-ondhokar-border/50 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                   <div>
                     <h4 className="font-bold mb-2 text-ondhokar-text">{t.areaCovered}</h4>
                     <p className="text-ondhokar-muted font-medium leading-relaxed">
                       {lang === 'BN' && selectedFeederData.area_bn ? selectedFeederData.area_bn : selectedFeederData.area}
                     </p>
                   </div>
                   <div>
                     <h4 className="font-bold mb-2 text-ondhokar-text">{t.sourceTitle}</h4>
                     <p className="text-ondhokar-muted font-medium leading-relaxed">
                       {t.sourceText1}<br/>
                       Document: {descoData.metadata?.document_name || 'Latest Load Shedding Schedule'}<br/>
                       {t.sourceText2} {selectedFeederData.page}
                     </p>
                   </div>
                </div>
              </section>
            </div>
          )}

        </main>
        
        {/* Footer (Glass) */}
        <footer className="px-6 py-8 text-center text-xs w-full border-t border-ondhokar-border bg-ondhokar-surface/40 backdrop-blur-lg mt-auto transition-colors duration-300">
          <p className="text-ondhokar-muted font-medium">{t.footerText}</p>
          <p className="text-ondhokar-muted font-medium mt-1 mb-4">{t.footerSub}</p>
          <p className="text-ondhokar-text text-sm font-medium">
            {t.builtBy} <a href="https://abdullahnadim.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-ondhokar-accent hover:underline transition-colors">Abdullah Nadim</a>
          </p>
        </footer>
      </div>
    </div>
  );
}