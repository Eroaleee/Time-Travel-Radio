const express = require('express');
const router = express.Router();

// Station configurations
const STATIONS_CONFIG = {
    '70s': [
        { id: '70s-1', name: 'Disco Fever', host: 'Funky Fred', genre: 'disco, funk, soul' },
        { id: '70s-2', name: 'Classic Rock', host: 'Rockin\' Roger', genre: 'classic rock' },
        { id: '70s-3', name: 'Soul Train', host: 'Smooth Steve', genre: 'soul, R&B' },
        { id: '70s-4', name: 'Punk Pioneers', host: 'Rebel Rita', genre: 'punk rock' }
    ],
    '80s': [
        { id: '80s-1', name: 'Synthwave Central', host: 'DJ Neon Rick', genre: 'synthwave' },
        { id: '80s-2', name: 'Pop Explosion', host: 'Madonna Mike', genre: 'pop' },
        { id: '80s-3', name: 'Rock Arena', host: 'Metal Mandy', genre: 'heavy metal' },
        { id: '80s-4', name: 'New Wave Paradise', host: 'Duran Dan', genre: 'new wave' }
    ],
    '90s': [
        { id: '90s-1', name: 'Grunge Station', host: 'Alternative Alice', genre: 'grunge' },
        { id: '90s-2', name: 'Hip Hop Headquarters', host: 'Fresh Prince Phil', genre: 'hip hop' },
        { id: '90s-3', name: 'Boy Band Boulevard', host: 'Backstreet Bob', genre: 'pop' },
        { id: '90s-4', name: 'Britpop Beats', host: 'Oasis Owen', genre: 'Britpop' }
    ]
};

// Get all stations for a decade
router.get('/:decade', (req, res) => {
    const { decade } = req.params;
    const stations = STATIONS_CONFIG[decade];

    if (!stations) {
        return res.status(404).json({ error: 'Decade not found' });
    }

    res.json({ decade, stations });
});

// Get specific station info
router.get('/info/:stationId', (req, res) => {
    const { stationId } = req.params;
    
    // Find station across all decades
    for (const decade in STATIONS_CONFIG) {
        const station = STATIONS_CONFIG[decade].find(s => s.id === stationId);
        if (station) {
            return res.json({ ...station, decade });
        }
    }

    res.status(404).json({ error: 'Station not found' });
});

module.exports = router;
