/**
 * Retro Radio Time Machine - Utility Functions
 */

const Utils = {
    /**
     * Format time as HH:MM in 12-hour format
     */
    formatTime(date = new Date()) {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    },
    
    /**
     * Format time as vintage LED display style
     */
    formatTimeLED(date = new Date()) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    },
    
    /**
     * Get month abbreviation
     */
    getMonthAbbr(month) {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                       'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return months[month];
    },
    
    /**
     * Generate random era-appropriate date
     */
    generateEraDate(decade) {
        const decadeConfig = CONFIG.DECADES[decade];
        const year = decadeConfig.year;
        const month = Math.floor(Math.random() * 12);
        const day = Math.floor(Math.random() * 28) + 1;
        
        return {
            month: this.getMonthAbbr(month),
            day: day.toString().padStart(2, '0'),
            year: year.toString(),
            time: this.formatTimeLED()
        };
    },
    
    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    /**
     * Get random item from array
     */
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    /**
     * Get random number between min and max (inclusive)
     */
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Async sleep/delay
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    /**
     * Create element with classes and attributes
     */
    createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        if (options.classes) {
            element.classList.add(...options.classes);
        }
        
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        if (options.text) {
            element.textContent = options.text;
        }
        
        if (options.html) {
            element.innerHTML = options.html;
        }
        
        if (options.children) {
            options.children.forEach(child => element.appendChild(child));
        }
        
        return element;
    },
    
    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = this.createElement('div', {
            classes: ['toast', type],
            text: message
        });
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    /**
     * Show/hide loading overlay
     */
    setLoading(show, text = 'Tuning in...') {
        const overlay = document.getElementById('loading-overlay');
        const textEl = overlay?.querySelector('.loading-text');
        
        if (overlay) {
            overlay.classList.toggle('active', show);
            if (textEl) textEl.textContent = text;
        }
    },
    
    /**
     * Get station icon SVG based on genre
     */
    getStationIcon(genre) {
        const genreLower = genre.toLowerCase();
        let iconType = 'music';
        
        for (const [key, icon] of Object.entries(CONFIG.STATION_ICONS)) {
            if (genreLower.includes(key.toLowerCase())) {
                iconType = icon;
                break;
            }
        }
        
        return this.getSVGIcon(iconType);
    },
    
    /**
     * Get SVG icon by name
     */
    getSVGIcon(name, size = 24) {
        const icons = {
            'vinyl': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`,
            'saxophone': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M14 4v2h-1v2h-1v2h-1v2H9v2H7v2H5v4h2v-2h2v-2h2v-2h2v-2h1v-2h1v-2h1V6h-1V4z"/></svg>`,
            'heart': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
            'lightning': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>`,
            'guitar': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M19.59 3.41L17.17 1 15 3.17l-2.59-2.58L11 2l3 3-10 10c-2.34 2.34-2.34 6.14 0 8.49 2.34 2.34 6.14 2.34 8.49 0L22 14l1.41-1.41-2.58-2.59L23 7.83l-1-1-2.58 2.58L17.83 8l2.58-2.59-1.82-1.82zM12.5 18.5c-1.76 1.76-4.6 1.76-6.36 0-1.76-1.76-1.76-4.6 0-6.36l8.5-8.5 6.36 6.36-8.5 8.5z"/></svg>`,
            'keyboard': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>`,
            'microphone': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>`,
            'fire': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>`,
            'wave': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M17 16.99c-1.35 0-2.2.42-2.95.8-.65.33-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.17.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.58.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8zm0-4.45c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.43-2.95.8c-.65.32-1.17.6-2.05.6v1.95c1.35 0 2.2-.43 2.95-.8.65-.35 1.15-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.35 1.15-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.58.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8zm2.95-8.08c-.75-.38-1.58-.8-2.95-.8s-2.2.42-2.95.8c-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.37-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.17.6-2.05.6v1.93c1.35 0 2.2-.43 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.58.8 2.95.8V5.04c-.9 0-1.4-.25-2.05-.58zM17 8.09c-1.35 0-2.2.43-2.95.8-.65.35-1.15.6-2.05.6s-1.4-.25-2.05-.6c-.75-.38-1.57-.8-2.95-.8s-2.2.43-2.95.8c-.65.35-1.15.6-2.05.6v1.95c1.35 0 2.2-.43 2.95-.8.65-.32 1.18-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.43 2.95-.8c.65-.32 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.58.8 2.95.8V8.49c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8z"/></svg>`,
            'bolt': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C12.97 17.55 11 21 11 21z"/></svg>`,
            'headphones': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>`,
            'flag': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>`,
            'music': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
            'radio': `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><path fill="currentColor" d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.89 2 2 2h16c1.11 0 2-.9 2-2V8c0-1.11-.89-2-2-2H8.3l8.26-3.34-.37-.92L3.24 6.15zM7 20c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-8h-2v-2h-2v2H4V8h16v4z"/></svg>`
        };
        
        return icons[name] || icons['music'];
    },
    
    /**
     * Get chart indicator symbol
     */
    getChartIndicator(indicator) {
        const indicators = {
            'up': '<span class="chart-arrow up">&#9650;</span>',
            'down': '<span class="chart-arrow down">&#9660;</span>',
            'same': '<span class="chart-arrow same">&#9654;</span>',
            'new': '<span class="chart-new">NEW</span>'
        };
        return indicators[indicator] || '';
    },
    
    /**
     * Sanitize HTML to prevent XSS
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },
    
    /**
     * Format duration (seconds to MM:SS)
     */
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    /**
     * Parse track filename for display
     * Format: "Song Name - Artist Name.mp3"
     */
    parseTrackFilename(filename) {
        // Remove extension and clean up filename
        let name = filename.replace(/\.(mp3|wav|ogg|m4a)$/i, '');
        
        // Try to extract title - artist pattern (Song - Artist format)
        const patterns = [
            /^(.+?)\s*-\s*(.+)$/,  // Title - Artist
            /^(.+?)\s*–\s*(.+)$/,  // Title – Artist (en dash)
            /^(\d+)\s*(.+)$/       // Track number + Title
        ];
        
        for (const pattern of patterns) {
            const match = name.match(pattern);
            if (match) {
                if (pattern === patterns[2]) {
                    return { title: match[2].trim(), artist: 'Unknown Artist' };
                }
                // Song Name - Artist Name format
                return { title: match[1].trim(), artist: match[2].trim() };
            }
        }
        
        return { title: name, artist: 'Unknown Artist' };
    },
    
    /**
     * Generate fake listener count
     */
    getFakeListenerCount() {
        const base = this.getRandomInt(1247, 4892);
        const fluctuation = this.getRandomInt(-50, 50);
        return (base + fluctuation).toLocaleString();
    },
    
    /**
     * Check if device supports touch
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    /**
     * Check if prefers reduced motion
     */
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    
    /**
     * Local storage helpers with error handling
     */
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.warn('Error reading from localStorage:', e);
                return defaultValue;
            }
        },
        
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn('Error writing to localStorage:', e);
                return false;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('Error removing from localStorage:', e);
                return false;
            }
        }
    }
};

// Export for use in other modules
window.Utils = Utils;
