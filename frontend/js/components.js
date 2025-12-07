/**
 * Retro Radio Time Machine - UI Components
 * Handles rendering of all UI components
 */

const Components = {
    /**
     * Render station card
     */
    renderStationCard(station, decade) {
        const icon = Utils.getStationIcon(station.genre);
        
        return `
            <div class="station-card" data-station-id="${station.id}" data-decade="${decade}">
                <div class="station-live-badge">
                    <span class="dot"></span>
                    <span>LIVE</span>
                </div>
                <div class="station-icon">${icon}</div>
                <h3 class="station-name">${Utils.sanitizeHTML(station.name)}</h3>
                <p class="station-genre">${Utils.sanitizeHTML(station.genre)}</p>
                <div class="station-host">
                    <div class="host-avatar"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg></div>
                    <span class="host-name">${Utils.sanitizeHTML(station.host)}</span>
                </div>
                <div class="station-now-playing">
                    <span>♪ Now Playing: Loading...</span>
                </div>
            </div>
        `;
    },
    
    /**
     * Render stations grid
     */
    renderStationsGrid(stations, decade) {
        const grid = document.getElementById('stations-grid');
        if (!grid) return;
        
        grid.innerHTML = stations.map(station => 
            this.renderStationCard(station, decade)
        ).join('');
        
        // Add click listeners
        grid.querySelectorAll('.station-card').forEach(card => {
            card.addEventListener('click', () => {
                const stationId = card.dataset.stationId;
                const decade = card.dataset.decade;
                window.app.tuneToStation(stationId, decade);
            });
        });
    },
    
    /**
     * Render Billboard chart
     */
    renderBillboardChart(decade, currentSong = '') {
        const chartList = document.getElementById('chart-list');
        const chartTitle = document.querySelector('.chart-title');
        if (!chartList) return;
        
        const chart = CONFIG.BILLBOARD_CHARTS[decade] || [];
        const decadeConfig = CONFIG.DECADES[decade];
        
        // Update chart title to show the date
        if (chartTitle) {
            const chartDates = {
                '70s': 'December 6, 1975',
                '80s': 'December 7, 1985',
                '90s': 'December 9, 1995'
            };
            chartTitle.textContent = `HOT 20 - ${chartDates[decade] || 'THIS WEEK'}`;
        }
        
        chartList.innerHTML = chart.map((item, index) => {
            const isCurrent = currentSong && 
                (item.song.toLowerCase().includes(currentSong.toLowerCase()) ||
                 currentSong.toLowerCase().includes(item.song.toLowerCase()));
            
            return `
                <div class="chart-item ${isCurrent ? 'current' : ''}">
                    <span class="chart-position">${item.position}.</span>
                    <span class="chart-indicator ${item.indicator}">
                        ${Utils.getChartIndicator(item.indicator)}
                    </span>
                    <div class="chart-info">
                        <span class="chart-song">${Utils.sanitizeHTML(item.song)}</span>
                        <span class="chart-artist">${Utils.sanitizeHTML(item.artist)}</span>
                    </div>
                    ${isCurrent ? '<span class="now-marker">NOW</span>' : ''}
                </div>
            `;
        }).join('');
    },
    
    /**
     * Render News panel
     */
    renderNewsPanel(decade) {
        const newsList = document.getElementById('news-list');
        const newsYear = document.getElementById('news-year');
        if (!newsList) return;
        
        const headlines = CONFIG.NEWS_HEADLINES[decade] || [];
        const decadeConfig = CONFIG.DECADES[decade];
        
        if (newsYear) {
            newsYear.textContent = decadeConfig?.year || '';
        }
        
        newsList.innerHTML = headlines.slice(0, 5).map(headline => `
            <div class="news-item">
                <span class="news-bullet">•</span>
                <span class="news-text">${Utils.sanitizeHTML(headline)}</span>
            </div>
        `).join('');
    },
    
    /**
     * Render news ticker
     */
    renderNewsTicker(decade) {
        const tickerText = document.querySelector('.ticker-text');
        if (!tickerText) return;
        
        const headlines = CONFIG.NEWS_HEADLINES[decade] || [];
        const tickerContent = headlines.join('   •••   ');
        
        tickerText.textContent = tickerContent + '   •••   ' + tickerContent;
    },
    
    /**
     * Render other stations bar
     */
    renderOtherStations(stations, currentStationId) {
        const container = document.getElementById('other-stations');
        if (!container) return;
        
        const otherStations = stations.filter(s => s.id !== currentStationId);
        
        container.innerHTML = otherStations.map(station => `
            <button class="other-station-btn" data-station-id="${station.id}">
                ${Utils.sanitizeHTML(station.name)}
            </button>
        `).join('');
        
        // Add click listeners
        container.querySelectorAll('.other-station-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const stationId = btn.dataset.stationId;
                window.app.switchStation(stationId);
            });
        });
    },
    
    /**
     * Update Now Playing display
     */
    updateNowPlaying(trackInfo) {
        const titleEl = document.getElementById('track-title');
        const artistEl = document.getElementById('track-artist');
        const albumEl = document.getElementById('track-album');
        const albumArt = document.getElementById('album-art');
        
        if (titleEl) {
            titleEl.textContent = trackInfo.title || 'Unknown Track';
        }
        
        if (artistEl) {
            artistEl.textContent = trackInfo.artist || 'Unknown Artist';
        }
        
        if (albumEl) {
            const album = trackInfo.album || 'Unknown Album';
            const year = trackInfo.year || '';
            albumEl.textContent = `${album}${year ? ` (${year})` : ''}`;
        }
        
        if (albumArt) {
            // Set placeholder or actual album art
            albumArt.src = trackInfo.artwork || this.getPlaceholderArt(trackInfo);
            albumArt.alt = `${trackInfo.title} - ${trackInfo.artist}`;
        }
    },
    
    /**
     * Get placeholder album art
     */
    getPlaceholderArt(trackInfo) {
        // Return a gradient placeholder based on track name hash
        const hash = (trackInfo.title || '').split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        const hue = Math.abs(hash % 360);
        
        // Create SVG placeholder
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:hsl(${hue}, 70%, 40%)"/>
                        <stop offset="100%" style="stop-color:hsl(${(hue + 60) % 360}, 70%, 30%)"/>
                    </linearGradient>
                </defs>
                <rect width="200" height="200" fill="url(#grad)"/>
                <circle cx="100" cy="100" r="60" fill="rgba(0,0,0,0.3)"/>
                <circle cx="100" cy="100" r="20" fill="rgba(255,255,255,0.2)"/>
                <text x="100" y="180" text-anchor="middle" fill="white" font-size="12" opacity="0.5">
                    ${Utils.sanitizeHTML((trackInfo.artist || '').substring(0, 20))}
                </text>
            </svg>
        `;
        
        return 'data:image/svg+xml;base64,' + btoa(svg);
    },
    
    /**
     * Update DJ booth display
     */
    updateDJBooth(djInfo) {
        const nameEl = document.getElementById('dj-name');
        const speechEl = document.getElementById('speech-text');
        const avatarEl = document.getElementById('dj-avatar');
        const micIndicator = document.getElementById('mic-indicator');
        
        if (nameEl) {
            nameEl.textContent = djInfo.name || 'DJ';
        }
        
        if (speechEl && djInfo.speech) {
            this.typewriterEffect(speechEl, djInfo.speech);
        }
        
        if (avatarEl && djInfo.isTalking) {
            avatarEl.classList.add('talking');
        } else if (avatarEl) {
            avatarEl.classList.remove('talking');
        }
        
        if (micIndicator) {
            micIndicator.classList.toggle('active', djInfo.isTalking);
        }
    },
    
    /**
     * Typewriter effect for DJ speech
     */
    typewriterEffect(element, text, speed = CONFIG.ANIMATIONS.typewriterSpeed) {
        element.textContent = '';
        element.classList.add('typing');
        
        let index = 0;
        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                element.classList.remove('typing');
            }
        };
        
        type();
    },
    
    /**
     * Update time circuit display
     */
    updateTimeCircuits(decade) {
        const date = Utils.generateEraDate(decade);
        
        document.getElementById('dest-month').textContent = date.month;
        document.getElementById('dest-day').textContent = date.day;
        document.getElementById('dest-year').textContent = date.year;
        document.getElementById('dest-time').textContent = date.time;
    },
    
    /**
     * Update present time display
     */
    updatePresentTime() {
        const timeEl = document.getElementById('present-time');
        const eraTimeEl = document.getElementById('era-time');
        const clockTime = document.querySelector('.clock-time');
        
        const time = Utils.formatTimeLED();
        
        if (timeEl) timeEl.textContent = time;
        if (eraTimeEl) eraTimeEl.textContent = Utils.formatTime();
        if (clockTime) clockTime.textContent = Utils.formatTime();
    },
    
    /**
     * Update decade hub header
     */
    updateDecadeHub(decade) {
        const badge = document.getElementById('current-decade-badge');
        const tagline = document.getElementById('current-decade-tagline');
        
        const decadeConfig = CONFIG.DECADES[decade];
        
        if (badge) badge.textContent = decadeConfig?.name || decade;
        if (tagline) tagline.textContent = decadeConfig?.tagline || '';
    },
    
    /**
     * Update player station name
     */
    updatePlayerStationName(stationName) {
        const nameEl = document.getElementById('player-station-name');
        if (nameEl) {
            nameEl.textContent = stationName || 'Station';
        }
    },
    
    /**
     * Update volume slider display
     */
    updateVolumeDisplay(volume, isMuted) {
        const slider = document.getElementById('volume-slider');
        const muteBtn = document.getElementById('mute-btn');
        const volumeIcon = muteBtn?.querySelector('.volume-icon');
        
        if (slider) {
            slider.value = volume * 100;
        }
        
        if (muteBtn) {
            muteBtn.classList.toggle('muted', isMuted);
        }
        
        if (volumeIcon) {
            if (isMuted || volume === 0) {
                volumeIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
            } else if (volume < 0.3) {
                volumeIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>';
            } else if (volume < 0.7) {
                volumeIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M5 9v6h4l5 5V4L9 9H5zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';
            } else {
                volumeIcon.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
            }
        }
    },
    
    /**
     * Show/hide typing indicator in DJ speech
     */
    showTypingIndicator(show) {
        const indicator = document.querySelector('.speech-typing-indicator');
        const speechText = document.getElementById('speech-text');
        
        if (indicator) {
            indicator.classList.toggle('active', show);
        }
        
        if (speechText && show) {
            speechText.style.display = 'none';
        } else if (speechText) {
            speechText.style.display = 'block';
        }
    },
    
    /**
     * Create and show radio static overlay
     */
    showRadioStatic(duration = 500) {
        const staticEl = document.createElement('div');
        staticEl.className = 'radio-static active';
        document.body.appendChild(staticEl);
        
        setTimeout(() => {
            staticEl.classList.remove('active');
            setTimeout(() => staticEl.remove(), 200);
        }, duration);
    },
    
    /**
     * Render media display (vinyl/cassette/cd based on decade)
     */
    updateMediaDisplay(decade, isPlaying) {
        const mediaDisplay = document.getElementById('media-display');
        if (!mediaDisplay) return;
        
        const vinylRecord = mediaDisplay.querySelector('.vinyl-record');
        
        if (vinylRecord) {
            vinylRecord.style.animationPlayState = isPlaying ? 'running' : 'paused';
        }
    },
    
    /**
     * Update VU meter animation
     */
    animateVUMeter(levels = []) {
        const vuBars = document.querySelectorAll('.vu-bar');
        
        vuBars.forEach((bar, index) => {
            const level = levels[index] || Math.random();
            bar.style.height = `${level * 100}%`;
        });
    },

    // ==================== RETRO RADIO RENDERING ====================

    /**
     * Render the appropriate radio based on decade
     */
    renderRetroRadio(decade, stations) {
        const container = document.getElementById('radio-container');
        const header = document.getElementById('era-header');
        const titleDisplay = document.getElementById('era-title-display');
        const eraBackground = document.getElementById('radio-era-background');
        
        if (!container) return;
        
        // Update header styling
        header.className = `era-header era-${decade}`;
        
        // Update title based on decade
        if (titleDisplay) {
            if (decade === '90s') {
                titleDisplay.innerHTML = '<span>1</span><span>9</span><span>9</span><span>0</span><span>s</span>';
            } else if (decade === '80s') {
                titleDisplay.textContent = '1980s';
            } else {
                titleDisplay.textContent = '1970s';
            }
        }
        
        // Add/remove lava lamp blobs for 80s
        if (eraBackground) {
            // Remove any existing lava blobs
            eraBackground.querySelectorAll('.lava-blob').forEach(blob => blob.remove());
            
            if (decade === '80s') {
                // Add lava lamp blobs for 80s theme
                const blobHTML = `
                    <div class="lava-blob lava-blob-1"></div>
                    <div class="lava-blob lava-blob-2"></div>
                    <div class="lava-blob lava-blob-3"></div>
                    <div class="lava-blob lava-blob-4"></div>
                    <div class="lava-blob lava-blob-5"></div>
                `;
                eraBackground.insertAdjacentHTML('beforeend', blobHTML);
            }
        }
        
        // Render the appropriate radio
        switch (decade) {
            case '70s':
                container.innerHTML = this.render70sRadio(stations);
                break;
            case '80s':
                container.innerHTML = this.render80sRadio(stations);
                break;
            case '90s':
                container.innerHTML = this.render90sRadio(stations);
                break;
            default:
                container.innerHTML = this.render80sRadio(stations);
        }
        
        // Initialize radio interactions
        this.initRadioInteractions(decade);
    },

    /**
     * Render 1970s Hi-Fi Stereo Receiver
     */
    render70sRadio(stations) {
        const presetButtons = stations.slice(0, 4).map((station, i) => `
            <button class="preset-btn-70s ${i === 0 ? 'active' : ''}" data-station-id="${station.id}" data-index="${i}">
                <div class="preset-led-70s"></div>
                <span>FM${i + 1}</span>
            </button>
        `).join('');

        return `
            <div class="radio-70s power-on" id="radio-70s">
                <div class="radio-70s-panel">
                    <!-- Header -->
                    <div class="radio-70s-header">
                        <div class="power-section">
                            <button class="power-btn-70s" id="power-btn" title="Power">
                                <div class="power-led-70s"></div>
                            </button>
                        </div>
                        <span class="model-name">TEMPORAL AUDIO RECEIVER</span>
                        <span class="model-number">MODEL TA-1975</span>
                    </div>

                    <!-- FM Station Buttons -->
                    <div class="station-presets-70s">
                        ${presetButtons}
                    </div>

                    <!-- Large Rectangular Speaker -->
                    <div class="speaker-70s">
                        <div class="speaker-grille-70s"></div>
                    </div>

                    <!-- Volume Knob -->
                    <div class="controls-row-70s">
                        <div class="knob-assembly-70s">
                            <div class="knob-70s" id="volume-knob-70s" data-value="75"></div>
                            <span class="knob-label-70s">VOLUME</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render 1980s Digital Synthesizer Tuner
     */
    render80sRadio(stations) {
        const presetButtons = stations.slice(0, 8).map((station, i) => `
            <button class="preset-btn-80s ${i === 0 ? 'active' : ''}" data-station-id="${station.id}" data-index="${i}">
                ${i + 1}
            </button>
        `).join('');

        // Generate spectrum bars
        const spectrumBars = Array(16).fill(0).map((_, i) => 
            `<div class="spectrum-bar" id="spectrum-bar-${i}" style="height: ${20 + Math.random() * 40}px;"></div>`
        ).join('');

        // Generate volume bars
        const volBars = Array(8).fill(0).map((_, i) => 
            `<div class="vol-bar ${i < 6 ? 'active' : ''}"></div>`
        ).join('');

        return `
            <div class="radio-80s power-on" id="radio-80s">
                <!-- Header -->
                <div class="radio-80s-header">
                    <div class="power-section">
                        <button class="power-btn-80s" id="power-btn" title="Power">
                            <div class="power-led-80s"></div>
                        </button>
                    </div>
                    <span class="model-name">DIGITAL FREQUENCY SYNTHESIZER</span>
                    <span class="model-number">MODEL DFS-88</span>
                </div>

                <!-- LED Display -->
                <div class="led-display-80s">
                    <div class="led-frequency">
                        <span class="led-digit" id="freq-1">1</span>
                        <span class="led-digit" id="freq-2">0</span>
                        <span class="led-digit" id="freq-3">7</span>
                        <span class="led-digit">.</span>
                        <span class="led-digit" id="freq-4">5</span>
                        <span class="led-fm-indicator">FM</span>
                    </div>
                    <div class="led-station-info">
                        <div class="led-station-name" id="station-name-80s">${stations[0]?.name || 'SYNTHWAVE CENTRAL'}</div>
                        <div class="led-dj-name" id="dj-name-80s">DJ ${stations[0]?.host || 'NEON RICK'}</div>
                    </div>
                </div>

                <!-- Now Playing Scroll -->
                <div class="now-playing-80s">
                    <div class="led-scroll-80s" id="now-playing-80s">
                        NOW PLAYING: Waiting for broadcast...
                    </div>
                </div>

                <!-- Spectrum Analyzer -->
                <div class="spectrum-analyzer-80s" id="spectrum-analyzer">
                    ${spectrumBars}
                </div>

                <!-- Station Presets -->
                <div class="station-presets-80s">
                    ${presetButtons}
                </div>

                <!-- Volume Control -->
                <div class="volume-control-80s">
                    <span class="volume-label-80s">VOL</span>
                    <div class="volume-slider-80s" id="volume-slider-80s">
                        <div class="volume-fill-80s" id="volume-fill-80s"></div>
                        <div class="volume-thumb-80s" id="volume-thumb-80s"></div>
                    </div>
                    <div class="volume-bars-80s">
                        ${volBars}
                    </div>
                </div>

                <!-- Status Indicators -->
                <div class="status-indicators-80s">
                    <div class="status-led-80s">
                        <div class="led active"></div>
                        <span>STEREO</span>
                    </div>
                    <div class="status-led-80s">
                        <div class="led active"></div>
                        <span>DIGITAL</span>
                    </div>
                    <div class="status-led-80s">
                        <div class="led active"></div>
                        <span>AUTO</span>
                    </div>
                    <div class="status-led-80s">
                        <span>SIGNAL</span>
                        <div class="signal-bars">
                            <div class="signal-bar active"></div>
                            <div class="signal-bar active"></div>
                            <div class="signal-bar active"></div>
                            <div class="signal-bar active"></div>
                            <div class="signal-bar"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render 1990s 6-Disc CD Boombox
     */
    render90sRadio(stations) {
        const presetButtons = stations.slice(0, 4).map((station, i) => `
            <button class="preset-btn-90s ${i === 0 ? 'active' : ''}" data-station-id="${station.id}" data-index="${i}">
                STATION ${i + 1}
            </button>
        `).join('');

        // Generate wave bars
        const waveBars = Array(15).fill(0).map((_, i) => 
            `<div class="wave-bar" id="wave-bar-${i}" style="height: ${15 + Math.random() * 40}px;"></div>`
        ).join('');

        return `
            <div class="radio-90s power-on" id="radio-90s">
                <div class="radio-90s-inner">
                    <!-- Header -->
                    <div class="radio-90s-header">
                        <div class="power-section">
                            <button class="power-btn-90s" id="power-btn" title="Power">
                                <div class="power-led-90s"></div>
                            </button>
                        </div>
                        <span class="model-name">4-STATION CHANGER</span>
                        <span class="model-number">MODEL DC-95</span>
                    </div>

                    <!-- Main Body with Speakers -->
                    <div class="radio-90s-body">
                        <!-- Left Speaker Grille -->
                        <div class="speaker-grille-90s left">
                            <div class="speaker-mesh"></div>
                            <div class="speaker-logo">BASS</div>
                        </div>

                        <!-- Center Section -->
                        <div class="radio-90s-center">
                            <!-- LCD Display -->
                            <div class="lcd-display-90s">
                                <div class="lcd-column lcd-left">
                                    <div class="lcd-row" id="freq-90s">98.5 FM</div>
                                    <div class="lcd-row" id="station-name-90s">${stations[0]?.name || 'GRUNGE STATION'}</div>
                                    <div class="lcd-row">12/15/1995</div>
                                    <div class="lcd-row" id="disc-num-90s">STATION 1</div>
                                </div>
                                <div class="lcd-column lcd-right">
                                    <div class="lcd-row label">NOW PLAYING:</div>
                                    <div class="lcd-row title lcd-scroll-container">
                                        <span class="lcd-scroll-text" id="now-playing-90s">Waiting for broadcast...</span>
                                    </div>
                                    <div class="lcd-row" id="artist-90s">---</div>
                                    <div class="lcd-row" id="genre-90s">ALTERNATIVE</div>
                                </div>
                            </div>

                            <!-- Sound Wave Visualization -->
                            <div class="soundwave-90s" id="soundwave-90s">
                                ${waveBars}
                            </div>

                            <!-- Volume Controls -->
                            <div class="volume-control-90s">
                                <button class="vol-btn-90s" id="vol-down-90s">VOL -</button>
                                <div class="vol-level-90s" id="vol-level-90s">LEVEL: 75%</div>
                                <button class="vol-btn-90s" id="vol-up-90s">VOL +</button>
                            </div>

                            <!-- Station Presets -->
                            <div class="station-presets-90s">
                                ${presetButtons}
                            </div>

                            <!-- CD Display -->
                            <div class="cd-display-90s">
                                <div class="cd-90s">
                                    <div class="cd-label">
                                        <img id="album-art-90s" src="" alt="Album Art">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Speaker Grille -->
                        <div class="speaker-grille-90s right">
                            <div class="speaker-mesh"></div>
                            <div class="speaker-logo">TREBLE</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Initialize radio interactions (power button, presets, volume)
     */
    initRadioInteractions(decade) {
        // Power button
        const powerBtn = document.getElementById('power-btn');
        if (powerBtn) {
            powerBtn.addEventListener('click', () => {
                window.app.toggleRadioPower();
            });
        }

        // Station preset buttons
        const presetBtns = document.querySelectorAll('[class*="preset-btn-"]');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Play click sound
                if (window.app && window.app.audio) {
                    window.app.audio.playButtonSound();
                }
                
                // Update active state
                presetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Switch station
                const stationId = btn.dataset.stationId;
                if (stationId && window.app) {
                    window.app.switchToStation(stationId, btn.dataset.index);
                }
            });
        });

        // Volume controls based on decade
        this.initVolumeControls(decade);
    },

    /**
     * Initialize volume controls per decade
     */
    initVolumeControls(decade) {
        if (decade === '70s') {
            // Rotary knob volume control
            const volumeKnob = document.getElementById('volume-knob-70s');
            if (volumeKnob) {
                this.setupRotaryKnob(volumeKnob, (value) => {
                    if (window.app && window.app.audio) {
                        window.app.audio.setVolume(value / 100);
                    }
                });
            }
        } else if (decade === '80s') {
            // Slider volume control
            const slider = document.getElementById('volume-slider-80s');
            const fill = document.getElementById('volume-fill-80s');
            const thumb = document.getElementById('volume-thumb-80s');
            
            if (slider && fill && thumb) {
                this.setupSliderVolume(slider, fill, thumb, (value) => {
                    if (window.app && window.app.audio) {
                        window.app.audio.setVolume(value / 100);
                    }
                    this.updateVolumeBar80s(value);
                });
            }
        } else if (decade === '90s') {
            // Button volume controls
            const volDown = document.getElementById('vol-down-90s');
            const volUp = document.getElementById('vol-up-90s');
            const volLevel = document.getElementById('vol-level-90s');
            
            if (volDown && volUp) {
                let currentVol = 75;
                
                volDown.addEventListener('click', () => {
                    currentVol = Math.max(0, currentVol - 10);
                    volLevel.textContent = `LEVEL: ${currentVol}%`;
                    if (window.app && window.app.audio) {
                        window.app.audio.setVolume(currentVol / 100);
                    }
                });
                
                volUp.addEventListener('click', () => {
                    currentVol = Math.min(100, currentVol + 10);
                    volLevel.textContent = `LEVEL: ${currentVol}%`;
                    if (window.app && window.app.audio) {
                        window.app.audio.setVolume(currentVol / 100);
                    }
                });
            }
        }
    },

    /**
     * Setup rotary knob behavior
     */
    setupRotaryKnob(knob, onChange) {
        let isDragging = false;
        let startY = 0;
        let startValue = parseInt(knob.dataset.value) || 75;
        let currentValue = startValue;

        // Set initial rotation
        const updateKnobVisual = (value) => {
            const rotation = (value / 100) * 270 - 135;
            knob.style.transform = `rotate(${rotation}deg)`;
        };
        updateKnobVisual(startValue);

        knob.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startValue = currentValue;
            knob.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaY = startY - e.clientY;
            currentValue = Math.max(0, Math.min(100, startValue + deltaY));
            updateKnobVisual(currentValue);
            onChange(currentValue);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                knob.style.cursor = 'grab';
            }
        });
    },

    /**
     * Setup slider volume control
     */
    setupSliderVolume(slider, fill, thumb, onChange) {
        let isDragging = false;

        const updateSlider = (percent) => {
            fill.style.width = `${percent}%`;
            thumb.style.left = `${percent}%`;
        };

        const getPercentFromEvent = (e) => {
            const rect = slider.getBoundingClientRect();
            const x = e.clientX - rect.left;
            return Math.max(0, Math.min(100, (x / rect.width) * 100));
        };

        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            const percent = getPercentFromEvent(e);
            updateSlider(percent);
            onChange(percent);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const percent = getPercentFromEvent(e);
            updateSlider(percent);
            onChange(percent);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    },

    /**
     * Update 80s volume bar visualization
     */
    updateVolumeBar80s(percent) {
        const bars = document.querySelectorAll('.vol-bar');
        const activeCount = Math.ceil((percent / 100) * bars.length);
        bars.forEach((bar, i) => {
            bar.classList.toggle('active', i < activeCount);
        });
    },

    /**
     * Update now playing display on retro radios
     */
    updateRetroNowPlaying(decade, trackInfo) {
        const title = trackInfo.title || 'Unknown Track';
        const artist = trackInfo.artist || 'Unknown Artist';
        const displayText = `NOW ${decade === '70s' ? 'SPINNING' : 'PLAYING'}: ${title} - ${artist}`;

        if (decade === '70s') {
            const el = document.getElementById('now-playing-70s');
            if (el) el.textContent = displayText;
            
            // Update album art
            const albumArt = document.getElementById('album-art-70s');
            if (albumArt) {
                albumArt.src = trackInfo.artwork || this.getPlaceholderArt(trackInfo);
            }
        } else if (decade === '80s') {
            const el = document.getElementById('now-playing-80s');
            if (el) el.textContent = displayText;
        } else if (decade === '90s') {
            const titleEl = document.getElementById('now-playing-90s');
            const artistEl = document.getElementById('artist-90s');
            
            if (titleEl) titleEl.textContent = title;
            if (artistEl) artistEl.textContent = `${artist} - ${trackInfo.year || ''}`;
            
            // Update album art
            const albumArt = document.getElementById('album-art-90s');
            if (albumArt) {
                albumArt.src = trackInfo.artwork || this.getPlaceholderArt(trackInfo);
            }
        }
    },

    /**
     * Update station info on retro radios
     */
    updateRetroStationInfo(decade, station, index) {
        if (decade === '70s') {
            const nameEl = document.getElementById('station-name-70s');
            const djEl = document.getElementById('dj-name-70s');
            if (nameEl) nameEl.textContent = station.name || 'DISCO FEVER';
            if (djEl) djEl.textContent = `${station.host || 'DJ'} ON AIR`;
        } else if (decade === '80s') {
            const nameEl = document.getElementById('station-name-80s');
            const djEl = document.getElementById('dj-name-80s');
            if (nameEl) nameEl.textContent = station.name || 'SYNTHWAVE CENTRAL';
            if (djEl) djEl.textContent = `DJ ${station.host || 'UNKNOWN'}`;
            
            // Update frequency digits
            const freqs = ['98.5', '101.1', '105.3', '107.7', '92.3', '95.5', '99.1', '103.5'];
            const freq = freqs[index] || '98.5';
            const digits = freq.replace('.', '').split('');
            for (let i = 0; i < 4; i++) {
                const digitEl = document.getElementById(`freq-${i + 1}`);
                if (digitEl) digitEl.textContent = digits[i] || '0';
            }
        } else if (decade === '90s') {
            const nameEl = document.getElementById('station-name-90s');
            const discEl = document.getElementById('disc-num-90s');
            if (nameEl) nameEl.textContent = station.name || 'GRUNGE STATION';
            if (discEl) discEl.textContent = `STATION ${index + 1}`;
        }
    },

    /**
     * Toggle radio power state visually
     */
    toggleRadioPowerVisual(decade, isOn) {
        const radioEl = document.querySelector(`[class*="radio-${decade}"]`);
        if (radioEl) {
            radioEl.classList.toggle('power-on', isOn);
            radioEl.classList.toggle('power-off', !isOn);
        }
    },

    /**
     * Animate spectrum analyzer (80s)
     */
    animateSpectrum(audioData) {
        const bars = document.querySelectorAll('.spectrum-bar');
        if (bars.length === 0) return;

        bars.forEach((bar, i) => {
            const value = audioData ? audioData[i % audioData.length] : Math.random();
            const height = 4 + (value * 60);
            bar.style.height = `${height}px`;
        });
    },

    /**
     * Animate sound waves (90s)
     */
    animateSoundWaves(audioData) {
        const bars = document.querySelectorAll('.wave-bar');
        if (bars.length === 0) return;

        bars.forEach((bar, i) => {
            const value = audioData ? audioData[i % audioData.length] : Math.random();
            const height = 8 + (value * 50);
            bar.style.height = `${height}px`;
        });
    },

    /**
     * Animate VU meters (70s)
     */
    animateVUMeters(leftLevel, rightLevel) {
        const leftNeedle = document.getElementById('vu-needle-left');
        const rightNeedle = document.getElementById('vu-needle-right');

        if (leftNeedle) {
            const leftAngle = -45 + (leftLevel * 90);
            leftNeedle.style.transform = `rotate(${leftAngle}deg)`;
        }

        if (rightNeedle) {
            const rightAngle = -45 + (rightLevel * 90);
            rightNeedle.style.transform = `rotate(${rightAngle}deg)`;
        }
    }
};

// Export for use in other modules
window.Components = Components;
