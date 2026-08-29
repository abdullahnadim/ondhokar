'use client';
import { useState, useMemo } from 'react';
import descoData from '@/data/desco-database.json';

export default function LocationSelector({ onSelect }: { onSelect: (feederId: string) => void }) {
  const [division, setDivision] = useState('');
  const [area, setArea] = useState('');
  const [feeder, setFeeder] = useState('');

  // 1. Get unique divisions directly from the JSON
  const divisions = useMemo(() => {
    const divs = new Set(descoData.feeders.map(f => f.division));
    return Array.from(divs).filter(Boolean).sort();
  }, []);

  // 2. Get areas for selected division
  const areas = useMemo(() => {
    if (!division) return [];
    const matchingFeeders = descoData.feeders.filter(f => f.division === division);
    const uniqueAreas = new Set(matchingFeeders.map(f => f.area));
    return Array.from(uniqueAreas).filter(Boolean).sort();
  }, [division]);

  // 3. Get feeders for selected area
  const feeders = useMemo(() => {
    if (!area) return [];
    return descoData.feeders
      .filter(f => f.division === division && f.area === area)
      .map(f => ({ id: f.id, name: f.feeder }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [division, area]);

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDivision(e.target.value);
    setArea('');
    setFeeder('');
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setArea(e.target.value);
    setFeeder('');
  };

  const handleFeederChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFeeder(val);
    if (val) onSelect(val);
  };

  return (
    <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in zoom-in-95 duration-200">
      <select 
        value={division} 
        onChange={handleDivisionChange}
        className="w-full md:w-48 p-3 bg-white border border-ondhokar-border rounded-lg text-ondhokar-text shadow-utility focus:outline-none focus:ring-2 focus:ring-ondhokar-text cursor-pointer"
      >
        <option value="">Select Division</option>
        {divisions.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      <select 
        value={area} 
        onChange={handleAreaChange}
        disabled={!division}
        className="w-full md:w-64 p-3 bg-white border border-ondhokar-border rounded-lg text-ondhokar-text shadow-utility focus:outline-none focus:ring-2 focus:ring-ondhokar-text disabled:opacity-50 disabled:bg-ondhokar-bg cursor-pointer truncate"
      >
        <option value="">Select Area</option>
        {areas.map(a => <option key={a} value={a}>{a.length > 35 ? a.substring(0, 35) + '...' : a}</option>)}
      </select>

      <select 
        value={feeder} 
        onChange={handleFeederChange}
        disabled={!area}
        className="w-full md:w-48 p-3 bg-white border border-ondhokar-border rounded-lg text-ondhokar-text shadow-utility focus:outline-none focus:ring-2 focus:ring-ondhokar-text disabled:opacity-50 disabled:bg-ondhokar-bg cursor-pointer truncate"
      >
        <option value="">Select Feeder</option>
        {feeders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
    </div>
  );
}