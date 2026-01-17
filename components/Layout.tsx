import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-slate-200 overflow-hidden relative font-sans selection:bg-orange-500/30">
      
      {/* FPS Crosshair / Reticle */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none z-50 opacity-60 mix-blend-difference">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          <div className="absolute w-6 h-6 border border-white/30 rounded-full"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 h-screen flex flex-col pointer-events-none">
        <div className="flex-1 flex flex-col w-full h-full [&>*]:pointer-events-auto">
            {children}
        </div>
      </div>
      
      {/* Heavy Cinematic Vignette */}
      <div className="fixed inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.85)_95%)]"></div>
    </div>
  );
};

export default Layout;