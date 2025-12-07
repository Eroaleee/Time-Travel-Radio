/**
 * Retro Radio Time Machine - Audio System
 * Handles continuous broadcasting, crossfading, and visualization
 */

class AudioSystem {
    constructor() {
        this.mainAudio = document.getElementById('main-audio');
        this.djAudio = document.getElementById('dj-audio');
        this.transitionAudio = document.getElementById('transition-audio');
        
        this.audioContext = null;
        this.analyser = null;
        this.mainSource = null;
        this.djSource = null;
        this.mainGain = null;
        this.djGain = null;
        
        this.volume = CONFIG.AUDIO_CONFIG.defaultVolume;
        this.isMuted = false;
        this.isPlaying = false;
        
        this.visualizerCanvas = null;
        this.visualizerCtx = null;
        this.visualizerAnimationId = null;
        
        this.onTrackEnd = null;
        this.onDJEnd = null;
        
        this.init();
    }
    
    /**
     * Initialize audio system
     */
    init() {
        // Set initial volumes
        this.mainAudio.volume = this.volume;
        this.djAudio.volume = this.volume * CONFIG.AUDIO_CONFIG.djVolumeBoost;
        
        // Event listeners for main audio only
        // DJ audio 'ended' is handled in playDJ() to properly clean up blob URLs
        this.mainAudio.addEventListener('ended', () => this.handleTrackEnd());
        this.mainAudio.addEventListener('error', (e) => this.handleAudioError(e));
        
        // Load saved volume
        const savedVolume = Utils.storage.get('radioVolume', this.volume);
        this.setVolume(savedVolume);
        
        console.log('[Audio] Audio system initialized');
    }
    
    /**
     * Initialize Web Audio API for visualization
     */
    initWebAudio() {
        if (this.audioContext) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create analyser
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            
            // Create data array for frequency data
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            
            // Create gain nodes
            this.mainGain = this.audioContext.createGain();
            this.djGain = this.audioContext.createGain();
            
            // Connect main audio
            this.mainSource = this.audioContext.createMediaElementSource(this.mainAudio);
            this.mainSource.connect(this.mainGain);
            this.mainGain.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            // Connect DJ audio (separate path)
            this.djSource = this.audioContext.createMediaElementSource(this.djAudio);
            this.djSource.connect(this.djGain);
            this.djGain.connect(this.audioContext.destination);
            
            console.log('[Audio] Web Audio API initialized');
        } catch (error) {
            console.error('Failed to initialize Web Audio API:', error);
        }
    }
    
    /**
     * Get frequency data for visualization
     */
    getFrequencyData() {
        if (!this.analyser || !this.frequencyData) return null;
        
        this.analyser.getByteFrequencyData(this.frequencyData);
        return this.frequencyData;
    }
    
    /**
     * Resume audio context (required after user interaction)
     */
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }
    
    /**
     * Play music track
     */
    async playTrack(url) {
        try {
            // Initialize Web Audio on first play
            this.initWebAudio();
            await this.resumeContext();
            
            this.mainAudio.src = url;
            
            // If DJ is currently talking, start at ducked volume
            if (this.isDJPlaying()) {
                this.mainAudio.volume = this.volume * CONFIG.AUDIO_CONFIG.musicDuckVolume;
                console.log('[Audio] Starting track at ducked volume (DJ talking)');
            } else {
                this.mainAudio.volume = this.volume;
            }
            
            await this.mainAudio.play();
            this.isPlaying = true;
            
            // Start visualizer
            this.startVisualizer();
            
            console.log('[Audio] Playing track:', url);
        } catch (error) {
            console.error('Error playing track:', error);
            Utils.showToast('Error playing track', 'error');
        }
    }
    
    /**
     * Play DJ audio (voice)
     */
    async playDJ(audioData) {
        try {
            await this.resumeContext();
            
            // Duck main audio volume
            this.duckMainAudio(true);
            
            // Play DJ audio - handle both ArrayBuffer and Uint8Array
            const arrayBuffer = audioData instanceof ArrayBuffer ? audioData : audioData.buffer || audioData;
            const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            
            this.djAudio.src = url;
            
            // Set up early song start callback (~4 seconds before DJ ends)
            // Store the bound function so we can properly remove it later
            this.djEarlySongStarted = false;
            this._boundCheckEarlySongStart = this.checkEarlySongStart.bind(this);
            this.djAudio.addEventListener('timeupdate', this._boundCheckEarlySongStart);
            
            await this.djAudio.play();
            
            // Clean up blob URL when done
            this.djAudio.onended = () => {
                URL.revokeObjectURL(url);
                if (this._boundCheckEarlySongStart) {
                    this.djAudio.removeEventListener('timeupdate', this._boundCheckEarlySongStart);
                    this._boundCheckEarlySongStart = null;
                }
                this.handleDJEnd();
            };
            
            console.log('[Audio] Playing DJ audio');
        } catch (error) {
            console.error('Error playing DJ audio:', error);
            this.duckMainAudio(false);
        }
    }
    
    /**
     * Check if we should start the next song early (4 seconds before DJ ends)
     */
    checkEarlySongStart() {
        if (this.djEarlySongStarted) return;
        
        const duration = this.djAudio.duration;
        const currentTime = this.djAudio.currentTime;
        const remaining = duration - currentTime;
        
        // Start next song when ~4 seconds remaining in DJ talk
        if (duration > 0 && remaining <= 4 && remaining > 0) {
            this.djEarlySongStarted = true;
            console.log('[Audio] Starting next song early, DJ has', remaining.toFixed(1), 'seconds left');
            
            // Trigger callback to start next song (music stays ducked)
            if (this.onEarlySongStart) {
                this.onEarlySongStart();
            }
        }
    }
    
    /**
     * Duck main audio volume for DJ talk
     */
    duckMainAudio(duck) {
        const targetVolume = duck 
            ? this.volume * CONFIG.AUDIO_CONFIG.musicDuckVolume
            : this.volume;
        
        // Smooth volume transition
        this.fadeVolume(this.mainAudio, this.mainAudio.volume, targetVolume, 500);
    }
    
    /**
     * Fade volume smoothly
     */
    fadeVolume(audio, from, to, duration) {
        const startTime = Date.now();
        const diff = to - from;
        
        const fade = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease in-out
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            audio.volume = from + (diff * eased);
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            }
        };
        
        requestAnimationFrame(fade);
    }
    
    /**
     * Crossfade between tracks
     */
    async crossfade(newUrl, duration = CONFIG.AUDIO_CONFIG.crossfadeDuration) {
        const oldVolume = this.mainAudio.volume;
        
        // Create temporary audio for crossfade
        const newAudio = new Audio(newUrl);
        newAudio.volume = 0;
        
        try {
            await newAudio.play();
            
            // Fade out old, fade in new
            const startTime = Date.now();
            
            const fadeStep = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                this.mainAudio.volume = oldVolume * (1 - progress);
                newAudio.volume = oldVolume * progress;
                
                if (progress < 1) {
                    requestAnimationFrame(fadeStep);
                } else {
                    // Swap audio sources
                    this.mainAudio.pause();
                    this.mainAudio.src = newUrl;
                    this.mainAudio.volume = oldVolume;
                    this.mainAudio.play();
                    newAudio.pause();
                }
            };
            
            requestAnimationFrame(fadeStep);
        } catch (error) {
            console.error('Crossfade error:', error);
            // Fallback to direct play
            this.playTrack(newUrl);
        }
    }
    
    /**
     * Stop all audio
     */
    stop() {
        this.mainAudio.pause();
        this.mainAudio.currentTime = 0;
        this.djAudio.pause();
        this.djAudio.currentTime = 0;
        this.isPlaying = false;
        this.stopVisualizer();
    }
    
    /**
     * Pause audio without resetting position (for station switching)
     */
    pauseForSwitch() {
        const position = this.mainAudio.currentTime;
        this.mainAudio.pause();
        this.djAudio.pause();
        this.isPlaying = false;
        this.stopVisualizer();
        return position; // Return position so it can be saved
    }
    
    /**
     * Set volume (0-1)
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        
        if (!this.isMuted) {
            this.mainAudio.volume = this.volume;
            this.djAudio.volume = this.volume * CONFIG.AUDIO_CONFIG.djVolumeBoost;
        }
        
        Utils.storage.set('radioVolume', this.volume);
        this.updateVUMeter();
    }
    
    /**
     * Toggle mute
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        this.mainAudio.muted = this.isMuted;
        this.djAudio.muted = this.isMuted;
        
        return this.isMuted;
    }
    
    /**
     * Get current track time info
     */
    getCurrentTime() {
        return {
            current: this.mainAudio.currentTime,
            duration: this.mainAudio.duration || 0,
            remaining: (this.mainAudio.duration || 0) - this.mainAudio.currentTime
        };
    }
    
    /**
     * Seek to position (for rejoining broadcast)
     */
    seekTo(seconds) {
        if (this.mainAudio.duration) {
            this.mainAudio.currentTime = Math.min(seconds, this.mainAudio.duration);
        }
    }
    
    /**
     * Handle track end
     */
    handleTrackEnd() {
        console.log('[Audio] Track ended');
        if (this.onTrackEnd) {
            this.onTrackEnd();
        }
    }
    
    /**
     * Handle DJ audio end
     */
    handleDJEnd() {
        console.log('[Audio] DJ audio ended');
        // Restore main audio volume
        this.duckMainAudio(false);
        if (this.onDJEnd) {
            this.onDJEnd();
        }
    }
    
    /**
     * Check if DJ audio is currently playing
     */
    isDJPlaying() {
        return this.djAudio && !this.djAudio.paused && this.djAudio.currentTime > 0;
    }
    
    /**
     * Handle audio errors
     */
    handleAudioError(error) {
        console.error('Audio error:', error);
        Utils.showToast('Audio playback error', 'error');
    }
    
    /**
     * Initialize visualizer canvas
     */
    initVisualizer(canvasId = 'audio-visualizer') {
        this.visualizerCanvas = document.getElementById(canvasId);
        if (this.visualizerCanvas) {
            this.visualizerCtx = this.visualizerCanvas.getContext('2d');
            this.resizeVisualizer();
            
            window.addEventListener('resize', Utils.debounce(() => {
                this.resizeVisualizer();
            }, 200));
        }
    }
    
    /**
     * Resize visualizer canvas
     */
    resizeVisualizer() {
        if (this.visualizerCanvas) {
            const rect = this.visualizerCanvas.parentElement.getBoundingClientRect();
            this.visualizerCanvas.width = rect.width;
            this.visualizerCanvas.height = rect.height;
        }
    }
    
    /**
     * Start audio visualization
     */
    startVisualizer() {
        if (!this.visualizerCanvas || !this.analyser) return;
        
        const draw = () => {
            this.visualizerAnimationId = requestAnimationFrame(draw);
            this.drawVisualizer();
        };
        
        draw();
    }
    
    /**
     * Stop visualizer
     */
    stopVisualizer() {
        if (this.visualizerAnimationId) {
            cancelAnimationFrame(this.visualizerAnimationId);
            this.visualizerAnimationId = null;
        }
    }
    
    /**
     * Draw visualizer frame
     */
    drawVisualizer() {
        if (!this.visualizerCtx || !this.analyser) return;
        
        const width = this.visualizerCanvas.width;
        const height = this.visualizerCanvas.height;
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        this.analyser.getByteFrequencyData(dataArray);
        
        // Clear canvas
        this.visualizerCtx.clearRect(0, 0, width, height);
        
        // Get current theme
        const theme = document.body.dataset.theme;
        
        // Draw based on decade theme
        switch (theme) {
            case '70s':
                this.drawCircularVisualizer(dataArray, width, height);
                break;
            case '80s':
                this.drawBarsVisualizer(dataArray, width, height);
                break;
            case '90s':
                this.drawPixelVisualizer(dataArray, width, height);
                break;
            default:
                this.drawBarsVisualizer(dataArray, width, height);
        }
    }
    
    /**
     * 70s Circular/Psychedelic visualizer
     */
    drawCircularVisualizer(dataArray, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 4;
        
        this.visualizerCtx.beginPath();
        
        for (let i = 0; i < dataArray.length; i++) {
            const angle = (i / dataArray.length) * Math.PI * 2;
            const amplitude = dataArray[i] / 255;
            const r = radius + (amplitude * radius * 0.5);
            
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            if (i === 0) {
                this.visualizerCtx.moveTo(x, y);
            } else {
                this.visualizerCtx.lineTo(x, y);
            }
        }
        
        this.visualizerCtx.closePath();
        
        const gradient = this.visualizerCtx.createRadialGradient(
            centerX, centerY, 0, centerX, centerY, radius * 1.5
        );
        gradient.addColorStop(0, 'rgba(255, 107, 53, 0.8)');
        gradient.addColorStop(0.5, 'rgba(253, 200, 48, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 107, 53, 0.2)');
        
        this.visualizerCtx.strokeStyle = gradient;
        this.visualizerCtx.lineWidth = 3;
        this.visualizerCtx.stroke();
        
        this.visualizerCtx.fillStyle = 'rgba(253, 200, 48, 0.1)';
        this.visualizerCtx.fill();
    }
    
    /**
     * 80s Neon bars visualizer
     */
    drawBarsVisualizer(dataArray, width, height) {
        const barCount = 32;
        const barWidth = width / barCount - 2;
        const barGap = 2;
        
        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor(i * dataArray.length / barCount);
            const barHeight = (dataArray[dataIndex] / 255) * height * 0.8;
            
            const x = i * (barWidth + barGap);
            const y = height - barHeight;
            
            // Neon gradient
            const gradient = this.visualizerCtx.createLinearGradient(x, height, x, y);
            gradient.addColorStop(0, 'rgba(255, 0, 255, 0.9)');
            gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 0, 255, 0.9)');
            
            this.visualizerCtx.fillStyle = gradient;
            this.visualizerCtx.fillRect(x, y, barWidth, barHeight);
            
            // Glow effect
            this.visualizerCtx.shadowColor = '#00ffff';
            this.visualizerCtx.shadowBlur = 10;
        }
        
        this.visualizerCtx.shadowBlur = 0;
    }
    
    /**
     * 90s Pixelated visualizer
     */
    drawPixelVisualizer(dataArray, width, height) {
        const pixelSize = 8;
        const cols = Math.floor(width / pixelSize);
        const rows = Math.floor(height / pixelSize);
        
        for (let i = 0; i < cols; i++) {
            const dataIndex = Math.floor(i * dataArray.length / cols);
            const amplitude = dataArray[dataIndex] / 255;
            const filledRows = Math.floor(amplitude * rows);
            
            for (let j = 0; j < filledRows; j++) {
                const x = i * pixelSize;
                const y = height - ((j + 1) * pixelSize);
                
                // Color based on height
                const hue = (j / rows) * 60 + 180; // Cyan to yellow
                this.visualizerCtx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
                this.visualizerCtx.fillRect(x, y, pixelSize - 1, pixelSize - 1);
            }
        }
    }
    
    /**
     * Update VU meter display
     */
    updateVUMeter() {
        const vuBars = document.querySelectorAll('.vu-bar');
        if (!vuBars.length) return;
        
        if (this.analyser && this.isPlaying) {
            const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(dataArray);
            
            vuBars.forEach((bar, index) => {
                const dataIndex = Math.floor(index * dataArray.length / vuBars.length);
                const height = (dataArray[dataIndex] / 255) * 100;
                bar.style.height = `${height}%`;
            });
        }
    }
    
    /**
     * Play radio static sound effect (tuning between stations)
     */
    playStaticEffect(duration = 1.5) {
        // Generate white noise with radio-like characteristics
        if (!this.audioContext) {
            this.initWebAudio();
        }
        if (!this.audioContext) return;
        
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);
        
        // Create stereo white noise with some variation
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < bufferSize; i++) {
                // Mix of white noise and some crackle
                const noise = Math.random() * 2 - 1;
                const crackle = Math.random() < 0.02 ? (Math.random() * 2 - 1) * 3 : 0;
                // Add some sweeping effect
                const sweep = Math.sin(i / bufferSize * Math.PI * 4) * 0.3;
                data[i] = (noise * 0.7 + crackle * 0.3 + sweep * 0.2) * (0.5 + Math.random() * 0.5);
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // Add a bandpass filter for more radio-like sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.5;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime + duration * 0.7);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();
    }
    
    /**
     * Play time travel swoosh/warp sound effect
     */
    playTimeTravelSound(duration = 3.0) {
        if (!this.audioContext) {
            this.initWebAudio();
        }
        if (!this.audioContext) return;
        
        const sampleRate = this.audioContext.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(2, bufferSize, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < bufferSize; i++) {
                const t = i / sampleRate;
                const progress = i / bufferSize;
                
                // Rising frequency sweep (whoosh effect)
                const freq = 100 + progress * progress * 2000;
                const sweep = Math.sin(2 * Math.PI * freq * t) * 0.3;
                
                // Add some sci-fi warble
                const warble = Math.sin(2 * Math.PI * (200 + Math.sin(t * 10) * 100) * t) * 0.2;
                
                // Electrical crackle
                const crackle = Math.random() < 0.01 ? (Math.random() * 2 - 1) * 0.5 : 0;
                
                // Wind/rushing sound (filtered noise)
                const wind = (Math.random() * 2 - 1) * 0.15 * Math.sin(progress * Math.PI);
                
                // Envelope - builds up then fades
                const envelope = Math.sin(progress * Math.PI) * (1 - progress * 0.3);
                
                data[i] = (sweep + warble + crackle + wind) * envelope;
            }
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // Low pass filter for warmer sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 3000;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();
    }
    
    /**
     * Play toggle switch click sound (metallic)
     */
    playToggleSound() {
        if (!this.audioContext) {
            this.initWebAudio();
        }
        if (!this.audioContext) return;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.12;
        const bufferSize = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / sampleRate;
            // Sharp metallic click
            const click = Math.exp(-t * 120) * (Math.random() * 2 - 1) * 0.8;
            // Multiple metallic resonances for that industrial switch sound
            const metal1 = Math.sin(2 * Math.PI * 3200 * t) * Math.exp(-t * 80) * 0.4;
            const metal2 = Math.sin(2 * Math.PI * 4800 * t) * Math.exp(-t * 100) * 0.25;
            const metal3 = Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 60) * 0.3;
            // Spring tension release sound
            const spring = Math.sin(2 * Math.PI * (2000 - t * 8000) * t) * Math.exp(-t * 50) * 0.2;
            data[i] = click + metal1 + metal2 + metal3 + spring;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // High-pass filter for more metallic brightness
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 800;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.35;
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();
    }
    
    /**
     * Play button press sound (crisp metallic click)
     */
    playButtonSound() {
        if (!this.audioContext) {
            this.initWebAudio();
        }
        if (!this.audioContext) return;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.08; // Shorter, snappier
        const bufferSize = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / sampleRate;
            // Sharp initial transient click
            const click = Math.exp(-t * 300) * 0.8;
            // High metallic ping frequencies
            const metal1 = Math.sin(2 * Math.PI * 4500 * t) * Math.exp(-t * 150) * 0.5;
            const metal2 = Math.sin(2 * Math.PI * 6200 * t) * Math.exp(-t * 180) * 0.3;
            const metal3 = Math.sin(2 * Math.PI * 3200 * t) * Math.exp(-t * 120) * 0.4;
            // Brief noise burst for realistic click
            const noise = (Math.random() * 2 - 1) * Math.exp(-t * 250) * 0.3;
            data[i] = click + metal1 + metal2 + metal3 + noise;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // High-pass filter for crisp metallic sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1500;
        filter.Q.value = 0.7;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.3;
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();
    }
    
    /**
     * Play safety cover flip sound (heavy metallic cover)
     */
    playCoverSound() {
        if (!this.audioContext) {
            this.initWebAudio();
        }
        if (!this.audioContext) return;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.25;
        const bufferSize = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / sampleRate;
            // Heavy metallic clank with higher frequencies
            const clank = Math.sin(2 * Math.PI * 450 * t) * Math.exp(-t * 25) * 0.4;
            // High metallic impact harmonics for crisp sound
            const impact1 = Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t * 40) * 0.35;
            const impact2 = Math.sin(2 * Math.PI * 4400 * t) * Math.exp(-t * 55) * 0.25;
            const impact3 = Math.sin(2 * Math.PI * 6600 * t) * Math.exp(-t * 70) * 0.15;
            const impact4 = Math.sin(2 * Math.PI * 8800 * t) * Math.exp(-t * 85) * 0.1;
            // Sharp metallic click
            const click = Math.sin(2 * Math.PI * 3500 * t) * Math.exp(-t * 60) * 0.3;
            // Brief metallic ring
            const ring = Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 35) * 0.25;
            data[i] = clank + impact1 + impact2 + impact3 + impact4 + click + ring;
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // High-pass filter for metallic brightness
        const highpass = this.audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 800;
        highpass.Q.value = 0.7;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.45;
        
        source.connect(highpass);
        highpass.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();
    }
}

// Export for use in other modules
window.AudioSystem = AudioSystem;
