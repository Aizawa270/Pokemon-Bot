// ULTIMATE POKÉMON RPG BOT - COMPLETE WITH ALL 386 POKÉMON
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

// Bot Configuration
const prefix = '.';
const adminId = '852839588689870879';
const BATTLE_TIMEOUT = 300000;

// Data Storage
let players = new Map();
let prefixlessUsers = new Set();
let currentBattles = new Map();
let nicknames = new Map();
let gymLeaders = new Map();
let cooldowns = new Map();
let quests = new Map();
let achievements = new Map();

// Load Data
function loadData() {
    try {
        if (fs.existsSync('data/players.json')) {
            const data = JSON.parse(fs.readFileSync('data/players.json', 'utf8'));
            players = new Map(data);
        }
        if (fs.existsSync('data/prefixless.json')) {
            prefixlessUsers = new Set(JSON.parse(fs.readFileSync('data/prefixless.json', 'utf8')));
        }
        if (fs.existsSync('data/nicknames.json')) {
            nicknames = new Map(JSON.parse(fs.readFileSync('data/nicknames.json', 'utf8')));
        }
        if (fs.existsSync('data/gym_leaders.json')) {
            gymLeaders = new Map(JSON.parse(fs.readFileSync('data/gym_leaders.json', 'utf8')));
        }
        if (fs.existsSync('data/quests.json')) {
            quests = new Map(JSON.parse(fs.readFileSync('data/quests.json', 'utf8')));
        }
        if (fs.existsSync('data/achievements.json')) {
            achievements = new Map(JSON.parse(fs.readFileSync('data/achievements.json', 'utf8')));
        }
        console.log('✅ All data loaded successfully');
    } catch (e) {
        console.log('📁 No existing data found, starting fresh');
        if (!fs.existsSync('data')) fs.mkdirSync('data');
    }
}

// Save Data
function saveData() {
    try {
        fs.writeFileSync('data/players.json', JSON.stringify([...players]));
        fs.writeFileSync('data/prefixless.json', JSON.stringify([...prefixlessUsers]));
        fs.writeFileSync('data/nicknames.json', JSON.stringify([...nicknames]));
        fs.writeFileSync('data/gym_leaders.json', JSON.stringify([...gymLeaders]));
        fs.writeFileSync('data/quests.json', JSON.stringify([...quests]));
        fs.writeFileSync('data/achievements.json', JSON.stringify([...achievements]));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

// Auto-save every 3 minutes
setInterval(saveData, 180000);

// COMPLETE POKÉMON DATA - ALL 386 POKÉMON WITH SPRITES
const pokemonData = {
    // ========== KANTO (1-151) ==========
    'Bulbasaur': { id: 1, type: 'Grass/Poison', level: 5, evolvesAt: 16, evolvesTo: 'Ivysaur', moves: ['Tackle','Growl','Vine Whip','Leech Seed'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
    'Ivysaur': { id: 2, type: 'Grass/Poison', level: 16, evolvesAt: 32, evolvesTo: 'Venusaur', moves: ['Vine Whip','Razor Leaf','Growth','Sleep Powder'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png' },
    'Venusaur': { id: 3, type: 'Grass/Poison', level: 32, evolvesAt: 999, evolvesTo: '', moves: ['Solar Beam','Sludge Bomb','Growth','Sleep Powder'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png' },
    
    'Charmander': { id: 4, type: 'Fire', level: 5, evolvesAt: 16, evolvesTo: 'Charmeleon', moves: ['Scratch','Growl','Ember','Smokescreen'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' },
    'Charmeleon': { id: 5, type: 'Fire', level: 16, evolvesAt: 36, evolvesTo: 'Charizard', moves: ['Ember','Fire Fang','Slash','Dragon Rage'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png' },
    'Charizard': { id: 6, type: 'Fire/Flying', level: 36, evolvesAt: 999, evolvesTo: '', moves: ['Flamethrower','Dragon Claw','Wing Attack','Fire Spin'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png' },
    
    'Squirtle': { id: 7, type: 'Water', level: 5, evolvesAt: 16, evolvesTo: 'Wartortle', moves: ['Tackle','Tail Whip','Water Gun','Withdraw'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png' },
    'Wartortle': { id: 8, type: 'Water', level: 16, evolvesAt: 36, evolvesTo: 'Blastoise', moves: ['Water Gun','Bite','Rapid Spin','Protect'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png' },
    'Blastoise': { id: 9, type: 'Water', level: 36, evolvesAt: 999, evolvesTo: '', moves: ['Hydro Pump','Skull Bash','Rapid Spin','Protect'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png' },
    
    'Caterpie': { id: 10, type: 'Bug', level: 3, evolvesAt: 7, evolvesTo: 'Metapod', moves: ['Tackle','String Shot','Bug Bite','Harden'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png' },
    'Metapod': { id: 11, type: 'Bug', level: 7, evolvesAt: 10, evolvesTo: 'Butterfree', moves: ['Harden','String Shot','Tackle',''], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png' },
    'Butterfree': { id: 12, type: 'Bug/Flying', level: 10, evolvesAt: 999, evolvesTo: '', moves: ['Confusion','Gust','Sleep Powder','Poison Powder'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png' },
    
    'Weedle': { id: 13, type: 'Bug/Poison', level: 3, evolvesAt: 7, evolvesTo: 'Kakuna', moves: ['Poison Sting','String Shot','Bug Bite','Harden'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png' },
    'Kakuna': { id: 14, type: 'Bug/Poison', level: 7, evolvesAt: 10, evolvesTo: 'Beedrill', moves: ['Harden','String Shot','Poison Sting',''], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png' },
    'Beedrill': { id: 15, type: 'Bug/Poison', level: 10, evolvesAt: 999, evolvesTo: '', moves: ['Fury Attack','Twineedle','Rage','Focus Energy'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png' },
    
    'Pidgey': { id: 16, type: 'Normal/Flying', level: 2, evolvesAt: 18, evolvesTo: 'Pidgeotto', moves: ['Tackle','Sand Attack','Gust','Quick Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png' },
    'Pidgeotto': { id: 17, type: 'Normal/Flying', level: 18, evolvesAt: 36, evolvesTo: 'Pidgeot', moves: ['Gust','Quick Attack','Wing Attack','Whirlwind'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png' },
    'Pidgeot': { id: 18, type: 'Normal/Flying', level: 36, evolvesAt: 999, evolvesTo: '', moves: ['Wing Attack','Quick Attack','Hurricane','Feather Dance'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png' },
    
    'Rattata': { id: 19, type: 'Normal', level: 2, evolvesAt: 20, evolvesTo: 'Raticate', moves: ['Tackle','Tail Whip','Quick Attack','Hyper Fang'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png' },
    'Raticate': { id: 20, type: 'Normal', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Hyper Fang','Quick Attack','Focus Energy','Super Fang'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png' },
    
    'Spearow': { id: 21, type: 'Normal/Flying', level: 3, evolvesAt: 20, evolvesTo: 'Fearow', moves: ['Peck','Growl','Leer','Fury Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/21.png' },
    'Fearow': { id: 22, type: 'Normal/Flying', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Drill Peck','Fury Attack','Mirror Move','Agility'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/22.png' },
    
    'Ekans': { id: 23, type: 'Poison', level: 4, evolvesAt: 22, evolvesTo: 'Arbok', moves: ['Wrap','Leer','Poison Sting','Bite'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/23.png' },
    'Arbok': { id: 24, type: 'Poison', level: 22, evolvesAt: 999, evolvesTo: '', moves: ['Poison Sting','Bite','Glare','Screech'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/24.png' },
    
    'Pikachu': { id: 25, type: 'Electric', level: 5, evolvesAt: 999, evolvesTo: 'Raichu', moves: ['Thunder Shock','Growl','Quick Attack','Tail Whip'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' },
    'Raichu': { id: 26, type: 'Electric', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Thunderbolt','Quick Attack','Thunder Wave','Spark'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png' },
    
    'Sandshrew': { id: 27, type: 'Ground', level: 6, evolvesAt: 22, evolvesTo: 'Sandslash', moves: ['Scratch','Defense Curl','Sand Attack','Poison Sting'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png' },
    'Sandslash': { id: 28, type: 'Ground', level: 22, evolvesAt: 999, evolvesTo: '', moves: ['Slash','Sand Attack','Poison Sting','Swift'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/28.png' },
    
    'Nidoran♀': { id: 29, type: 'Poison', level: 4, evolvesAt: 16, evolvesTo: 'Nidorina', moves: ['Growl','Tackle','Scratch','Double Kick'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/29.png' },
    'Nidorina': { id: 30, type: 'Poison', level: 16, evolvesAt: 999, evolvesTo: 'Nidoqueen', moves: ['Poison Sting','Double Kick','Bite','Fury Swipes'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png' },
    'Nidoqueen': { id: 31, type: 'Poison/Ground', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Body Slam','Earthquake','Poison Sting','Superpower'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/31.png' },
    
    'Nidoran♂': { id: 32, type: 'Poison', level: 4, evolvesAt: 16, evolvesTo: 'Nidorino', moves: ['Leer','Peck','Focus Energy','Double Kick'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/32.png' },
    'Nidorino': { id: 33, type: 'Poison', level: 16, evolvesAt: 999, evolvesTo: 'Nidoking', moves: ['Poison Sting','Double Kick','Horn Attack','Fury Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/33.png' },
    'Nidoking': { id: 34, type: 'Poison/Ground', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Thrash','Earthquake','Poison Sting','Megahorn'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png' },
    
    'Clefairy': { id: 35, type: 'Fairy', level: 8, evolvesAt: 36, evolvesTo: 'Clefable', moves: ['Pound','Growl','Sing','Double Slap'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png' },
    'Clefable': { id: 36, type: 'Fairy', level: 36, evolvesAt: 999, evolvesTo: '', moves: ['Moonblast','Metronome','Minimize','Double Slap'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/36.png' },
    
    'Vulpix': { id: 37, type: 'Fire', level: 7, evolvesAt: 999, evolvesTo: 'Ninetales', moves: ['Ember','Tail Whip','Quick Attack','Roar'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png' },
    'Ninetales': { id: 38, type: 'Fire', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Flamethrower','Confuse Ray','Fire Spin','Safeguard'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/38.png' },
    
    'Jigglypuff': { id: 39, type: 'Normal/Fairy', level: 6, evolvesAt: 36, evolvesTo: 'Wigglytuff', moves: ['Sing','Pound','Disable','Defense Curl'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png' },
    'Wigglytuff': { id: 40, type: 'Normal/Fairy', level: 36, evolvesAt: 999, evolvesTo: '', moves: ['Double Slap','Rest','Body Slam','Hyper Voice'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png' },
    
    'Zubat': { id: 41, type: 'Poison/Flying', level: 3, evolvesAt: 22, evolvesTo: 'Golbat', moves: ['Leech Life','Supersonic','Astonish','Bite'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png' },
    'Golbat': { id: 42, type: 'Poison/Flying', level: 22, evolvesAt: 999, evolvesTo: 'Crobat', moves: ['Wing Attack','Bite','Confuse Ray','Air Cutter'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/42.png' },
    
    'Oddish': { id: 43, type: 'Grass/Poison', level: 5, evolvesAt: 21, evolvesTo: 'Gloom', moves: ['Absorb','Sweet Scent','Acid','Poison Powder'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png' },
    'Gloom': { id: 44, type: 'Grass/Poison', level: 21, evolvesAt: 999, evolvesTo: 'Vileplume', moves: ['Acid','Sleep Powder','Mega Drain','Lucky Chant'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/44.png' },
    'Vileplume': { id: 45, type: 'Grass/Poison', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Petal Dance','Solar Beam','Sleep Powder','Aromatherapy'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/45.png' },
    
    'Paras': { id: 46, type: 'Bug/Grass', level: 6, evolvesAt: 24, evolvesTo: 'Parasect', moves: ['Scratch','Stun Spore','Poison Powder','Leech Life'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/46.png' },
    'Parasect': { id: 47, type: 'Bug/Grass', level: 24, evolvesAt: 999, evolvesTo: '', moves: ['Slash','Spore','Growth','Giga Drain'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/47.png' },
    
    'Venonat': { id: 48, type: 'Bug/Poison', level: 7, evolvesAt: 31, evolvesTo: 'Venomoth', moves: ['Tackle','Disable','Confusion','Poison Powder'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/48.png' },
    'Venomoth': { id: 49, type: 'Bug/Poison', level: 31, evolvesAt: 999, evolvesTo: '', moves: ['Psychic','Poison Powder','Leech Life','Signal Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/49.png' },
    
    'Diglett': { id: 50, type: 'Ground', level: 8, evolvesAt: 26, evolvesTo: 'Dugtrio', moves: ['Scratch','Growl','Astonish','Mud Slap'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/50.png' },
    'Dugtrio': { id: 51, type: 'Ground', level: 26, evolvesAt: 999, evolvesTo: '', moves: ['Earthquake','Sand Attack','Tri Attack','Fissure'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png' },
    
    'Meowth': { id: 52, type: 'Normal', level: 5, evolvesAt: 28, evolvesTo: 'Persian', moves: ['Scratch','Growl','Bite','Pay Day'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png' },
    'Persian': { id: 53, type: 'Normal', level: 28, evolvesAt: 999, evolvesTo: '', moves: ['Slash','Fury Swipes','Screech','Power Gem'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/53.png' },
    
    'Psyduck': { id: 54, type: 'Water', level: 6, evolvesAt: 33, evolvesTo: 'Golduck', moves: ['Scratch','Tail Whip','Water Gun','Confusion'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png' },
    'Golduck': { id: 55, type: 'Water', level: 33, evolvesAt: 999, evolvesTo: '', moves: ['Water Pulse','Confusion','Disable','Zen Headbutt'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/55.png' },
    
    'Mankey': { id: 56, type: 'Fighting', level: 7, evolvesAt: 28, evolvesTo: 'Primeape', moves: ['Scratch','Leer','Low Kick','Karate Chop'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/56.png' },
    'Primeape': { id: 57, type: 'Fighting', level: 28, evolvesAt: 999, evolvesTo: '', moves: ['Cross Chop','Rage','Low Kick','Seismic Toss'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/57.png' },
    
    'Growlithe': { id: 58, type: 'Fire', level: 8, evolvesAt: 999, evolvesTo: 'Arcanine', moves: ['Bite','Roar','Ember','Leer'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/58.png' },
    'Arcanine': { id: 59, type: 'Fire', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Extreme Speed','Flamethrower','Roar','Fire Fang'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png' },
    
    'Poliwag': { id: 60, type: 'Water', level: 6, evolvesAt: 25, evolvesTo: 'Poliwhirl', moves: ['Bubble','Hypnosis','Water Gun','Double Slap'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/60.png' },
    'Poliwhirl': { id: 61, type: 'Water', level: 25, evolvesAt: 999, evolvesTo: 'Poliwrath', moves: ['Water Gun','Hypnosis','Bubble Beam','Body Slam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/61.png' },
    'Poliwrath': { id: 62, type: 'Water/Fighting', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Submission','Hydro Pump','Hypnosis','Dynamic Punch'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/62.png' },
    
    'Abra': { id: 63, type: 'Psychic', level: 8, evolvesAt: 16, evolvesTo: 'Kadabra', moves: ['Teleport','','',''], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/63.png' },
    'Kadabra': { id: 64, type: 'Psychic', level: 16, evolvesAt: 999, evolvesTo: 'Alakazam', moves: ['Confusion','Disable','Psybeam','Recover'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/64.png' },
    'Alakazam': { id: 65, type: 'Psychic', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Psychic','Recover','Future Sight','Calm Mind'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png' },
    
    'Machop': { id: 66, type: 'Fighting', level: 8, evolvesAt: 28, evolvesTo: 'Machoke', moves: ['Low Kick','Leer','Focus Energy','Karate Chop'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png' },
    'Machoke': { id: 67, type: 'Fighting', level: 28, evolvesAt: 999, evolvesTo: 'Machamp', moves: ['Karate Chop','Seismic Toss','Submission','Vital Throw'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png' },
    'Machamp': { id: 68, type: 'Fighting', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Cross Chop','Dynamic Punch','Submission','Focus Blast'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png' },
    
    'Bellsprout': { id: 69, type: 'Grass/Poison', level: 5, evolvesAt: 21, evolvesTo: 'Weepinbell', moves: ['Vine Whip','Growth','Wrap','Poison Powder'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/69.png' },
    'Weepinbell': { id: 70, type: 'Grass/Poison', level: 21, evolvesAt: 999, evolvesTo: 'Victreebel', moves: ['Razor Leaf','Acid','Sleep Powder','Sludge Bomb'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/70.png' },
    'Victreebel': { id: 71, type: 'Grass/Poison', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Leaf Blade','Sludge Bomb','Sleep Powder','Solar Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/71.png' },
    
    'Tentacool': { id: 72, type: 'Water/Poison', level: 7, evolvesAt: 30, evolvesTo: 'Tentacruel', moves: ['Poison Sting','Water Gun','Acid','Wrap'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/72.png' },
    'Tentacruel': { id: 73, type: 'Water/Poison', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Poison Jab','Bubble Beam','Barrier','Hydro Pump'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/73.png' },
    
    'Geodude': { id: 74, type: 'Rock/Ground', level: 8, evolvesAt: 25, evolvesTo: 'Graveler', moves: ['Tackle','Defense Curl','Mud Sport','Rock Throw'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png' },
    'Graveler': { id: 75, type: 'Rock/Ground', level: 25, evolvesAt: 999, evolvesTo: 'Golem', moves: ['Rock Throw','Magnitude','Self-Destruct','Rollout'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png' },
    'Golem': { id: 76, type: 'Rock/Ground', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Earthquake','Rock Slide','Explosion','Heavy Slam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png' },
    
    'Ponyta': { id: 77, type: 'Fire', level: 10, evolvesAt: 40, evolvesTo: 'Rapidash', moves: ['Tackle','Growl','Tail Whip','Ember'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/77.png' },
    'Rapidash': { id: 78, type: 'Fire', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Fire Spin','Stomp','Agility','Flame Wheel'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/78.png' },
    
    'Slowpoke': { id: 79, type: 'Water/Psychic', level: 9, evolvesAt: 37, evolvesTo: 'Slowbro', moves: ['Curse','Yawn','Tackle','Water Gun'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/79.png' },
    'Slowbro': { id: 80, type: 'Water/Psychic', level: 37, evolvesAt: 999, evolvesTo: '', moves: ['Confusion','Disable','Headbutt','Water Pulse'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/80.png' },
    
    'Magnemite': { id: 81, type: 'Electric/Steel', level: 11, evolvesAt: 30, evolvesTo: 'Magneton', moves: ['Tackle','Thunder Shock','Supersonic','Sonic Boom'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/81.png' },
    'Magneton': { id: 82, type: 'Electric/Steel', level: 30, evolvesAt: 999, evolvesTo: 'Magnezone', moves: ['Thunderbolt','Supersonic','Spark','Tri Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/82.png' },
    
    "Farfetch'd": { id: 83, type: 'Normal/Flying', level: 15, evolvesAt: 999, evolvesTo: '', moves: ['Peck','Sand Attack','Leer','Fury Cutter'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/83.png' },
    
    'Doduo': { id: 84, type: 'Normal/Flying', level: 12, evolvesAt: 31, evolvesTo: 'Dodrio', moves: ['Peck','Growl','Quick Attack','Rage'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/84.png' },
    'Dodrio': { id: 85, type: 'Normal/Flying', level: 31, evolvesAt: 999, evolvesTo: '', moves: ['Tri Attack','Drill Peck','Rage','Agility'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/85.png' },
    
    'Seel': { id: 86, type: 'Water', level: 13, evolvesAt: 34, evolvesTo: 'Dewgong', moves: ['Headbutt','Growl','Water Gun','Icy Wind'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/86.png' },
    'Dewgong': { id: 87, type: 'Water/Ice', level: 34, evolvesAt: 999, evolvesTo: '', moves: ['Aurora Beam','Rest','Sheer Cold','Ice Shard'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/87.png' },
    
    'Grimer': { id: 88, type: 'Poison', level: 14, evolvesAt: 38, evolvesTo: 'Muk', moves: ['Pound','Poison Gas','Harden','Mud Slap'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/88.png' },
    'Muk': { id: 89, type: 'Poison', level: 38, evolvesAt: 999, evolvesTo: '', moves: ['Sludge Bomb','Minimize','Harden','Poison Gas'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/89.png' },
    
    'Shellder': { id: 90, type: 'Water', level: 15, evolvesAt: 999, evolvesTo: 'Cloyster', moves: ['Tackle','Withdraw','Supersonic','Icicle Spear'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/90.png' },
    'Cloyster': { id: 91, type: 'Water/Ice', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Ice Beam','Spike Cannon','Aurora Beam','Shell Smash'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/91.png' },
    
    'Gastly': { id: 92, type: 'Ghost/Poison', level: 10, evolvesAt: 25, evolvesTo: 'Haunter', moves: ['Lick','Spite','Mean Look','Curse'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png' },
    'Haunter': { id: 93, type: 'Ghost/Poison', level: 25, evolvesAt: 999, evolvesTo: 'Gengar', moves: ['Shadow Punch','Hypnosis','Dream Eater','Night Shade'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/93.png' },
    'Gengar': { id: 94, type: 'Ghost/Poison', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Shadow Ball','Hypnosis','Dream Eater','Dark Pulse'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png' },
    
    'Onix': { id: 95, type: 'Rock/Ground', level: 18, evolvesAt: 999, evolvesTo: 'Steelix', moves: ['Tackle','Screech','Bind','Rock Throw'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png' },
    
    'Drowzee': { id: 96, type: 'Psychic', level: 12, evolvesAt: 26, evolvesTo: 'Hypno', moves: ['Pound','Hypnosis','Disable','Confusion'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/96.png' },
    'Hypno': { id: 97, type: 'Psychic', level: 26, evolvesAt: 999, evolvesTo: '', moves: ['Psychic','Hypnosis','Headbutt','Future Sight'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/97.png' },
    
    'Krabby': { id: 98, type: 'Water', level: 13, evolvesAt: 28, evolvesTo: 'Kingler', moves: ['Bubble','Leer','Vice Grip','Harden'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/98.png' },
    'Kingler': { id: 99, type: 'Water', level: 28, evolvesAt: 999, evolvesTo: '', moves: ['Crabhammer','Harden','Stomp','Guillotine'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/99.png' },
    
    'Voltorb': { id: 100, type: 'Electric', level: 14, evolvesAt: 30, evolvesTo: 'Electrode', moves: ['Tackle','Screech','Sonic Boom','Spark'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/100.png' },
    'Electrode': { id: 101, type: 'Electric', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Spark','Sonic Boom','Self-Destruct','Light Screen'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png' },
    
    'Exeggcute': { id: 102, type: 'Grass/Psychic', level: 15, evolvesAt: 999, evolvesTo: 'Exeggutor', moves: ['Barrage','Hypnosis','Reflect','Leech Seed'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/102.png' },
    'Exeggutor': { id: 103, type: 'Grass/Psychic', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Confusion','Stomp','Egg Bomb','Solar Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/103.png' },
    
    'Cubone': { id: 104, type: 'Ground', level: 16, evolvesAt: 28, evolvesTo: 'Marowak', moves: ['Growl','Tail Whip','Bone Club','Headbutt'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/104.png' },
    'Marowak': { id: 105, type: 'Ground', level: 28, evolvesAt: 999, evolvesTo: '', moves: ['Bonemerang','Rage','False Swipe','Thrash'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/105.png' },
    
    'Hitmonlee': { id: 106, type: 'Fighting', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Double Kick','Meditate','Rolling Kick','Jump Kick'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/106.png' },
    'Hitmonchan': { id: 107, type: 'Fighting', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Comet Punch','Agility','Thunder Punch','Ice Punch'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/107.png' },
    
    'Lickitung': { id: 108, type: 'Normal', level: 18, evolvesAt: 999, evolvesTo: 'Lickilicky', moves: ['Lick','Supersonic','Defense Curl','Stomp'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/108.png' },
    
    'Koffing': { id: 109, type: 'Poison', level: 17, evolvesAt: 35, evolvesTo: 'Weezing', moves: ['Poison Gas','Tackle','Smog','Sludge'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/109.png' },
    'Weezing': { id: 110, type: 'Poison', level: 35, evolvesAt: 999, evolvesTo: '', moves: ['Sludge','Smog','Tackle','Self-Destruct'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/110.png' },
    
    'Rhyhorn': { id: 111, type: 'Ground/Rock', level: 20, evolvesAt: 42, evolvesTo: 'Rhydon', moves: ['Horn Attack','Tail Whip','Stomp','Fury Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/111.png' },
    'Rhydon': { id: 112, type: 'Ground/Rock', level: 42, evolvesAt: 999, evolvesTo: 'Rhyperior', moves: ['Horn Drill','Tail Whip','Stomp','Fury Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png' },
    
    'Chansey': { id: 113, type: 'Normal', level: 22, evolvesAt: 999, evolvesTo: 'Blissey', moves: ['Pound','Growl','Tail Whip','Soft-Boiled'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png' },
    
    'Tangela': { id: 114, type: 'Grass', level: 21, evolvesAt: 999, evolvesTo: 'Tangrowth', moves: ['Constrict','Sleep Powder','Absorb','Growth'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/114.png' },
    
    'Kangaskhan': { id: 115, type: 'Normal', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Comet Punch','Leer','Bite','Tail Whip'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/115.png' },
    
    'Horsea': { id: 116, type: 'Water', level: 19, evolvesAt: 32, evolvesTo: 'Seadra', moves: ['Bubble','Smokescreen','Leer','Water Gun'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/116.png' },
    'Seadra': { id: 117, type: 'Water', level: 32, evolvesAt: 999, evolvesTo: 'Kingdra', moves: ['Water Gun','Smokescreen','Leer','Twister'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/117.png' },
    
    'Goldeen': { id: 118, type: 'Water', level: 18, evolvesAt: 33, evolvesTo: 'Seaking', moves: ['Peck','Tail Whip','Supersonic','Horn Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/118.png' },
    'Seaking': { id: 119, type: 'Water', level: 33, evolvesAt: 999, evolvesTo: '', moves: ['Waterfall','Peck','Tail Whip','Horn Drill'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/119.png' },
    
    'Staryu': { id: 120, type: 'Water', level: 20, evolvesAt: 999, evolvesTo: 'Starmie', moves: ['Tackle','Harden','Water Gun','Rapid Spin'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/120.png' },
    'Starmie': { id: 121, type: 'Water/Psychic', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Water Gun','Rapid Spin','Recover','Swift'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/121.png' },
    
    'Mr. Mime': { id: 122, type: 'Psychic/Fairy', level: 22, evolvesAt: 999, evolvesTo: '', moves: ['Confusion','Barrier','Light Screen','Reflect'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/122.png' },
    
    'Scyther': { id: 123, type: 'Bug/Flying', level: 25, evolvesAt: 999, evolvesTo: 'Scizor', moves: ['Quick Attack','Leer','Focus Energy','Double Team'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/123.png' },
    
    'Jynx': { id: 124, type: 'Ice/Psychic', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Pound','Lick','Lovely Kiss','Powder Snow'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/124.png' },
    
    'Electabuzz': { id: 125, type: 'Electric', level: 30, evolvesAt: 999, evolvesTo: 'Electivire', moves: ['Quick Attack','Leer','Thunder Shock','Low Kick'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/125.png' },
    
    'Magmar': { id: 126, type: 'Fire', level: 30, evolvesAt: 999, evolvesTo: 'Magmortar', moves: ['Ember','Leer','Smog','Fire Punch'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/126.png' },
    
    'Pinsir': { id: 127, type: 'Bug', level: 26, evolvesAt: 999, evolvesTo: '', moves: ['Vice Grip','Focus Energy','Bind','Seismic Toss'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/127.png' },
    
    'Tauros': { id: 128, type: 'Normal', level: 28, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Tail Whip','Rage','Horn Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/128.png' },
    
    'Magikarp': { id: 129, type: 'Water', level: 5, evolvesAt: 20, evolvesTo: 'Gyarados', moves: ['Splash','Tackle','',''], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png' },
    'Gyarados': { id: 130, type: 'Water/Flying', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Bite','Dragon Rage','Leer','Hydro Pump'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png' },
    
    'Lapras': { id: 131, type: 'Water/Ice', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Water Gun','Growl','Sing','Mist'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png' },
    
    'Ditto': { id: 132, type: 'Normal', level: 15, evolvesAt: 999, evolvesTo: '', moves: ['Transform','','',''], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png' },
    
    'Eevee': { id: 133, type: 'Normal', level: 15, evolvesAt: 999, evolvesTo: 'Vaporeon/Jolteon/Flareon', moves: ['Tackle','Tail Whip','Helping Hand','Sand Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png' },
    'Vaporeon': { id: 134, type: 'Water', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Water Gun','Quick Attack','Water Pulse','Aurora Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/134.png' },
    'Jolteon': { id: 135, type: 'Electric', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Thunder Shock','Quick Attack','Double Kick','Pin Missile'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/135.png' },
    'Flareon': { id: 136, type: 'Fire', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Ember','Quick Attack','Bite','Fire Spin'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png' },
    
    'Porygon': { id: 137, type: 'Normal', level: 22, evolvesAt: 999, evolvesTo: 'Porygon2', moves: ['Tackle','Conversion','Sharpen','Psybeam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/137.png' },
    
    'Omanyte': { id: 138, type: 'Rock/Water', level: 30, evolvesAt: 40, evolvesTo: 'Omastar', moves: ['Constrict','Withdraw','Bite','Water Gun'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/138.png' },
    'Omastar': { id: 139, type: 'Rock/Water', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Water Gun','Bite','Spike Cannon','Hydro Pump'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/139.png' },
    
    'Kabuto': { id: 140, type: 'Rock/Water', level: 30, evolvesAt: 40, evolvesTo: 'Kabutops', moves: ['Scratch','Harden','Absorb','Leer'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/140.png' },
    'Kabutops': { id: 141, type: 'Rock/Water', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Slash','Harden','Absorb','Leer'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/141.png' },
    
    'Aerodactyl': { id: 142, type: 'Rock/Flying', level: 35, evolvesAt: 999, evolvesTo: '', moves: ['Wing Attack','Supersonic','Bite','Scary Face'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/142.png' },
    
    'Snorlax': { id: 143, type: 'Normal', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Headbutt','Amnesia','Rest','Body Slam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png' },
    
    'Articuno': { id: 144, type: 'Ice/Flying', level: 50, evolvesAt: 999, evolvesTo: '', moves: ['Gust','Powder Snow','Mist','Ice Shard'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png' },
    'Zapdos': { id: 145, type: 'Electric/Flying', level: 50, evolvesAt: 999, evolvesTo: '', moves: ['Peck','Thunder Shock','Thunder Wave','Drill Peck'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png' },
    'Moltres': { id: 146, type: 'Fire/Flying', level: 50, evolvesAt: 999, evolvesTo: '', moves: ['Wing Attack','Ember','Fire Spin','Leer'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png' },
    
    'Dratini': { id: 147, type: 'Dragon', level: 25, evolvesAt: 30, evolvesTo: 'Dragonair', moves: ['Wrap','Leer','Thunder Wave','Twister'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png' },
    'Dragonair': { id: 148, type: 'Dragon', level: 30, evolvesAt: 55, evolvesTo: 'Dragonite', moves: ['Wrap','Leer','Thunder Wave','Dragon Rage'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/148.png' },
    'Dragonite': { id: 149, type: 'Dragon/Flying', level: 55, evolvesAt: 999, evolvesTo: '', moves: ['Wing Attack','Thunder Wave','Dragon Rage','Hyper Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png' },
    
    'Mewtwo': { id: 150, type: 'Psychic', level: 70, evolvesAt: 999, evolvesTo: '', moves: ['Confusion','Disable','Swift','Psychic'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png' },
    'Mew': { id: 151, type: 'Psychic', level: 50, evolvesAt: 999, evolvesTo: '', moves: ['Pound','Transform','Mega Punch','Metronome'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png' },

    // ========== JOHTO (152-251) ==========
    'Chikorita': { id: 152, type: 'Grass', level: 5, evolvesAt: 16, evolvesTo: 'Bayleef', moves: ['Tackle','Growl','Razor Leaf','Poison Powder'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/152.png' },
    'Bayleef': { id: 153, type: 'Grass', level: 16, evolvesAt: 32, evolvesTo: 'Meganium', moves: ['Razor Leaf','Poison Powder','Synthesis','Body Slam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/153.png' },
    'Meganium': { id: 154, type: 'Grass', level: 32, evolvesAt: 999, evolvesTo: '', moves: ['Solar Beam','Body Slam','Synthesis','Light Screen'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/154.png' },
    
    'Cyndaquil': { id: 155, type: 'Fire', level: 5, evolvesAt: 14, evolvesTo: 'Quilava', moves: ['Tackle','Leer','Ember','Smokescreen'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/155.png' },
    'Quilava': { id: 156, type: 'Fire', level: 14, evolvesAt: 36, evolvesTo: 'Typhlosion', moves: ['Ember','Quick Attack','Flame Wheel','Swift'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/156.png' },
    'Typhlosion': { id: 157, type: 'Fire', level: 36, evolvesAt: 999, evolvesTo: '', moves: ['Flamethrower','Swift','Quick Attack','Smokescreen'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/157.png' },
    
    'Totodile': { id: 158, type: 'Water', level: 5, evolvesAt: 18, evolvesTo: 'Croconaw', moves: ['Scratch','Leer','Water Gun','Rage'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/158.png' },
    'Croconaw': { id: 159, type: 'Water', level: 18, evolvesAt: 30, evolvesTo: 'Feraligatr', moves: ['Water Gun','Bite','Scary Face','Ice Fang'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/159.png' },
    'Feraligatr': { id: 160, type: 'Water', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Hydro Pump','Ice Fang','Crunch','Scary Face'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/160.png' },
    
    'Sentret': { id: 161, type: 'Normal', level: 3, evolvesAt: 15, evolvesTo: 'Furret', moves: ['Scratch','Defense Curl','Quick Attack','Fury Swipes'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/161.png' },
    'Furret': { id: 162, type: 'Normal', level: 15, evolvesAt: 999, evolvesTo: '', moves: ['Quick Attack','Fury Swipes','Defense Curl','Slam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/162.png' },
    
    'Hoothoot': { id: 163, type: 'Normal/Flying', level: 4, evolvesAt: 20, evolvesTo: 'Noctowl', moves: ['Tackle','Growl','Foresight','Peck'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/163.png' },
    'Noctowl': { id: 164, type: 'Normal/Flying', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Peck','Hypnosis','Reflect','Dream Eater'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/164.png' },
    
    'Ledyba': { id: 165, type: 'Bug/Flying', level: 5, evolvesAt: 18, evolvesTo: 'Ledian', moves: ['Tackle','Supersonic','Comet Punch','Light Screen'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/165.png' },
    'Ledian': { id: 166, type: 'Bug/Flying', level: 18, evolvesAt: 999, evolvesTo: '', moves: ['Comet Punch','Light Screen','Reflect','Safeguard'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/166.png' },
    
    'Spinarak': { id: 167, type: 'Bug/Poison', level: 6, evolvesAt: 22, evolvesTo: 'Ariados', moves: ['Poison Sting','String Shot','Scary Face','Constrict'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/167.png' },
    'Ariados': { id: 168, type: 'Bug/Poison', level: 22, evolvesAt: 999, evolvesTo: '', moves: ['Poison Sting','String Shot','Scary Face','Night Shade'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/168.png' },
    
    'Crobat': { id: 169, type: 'Poison/Flying', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Cross Poison','Air Cutter','Screech','Bite'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/169.png' },
    
    'Chinchou': { id: 170, type: 'Water/Electric', level: 12, evolvesAt: 27, evolvesTo: 'Lanturn', moves: ['Bubble','Thunder Wave','Supersonic','Flail'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/170.png' },
    'Lanturn': { id: 171, type: 'Water/Electric', level: 27, evolvesAt: 999, evolvesTo: '', moves: ['Bubble','Thunder Wave','Spark','Confuse Ray'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/171.png' },
    
    'Pichu': { id: 172, type: 'Electric', level: 2, evolvesAt: 999, evolvesTo: 'Pikachu', moves: ['Thunder Shock','Charm','Tail Whip','Sweet Kiss'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/172.png' },
    
    'Cleffa': { id: 173, type: 'Fairy', level: 2, evolvesAt: 999, evolvesTo: 'Clefairy', moves: ['Pound','Charm','Encore','Sweet Kiss'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/173.png' },
    
    'Igglybuff': { id: 174, type: 'Normal/Fairy', level: 2, evolvesAt: 999, evolvesTo: 'Jigglypuff', moves: ['Sing','Charm','Defense Curl','Pound'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/174.png' },
    
    'Togepi': { id: 175, type: 'Fairy', level: 5, evolvesAt: 999, evolvesTo: 'Togetic', moves: ['Growl','Charm','Metronome','Sweet Kiss'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/175.png' },
    'Togetic': { id: 176, type: 'Fairy/Flying', level: 999, evolvesAt: 999, evolvesTo: 'Togekiss', moves: ['Metronome','Charm','Sweet Kiss','Yawn'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/176.png' },
    
    'Natu': { id: 177, type: 'Psychic/Flying', level: 15, evolvesAt: 25, evolvesTo: 'Xatu', moves: ['Peck','Leer','Night Shade','Teleport'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/177.png' },
    'Xatu': { id: 178, type: 'Psychic/Flying', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Peck','Leer','Night Shade','Future Sight'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/178.png' },
    
    'Mareep': { id: 179, type: 'Electric', level: 6, evolvesAt: 15, evolvesTo: 'Flaaffy', moves: ['Tackle','Growl','Thunder Shock','Thunder Wave'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/179.png' },
    'Flaaffy': { id: 180, type: 'Electric', level: 15, evolvesAt: 30, evolvesTo: 'Ampharos', moves: ['Tackle','Growl','Thunder Shock','Cotton Spore'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/180.png' },
    'Ampharos': { id: 181, type: 'Electric', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Thunder Punch','Thunder Shock','Cotton Spore','Light Screen'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/181.png' },
    
    'Bellossom': { id: 182, type: 'Grass', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Magical Leaf','Sweet Scent','Stun Spore','Solar Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/182.png' },
    
    'Marill': { id: 183, type: 'Water/Fairy', level: 8, evolvesAt: 18, evolvesTo: 'Azumarill', moves: ['Tackle','Defense Curl','Tail Whip','Water Gun'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/183.png' },
    'Azumarill': { id: 184, type: 'Water/Fairy', level: 18, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Defense Curl','Rollout','Bubble Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/184.png' },
    
    'Sudowoodo': { id: 185, type: 'Rock', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Rock Throw','Mimic','Flail','Low Kick'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/185.png' },
    
    'Politoed': { id: 186, type: 'Water', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Bubble Beam','Hypnosis','Double Slap','Perish Song'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/186.png' },
    
    'Hoppip': { id: 187, type: 'Grass/Flying', level: 5, evolvesAt: 18, evolvesTo: 'Skiploom', moves: ['Splash','Synthesis','Tail Whip','Tackle'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/187.png' },
    'Skiploom': { id: 188, type: 'Grass/Flying', level: 18, evolvesAt: 27, evolvesTo: 'Jumpluff', moves: ['Splash','Synthesis','Tail Whip','Tackle'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/188.png' },
    'Jumpluff': { id: 189, type: 'Grass/Flying', level: 27, evolvesAt: 999, evolvesTo: '', moves: ['Splash','Synthesis','Cotton Spore','Mega Drain'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/189.png' },
    
    'Aipom': { id: 190, type: 'Normal', level: 12, evolvesAt: 999, evolvesTo: 'Ambipom', moves: ['Scratch','Tail Whip','Sand Attack','Astonish'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/190.png' },
    
    'Sunkern': { id: 191, type: 'Grass', level: 7, evolvesAt: 999, evolvesTo: 'Sunflora', moves: ['Absorb','Growth','Mega Drain','Solar Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/191.png' },
    'Sunflora': { id: 192, type: 'Grass', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Pound','Growth','Razor Leaf','Solar Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/192.png' },
    
    'Yanma': { id: 193, type: 'Bug/Flying', level: 16, evolvesAt: 999, evolvesTo: 'Yanmega', moves: ['Tackle','Foresight','Quick Attack','Double Team'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/193.png' },
    
    'Wooper': { id: 194, type: 'Water/Ground', level: 8, evolvesAt: 20, evolvesTo: 'Quagsire', moves: ['Water Gun','Tail Whip','Slam','Mud Shot'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/194.png' },
    'Quagsire': { id: 195, type: 'Water/Ground', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Water Gun','Tail Whip','Slam','Earthquake'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/195.png' },
    
    'Espeon': { id: 196, type: 'Psychic', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Confusion','Tail Whip','Sand Attack','Psychic'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/196.png' },
    'Umbreon': { id: 197, type: 'Dark', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Tail Whip','Sand Attack','Pursuit'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/197.png' },
    
    'Murkrow': { id: 198, type: 'Dark/Flying', level: 14, evolvesAt: 999, evolvesTo: 'Honchkrow', moves: ['Peck','Astonish','Pursuit','Haze'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/198.png' },
    
    'Slowking': { id: 199, type: 'Water/Psychic', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Curse','Yawn','Tackle','Confusion'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/199.png' },
    
    'Misdreavus': { id: 200, type: 'Ghost', level: 15, evolvesAt: 999, evolvesTo: 'Mismagius', moves: ['Growl','Psywave','Spite','Astonish'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/200.png' },
    
    'Unown': { id: 201, type: 'Psychic', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Hidden Power','','',''], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/201.png' },
    
    'Wobbuffet': { id: 202, type: 'Psychic', level: 18, evolvesAt: 999, evolvesTo: '', moves: ['Counter','Mirror Coat','Safeguard','Destiny Bond'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/202.png' },
    
    'Girafarig': { id: 203, type: 'Normal/Psychic', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Growl','Confusion','Stomp'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/203.png' },
    
    'Pineco': { id: 204, type: 'Bug', level: 12, evolvesAt: 31, evolvesTo: 'Forretress', moves: ['Tackle','Protect','Self-Destruct','Bug Bite'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/204.png' },
    'Forretress': { id: 205, type: 'Bug/Steel', level: 31, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Protect','Self-Destruct','Rapid Spin'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/205.png' },
    
    'Dunsparce': { id: 206, type: 'Normal', level: 16, evolvesAt: 999, evolvesTo: '', moves: ['Rage','Defense Curl','Yawn','Glare'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/206.png' },
    
    'Gligar': { id: 207, type: 'Ground/Flying', level: 18, evolvesAt: 999, evolvesTo: 'Gliscor', moves: ['Poison Sting','Sand Attack','Harden','Knock Off'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/207.png' },
    
    'Steelix': { id: 208, type: 'Steel/Ground', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Thunder Fang','Ice Fang','Fire Fang','Mud Sport'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/208.png' },
    
    'Snubbull': { id: 209, type: 'Fairy', level: 13, evolvesAt: 23, evolvesTo: 'Granbull', moves: ['Tackle','Scary Face','Tail Whip','Charm'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/209.png' },
    'Granbull': { id: 210, type: 'Fairy', level: 23, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Scary Face','Tail Whip','Bite'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/210.png' },
    
    'Qwilfish': { id: 211, type: 'Water/Poison', level: 17, evolvesAt: 999, evolvesTo: '', moves: ['Poison Sting','Tackle','Harden','Minimize'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/211.png' },
    
    'Scizor': { id: 212, type: 'Bug/Steel', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Quick Attack','Leer','Focus Energy','Metal Claw'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/212.png' },
    
    'Shuckle': { id: 213, type: 'Bug/Rock', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Withdraw','Constrict','Bide','Struggle Bug'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/213.png' },
    
    'Heracross': { id: 214, type: 'Bug/Fighting', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Leer','Horn Attack','Endure'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/214.png' },
    
    'Sneasel': { id: 215, type: 'Dark/Ice', level: 21, evolvesAt: 999, evolvesTo: 'Weavile', moves: ['Scratch','Leer','Taunt','Quick Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/215.png' },
    
    'Teddiursa': { id: 216, type: 'Normal', level: 12, evolvesAt: 30, evolvesTo: 'Ursaring', moves: ['Scratch','Leer','Lick','Fury Swipes'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/216.png' },
    'Ursaring': { id: 217, type: 'Normal', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Scratch','Leer','Lick','Fury Swipes'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/217.png' },
    
    'Slugma': { id: 218, type: 'Fire', level: 15, evolvesAt: 38, evolvesTo: 'Magcargo', moves: ['Yawn','Smog','Ember','Rock Throw'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/218.png' },
    'Magcargo': { id: 219, type: 'Fire/Rock', level: 38, evolvesAt: 999, evolvesTo: '', moves: ['Yawn','Smog','Ember','Rock Slide'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/219.png' },
    
    'Swinub': { id: 220, type: 'Ice/Ground', level: 10, evolvesAt: 33, evolvesTo: 'Piloswine', moves: ['Tackle','Odor Sleuth','Mud Sport','Powder Snow'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/220.png' },
    'Piloswine': { id: 221, type: 'Ice/Ground', level: 33, evolvesAt: 999, evolvesTo: 'Mamoswine', moves: ['Horn Attack','Powder Snow','Endure','Take Down'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/221.png' },
    
    'Corsola': { id: 222, type: 'Water/Rock', level: 18, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Harden','Bubble','Recover'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/222.png' },
    
    'Remoraid': { id: 223, type: 'Water', level: 11, evolvesAt: 25, evolvesTo: 'Octillery', moves: ['Water Gun','Lock-On','Psybeam','Aurora Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/223.png' },
    'Octillery': { id: 224, type: 'Water', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Water Gun','Constrict','Psybeam','Aurora Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/224.png' },
    
    'Delibird': { id: 225, type: 'Ice/Flying', level: 22, evolvesAt: 999, evolvesTo: '', moves: ['Present','','',''], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/225.png' },
    
    'Mantine': { id: 226, type: 'Water/Flying', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Bubble','Supersonic','Bubble Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/226.png' },
    
    'Skarmory': { id: 227, type: 'Steel/Flying', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Leer','Peck','Sand Attack','Swift'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/227.png' },
    
    'Houndour': { id: 228, type: 'Dark/Fire', level: 16, evolvesAt: 24, evolvesTo: 'Houndoom', moves: ['Leer','Ember','Howl','Smog'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/228.png' },
    'Houndoom': { id: 229, type: 'Dark/Fire', level: 24, evolvesAt: 999, evolvesTo: '', moves: ['Leer','Ember','Howl','Roar'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/229.png' },
    
    'Kingdra': { id: 230, type: 'Water/Dragon', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Bubble','SmokeScreen','Leer','Water Gun'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/230.png' },
    
    'Phanpy': { id: 231, type: 'Ground', level: 13, evolvesAt: 25, evolvesTo: 'Donphan', moves: ['Tackle','Growl','Defense Curl','Flail'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/231.png' },
    'Donphan': { id: 232, type: 'Ground', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Horn Attack','Growl','Defense Curl','Rollout'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/232.png' },
    
    'Porygon2': { id: 233, type: 'Normal', level: 999, evolvesAt: 999, evolvesTo: 'Porygon-Z', moves: ['Tackle','Conversion','Sharpen','Psybeam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/233.png' },
    
    'Stantler': { id: 234, type: 'Normal', level: 21, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Leer','Hypnosis','Stomp'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/234.png' },
    
    'Smeargle': { id: 235, type: 'Normal', level: 23, evolvesAt: 999, evolvesTo: '', moves: ['Sketch','','',''], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/235.png' },
    
    'Tyrogue': { id: 236, type: 'Fighting', level: 10, evolvesAt: 20, evolvesTo: 'Hitmonlee/Hitmonchan/Hitmontop', moves: ['Tackle','Focus Energy','Fake Out','Helping Hand'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/236.png' },
    'Hitmontop': { id: 237, type: 'Fighting', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Rolling Kick','Focus Energy','Pursuit','Quick Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/237.png' },
    
    'Smoochum': { id: 238, type: 'Ice/Psychic', level: 10, evolvesAt: 30, evolvesTo: 'Jynx', moves: ['Pound','Lick','Sweet Kiss','Powder Snow'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/238.png' },
    
    'Elekid': { id: 239, type: 'Electric', level: 10, evolvesAt: 30, evolvesTo: 'Electabuzz', moves: ['Quick Attack','Leer','Thunder Shock','Low Kick'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/239.png' },
    
    'Magby': { id: 240, type: 'Fire', level: 10, evolvesAt: 30, evolvesTo: 'Magmar', moves: ['Ember','Leer','Smog','Fire Punch'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/240.png' },
    
    'Miltank': { id: 241, type: 'Normal', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Growl','Defense Curl','Stomp'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/241.png' },
    
    'Blissey': { id: 242, type: 'Normal', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Pound','Growl','Tail Whip','Soft-Boiled'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/242.png' },
    
    'Raikou': { id: 243, type: 'Electric', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Quick Attack','Spark','Reflect','Crunch'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/243.png' },
    'Entei': { id: 244, type: 'Fire', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Ember','Roar','Fire Spin','Stomp'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/244.png' },
    'Suicune': { id: 245, type: 'Water', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Bubble Beam','Rain Dance','Gust','Aurora Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/245.png' },
    
    'Larvitar': { id: 246, type: 'Rock/Ground', level: 25, evolvesAt: 30, evolvesTo: 'Pupitar', moves: ['Bite','Leer','Sandstorm','Screech'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/246.png' },
    'Pupitar': { id: 247, type: 'Rock/Ground', level: 30, evolvesAt: 55, evolvesTo: 'Tyranitar', moves: ['Bite','Leer','Sandstorm','Screech'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/247.png' },
    'Tyranitar': { id: 248, type: 'Rock/Dark', level: 55, evolvesAt: 999, evolvesTo: '', moves: ['Thrash','Screech','Rock Slide','Dark Pulse'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png' },
    
    'Lugia': { id: 249, type: 'Psychic/Flying', level: 45, evolvesAt: 999, evolvesTo: '', moves: ['Gust','Dragon Rush','Extrasensory','Rain Dance'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png' },
    'Ho-Oh': { id: 250, type: 'Fire/Flying', level: 45, evolvesAt: 999, evolvesTo: '', moves: ['Gust','Brave Bird','Extrasensory','Sunny Day'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png' },
    
    'Celebi': { id: 251, type: 'Psychic/Grass', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Confusion','Heal Bell','Recover','Future Sight'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/251.png' },

    // ========== HOENN (252-386) ==========
    'Treecko': { id: 252, type: 'Grass', level: 5, evolvesAt: 16, evolvesTo: 'Grovyle', moves: ['Pound','Leer','Absorb','Quick Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/252.png' },
    'Grovyle': { id: 253, type: 'Grass', level: 16, evolvesAt: 36, evolvesTo: 'Sceptile', moves: ['Pound','Quick Attack','Leaf Blade','Agility'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/253.png' },
    'Sceptile': { id: 254, type: 'Grass', level: 36, evolvesAt: 999, evolvesTo: '', moves: ['Leaf Blade','Quick Attack','Agility','Energy Ball'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/254.png' },
    
    'Torchic': { id: 255, type: 'Fire', level: 5, evolvesAt: 16, evolvesTo: 'Combusken', moves: ['Scratch','Growl','Ember','Sand Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/255.png' },
    'Combusken': { id: 256, type: 'Fire/Fighting', level: 16, evolvesAt: 36, evolvesTo: 'Blaziken', moves: ['Ember','Double Kick','Peck','Bulk Up'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/256.png' },
    'Blaziken': { id: 257, type: 'Fire/Fighting', level: 36, evolvesAt: 999, evolvesTo: '', moves: ['Blaze Kick','Double Kick','Peck','Bulk Up'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/257.png' },
    
    'Mudkip': { id: 258, type: 'Water', level: 5, evolvesAt: 16, evolvesTo: 'Marshtomp', moves: ['Tackle','Growl','Water Gun','Mud Slap'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/258.png' },
    'Marshtomp': { id: 259, type: 'Water/Ground', level: 16, evolvesAt: 36, evolvesTo: 'Swampert', moves: ['Water Gun','Mud Shot','Rock Throw','Muddy Water'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/259.png' },
    'Swampert': { id: 260, type: 'Water/Ground', level: 36, evolvesAt: 999, evolvesTo: '', moves: ['Muddy Water','Earthquake','Rock Throw','Protect'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/260.png' },
    
    'Poochyena': { id: 261, type: 'Dark', level: 3, evolvesAt: 18, evolvesTo: 'Mightyena', moves: ['Tackle','Howl','Sand Attack','Bite'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/261.png' },
    'Mightyena': { id: 262, type: 'Dark', level: 18, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Howl','Sand Attack','Bite'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/262.png' },
    
    'Zigzagoon': { id: 263, type: 'Normal', level: 3, evolvesAt: 20, evolvesTo: 'Linoone', moves: ['Tackle','Growl','Tail Whip','Headbutt'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/263.png' },
    'Linoone': { id: 264, type: 'Normal', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Growl','Tail Whip','Slash'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/264.png' },
    
    'Wurmple': { id: 265, type: 'Bug', level: 4, evolvesAt: 7, evolvesTo: 'Silcoon/Cascoon', moves: ['Tackle','String Shot','Poison Sting','Bug Bite'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/265.png' },
    'Silcoon': { id: 266, type: 'Bug', level: 7, evolvesAt: 10, evolvesTo: 'Beautifly', moves: ['Harden','','',''], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/266.png' },
    'Beautifly': { id: 267, type: 'Bug/Flying', level: 10, evolvesAt: 999, evolvesTo: '', moves: ['Absorb','Gust','Stun Spore','Morning Sun'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/267.png' },
    'Cascoon': { id: 268, type: 'Bug', level: 7, evolvesAt: 10, evolvesTo: 'Dustox', moves: ['Harden','','',''], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/268.png' },
    'Dustox': { id: 269, type: 'Bug/Poison', level: 10, evolvesAt: 999, evolvesTo: '', moves: ['Confusion','Gust','Protect','Moonlight'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/269.png' },
    
    'Lotad': { id: 270, type: 'Water/Grass', level: 6, evolvesAt: 14, evolvesTo: 'Lombre', moves: ['Astonish','Growl','Absorb','Nature Power'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/270.png' },
    'Lombre': { id: 271, type: 'Water/Grass', level: 14, evolvesAt: 999, evolvesTo: 'Ludicolo', moves: ['Astonish','Growl','Absorb','Fake Out'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/271.png' },
    'Ludicolo': { id: 272, type: 'Water/Grass', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Astonish','Growl','Absorb','Nature Power'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/272.png' },
    
    'Seedot': { id: 273, type: 'Grass', level: 6, evolvesAt: 14, evolvesTo: 'Nuzleaf', moves: ['Bide','Harden','Growth','Nature Power'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/273.png' },
    'Nuzleaf': { id: 274, type: 'Grass/Dark', level: 14, evolvesAt: 999, evolvesTo: 'Shiftry', moves: ['Pound','Harden','Growth','Razor Leaf'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/274.png' },
    'Shiftry': { id: 275, type: 'Grass/Dark', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Pound','Harden','Growth','Razor Leaf'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/275.png' },
    
    'Taillow': { id: 276, type: 'Normal/Flying', level: 5, evolvesAt: 22, evolvesTo: 'Swellow', moves: ['Peck','Growl','Focus Energy','Quick Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/276.png' },
    'Swellow': { id: 277, type: 'Normal/Flying', level: 22, evolvesAt: 999, evolvesTo: '', moves: ['Peck','Growl','Focus Energy','Wing Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/277.png' },
    
    'Wingull': { id: 278, type: 'Water/Flying', level: 7, evolvesAt: 25, evolvesTo: 'Pelipper', moves: ['Growl','Water Gun','Supersonic','Wing Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/278.png' },
    'Pelipper': { id: 279, type: 'Water/Flying', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Growl','Water Gun','Supersonic','Protect'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/279.png' },
    
    'Ralts': { id: 280, type: 'Psychic/Fairy', level: 5, evolvesAt: 20, evolvesTo: 'Kirlia', moves: ['Growl','Confusion','Double Team','Teleport'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/280.png' },
    'Kirlia': { id: 281, type: 'Psychic/Fairy', level: 20, evolvesAt: 30, evolvesTo: 'Gardevoir', moves: ['Growl','Confusion','Double Team','Magical Leaf'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/281.png' },
    'Gardevoir': { id: 282, type: 'Psychic/Fairy', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Confusion','Double Team','Magical Leaf','Heal Pulse'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/282.png' },
    
    'Surskit': { id: 283, type: 'Bug/Water', level: 8, evolvesAt: 22, evolvesTo: 'Masquerain', moves: ['Bubble','Quick Attack','Sweet Scent','Water Sport'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/283.png' },
    'Masquerain': { id: 284, type: 'Bug/Flying', level: 22, evolvesAt: 999, evolvesTo: '', moves: ['Bubble','Quick Attack','Sweet Scent','Gust'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/284.png' },
    
    'Shroomish': { id: 285, type: 'Grass', level: 9, evolvesAt: 23, evolvesTo: 'Breloom', moves: ['Absorb','Tackle','Stun Spore','Leech Seed'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/285.png' },
    'Breloom': { id: 286, type: 'Grass/Fighting', level: 23, evolvesAt: 999, evolvesTo: '', moves: ['Absorb','Tackle','Stun Spore','Mach Punch'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/286.png' },
    
    'Slakoth': { id: 287, type: 'Normal', level: 11, evolvesAt: 18, evolvesTo: 'Vigoroth', moves: ['Scratch','Yawn','Encore','Slack Off'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/287.png' },
    'Vigoroth': { id: 288, type: 'Normal', level: 18, evolvesAt: 36, evolvesTo: 'Slaking', moves: ['Scratch','Focus Energy','Endure','Slash'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/288.png' },
    'Slaking': { id: 289, type: 'Normal', level: 36, evolvesAt: 999, evolvesTo: '', moves: ['Scratch','Yawn','Encore','Slack Off'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/289.png' },
    
    'Nincada': { id: 290, type: 'Bug/Ground', level: 10, evolvesAt: 20, evolvesTo: 'Ninjask', moves: ['Scratch','Harden','Leech Life','Sand Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/290.png' },
    'Ninjask': { id: 291, type: 'Bug/Flying', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Scratch','Harden','Leech Life','Double Team'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/291.png' },
    
    'Shedinja': { id: 292, type: 'Bug/Ghost', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Scratch','Harden','Leech Life','Shadow Ball'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/292.png' },
    
    'Whismur': { id: 293, type: 'Normal', level: 8, evolvesAt: 20, evolvesTo: 'Loudred', moves: ['Pound','Uproar','Astonish','Howl'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/293.png' },
    'Loudred': { id: 294, type: 'Normal', level: 20, evolvesAt: 40, evolvesTo: 'Exploud', moves: ['Pound','Uproar','Astonish','Bite'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/294.png' },
    'Exploud': { id: 295, type: 'Normal', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Pound','Uproar','Astonish','Hyper Voice'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/295.png' },
    
    'Makuhita': { id: 296, type: 'Fighting', level: 12, evolvesAt: 24, evolvesTo: 'Hariyama', moves: ['Tackle','Focus Energy','Sand Attack','Arm Thrust'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/296.png' },
    'Hariyama': { id: 297, type: 'Fighting', level: 24, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Focus Energy','Sand Attack','Arm Thrust'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/297.png' },
    
    'Azurill': { id: 298, type: 'Normal/Fairy', level: 3, evolvesAt: 15, evolvesTo: 'Marill', moves: ['Splash','Water Gun','Tail Whip','Bubble Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/298.png' },
    
    'Nosepass': { id: 299, type: 'Rock', level: 15, evolvesAt: 999, evolvesTo: 'Probopass', moves: ['Tackle','Harden','Block','Rock Throw'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/299.png' },
    
    'Skitty': { id: 300, type: 'Normal', level: 10, evolvesAt: 999, evolvesTo: 'Delcatty', moves: ['Growl','Tackle','Tail Whip','Attract'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/300.png' },
    'Delcatty': { id: 301, type: 'Normal', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Growl','Tackle','Tail Whip','Sing'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/301.png' },
    
    'Sableye': { id: 302, type: 'Dark/Ghost', level: 18, evolvesAt: 999, evolvesTo: '', moves: ['Leer','Scratch','Foresight','Night Shade'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/302.png' },
    
    'Mawile': { id: 303, type: 'Steel/Fairy', level: 18, evolvesAt: 999, evolvesTo: '', moves: ['Astonish','Fake Tears','Bite','Sweet Scent'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/303.png' },
    
    'Aron': { id: 304, type: 'Steel/Rock', level: 15, evolvesAt: 32, evolvesTo: 'Lairon', moves: ['Tackle','Harden','Mud-Slap','Headbutt'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/304.png' },
    'Lairon': { id: 305, type: 'Steel/Rock', level: 32, evolvesAt: 42, evolvesTo: 'Aggron', moves: ['Tackle','Harden','Mud-Slap','Iron Tail'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/305.png' },
    'Aggron': { id: 306, type: 'Steel/Rock', level: 42, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Harden','Mud-Slap','Iron Head'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/306.png' },
    
    'Meditite': { id: 307, type: 'Fighting/Psychic', level: 16, evolvesAt: 37, evolvesTo: 'Medicham', moves: ['Bide','Meditate','Confusion','Detect'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/307.png' },
    'Medicham': { id: 308, type: 'Fighting/Psychic', level: 37, evolvesAt: 999, evolvesTo: '', moves: ['Bide','Meditate','Confusion','Hi Jump Kick'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/308.png' },
    
    'Electrike': { id: 309, type: 'Electric', level: 13, evolvesAt: 26, evolvesTo: 'Manectric', moves: ['Tackle','Thunder Wave','Leer','Howl'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/309.png' },
    'Manectric': { id: 310, type: 'Electric', level: 26, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Thunder Wave','Leer','Spark'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/310.png' },
    
    'Plusle': { id: 311, type: 'Electric', level: 17, evolvesAt: 999, evolvesTo: '', moves: ['Growl','Thunder Wave','Quick Attack','Spark'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/311.png' },
    'Minun': { id: 312, type: 'Electric', level: 17, evolvesAt: 999, evolvesTo: '', moves: ['Growl','Thunder Wave','Quick Attack','Spark'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/312.png' },
    
    'Volbeat': { id: 313, type: 'Bug', level: 19, evolvesAt: 999, evolvesTo: '', moves: ['Flash','Tackle','Double Team','Confuse Ray'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/313.png' },
    'Illumise': { id: 314, type: 'Bug', level: 19, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Sweet Scent','Charm','Moonlight'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/314.png' },
    
    'Roselia': { id: 315, type: 'Grass/Poison', level: 18, evolvesAt: 999, evolvesTo: 'Roserade', moves: ['Absorb','Growth','Poison Sting','Magical Leaf'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/315.png' },
    
    'Gulpin': { id: 316, type: 'Poison', level: 14, evolvesAt: 26, evolvesTo: 'Swalot', moves: ['Pound','Yawn','Poison Gas','Sludge'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/316.png' },
    'Swalot': { id: 317, type: 'Poison', level: 26, evolvesAt: 999, evolvesTo: '', moves: ['Pound','Yawn','Poison Gas','Body Slam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/317.png' },
    
    'Carvanha': { id: 318, type: 'Water/Dark', level: 16, evolvesAt: 30, evolvesTo: 'Sharpedo', moves: ['Leer','Bite','Rage','Focus Energy'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/318.png' },
    'Sharpedo': { id: 319, type: 'Water/Dark', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Leer','Bite','Rage','Crunch'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/319.png' },
    
    'Wailmer': { id: 320, type: 'Water', level: 20, evolvesAt: 40, evolvesTo: 'Wailord', moves: ['Splash','Growl','Water Gun','Rollout'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/320.png' },
    'Wailord': { id: 321, type: 'Water', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Splash','Growl','Water Gun','Mist'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/321.png' },
    
    'Numel': { id: 322, type: 'Fire/Ground', level: 17, evolvesAt: 33, evolvesTo: 'Camerupt', moves: ['Growl','Tackle','Ember','Magnitude'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/322.png' },
    'Camerupt': { id: 323, type: 'Fire/Ground', level: 33, evolvesAt: 999, evolvesTo: '', moves: ['Growl','Tackle','Ember','Rock Slide'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/323.png' },
    
    'Torkoal': { id: 324, type: 'Fire', level: 22, evolvesAt: 999, evolvesTo: '', moves: ['Ember','Smog','Withdraw','Curse'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/324.png' },
    
    'Spoink': { id: 325, type: 'Psychic', level: 18, evolvesAt: 32, evolvesTo: 'Grumpig', moves: ['Splash','Psywave','Odor Sleuth','Psych Up'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/325.png' },
    'Grumpig': { id: 326, type: 'Psychic', level: 32, evolvesAt: 999, evolvesTo: '', moves: ['Splash','Psywave','Odor Sleuth','Confuse Ray'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/326.png' },
    
    'Spinda': { id: 327, type: 'Normal', level: 19, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Uproar','Copycat','Psybeam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/327.png' },
    
    'Trapinch': { id: 328, type: 'Ground', level: 20, evolvesAt: 35, evolvesTo: 'Vibrava', moves: ['Bite','Sand Attack','Faint Attack','Sand Tomb'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/328.png' },
    'Vibrava': { id: 329, type: 'Ground/Dragon', level: 35, evolvesAt: 45, evolvesTo: 'Flygon', moves: ['Bite','Sand Attack','Faint Attack','Dragon Breath'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/329.png' },
    'Flygon': { id: 330, type: 'Ground/Dragon', level: 45, evolvesAt: 999, evolvesTo: '', moves: ['Bite','Sand Attack','Faint Attack','Dragon Claw'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/330.png' },
    
    'Cacnea': { id: 331, type: 'Grass', level: 17, evolvesAt: 32, evolvesTo: 'Cacturne', moves: ['Poison Sting','Leer','Absorb','Growth'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/331.png' },
    'Cacturne': { id: 332, type: 'Grass/Dark', level: 32, evolvesAt: 999, evolvesTo: '', moves: ['Poison Sting','Leer','Absorb','Needle Arm'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/332.png' },
    
    'Swablu': { id: 333, type: 'Normal/Flying', level: 20, evolvesAt: 35, evolvesTo: 'Altaria', moves: ['Peck','Growl','Astonish','Sing'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/333.png' },
    'Altaria': { id: 334, type: 'Dragon/Flying', level: 35, evolvesAt: 999, evolvesTo: '', moves: ['Peck','Growl','Astonish','Dragon Breath'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/334.png' },
    
    'Zangoose': { id: 335, type: 'Normal', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Scratch','Leer','Quick Attack','Swords Dance'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/335.png' },
    'Seviper': { id: 336, type: 'Poison', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Wrap','Lick','Bite','Poison Tail'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/336.png' },
    
    'Lunatone': { id: 337, type: 'Rock/Psychic', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Harden','Confusion','Rock Throw'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/337.png' },
    'Solrock': { id: 338, type: 'Rock/Psychic', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Harden','Confusion','Rock Throw'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/338.png' },
    
    'Barboach': { id: 339, type: 'Water/Ground', level: 18, evolvesAt: 30, evolvesTo: 'Whiscash', moves: ['Mud-Slap','Mud Sport','Water Sport','Water Gun'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/339.png' },
    'Whiscash': { id: 340, type: 'Water/Ground', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Mud-Slap','Mud Sport','Water Sport','Earthquake'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/340.png' },
    
    'Corphish': { id: 341, type: 'Water', level: 19, evolvesAt: 30, evolvesTo: 'Crawdaunt', moves: ['Bubble','Harden','Vice Grip','Leer'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/341.png' },
    'Crawdaunt': { id: 342, type: 'Water/Dark', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Bubble','Harden','Vice Grip','Taunt'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/342.png' },
    
    'Baltoy': { id: 343, type: 'Ground/Psychic', level: 21, evolvesAt: 36, evolvesTo: 'Claydol', moves: ['Confusion','Harden','Rapid Spin','Mud-Slap'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/343.png' },
    'Claydol': { id: 344, type: 'Ground/Psychic', level: 36, evolvesAt: 999, evolvesTo: '', moves: ['Confusion','Harden','Rapid Spin','Psybeam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/344.png' },
    
    'Lileep': { id: 345, type: 'Rock/Grass', level: 30, evolvesAt: 40, evolvesTo: 'Cradily', moves: ['Astonish','Constrict','Acid','Ingrain'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/345.png' },
    'Cradily': { id: 346, type: 'Rock/Grass', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Astonish','Constrict','Acid','Gastro Acid'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/346.png' },
    
    'Anorith': { id: 347, type: 'Rock/Bug', level: 30, evolvesAt: 40, evolvesTo: 'Armaldo', moves: ['Scratch','Harden','Mud Sport','Water Gun'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/347.png' },
    'Armaldo': { id: 348, type: 'Rock/Bug', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Scratch','Harden','Mud Sport','Metal Claw'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/348.png' },
    
    'Feebas': { id: 349, type: 'Water', level: 15, evolvesAt: 999, evolvesTo: 'Milotic', moves: ['Splash','Tackle','Flail',''], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/349.png' },
    'Milotic': { id: 350, type: 'Water', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Water Gun','Wrap','Water Sport','Refresh'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/350.png' },
    
    'Castform': { id: 351, type: 'Normal', level: 22, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Water Gun','Ember','Powder Snow'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/351.png' },
    
    'Kecleon': { id: 352, type: 'Normal', level: 24, evolvesAt: 999, evolvesTo: '', moves: ['Thief','Tail Whip','Astonish','Lick'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/352.png' },
    
    'Shuppet': { id: 353, type: 'Ghost', level: 19, evolvesAt: 37, evolvesTo: 'Banette', moves: ['Knock Off','Screech','Night Shade','Spite'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/353.png' },
    'Banette': { id: 354, type: 'Ghost', level: 37, evolvesAt: 999, evolvesTo: '', moves: ['Knock Off','Screech','Night Shade','Shadow Ball'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/354.png' },
    
    'Duskull': { id: 355, type: 'Ghost', level: 21, evolvesAt: 37, evolvesTo: 'Dusclops', moves: ['Leer','Night Shade','Disable','Foresight'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/355.png' },
    'Dusclops': { id: 356, type: 'Ghost', level: 37, evolvesAt: 999, evolvesTo: 'Dusknoir', moves: ['Leer','Night Shade','Disable','Shadow Punch'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/356.png' },
    
    'Tropius': { id: 357, type: 'Grass/Flying', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Gust','Growth','Razor Leaf','Stomp'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/357.png' },
    
    'Chimecho': { id: 358, type: 'Psychic', level: 28, evolvesAt: 999, evolvesTo: '', moves: ['Wrap','Growl','Astonish','Confusion'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/358.png' },
    
    'Absol': { id: 359, type: 'Dark', level: 25, evolvesAt: 999, evolvesTo: '', moves: ['Scratch','Leer','Taunt','Quick Attack'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/359.png' },
    
    'Wynaut': { id: 360, type: 'Psychic', level: 5, evolvesAt: 15, evolvesTo: 'Wobbuffet', moves: ['Splash','Charm','Encore','Counter'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/360.png' },
    
    'Snorunt': { id: 361, type: 'Ice', level: 21, evolvesAt: 42, evolvesTo: 'Glalie', moves: ['Powder Snow','Leer','Double Team','Bite'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/361.png' },
    'Glalie': { id: 362, type: 'Ice', level: 42, evolvesAt: 999, evolvesTo: '', moves: ['Powder Snow','Leer','Double Team','Ice Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/362.png' },
    
    'Spheal': { id: 363, type: 'Ice/Water', level: 22, evolvesAt: 32, evolvesTo: 'Sealeo', moves: ['Defense Curl','Powder Snow','Growl','Water Gun'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/363.png' },
    'Sealeo': { id: 364, type: 'Ice/Water', level: 32, evolvesAt: 44, evolvesTo: 'Walrein', moves: ['Defense Curl','Powder Snow','Growl','Aurora Beam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/364.png' },
    'Walrein': { id: 365, type: 'Ice/Water', level: 44, evolvesAt: 999, evolvesTo: '', moves: ['Defense Curl','Powder Snow','Growl','Body Slam'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/365.png' },
    
    'Clamperl': { id: 366, type: 'Water', level: 23, evolvesAt: 999, evolvesTo: 'Huntail/Gorebyss', moves: ['Clamp','Water Gun','Whirlpool','Iron Defense'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/366.png' },
    'Huntail': { id: 367, type: 'Water', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Bite','Screech','Scary Face','Crunch'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/367.png' },
    'Gorebyss': { id: 368, type: 'Water', level: 999, evolvesAt: 999, evolvesTo: '', moves: ['Confusion','Water Sport','Agility','Water Pulse'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/368.png' },
    
    'Relicanth': { id: 369, type: 'Water/Rock', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Harden','Water Gun','Rock Tomb'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/369.png' },
    
    'Luvdisc': { id: 370, type: 'Water', level: 20, evolvesAt: 999, evolvesTo: '', moves: ['Tackle','Charm','Water Gun','Agility'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/370.png' },
    
    'Bagon': { id: 371, type: 'Dragon', level: 25, evolvesAt: 30, evolvesTo: 'Shelgon', moves: ['Rage','Bite','Leer','Headbutt'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/371.png' },
    'Shelgon': { id: 372, type: 'Dragon', level: 30, evolvesAt: 50, evolvesTo: 'Salamence', moves: ['Rage','Bite','Leer','Protect'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/372.png' },
    'Salamence': { id: 373, type: 'Dragon/Flying', level: 50, evolvesAt: 999, evolvesTo: '', moves: ['Rage','Bite','Leer','Fly'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/373.png' },
    
    'Beldum': { id: 374, type: 'Steel/Psychic', level: 25, evolvesAt: 20, evolvesTo: 'Metang', moves: ['Take Down','','',''], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/374.png' },
    'Metang': { id: 375, type: 'Steel/Psychic', level: 20, evolvesAt: 45, evolvesTo: 'Metagross', moves: ['Take Down','Confusion','Metal Claw','Scary Face'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/375.png' },
    'Metagross': { id: 376, type: 'Steel/Psychic', level: 45, evolvesAt: 999, evolvesTo: '', moves: ['Take Down','Confusion','Metal Claw','Meteor Mash'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/376.png' },
    
    'Regirock': { id: 377, type: 'Rock', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Explosion','Rock Throw','Curse','Superpower'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/377.png' },
    'Regice': { id: 378, type: 'Ice', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Explosion','Icy Wind','Curse','Superpower'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/378.png' },
    'Registeel': { id: 379, type: 'Steel', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Explosion','Metal Claw','Curse','Superpower'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/379.png' },
    
    'Latias': { id: 380, type: 'Dragon/Psychic', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Psywave','Wish','Helping Hand','Safeguard'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/380.png' },
    'Latios': { id: 381, type: 'Dragon/Psychic', level: 40, evolvesAt: 999, evolvesTo: '', moves: ['Psywave','Wish','Helping Hand','Safeguard'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/381.png' },
    
    'Kyogre': { id: 382, type: 'Water', level: 45, evolvesAt: 999, evolvesTo: '', moves: ['Water Pulse','Scary Face','Body Slam','Aqua Tail'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/382.png' },
    'Groudon': { id: 383, type: 'Ground', level: 45, evolvesAt: 999, evolvesTo: '', moves: ['Mud Shot','Scary Face','Lava Plume','Earthquake'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/383.png' },
    'Rayquaza': { id: 384, type: 'Dragon/Flying', level: 50, evolvesAt: 999, evolvesTo: '', moves: ['Twister','Scary Face','Crunch','Fly'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png' },
    
    'Jirachi': { id: 385, type: 'Steel/Psychic', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Confusion','Wish','Rest','Swift'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/385.png' },
    'Deoxys': { id: 386, type: 'Psychic', level: 30, evolvesAt: 999, evolvesTo: '', moves: ['Wrap','Leer','Night Shade','Teleport'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/386.png' }
};

// Shop Items with Beli currency
const shopItems = {
    pokeball: { name: 'Pokéball', price: 200, catchRate: 1.0, type: 'ball' },
    greatball: { name: 'Greatball', price: 600, catchRate: 1.5, type: 'ball' },
    ultraball: { name: 'Ultraball', price: 1200, catchRate: 2.0, type: 'ball' },
    masterball: { name: 'Masterball', price: 5000, catchRate: 10.0, type: 'ball' },
    potion: { name: 'Potion', price: 300, heal: 20, type: 'heal' },
    superpotion: { name: 'Super Potion', price: 700, heal: 50, type: 'heal' },
    hyperpotion: { name: 'Hyper Potion', price: 1200, heal: 100, type: 'heal' },
    maxpotion: { name: 'Max Potion', price: 2500, heal: 999, type: 'heal' },
    revive: { name: 'Revive', price: 1500, type: 'revive' },
    maxrevive: { name: 'Max Revive', price: 4000, type: 'revive' },
    rarecandy: { name: 'Rare Candy', price: 2500, type: 'level' },
    protein: { name: 'Protein', price: 5000, type: 'stat' },
    iron: { name: 'Iron', price: 5000, type: 'stat' },
    calcium: { name: 'Calcium', price: 5000, type: 'stat' },
    carbos: { name: 'Carbos', price: 5000, type: 'stat' },
    hpup: { name: 'HP Up', price: 5000, type: 'stat' }
};

// Type Advantages
const typeAdvantages = {
    'Normal': [],
    'Fire': ['Grass', 'Bug', 'Ice', 'Steel'],
    'Water': ['Fire', 'Ground', 'Rock'],
    'Electric': ['Water', 'Flying'],
    'Grass': ['Water', 'Ground', 'Rock'],
    'Ice': ['Grass', 'Ground', 'Flying', 'Dragon'],
    'Fighting': ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'],
    'Poison': ['Grass', 'Fairy'],
    'Ground': ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'],
    'Flying': ['Grass', 'Fighting', 'Bug'],
    'Psychic': ['Fighting', 'Poison'],
    'Bug': ['Grass', 'Psychic', 'Dark'],
    'Rock': ['Fire', 'Ice', 'Flying', 'Bug'],
    'Ghost': ['Psychic', 'Ghost'],
    'Dragon': ['Dragon'],
    'Dark': ['Psychic', 'Ghost'],
    'Steel': ['Ice', 'Rock', 'Fairy'],
    'Fairy': ['Fighting', 'Dragon', 'Dark']
};

// Wild Pokemon Areas
const wildPokemon = {
    'route1': ['Pidgey', 'Rattata', 'Sentret', 'Zigzagoon', 'Poochyena'],
    'route2': ['Caterpie', 'Weedle', 'Wurmple', 'Nincada', 'Shroomish'],
    'forest': ['Pikachu', 'Oddish', 'Bellsprout', 'Hoothoot', 'Seedot'],
    'cave': ['Zubat', 'Geodude', 'Diglett', 'Aron', 'Nosepass'],
    'water': ['Magikarp', 'Tentacool', 'Wingull', 'Carvanha', 'Spheal'],
    'mountain': ['Machop', 'Makuhita', 'Meditite', 'Slugma', 'Numel'],
    'volcano': ['Growlithe', 'Ponyta', 'Slugma', 'Numel', 'Torkoal'],
    'safari': ['Chansey', 'Kangaskhan', 'Tauros', 'Pinsir', 'Scyther']
};

// Kanto Gym Leaders with proper progression
const kantoGymLeaders = {
    'brock': {
        name: 'Brock',
        type: 'Rock',
        badge: 'Boulder Badge',
        badgeSprite: 'https://archives.bulbagarden.net/media/upload/9/9b/Boulder_Badge.png',
        requiredBadges: [],
        team: [
            { name: 'Geodude', level: 12 },
            { name: 'Onix', level: 14 }
        ],
        reward: 1000
    },
    'misty': {
        name: 'Misty',
        type: 'Water',
        badge: 'Cascade Badge',
        badgeSprite: 'https://archives.bulbagarden.net/media/upload/8/8e/Cascade_Badge.png',
        requiredBadges: ['Boulder Badge'],
        team: [
            { name: 'Staryu', level: 18 },
            { name: 'Starmie', level: 21 }
        ],
        reward: 2000
    },
    'lt.surge': {
        name: 'Lt. Surge',
        type: 'Electric',
        badge: 'Thunder Badge',
        badgeSprite: 'https://archives.bulbagarden.net/media/upload/2/22/Thunder_Badge.png',
        requiredBadges: ['Cascade Badge'],
        team: [
            { name: 'Voltorb', level: 21 },
            { name: 'Pikachu', level: 18 },
            { name: 'Raichu', level: 24 }
        ],
        reward: 3000
    },
    'erika': {
        name: 'Erika',
        type: 'Grass',
        badge: 'Rainbow Badge',
        badgeSprite: 'https://archives.bulbagarden.net/media/upload/5/53/Rainbow_Badge.png',
        requiredBadges: ['Thunder Badge'],
        team: [
            { name: 'Victreebel', level: 29 },
            { name: 'Tangela', level: 24 },
            { name: 'Vileplume', level: 29 }
        ],
        reward: 4000
    },
    'koga': {
        name: 'Koga',
        type: 'Poison',
        badge: 'Soul Badge',
        badgeSprite: 'https://archives.bulbagarden.net/media/upload/6/6a/Soul_Badge.png',
        requiredBadges: ['Rainbow Badge'],
        team: [
            { name: 'Koffing', level: 37 },
            { name: 'Muk', level: 39 },
            { name: 'Koffing', level: 37 },
            { name: 'Weezing', level: 43 }
        ],
        reward: 5000
    },
    'sabrina': {
        name: 'Sabrina',
        type: 'Psychic',
        badge: 'Marsh Badge',
        badgeSprite: 'https://archives.bulbagarden.net/media/upload/6/61/Marsh_Badge.png',
        requiredBadges: ['Soul Badge'],
        team: [
            { name: 'Kadabra', level: 38 },
            { name: 'Mr. Mime', level: 37 },
            { name: 'Venomoth', level: 38 },
            { name: 'Alakazam', level: 43 }
        ],
        reward: 6000
    },
    'blaine': {
        name: 'Blaine',
        type: 'Fire',
        badge: 'Volcano Badge',
        badgeSprite: 'https://archives.bulbagarden.net/media/upload/7/7b/Volcano_Badge.png',
        requiredBadges: ['Marsh Badge'],
        team: [
            { name: 'Growlithe', level: 42 },
            { name: 'Ponyta', level: 40 },
            { name: 'Rapidash', level: 42 },
            { name: 'Arcanine', level: 47 }
        ],
        reward: 7000
    },
    'giovanni': {
        name: 'Giovanni',
        type: 'Ground',
        badge: 'Earth Badge',
        badgeSprite: 'https://archives.bulbagarden.net/media/upload/9/9c/Earth_Badge.png',
        requiredBadges: ['Volcano Badge'],
        team: [
            { name: 'Rhyhorn', level: 45 },
            { name: 'Dugtrio', level: 42 },
            { name: 'Nidoqueen', level: 44 },
            { name: 'Nidoking', level: 45 },
            { name: 'Rhydon', level: 50 }
        ],
        reward: 8000
    }
};

// Initialize gym leaders data
function initializeGymLeaders() {
    if (gymLeaders.size === 0) {
        Object.keys(kantoGymLeaders).forEach(gym => {
            gymLeaders.set(gym, { ...kantoGymLeaders[gym], defeatedBy: new Set() });
        });
    }
}

// Utility Functions
function getPokemonSprite(name) {
    const pokemon = pokemonData[name];
    return pokemon ? pokemon.sprite : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
}

function getPokemonId(name) {
    const pokemon = pokemonData[name];
    return pokemon ? pokemon.id : 0;
}

function getPokemonType(name) {
    const pokemon = pokemonData[name];
    return pokemon ? pokemon.type : 'Normal';
}

function calculateMaxHP(level) {
    return Math.floor(level * 10 + 50);
}

function getNickname(userId, pokemonName) {
    const userNicknames = nicknames.get(userId) || {};
    return userNicknames[pokemonName] || pokemonName;
}

function setNickname(userId, pokemonName, nickname) {
    if (!nicknames.has(userId)) {
        nicknames.set(userId, {});
    }
    const userNicknames = nicknames.get(userId);
    userNicknames[pokemonName] = nickname;
}

function hasBadge(player, badgeName) {
    return player.badges.includes(badgeName);
}

function canChallengeGym(player, gymLeader) {
    if (gymLeader.requiredBadges.length === 0) return true;
    return gymLeader.requiredBadges.every(badge => hasBadge(player, badge));
}

// Cooldown system to prevent spam
function setCooldown(userId, command, seconds) {
    const key = `${userId}-${command}`;
    cooldowns.set(key, Date.now() + seconds * 1000);
    setTimeout(() => cooldowns.delete(key), seconds * 1000);
}

function isOnCooldown(userId, command) {
    const key = `${userId}-${command}`;
    return cooldowns.has(key);
}

function getCooldown(userId, command) {
    const key = `${userId}-${command}`;
    if (cooldowns.has(key)) {
        return Math.ceil((cooldowns.get(key) - Date.now()) / 1000);
    }
    return 0;
}

// Battle System - FIXED AND WORKING
class BattleSystem {
    static calculateDamage(attacker, defender, moveIndex) {
        const move = attacker.moves[moveIndex];
        if (!move || move === '') return 0;
        
        let damage = (attacker.level * 2) + Math.floor(Math.random() * 11) + 5;
        
        // Type effectiveness
        const attackerTypes = attacker.type.split('/');
        const defenderTypes = defender.type.split('/');
        let effectiveness = 1;
        
        attackerTypes.forEach(attackerType => {
            defenderTypes.forEach(defenderType => {
                if (typeAdvantages[attackerType] && typeAdvantages[attackerType].includes(defenderType)) {
                    effectiveness *= 2;
                }
            });
        });
        
        damage *= effectiveness;
        
        // STAB (Same Type Attack Bonus)
        if (attackerTypes.some(type => move.toLowerCase().includes(type.toLowerCase()))) {
            damage *= 1.5;
        }
        
        // Critical hit (10% chance)
        if (Math.random() < 0.1) {
            damage *= 2;
        }
        
        return Math.max(1, Math.floor(damage));
    }
    
    static canCatchPokemon(pokemon, ballType = 'pokeball') {
        const ball = shopItems[ballType];
        if (!ball) return false;
        
        const catchRate = (1 - (pokemon.hp / pokemon.maxHp)) * ball.catchRate;
        return Math.random() < catchRate;
    }
    
    static calculateXP(winnerLevel, loserLevel) {
        return Math.max(10, Math.floor(loserLevel * 5 + (winnerLevel * 0.1)));
    }
}

// Command Handlers
async function handleStart(message) {
    if (players.has(message.author.id)) {
        return message.reply('You have already started your Pokémon journey!');
    }
    
    const embed = new EmbedBuilder()
        .setTitle('🌟 WELCOME TO THE POKÉMON WORLD! 🌟')
        .setDescription('**Choose your starter Pokémon!**\nUse `.choose [number]` to begin your adventure!\n\n**Available Starters:**')
        .setColor(0xFF0000)
        .setThumbnail('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png')
        .addFields(
            { 
                name: '🌱 GRASS STARTERS', 
                value: '**1.** Bulbasaur `#001`\n**4.** Chikorita `#152`\n**7.** Treecko `#252`', 
                inline: true 
            },
            { 
                name: '🔥 FIRE STARTERS', 
                value: '**2.** Charmander `#004`\n**5.** Cyndaquil `#155`\n**8.** Torchic `#255`', 
                inline: true 
            },
            { 
                name: '💧 WATER STARTERS', 
                value: '**3.** Squirtle `#007`\n**6.** Totodile `#158`\n**9.** Mudkip `#258`', 
                inline: true 
            },
            { 
                name: '⚡ SPECIAL STARTER', 
                value: '**10.** Pikachu `#025`', 
                inline: false 
            }
        )
        .setFooter({ text: 'Type .choose [number] to select your partner!' });
    
    await message.reply({ embeds: [embed] });
}

async function handleChoose(message, args) {
    if (players.has(message.author.id)) {
        return message.reply('You have already chosen your starter!');
    }
    
    if (!args[0]) {
        return message.reply('Please choose a starter number between 1-10! Use `.start` to see the options.');
    }
    
    const choice = parseInt(args[0]);
    const starters = [
        'Bulbasaur', 'Charmander', 'Squirtle', 'Chikorita', 'Cyndaquil', 
        'Totodile', 'Treecko', 'Torchic', 'Mudkip', 'Pikachu'
    ];
    
    if (choice < 1 || choice > 10) {
        return message.reply('Please choose a number between 1-10!');
    }
    
    const selectedPokemon = starters[choice - 1];
    const pokemon = pokemonData[selectedPokemon];
    
    const playerData = {
        team: [{
            ...pokemon,
            name: selectedPokemon,
            hp: calculateMaxHP(pokemon.level),
            maxHp: calculateMaxHP(pokemon.level),
            xp: 0
        }],
        money: 1000,
        inventory: { pokeball: 5, potion: 3 },
        pokedex: { [selectedPokemon]: { caught: true, seen: true, count: 1 } },
        badges: [],
        gymBattles: {},
        stats: {
            battles: 0,
            wins: 0,
            catches: 0,
            explored: 0
        }
    };
    
    players.set(message.author.id, playerData);
    
    const embed = new EmbedBuilder()
        .setTitle(`🎉 YOU CHOSE ${selectedPokemon.toUpperCase()}!`)
        .setDescription(`Your Pokémon journey begins! ${selectedPokemon} is now your partner!`)
        .setColor(0x00FF00)
        .setThumbnail(pokemon.sprite)
        .addFields(
            { name: 'Type', value: pokemon.type, inline: true },
            { name: 'Level', value: pokemon.level.toString(), inline: true },
            { name: 'Moves', value: pokemon.moves.filter(m => m).join(', ') }
        )
        .setFooter({ text: 'Use .explore to find wild Pokémon!' });
    
    await message.reply({ embeds: [embed] });
}

async function handleProfile(message) {
    const player = players.get(message.author.id);
    if (!player) return message.reply('Start your journey with `.start`!');
    
    const activePokemon = player.team[0];
    const embed = new EmbedBuilder()
        .setTitle(`${message.author.username}'s Trainer Profile`)
        .setColor(0x3498DB)
        .setThumbnail(message.author.displayAvatarURL())
        .addFields(
            { name: '💰 Beli', value: `${player.money}`, inline: true },
            { name: '🏆 Badges', value: `${player.badges.length}/8`, inline: true },
            { name: '📊 Pokédex', value: `${Object.values(player.pokedex).filter(p => p.caught).length}/386`, inline: true },
            { name: '🌟 Active Pokémon', value: `${getNickname(message.author.id, activePokemon.name)} (Lv.${activePokemon.level})`, inline: true },
            { name: '❤️ HP', value: `${activePokemon.hp}/${activePokemon.maxHp}`, inline: true },
            { name: '⚡ XP', value: `${activePokemon.xp}/${activePokemon.level * 100}`, inline: true }
        );
    
    if (player.badges.length > 0) {
        embed.addFields({ name: '🎖️ Badges Collected', value: player.badges.join(', ') });
    }
    
    await message.reply({ embeds: [embed] });
}

async function handleTeam(message) {
    const player = players.get(message.author.id);
    if (!player) return message.reply('Start your journey with `.start`!');
    
    let teamDescription = '';
    player.team.forEach((poke, index) => {
        const nickname = getNickname(message.author.id, poke.name);
        teamDescription += `**${index + 1}.** ${nickname} (${poke.name}) - Lv.${poke.level}\n`;
        teamDescription += `❤️ ${poke.hp}/${poke.maxHp} | ⚡ ${poke.xp}/${poke.level * 100} XP\n`;
        teamDescription += `🔄 ${poke.type} | 🎯 ${poke.moves.filter(m => m).join(', ')}\n\n`;
    });
    
    // Add empty slots
    for (let i = player.team.length; i < 6; i++) {
        teamDescription += `**${i + 1}.** 📭 EMPTY SLOT\n\n`;
    }
    
    const embed = new EmbedBuilder()
        .setTitle(`${message.author.username}'s Pokémon Team`)
        .setDescription(teamDescription)
        .setColor(0x9B59B6)
        .setFooter({ text: 'Use .switch [position] to change active Pokémon' });
    
    await message.reply({ embeds: [embed] });
}

async function handleExplore(message, args) {
    if (currentBattles.has(message.author.id)) {
        return message.reply('You are already in a battle! Finish it first.');
    }
    
    const player = players.get(message.author.id);
    if (!player) return message.reply('Start your journey with `.start`!');
    
    const area = args[0]?.toLowerCase() || 'route1';
    const availableAreas = Object.keys(wildPokemon);
    
    if (!availableAreas.includes(area)) {
        const areasList = availableAreas.map(a => `**${a}**`).join(', ');
        return message.reply(`Available areas: ${areasList}\nUsage: \`.explore [area]\``);
    }
    
    const availablePokemon = wildPokemon[area];
    const wildName = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
    const wildLevel = Math.floor(Math.random() * 10) + 5;
    const wildHp = calculateMaxHP(wildLevel);
    
    const battleData = {
        playerPokemon: player.team[0],
        wildPokemon: { 
            name: wildName, 
            level: wildLevel, 
            hp: wildHp, 
            maxHp: wildHp, 
            type: getPokemonType(wildName),
            moves: pokemonData[wildName].moves
        },
        area: area,
        playerTeam: player.team
    };
    
    currentBattles.set(message.author.id, battleData);
    player.stats.explored++;

    const embed = new EmbedBuilder()
        .setTitle(`🌿 Exploring ${area.toUpperCase()}!`)
        .setDescription(`A wild **${wildName}** appeared!`)
        .setColor(0xFFA500)
        .setThumbnail(getPokemonSprite(wildName))
        .addFields(
            { name: 'Level', value: wildLevel.toString(), inline: true },
            { name: 'HP', value: `${wildHp}/${wildHp}`, inline: true },
            { name: 'Type', value: getPokemonType(wildName), inline: true },
            { name: 'Your Moves', value: `**1.** ${player.team[0].moves[0]}\n**2.** ${player.team[0].moves[1]}\n**3.** ${player.team[0].moves[2]}\n**4.** ${player.team[0].moves[3]}` }
        )
        .setFooter({ text: 'Use 1-4 to attack, "catch" to throw Pokéball, "run" to flee, or "switch [1-6]" to change Pokémon' });
    
    await message.reply({ embeds: [embed] });
}

// BATTLE COMMAND HANDLER
async function handleBattleCommand(message) {
    const battle = currentBattles.get(message.author.id);
    if (!battle) return;

    const content = message.content.toLowerCase();
    const player = players.get(message.author.id);
    
    // Handle switching Pokémon
    if (content.startsWith('switch')) {
        const args = content.split(' ');
        const switchIndex = parseInt(args[1]) - 1;
        
        if (isNaN(switchIndex) || switchIndex < 0 || switchIndex >= player.team.length) {
            return message.reply(`Please choose a valid team position (1-${player.team.length})!`);
        }
        
        if (switchIndex === 0) {
            return message.reply('This Pokémon is already active!');
        }
        
        // Switch Pokémon
        [player.team[0], player.team[switchIndex]] = [player.team[switchIndex], player.team[0]];
        battle.playerPokemon = player.team[0];
        
        const embed = new EmbedBuilder()
            .setTitle('🔄 Pokémon Switched!')
            .setDescription(`You switched to **${getNickname(message.author.id, battle.playerPokemon.name)}**!`)
            .setColor(0x3498DB)
            .setThumbnail(getPokemonSprite(battle.playerPokemon.name));
        
        await message.reply({ embeds: [embed] });
        return;
    }
    
    // Handle moves (1-4)
    if (['1', '2', '3', '4'].includes(content)) {
        const moveIndex = parseInt(content) - 1;
        await handleBattleMove(message, battle, moveIndex);
        return;
    }
    
    // Handle catching
    if (content === 'catch') {
        await handleCatch(message, battle);
        return;
    }
    
    // Handle running
    if (content === 'run') {
        currentBattles.delete(message.author.id);
        await message.reply('🏃 You ran away safely!');
        return;
    }
}

async function handleBattleMove(message, battle, moveIndex) {
    const player = players.get(message.author.id);
    const playerPoke = battle.playerPokemon;
    const wildPoke = battle.wildPokemon;
    
    // Check if move exists
    if (!playerPoke.moves[moveIndex] || playerPoke.moves[moveIndex] === '') {
        return message.reply('This move slot is empty! Choose 1-4 for available moves.');
    }
    
    player.stats.battles++;
    
    let battleLog = `**${getNickname(message.author.id, playerPoke.name)}** used **${playerPoke.moves[moveIndex]}**!\n`;
    
    // Player attacks
    const playerDamage = BattleSystem.calculateDamage(playerPoke, wildPoke, moveIndex);
    wildPoke.hp -= playerDamage;
    battleLog += `Dealt **${playerDamage}** damage to wild ${wildPoke.name}!\n\n`;
    
    // Check if wild Pokémon fainted
    if (wildPoke.hp <= 0) {
        wildPoke.hp = 0;
        const xpGain = BattleSystem.calculateXP(playerPoke.level, wildPoke.level);
        playerPoke.xp += xpGain;
        
        let levelUp = false;
        while (playerPoke.xp >= playerPoke.level * 100) {
            playerPoke.xp -= playerPoke.level * 100;
            playerPoke.level++;
            levelUp = true;
        }
        
        const moneyEarned = wildPoke.level * 10;
        player.money += moneyEarned;
        player.stats.wins++;
        
        battleLog += `🎉 Wild **${wildPoke.name}** fainted!\n`;
        battleLog += `💰 Gained **${moneyEarned} Beli**!\n`;
        battleLog += `⚡ **${getNickname(message.author.id, playerPoke.name)}** gained **${xpGain} XP**!\n`;
        
        if (levelUp) {
            battleLog += `🌟 **${getNickname(message.author.id, playerPoke.name)}** grew to **Level ${playerPoke.level}**!\n`;
            
            // Check for evolution
            if (playerPoke.evolvesAt && playerPoke.level >= playerPoke.evolvesAt && playerPoke.evolvesTo) {
                const newForm = pokemonData[playerPoke.evolvesTo];
                if (newForm) {
                    const oldName = playerPoke.name;
                    player.team[0] = { 
                        ...newForm, 
                        name: playerPoke.evolvesTo,
                        level: playerPoke.level, 
                        xp: playerPoke.xp, 
                        hp: calculateMaxHP(playerPoke.level),
                        maxHp: calculateMaxHP(playerPoke.level)
                    };
                    battleLog += `✨ **${oldName} evolved into ${playerPoke.evolvesTo}!** ✨\n`;
                }
            }
        }
        
        currentBattles.delete(message.author.id);
        
        const embed = new EmbedBuilder()
            .setTitle('🎉 Battle Won!')
            .setDescription(battleLog)
            .setColor(0x00FF00)
            .addFields(
                { name: getNickname(message.author.id, playerPoke.name), value: `❤️ ${playerPoke.hp}/${playerPoke.maxHp}\n⭐ Lv.${playerPoke.level}`, inline: true },
                { name: wildPoke.name, value: `❤️ 0/${wildPoke.maxHp}\n⭐ Lv.${wildPoke.level}`, inline: true }
            );
        
        return await message.reply({ embeds: [embed] });
    }
    
    // Wild Pokémon attacks back
    const wildMoveIndex = Math.floor(Math.random() * 4);
    if (wildPoke.moves[wildMoveIndex] && wildPoke.moves[wildMoveIndex] !== '') {
        const wildDamage = BattleSystem.calculateDamage(wildPoke, playerPoke, wildMoveIndex);
        playerPoke.hp -= wildDamage;
        battleLog += `Wild **${wildPoke.name}** used **${wildPoke.moves[wildMoveIndex]}**!\n`;
        battleLog += `Dealt **${wildDamage}** damage to ${getNickname(message.author.id, playerPoke.name)}!\n\n`;
    }
    
    // Check if player's Pokémon fainted
    if (playerPoke.hp <= 0) {
        playerPoke.hp = 0;
        battleLog += `💀 Your **${getNickname(message.author.id, playerPoke.name)}** fainted!\n`;
        battleLog += `❌ You lost the battle!\n`;
        
        currentBattles.delete(message.author.id);
        
        const embed = new EmbedBuilder()
            .setTitle('💀 Battle Lost!')
            .setDescription(battleLog)
            .setColor(0xFF0000)
            .addFields(
                { name: getNickname(message.author.id, playerPoke.name), value: `❤️ 0/${playerPoke.maxHp}`, inline: true },
                { name: wildPoke.name, value: `❤️ ${wildPoke.hp}/${wildPoke.maxHp}`, inline: true }
            );
        
        return await message.reply({ embeds: [embed] });
    }
    
    // Battle continues
    battleLog += `**Battle continues!**\n`;
    battleLog += `Use **1-4** to attack, **catch** to throw Pokéball, **run** to flee, or **switch [1-6]** to change Pokémon`;
    
    const embed = new EmbedBuilder()
        .setTitle('⚔️ Battle!')
        .setDescription(battleLog)
        .setColor(0xFFA500)
        .addFields(
            { name: getNickname(message.author.id, playerPoke.name), value: `❤️ ${playerPoke.hp}/${playerPoke.maxHp}\n⭐ Lv.${playerPoke.level}`, inline: true },
            { name: wildPoke.name, value: `❤️ ${wildPoke.hp}/${wildPoke.maxHp}\n⭐ Lv.${wildPoke.level}`, inline: true }
        );
    
    currentBattles.set(message.author.id, battle);
    await message.reply({ embeds: [embed] });
}

async function handleCatch(message, battle) {
    const player = players.get(message.author.id);
    const wildPoke = battle.wildPokemon;
    
    // Check if player has Pokéballs
    if (!player.inventory.pokeball || player.inventory.pokeball <= 0) {
        return message.reply('You don\'t have any Pokéballs! Buy some from the shop.');
    }
    
    player.inventory.pokeball--;
    
    const catchSuccess = BattleSystem.canCatchPokemon(wildPoke, 'pokeball');
    
    if (catchSuccess) {
        // Add to team if space, otherwise just to Pokédex
        if (player.team.length < 6) {
            const newPokemon = {
                ...pokemonData[wildPoke.name],
                name: wildPoke.name,
                level: wildPoke.level,
                hp: wildPoke.maxHp,
                maxHp: wildPoke.maxHp,
                xp: 0
            };
            player.team.push(newPokemon);
            
            // Update Pokédex
            if (!player.pokedex[wildPoke.name]) {
                player.pokedex[wildPoke.name] = { caught: true, seen: true, count: 1 };
            } else {
                player.pokedex[wildPoke.name].count++;
                player.pokedex[wildPoke.name].caught = true;
            }
            
            player.stats.catches++;
            currentBattles.delete(message.author.id);
            
            const embed = new EmbedBuilder()
                .setTitle('🎉 Pokémon Caught!')
                .setDescription(`You caught **${wildPoke.name}** and added it to your team!`)
                .setColor(0x00FF00)
                .setThumbnail(getPokemonSprite(wildPoke.name))
                .addFields(
                    { name: 'Level', value: wildPoke.level.toString(), inline: true },
                    { name: 'Type', value: wildPoke.type, inline: true },
                    { name: 'Team Slot', value: `#${player.team.length}`, inline: true }
                );
            
            await message.reply({ embeds: [embed] });
        } else {
            // Team full, just register in Pokédex
            if (!player.pokedex[wildPoke.name]) {
                player.pokedex[wildPoke.name] = { caught: true, seen: true, count: 1 };
            } else {
                player.pokedex[wildPoke.name].count++;
            }
            
            currentBattles.delete(message.author.id);
            await message.reply(`🎉 You caught **${wildPoke.name}** but your team is full! It was registered in your Pokédex.`);
        }
    } else {
        // Wild Pokémon breaks free
        await message.reply(`❌ The wild **${wildPoke.name}** broke free! Try again or weaken it more.`);
        
        // Wild Pokémon attacks after failed catch
        const playerPoke = battle.playerPokemon;
        const wildMoveIndex = Math.floor(Math.random() * 4);
        if (wildPoke.moves[wildMoveIndex] && wildPoke.moves[wildMoveIndex] !== '') {
            const wildDamage = BattleSystem.calculateDamage(wildPoke, playerPoke, wildMoveIndex);
            playerPoke.hp -= wildDamage;
            
            if (playerPoke.hp <= 0) {
                playerPoke.hp = 0;
                currentBattles.delete(message.author.id);
                await message.reply(`💀 Your **${getNickname(message.author.id, playerPoke.name)}** fainted after the failed catch!`);
            } else {
                await message.reply(`Wild **${wildPoke.name}** attacked back with **${wildPoke.moves[wildMoveIndex]}**! Dealt ${wildDamage} damage!`);
            }
        }
    }
}

// Shop System
async function handleShop(message, args) {
    const player = players.get(message.author.id);
    if (!player) return message.reply('Start your journey with `.start`!');

    const action = args[0]?.toLowerCase();
    
    if (!action || action === 'list') {
        let shopList = '';
        Object.entries(shopItems).forEach(([key, item]) => {
            shopList += `**${item.name}** - 💰 ${item.price} Beli\n`;
            if (item.type === 'ball') shopList += `   Catch Rate: ${item.catchRate}x\n`;
            if (item.type === 'heal') shopList += `   Heals: ${item.heal} HP\n`;
            if (item.type === 'revive') shopList += `   Revives fainted Pokémon\n`;
            if (item.type === 'level') shopList += `   Levels up Pokémon\n`;
            if (item.type === 'stat') shopList += `   Increases stats\n`;
            shopList += '\n';
        });

        const embed = new EmbedBuilder()
            .setTitle('🛍️ Pokémon Mart')
            .setDescription(`**Your Beli: 💰 ${player.money}**\n\n${shopList}`)
            .setColor(0x9B59B6)
            .setFooter({ text: 'Use .shop buy [item] or .shop buy [item] [amount]' });

        return await message.reply({ embeds: [embed] });
    }

    if (action === 'buy') {
        const itemName = args[1]?.toLowerCase();
        const amount = parseInt(args[2]) || 1;

        if (!itemName) {
            return message.reply('Please specify an item to buy! Use `.shop list` to see available items.');
        }

        const item = shopItems[itemName];
        if (!item) {
            return message.reply('Item not found! Use `.shop list` to see available items.');
        }

        const totalCost = item.price * amount;
        if (player.money < totalCost) {
            return message.reply(`You need 💰 ${totalCost} Beli to buy ${amount} ${item.name}(s), but you only have 💰 ${player.money}!`);
        }

        // Add to inventory
        if (!player.inventory[itemName]) {
            player.inventory[itemName] = 0;
        }
        player.inventory[itemName] += amount;
        player.money -= totalCost;

        const embed = new EmbedBuilder()
            .setTitle('🛍️ Purchase Successful!')
            .setDescription(`You bought **${amount} ${item.name}(s)** for 💰 ${totalCost} Beli!`)
            .setColor(0x00FF00)
            .addFields(
                { name: 'Remaining Beli', value: `💰 ${player.money}`, inline: true },
                { name: 'Inventory', value: `${player.inventory[itemName]} ${item.name}(s)`, inline: true }
            );

        await message.reply({ embeds: [embed] });
    } else if (action === 'inventory' || action === 'inv') {
        let inventoryList = '';
        let hasItems = false;

        Object.entries(player.inventory).forEach(([itemKey, quantity]) => {
            if (quantity > 0) {
                hasItems = true;
                const item = shopItems[itemKey];
                inventoryList += `**${item.name}**: ${quantity}\n`;
            }
        });

        if (!hasItems) {
            inventoryList = 'Your inventory is empty! Buy some items from the shop.';
        }

        const embed = new EmbedBuilder()
            .setTitle('🎒 Your Inventory')
            .setDescription(inventoryList)
            .setColor(0x3498DB)
            .addFields(
                { name: '💰 Beli', value: `${player.money}`, inline: true }
            );

        await message.reply({ embeds: [embed] });
    }
}

// Item Usage System
async function handleUse(message, args) {
    const player = players.get(message.author.id);
    if (!player) return message.reply('Start your journey with `.start`!');

    const itemName = args[0]?.toLowerCase();
    if (!itemName) {
        return message.reply('Please specify an item to use! Use `.shop inv` to see your items.');
    }

    const item = shopItems[itemName];
    if (!item) {
        return message.reply('Item not found! Use `.shop list` to see available items.');
    }

    if (!player.inventory[itemName] || player.inventory[itemName] <= 0) {
        return message.reply(`You don't have any ${item.name}s!`);
    }

    const targetPokemon = player.team[0]; // Use active Pokémon

    switch (item.type) {
        case 'heal':
            const healAmount = Math.min(item.heal, targetPokemon.maxHp - targetPokemon.hp);
            targetPokemon.hp += healAmount;
            player.inventory[itemName]--;
            
            const embed = new EmbedBuilder()
                .setTitle('💖 Item Used!')
                .setDescription(`Used **${item.name}** on **${getNickname(message.author.id, targetPokemon.name)}**!`)
                .setColor(0x00FF00)
                .addFields(
                    { name: 'Healed', value: `+${healAmount} HP`, inline: true },
                    { name: 'Current HP', value: `${targetPokemon.hp}/${targetPokemon.maxHp}`, inline: true }
                );
            
            await message.reply({ embeds: [embed] });
            break;

        case 'revive':
            if (targetPokemon.hp > 0) {
                return message.reply('Your active Pokémon is not fainted!');
            }
            
            const reviveHp = itemName === 'maxrevive' ? targetPokemon.maxHp : Math.floor(targetPokemon.maxHp / 2);
            targetPokemon.hp = reviveHp;
            player.inventory[itemName]--;
            
            const reviveEmbed = new EmbedBuilder()
                .setTitle('✨ Pokémon Revived!')
                .setDescription(`Used **${item.name}** on **${getNickname(message.author.id, targetPokemon.name)}**!`)
                .setColor(0x00FF00)
                .addFields(
                    { name: 'Revived HP', value: `${targetPokemon.hp}/${targetPokemon.maxHp}`, inline: true }
                );
            
            await message.reply({ embeds: [reviveEmbed] });
            break;

        case 'level':
            if (itemName === 'rarecandy') {
                targetPokemon.level++;
                targetPokemon.xp = 0;
                targetPokemon.maxHp = calculateMaxHP(targetPokemon.level);
                targetPokemon.hp = targetPokemon.maxHp;
                player.inventory[itemName]--;
                
                const levelEmbed = new EmbedBuilder()
                    .setTitle('🍬 Rare Candy Used!')
                    .setDescription(`**${getNickname(message.author.id, targetPokemon.name)}** grew to Level ${targetPokemon.level}!`)
                    .setColor(0xFFD700)
                    .addFields(
                        { name: 'New Level', value: targetPokemon.level.toString(), inline: true },
                        { name: 'HP', value: `${targetPokemon.hp}/${targetPokemon.maxHp}`, inline: true }
                    );
                
                await message.reply({ embeds: [levelEmbed] });
            }
            break;

        default:
            await message.reply('This item cannot be used directly!');
    }
}

// Gym Battle System
async function handleGym(message, args) {
    const player = players.get(message.author.id);
    if (!player) return message.reply('Start your journey with `.start`!');

    initializeGymLeaders();

    const action = args[0]?.toLowerCase();
    
    if (!action || action === 'list') {
        let gymList = '';
        Object.entries(kantoGymLeaders).forEach(([gymKey, gym]) => {
            const hasBadge = player.badges.includes(gym.badge);
            const canChallenge = canChallengeGym(player, gym);
            const status = hasBadge ? '✅' : (canChallenge ? '⚔️' : '🔒');
            
            gymList += `${status} **${gym.name}** - ${gym.badge}\n`;
            gymList += `   Type: ${gym.type} | Reward: 💰 ${gym.reward} Beli\n`;
            if (!canChallenge && !hasBadge) {
                gymList += `   Requires: ${gym.requiredBadges.join(', ')}\n`;
            }
            gymList += '\n';
        });

        const embed = new EmbedBuilder()
            .setTitle('🏟️ Kanto Gym Leaders')
            .setDescription(gymList)
            .setColor(0xE74C3C)
            .setFooter({ text: 'Use .gym challenge [leader] to battle a gym leader!' });

        return await message.reply({ embeds: [embed] });
    }

    if (action === 'challenge') {
        const gymKey = args[1]?.toLowerCase();
        if (!gymKey) {
            return message.reply('Please specify a gym leader to challenge! Use `.gym list` to see available leaders.');
        }

        const gymLeader = gymLeaders.get(gymKey);
        if (!gymLeader) {
            return message.reply('Gym leader not found! Use `.gym list` to see available leaders.');
        }

        if (player.badges.includes(gymLeader.badge)) {
            return message.reply(`You already have the ${gymLeader.badge}!`);
        }

        if (!canChallengeGym(player, gymLeader)) {
            return message.reply(`You need these badges to challenge ${gymLeader.name}: ${gymLeader.requiredBadges.join(', ')}`);
        }

        // Start gym battle
        const gymBattle = {
            type: 'gym',
            leader: gymLeader,
            playerTeam: player.team,
            currentPokemon: 0,
            leaderTeam: gymLeader.team.map(poke => ({
                ...pokemonData[poke.name],
                name: poke.name,
                level: poke.level,
                hp: calculateMaxHP(poke.level),
                maxHp: calculateMaxHP(poke.level)
            }))
        };

        currentBattles.set(message.author.id, gymBattle);

        const embed = new EmbedBuilder()
            .setTitle(`🏟️ GYM BATTLE: ${gymLeader.name.toUpperCase()}!`)
            .setDescription(`**${gymLeader.name}:** "I'm the ${gymLeader.type} type Gym Leader! Let's see what you're made of!"`)
            .setColor(0xE74C3C)
            .setThumbnail(gymLeader.badgeSprite)
            .addFields(
                { name: 'Badge', value: gymLeader.badge, inline: true },
                { name: 'Type', value: gymLeader.type, inline: true },
                { name: 'Reward', value: `💰 ${gymLeader.reward} Beli`, inline: true },
                { name: `${gymLeader.name}'s Team`, value: gymLeader.team.map(p => `${p.name} Lv.${p.level}`).join(', ') }
            )
            .setFooter({ text: 'Use 1-4 to attack or "switch [1-6]" to change Pokémon' });

        await message.reply({ embeds: [embed] });
    }
}

// Handle Gym Battles
async function handleGymBattle(message, battle) {
    const content = message.content.toLowerCase();
    const player = players.get(message.author.id);

    if (['1', '2', '3', '4'].includes(content)) {
        await handleGymBattleMove(message, battle, parseInt(content) - 1);
    } else if (content.startsWith('switch')) {
        const args = content.split(' ');
        const switchIndex = parseInt(args[1]) - 1;
        
        if (isNaN(switchIndex) || switchIndex < 0 || switchIndex >= player.team.length) {
            return message.reply(`Please choose a valid team position (1-${player.team.length})!`);
        }

        [player.team[0], player.team[switchIndex]] = [player.team[switchIndex], player.team[0]];
        battle.playerTeam = player.team;

        await message.reply(`🔄 Switched to **${getNickname(message.author.id, player.team[0].name)}**!`);
    }
}

async function handleGymBattleMove(message, battle, moveIndex) {
    const player = players.get(message.author.id);
    const playerPoke = battle.playerTeam[0];
    const leaderPoke = battle.leaderTeam[battle.currentPokemon];

    if (!playerPoke.moves[moveIndex]) {
        return message.reply('This move slot is empty! Choose 1-4 for available moves.');
    }

    let battleLog = `**${getNickname(message.author.id, playerPoke.name)}** used **${playerPoke.moves[moveIndex]}**!\n`;

    // Player attacks
    const playerDamage = BattleSystem.calculateDamage(playerPoke, leaderPoke, moveIndex);
    leaderPoke.hp -= playerDamage;
    battleLog += `Dealt **${playerDamage}** damage to ${leaderPoke.name}!\n\n`;

    // Check if leader's Pokémon fainted
    if (leaderPoke.hp <= 0) {
        leaderPoke.hp = 0;
        battleLog += `🎉 ${battle.leader.name}'s **${leaderPoke.name}** fainted!\n`;
        battle.currentPokemon++;

        // Check if gym leader defeated
        if (battle.currentPokemon >= battle.leaderTeam.length) {
            // Player wins the gym battle!
            player.badges.push(battle.leader.badge);
            player.money += battle.leader.reward;
            gymLeaders.get(Object.keys(kantoGymLeaders).find(k => kantoGymLeaders[k].badge === battle.leader.badge)).defeatedBy.add(message.author.id);

            battleLog += `\n🎊 **YOU DEFEATED ${battle.leader.name.toUpperCase()}!** 🎊\n`;
            battleLog += `🏆 You earned the **${battle.leader.badge}**!\n`;
            battleLog += `💰 Received **${battle.leader.reward} Beli**!\n`;

            currentBattles.delete(message.author.id);

            const embed = new EmbedBuilder()
                .setTitle('🏆 GYM VICTORY!')
                .setDescription(battleLog)
                .setColor(0xFFD700)
                .setThumbnail(battle.leader.badgeSprite);

            return await message.reply({ embeds: [embed] });
        }

        battleLog += `**${battle.leader.name}** sends out **${battle.leaderTeam[battle.currentPokemon].name}**!\n`;
    } else {
        // Leader's Pokémon attacks back
        const leaderMoveIndex = Math.floor(Math.random() * 4);
        if (battle.leaderTeam[battle.currentPokemon].moves[leaderMoveIndex]) {
            const leaderDamage = BattleSystem.calculateDamage(leaderPoke, playerPoke, leaderMoveIndex);
            playerPoke.hp -= leaderDamage;
            battleLog += `**${leaderPoke.name}** used **${battle.leaderTeam[battle.currentPokemon].moves[leaderMoveIndex]}**!\n`;
            battleLog += `Dealt **${leaderDamage}** damage to ${getNickname(message.author.id, playerPoke.name)}!\n\n`;
        }
    }

    // Check if player's Pokémon fainted
    if (playerPoke.hp <= 0) {
        playerPoke.hp = 0;
        battleLog += `💀 Your **${getNickname(message.author.id, playerPoke.name)}** fainted!\n`;
        battleLog += `❌ You lost the gym battle!\n`;

        currentBattles.delete(message.author.id);

        const embed = new EmbedBuilder()
            .setTitle('💀 Gym Battle Lost')
            .setDescription(battleLog)
            .setColor(0xFF0000);

        return await message.reply({ embeds: [embed] });
    }

    // Battle continues
    const embed = new EmbedBuilder()
        .setTitle(`🏟️ Gym Battle vs ${battle.leader.name}`)
        .setDescription(battleLog)
        .setColor(0xFFA500)
        .addFields(
            { name: getNickname(message.author.id, playerPoke.name), value: `❤️ ${playerPoke.hp}/${playerPoke.maxHp}`, inline: true },
            { name: battle.leaderTeam[battle.currentPokemon].name, value: `❤️ ${battle.leaderTeam[battle.currentPokemon].hp}/${battle.leaderTeam[battle.currentPokemon].maxHp}`, inline: true }
        );

    await message.reply({ embeds: [embed] });
}

// Pokedex System
async function handlePokedex(message, args) {
    const player = players.get(message.author.id);
    if (!player) return message.reply('Start your journey with `.start`!');

    const search = args[0];
    if (!search) {
        const caughtCount = Object.values(player.pokedex).filter(p => p.caught).length;
        const seenCount = Object.values(player.pokedex).filter(p => p.seen).length;
        
        const embed = new EmbedBuilder()
            .setTitle('📊 Pokédex Progress')
            .setDescription(`**Caught:** ${caughtCount}/386\n**Seen:** ${seenCount}/386\n**Completion:** ${((caughtCount/386)*100).toFixed(1)}%`)
            .setColor(0x3498DB)
            .setFooter({ text: 'Use .pokedex [pokemon] to see details about a specific Pokémon' });

        return await message.reply({ embeds: [embed] });
    }

    // Search for specific Pokémon
    const pokemonName = Object.keys(pokemonData).find(name => 
        name.toLowerCase().includes(search.toLowerCase())
    );

    if (!pokemonName) {
        return message.reply('Pokémon not found!');
    }

    const pokemon = pokemonData[pokemonName];
    const dexEntry = player.pokedex[pokemonName] || { caught: false, seen: false, count: 0 };

    const embed = new EmbedBuilder()
        .setTitle(`#${pokemon.id.toString().padStart(3, '0')} ${pokemonName}`)
        .setDescription(dexEntry.caught ? '✅ **Caught**' : (dexEntry.seen ? '👀 **Seen**' : '❌ **Not Seen**'))
        .setColor(dexEntry.caught ? 0x00FF00 : (dexEntry.seen ? 0xFFA500 : 0xFF0000))
        .setThumbnail(pokemon.sprite)
        .addFields(
            { name: 'Type', value: pokemon.type, inline: true },
            { name: 'Caught', value: dexEntry.count.toString(), inline: true },
            { name: 'Evolves To', value: pokemon.evolvesTo || 'None', inline: true },
            { name: 'Evolves At', value: pokemon.evolvesAt ? `Level ${pokemon.evolvesAt}` : 'None', inline: true }
        );

    if (dexEntry.caught) {
        embed.addFields({ name: 'Moves', value: pokemon.moves.filter(m => m).join(', ') });
    }

    await message.reply({ embeds: [embed] });
}

// Nickname System
async function handleNickname(message, args) {
    const player = players.get(message.author.id);
    if (!player) return message.reply('Start your journey with `.start`!');

    const pokemonName = args[0];
    const nickname = args.slice(1).join(' ');

    if (!pokemonName || !nickname) {
        return message.reply('Usage: `.nickname [pokemon] [new nickname]`');
    }

    // Find Pokémon in team
    const pokemon = player.team.find(p => 
        p.name.toLowerCase() === pokemonName.toLowerCase() || 
        getNickname(message.author.id, p.name).toLowerCase() === pokemonName.toLowerCase()
    );

    if (!pokemon) {
        return message.reply('Pokémon not found in your team!');
    }

    if (nickname.length > 20) {
        return message.reply('Nickname must be 20 characters or less!');
    }

    setNickname(message.author.id, pokemon.name, nickname);

    const embed = new EmbedBuilder()
        .setTitle('✨ Nickname Changed!')
        .setDescription(`**${pokemon.name}** is now called **${nickname}**!`)
        .setColor(0x9B59B6)
        .setThumbnail(getPokemonSprite(pokemon.name));

    await message.reply({ embeds: [embed] });
}

// Healing System
async function handleHeal(message) {
    const player = players.get(message.author.id);
    if (!player) return message.reply('Start your journey with `.start`!');

    let healedCount = 0;
    player.team.forEach(poke => {
        if (poke.hp < poke.maxHp) {
            poke.hp = poke.maxHp;
            healedCount++;
        }
    });

    const embed = new EmbedBuilder()
        .setTitle('💖 Pokémon Center')
        .setDescription(healedCount > 0 ? 
            `Your Pokémon have been fully healed! ${healedCount} Pokémon restored.` :
            'Your Pokémon are already at full health!')
        .setColor(0x00FF00);

    await message.reply({ embeds: [embed] });
}

// Leaderboard System
async function handleLeaderboard(message) {
    const allPlayers = Array.from(players.entries()).map(([id, data]) => ({
        id,
        ...data
    }));

    // Sort by various criteria
    const byBadges = [...allPlayers].sort((a, b) => b.badges.length - a.badges.length).slice(0, 10);
    const byLevel = [...allPlayers].sort((a, b) => Math.max(...b.team.map(p => p.level)) - Math.max(...a.team.map(p => p.level))).slice(0, 10);
    const byPokedex = [...allPlayers].sort((a, b) => 
        Object.values(b.pokedex).filter(p => p.caught).length - Object.values(a.pokedex).filter(p => p.caught).length
    ).slice(0, 10);

    let badgesList = '';
    byBadges.forEach((player, index) => {
        const user = await message.client.users.fetch(player.id).catch(() => ({ username: 'Unknown' }));
        badgesList += `**${index + 1}.** ${user.username} - ${player.badges.length} badges\n`;
    });

    let levelList = '';
    byLevel.forEach((player, index) => {
        const user = await message.client.users.fetch(player.id).catch(() => ({ username: 'Unknown' }));
        const highestLevel = Math.max(...player.team.map(p => p.level));
        levelList += `**${index + 1}.** ${user.username} - Lv.${highestLevel}\n`;
    });

    let pokedexList = '';
    byPokedex.forEach((player, index) => {
        const user = await message.client.users.fetch(player.id).catch(() => ({ username: 'Unknown' }));
        const caughtCount = Object.values(player.pokedex).filter(p => p.caught).length;
        pokedexList += `**${index + 1}.** ${user.username} - ${caughtCount} Pokémon\n`;
    });

    const embed = new EmbedBuilder()
        .setTitle('🏆 Leaderboards')
        .setColor(0xFFD700)
        .addFields(
            { name: '🥇 Most Badges', value: badgesList || 'No data', inline: true },
            { name: '💪 Highest Level', value: levelList || 'No data', inline: true },
            { name: '📊 Pokédex Masters', value: pokedexList || 'No data', inline: true }
        );

    await message.reply({ embeds: [embed] });
}

// Admin Commands
async function handleAdmin(message, args) {
    // Check if user has admin permissions
    if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.reply('❌ You need administrator permissions to use this command!');
    }

    const action = args[0]?.toLowerCase();

    switch (action) {
        case 'give':
            const targetId = args[1]?.replace(/[<@!>]/g, '');
            const item = args[2];
            const amount = parseInt(args[3]) || 1;

            if (!targetId || !item) {
                return message.reply('Usage: `.admin give @user [item] [amount]`');
            }

            const targetPlayer = players.get(targetId);
            if (!targetPlayer) {
                return message.reply('User not found or hasn\'t started their journey!');
            }

            if (shopItems[item]) {
                if (!targetPlayer.inventory[item]) targetPlayer.inventory[item] = 0;
                targetPlayer.inventory[item] += amount;
                await message.reply(`✅ Gave ${amount} ${shopItems[item].name}(s) to <@${targetId}>!`);
            } else if (item === 'money') {
                targetPlayer.money += amount;
                await message.reply(`✅ Gave 💰 ${amount} Beli to <@${targetId}>!`);
            } else {
                await message.reply('Item not found!');
            }
            break;

        case 'reset':
            const resetId = args[1]?.replace(/[<@!>]/g, '');
            if (!resetId) {
                return message.reply('Usage: `.admin reset @user`');
            }
            players.delete(resetId);
            await message.reply(`✅ Reset <@${resetId}>'s progress!`);
            break;

        case 'spawn':
            const pokemonName = args[1];
            if (!pokemonName) {
                return message.reply('Usage: `.admin spawn [pokemon]`');
            }

            if (!pokemonData[pokemonName]) {
                return message.reply('Pokémon not found!');
            }

            const wildLevel = parseInt(args[2]) || 50;
            const wildHp = calculateMaxHP(wildLevel);

            const battleData = {
                playerPokemon: players.get(message.author.id)?.team[0],
                wildPokemon: { 
                    name: pokemonName, 
                    level: wildLevel, 
                    hp: wildHp, 
                    maxHp: wildHp, 
                    type: getPokemonType(pokemonName),
                    moves: pokemonData[pokemonName].moves
                },
                area: 'admin',
                playerTeam: players.get(message.author.id)?.team || []
            };

            currentBattles.set(message.author.id, battleData);

            const embed = new EmbedBuilder()
                .setTitle('👑 Admin Spawn')
                .setDescription(`A wild **${pokemonName}** (Lv.${wildLevel}) has appeared!`)
                .setColor(0x9B59B6)
                .setThumbnail(getPokemonSprite(pokemonName));

            await message.reply({ embeds: [embed] });
            break;

        default:
            await message.reply('Available admin commands: `give`, `reset`, `spawn`');
    }
}

// Help Command
async function handleHelp(message) {
    const embed = new EmbedBuilder()
        .setTitle('🎮 Pokémon RPG Bot - Commands')
        .setColor(0x3498DB)
        .addFields(
            { name: '🚀 Getting Started', value: '`.start` - Begin your journey\n`.choose [1-10]` - Pick starter Pokémon' },
            { name: '👤 Player Commands', value: '`.profile` - View your profile\n`.team` - Check your Pokémon team\n`.heal` - Heal all Pokémon' },
            { name: '🌍 Exploration', value: '`.explore [area]` - Find wild Pokémon\n`.areas` - List available areas' },
            { name: '⚔️ Battle', value: 'During battle: `1-4` (attack), `catch`, `run`, `switch [1-6]`' },
            { name: '🏟️ Gym System', value: '`.gym list` - View gym leaders\n`.gym challenge [leader]` - Battle a gym leader' },
            { name: '🛍️ Shop & Items', value: '`.shop` - View shop\n`.shop buy [item]` - Purchase items\n`.use [item]` - Use items\n`.shop inv` - Check inventory' },
            { name: '📊 Pokédex', value: '`.pokedex` - View progress\n`.pokedex [pokemon]` - Pokémon info' },
            { name: '✨ Customization', value: '`.nickname [pokemon] [name]` - Change nickname' },
            { name: '🏆 Leaderboards', value: '`.leaderboard` - View top trainers' },
            { name: '👑 Admin Commands', value: '`.admin give @user [item/money] [amount]`\n`.admin reset @user`\n`.admin spawn [pokemon]`' }
        )
        .setFooter({ text: 'Have fun on your Pokémon journey! 🎉' });

    await message.reply({ embeds: [embed] });
}

// Areas Command
async function handleAreas(message) {
    let areasList = '';
    Object.entries(wildPokemon).forEach(([area, pokemonList]) => {
        areasList += `**${area.toUpperCase()}**\n`;
        areasList += `Available: ${pokemonList.join(', ')}\n\n`;
    });

    const embed = new EmbedBuilder()
        .setTitle('🗺️ Available Areas')
        .setDescription(areasList)
        .setColor(0x27AE60)
        .setFooter({ text: 'Use .explore [area] to visit an area!' });

    await message.reply({ embeds: [embed] });
}

// Switch Pokémon Command
async function handleSwitch(message, args) {
    const player = players.get(message.author.id);
    if (!player) return message.reply('Start your journey with `.start`!');

    if (currentBattles.has(message.author.id)) {
        return message.reply('You cannot switch Pokémon during battle! Use `switch [1-6]` in battle instead.');
    }

    const switchIndex = parseInt(args[0]) - 1;
    if (isNaN(switchIndex) || switchIndex < 0 || switchIndex >= player.team.length) {
        return message.reply(`Please choose a valid team position (1-${player.team.length})!`);
    }

    if (switchIndex === 0) {
        return message.reply('This Pokémon is already active!');
    }

    [player.team[0], player.team[switchIndex]] = [player.team[switchIndex], player.team[0]];

    const embed = new EmbedBuilder()
        .setTitle('🔄 Pokémon Switched!')
        .setDescription(`Your active Pokémon is now **${getNickname(message.author.id, player.team[0].name)}**!`)
        .setColor(0x3498DB)
        .setThumbnail(getPokemonSprite(player.team[0].name));

    await message.reply({ embeds: [embed] });
}

// Main Command Handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Check if message starts with prefix or user is prefixless
    const isPrefixless = prefixlessUsers.has(message.author.id);
    if (!message.content.startsWith(prefix) && !isPrefixless) return;

    let args, command;
    
    if (isPrefixless) {
        args = message.content.trim().split(/ +/);
        command = args.shift().toLowerCase();
    } else {
        args = message.content.slice(prefix.length).trim().split(/ +/);
        command = args.shift().toLowerCase();
    }

    try {
        if (currentBattles.has(message.author.id)) {
            const battle = currentBattles.get(message.author.id);
            if (battle.type === 'gym') {
                await handleGymBattle(message, battle);
            } else {
                await handleBattleCommand(message);
            }
            return;
        }

        switch (command) {
            case 'start':
                await handleStart(message);
                break;
            case 'choose':
                await handleChoose(message, args);
                break;
            case 'profile':
                await handleProfile(message);
                break;
            case 'team':
                await handleTeam(message);
                break;
            case 'explore':
                await handleExplore(message, args);
                break;
            case 'shop':
                await handleShop(message, args);
                break;
            case 'use':
                await handleUse(message, args);
                break;
            case 'gym':
                await handleGym(message, args);
                break;
            case 'pokedex':
                await handlePokedex(message, args);
                break;
            case 'nickname':
                await handleNickname(message, args);
                break;
            case 'heal':
                await handleHeal(message);
                break;
            case 'leaderboard':
                await handleLeaderboard(message);
                break;
            case 'admin':
                await handleAdmin(message, args);
                break;
            case 'help':
                await handleHelp(message);
                break;
            case 'areas':
                await handleAreas(message);
                break;
            case 'switch':
                await handleSwitch(message, args);
                break;
            default:
                if (!isPrefixless) {
                    await message.reply(`Unknown command! Use \`.help\` to see available commands.`);
                }
                break;
        }
    } catch (error) {
        console.error('Command Error:', error);
        await message.reply('❌ An error occurred while executing the command!');
    }
});

// Initialize the bot systems
loadData();
initializeGymLeaders();

// Battle timeout cleanup
setInterval(() => {
    const now = Date.now();
    for (const [userId, battle] of currentBattles.entries()) {
        if (!battle.timestamp) {
            battle.timestamp = now;
        } else if (now - battle.timestamp > BATTLE_TIMEOUT) {
            currentBattles.delete(userId);
            console.log(`Cleared timed out battle for user ${userId}`);
        }
    }
}, 60000);

console.log('🔄 Bot systems initialized!');

// Login Bot
client.login(process.env.DISCORD_TOKEN);

console.log('🤖 Pokémon RPG Bot is now running!');
console.log('🎮 Features:');
console.log('✅ Battle System with Type Advantages');
console.log('✅ 8 Kanto Gym Leaders with Progression');
console.log('✅ Shop with 15+ Items');
console.log('✅ Pokédex System (386 Pokémon)');
console.log('✅ Team Management & Nicknaming');
console.log('✅ Wild Pokémon Exploration');
console.log('✅ Admin Commands');
console.log('✅ Leaderboards & Statistics');