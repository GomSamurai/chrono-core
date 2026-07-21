class AudioEngine {
  private bgmAudio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private bgmVolume: number = 0.3;
  private sfxVolume: number = 0.5;

  constructor() {
    this.isMuted = localStorage.getItem('chrono_muted') === 'true';
    
    const savedBgmVol = localStorage.getItem('chrono_bgm_vol');
    if (savedBgmVol) this.bgmVolume = parseFloat(savedBgmVol);
    
    const savedSfxVol = localStorage.getItem('chrono_sfx_vol');
    if (savedSfxVol) this.sfxVolume = parseFloat(savedSfxVol);
  }

  setBgmVolume(volume: number) {
    this.bgmVolume = volume;
    localStorage.setItem('chrono_bgm_vol', String(volume));
    if (this.bgmAudio) {
      this.bgmAudio.volume = volume;
    }
  }

  getBgmVolume(): number {
    return this.bgmVolume;
  }

  setSfxVolume(volume: number) {
    this.sfxVolume = volume;
    localStorage.setItem('chrono_sfx_vol', String(volume));
  }

  getSfxVolume(): number {
    return this.sfxVolume;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('chrono_muted', String(muted));
    if (this.bgmAudio) {
      this.bgmAudio.muted = muted;
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  playBGM(trackName: string) {
    if (this.bgmAudio) {
      // Don't restart if already playing the same track
      if (this.bgmAudio.src.includes(trackName)) {
        if (this.bgmAudio.paused && !this.isMuted) {
          this.bgmAudio.play().catch(e => console.log("BGM play prevented", e));
        }
        return;
      }
      this.bgmAudio.pause();
      this.bgmAudio.src = '';
    }

    this.bgmAudio = new Audio(`/bgm/${trackName}.mp3`);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.bgmVolume;
    this.bgmAudio.muted = this.isMuted;
    
    // Auto play policy might block this until user interacts
    this.bgmAudio.play().catch(e => {
      console.log("Auto-play prevented by browser. Waiting for interaction.", e);
    });
  }

  stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
  }

  playSFX(trackName: string) {
    if (this.isMuted) return;

    // Create a new Audio object for each SFX so they can overlap
    const sfx = new Audio(`/sfx/${trackName}.mp3`);
    sfx.volume = this.sfxVolume;
    sfx.play().catch(e => console.log("SFX play prevented", e));
    
    // Cleanup after playing to free memory
    sfx.addEventListener('ended', () => {
      sfx.remove();
    });
  }
}

// Export a singleton instance
export const audio = new AudioEngine();
