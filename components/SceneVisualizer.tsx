import React, { useRef, useState, MouseEvent, useEffect } from 'react';

interface SceneVisualizerProps {
  imageData: string | null;
  isLoading: boolean;
}

const SceneVisualizer: React.FC<SceneVisualizerProps> = ({ imageData, isLoading }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });

  // Smooth camera movement loop
  useEffect(() => {
    let animationFrameId: number;
    
    const loop = () => {
        setSmoothPosition(prev => ({
            x: prev.x + (position.x - prev.x) * 0.05,
            y: prev.y + (position.y - prev.y) * 0.05
        }));
        animationFrameId = requestAnimationFrame(loop);
    };
    loop();
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    // Calculate normalized coordinates (-1 to 1)
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    setPosition({ x: x * -20, y: y * -10 }); // Invert for "looking around" feel
  };

  return (
    <div 
        className="fixed inset-0 z-0 overflow-hidden bg-black"
        onMouseMove={handleMouseMove}
    >
      {/* The Image Layer */}
      <div 
        className="absolute inset-[-50px] transition-transform duration-75 ease-out will-change-transform"
        style={{
            transform: `translate3d(${smoothPosition.x}px, ${smoothPosition.y}px, 0) scale(1.1)` 
        }}
      >
        {imageData ? (
          <img 
            src={imageData} 
            alt="Vista del Mundo" 
            className={`w-full h-full object-cover transition-all duration-[2000ms] ${isLoading ? 'blur-md scale-105 brightness-50' : 'blur-0 scale-100 brightness-75'}`}
          />
        ) : (
            // Placeholder nebula
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-black"></div>
        )}
      </div>

      {/* Floating Particles (Fake 3D Depth) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full blur-[2px] animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute top-3/4 left-2/3 w-1 h-1 bg-purple-400 rounded-full blur-[1px] animate-[pulse_3s_ease-in-out_infinite_delay-1000]"></div>
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-orange-400 rounded-full blur-[4px] animate-[pulse_5s_ease-in-out_infinite_delay-500]"></div>
      </div>

      {/* Loading HUD Layer */}
      {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-4">
               <div className="w-20 h-20 border-t-4 border-l-2 border-orange-500 rounded-full animate-spin"></div>
               <div className="cinzel text-orange-200 tracking-[0.5em] text-sm animate-pulse">MATERIALIZANDO REALIDAD...</div>
            </div>
          </div>
      )}
    </div>
  );
};

export default SceneVisualizer;