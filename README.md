# 🕰️ Time Travel Radio

A nostalgic web application that lets you experience radio broadcasting from different decades (70s, 80s, 90s) with authentic retro interfaces, AI-powered DJ hosts, and period-accurate music.

![Time Travel Radio](frontend/assets/retro_radio.ico)

## ✨ Features

- **DeLorean-style Time Machine Interface** - Select your decade with authentic toggle switches and safety controls
- **Decade-Specific Radio Designs**:
  - 🕺 **70s**: Wood-paneled Hi-Fi receiver with FM buttons and large speaker
  - 🎹 **80s**: Synthwave LED display with spectrum analyzer and neon aesthetics
  - 💿 **90s**: LCD Boombox with CD player visuals and wave bars
- **AI DJ Hosts** - Each station has its own AI-powered DJ that introduces songs and provides period-accurate banter
- **Authentic Audio** - Music streaming with proper ducking during DJ speech
- **Visual Effects** - Disco lights (70s), lava lamp effects (80s), and era-specific backgrounds
- **Continuous Broadcasting** - Stations continue playing even when you switch or turn off the radio

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- An [OpenAI API Key](https://platform.openai.com/api-keys) for the AI DJ feature

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Eroaleee/Time-Travel-Radio.git
   cd Time-Travel-Radio
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure your OpenAI API Key**
   
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   ⚠️ **Important**: Replace `your_openai_api_key_here` with your actual OpenAI API key. You can get one from [OpenAI's Platform](https://platform.openai.com/api-keys).

4. **Add your music files**
   
   Create a `music` folder in the root directory with subfolders for each station:
   ```
   music/
    music/70s/
    music/70s/disco-fever/
    music/70s/disco-fever/Song Name - Artist Name.mp3
    music/70s/classic-rock/
    music/70s/classic-rock/Song Name - Artist Name.mp3
    music/70s/soul-train/
    music/70s/soul-train/Song Name - Artist Name.mp3
    music/70s/punk-pioneers/
    music/70s/punk-pioneers/Song Name - Artist Name.mp3
    music/80s/
    music/80s/synthwave-central/
    music/80s/synthwave-central/Song Name - Artist Name.mp3
    music/80s/pop-explosion/
    music/80s/pop-explosion/Song Name - Artist Name.mp3
    music/80s/rock-arena/
    music/80s/rock-arena/Song Name - Artist Name.mp3
    music/80s/new-wave-paradise/
    music/80s/new-wave-paradise/Song Name - Artist Name.mp3
    music/90s/
    music/90s/grunge-station/
    music/90s/grunge-station/Song Name - Artist Name.mp3
    music/90s/hip-hop-headquarters/
    music/90s/hip-hop-headquarters/Song Name - Artist Name.mp3
    music/90s/boy-band-boulevard/
    msusic/90s/boy-band-boulevard/Song Name - Artist Name.mp3
    music/90s/britpop-beats/
    music/90s/britpop-beats/Song Name - Artist Name.mp3
   ```
   
   Add `.mp3` files to each station folder. The filename format should be: `Artist - Song Title.mp3`

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The server will run on `http://localhost:3000`

2. **Open the frontend**
   
   Open `frontend/index.html` in your browser, or use a local server like Live Server in VS Code.

## 🎮 How to Use

1. **Select a Decade** - Click one of the three toggle switches (70s, 80s, 90s)
2. **Arm the Time Machine** - Lift the safety cover
3. **Engage!** - Press the ENGAGE button to travel to your selected era
4. **Enjoy the Radio** - Use the station buttons to switch between different music channels
5. **Power Control** - Use the power button to turn the radio on/off
6. **Return** - Click "Return to Present" to go back to the time machine

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, CSS3 with advanced animations
- **Backend**: Node.js, Express
- **AI**: OpenAI GPT-4 for DJ banter, OpenAI TTS for voice synthesis
- **Audio**: Web Audio API for visualizations and effects

## 📁 Project Structure

```
Time-Travel-Radio/
├── backend/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route handlers
│   ├── routes/         # API routes
│   ├── services/       # Business logic (AI host, music)
│   ├── server.js       # Express server
│   └── .env            # Environment variables (create this!)
├── frontend/
│   ├── assets/         # Images and icons
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript modules
│   └── index.html      # Main HTML file
├── music/              # Your music files (create this!)
└── README.md
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | No |
| `OPENAI_API_KEY` | Your OpenAI API key for AI DJ | **Yes** |

### Audio Settings

You can adjust audio settings in `frontend/js/config.js`:
- `musicDuckVolume`: Volume level when DJ is talking (0-1)
- `djVolumeBoost`: DJ voice boost multiplier
- `crossfadeDuration`: Track crossfade duration in ms

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

This project is for educational and personal use.

## 🙏 Acknowledgments

- Inspired by Back to the Future's DeLorean time machine
- Billboard chart data from historical records
- Built for the hackathon with ❤️

---

**Note**: This application requires your own music files and OpenAI API key to function. The AI DJ feature uses OpenAI's GPT-4 and TTS APIs which have associated costs.
