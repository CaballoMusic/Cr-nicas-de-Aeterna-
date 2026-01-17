import React from 'react';

interface HintOverlayProps {
  hint: string | null;
  onClose: () => void;
}

const HintOverlay: React.FC<HintOverlayProps> = ({ hint, onClose }) => {
  if (!hint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full bg-slate-900 border border-purple-500/50 rounded-lg p-8 shadow-[0_0_50px_rgba(168,85,247,0.2)] relative transform transition-all scale-100"
      >
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-slate-900 border border-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl">👁️</span>
        </div>
        
        <h3 className="cinzel text-center text-purple-300 text-xl mb-4 tracking-widest uppercase border-b border-purple-900/50 pb-2">
            Susurro del Vacío
        </h3>
        
        <p className="font-serif text-lg text-slate-200 italic text-center leading-relaxed">
            "{hint}"
        </p>

        <button 
            onClick={onClose}
            className="mt-6 w-full py-2 bg-purple-900/30 hover:bg-purple-900/50 text-purple-200 cinzel text-sm border border-purple-800 rounded transition-colors"
        >
            Cerrar el Ojo
        </button>
      </div>
    </div>
  );
};

export default HintOverlay;