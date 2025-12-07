const OpenAI = require('openai');
const HOST_PERSONALITIES = require('../config/hostPersonalities');
const fs = require('fs');
const path = require('path');

// Lazy initialization to avoid crash if API key not set
let openai = null;

function getOpenAI() {
    if (!openai) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    return openai;
}

class AIHostService {
    /**
     * Generate AI host banter text based on station and context
     */
    async generateBanter(stationId, context = {}) {
        try {
            const hostConfig = HOST_PERSONALITIES[stationId];
            
            if (!hostConfig) {
                throw new Error(`No host configured for station: ${stationId}`);
            }

            // Build context-aware prompt
            let userPrompt = this.buildContextPrompt(context);

            const completion = await getOpenAI().chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: hostConfig.personality
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature: 0.9, // More creative
                max_tokens: 150
            });

            const banterText = completion.choices[0].message.content.trim();
            
            return {
                text: banterText,
                host: hostConfig.name,
                station: hostConfig.station
            };

        } catch (error) {
            console.error('Error generating banter:', error);
            throw error;
        }
    }

    /**
     * Generate AI host voice using OpenAI TTS
     */
    async generateVoice(stationId, text) {
        try {
            const hostConfig = HOST_PERSONALITIES[stationId];
            
            if (!hostConfig) {
                throw new Error(`No host configured for station: ${stationId}`);
            }

            const mp3 = await getOpenAI().audio.speech.create({
                model: 'tts-1',
                voice: hostConfig.voice,
                input: text,
                speed: 1.1 // Slightly faster for more radio energy
            });

            // Convert to buffer
            const buffer = Buffer.from(await mp3.arrayBuffer());
            
            return {
                audio: buffer,
                host: hostConfig.name,
                station: hostConfig.station,
                voice: hostConfig.voice
            };

        } catch (error) {
            console.error('Error generating voice:', error);
            throw error;
        }
    }

    /**
     * Generate both text and voice in one call
     */
    async generateHostContent(stationId, context = {}) {
        try {
            // First generate the text
            const banterResult = await this.generateBanter(stationId, context);
            
            // Then convert to speech
            const voiceResult = await this.generateVoice(stationId, banterResult.text);
            
            return {
                text: banterResult.text,
                audio: voiceResult.audio,
                host: banterResult.host,
                station: banterResult.station,
                voice: voiceResult.voice
            };

        } catch (error) {
            console.error('Error generating host content:', error);
            throw error;
        }
    }

    /**
     * Build context-specific prompt for AI
     */
    buildContextPrompt(context) {
        const { event, trackTitle, trackArtist, previousTrack, nextTrack, decade, timeOfDay } = context;

        switch (event) {
            case 'track_transition':
                let transitionPrompt = '';
                if (previousTrack) {
                    transitionPrompt = `That was ${this.cleanTrackName(previousTrack)}! Share a quick FUN FACT about that song or artist - something interesting the listeners might not know (like when it was released, chart positions, interesting recording story, or cultural impact).`;
                }
                if (nextTrack) {
                    transitionPrompt += ` Now introduce the next track: ${this.cleanTrackName(nextTrack)} - maybe tease what makes this song special!`;
                }
                transitionPrompt += ` Keep it CONCISE (2-3 sentences), energetic, and informative like a knowledgeable radio DJ from the ${decade}!`;
                return transitionPrompt;
            
            case 'track_intro':
                return `Introduce the next song: "${trackTitle}" by ${trackArtist}. Share a quick fun fact or interesting tidbit about the song or artist. Keep it SHORT (1-2 sentences) and exciting!`;
            
            case 'station_id':
                return `Do a quick station identification! Remind listeners what station they're on. Keep it SHORT and punchy!`;
            
            case 'random_banter':
                return `Share a fun fact or nostalgic comment about ${decade} music! Keep it SHORT (2 sentences max) and interesting!`;
            
            case 'time_check':
                return `Give a quick time check and tease what's coming up! Keep it SHORT!`;
            
            default:
                return `Share a quick fun fact about ${decade} music or the current song! Keep it SHORT (1-2 sentences)!`;
        }
    }

    /**
     * Clean track name from filename
     * Format: "Song Name - Artist Name.mp3"
     */
    cleanTrackName(filename) {
        if (!filename) return 'an amazing track';
        // Remove .mp3 extension
        let name = filename.replace(/\.mp3$/i, '');
        
        // Try to parse "Song - Artist" format
        const match = name.match(/^(.+?)\s*[-–]\s*(.+)$/);
        if (match) {
            const title = match[1].trim();
            const artist = match[2].trim();
            return `"${title}" by ${artist}`;
        }
        
        // Fallback: just clean up the name
        return name.replace(/[-_]/g, ' ');
    }

    /**
     * Get host info for a station
     */
    getHostInfo(stationId) {
        const hostConfig = HOST_PERSONALITIES[stationId];
        
        if (!hostConfig) {
            return null;
        }

        return {
            name: hostConfig.name,
            station: hostConfig.station,
            voice: hostConfig.voice,
            genre: hostConfig.musicGenre
        };
    }

    /**
     * Get all available hosts
     */
    getAllHosts() {
        return Object.keys(HOST_PERSONALITIES).map(stationId => ({
            stationId,
            ...this.getHostInfo(stationId)
        }));
    }
}

module.exports = new AIHostService();
