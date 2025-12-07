/**
 * Retro Radio Time Machine - Era Data
 * Historical Billboard charts and news for authentic period atmosphere
 * Charts based on Billboard Hot 100 from December 6th of each year
 */

const BILLBOARD_DATA = {
    '70s': {
        year: 1975,
        date: "December 6, 1975",
        charts: [
            { position: 1, title: "Fly, Robin, Fly", artist: "Silver Convention" },
            { position: 2, title: "That's the Way (I Like It)", artist: "KC and the Sunshine Band" },
            { position: 3, title: "Let's Do It Again", artist: "The Staple Singers" },
            { position: 4, title: "Island Girl", artist: "Elton John" },
            { position: 5, title: "Lyin' Eyes", artist: "Eagles" },
            { position: 6, title: "Sky High", artist: "Jigsaw" },
            { position: 7, title: "Nights on Broadway", artist: "Bee Gees" },
            { position: 8, title: "The Way I Want to Touch You", artist: "Captain & Tennille" },
            { position: 9, title: "Love Rollercoaster", artist: "Ohio Players" },
            { position: 10, title: "This Will Be", artist: "Natalie Cole" },
            { position: 11, title: "Low Rider", artist: "War" },
            { position: 12, title: "Bad Blood", artist: "Neil Sedaka" },
            { position: 13, title: "Who Loves You", artist: "The Four Seasons" },
            { position: 14, title: "Heat Wave/Love Is a Rose", artist: "Linda Ronstadt" },
            { position: 15, title: "I Only Have Eyes for You", artist: "Art Garfunkel" },
            { position: 16, title: "Saturday Night", artist: "Bay City Rollers" },
            { position: 17, title: "Miracles", artist: "Jefferson Starship" },
            { position: 18, title: "Venus and Mars Rock Show", artist: "Wings" },
            { position: 19, title: "Our Day Will Come", artist: "Frankie Valli" },
            { position: 20, title: "Theme from Mahogany", artist: "Diana Ross" }
        ],
        news: [
            { headline: "Jaws Becomes Highest Grossing Film in History!", category: "entertainment" },
            { headline: "Bruce Springsteen Appears on Time and Newsweek Covers", category: "music" },
            { headline: "Saturday Night Live Premieres on NBC", category: "entertainment" },
            { headline: "Microsoft Founded by Bill Gates and Paul Allen", category: "tech" },
            { headline: "Pet Rocks Become Unexpected Holiday Sensation", category: "culture" },
            { headline: "Disco Music Dominates Airwaves", category: "music" },
            { headline: "NASA's Viking Program Set to Land on Mars", category: "science" },
            { headline: "CB Radio Craze Sweeps America", category: "culture" }
        ]
    },
    '80s': {
        year: 1985,
        date: "December 7, 1985",
        charts: [
            { position: 1, title: "Broken Wings", artist: "Mr. Mister" },
            { position: 2, title: "Say You, Say Me", artist: "Lionel Richie" },
            { position: 3, title: "We Built This City", artist: "Starship" },
            { position: 4, title: "Separate Lives", artist: "Phil Collins and Marilyn Martin" },
            { position: 5, title: "Party All the Time", artist: "Eddie Murphy" },
            { position: 6, title: "Alive and Kicking", artist: "Simple Minds" },
            { position: 7, title: "I Miss You", artist: "Klymaxx" },
            { position: 8, title: "Small Town", artist: "John Cougar Mellencamp" },
            { position: 9, title: "Tonight She Comes", artist: "The Cars" },
            { position: 10, title: "One Night Love Affair", artist: "Bryan Adams" },
            { position: 11, title: "Election Day", artist: "Arcadia" },
            { position: 12, title: "That's What Friends Are For", artist: "Dionne & Friends" },
            { position: 13, title: "Walk of Life", artist: "Dire Straits" },
            { position: 14, title: "You Belong to the City", artist: "Glenn Frey" },
            { position: 15, title: "Fortress Around Your Heart", artist: "Sting" },
            { position: 16, title: "Be Near Me", artist: "ABC" },
            { position: 17, title: "Never", artist: "Heart" },
            { position: 18, title: "Who's Zoomin' Who", artist: "Aretha Franklin" },
            { position: 19, title: "Burning Heart", artist: "Survivor" },
            { position: 20, title: "I'm Goin' Down", artist: "Bruce Springsteen" }
        ],
        news: [
            { headline: "Back to the Future Opens to Record Crowds!", category: "entertainment" },
            { headline: "Live Aid Concert Raises Millions for Africa", category: "music" },
            { headline: "Nintendo Entertainment System Launches in America", category: "tech" },
            { headline: "Rocky IV Dominates Box Office", category: "entertainment" },
            { headline: "Microsoft Windows 1.0 Released", category: "tech" },
            { headline: "New Coke Faces Consumer Backlash", category: "business" },
            { headline: "MTV's Influence on Music Industry Growing", category: "music" },
            { headline: "Commodore Amiga Computer Unveiled", category: "tech" }
        ]
    },
    '90s': {
        year: 1995,
        date: "December 9, 1995",
        charts: [
            { position: 1, title: "One Sweet Day", artist: "Mariah Carey & Boyz II Men" },
            { position: 2, title: "Exhale (Shoop Shoop)", artist: "Whitney Houston" },
            { position: 3, title: "Hey Lover", artist: "LL Cool J feat. Boyz II Men" },
            { position: 4, title: "Gangsta's Paradise", artist: "Coolio feat. L.V." },
            { position: 5, title: "Fantasy", artist: "Mariah Carey" },
            { position: 6, title: "Diggin' on You", artist: "TLC" },
            { position: 7, title: "Name", artist: "Goo Goo Dolls" },
            { position: 8, title: "Breakfast at Tiffany's", artist: "Deep Blue Something" },
            { position: 9, title: "Waterfalls", artist: "TLC" },
            { position: 10, title: "You Oughta Know", artist: "Alanis Morissette" },
            { position: 11, title: "Runaway", artist: "Janet Jackson" },
            { position: 12, title: "Missing", artist: "Everything but the Girl" },
            { position: 13, title: "As I Lay Me Down", artist: "Sophie B. Hawkins" },
            { position: 14, title: "Tell Me", artist: "Groove Theory" },
            { position: 15, title: "I Got Id/Long Road", artist: "Pearl Jam" },
            { position: 16, title: "Boombastic", artist: "Shaggy" },
            { position: 17, title: "Colors of the Wind", artist: "Vanessa Williams" },
            { position: 18, title: "Kiss from a Rose", artist: "Seal" },
            { position: 19, title: "Roll to Me", artist: "Del Amitri" },
            { position: 20, title: "Creep", artist: "TLC" }
        ],
        news: [
            { headline: "Windows 95 Launches with Massive Marketing Campaign!", category: "tech" },
            { headline: "Toy Story: First Fully CGI Animated Film Released", category: "entertainment" },
            { headline: "O.J. Simpson Trial Verdict Captivates Nation", category: "breaking" },
            { headline: "PlayStation Outselling All Competitors", category: "tech" },
            { headline: "Alanis Morissette's Jagged Little Pill Goes Multi-Platinum", category: "music" },
            { headline: "Internet Users Reach 16 Million Worldwide", category: "tech" },
            { headline: "Friends TV Show Breaks Ratings Records", category: "entertainment" },
            { headline: "Waiting to Exhale Soundtrack Tops Charts", category: "music" }
        ]
    }
};

const DECADE_SLOGANS = {
    '70s': [
        "Keep on Truckin'!",
        "Disco Never Dies!",
        "Peace, Love, and Soul!",
        "Groovy, Baby!",
        "Far Out, Man!"
    ],
    '80s': [
        "Totally Radical!",
        "The Future is Now!",
        "Where We're Going, We Don't Need Roads!",
        "1.21 Gigawatts!",
        "Heavy!"
    ],
    '90s': [
        "All That and a Bag of Chips!",
        "Talk to the Hand!",
        "Boo-Yah!",
        "As If!",
        "Phat Beats!"
    ]
};

const ERA_FACTS = {
    '70s': [
        "The first handheld mobile phone call was made in 1973!",
        "Star Wars premiered in 1977 and changed cinema forever!",
        "The Walkman was invented in 1979!",
        "Disco dominated the charts from 1975-1979!",
        "Video games entered arcades with Pong in 1972!"
    ],
    '80s': [
        "MTV launched on August 1, 1981!",
        "The DeLorean DMC-12 was produced from 1981-1983!",
        "Back to the Future premiered on July 3, 1985!",
        "The Berlin Wall fell in 1989!",
        "Nintendo saved the video game industry in 1985!"
    ],
    '90s': [
        "The World Wide Web went public in 1991!",
        "Nirvana's Nevermind changed rock music in 1991!",
        "The first text message was sent in 1992!",
        "DVD technology was invented in 1995!",
        "Google was founded in 1998!"
    ]
};

const DJ_INTROS = {
    '70s': [
        "Comin' at ya live from the disco floor!",
        "Keep those platforms stompin', baby!",
        "This is your soul train conductor speaking!",
        "Let's get funky, y'all!"
    ],
    '80s': [
        "Greetings from the future!",
        "Great Scott! What a track coming up!",
        "This one's heavier than plutonium!",
        "Rad tunes incoming!"
    ],
    '90s': [
        "Yo yo yo, what's up party people!",
        "This track is da bomb!",
        "Keepin' it real in the 9-0!",
        "Word to your mother!"
    ]
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BILLBOARD_DATA, DECADE_SLOGANS, ERA_FACTS, DJ_INTROS };
}
