import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './components/Layout';
import StoryLog from './components/StoryLog';
import ActionPanel from './components/ActionPanel';
import SceneVisualizer from './components/SceneVisualizer';
import GameHUD from './components/GameHUD';
import HintOverlay from './components/HintOverlay';
import { ChatMessage, GameState, PlayerStats, GameAction, GameResponse } from './types';
import { generateGameTurn, generateSceneImage, startNewGame, generateHint } from './services/geminiService';
import { APP_TITLE } from './constants';

const INITIAL_STATS: PlayerStats = {
  health: 100,
  maxHealth: 100,
  stability: 100,
  maxStability: 100,
  fragments: 0,
  level: 1
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [inventory, setInventory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<GameAction[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  const processTurnResponse = (response: GameResponse) => {
    if (response.statUpdates) {
      setStats(prev => {
        const newHealth = Math.min(prev.maxHealth, Math.max(0, prev.health + (response.statUpdates?.healthChange || 0)));
        const newStability = Math.min(prev.maxStability, Math.max(0, prev.stability + (response.statUpdates?.stabilityChange || 0)));
        return {
          ...prev,
          health: newHealth,
          stability: newStability,
          fragments: Math.max(0, prev.fragments + (response.statUpdates?.fragmentsChange || 0)),
          level: prev.level + (response.statUpdates?.levelChange || 0)
        };
      });
    }
    if (response.inventoryUpdates) {
      setInventory(prev => {
        let newList = [...prev];
        if (response.inventoryUpdates?.add) newList = [...newList, ...response.inventoryUpdates.add];
        if (response.inventoryUpdates?.remove) newList = newList.filter(item => !response.inventoryUpdates?.remove?.includes(item));
        return [...new Set(newList)];
      });
    }
    setSuggestions(response.suggestedActions || []);
    if (response.gameOver) setGameState(GameState.GAMEOVER);
  };

  const handleStartGame = useCallback(async () => {
    setGameState(GameState.LOADING);
    setIsProcessing(true);
    try {
      setStats(INITIAL_STATS);
      setInventory([]);
      setHistory([]);
      const gameData = await startNewGame();
      setHistory([{ role: 'model', content: gameData.narrative }]);
      processTurnResponse(gameData);
      setIsImageGenerating(true);
      setGameState(GameState.PLAYING);
      generateSceneImage(gameData.sceneDescription).then(img => {
        setCurrentImage(img);
        setIsImageGenerating(false);
      });
    } catch (error) {
      console.error(error);
      setGameState(GameState.ERROR);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleUserAction = async (actionText: string) => {
    if (isProcessing || gameState === GameState.GAMEOVER) return;
    const userMsg: ChatMessage = { role: 'user', content: actionText };
    setHistory(prev => [...prev, userMsg]);
    setIsProcessing(true);
    setSuggestions([]); 
    try {
      const gameData = await generateGameTurn([...history, userMsg], stats, inventory, actionText);
      setHistory(prev => [...prev, { role: 'model', content: gameData.narrative }]);
      processTurnResponse(gameData);
      if (gameData.sceneDescription) {
        setIsImageGenerating(true);
        generateSceneImage(gameData.sceneDescription).then(img => {
          if (img) setCurrentImage(img);
          setIsImageGenerating(false);
        });
      }
    } catch (error) {
      setHistory(prev => [...prev, { role: 'model', content: "Error de conexión temporal..." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestHint = async () => {
    if (hintLoading || activeHint || stats.stability < 5) {
        if(stats.stability < 5) setActiveHint("Tu mente es demasiado frágil...");
        return;
    }
    setHintLoading(true);
    setStats(prev => ({...prev, stability: prev.stability - 5}));
    try {
        const hint = await generateHint(history);
        setActiveHint(hint);
    } catch (e) {
        setActiveHint("El silencio es absoluto.");
    } finally {
        setHintLoading(false);
    }
  };

  if (gameState === GameState.INTRO) {
    return (
      <Layout>
        <SceneVisualizer imageData={null} isLoading={false} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-50 bg-black/50 backdrop-blur-sm px-4">
            <h1 className="text-6xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] font-cinzel mb-6 tracking-tighter">
              AETERNA
            </h1>
            <p className="font-cinzel text-xl text-orange-500/80 tracking-[0.5em] mb-12 uppercase animate-pulse">
              Simulación de Realidad
            </p>
            <button 
              onClick={handleStartGame}
              className="px-16 py-6 bg-slate-900 border border-white/20 text-white font-cinzel font-bold text-xl tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] clip-path-polygon"
              style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
            >
              INICIAR
            </button>
        </div>
      </Layout>
    );
  }

  if (gameState === GameState.GAMEOVER) {
      return (
        <Layout>
            <SceneVisualizer imageData={currentImage} isLoading={false} />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50">
                <h1 className="text-7xl text-red-600 font-cinzel mb-4 animate-pulse tracking-widest">DESCONECTADO</h1>
                <p className="text-slate-500 font-mono mb-8">SEÑAL VITAL PERDIDA</p>
                <button onClick={() => setGameState(GameState.INTRO)} className="border border-red-900 text-red-500 px-8 py-2 hover:bg-red-900/20 font-cinzel tracking-wider">REINICIAR SISTEMA</button>
            </div>
        </Layout>
      );
  }

  // FIRST PERSON LAYOUT
  return (
    <Layout>
      <HintOverlay hint={activeHint} onClose={() => setActiveHint(null)} />
      
      {/* 1. BACKGROUND (The World) */}
      <SceneVisualizer imageData={currentImage} isLoading={isImageGenerating} />
      
      {/* 2. HUD LAYER (Absolute positioning over the world) */}
      <div className="absolute inset-0 z-30 pointer-events-none">
          
          {/* Top HUD (Split) */}
          <GameHUD stats={stats} inventory={inventory} />

          {/* Bottom HUD (Centered Controls) */}
          <div className="absolute bottom-0 left-0 right-0 pb-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-32">
              
              {/* Hint Button (Floating Right above actions) */}
              <div className="absolute bottom-40 right-4 pointer-events-auto md:right-10">
                 <button 
                    onClick={handleRequestHint}
                    disabled={hintLoading || stats.stability < 5}
                    className="w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 rounded-full md:rounded border border-purple-500/40 bg-black/60 text-purple-300 hover:bg-purple-900/50 flex items-center justify-center transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    title="Pedir pista (-5 Estabilidad)"
                 >
                     <span className="text-xl">👁️</span>
                 </button>
              </div>

              {/* Subtitles / Narration */}
              <StoryLog history={history} isThinking={isProcessing} />
              
              {/* Action Interface */}
              <ActionPanel 
                 onAction={handleUserAction} 
                 suggestions={suggestions}
                 disabled={isProcessing} 
              />
          </div>
      </div>
    </Layout>
  );
};

export default App;