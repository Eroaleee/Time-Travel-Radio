const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins (for development with file:// protocol)
    credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve music files
app.use('/music', express.static(path.join(__dirname, '../music')));

// Routes
const stationRoutes = require('./routes/stationRoutes');
const musicRoutes = require('./routes/musicRoutes');
const aiHostRoutes = require('./routes/aiHostRoutes');

app.use('/api/stations', stationRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/ai-host', aiHostRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Retro Radio Backend is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        message: err.message 
    });
});

// Serve index.html for any unmatched routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(` Retro Radio Backend running on http://localhost:${PORT}`);
    console.log(` Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(` OpenAI API: ${process.env.OPENAI_API_KEY ? 'Connected' : 'NOT CONFIGURED'}`);
});

module.exports = app;
