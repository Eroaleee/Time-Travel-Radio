const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const NodeID3 = require('node-id3');

const MUSIC_DIR = path.join(__dirname, '../../music');

// Station ID to folder mapping
const STATION_FOLDERS = {
    '70s-1': 'disco-fever',
    '70s-2': 'classic-rock',
    '70s-3': 'soul-train',
    '70s-4': 'punk-pioneers',
    '80s-1': 'synthwave-central',
    '80s-2': 'pop-explosion',
    '80s-3': 'rock-arena',
    '80s-4': 'new-wave-paradise',
    '90s-1': 'grunge-station',
    '90s-2': 'hip-hop-headquarters',
    '90s-3': 'boy-band-boulevard',
    '90s-4': 'britpop-beats'
};

// Stream music file
router.get('/stream/:stationId/:filename', (req, res) => {
    try {
        const { stationId, filename } = req.params;
        const decade = stationId.split('-')[0];
        const stationFolder = STATION_FOLDERS[stationId];

        if (!stationFolder) {
            return res.status(404).json({ error: 'Invalid station ID' });
        }

        const filePath = path.join(MUSIC_DIR, decade, stationFolder, filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Music file not found' });
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            // Handle range requests for seeking
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
            
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg',
            });
            
            file.pipe(res);
        } else {
            // Stream entire file
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'audio/mpeg',
            });
            
            fs.createReadStream(filePath).pipe(res);
        }

    } catch (error) {
        console.error('Error streaming music:', error);
        res.status(500).json({ error: 'Failed to stream music' });
    }
});

// Get track metadata
router.get('/track-info/:stationId/:filename', async (req, res) => {
    try {
        const { stationId, filename } = req.params;
        const decade = stationId.split('-')[0];
        const stationFolder = STATION_FOLDERS[stationId];

        if (!stationFolder) {
            return res.status(404).json({ error: 'Invalid station ID' });
        }

        const filePath = path.join(MUSIC_DIR, decade, stationFolder, filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Music file not found' });
        }

        // Read ID3 tags
        const tags = NodeID3.read(filePath);
        
        res.json({
            title: tags.title || filename.replace('.mp3', ''),
            artist: tags.artist || 'Unknown Artist',
            album: tags.album || '',
            year: tags.year || '',
            genre: tags.genre || '',
            filename: filename
        });

    } catch (error) {
        console.error('Error reading track info:', error);
        res.json({
            title: req.params.filename.replace('.mp3', ''),
            artist: 'Unknown Artist',
            filename: req.params.filename
        });
    }
});

// Get playlist for station
router.get('/playlist/:stationId', (req, res) => {
    try {
        const { stationId } = req.params;
        const decade = stationId.split('-')[0];
        const stationFolder = STATION_FOLDERS[stationId];

        if (!stationFolder) {
            return res.status(404).json({ error: 'Invalid station ID' });
        }

        const musicPath = path.join(MUSIC_DIR, decade, stationFolder);

        if (!fs.existsSync(musicPath)) {
            return res.json({ 
                stationId,
                decade,
                stationFolder,
                tracks: [] 
            });
        }

        // Get all mp3 files from station folder
        const files = fs.readdirSync(musicPath)
            .filter(file => file.endsWith('.mp3'))
            .map(file => ({
                filename: file,
                stationId: stationId,
                decade: decade
            }));

        // Shuffle playlist
        const shuffled = files.sort(() => Math.random() - 0.5);

        res.json({ 
            stationId,
            decade,
            stationFolder,
            tracks: shuffled
        });

    } catch (error) {
        console.error('Error getting playlist:', error);
        res.status(500).json({ error: 'Failed to get playlist' });
    }
});

module.exports = router;
