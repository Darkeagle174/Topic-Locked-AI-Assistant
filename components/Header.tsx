import React, { useState, useRef, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { Info, Cpu, ChevronDown, Check } from 'lucide-react';

const Header: React.FC = () => {
  const { config, setTopic, availableTopics } = useConfig();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20 shadow-sm transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 relative" ref={menuRef}>
          {/* Logo / Icon */}
          <div 
            className="p-2 rounded-lg transition-colors duration-300"
            style={{ 
              backgroundColor: config.theme.accentColor,
              color: config.theme.primaryColor 
            }}
          >
            <Cpu size={24} />
          </div>

          {/* Assistant Name + Dropdown Trigger */}
          <div 
            className="cursor-pointer group select-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-slate-600 transition-colors">
                {config.assistantName}
              </h1>
              <ChevronDown 
                size={16} 
                className={`text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''} group-hover:text-slate-600`} 
              />
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              Topic Locked: {config.topic}
            </p>
          </div>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-full left-12 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Switch Topic
              </div>
              {availableTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setTopic(topic);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span className={config.topic === topic ? 'font-medium text-slate-900' : 'text-slate-600'}>
                    {topic}
                  </span>
                  {config.topic === topic && (
                    <Check size={14} style={{ color: config.theme.primaryColor }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
          <Info size={16} />
          <span>Ask me anything about {config.topic.toLowerCase()}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
