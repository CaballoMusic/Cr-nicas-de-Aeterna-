import React, { useState } from 'react';
import { GameAction } from '../types';

interface ActionPanelProps {
  onAction: (action: string) => void;
  suggestions: GameAction[];
  disabled: boolean;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ onAction, suggestions, disabled }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onAction(input);
      setInput('');
    }
  };

  const getActionStyle = (type: GameAction['type']) => {
    switch(type) {
      case 'combat': return 'border-red-500/50 text-red-200 hover:bg-red-900/40 hover:border-red-400';
      case 'exploration': return 'border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/40 hover:border-emerald-400';
      case 'diplomacy': return 'border-blue-500/50 text-blue-200 hover:bg-blue-900/40 hover:border-blue-400';
      default: return 'border-slate-500/50 text-slate-200 hover:bg-slate-800/40 hover:border-slate-400';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4 pb-4 px-4 pointer-events-auto">
      {/* Suggestions Hotbar - Floating Diamonds/Hexagons */}
      {suggestions.length > 0 && !disabled && (
        <div className="flex flex-wrap justify-center gap-4 animate-slide-up mb-2">
          {suggestions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onAction(action.label)}
              className={`
                px-6 py-2 border bg-black/60 backdrop-blur-md 
                font-cinzel text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300
                hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0.5)]
                ${getActionStyle(action.type)}
                clip-path-polygon
              `}
              style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Field - Command Line Style */}
      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative flex items-center bg-black/70 border-b border-white/20 hover:border-white/40 transition-colors backdrop-blur-md">
            <div className="pl-4 text-orange-500/80 animate-pulse text-xs">▶</div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={disabled}
                placeholder={disabled ? "..." : "TU VOLUNTAD..."}
                className="w-full bg-transparent border-none outline-none text-slate-100 font-cinzel text-center text-sm tracking-widest placeholder-slate-600/50 py-3 uppercase"
            />
            <div className="pr-4 text-orange-500/80 animate-pulse text-xs">◀</div>
        </div>
      </form>
    </div>
  );
};

export default ActionPanel;