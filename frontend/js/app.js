/**
 * Retro Radio Time Machine - Main Application
 * The core application that manages state, navigation, and radio broadcasting
 */

class RetroRadioApp {
    constructor() {
        this.currentPage = 'landing-page';
        this.selectedDecade = null;
        this.currentStation = null;
        this.currentStations = [];
        this.playlist = [];
        this.playlistIndex = 0;
        this.isPlaying = false;
        this.djTalkCounter = 0;
        this.lastDJTalkType = null;
        this.radioPowerOn = true;  // Radio power state
        this.visualizationAnimationId = null;
        
        // Station broadcast state (simulates continuous broadcasting)
        this.stationStates = {};
        
        // Audio system
        this.audio = new AudioSystem();
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    /**
     * Initialize the application
     */
    async init() {
        console.log('[App] Retro Radio Time Machine initializing...');
        
        // Initialize animations
        Animations.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize visualizer
        this.audio.initVisualizer();
        
        // Set audio callbacks
        this.audio.onTrackEnd = () => this.onTrackEnd();
        this.audio.onDJEnd = () => this.onDJEnd();
        this.audio.onEarlySongStart = () => this.onEarlySongStart();
        
        // Initialize station broadcast times
        this.initializeStationStates();
        
        // Start station state simulation
        this.startBroadcastSimulation();
        
        console.log('[App] Retro Radio Time Machine ready!');
    }
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Era toggle switches (DeLorean style)
        document.querySelectorAll('.era-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => this.handleEraToggle(e));
        });
        
        // Legacy decade buttons (fallback)
        document.querySelectorAll('.decade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDecadeSelect(e));
        });
        
        // Safety cover
        const safetyCover = document.getElementById('safety-cover');
        if (safetyCover) {
            safetyCover.addEventListener('click', () => this.toggleSafetyCover());
        }
        
        // Engage time travel button
        const engageBtn = document.getElementById('engage-btn');
        if (engageBtn) {
            engageBtn.addEventListener('click', () => this.engageTimeTravel());
        }
        
        // Back buttons
        document.getElementById('back-to-time-machine')?.addEventListener('click', () => {
            this.navigateToPage('decade-hub', 'landing-page');
            this.resetTimeMachine();
            this.stopPlayback();
        });
        
        document.getElementById('back-to-stations')?.addEventListener('click', () => {
            this.navigateToPage('radio-player', 'decade-hub');
            this.stopPlayback();
        });
        
        // Return to present button (on retro radio page)
        document.getElementById('return-to-present')?.addEventListener('click', () => {
            this.returnToPresent();
        });
        
        // Volume controls
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.audio.setVolume(e.target.value / 100);
                this.updateVolumeKnob(e.target.value);
            });
        }
        
        // Volume knob rotation
        const volumeKnob = document.getElementById('volume-knob');
        if (volumeKnob) {
            this.setupVolumeKnob(volumeKnob);
        }
        
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const isMuted = this.audio.toggleMute();
                this.updateMuteState(isMuted);
            });
        }
        
        // Initialize present time clock
        this.updatePresentTime();
        setInterval(() => this.updatePresentTime(), 1000);
        
        // Initialize flux capacitor animation
        this.initFluxCapacitor();
        
        console.log('Event listeners configured');
    }
    
    /**
     * Handle era toggle switch click - with mechanical switch animation
     */
    handleEraToggle(e) {
        const toggle = e.currentTarget;
        const decade = toggle.dataset.decade;
        
        // Play toggle switch sound
        this.audio.playToggleSound();
        
        // Add clicking class for faster transition (mechanical click feel)
        toggle.classList.add('clicking');
        setTimeout(() => toggle.classList.remove('clicking'), 100);
        
        // Deselect all toggles with animation
        document.querySelectorAll('.era-toggle').forEach(t => {
            if (t !== toggle && t.classList.contains('active')) {
                t.classList.remove('active');
            }
        });
        
        // Toggle the clicked switch (if already active, deactivate)
        if (toggle.classList.contains('active')) {
            toggle.classList.remove('active');
            this.selectedDecade = null;
            this.deactivateFluxCapacitor();
            
            // Update status
            const statusEl = document.getElementById('system-status');
            if (statusEl) {
                statusEl.textContent = 'AWAITING INPUT';
            }
            
            // Disable engage button and remove armed glow
            const engageBtn = document.getElementById('engage-btn');
            if (engageBtn) {
                engageBtn.disabled = true;
                engageBtn.classList.remove('armed');
            }
            
            // Reset indicator lights
            this.updateIndicatorLights('ready');
            
            // Clear destination display
            this.clearDestinationTime();
            return;
        }
        
        // Activate the toggle
        toggle.classList.add('active');
        this.selectedDecade = decade;
        
        // Update time circuits with animation
        this.updateDestinationTime(decade);
        
        // Enable engage button only if safety cover is also open
        const engageBtn = document.getElementById('engage-btn');
        const safetyCover = document.getElementById('safety-cover');
        const isSafetyOpen = safetyCover && safetyCover.classList.contains('open');
        if (engageBtn) {
            engageBtn.disabled = !isSafetyOpen;
            if (isSafetyOpen) {
                engageBtn.classList.add('armed');
            }
        }
        
        // Update status
        const statusEl = document.getElementById('system-status');
        if (statusEl) {
            statusEl.textContent = `DESTINATION: ${CONFIG.DECADES[decade].name}`;
        }
        
        // Update indicator lights
        this.updateIndicatorLights('armed');
        
        // Activate flux capacitor with power-up animation
        this.activateFluxCapacitor();
        
        // Trigger a small lightning flash for effect
        if (window.Animations) {
            Animations.triggerSingleLightning();
        }
    }
    
    /**
     * Toggle safety cover and activate plutonium gauge
     */
    toggleSafetyCover() {
        const cover = document.getElementById('safety-cover');
        if (cover) {
            const isOpening = !cover.classList.contains('open');
            cover.classList.toggle('open');
            
            // Play cover flip sound
            this.audio.playCoverSound();
            
            // Also play toggle/arming sound for the arming effect
            setTimeout(() => this.audio.playToggleSound(), 100);
            
            // Activate/deactivate plutonium indicator
            const plutoniumIndicator = document.querySelector('.plutonium-indicator');
            const plutoniumStatus = document.getElementById('plutonium-status');
            const radiationSymbol = document.querySelector('.radiation-symbol');
            const engageBtn = document.getElementById('engage-btn');
            
            if (isOpening) {
                // Activating - safety cover lifted
                if (plutoniumIndicator) plutoniumIndicator.classList.add('active');
                if (radiationSymbol) radiationSymbol.classList.add('active');
                if (plutoniumStatus) {
                    plutoniumStatus.textContent = 'ARMED';
                    plutoniumStatus.style.color = '#ff3030';
                    plutoniumStatus.style.textShadow = '0 0 10px #ff0000';
                }
                // Enable engage button only if era is also selected
                if (engageBtn && this.selectedDecade) {
                    engageBtn.disabled = false;
                    engageBtn.classList.add('armed');
                }
            } else {
                // Deactivating - safety cover closed
                if (plutoniumIndicator) plutoniumIndicator.classList.remove('active');
                if (radiationSymbol) radiationSymbol.classList.remove('active');
                if (plutoniumStatus) {
                    plutoniumStatus.textContent = 'CHAMBER FULL';
                    plutoniumStatus.style.color = '#00ff00';
                    plutoniumStatus.style.textShadow = '0 0 6px #00ff00';
                }
                // Disable engage button when safety cover is closed
                if (engageBtn) {
                    engageBtn.disabled = true;
                    engageBtn.classList.remove('armed');
                }
            }
        }
    }
    
    /**
     * Clear destination time display
     */
    clearDestinationTime() {
        const elements = {
            'm1': '-', 'm2': '-', 'm3': '-',
            'd1': '-', 'd2': '-',
            'y1': '-', 'y2': '-', 'y3': '-', 'y4': '-',
            'h1': '-', 'h2': '-',
            'min1': '-', 'min2': '-',
            'ampm': '--'
        };
        
        Object.keys(elements).forEach(key => {
            const el = document.getElementById(`dest-${key}`);
            if (el) el.textContent = elements[key];
        });
    }
    
    /**
     * Update destination time display - uses current date/time but changes year to destination era
     */
    updateDestinationTime(decade) {
        const config = CONFIG.DECADES[decade];
        if (!config) return;
        
        // Use current date and time, but change the year to the destination era
        const now = new Date();
        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        const month = months[now.getMonth()];
        const day = String(now.getDate()).padStart(2, '0');
        const year = String(config.year);
        
        // Use current time
        let hours = now.getHours();
        const mins = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const hoursStr = String(hours).padStart(2, '0');
        
        // Animate the LED display
        this.animateLEDDisplay('dest', {
            month: month,
            day: day,
            year: year,
            time: `${hoursStr}:${mins}`,
            ampm: ampm
        });
    }

    /**
     * Animate LED display update
     */
    animateLEDDisplay(prefix, values) {
        // Month
        if (values.month) {
            for (let i = 0; i < 3; i++) {
                const el = document.getElementById(`${prefix}-m${i+1}`);
                if (el) el.textContent = values.month[i] || '-';
            }
        }
        
        // Day
        if (values.day) {
            const d1 = document.getElementById(`${prefix}-d1`);
            const d2 = document.getElementById(`${prefix}-d2`);
            if (d1) d1.textContent = values.day[0] || '-';
            if (d2) d2.textContent = values.day[1] || '-';
        }
        
        // Year
        if (values.year) {
            for (let i = 0; i < 4; i++) {
                const el = document.getElementById(`${prefix}-y${i+1}`);
                if (el) el.textContent = values.year[i] || '-';
            }
        }
        
        // Time
        if (values.time) {
            const [hours, mins] = values.time.split(':');
            const h1 = document.getElementById(`${prefix}-h1`);
            const h2 = document.getElementById(`${prefix}-h2`);
            const min1 = document.getElementById(`${prefix}-min1`);
            const min2 = document.getElementById(`${prefix}-min2`);
            if (h1) h1.textContent = hours[0] || '-';
            if (h2) h2.textContent = hours[1] || '-';
            if (min1) min1.textContent = mins[0] || '-';
            if (min2) min2.textContent = mins[1] || '-';
        }
        
        // AM/PM
        if (values.ampm) {
            const ampmEl = document.getElementById(`${prefix}-ampm`);
            if (ampmEl) ampmEl.textContent = values.ampm;
        }
    }
    
    /**
     * Update present time display
     */
    updatePresentTime() {
        const now = new Date();
        let hours = now.getHours();
        const mins = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const hoursStr = String(hours).padStart(2, '0');
        
        this.animateLEDDisplay('pres', {
            time: `${hoursStr}:${mins}`,
            ampm: ampm
        });
    }
    
    /**
     * Update indicator lights
     */
    updateIndicatorLights(state) {
        const ready = document.getElementById('ready-light');
        const armed = document.getElementById('armed-light');
        const danger = document.getElementById('danger-light');
        
        // Clear all
        [ready, armed, danger].forEach(light => {
            if (light) light.classList.remove('active');
        });
        
        switch (state) {
            case 'ready':
                if (ready) ready.classList.add('active');
                break;
            case 'armed':
                if (ready) ready.classList.add('active');
                if (armed) armed.classList.add('active');
                break;
            case 'danger':
                if (danger) danger.classList.add('active');
                break;
            case 'all':
                [ready, armed, danger].forEach(light => {
                    if (light) light.classList.add('active');
                });
                break;
        }
    }
    
    /**
     * Initialize flux capacitor
     */
    initFluxCapacitor() {
        // Set initial state
        this.fluxActive = false;
    }
    
    /**
     * Activate flux capacitor animation
     */
    activateFluxCapacitor() {
        const fluxUnit = document.querySelector('.flux-capacitor-unit');
        if (fluxUnit) {
            fluxUnit.classList.add('active');
        }
        
        // Animate energy bars
        const energies = ['flux-top', 'flux-left', 'flux-right'];
        energies.forEach((id, i) => {
            const el = document.getElementById(id);
            if (el) {
                setTimeout(() => {
                    el.style.height = '100%';
                }, i * 200);
            }
        });
        
        // Animate power meter
        this.animatePowerMeter(1.21);
    }
    
    /**
     * Deactivate flux capacitor - only when ALL toggles are off
     */
    deactivateFluxCapacitor() {
        // Check if ANY toggle is still active
        const anyActive = document.querySelector('.era-toggle.active');
        if (anyActive) {
            // Don't deactivate if any toggle is still on
            return;
        }
        
        const fluxUnit = document.querySelector('.flux-capacitor-unit');
        if (fluxUnit) {
            fluxUnit.classList.remove('active');
        }
        
        // Reset energy bars
        const energies = ['flux-top', 'flux-left', 'flux-right'];
        energies.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.height = '0%';
            }
        });
        
        // Reset power meter to 0
        this.animatePowerMeter(0);
    }
    
    /**
     * Animate power meter
     */
    animatePowerMeter(targetGW) {
        const fill = document.getElementById('power-fill');
        const readout = document.getElementById('power-readout');
        const targetLine = document.getElementById('power-target-line');
        
        // Get current value for smooth animation
        const currentValue = parseFloat(readout?.textContent || '0');
        
        if (fill) {
            const percent = (targetGW / 1.5) * 100;
            fill.style.width = `${percent}%`;
        }
        
        // Control the red target line - same logic as meter
        if (targetLine) {
            if (targetGW > 0) {
                // Show and position the target line at 1.21 GW position
                const targetPercent = (1.21 / 1.5) * 100;
                targetLine.style.left = `${targetPercent}%`;
                targetLine.classList.add('active');
            } else {
                // Hide and reset the target line when meter goes to 0
                targetLine.classList.remove('active');
                targetLine.style.left = '0%';
            }
        }
        
        if (readout) {
            // Clear any existing animation
            if (this.powerMeterInterval) {
                clearInterval(this.powerMeterInterval);
            }
            
            // Animate counting up or down
            let current = currentValue;
            const diff = targetGW - currentValue;
            const steps = 20;
            const stepValue = diff / steps;
            
            this.powerMeterInterval = setInterval(() => {
                current += stepValue;
                if ((stepValue > 0 && current >= targetGW) || (stepValue < 0 && current <= targetGW)) {
                    current = targetGW;
                    clearInterval(this.powerMeterInterval);
                }
                readout.textContent = Math.max(0, current).toFixed(2);
            }, 50);
        }
    }
    
    /**
     * Setup volume knob rotation
     */
    setupVolumeKnob(knob) {
        let isDragging = false;
        let startY = 0;
        let startValue = 75;
        
        const updateKnob = (value) => {
            const rotation = (value / 100) * 270 - 135;
            knob.style.transform = `rotate(${rotation}deg)`;
            
            const slider = document.getElementById('volume-slider');
            if (slider) slider.value = value;
            
            this.audio.setVolume(value / 100);
        };
        
        knob.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startValue = parseInt(document.getElementById('volume-slider')?.value || 75);
            document.body.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaY = startY - e.clientY;
            const newValue = Math.max(0, Math.min(100, startValue + deltaY));
            updateKnob(newValue);
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.cursor = '';
        });
        
        // Initialize position
        updateKnob(75);
    }
    
    /**
     * Update volume knob visual
     */
    updateVolumeKnob(value) {
        const knob = document.getElementById('volume-knob');
        if (knob) {
            const rotation = (value / 100) * 270 - 135;
            knob.style.transform = `rotate(${rotation}deg)`;
        }
    }
    
    /**
     * Update mute state visual
     */
    updateMuteState(isMuted) {
        const muteBtn = document.getElementById('mute-btn');
        const volumeIcon = document.getElementById('volume-icon');
        
        if (muteBtn) {
            muteBtn.classList.toggle('muted', isMuted);
        }
        
        if (volumeIcon) {
            volumeIcon.innerHTML = isMuted 
                ? '<path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>'
                : '<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        }
    }
    
    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case ' ':
                    // Space toggles mute
                    if (this.currentPage === 'radio-player') {
                        e.preventDefault();
                        const isMuted = this.audio.toggleMute();
                        Components.updateVolumeDisplay(this.audio.volume, isMuted);
                    }
                    break;
                case 'ArrowUp':
                    // Volume up
                    if (this.currentPage === 'radio-player') {
                        e.preventDefault();
                        const newVol = Math.min(this.audio.volume + 0.1, 1);
                        this.audio.setVolume(newVol);
                        Components.updateVolumeDisplay(newVol, this.audio.isMuted);
                    }
                    break;
                case 'ArrowDown':
                    // Volume down
                    if (this.currentPage === 'radio-player') {
                        e.preventDefault();
                        const newVol = Math.max(this.audio.volume - 0.1, 0);
                        this.audio.setVolume(newVol);
                        Components.updateVolumeDisplay(newVol, this.audio.isMuted);
                    }
                    break;
                case 'Escape':
                    // Go back
                    if (this.currentPage === 'radio-player') {
                        this.navigateToPage('radio-player', 'decade-hub');
                        this.stopPlayback();
                    } else if (this.currentPage === 'decade-hub') {
                        this.navigateToPage('decade-hub', 'landing-page');
                        this.resetTimeMachine();
                    }
                    break;
            }
        });
    }
    
    /**
     * Handle decade selection
     */
    handleDecadeSelect(event) {
        const btn = event.currentTarget;
        const decade = btn.dataset.decade;
        
        // Clear previous selection
        document.querySelectorAll('.decade-btn').forEach(b => b.classList.remove('selected'));
        
        // Set new selection
        btn.classList.add('selected');
        this.selectedDecade = decade;
        
        // Update time circuits
        Components.updateTimeCircuits(decade);
        
        // Power up flux capacitor
        Animations.powerUpFluxCapacitor();
        
        // Enable engage button
        const engageBtn = document.getElementById('engage-btn');
        if (engageBtn) {
            engageBtn.disabled = false;
        }
        
        // Lightning effect
        Animations.triggerLightningEffect(btn);
    }
    
    /**
     * Engage time travel to selected decade
     */
    async engageTimeTravel() {
        if (!this.selectedDecade) return;
        
        console.log(`[App] Time traveling to ${this.selectedDecade}...`);
        
        // Play button press sound
        this.audio.playButtonSound();
        
        // Play time travel swoosh sound
        setTimeout(() => {
            this.audio.playTimeTravelSound();
        }, 200);
        
        // Play time travel animation
        await Animations.playTimeTravelTransition(this.selectedDecade);
        
        // Apply decade theme
        Animations.applyDecadeTheme(this.selectedDecade);
        
        // Load stations for decade
        await this.loadStations(this.selectedDecade);
        
        // Render the retro radio interface and navigate to it
        Components.renderRetroRadio(this.selectedDecade, this.currentStations);
        
        // Navigate directly to retro radio page (skip station selection)
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('retro-radio-page').classList.add('active');
        this.currentPage = 'retro-radio-page';
        
        // Auto-tune to first station
        if (this.currentStations.length > 0) {
            await this.tuneToRetroStation(this.currentStations[0].id, 0);
        }
        
        Utils.showToast(`Welcome to the ${CONFIG.DECADES[this.selectedDecade].name}!`, 'info');
    }
    
    /**
     * Tune to a station on the retro radio (no page navigation needed)
     */
    async tuneToRetroStation(stationId, stationIndex) {
        console.log(`[App] Tuning retro radio to station: ${stationId}`);
        
        // Save current station state before switching
        if (this.currentStation) {
            const currentPosition = this.audio.mainAudio?.currentTime || 0;
            if (this.stationStates[this.currentStation.id]) {
                this.stationStates[this.currentStation.id].trackPositionSeconds = currentPosition;
            }
            this.saveStationState(this.currentStation.id);
        }
        
        // Pause current playback
        this.audio.pauseForSwitch();
        
        // Play static noise while tuning
        this.audio.playStaticEffect();
        
        // Wait for static effect
        await Utils.sleep(800);
        
        // Get station info
        const station = this.currentStations.find(s => s.id === stationId);
        if (!station) {
            console.error('Station not found:', stationId);
            return;
        }
        
        this.currentStation = station;
        
        // Update retro radio display
        Components.updateRetroStationInfo(this.selectedDecade, station, stationIndex);
        
        // Try to restore state, otherwise load fresh
        const restored = await this.restoreStationState(stationId);
        if (!restored) {
            await this.loadPlaylist(stationId);
        }
        
        // Start playing
        await this.startBroadcast();
        
        // Start audio visualization
        this.startRetroVisualization();
    }
    
    /**
     * Switch to a station on the retro radio interface
     */
    async switchToStation(stationId, stationIndex) {
        await this.tuneToRetroStation(stationId, parseInt(stationIndex) || 0);
    }
    
    /**
     * Toggle radio power
     */
    async toggleRadioPower() {
        this.radioPowerOn = !this.radioPowerOn;
        
        // Play power toggle sound
        this.audio.playToggleSound();
        
        // Update visual state
        Components.toggleRadioPowerVisual(this.selectedDecade, this.radioPowerOn);
        
        if (this.radioPowerOn) {
            // Turn on - resume playback from calculated broadcast position
            if (this.currentStation && this.stationStates[this.currentStation.id]) {
                const state = this.stationStates[this.currentStation.id];
                const elapsedMs = Date.now() - (state.powerOffTime || Date.now());
                const elapsedSec = elapsedMs / 1000;
                
                console.log(`[App] Power on: elapsed ${elapsedSec.toFixed(1)}s, saved position ${state.trackPositionSeconds.toFixed(1)}s`);
                
                // Calculate new position based on elapsed time
                // Use saved track position directly, don't try to advance tracks
                let newPosition = (state.trackPositionSeconds || 0) + elapsedSec;
                
                // Cap at a reasonable max (5 minutes) to avoid seeking past track end
                // The actual seek will clamp to track duration
                newPosition = newPosition % 300; // Wrap around every 5 minutes
                
                console.log(`[App] Seeking to position: ${newPosition.toFixed(1)}s`);
                
                // Store seek position for playCurrentTrack to use
                this.seekToPosition = newPosition;
                await this.startBroadcast();
            } else if (this.currentStation) {
                await this.startBroadcast();
            }
            // Start visualization
            this.startRetroVisualization();
        } else {
            // Turn off - save current position and timestamp
            if (this.currentStation && this.stationStates[this.currentStation.id]) {
                const currentPosition = this.audio.mainAudio?.currentTime || 0;
                this.stationStates[this.currentStation.id].trackPositionSeconds = currentPosition;
                this.stationStates[this.currentStation.id].powerOffTime = Date.now();
                this.stationStates[this.currentStation.id].lastLeftTime = Date.now();
            }
            this.stopPlayback();
            // Stop visualization
            if (this.visualizationAnimationId) {
                cancelAnimationFrame(this.visualizationAnimationId);
                this.visualizationAnimationId = null;
            }
        }
    }
    
    /**
     * Start retro visualization animation loop
     */
    startRetroVisualization() {
        // Stop any existing visualization
        if (this.visualizationAnimationId) {
            cancelAnimationFrame(this.visualizationAnimationId);
        }
        
        const animate = () => {
            if (!this.isPlaying) {
                this.visualizationAnimationId = null;
                return;
            }
            
            // Get audio data
            const audioData = this.audio.getFrequencyData();
            
            if (this.selectedDecade === '70s') {
                // Animate VU meters
                const leftLevel = audioData ? audioData[0] / 255 : Math.random() * 0.3 + 0.3;
                const rightLevel = audioData ? audioData[1] / 255 : Math.random() * 0.3 + 0.3;
                Components.animateVUMeters(leftLevel, rightLevel);
            } else if (this.selectedDecade === '80s') {
                // Animate spectrum analyzer
                Components.animateSpectrum(audioData ? Array.from(audioData).slice(0, 16).map(v => v / 255) : null);
            } else if (this.selectedDecade === '90s') {
                // Animate sound waves
                Components.animateSoundWaves(audioData ? Array.from(audioData).slice(0, 15).map(v => v / 255) : null);
            }
            
            this.visualizationAnimationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * Load stations for a decade
     */
    async loadStations(decade) {
        Utils.setLoading(true, 'Loading stations...');
        
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/stations/${decade}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch stations');
            }
            
            const data = await response.json();
            this.currentStations = data.stations || [];
            
            // Render stations grid
            Components.renderStationsGrid(this.currentStations, decade);
            
            console.log(`[App] Loaded ${this.currentStations.length} stations for ${decade}`);
        } catch (error) {
            console.error('Error loading stations:', error);
            Utils.showToast('Error loading stations', 'error');
            
            // Use fallback data if API fails
            this.loadFallbackStations(decade);
        } finally {
            Utils.setLoading(false);
        }
    }
    
    /**
     * Fallback station data if API fails
     */
    loadFallbackStations(decade) {
        const fallbackStations = {
            '70s': [
                { id: '70s-1', name: 'Disco Fever', host: 'Funky Fred', genre: 'disco, funk' },
                { id: '70s-2', name: 'Classic Rock', host: 'Rockin\' Roger', genre: 'rock' },
                { id: '70s-3', name: 'Soul Train', host: 'Smooth Steve', genre: 'soul, R&B' },
                { id: '70s-4', name: 'Punk Pioneers', host: 'Rebel Rita', genre: 'punk' }
            ],
            '80s': [
                { id: '80s-1', name: 'Synthwave Central', host: 'DJ Neon Rick', genre: 'synthwave' },
                { id: '80s-2', name: 'Pop Explosion', host: 'Madonna Mike', genre: 'pop' },
                { id: '80s-3', name: 'Rock Arena', host: 'Metal Mandy', genre: 'metal' },
                { id: '80s-4', name: 'New Wave Paradise', host: 'Duran Dan', genre: 'new wave' }
            ],
            '90s': [
                { id: '90s-1', name: 'Grunge Station', host: 'Alternative Alice', genre: 'grunge' },
                { id: '90s-2', name: 'Hip Hop Headquarters', host: 'Fresh Prince Phil', genre: 'hip hop' },
                { id: '90s-3', name: 'Boy Band Boulevard', host: 'Backstreet Bob', genre: 'pop' },
                { id: '90s-4', name: 'Britpop Beats', host: 'Oasis Owen', genre: 'britpop' }
            ]
        };
        
        this.currentStations = fallbackStations[decade] || [];
        Components.renderStationsGrid(this.currentStations, decade);
    }
    
    /**
     * Tune to a specific station
     */
    async tuneToStation(stationId, decade) {
        console.log(`[App] Tuning to station: ${stationId}`);
        
        Utils.setLoading(true, 'Tuning in...');
        
        try {
            // Save current station state before switching (with position)
            if (this.currentStation) {
                const currentPosition = this.audio.mainAudio?.currentTime || 0;
                if (this.stationStates[this.currentStation.id]) {
                    this.stationStates[this.currentStation.id].trackPositionSeconds = currentPosition;
                }
                this.saveStationState(this.currentStation.id);
            }
            
            // Pause current playback (preserves position for switching back)
            this.audio.pauseForSwitch();
            
            // Play static noise while tuning
            this.audio.playStaticEffect();
            
            // Play tuning animation
            await Animations.playTuningAnimation();
            
            // Get station info
            const station = this.currentStations.find(s => s.id === stationId);
            if (!station) throw new Error('Station not found');
            
            this.currentStation = station;
            
            // Try to restore state, otherwise load fresh
            const restored = await this.restoreStationState(stationId);
            if (!restored) {
                await this.loadPlaylist(stationId);
            }
            
            // Navigate to player
            await Animations.transitionToPage('decade-hub', 'radio-player');
            this.currentPage = 'radio-player';
            
            // Update UI
            this.updatePlayerUI(station, decade);
            
            // Start playing (will seek to position if restored)
            await this.startBroadcast();
            
        } catch (error) {
            console.error('Error tuning to station:', error);
            Utils.showToast('Error tuning to station', 'error');
        } finally {
            Utils.setLoading(false);
        }
    }
    
    /**
     * Load playlist for station
     */
    async loadPlaylist(stationId) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/music/playlist/${stationId}`);
            
            if (!response.ok) {
                throw new Error('Failed to load playlist');
            }
            
            const data = await response.json();
            this.playlist = data.tracks || [];
            this.playlistIndex = 0;
            
            // Calculate join position (simulate continuous broadcast)
            this.calculateBroadcastPosition(stationId);
            
            console.log(`[App] Loaded ${this.playlist.length} tracks`);
        } catch (error) {
            console.error('Error loading playlist:', error);
            this.playlist = [];
        }
    }
    
    /**
     * Calculate where to join the broadcast
     */
    calculateBroadcastPosition(stationId) {
        const state = this.stationStates[stationId];
        if (state && this.playlist.length > 0) {
            // Join at the station's current position
            this.playlistIndex = state.currentTrackIndex % this.playlist.length;
        }
    }
    
    /**
     * Update player UI with station info
     */
    updatePlayerUI(station, decade) {
        Components.updatePlayerStationName(station.name);
        Components.renderBillboardChart(decade);
        Components.renderNewsPanel(decade);
        Components.renderNewsTicker(decade);
        Components.renderOtherStations(this.currentStations, station.id);
        Components.updateVolumeDisplay(this.audio.volume, this.audio.isMuted);
        
        // Update DJ info
        Components.updateDJBooth({
            name: station.host,
            speech: `Welcome to ${station.name}! Get ready for the best ${station.genre} hits!`,
            isTalking: false
        });
    }
    
    /**
     * Start the radio broadcast
     */
    async startBroadcast() {
        if (this.playlist.length === 0) {
            console.warn('No tracks in playlist');
            Components.updateNowPlaying({
                title: 'No tracks available',
                artist: 'Please add music files',
                album: ''
            });
            return;
        }
        
        this.isPlaying = true;
        // Only reset djTalkCounter if not restoring state (seekToPosition indicates restore)
        if (!this.seekToPosition) {
            this.djTalkCounter = 0;
        }
        
        // Just start playing - DJ only talks BETWEEN songs, not on entry
        await this.playCurrentTrack();
    }
    
    /**
     * Play current track in playlist
     */
    async playCurrentTrack() {
        if (this.playlistIndex >= this.playlist.length) {
            this.playlistIndex = 0;
        }
        
        const track = this.playlist[this.playlistIndex];
        if (!track) return;
        
        // Get track info
        const trackInfo = await this.getTrackInfo(track);
        
        // Update UI (both legacy and retro radio)
        Components.updateNowPlaying(trackInfo);
        Components.updateMediaDisplay(this.selectedDecade, true);
        
        // Update retro radio display
        Components.updateRetroNowPlaying(this.selectedDecade, trackInfo);
        
        // Update billboard to highlight current song
        Components.renderBillboardChart(this.selectedDecade, trackInfo.title);
        
        // Build stream URL
        const streamUrl = `${CONFIG.API_BASE_URL}/music/stream/${track.stationId}/${track.filename}`;
        
        // Play track
        await this.audio.playTrack(streamUrl);
        
        // Seek to saved position if we're restoring state
        if (this.seekToPosition && this.seekToPosition > 0) {
            // Wait for audio to be loaded enough to seek
            const seekPosition = this.seekToPosition;
            this.seekToPosition = null; // Clear immediately to prevent double-seeking
            
            const attemptSeek = () => {
                if (this.audio.mainAudio && this.audio.mainAudio.duration > 0) {
                    const seekTo = Math.min(seekPosition, this.audio.mainAudio.duration - 5);
                    if (seekTo > 0) {
                        this.audio.mainAudio.currentTime = seekTo;
                        console.log(`[App] Seeked to ${seekTo.toFixed(1)}s (continuous broadcast)`);
                    }
                } else {
                    // Try again in 200ms if duration not ready
                    setTimeout(attemptSeek, 200);
                }
            };
            
            // Start attempting to seek after a brief delay
            setTimeout(attemptSeek, 300);
        }
        
        console.log(`[App] Now playing: ${trackInfo.title} - ${trackInfo.artist}`);
    }
    
    /**
     * Get track metadata
     */
    async getTrackInfo(track) {
        try {
            const response = await fetch(
                `${CONFIG.API_BASE_URL}/music/track-info/${track.stationId}/${track.filename}`
            );
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching track info:', error);
        }
        
        // Fallback: parse filename
        return Utils.parseTrackFilename(track.filename);
    }
    
    /**
     * Handle track end
     */
    async onTrackEnd() {
        if (!this.isPlaying) return;
        
        this.playlistIndex++;
        this.djTalkCounter++;
        
        // Update station state
        if (this.currentStation) {
            this.updateStationState(this.currentStation.id);
        }
        
        // Decide if DJ should talk
        const shouldDJTalk = this.djTalkCounter >= Utils.getRandomInt(
            CONFIG.DJ_TALK_CONFIG.minSongsBetweenTalk,
            CONFIG.DJ_TALK_CONFIG.maxSongsBetweenTalk
        );
        
        if (shouldDJTalk) {
            await this.triggerDJTalk('track_transition');
            this.djTalkCounter = 0;
        } else {
            // Play next track directly
            await this.playCurrentTrack();
        }
    }
    
    /**
     * Trigger DJ talk
     */
    async triggerDJTalk(eventType) {
        if (!this.currentStation) return;
        
        console.log('[AI Host] Triggering DJ talk:', eventType, 'for station:', this.currentStation.id);
        
        // Store the talk type so onDJEnd knows whether to advance track
        this.lastDJTalkType = eventType;
        
        Components.showTypingIndicator(true);
        Animations.startDJTalkAnimation();
        
        try {
            // Get previous track info (the one that just finished)
            const prevIndex = this.playlistIndex > 0 ? this.playlistIndex - 1 : this.playlist.length - 1;
            const prevTrack = this.playlist[prevIndex];
            let previousTrackName = '';
            if (prevTrack) {
                const prevInfo = await this.getTrackInfo(prevTrack);
                previousTrackName = `${prevInfo.title} by ${prevInfo.artist}`;
            }
            
            // Get next track info for context
            const nextTrack = this.playlist[this.playlistIndex];
            let nextTrackName = '';
            if (nextTrack) {
                const info = await this.getTrackInfo(nextTrack);
                nextTrackName = `${info.title} by ${info.artist}`;
            }
            
            console.log('[AI Host] Calling /api/ai-host/banter with:', {
                stationId: this.currentStation.id,
                event: eventType,
                previousTrack: previousTrackName,
                nextTrack: nextTrackName
            });
            
            // Generate DJ banter from API
            const response = await fetch(`${CONFIG.API_BASE_URL}/ai-host/banter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stationId: this.currentStation.id,
                    context: {
                        event: eventType,
                        decade: this.selectedDecade,
                        previousTrack: previousTrackName,
                        nextTrack: nextTrackName,
                        timeOfDay: new Date().getHours() < 12 ? 'morning' : 'evening'
                    }
                })
            });
            
            console.log('[AI Host] Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error('Failed to generate DJ talk');
            }
            
            const data = await response.json();
            
            console.log('[AI Host] Banter response:', {
                hasText: !!data.text,
                textLength: data.text?.length,
                hasAudio: !!data.audioBase64,
                host: data.host
            });
            
            Components.showTypingIndicator(false);
            
            // Update DJ booth with generated text
            Components.updateDJBooth({
                name: this.currentStation.host,
                speech: data.text,
                isTalking: true
            });
            
            // Play DJ voice if available
            if (data.audioBase64) {
                console.log('[AI Host] Playing audio, base64 length:', data.audioBase64.length);
                // Convert base64 to ArrayBuffer for audio playback
                const binaryString = atob(data.audioBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                await this.audio.playDJ(bytes.buffer);
            } else {
                console.log('[AI Host] No audio returned, simulating talk duration');
                // Simulate talk duration if no audio
                await Utils.sleep(3000);
                this.onDJEnd();
            }
            
        } catch (error) {
            console.error('[AI Host] Error generating DJ talk:', error);
            Components.showTypingIndicator(false);
            
            // Fallback: use pre-written generic text
            const fallbackTexts = CONFIG.WEATHER_REPORTS[this.selectedDecade] || [
                "Great vibes coming your way! Stay tuned for more hits!"
            ];
            
            Components.updateDJBooth({
                name: this.currentStation?.host || 'DJ',
                speech: Utils.getRandomItem(fallbackTexts),
                isTalking: true
            });
            
            await Utils.sleep(3000);
            this.onDJEnd();
        }
    }
    
    /**
     * Handle early song start (called ~4 seconds before DJ finishes)
     */
    async onEarlySongStart() {
        if (!this.isPlaying || this.lastDJTalkType !== 'track_transition') return;
        
        console.log('[App] Starting next song early (DJ still talking)');
        this.songStartedEarly = true;
        
        // Start next track with ducked volume (DJ is still talking)
        // Music will stay ducked until DJ audio ends
        await this.playNextTrackEarly();
    }
    
    /**
     * Play next track early (while DJ is still talking)
     * This starts the song at low volume, which will be raised when DJ ends
     */
    async playNextTrackEarly() {
        if (this.playlistIndex >= this.playlist.length) {
            this.playlistIndex = 0;
        }
        
        const track = this.playlist[this.playlistIndex];
        if (!track) return;
        
        // Get track info
        const trackInfo = await this.getTrackInfo(track);
        
        // Update UI
        Components.updateNowPlaying(trackInfo);
        Components.updateMediaDisplay(this.selectedDecade, true);
        
        // Update billboard to highlight current song
        Components.renderBillboardChart(this.selectedDecade, trackInfo.title);
        
        // Build stream URL
        const streamUrl = `${CONFIG.API_BASE_URL}/music/stream/${track.stationId}/${track.filename}`;
        
        // Play track (will be ducked because DJ is still playing)
        await this.audio.playTrack(streamUrl);
        
        console.log(`[App] Now playing (early start): ${trackInfo.title} - ${trackInfo.artist}`);
    }
    
    /**
     * Handle DJ audio end
     */
    async onDJEnd() {
        Animations.stopDJTalkAnimation();
        
        Components.updateDJBooth({
            name: this.currentStation?.host || 'DJ',
            speech: '',
            isTalking: false
        });
        
        // Only advance to next track if this was a track transition AND song wasn't started early
        // For station_start/station_switch, the track is already playing
        if (this.isPlaying && this.lastDJTalkType === 'track_transition' && !this.songStartedEarly) {
            await this.playCurrentTrack();
        }
        
        // Reset early start flag
        this.songStartedEarly = false;
    }
    
    /**
     * Switch to another station in the same decade
     */
    async switchStation(stationId) {
        const station = this.currentStations.find(s => s.id === stationId);
        if (!station) return;
        
        // Save current station state before switching (with current position)
        if (this.currentStation) {
            // Get current position before pausing
            const currentPosition = this.audio.mainAudio?.currentTime || 0;
            if (this.stationStates[this.currentStation.id]) {
                this.stationStates[this.currentStation.id].trackPositionSeconds = currentPosition;
            }
            this.saveStationState(this.currentStation.id);
        }
        
        // Pause current playback (preserves state)
        this.pauseForStationSwitch();
        
        // Play static noise effect during switch
        this.audio.playStaticEffect();
        
        // Tune to new station (will restore if previously visited)
        await this.tuneToStation(stationId, this.selectedDecade);
    }
    
    /**
     * Stop playback (full stop, resets position)
     */
    stopPlayback() {
        this.isPlaying = false;
        this.audio.stop();
        Components.updateMediaDisplay(this.selectedDecade, false);
    }
    
    /**
     * Pause playback for station switching (preserves position)
     */
    pauseForStationSwitch() {
        this.isPlaying = false;
        const position = this.audio.pauseForSwitch();
        Components.updateMediaDisplay(this.selectedDecade, false);
        return position;
    }
    
    /**
     * Navigate between pages
     */
    async navigateToPage(fromPageId, toPageId) {
        await Animations.transitionToPage(fromPageId, toPageId);
        this.currentPage = toPageId;
    }
    
    /**
     * Return to present (time machine landing page)
     */
    returnToPresent() {
        console.log('[App] Returning to present...');
        
        // Stop playback and visualization
        this.stopPlayback();
        if (this.visualizationAnimationId) {
            cancelAnimationFrame(this.visualizationAnimationId);
            this.visualizationAnimationId = null;
        }
        
        // No sound when returning - cleaner transition
        
        // Hide retro radio page
        document.getElementById('retro-radio-page')?.classList.remove('active');
        
        // Show landing page
        document.getElementById('landing-page')?.classList.add('active');
        this.currentPage = 'landing-page';
        
        // Reset theme
        document.body.dataset.theme = 'time-machine';
        
        // Reset time machine state
        this.resetTimeMachine();
        
        Utils.showToast('Welcome back to the present!', 'info');
    }
    
    /**
     * Reset time machine to initial state
     */
    resetTimeMachine() {
        this.selectedDecade = null;
        this.currentStation = null;
        this.stopPlayback();
        
        // Reset UI
        document.querySelectorAll('.decade-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const engageBtn = document.getElementById('engage-btn');
        if (engageBtn) {
            engageBtn.disabled = true;
        }
        
        // Reset theme
        document.body.dataset.theme = 'time-machine';
        
        // Power down flux capacitor
        Animations.powerDownFluxCapacitor();
        
        // Reset time circuits
        document.getElementById('dest-month').textContent = '---';
        document.getElementById('dest-day').textContent = '--';
        document.getElementById('dest-year').textContent = '----';
        document.getElementById('dest-time').textContent = '--:--';
    }
    
    /**
     * Initialize station states for continuous broadcast simulation
     */
    initializeStationStates() {
        const stationIds = [
            '70s-1', '70s-2', '70s-3', '70s-4',
            '80s-1', '80s-2', '80s-3', '80s-4',
            '90s-1', '90s-2', '90s-3', '90s-4'
        ];
        
        // Assume average track length of 3.5 minutes (210 seconds)
        const AVG_TRACK_LENGTH = 210;
        
        stationIds.forEach(id => {
            // Random starting position in a hypothetical 2-hour playlist
            const randomOffset = Math.floor(Math.random() * 7200); // 0-2 hours in seconds
            const trackIndex = Math.floor(randomOffset / AVG_TRACK_LENGTH);
            const trackPosition = randomOffset % AVG_TRACK_LENGTH;
            
            this.stationStates[id] = {
                currentTrackIndex: trackIndex,
                trackPositionSeconds: trackPosition, // Position within current track
                broadcastStartTime: Date.now() - (randomOffset * 1000), // When this station "started"
                playlist: [], // Will be loaded when station is accessed
                playlistLoaded: false,
                // DJ state
                djTalkActive: false,
                djTalkStartTime: null,
                djAudioUrl: null,
                djText: '',
                djTalkDuration: 0,
                djTalkPosition: 0,
                djTalkCounter: Math.floor(Math.random() * 3) // Random counter start
            };
        });
    }
    
    /**
     * Update station state when leaving
     */
    saveStationState(stationId) {
        if (!stationId || !this.stationStates[stationId]) return;
        
        const state = this.stationStates[stationId];
        state.currentTrackIndex = this.playlistIndex;
        state.trackPositionSeconds = this.audio.mainAudio?.currentTime || 0;
        state.playlist = [...this.playlist];
        state.playlistLoaded = true;
        state.djTalkCounter = this.djTalkCounter;
        state.lastLeftTime = Date.now(); // Record when we left this station
        
        // Save DJ state if currently talking
        if (this.audio.djAudio && !this.audio.djAudio.paused) {
            state.djTalkActive = true;
            state.djTalkPosition = this.audio.djAudio.currentTime;
        } else {
            state.djTalkActive = false;
        }
    }
    
    /**
     * Restore station state when returning
     */
    async restoreStationState(stationId) {
        const state = this.stationStates[stationId];
        if (!state) return false;
        
        // Calculate how much time has passed since we left
        // This simulates the station continuing to play while we were away
        
        if (state.playlistLoaded && state.playlist.length > 0) {
            this.playlist = [...state.playlist];
            
            // Calculate current position based on elapsed time
            const elapsedSinceLeft = (Date.now() - (state.lastLeftTime || Date.now())) / 1000;
            
            let currentTrackIndex = state.currentTrackIndex;
            let currentPosition = state.trackPositionSeconds + elapsedSinceLeft;
            
            // Advance through tracks based on elapsed time (assume ~210 sec per track avg)
            const AVG_TRACK_LENGTH = 210;
            while (currentPosition > AVG_TRACK_LENGTH) {
                currentPosition -= AVG_TRACK_LENGTH;
                currentTrackIndex++;
                if (currentTrackIndex >= this.playlist.length) {
                    currentTrackIndex = 0;
                }
            }
            
            this.playlistIndex = currentTrackIndex;
            this.djTalkCounter = state.djTalkCounter;
            
            // Store the calculated position to seek to after loading
            this.seekToPosition = Math.min(currentPosition, 180); // Cap at 3 min to be safe
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Update station state continuously
     */
    updateStationState(stationId) {
        if (this.stationStates[stationId]) {
            this.stationStates[stationId].currentTrackIndex = this.playlistIndex;
            this.stationStates[stationId].trackPositionSeconds = this.audio.mainAudio?.currentTime || 0;
            this.stationStates[stationId].lastLeftTime = Date.now();
        }
    }
    
    /**
     * Start broadcast simulation (updates station states over time)
     */
    startBroadcastSimulation() {
        // Update current station state every second
        setInterval(() => {
            if (this.currentStation && this.stationStates[this.currentStation.id]) {
                this.stationStates[this.currentStation.id].trackPositionSeconds = 
                    this.audio.mainAudio?.currentTime || 0;
            }
        }, 1000);
    }
}

// Initialize the application
const app = new RetroRadioApp();
window.app = app;
