import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS } from '../data/characters';

interface Props {
  isActive: boolean;
}

const PARTICLE_THEMES = [
  { colors: ['#ef4444', '#f97316', '#facc15'], glow: 'rgba(239, 68, 68, 0.5)' }, // Fire/Lava
  { colors: ['#3b82f6', '#06b6d4', '#60a5fa'], glow: 'rgba(59, 130, 246, 0.5)' }, // Cyber/Tech
  { colors: ['#a855f7', '#d946ef', '#ec4899'], glow: 'rgba(168, 85, 247, 0.5)' }, // Neon Pink/Purple
  { colors: ['#10b981', '#34d399', '#6ee7b7'], glow: 'rgba(16, 185, 129, 0.5)' }, // Toxic/Emerald
  { colors: ['#ffffff', '#cbd5e1', '#f8fafc'], glow: 'rgba(255, 255, 255, 0.5)' }  // Neutral/Light
];

const BACKGROUNDS = [
  'Burning_Japanese_dojo.jpeg',
  'Desert_arena_with_crystal.jpeg',
  'Dojo_consumed_by_raging_fire.jpeg',
  'Fantasy_landscape_floating_island.jpeg',
  'Gothic_throne_room.jpeg',
  'Martial_arts_tournament.jpeg',
  'Martial_arts_tournament_2.jpeg',
  'Rainy_neon_cyberpunk.jpeg',
  'Snowy_mountain.jpeg',
  'Stone_temple_ruins.jpeg',
  'Volcanic_wasteland.jpeg'
];

export function GlobalMenuBackground({ isActive }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [windowSize, setWindowSize] = useState({ w: 1000, h: 800 });
  const [themeIndex, setThemeIndex] = useState(0);

  // Extract all valid cinematicWin and idle avatars from characters
  const backgroundImages = useMemo(() => {
    return CHARACTERS.map(c => c.avatars.cinematicWin || c.avatars.idle).filter(Boolean);
  }, []);

  // Generate corresponding random environmental backgrounds
  const envBackgrounds = useMemo(() => {
    return Array.from({ length: backgroundImages.length }).map(() => 
      `/bg/${BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]}`
    );
  }, [backgroundImages.length]);

  // Pick random theme and setup window resize
  useEffect(() => {
    setThemeIndex(Math.floor(Math.random() * PARTICLE_THEMES.length));
    setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cycle images
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % backgroundImages.length);
    }, 7000); // 7 seconds per portrait
    return () => clearInterval(interval);
  }, [isActive, backgroundImages.length]);

  // Mouse Parallax listener
  useEffect(() => {
    if (!isActive) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isActive]);

  // Generate stable particles
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      xPos: Math.random() * 100, // percentage
      yPos: Math.random() * 100, // percentage
      size: Math.random() * 4 + 2, // 2px to 6px
      duration: Math.random() * 10 + 10, // 10s to 20s
      delay: Math.random() * 10,
      opacityMult: Math.random() * 0.5 + 0.3,
    }));
  }, []);

  if (!isActive) return null;

  // Calculate parallax offsets (different speeds for depth)
  // Background moves slightly in opposite direction
  const parallaxBgX = -(mousePos.x / windowSize.w - 0.5) * 20; 
  const parallaxBgY = -(mousePos.y / windowSize.h - 0.5) * 20;
  
  // Character moves more in same direction
  const parallaxCharX = (mousePos.x / windowSize.w - 0.5) * 50; 
  const parallaxCharY = (mousePos.y / windowSize.h - 0.5) * 50;

  const currentTheme = PARTICLE_THEMES[themeIndex];

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#050508]">
      {/* Environmental Background */}
      <AnimatePresence>
        <motion.img
          key={`env-${currentImageIndex}`}
          src={envBackgrounds[currentImageIndex]}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.15, scale: 1.05, x: parallaxBgX, y: parallaxBgY }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 4, ease: 'easeInOut' }}
          className="absolute inset-[-50px] w-[calc(100%+100px)] h-[calc(100%+100px)] max-w-none object-cover object-center filter grayscale-[60%]"
        />
      </AnimatePresence>

      {/* Dynamic Fading Character Portrait */}
      <AnimatePresence>
        <motion.img
          key={currentImageIndex}
          src={backgroundImages[currentImageIndex]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.6, scale: 1, x: parallaxCharX, y: parallaxCharY }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 3, ease: 'easeInOut' }}
          className="absolute inset-[-50px] w-[calc(100%+100px)] h-[calc(100%+100px)] max-w-none object-cover object-center filter grayscale-[20%]"
        />
      </AnimatePresence>

      {/* Particles System */}
      <div className="absolute inset-0">
        {particles.map((p) => {
          const color = currentTheme.colors[p.id % currentTheme.colors.length];
          return (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                background: color,
                width: p.size,
                height: p.size,
                left: `${p.xPos}%`,
                top: `${p.yPos}%`,
                opacity: 0,
              }}
              animate={{
                y: [0, -300], // Float up significantly
                x: [0, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 100], // Drift sideways
                opacity: [0, p.opacityMult, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "linear"
              }}
            />
          );
        })}
      </div>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none" />
    </div>
  );
}
