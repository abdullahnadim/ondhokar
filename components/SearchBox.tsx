'use client';
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import descoData from '@/data/desco-database.json';

interface SearchBoxProps {
  onSelect: (feederId: string) => void;
  lang: 'EN' | 'BN';
}

export default function SearchBox({ onSelect, lang }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof descoData.feeders>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
        const fAny = f as any; 
        const searchableText = `${f.area} ${f.division} ${f.feeder} ${fAny.area_bn || ''} ${fAny.division_bn || ''} ${fAny.feeder_bn || ''}`.toLowerCase();
        return searchTerms.every(term => searchableText.includes(term));
      }).slice(0, 8);
      
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

  const placeholderText = lang === 'BN' 
    ? "আপনার এলাকা, রাস্তা, সেক্টর বা ফিডার খুঁজুন..." 
    : "Search your area, road, sector or feeder...";

  const noMatchText = lang === 'BN'
    ? "কোনো এলাকা পাওয়া যায়নি। অন্য কোনো সেক্টর বা রাস্তা দিয়ে চেষ্টা করুন।"
    : "No matching area found. Try searching for a sector, road, neighborhood or feeder.";

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto mt-8">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-ondhokar-muted" strokeWidth={1.5} />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder={placeholderText}
          className="w-full pl-12 pr-4 py-4 text-base md:text-lg bg-ondhokar-surface/60 backdrop-blur-xl text-ondhokar-text placeholder:text-ondhokar-muted border border-ondhokar-border rounded-xl shadow-glass focus:outline-none focus:ring-2 focus:ring-ondhokar-accent/40 transition-all"
        />
      </div>
      
      {isOpen && results.length > 0 && (
        <ul className="absolute z-20 w-full mt-2 bg-ondhokar-surface/80 backdrop-blur-2xl border border-ondhokar-border rounded-xl shadow-xl overflow-hidden max-h-96 overflow-y-auto">
          {results.map(result => {
            const rAny = result as any; // Cast here to silence TypeScript
            return (
              <li 
                key={result.id}
                className="px-4 py-3 cursor-pointer hover:bg-ondhokar-elevated/80 border-b border-ondhokar-border/50 last:border-0 text-left transition-colors"
                onClick={() => handleSelect(result.id)}
              >
                <div className="text-ondhokar-text font-medium text-lg">
                  {lang === 'BN' && rAny.feeder_bn ? rAny.feeder_bn : result.feeder}
                </div>
                <div className="text-sm text-ondhokar-muted mt-0.5 truncate">
                  {lang === 'BN' && rAny.division_bn ? rAny.division_bn : result.division} • {lang === 'BN' && rAny.area_bn ? rAny.area_bn : result.area}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      
      {isOpen && query.length > 2 && results.length === 0 && (
        <div className="absolute z-20 w-full mt-2 bg-ondhokar-surface/80 backdrop-blur-2xl border border-ondhokar-border rounded-xl shadow-xl p-4 text-ondhokar-muted text-sm text-left">
          {noMatchText}
        </div>
      )}
    </div>
  );
}