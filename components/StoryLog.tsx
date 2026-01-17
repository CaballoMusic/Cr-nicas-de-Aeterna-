import React from 'react';
import { ChatMessage } from '../types';

interface StoryLogProps {
  history: ChatMessage[];
  isThinking: boolean;
}

const StoryLog: React.FC<StoryLogProps> = ({ history, isThinking }) => {
  const lastModelMessage = [...history].reverse().find(m => m.role === 'model');

  return (
    <div className="w-full max-w-3xl mx-auto mb-6 text-center animate-fade-in pointer-events-none">
      <div className="relative inline-block">
        <div className="font-serif text-lg md:text-2xl text-white leading-relaxed drop-shadow-[0_2px_2px_rgba(0,0,0,1)] text-shadow-lg px-6 py-2 bg-gradient-to-r from-transparent via-black/40 to-transparent rounded-lg backdrop-blur-[2px]">
            {isThinking ? (
                <span className="animate-pulse text-slate-300 tracking-widest text-sm uppercase font-cinzel">...Sincronizando Realidad...</span>
            ) : (
                <span className="animate-fade-in">{lastModelMessage?.content}</span>
            )}
        </div>
      </div>
    </div>
  );
};

export default StoryLog;