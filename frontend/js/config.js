/**
 * Retro Radio Time Machine - Configuration
 * NO EMOJIS - Using SVG icons instead
 */

const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:3000/api',
    
    // Decades Configuration
    DECADES: {
        '70s': {
            name: '1970s',
            tagline: 'DISCO ERA',
            theme: '70s',
            year: 1975,
            icon: 'disco',
            description: 'Funk / Soul / Disco / Punk',
            colors: {
                primary: '#FF6B35',
                secondary: '#F7931E',
                accent: '#FDC830'
            }
        },
        '80s': {
            name: '1980s',
            tagline: 'NEON DREAMS',
            theme: '80s',
            year: 1985,
            icon: 'synth',
            description: 'Synth / Pop / Metal / Wave',
            colors: {
                primary: '#FF00FF',
                secondary: '#00FFFF',
                accent: '#FF1493'
            }
        },
        '90s': {
            name: '1990s',
            tagline: 'RADICAL VIBES',
            theme: '90s',
            year: 1995,
            icon: 'radio',
            description: 'Grunge / Hip-Hop / Britpop / Pop',
            colors: {
                primary: '#FFD700',
                secondary: '#00CED1',
                accent: '#FF69B4'
            }
        }
    },
    
    // Station Icons by Genre (SVG icon names)
    STATION_ICONS: {
        'disco': 'vinyl',
        'funk': 'saxophone',
        'soul': 'heart',
        'punk': 'lightning',
        'classic rock': 'guitar',
        'synthwave': 'keyboard',
        'pop': 'microphone',
        'heavy metal': 'fire',
        'new wave': 'wave',
        'grunge': 'bolt',
        'hip hop': 'headphones',
        'Britpop': 'flag',
        'default': 'music'
    },
    
    // DJ Talk Schedule Configuration
    DJ_TALK_CONFIG: {
        minSongsBetweenTalk: 1,  // Minimum songs between DJ talk
        maxSongsBetweenTalk: 3,  // Maximum songs between DJ talk
        talkDuration: {
            min: 15,  // seconds
            max: 45   // seconds
        },
        commercialFrequency: 4  // Every X songs, play a commercial
    },
    
    // Audio Configuration
    AUDIO_CONFIG: {
        crossfadeDuration: 2000,  // milliseconds
        defaultVolume: 0.75,
        djVolumeBoost: 1.3,  // Boost DJ audio
        musicDuckVolume: 0.15  // Duck music volume very low when DJ talks
    },
    
    // Billboard Chart Data by Decade - Based on Billboard Hot 100 from December 6-7 of each year
    BILLBOARD_CHARTS: {
        '70s': [
            { position: 1, song: 'Fly, Robin, Fly', artist: 'Silver Convention', indicator: 'up' },
            { position: 2, song: "That's the Way (I Like It)", artist: 'KC and the Sunshine Band', indicator: 'same' },
            { position: 3, song: "Let's Do It Again", artist: 'The Staple Singers', indicator: 'new' },
            { position: 4, song: 'Island Girl', artist: 'Elton John', indicator: 'down' },
            { position: 5, song: "Lyin' Eyes", artist: 'Eagles', indicator: 'down' },
            { position: 6, song: 'Sky High', artist: 'Jigsaw', indicator: 'up' },
            { position: 7, song: 'Nights on Broadway', artist: 'Bee Gees', indicator: 'up' },
            { position: 8, song: 'The Way I Want to Touch You', artist: 'Captain & Tennille', indicator: 'new' },
            { position: 9, song: 'Love Rollercoaster', artist: 'Ohio Players', indicator: 'up' },
            { position: 10, song: 'This Will Be', artist: 'Natalie Cole', indicator: 'same' },
            { position: 11, song: 'Low Rider', artist: 'War', indicator: 'up' },
            { position: 12, song: 'Bad Blood', artist: 'Neil Sedaka', indicator: 'down' },
            { position: 13, song: 'Who Loves You', artist: 'The Four Seasons', indicator: 'down' },
            { position: 14, song: 'Heat Wave / Love Is a Rose', artist: 'Linda Ronstadt', indicator: 'new' },
            { position: 15, song: 'I Only Have Eyes for You', artist: 'Art Garfunkel', indicator: 'down' },
            { position: 16, song: 'Saturday Night', artist: 'Bay City Rollers', indicator: 'up' },
            { position: 17, song: 'Miracles', artist: 'Jefferson Starship', indicator: 'same' },
            { position: 18, song: 'Venus and Mars Rock Show', artist: 'Wings', indicator: 'down' },
            { position: 19, song: 'Our Day Will Come', artist: 'Frankie Valli', indicator: 'new' },
            { position: 20, song: 'Theme from Mahogany', artist: 'Diana Ross', indicator: 'up' }
        ],
        '80s': [
            { position: 1, song: 'Broken Wings', artist: 'Mr. Mister', indicator: 'up' },
            { position: 2, song: 'Say You, Say Me', artist: 'Lionel Richie', indicator: 'new' },
            { position: 3, song: 'We Built This City', artist: 'Starship', indicator: 'down' },
            { position: 4, song: 'Separate Lives', artist: 'Phil Collins & Marilyn Martin', indicator: 'same' },
            { position: 5, song: 'Party All the Time', artist: 'Eddie Murphy', indicator: 'up' },
            { position: 6, song: 'Alive and Kicking', artist: 'Simple Minds', indicator: 'up' },
            { position: 7, song: 'I Miss You', artist: 'Klymaxx', indicator: 'same' },
            { position: 8, song: 'Small Town', artist: 'John Cougar Mellencamp', indicator: 'new' },
            { position: 9, song: 'Tonight She Comes', artist: 'The Cars', indicator: 'up' },
            { position: 10, song: 'One Night Love Affair', artist: 'Bryan Adams', indicator: 'down' },
            { position: 11, song: 'Election Day', artist: 'Arcadia', indicator: 'new' },
            { position: 12, song: "That's What Friends Are For", artist: 'Dionne & Friends', indicator: 'up' },
            { position: 13, song: 'Walk of Life', artist: 'Dire Straits', indicator: 'up' },
            { position: 14, song: 'You Belong to the City', artist: 'Glenn Frey', indicator: 'down' },
            { position: 15, song: 'Fortress Around Your Heart', artist: 'Sting', indicator: 'down' },
            { position: 16, song: 'Be Near Me', artist: 'ABC', indicator: 'same' },
            { position: 17, song: 'Never', artist: 'Heart', indicator: 'up' },
            { position: 18, song: "Who's Zoomin' Who", artist: 'Aretha Franklin', indicator: 'down' },
            { position: 19, song: 'Burning Heart', artist: 'Survivor', indicator: 'new' },
            { position: 20, song: "I'm Goin' Down", artist: 'Bruce Springsteen', indicator: 'down' }
        ],
        '90s': [
            { position: 1, song: 'One Sweet Day', artist: 'Mariah Carey & Boyz II Men', indicator: 'same' },
            { position: 2, song: 'Exhale (Shoop Shoop)', artist: 'Whitney Houston', indicator: 'up' },
            { position: 3, song: 'Hey Lover', artist: 'LL Cool J feat. Boyz II Men', indicator: 'up' },
            { position: 4, song: "Gangsta's Paradise", artist: 'Coolio feat. L.V.', indicator: 'down' },
            { position: 5, song: 'Fantasy', artist: 'Mariah Carey', indicator: 'down' },
            { position: 6, song: "Diggin' on You", artist: 'TLC', indicator: 'same' },
            { position: 7, song: 'Name', artist: 'Goo Goo Dolls', indicator: 'up' },
            { position: 8, song: "Breakfast at Tiffany's", artist: 'Deep Blue Something', indicator: 'new' },
            { position: 9, song: 'Waterfalls', artist: 'TLC', indicator: 'down' },
            { position: 10, song: 'You Oughta Know', artist: 'Alanis Morissette', indicator: 'same' },
            { position: 11, song: 'Runaway', artist: 'Janet Jackson', indicator: 'new' },
            { position: 12, song: 'Missing', artist: 'Everything but the Girl', indicator: 'up' },
            { position: 13, song: 'As I Lay Me Down', artist: 'Sophie B. Hawkins', indicator: 'down' },
            { position: 14, song: 'Tell Me', artist: 'Groove Theory', indicator: 'same' },
            { position: 15, song: 'I Got Id / Long Road', artist: 'Pearl Jam', indicator: 'new' },
            { position: 16, song: 'Boombastic', artist: 'Shaggy', indicator: 'down' },
            { position: 17, song: 'Colors of the Wind', artist: 'Vanessa Williams', indicator: 'down' },
            { position: 18, song: 'Kiss from a Rose', artist: 'Seal', indicator: 'down' },
            { position: 19, song: 'Roll to Me', artist: 'Del Amitri', indicator: 'up' },
            { position: 20, song: 'Creep', artist: 'TLC', indicator: 'down' }
        ]
    },
    
    // Era-Specific News Headlines
    NEWS_HEADLINES: {
        '70s': [
            'WATERGATE: Nixon faces impeachment hearings',
            'DISCO FEVER: Saturday Night Fever breaks box office records',
            'SPACE AGE: Viking 1 lands on Mars successfully',
            'MUSIC: The Bee Gees dominate the charts',
            'FASHION: Bell bottoms and platform shoes everywhere',
            'TECHNOLOGY: Apple Computer founded in garage',
            'SPORTS: Muhammad Ali reclaims heavyweight title',
            'POLITICS: Jimmy Carter elected 39th President'
        ],
        '80s': [
            'MTV REVOLUTION: Music television changes the industry',
            'BERLIN WALL: Historic monument begins to fall',
            'TECH BOOM: Personal computers enter homes nationwide',
            'COLD WAR: Reagan and Gorbachev hold summit',
            'SPACE SHUTTLE: Challenger tragedy shocks nation',
            'FASHION: Neon colors and big hair define the decade',
            'MOVIES: Back to the Future tops box office',
            'LIVE AID: Biggest concert in history raises millions'
        ],
        '90s': [
            'WORLD WIDE WEB: Internet revolution begins',
            'GRUNGE ERA: Seattle sound takes over radio',
            'COLD WAR ENDS: Soviet Union officially dissolves',
            'Y2K PANIC: World prepares for millennium bug',
            'TECH STOCKS: Dot-com bubble continues to grow',
            'PRINCESS DIANA: World mourns tragic loss',
            'GAMING: PlayStation and N64 battle for dominance',
            'MOVIES: Titanic becomes highest-grossing film ever'
        ]
    },
    
    // Funny Weather Reports
    WEATHER_REPORTS: {
        '70s': [
            'Groovy weather out there, baby! Perfect for roller disco!',
            'It\'s hotter than a disco ball under the lights!',
            'Funky fresh temperatures, ideal for cruising in your van!',
            'Far out forecast - sunny with a chance of boogie!'
        ],
        '80s': [
            'Totally tubular weather! Grab your Walkman and hit the beach!',
            'Like, totally gnarly conditions for skateboarding!',
            'Radical temps outside - perfect for mall hopping!',
            'The forecast is most excellent, dude!'
        ],
        '90s': [
            'Weather\'s all that and a bag of chips today!',
            'It\'s da bomb outside - perfect for rollerblading!',
            'Talk to the hand if you don\'t like this weather!',
            'Whatever, the weather\'s actually pretty cool today!'
        ]
    },
    
    // Animation Timings
    ANIMATIONS: {
        pageTransition: 500,
        timeTravelDuration: 3000,
        stationTuneDelay: 1500,
        djTalkFadeIn: 500,
        typewriterSpeed: 30
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.DECADES);
Object.freeze(CONFIG.AUDIO_CONFIG);
Object.freeze(CONFIG.ANIMATIONS);
