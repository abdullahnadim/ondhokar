'use client';
import { useState, useMemo } from 'react';
import descoData from '@/data/desco-database.json';

export default function LocationSelector({ onSelect }: { onSelect: (feederId: string) => void }) {
  const [division, setDivision] = useState('');
  const [area, setArea] = useState('');
  const [feeder, setFeeder] = useState('');

  // Extract unique divisions
  const divisions = useMemo(() => {
    const divs = new Set(descoData.feeders.map(f => f.division));
    return Array.from(divs).sort();
  }, []);

  // Extract areas based on selected division
  const areas = useMemo(() => {
    if (!division) return [];
    const filtered = descoData.feeders.filter(f => f.division === division);
    const uniqueAreas = new Set(filtered.map(f => f.area));
    return Array.from(uniqueAreas).sort();
  }, [division]);

  // Extract feeders based on selected area
  const feeders = useMemo(() => {
    if (!area) return [];
    return descoData.feeders
      .filter(f => f.area === area && f.division === division)
      .sort((a, b) => a.feeder.localeCompare(b.feeder));
  }, [area, division]);

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
          className="w-full appearance-none bg-ondhokar-surface/60 backdrop-blur-xl text-ondhokar-text border border-ondhokar-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ondhokar-muted/50 transition-all cursor-pointer shadow-sm"
          value={division}
          onChange={(e) => {
            setDivision(e.target.value);
            setArea('');
            setFeeder('');
          }}
        >
          <option value="" disabled className="bg-ondhokar-bg text-ondhokar-muted">Select Division</option>
          {divisions.map(d => (
            <option key={d} value={d} className="bg-ondhokar-bg text-ondhokar-text">{d}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ondhokar-muted">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>

      {/* Area Dropdown */}
      <div className="relative">
        <select 
          className={`w-full appearance-none bg-ondhokar-surface/60 backdrop-blur-xl text-ondhokar-text border border-ondhokar-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ondhokar-muted/50 transition-all cursor-pointer shadow-sm ${!division ? 'opacity-50 cursor-not-allowed' : ''}`}
          value={area}
          onChange={(e) => {
            setArea(e.target.value);
            setFeeder('');
          }}
          disabled={!division}
        >
          <option value="" disabled className="bg-ondhokar-bg text-ondhokar-muted">Select Area</option>
          {areas.map(a => (
            <option key={a} value={a} className="bg-ondhokar-bg text-ondhokar-text">{a.substring(0, 40)}{a.length > 40 ? '...' : ''}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ondhokar-muted">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>

      {/* Feeder Dropdown */}
      <div className="relative">
        <select 
          className={`w-full appearance-none bg-ondhokar-surface/60 backdrop-blur-xl text-ondhokar-text border border-ondhokar-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-ondhokar-muted/50 transition-all cursor-pointer shadow-sm ${!area ? 'opacity-50 cursor-not-allowed' : ''}`}
          value={feeder}
          onChange={handleFeederSelect}
          disabled={!area}
        >
          <option value="" disabled className="bg-ondhokar-bg text-ondhokar-muted">Select Feeder</option>
          {feeders.map(f => (
            <option key={f.id} value={f.id} className="bg-ondhokar-bg text-ondhokar-text">{f.feeder}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ondhokar-muted">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>

    </div>
  );
}