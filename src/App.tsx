import { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { Game } from './components/Game';
import { SetupScreen } from './components/SetupScreen';
import { CharacterSelectScreen } from './components/CharacterSelectScreen';
import { GlobalMenuBackground } from './components/GlobalMenuBackground';
import { audio } from './utils/audio';
import { Volume2, VolumeX } from 'lucide-react';

export type AppScreen = 'MENU' | 'SETUP' | 'CHARACTER_SELECT' | 'FIGHT';

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export interface GameConfig {
  mode: string;
  p1Input: string;
  p2Input: string;
  p1CharId: string;
  p2CharId: string;
  difficulty: Difficulty;
}

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('MENU');
  const [config, setConfig] = useState<GameConfig>({ mode: '', p1Input: 'keyboard', p2Input: 'cpu', p1CharId: 'kaelen', p2CharId: 'darius', difficulty: 'NORMAL' });
  const [isMuted, setIsMuted] = useState(audio.getMuted());
  const [hasStarted, setHasStarted] = useState(false);
  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [bgmVol, setBgmVol] = useState(audio.getBgmVolume());
  const [sfxVol, setSfxVol] = useState(audio.getSfxVolume());

  useEffect(() => {
    if (!hasStarted) return;
    switch (screen) {
      case 'MENU':
      case 'SETUP':
        audio.playBGM(`menu_${Math.floor(Math.random() * 2) + 1}`); // menu_1 or menu_2
        break;
      case 'CHARACTER_SELECT':
        audio.playBGM('select');
        break;
      case 'FIGHT':
        audio.playBGM(`fight_${Math.floor(Math.random() * 5) + 1}`); // fight_1 to fight_5
        break;
    }
  }, [screen, hasStarted]);

  const toggleMute = () => {
    setIsMuted(audio.toggleMute());
  };

  const handleModeSelected = (mode: string) => {
    setConfig({ mode, p1Input: 'keyboard', p2Input: mode === 'versus' ? 'cpu' : 'cpu', p1CharId: 'kaelen', p2CharId: 'darius', difficulty: 'NORMAL' });
    setScreen('SETUP');
  };

  const handleSetupComplete = (finalConfig: GameConfig) => {
    setConfig(finalConfig);
    setScreen('CHARACTER_SELECT');
  };

  const handleStartFight = (finalConfig: GameConfig) => {
    setConfig(finalConfig);
    setScreen('FIGHT');
  };

  const handleBackToMenu = () => {
    setScreen('MENU');
  };

  if (!hasStarted) {
    return (
      <div 
        className="h-screen w-full bg-black text-white flex flex-col items-center justify-center cursor-pointer"
        onClick={() => setHasStarted(true)}
      >
        <h1 className="text-4xl sm:text-6xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)] mb-8">
          CHRONO CORE
        </h1>
        <p className="text-xl animate-pulse text-gray-400">Click en cualquier lugar para comenzar</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center font-sans overflow-hidden relative">
      <GlobalMenuBackground isActive={screen !== 'FIGHT'} />
      
      {/* Global Audio Toggle & Panel */}
      <div className="absolute top-4 right-4 z-50 flex flex-col items-end">
        <button 
          onClick={() => setShowAudioPanel(!showAudioPanel)}
          className="p-3 bg-[#1a1a2e] text-gray-300 rounded-full hover:bg-gray-700 hover:text-white transition-colors shadow-lg border border-gray-600"
          title="Ajustes de Sonido"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        {showAudioPanel && (
          <div className="mt-2 bg-[#1a1a2e] border border-gray-600 p-4 rounded-lg shadow-xl w-64 flex flex-col gap-4 text-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center border-b border-gray-700 pb-2">
              <span className="font-bold text-gray-200 uppercase tracking-wider text-xs">Audio</span>
              <button 
                onClick={toggleMute} 
                className={`text-xs px-2 py-1 rounded transition-colors ${isMuted ? 'bg-red-900/50 text-red-400' : 'bg-gray-700 text-gray-300'}`}
              >
                {isMuted ? 'Desmutear' : 'Mutear'}
              </button>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="flex justify-between text-gray-400 text-xs uppercase tracking-wider">
                <span>Música</span>
                <span>{Math.round(bgmVol * 100)}%</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.01" value={bgmVol}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setBgmVol(val);
                  audio.setBgmVolume(val);
                }}
                className="w-full accent-blue-500"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="flex justify-between text-gray-400 text-xs uppercase tracking-wider">
                <span>Efectos</span>
                <span>{Math.round(sfxVol * 100)}%</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.01" value={sfxVol}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSfxVol(val);
                  audio.setSfxVolume(val);
                }}
                className="w-full accent-red-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className={`w-full h-full xl:max-w-[1400px] lg:max-w-6xl md:max-h-[95vh] flex flex-col text-white font-sans overflow-hidden p-2 sm:p-4 border-0 md:border-4 border-[#1a1a2e] md:rounded-xl my-auto shadow-[0_0_50px_rgba(0,0,0,1)] relative ${screen === 'FIGHT' ? 'bg-[#050508]' : 'bg-transparent'}`}>
        {screen === 'MENU' && (
          <MainMenu onStartGame={handleModeSelected} />
        )}
        {screen === 'SETUP' && (
          <SetupScreen 
             config={config} 
             onStart={handleSetupComplete} 
             onBack={() => setScreen('MENU')} 
          />
        )}
        {screen === 'CHARACTER_SELECT' && (
          <CharacterSelectScreen
             config={config}
             onStartFight={handleStartFight}
             onBack={() => setScreen('SETUP')}
          />
        )}
        {screen === 'FIGHT' && (
          <Game onBackToMenu={handleBackToMenu} config={config} />
        )}
      </div>
    </div>
  );
}
