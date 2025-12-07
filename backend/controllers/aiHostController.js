const aiHostService = require('../services/aiHostService');

class AIHostController {
    /**
     * Generate AI host banter (text + voice)
     * POST /api/ai-host/banter
     */
    async generateBanter(req, res) {
        try {
            const { stationId, context } = req.body;

            if (!stationId) {
                return res.status(400).json({ error: 'stationId is required' });
            }

            // Generate both text and voice
            const result = await aiHostService.generateHostContent(stationId, context);

            res.json({
                text: result.text,
                host: result.host,
                station: result.station,
                voice: result.voice,
                // Audio will be sent as base64 for easy transfer
                audioBase64: result.audio.toString('base64')
            });

        } catch (error) {
            console.error('Error in generateBanter:', error);
            res.status(500).json({ 
                error: 'Failed to generate host banter',
                message: error.message 
            });
        }
    }

    /**
     * Generate only text banter (no voice)
     * POST /api/ai-host/text
     */
    async generateTextOnly(req, res) {
        try {
            const { stationId, context } = req.body;

            if (!stationId) {
                return res.status(400).json({ error: 'stationId is required' });
            }

            const result = await aiHostService.generateBanter(stationId, context);

            res.json(result);

        } catch (error) {
            console.error('Error in generateTextOnly:', error);
            res.status(500).json({ 
                error: 'Failed to generate text',
                message: error.message 
            });
        }
    }

    /**
     * Generate voice from text
     * POST /api/ai-host/voice
     */
    async generateVoice(req, res) {
        try {
            const { stationId, text } = req.body;

            if (!stationId || !text) {
                return res.status(400).json({ error: 'stationId and text are required' });
            }

            const result = await aiHostService.generateVoice(stationId, text);

            // Send audio as mp3 stream
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': result.audio.length
            });
            res.send(result.audio);

        } catch (error) {
            console.error('Error in generateVoice:', error);
            res.status(500).json({ 
                error: 'Failed to generate voice',
                message: error.message 
            });
        }
    }

    /**
     * Get host information
     * GET /api/ai-host/info/:stationId
     */
    async getHostInfo(req, res) {
        try {
            const { stationId } = req.params;
            const hostInfo = aiHostService.getHostInfo(stationId);

            if (!hostInfo) {
                return res.status(404).json({ error: 'Host not found for station' });
            }

            res.json(hostInfo);

        } catch (error) {
            console.error('Error in getHostInfo:', error);
            res.status(500).json({ 
                error: 'Failed to get host info',
                message: error.message 
            });
        }
    }

    /**
     * Get all hosts
     * GET /api/ai-host/all
     */
    async getAllHosts(req, res) {
        try {
            const hosts = aiHostService.getAllHosts();
            res.json({ hosts });

        } catch (error) {
            console.error('Error in getAllHosts:', error);
            res.status(500).json({ 
                error: 'Failed to get hosts',
                message: error.message 
            });
        }
    }
}

module.exports = new AIHostController();
