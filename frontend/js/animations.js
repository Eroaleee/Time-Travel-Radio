/**
 * Retro Radio Time Machine - Animation Controller
 * Handles all visual effects and animations
 */

const Animations = {
    particleCanvas: null,
    particleCtx: null,
    particles: [],
    animationFrameId: null,
    
    /**
     * Initialize all animations
     */
    init() {
        this.initParticles();
        this.initSpeedometer();
        this.startClockUpdates();
        
        // Reduce animations if user prefers
        if (Utils.prefersReducedMotion()) {
            document.body.classList.add('reduced-motion');
        }
        
        console.log('[Anim] Animations initialized');
    },
    
    /**
     * Initialize particle system
     */
    initParticles() {
        this.particleCanvas = document.getElementById('particles');
        if (!this.particleCanvas) return;
        
        this.particleCtx = this.particleCanvas.getContext('2d');
        this.resizeParticleCanvas();
        
        window.addEventListener('resize', Utils.debounce(() => {
            this.resizeParticleCanvas();
        }, 200));
        
        // Create initial particles
        this.createParticles(50);
        this.animateParticles();
    },
    
    /**
     * Resize particle canvas
     */
    resizeParticleCanvas() {
        if (!this.particleCanvas) return;
        
        this.particleCanvas.width = window.innerWidth;
        this.particleCanvas.height = window.innerHeight;
    },
    
    /**
     * Create particles
     */
    createParticles(count) {
        this.particles = [];
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 60 + 180 // Cyan to purple range
            });
        }
    },
    
    /**
     * Animate particles
     */
    animateParticles() {
        if (!this.particleCtx || Utils.prefersReducedMotion()) return;
        
        this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = this.particleCanvas.width;
            if (particle.x > this.particleCanvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.particleCanvas.height;
            if (particle.y > this.particleCanvas.height) particle.y = 0;
            
            // Draw particle
            this.particleCtx.beginPath();
            this.particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.particleCtx.fillStyle = `hsla(${particle.hue}, 100%, 70%, ${particle.opacity})`;
            this.particleCtx.fill();
        });
        
        this.animationFrameId = requestAnimationFrame(() => this.animateParticles());
    },
    
    /**
     * Stop particle animation
     */
    stopParticles() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    },
    
    /**
     * Initialize speedometer
     */
    initSpeedometer() {
        this.speedNeedle = document.querySelector('.speed-needle');
        this.speedValue = document.querySelector('.speed-value');
    },
    
    /**
     * Animate speedometer to target speed
     */
    animateSpeedometer(targetSpeed, duration = 2000) {
        if (!this.speedNeedle || !this.speedValue) return;
        
        const startSpeed = parseInt(this.speedValue.textContent) || 0;
        const speedDiff = targetSpeed - startSpeed;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentSpeed = Math.round(startSpeed + (speedDiff * eased));
            
            // Update display
            this.speedValue.textContent = currentSpeed;
            
            // Update needle (0 speed = -90deg, 88+ speed = 90deg)
            const angle = -90 + (Math.min(currentSpeed, 88) / 88) * 180;
            this.speedNeedle.style.transform = `translateX(-50%) rotate(${angle}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    /**
     * Time travel transition animation - BTTF Style with lightning
     */
    async playTimeTravelTransition(decade) {
        return new Promise(async (resolve) => {
            const transitionPage = document.getElementById('time-travel-transition');
            const timeFlash = document.getElementById('time-flash');
            const decadeConfig = CONFIG.DECADES[decade];
            const landingPage = document.getElementById('landing-page');
            
            // Phase 1: Preparation - Speedometer ramps up, lightning starts
            console.log('[Anim] Phase 1: Preparation');
            
            // Start lightning sequence (few bolts initially)
            this.startLightningSequence(3, 500); // 3 bolts, 500ms interval
            
            // Animate speedometer from 0 to 88
            this.animateSpeedometer(88, 2000);
            
            // Shake screen slightly
            landingPage.classList.add('shake');
            setTimeout(() => landingPage.classList.remove('shake'), 100);
            
            await Utils.sleep(1500);
            
            // Phase 2: More intense lightning as we approach 88
            console.log('[Anim] Phase 2: Intensifying');
            this.startLightningSequence(6, 200); // More frequent
            
            // Another shake
            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 100);
            
            await Utils.sleep(500);
            
            // Phase 3: FLASH! The moment of time travel
            console.log('[Anim] Phase 3: FLASH!');
            
            // Rapid lightning
            this.startLightningSequence(10, 50);
            
            // Big white flash
            if (timeFlash) {
                timeFlash.classList.add('active');
                setTimeout(() => timeFlash.classList.remove('active'), 300);
            }
            
            // Strong shake
            document.body.classList.add('shake');
            
            await Utils.sleep(200);
            
            // Hide landing page, show transition tunnel
            landingPage.classList.remove('active');
            transitionPage.classList.add('active');
            
            document.body.classList.remove('shake');
            
            // Phase 4: Time tunnel with year counter
            console.log('[Anim] Phase 4: Time Tunnel');
            
            const yearDisplay = document.getElementById('travel-year');
            const speedDisplay = document.getElementById('travel-speed');
            const statusDisplay = document.getElementById('travel-status');
            const speedFill = document.getElementById('speed-bar-fill');
            
            // Set initial values
            if (speedDisplay) speedDisplay.textContent = '88';
            if (speedFill) speedFill.style.width = '88%';
            if (statusDisplay) statusDisplay.textContent = 'TEMPORAL DISPLACEMENT IN PROGRESS';
            
            // Animate year counter
            const targetYear = decadeConfig.year;
            const startYear = 2025;
            const yearDiff = targetYear - startYear;
            const duration = 2500;
            const startTime = Date.now();
            
            const animateYear = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentYear = Math.round(startYear + (yearDiff * progress));
                
                if (yearDisplay) yearDisplay.textContent = currentYear;
                
                // Random lightning during tunnel
                if (Math.random() < 0.1) {
                    this.triggerSingleLightning();
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animateYear);
                }
            };
            
            requestAnimationFrame(animateYear);
            
            // Occasional lightning during tunnel
            const tunnelLightningInterval = setInterval(() => {
                this.triggerSingleLightning();
            }, 300);
            
            await Utils.sleep(2500);
            
            clearInterval(tunnelLightningInterval);
            
            // Phase 5: Arrival flash
            console.log('[Anim] Phase 5: Arrival');
            
            if (statusDisplay) statusDisplay.textContent = 'ARRIVAL IMMINENT';
            
            // Final lightning burst
            this.startLightningSequence(8, 80);
            
            await Utils.sleep(300);
            
            // Arrival flash
            if (timeFlash) {
                timeFlash.classList.add('arrival');
                setTimeout(() => timeFlash.classList.remove('arrival'), 500);
            }
            
            // Show fire trails briefly
            const fireTrails = document.querySelector('.fire-trails');
            if (fireTrails) {
                fireTrails.classList.add('active');
                setTimeout(() => fireTrails.classList.remove('active'), 1000);
            }
            
            await Utils.sleep(500);
            
            // Hide transition
            transitionPage.classList.remove('active');
            
            // Reset speedometer
            this.animateSpeedometer(0, 500);
            
            resolve();
        });
    },
    
    /**
     * Start a sequence of lightning bolts
     */
    startLightningSequence(count, interval) {
        const bolts = document.querySelectorAll('.bolt');
        let fired = 0;
        
        const fire = () => {
            if (fired >= count) return;
            
            // Pick a random bolt
            const bolt = bolts[Math.floor(Math.random() * bolts.length)];
            if (bolt) {
                bolt.classList.remove('flash');
                void bolt.offsetWidth; // Force reflow
                bolt.classList.add('flash');
                
                setTimeout(() => bolt.classList.remove('flash'), 150);
            }
            
            fired++;
            setTimeout(fire, interval + Math.random() * 100);
        };
        
        fire();
    },
    
    /**
     * Trigger a single lightning bolt
     */
    triggerSingleLightning() {
        const bolts = document.querySelectorAll('.bolt');
        const bolt = bolts[Math.floor(Math.random() * bolts.length)];
        
        if (bolt) {
            bolt.classList.remove('flash');
            void bolt.offsetWidth;
            bolt.classList.add('flash');
            setTimeout(() => bolt.classList.remove('flash'), 150);
        }
    },
    
    /**
     * Trigger white flash effect
     */
    triggerFlash(type = 'normal') {
        const flash = document.getElementById('time-flash');
        if (!flash) return;
        
        flash.classList.remove('active', 'arrival');
        void flash.offsetWidth;
        flash.classList.add(type === 'arrival' ? 'arrival' : 'active');
        
        setTimeout(() => {
            flash.classList.remove('active', 'arrival');
        }, type === 'arrival' ? 500 : 300);
    },
    
    /**
     * Page transition animation
     */
    async transitionToPage(fromPageId, toPageId) {
        const fromPage = document.getElementById(fromPageId);
        const toPage = document.getElementById(toPageId);
        
        if (!fromPage || !toPage) return;
        
        // Add exit animation
        fromPage.classList.add('page-exit');
        
        await Utils.sleep(CONFIG.ANIMATIONS.pageTransition);
        
        // Switch pages
        fromPage.classList.remove('active', 'page-exit');
        toPage.classList.add('active', 'page-enter');
        
        await Utils.sleep(CONFIG.ANIMATIONS.pageTransition);
        
        toPage.classList.remove('page-enter');
    },
    
    /**
     * Station tuning animation
     */
    async playTuningAnimation() {
        Components.showRadioStatic(CONFIG.ANIMATIONS.stationTuneDelay);
        
        // Add tuning class to player
        const player = document.getElementById('radio-player');
        if (player) {
            player.classList.add('tuning');
            await Utils.sleep(CONFIG.ANIMATIONS.stationTuneDelay);
            player.classList.remove('tuning');
        }
    },
    
    /**
     * Lightning effect on decade button
     */
    triggerLightningEffect(button) {
        const lightning = button.querySelector('.lightning-effect');
        if (!lightning) return;
        
        lightning.style.opacity = '1';
        lightning.style.animation = 'lightningFlash 0.2s ease-out';
        
        setTimeout(() => {
            lightning.style.opacity = '0';
            lightning.style.animation = '';
        }, 200);
    },
    
    /**
     * Flux capacitor power up animation
     */
    powerUpFluxCapacitor() {
        const flux = document.querySelector('.flux-capacitor');
        if (!flux) return;
        
        flux.classList.add('powered');
        
        // Add extra glow
        const bolts = flux.querySelectorAll('.flux-bolt');
        bolts.forEach(bolt => {
            bolt.style.animation = 'boltPulse 0.2s ease-in-out infinite';
        });
    },
    
    /**
     * Power down flux capacitor
     */
    powerDownFluxCapacitor() {
        const flux = document.querySelector('.flux-capacitor');
        if (!flux) return;
        
        flux.classList.remove('powered');
        
        const bolts = flux.querySelectorAll('.flux-bolt');
        bolts.forEach(bolt => {
            bolt.style.animation = '';
        });
    },
    
    /**
     * Start clock update interval
     */
    startClockUpdates() {
        // Update immediately
        Components.updatePresentTime();
        
        // Update every second
        setInterval(() => {
            Components.updatePresentTime();
        }, 1000);
    },
    
    /**
     * Decade button hover animation
     */
    setupDecadeButtonEffects() {
        document.querySelectorAll('.decade-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.triggerLightningEffect(btn);
            });
        });
    },
    
    /**
     * Apply decade theme
     */
    applyDecadeTheme(decade) {
        document.body.dataset.theme = decade;
        
        // Update particle colors based on theme
        const colors = CONFIG.DECADES[decade]?.colors;
        if (colors && this.particles.length > 0) {
            this.particles.forEach(particle => {
                // Convert hex to hue (simplified)
                const hueMap = {
                    '70s': { min: 20, max: 50 },   // Orange/Yellow
                    '80s': { min: 280, max: 340 }, // Pink/Purple
                    '90s': { min: 40, max: 180 }   // Yellow/Teal
                };
                
                const range = hueMap[decade] || { min: 180, max: 240 };
                particle.hue = Math.random() * (range.max - range.min) + range.min;
            });
        }
    },
    
    /**
     * Pulse animation for live badge
     */
    pulseLiveBadge() {
        const badges = document.querySelectorAll('.live-badge, .on-air-badge');
        badges.forEach(badge => {
            badge.classList.add('pulse');
            setTimeout(() => badge.classList.remove('pulse'), 500);
        });
    },
    
    /**
     * Animate DJ speaking
     */
    startDJTalkAnimation() {
        const avatar = document.getElementById('dj-avatar');
        const mic = document.getElementById('mic-indicator');
        
        if (avatar) avatar.classList.add('talking');
        if (mic) mic.classList.add('active');
    },
    
    /**
     * Stop DJ talking animation
     */
    stopDJTalkAnimation() {
        const avatar = document.getElementById('dj-avatar');
        const mic = document.getElementById('mic-indicator');
        
        if (avatar) avatar.classList.remove('talking');
        if (mic) mic.classList.remove('active');
    },
    
    /**
     * Animate chart position change
     */
    animateChartUpdate(position, direction) {
        const chartItems = document.querySelectorAll('.chart-item');
        const item = chartItems[position - 1];
        
        if (!item) return;
        
        item.classList.add(`animate-${direction}`);
        setTimeout(() => {
            item.classList.remove(`animate-${direction}`);
        }, 500);
    },
    
    /**
     * Breaking news flash animation
     */
    flashBreakingNews() {
        const ticker = document.querySelector('.news-ticker');
        if (!ticker) return;
        
        ticker.classList.add('breaking');
        setTimeout(() => {
            ticker.classList.remove('breaking');
        }, 3000);
    },
    
    /**
     * Vinyl scratch effect (visual only)
     */
    playVinylScratch() {
        const vinyl = document.querySelector('.vinyl-record');
        if (!vinyl) return;
        
        const originalAnimation = vinyl.style.animation;
        vinyl.style.animation = 'none';
        vinyl.style.transform = 'rotate(0deg)';
        
        setTimeout(() => {
            vinyl.style.animation = originalAnimation;
        }, 200);
    },
    
    /**
     * Cleanup animations
     */
    cleanup() {
        this.stopParticles();
        
        if (this.particleCtx) {
            this.particleCtx.clearRect(0, 0, this.particleCanvas.width, this.particleCanvas.height);
        }
    }
};

// Export for use in other modules
window.Animations = Animations;
