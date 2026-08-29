'use client';
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import descoData from '@/data/desco-database.json';

export default function SearchBox({ onSelect }: { onSelect: (feederId: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof descoData.feeders>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (val.length > 2) {
      const searchTerms = val.toLowerCase().split(' ');
      
      const filtered = descoData.feeders.filter(f => {
        const searchableText = `${f.area} ${f.division} ${f.feeder}`.toLowerCase();
        // Check if ALL search terms exist in the searchable text
        return searchTerms.every(term => searchableText.includes(term));
      }).slice(0, 8); // Limit to top 8 results for a clean UI
      
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (feederId: string) => {
    setQuery('');
    setIsOpen(false);
    onSelect(feederId);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto mt-8">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-ondhokar-muted" strokeWidth={1.5} />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="Search your area, road, sector or feeder..."
          className="w-full pl-12 pr-4 py-4 text-lg bg-white border border-ondhokar-border rounded-lg shadow-utility focus:outline-none focus:ring-2 focus:ring-ondhokar-text transition-all"
        />
      </div>
      
      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-white border border-ondhokar-border rounded-lg shadow-lg overflow-hidden max-h-96 overflow-y-auto">
          {results.map(result => (
            <li 
              key={result.id}
              className="px-4 py-3 cursor-pointer hover:bg-ondhokar-bg border-b border-ondhokar-border last:border-0 text-left"
              onClick={() => handleSelect(result.id)}
            >
              <div className="text-ondhokar-text font-medium text-lg">{result.feeder}</div>
              <div className="text-sm text-ondhokar-muted mt-0.5 truncate">
                {result.division} • {result.area}
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && query.length > 2 && results.length === 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-ondhokar-border rounded-lg shadow-lg p-4 text-ondhokar-muted text-sm text-left">
          No matching area found. Try searching for a sector, road, neighborhood or feeder.
        </div>
      )}
    </div>
  );
}