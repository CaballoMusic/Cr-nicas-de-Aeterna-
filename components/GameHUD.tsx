import React from 'react';
import { PlayerStats } from '../types';

interface GameHUDProps {
  stats: PlayerStats;
  inventory: string[];
}

const GameHUD: React.FC<GameHUDProps> = ({ stats, inventory }) => {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none p-6 flex justify-between items-start">
      {/* LEFT: Vitals (Health & Stability) */}
      <div className="flex flex-col gap-3 w-72 pointer-events-auto animate-slide-in-left">
        {/* Health */}
        <div className="relative group">
            <div className="flex justify-between text-[10px] text-red-200 font-cinzel mb-1 tracking-widest uppercase text-shadow-sm">
                <span>Salud</span>
                <span>{stats.health} / {stats.maxHealth}</span>
            </div>
            <div className="h-2 bg-black/60 border-l-2 border-red-500/50 skew-x-[-20deg] overflow-hidden backdrop-blur-sm shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                <div 
                    className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-400 transition-all duration-500"
                    style={{ width: `${(stats.health / stats.maxHealth) * 100}%` }}
                ></div>
            </div>
        </div>

        {/* Stability */}
        <div className="relative group pl-4">
            <div className="flex justify-between text-[10px] text-purple-200 font-cinzel mb-1 tracking-widest uppercase text-shadow-sm">
                <span>Estabilidad</span>
                <span>{stats.stability} / {stats.maxStability}</span>
            </div>
            <div className="h-2 bg-black/60 border-l-2 border-purple-500/50 skew-x-[-20deg] overflow-hidden backdrop-blur-sm shadow-[0_0_10px_rgba(147,51,234,0.2)]">
                <div 
                    className="h-full bg-gradient-to-r from-indigo-900 via-purple-600 to-purple-400 transition-all duration-500"
                    style={{ width: `${(stats.stability / stats.maxStability) * 100}%` }}
                ></div>
            </div>
        </div>
      </div>

      {/* RIGHT: Status & Loot */}
      <div className="flex flex-col items-end gap-4 pointer-events-auto animate-slide-in-right">
        {/* Level & Currency */}
        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-bl-xl border-b border-l border-white/5 backdrop-blur-sm">
             <div className="flex flex-col items-end px-2">
                <span className="text-amber-500 font-cinzel text-xl font-bold leading-none drop-shadow-md">{stats.fragments}</span>
                <span className="text-[8px] text-amber-200/60 uppercase tracking-widest">Fragmentos</span>
             </div>
             <div className="w-[1px] h-6 bg-white/10"></div>
             <div className="flex flex-col items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-900/50 to-black border border-amber-500/30 rounded shadow-inner">
                <span className="text-[6px] text-amber-200 uppercase tracking-wider">Nvl</span>
                <span className="text-lg font-cinzel text-white font-bold leading-none">{stats.level}</span>
             </div>
        </div>

        {/* Inventory Grid */}
        <div className="flex flex-col gap-1 items-end max-w-[200px]">
            {inventory.map((item, idx) => (
                <div key={idx} className="bg-slate-900/60 border-r-2 border-slate-500/50 px-3 py-1 text-[10px] text-slate-300 font-serif hover:bg-slate-800 transition-colors cursor-help backdrop-blur-sm shadow-md text-right uppercase tracking-wider">
                    {item}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GameHUD;