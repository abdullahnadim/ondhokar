'use client';
import { useState, useMemo } from 'react';
import descoData from '@/data/desco-database.json';

interface LocationSelectorProps {
  onSelect: (feederId: string) => void;
  lang: 'EN' | 'BN';
}

export default function LocationSelector({ onSelect, lang }: LocationSelectorProps) {
  const [division, setDivision] = useState('');
  const [area, setArea] = useState('');
  const [feeder, setFeeder] = useState('');

  // Extract unique divisions (bilingual support)
  const divisions = useMemo(() => {
    const divs = new Map();
    descoData.feeders.forEach(f => {
      const fAny = f as any;
      divs.set(f.division, lang === 'BN' && fAny.division_bn ? fAny.division_bn : f.division);
    });
    return Array.from(divs.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [lang]);

  // Extract areas based on selected division
  const areas = useMemo(() => {
    if (!division) return [];
    const filtered = descoData.feeders.filter(f => f.division === division);
    const uniqueAreas = new Map();
    filtered.forEach(f => {
      const fAny = f as any;
      uniqueAreas.set(f.area, lang === 'BN' && fAny.area_bn ? fAny.area_bn : f.area);
    });
    return Array.from(uniqueAreas.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [division, lang]);

  // Extract feeders based on selected area
  const feeders = useMemo(() => {
    if (!area) return [];
    return descoData.feeders
      .filter(f => f.area === area && f.division === division)
      .map(f => {
        const fAny = f as any;
        return {
          id: f.id,
          display: lang === 'BN' && fAny.feeder_bn ? fAny.feeder_bn : f.feeder
        };
      })
      .sort((a, b) => a.display.localeCompare(b.display));
  }, [area, division, lang]);

  const handleFeederSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFeeder(val);
    if (val) {
      onSelect(val);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mx-auto">
      
      {/* Division Dropdown */}
      <div className="relative">
        <select 
          className="w-full appearance-none bg-ondhokar-surface/60 backdrop-blur-xl text-ondhokar-text border border-ondhokar-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ondhokar-accent/40 transition-all cursor-pointer shadow-glass"
          value={division}
          onChange={(e) => {
            setDivision(e.target.value);
            setArea('');
            setFeeder('');
          }}
        >
          <option value="" disabled className="bg-ondhokar-bg text-ondhokar-muted">
            {lang === 'BN' ? 'বিভাগ নির্বাচন করুন' : 'Select Division'}
          </option>
          {divisions.map(([val, display]) => (
            <option key={val} value={val} className="bg-ondhokar-bg text-ondhokar-text">{display}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ondhokar-muted">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>

      {/* Area Dropdown */}
      <div className="relative">
        <select 
          className={`w-full appearance-none bg-ondhokar-surface/60 backdrop-blur-xl text-ondhokar-text border border-ondhokar-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ondhokar-accent/40 transition-all cursor-pointer shadow-glass ${!division ? 'opacity-50 cursor-not-allowed' : ''}`}
          value={area}
          onChange={(e) => {
            setArea(e.target.value);
            setFeeder('');
          }}
          disabled={!division}
        >
          <option value="" disabled className="bg-ondhokar-bg text-ondhokar-muted">
            {lang === 'BN' ? 'এলাকা নির্বাচন করুন' : 'Select Area'}
          </option>
          {areas.map(([val, display]) => (
            <option key={val} value={val} className="bg-ondhokar-bg text-ondhokar-text">
              {display.substring(0, 40)}{display.length > 40 ? '...' : ''}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ondhokar-muted">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>

      {/* Feeder Dropdown */}
      <div className="relative">
        <select 
          className={`w-full appearance-none bg-ondhokar-surface/60 backdrop-blur-xl text-ondhokar-text border border-ondhokar-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ondhokar-accent/40 transition-all cursor-pointer shadow-glass ${!area ? 'opacity-50 cursor-not-allowed' : ''}`}
          value={feeder}
          onChange={handleFeederSelect}
          disabled={!area}
        >
          <option value="" disabled className="bg-ondhokar-bg text-ondhokar-muted">
            {lang === 'BN' ? 'ফিডার নির্বাচন করুন' : 'Select Feeder'}
          </option>
          {feeders.map(f => (
            <option key={f.id} value={f.id} className="bg-ondhokar-bg text-ondhokar-text">{f.display}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ondhokar-muted">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>

    </div>
  );
}