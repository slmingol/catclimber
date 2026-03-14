// Theme Management
const THEMES = ['light', 'dark', 'system'];
const THEME_ICONS = {
    light: '☀️',
    dark: '🌙',
    system: '🌓'
};

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getCurrentTheme() {
    const savedTheme = localStorage.getItem('cat-climber-theme') || 'system';
    if (savedTheme === 'system') {
        return getSystemTheme();
    }
    return savedTheme;
}

function getThemePreference() {
    return localStorage.getItem('cat-climber-theme') || 'system';
}

function setTheme(theme) {
    const actualTheme = theme === 'system' ? getSystemTheme() : theme;
    document.documentElement.setAttribute('data-theme', actualTheme);
    localStorage.setItem('cat-climber-theme', theme);
    updateThemeButton();
}

function updateThemeButton() {
    const themeBtn = document.getElementById('theme-btn');
    const preference = getThemePreference();
    themeBtn.textContent = THEME_ICONS[preference];
    themeBtn.title = `Theme: ${preference.charAt(0).toUpperCase() + preference.slice(1)}`;
}

function cycleTheme() {
    const currentPreference = getThemePreference();
    const currentIndex = THEMES.indexOf(currentPreference);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
}

// Initialize theme on load
setTheme(getThemePreference());

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemePreference() === 'system') {
        setTheme('system');
    }
});

// Puzzle database - will be loaded from collected-puzzles.json
let PUZZLES = [
    {
        start: "SAVE",
        end: "PLAN",
        solution: ["SAVE", "SAGE", "PAGE", "PALE", "PALS", "PLAN"],
        clues: [
            "Change one letter in SAVE to get a wise person → SAGE",
            "Change one letter in SAGE to get a sheet of paper → PAGE",
            "Change one letter in PAGE to get not dark or colorful → PALE",
            "Change one letter in PALE to get plural friends → PALS",
            "Change one letter in PALS to get a scheme or strategy → PLAN"
        ],
        theme: "Word Transformations",
        description: "The best things we SAVE aren't always tangible. Sometimes we need a careful PLAN to protect what truly matters, transforming simple intentions into meaningful actions through small, deliberate changes.",
        date: "March 7, 2026"
    },
    {
        start: "COLD",
        end: "WARM",
        solution: ["COLD", "CORD", "WORD", "WORM", "WARM"],
        clues: [
            "Change one letter in COLD to get a rope or cable → CORD",
            "Change one letter in CORD to get what you're reading now → WORD",
            "Change one letter in WORD to get a wiggly invertebrate → WORM",
            "Change one letter in WORM to get a cozy temperature → WARM"
        ],
        theme: "Temperature",
        description: "A COLD morning transforms gradually as the sun rises, each degree bringing subtle shifts in how we feel. By afternoon, the same air that made us shiver now feels WARM and welcoming, proving that comfort is just COLD given time and patience.",
        date: "March 7, 2026"
    },
    {
        start: "HEAD",
        end: "TAIL",
        solution: ["HEAD", "HEAL", "TEAL", "TELL", "TALL", "TAIL"],
        clues: [
            "Change one letter in HEAD to cure or repair → HEAL",
            "Change one letter in HEAL to get a blue-green color → TEAL",
            "Change one letter in TEAL to speak or narrate → TELL",
            "Change one letter in TELL to get having great height → TALL",
            "Change one letter in TALL to get the opposite end from HEAD → TAIL"
        ],
        theme: "Opposites",
        description: "Every journey needs two markers: the starting HEAD and the finishing TAIL. Like a coin spinning through air, we flip between these opposites, never quite one or the other until we finally land and see which side faces up.",
        date: "March 7, 2026"
    },
    {
        start: "WORK",
        end: "PLAY",
        solution: ["WORK", "PORK", "PORT", "POST", "PAST", "PLAT", "PLAY"],
        clues: [
            "Change one letter in WORK to get meat from a pig → PORK",
            "Change one letter in PORK to get a harbor for ships → PORT",
            "Change one letter in PORT to get where you mail letters → POST",
            "Change one letter in POST to get the opposite of future → PAST",
            "Change one letter in PAST to get a measured piece of land → PLAT",
            "Change one letter in PLAT to have fun → PLAY"
        ],
        theme: "Life Balance",
        description: "Finding the balance between WORK and PLAY defines a life well-lived. Too much responsibility crushes the spirit, while too much leisure leaves us unfulfilled—the sweet spot lies somewhere between these extremes, where obligation meets joy.",
        date: "March 7, 2026"
    },
    {
        start: "LOVE",
        end: "HATE",
        solution: ["LOVE", "HOVE", "HAVE", "HATE"],
        clues: [
            "Change one letter in LOVE to get past tense of heave (nautical) → HOVE",
            "Change one letter in HOVE to possess something → HAVE",
            "Change one letter in HAVE to get strong dislike → HATE"
        ],
        theme: "Emotions",
        description: "LOVE and HATE sit closer together than we'd like to admit. These twin emotions, seemingly opposite, share the same intensity and passion—only their direction differs, making the journey between them surprisingly short yet infinitely complex.",
        date: "March 7, 2026"
    },
    {
        start: "FAST",
        end: "SLOW",
        solution: ["FAST", "LAST", "LASH", "LATH", "LOATH", "SLOTH", "SLOE", "SLOW"],
        clues: [
            "Change one letter in FAST to get coming after all others → LAST",
            "Change one letter in LAST to whip or strike → LASH",
            "Change one letter in LASH to get a thin strip of wood → LATH",
            "Change one letter in LATH to get reluctant or unwilling → LOATH",
            "Change one letter in LOATH to get a very slow-moving animal → SLOTH",
            "Change one letter in SLOTH to get a type of berry → SLOE",
            "Change one letter in SLOE to get not fast → SLOW"
        ],
        theme: "Speed",
        description: "Racing through life FAST, we often miss what matters most. Only when we finally embrace going SLOW do we discover that velocity isn't everything—sometimes the longest path teaches us more than the quickest route ever could.",
        date: "March 7, 2026"
    },
    {
        start: "RAIN",
        end: "SNOW",
        solution: ["RAIN", "PAIN", "PAWN", "SAWN", "SEWN", "SHOW", "SNOW"],
        clues: [
            "Change one letter in RAIN to get physical or emotional hurt → PAIN",
            "Change one letter in PAIN to get a chess piece → PAWN",
            "Change one letter in PAWN to get cut with a saw (past tense) → SAWN",
            "Change one letter in SAWN to get stitched together → SEWN",
            "Change one letter in SEWN to get a performance or display → SHOW",
            "Change one letter in SHOW to get frozen precipitation → SNOW"
        ],
        theme: "Weather",
        description: "Spring RAIN and winter SNOW are siblings separated by temperature. Both fall from clouds, both nourish the earth, yet one flows while the other drifts—proving that nature's transformations often require just the smallest shift in conditions.",
        date: "March 8, 2026"
    },
    {
        start: "IRON",
        end: "GOLD",
        solution: ["IRON", "ICON", "COIN", "CORN", "CORD", "COLD", "GOLD"],
        clues: [
            "Change one letter in IRON to get a symbol or religious image → ICON",
            "Change one letter in ICON to get metal currency → COIN",
            "Change one letter in COIN to get yellow grain on the cob → CORN",
            "Change one letter in CORN to get rope or cable → CORD",
            "Change one letter in CORD to get low temperature → COLD",
            "Change one letter in COLD to get precious yellow metal → GOLD"
        ],
        theme: "Metals",
        description: "Medieval alchemists spent lifetimes trying to transmute common IRON into precious GOLD. While they never achieved their literal goal, they discovered something more valuable: true transformation comes through patience, wisdom, and carefully measured steps forward.",
        date: "March 9, 2026"
    },
    {
        start: "DARK",
        end: "LITE",
        solution: ["DARK", "DART", "TART", "TART", "LART", "LITE"],
        clues: [
            "Change one letter in DARK to get a throwing projectile → DART",
            "Change one letter in DART to get a sweet pastry or sharp taste → TART",
            "Anagram TART to get colloquial spelling of light → LITE"
        ],
        theme: "Light vs Dark",
        description: "Moving from DARK to LITE isn't about banishing shadows entirely—it's about finding the first spark that breaks the blackness. Even the smallest illumination can guide us forward, proving that enlightenment begins with a single, simple change.",
        date: "March 10, 2026"
    },
    {
        start: "MEAT",
        end: "TACO",
        solution: ["MEAT", "MELT", "MOLT", "MOOT", "TOOT", "TACO"],
        clues: [
            "Change one letter in MEAT to liquify from heat → MELT",
            "Change one letter in MELT to shed feathers or skin → MOLT",
            "Change one letter in MOLT to get a debatable point → MOOT",
            "Change one letter in MOOT to sound a horn → TOOT",
            "Anagram TOOT to get Mexican food in a shell → TACO"
        ],
        theme: "Food",
        description: "The journey from raw MEAT to a perfect TACO illustrates culinary alchemy at its finest. Through heat, spices, and technique, simple ingredients transform into complex flavors—each step of preparation adding depth until something entirely new emerges.",
        date: "March 11, 2026"
    },
    {
        start: "BOOK",
        end: "READ",
        solution: ["BOOK", "TOOK", "TOAD", "ROAD", "READ"],
        clues: [
            "Change one letter in BOOK to get past tense of take → TOOK",
            "Change one letter in TOOK to get a warty amphibian → TOAD",
            "Change one letter in TOAD to get a path for vehicles → ROAD",
            "Change one letter in ROAD to look at and comprehend text → READ"
        ],
        theme: "Literature",
        description: "A BOOK remains just bound paper until someone opens it to READ. That act of reading transforms static text into living stories, transporting us from our comfortable chairs into adventures we never imagined, all through the magic of words.",
        date: "March 12, 2026"
    },
    {
        start: "RICH",
        end: "POOR",
        solution: ["RICH", "RICK", "ROCK", "ROOK", "ROOF", "POOF", "POOR"],
        clues: [
            "Change one letter in RICH to get a stack of hay → RICK",
            "Change one letter in RICK to get a stone → ROCK",
            "Change one letter in ROCK to get a castle piece in chess → ROOK",
            "Change one letter in ROOK to get top covering of a house → ROOF",
            "Change one letter in ROOF to get exclamation when something disappears → POOF",
            "Change one letter in POOF to get having little money → POOR"
        ],
        theme: "Economics",
        description: "The distance between RICH and POOR is shorter than it appears. Fortunes rise and fall, circumstances shift unexpectedly, and what seems permanent today may vanish tomorrow—teaching us that true wealth lies in resilience, not in what we temporarily hold.",
        date: "March 13, 2026"
    },
    {
        start: "BLUE",
        end: "PINK",
        solution: ["BLUE", "GLUE", "GLUT", "GOUT", "POUT", "PUNT", "PINK"],
        clues: [
            "Change one letter in BLUE to get sticky adhesive → GLUE",
            "Change one letter in GLUE to get an oversupply → GLUT",
            "Change one letter in GLUT to get painful joint condition → GOUT",
            "Change one letter in GOUT to push out your lips in displeasure → POUT",
            "Change one letter in POUT to kick a football → PUNT",
            "Change one letter in PUNT to get light red color → PINK"
        ],
        theme: "Colors",
        description: "Watch the sky transform from deep BLUE to soft PINK during sunset. This daily metamorphosis reminds us that colors exist on a spectrum, and the journey from one hue to another passes through shades we rarely pause to appreciate.",
        date: "March 14, 2026"
    },
    {
        start: "MOON",
        end: "STAR",
        solution: ["MOON", "MOAN", "LOAN", "LEAN", "LEAR", "SEAR", "STAR"],
        clues: [
            "Change one letter in MOON to get a groan or complaint → MOAN",
            "Change one letter in MOAN to get borrowed money → LOAN",
            "Change one letter in LOAN to tilt or be thin → LEAN",
            "Change one letter in LEAN to get King in Shakespeare play → LEAR",
            "Change one letter in LEAR to burn the surface → SEAR",
            "Change one letter in SEAR to get celestial body that twinkles → STAR"
        ],
        theme: "Astronomy",
        description: "Ancient sailors navigated by both MOON and STAR, each celestial body offering its own guidance. While one waxes and wanes, the others remain constant—together they map the heavens, showing us that even the night sky tells stories of transformation and permanence.",
        date: "March 15, 2026"
    },
    {
        start: "FIRE",
        end: "SAFE",
        solution: ["FIRE", "FARE", "CAFE", "SAFE"],
        clues: [
            "Change one letter in FIRE to get transportation cost → FARE",
            "Change one letter in FARE to get a coffee shop → CAFE",
            "Change one letter in CAFE to get secure and protected → SAFE"
        ],
        theme: "Safety",
        description: "Running from FIRE toward somewhere SAFE is instinct, but the transformation between danger and security happens through deliberate choices. What once threatened to consume us can become controlled, useful, even comforting when we learn to contain and direct it properly.",
        date: "March 16, 2026"
    }
];

// Game state
let currentPuzzle = null;
let currentPuzzleIndex = 0;
let userSolution = [];
let revealedHintIndex = null;
let usedClues = [];
let hintsUsed = []; // Track which steps used hints
let shuffledCluesOrder = []; // Store shuffled clue order for current puzzle
let lockedWords = new Set(); // Track which word indices are locked after completion

// Elements
const startWordEl = document.getElementById('start-word');
const endWordEl = document.getElementById('end-word');
const puzzleDateEl = document.getElementById('puzzle-date');
const puzzleNumberTextEl = document.getElementById('puzzle-number-text');
const puzzleThemeTextEl = document.getElementById('puzzle-theme-text');
const ladderEl = document.getElementById('ladder');
const cluesEl = document.getElementById('clues');
const checkBtn = document.getElementById('check-btn');
const revealBtn = document.getElementById('reveal-btn');
const clearBtn = document.getElementById('clear-btn');
const prevPuzzleBtn = document.getElementById('prev-puzzle-btn');
const nextPuzzleBtn = document.getElementById('next-puzzle-btn');
const resultModal = document.getElementById('result-modal');
const resultMessage = document.getElementById('result-message');
const closeModal = document.querySelector('.close');
const hintModal = document.getElementById('hint-modal');
const hintOkBtn = document.getElementById('hint-ok-btn');
const hintCancelBtn = document.getElementById('hint-cancel-btn');
const usedCluesEl = document.getElementById('used-clues');
const usedCluesHeading = document.getElementById('used-clues-heading');
const aboutContentEl = document.getElementById('about-content');
const victorySection = document.getElementById('victory-section');
const victoryContent = document.getElementById('victory-content');
const letterCountIndicator = document.getElementById('letter-count-indicator');
const welcomeModal = document.getElementById('welcome-modal');
const closeWelcome = document.querySelector('.close-welcome');
const startPlayingBtn = document.getElementById('start-playing-btn');
const dontShowWelcomeCheckbox = document.getElementById('dont-show-welcome');
const themeBtn = document.getElementById('theme-btn');
const statsBtn = document.getElementById('stats-btn');
const statsModal = document.getElementById('stats-modal');
const closeStats = document.querySelector('.close-stats');
const resetStatsBtn = document.getElementById('reset-stats-btn');

// Stats tracking
let gameStats = {
    played: 0,
    completed: 0,
    perfectGames: 0,
    totalHints: 0,
    currentStreak: 0,
    bestStreak: 0,
    puzzlesCompleted: {}, // Track which puzzles are completed
    lastPlayed: null
};

// Load stats from localStorage
function loadStats() {
    const saved = localStorage.getItem('cat-climber-stats');
    if (saved) {
        gameStats = { ...gameStats, ...JSON.parse(saved) };
    }
}

// Save stats to localStorage
function saveStats() {
    localStorage.setItem('cat-climber-stats', JSON.stringify(gameStats));
}

// Update a stat
function updateStat(stat, value) {
    gameStats[stat] = value;
    saveStats();
}

// Increment a stat
function incrementStat(stat, amount = 1) {
    gameStats[stat] = (gameStats[stat] || 0) + amount;
    saveStats();
}

// Mark puzzle as completed
function markPuzzleCompleted(puzzleIndex, hintsCount) {
    if (!gameStats.puzzlesCompleted[puzzleIndex]) {
        incrementStat('completed');
        if (hintsCount === 0) {
            incrementStat('perfectGames');
        }
        gameStats.puzzlesCompleted[puzzleIndex] = {
            completed: true,
            hints: hintsCount,
            date: new Date().toISOString()
        };
        
        // Update streak
        incrementStat('currentStreak');
        if (gameStats.currentStreak > gameStats.bestStreak) {
            gameStats.bestStreak = gameStats.currentStreak;
        }
        
        saveStats();
    }
}

// Save game state
function saveGameState() {
    const state = {
        puzzleIndex: currentPuzzleIndex,
        userSolution: userSolution,
        hintsUsed: hintsUsed,
        usedClues: usedClues,
        shuffledCluesOrder: shuffledCluesOrder,
        lockedWords: Array.from(lockedWords), // Convert Set to Array for JSON
        lastSaved: new Date().toISOString()
    };
    localStorage.setItem('cat-climber-game-state', JSON.stringify(state));
    gameStats.lastPlayed = new Date().toISOString();
    saveStats();
}

// Load game state
function loadGameState() {
    const saved = localStorage.getItem('cat-climber-game-state');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            currentPuzzleIndex = state.puzzleIndex || 0;
            // Don't restore userSolution yet - will do that after loading puzzle
            return state;
        } catch (e) {
            console.error('Failed to load game state:', e);
        }
    }
    return null;
}

// Display stats modal
function displayStats() {
    loadStats();
    
    const completionRate = gameStats.played > 0 
        ? Math.round((gameStats.completed / gameStats.played) * 100) 
        : 0;
    
    const avgHints = gameStats.completed > 0 
        ? (gameStats.totalHints / gameStats.completed).toFixed(1)
        : 0;
    
    document.getElementById('stat-played').textContent = gameStats.played;
    document.getElementById('stat-completed').textContent = gameStats.completed;
    document.getElementById('stat-completion-rate').textContent = completionRate + '%';
    document.getElementById('stat-current-streak').textContent = gameStats.currentStreak;
    document.getElementById('stat-perfect-games').textContent = gameStats.perfectGames;
    document.getElementById('stat-avg-hints').textContent = avgHints;
    document.getElementById('stat-best-streak').textContent = gameStats.bestStreak;
    document.getElementById('stat-total-hints').textContent = gameStats.totalHints;
    document.getElementById('current-puzzle-info').textContent = `#${currentPuzzleIndex + 1} - ${currentPuzzle.theme}`;
    
    if (gameStats.lastPlayed) {
        const lastDate = new Date(gameStats.lastPlayed);
        document.getElementById('last-played-info').textContent = lastDate.toLocaleDateString() + ' ' + lastDate.toLocaleTimeString();
    } else {
        document.getElementById('last-played-info').textContent = 'Never';
    }
    
    statsModal.style.display = 'flex';
}

// Reset stats
function resetStats() {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
        gameStats = {
            played: 0,
            completed: 0,
            perfectGames: 0,
            totalHints: 0,
            currentStreak: 0,
            bestStreak: 0,
            puzzlesCompleted: {},
            lastPlayed: null
        };
        saveStats();
        localStorage.removeItem('cat-climber-game-state');
        displayStats();
        alert('Statistics reset successfully!');
    }
}

// Load puzzles from collected database
async function loadPuzzlesFromDatabase() {
    try {
        const response = await fetch('collected-puzzles.json');
        if (!response.ok) {
            throw new Error('Failed to load puzzle database');
        }
        const data = await response.json();
        if (data.puzzles && Array.isArray(data.puzzles)) {
            // Filter to only include puzzles with complete solutions
            PUZZLES = data.puzzles.filter(p => 
                p.solution && 
                Array.isArray(p.solution) && 
                p.solution.length >= 2 &&
                p.solution.every(word => word && word.length > 0)
            );
            console.log(`Loaded ${PUZZLES.length} complete puzzles from database (filtered from ${data.puzzles.length} total)`);
            
            if (PUZZLES.length === 0) {
                console.warn('No complete puzzles found in database, using default set');
            }
        }
    } catch (error) {
        console.error('Error loading puzzles, using default set:', error);
        // PUZZLES already has fallback puzzles
    }
}

// Initialize game
async function initGame() {
    // Load puzzles from database first
    await loadPuzzlesFromDatabase();
    
    // Check for puzzle parameter in URL (from archive page)
    const urlParams = new URLSearchParams(window.location.search);
    const puzzleParam = urlParams.get('puzzle');
    if (puzzleParam !== null) {
        const puzzleIndex = parseInt(puzzleParam, 10);
        if (!isNaN(puzzleIndex) && puzzleIndex >= 0 && puzzleIndex < PUZZLES.length) {
            currentPuzzleIndex = puzzleIndex;
            // Clear saved state when loading from archive
            clearGameState();
        }
        // Clear URL parameter after reading
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    loadStats();
    const savedState = loadGameState();
    
    if (savedState) {
        // Restore state BEFORE loading puzzle
        if (savedState.userSolution) {
            userSolution = savedState.userSolution;
            hintsUsed = savedState.hintsUsed || [];
            usedClues = savedState.usedClues || [];
            shuffledCluesOrder = savedState.shuffledCluesOrder || [];
            lockedWords = new Set(savedState.lockedWords || []); // Restore locked words
        }
        
        // Now load saved puzzle (it will use the restored state)
        loadPuzzle(currentPuzzleIndex, true); // Pass true to indicate we're restoring
    } else {
        loadPuzzle(currentPuzzleIndex);
    }
    
    checkFirstVisit();
}

// Load a puzzle
function loadPuzzle(index, isRestoring = false) {
    currentPuzzle = PUZZLES[index % PUZZLES.length];
    currentPuzzleIndex = index;
    
    // Check if we're loading a new puzzle (not restoring state)
    if (!isRestoring && (!userSolution || userSolution.length !== currentPuzzle.solution.length)) {
        userSolution = new Array(currentPuzzle.solution.length).fill('');
        userSolution[0] = currentPuzzle.start;
        userSolution[userSolution.length - 1] = currentPuzzle.end;
        revealedHintIndex = null;
        usedClues = [];
        hintsUsed = [];
        lockedWords.clear(); // Clear locked words for new puzzle
        
        // Shuffle clues once for this puzzle
        shuffledCluesOrder = [...currentPuzzle.clues].sort(() => Math.random() - 0.5);
        
        // Increment played count only when starting a new puzzle
        if (!gameStats.puzzlesCompleted[index]) {
            incrementStat('played');
        }
    } else if (shuffledCluesOrder.length === 0) {
        // If restoring state but no shuffled order saved, create one
        shuffledCluesOrder = [...currentPuzzle.clues].sort(() => Math.random() - 0.5);
    }
    
    // Hide victory section
    victorySection.style.display = 'none';
    
    renderPuzzle();
    saveGameState();
}

// Render the puzzle
function renderPuzzle() {
    // Update header
    startWordEl.textContent = currentPuzzle.start;
    endWordEl.textContent = currentPuzzle.end;
    
    // Format date with day of week
    if (currentPuzzle.date) {
        const dateObj = new Date(currentPuzzle.date);
        const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        puzzleDateEl.textContent = `${dayOfWeek}, ${currentPuzzle.date}`;
    } else {
        puzzleDateEl.textContent = currentPuzzle.date;
    }
    
    puzzleNumberTextEl.textContent = `Cat Climber: #${currentPuzzleIndex + 1}`;
    puzzleThemeTextEl.textContent = currentPuzzle.theme;
    
    // Render ladder
    renderLadder();
    
    // Render clues (shuffled)
    renderClues();
    
    // Render about section
    renderAbout();
    
    // Focus first available input
    focusFirstAvailableInput();
}

// Helper function to focus the first available (enabled) input
function focusFirstAvailableInput() {
    setTimeout(() => {
        for (let i = 1; i < currentPuzzle.solution.length - 1; i++) {
            const input = document.querySelector(`input[data-index="${i}"]`);
            if (input && !input.disabled) {
                input.focus();
                break;
            }
        }
    }, 0);
}

// Helper function to find letter change between two words
function getLetterChange(word1, word2) {
    if (!word1 || !word2 || word1.length !== word2.length) return '';
    for (let i = 0; i < word1.length; i++) {
        if (word1[i] !== word2[i]) {
            return `${word1[i]}→${word2[i]}`;
        }
    }
    return '';
}

// Render ladder steps
function renderLadder() {
    ladderEl.innerHTML = '';
    
    // Helper to check if a rung is accessible (adjacent to a filled word)
    function isRungAccessible(index) {
        // Check if previous word (above) is filled
        const prevWord = userSolution[index - 1];
        const prevFilled = prevWord && prevWord.trim() !== '';
        
        // Check if next word (below) is filled
        const nextWord = userSolution[index + 1];
        const nextFilled = nextWord && nextWord.trim() !== '';
        
        return prevFilled || nextFilled;
    }
    
    currentPuzzle.solution.forEach((word, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'ladder-step';
        
        // First word: show as static text
        if (index === 0) {
            stepDiv.classList.add('start-word');
            const wordDiv = document.createElement('div');
            wordDiv.className = 'ladder-word-text';
            wordDiv.textContent = word;
            stepDiv.appendChild(wordDiv);
        }
        // Last word: show as static text
        else if (index === currentPuzzle.solution.length - 1) {
            stepDiv.classList.add('end-word');
            const wordDiv = document.createElement('div');
            wordDiv.className = 'ladder-word-text';
            wordDiv.textContent = word;
            stepDiv.appendChild(wordDiv);
        }
        // Middle words: show input with placeholder
        else {
            // Create input for word entry
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'ladder-input';
            input.maxLength = word.length;
            input.dataset.index = index;
            input.value = userSolution[index] || '';
            
            // Check if this word has been locked
            const isLocked = lockedWords.has(index);
            
            // Only enable input if it's adjacent to a filled word
            if (!isRungAccessible(index)) {
                input.disabled = true;
                input.style.opacity = '0.4';
                input.style.cursor = 'not-allowed';
            } else if (isLocked) {
                // Make locked words read-only and prevent all interaction
                input.readOnly = true;
                input.classList.add('completed');
                input.style.cursor = 'not-allowed';
                
                // Add event listeners to block editing attempts
                input.addEventListener('keydown', (e) => {
                    if (lockedWords.has(index)) {
                        e.preventDefault();
                        return false;
                    }
                });
                input.addEventListener('input', (e) => {
                    if (lockedWords.has(index)) {
                        e.preventDefault();
                        e.target.value = userSolution[index] || '';
                        return false;
                    }
                });
                input.addEventListener('paste', (e) => {
                    if (lockedWords.has(index)) {
                        e.preventDefault();
                        return false;
                    }
                });
                input.addEventListener('cut', (e) => {
                    if (lockedWords.has(index)) {
                        e.preventDefault();
                        return false;
                    }
                });
            }
            
            // Create placeholder with emoji boxes
            const boxes = '◻️'.repeat(word.length);
            input.placeholder = `${boxes} (${word.length})`;
            
            input.addEventListener('input', handleInput);
            input.addEventListener('keydown', handleKeyDown);
            input.addEventListener('focus', handleInputFocus);
            input.addEventListener('blur', handleInputBlur);
            
            stepDiv.appendChild(input);
            
            // Add hint button to accessible rungs only (adjacent to filled words)
            // But not if this rung is already filled
            const currentWord = userSolution[index];
            const isCurrentFilled = currentWord && currentWord.trim() !== '';
            
            if (isRungAccessible(index) && !isCurrentFilled) {
                const hintBtn = document.createElement('button');
                hintBtn.className = 'hint-btn';
                hintBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a6 6 0 0 0-6 6c0 2 1 3 2 4l2 2v2h4v-2l2-2c1-1 2-2 2-4a6 6 0 0 0-6-6z"></path><path d="M10 18h4"></path><path d="M11 20h2"></path></svg>`;
                hintBtn.title = 'Show clue for this word';
                hintBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showClueHint(index);
                });
                stepDiv.appendChild(hintBtn);
            }
            
            // Add hint span for validation feedback
            const hintSpan = document.createElement('span');
            hintSpan.className = 'step-hint';
            hintSpan.dataset.index = index;
            stepDiv.appendChild(hintSpan);
        }
        
        ladderEl.appendChild(stepDiv);
        
        // Add letter change box on the bottom border (rung) if the next word is solved
        if (index < currentPuzzle.solution.length - 1) {
            const nextIndex = index + 1;
            const currentWord = userSolution[index] || currentPuzzle.solution[index];
            const nextWord = userSolution[nextIndex];
            const isNextWordSolved = nextWord && nextWord.toUpperCase() === currentPuzzle.solution[nextIndex].toUpperCase();
            
            if (isNextWordSolved && currentWord && nextWord && currentWord.length === nextWord.length) {
                const change = getLetterChange(currentWord.toUpperCase(), nextWord.toUpperCase());
                if (change) {
                    const changeBox = document.createElement('div');
                    changeBox.className = 'letter-change-box';
                    changeBox.textContent = change;
                    stepDiv.appendChild(changeBox);
                }
            }
        }
    });
}

// Helper function to process clue with solved words
function processClue(clue) {
    let processedClue = clue;
    
    // First, replace ^ placeholders with actual words from the solution
    // BUT only if those words have been revealed (solved or are start/end words)
    const clueIndex = currentPuzzle.clues.indexOf(clue);
    if (clueIndex !== -1) {
        // Clue index i refers to solution word at index i+1
        // The ^ refers to the word at index i (previous word in ladder)
        const prevWordIndex = clueIndex;
        const prevWord = currentPuzzle.solution[prevWordIndex];
        
        // Check if the previous word has been revealed
        let wordToShow = prevWord;
        
        // If it's not the start word (index 0) and not been solved, use placeholder
        if (prevWordIndex > 0 && prevWordIndex < currentPuzzle.solution.length - 1) {
            const userWord = userSolution[prevWordIndex];
            const isSolved = userWord && 
                            userWord.trim() !== '' && 
                            userWord.length === prevWord.length &&
                            userWord.toUpperCase() === prevWord.toUpperCase();
            
            if (!isSolved) {
                // Replace with underscores matching the word length
                wordToShow = '_'.repeat(prevWord.length);
            }
        }
        
        // Replace all ^ with the word (or placeholder)
        processedClue = processedClue.replace(/\^/g, wordToShow);
    }
    
    // Highlight solved words (but always show all words)
    // Only process middle words (not start/end which are always visible)
    for (let i = 1; i < currentPuzzle.solution.length - 1; i++) {
        const word = currentPuzzle.solution[i];
        const userWord = userSolution[i];
        
        // Check if word is correctly solved
        const isSolved = userWord && 
                        userWord.trim() !== '' && 
                        userWord.length === word.length &&
                        userWord.toUpperCase() === word.toUpperCase();
        
        if (isSolved) {
            // Highlight solved words
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            processedClue = processedClue.replace(regex, `<span class="clue-revealed-word">${word}</span>`);
        }
        // Note: We don't hide unsolved words - they remain visible in clues
    }
    
    return processedClue;
}

// Render clues (shuffled)
function renderClues() {
    cluesEl.innerHTML = '';
    usedCluesEl.innerHTML = '';
    
    // Use pre-shuffled clues order (shuffled once when puzzle loads)
    const clues = shuffledCluesOrder.length > 0 ? shuffledCluesOrder : currentPuzzle.clues;
    
    clues.forEach(clue => {
        const clueDiv = document.createElement('div');
        clueDiv.className = 'clue';
        
        // Store original clue in data attribute for matching
        clueDiv.dataset.originalClue = clue;
        
        // Process clue to replace unsolved words with ____ and highlight solved ones
        const displayClue = processClue(clue);
        clueDiv.innerHTML = displayClue; // Use innerHTML to render HTML tags
        
        // Check if clue has been used
        if (usedClues.includes(clue)) {
            // Move to used clues section
            usedCluesEl.appendChild(clueDiv);
        } else {
            // Keep in main clues section
            cluesEl.appendChild(clueDiv);
        }
    });
    
    // Show/hide used clues heading based on whether there are used clues
    if (usedClues.length > 0) {
        usedCluesHeading.style.display = 'block';
    } else {
        usedCluesHeading.style.display = 'none';
    }
}

// Render about section with puzzle-specific information
function renderAbout() {
    const steps = currentPuzzle.solution.length - 2; // Exclude start and end
    const description = currentPuzzle.description || 'A word ladder puzzle connecting two words through single-letter transformations.';
    const aboutText = `
        <p><strong>${currentPuzzle.theme}:</strong> Transform <strong>${currentPuzzle.start}</strong> into <strong>${currentPuzzle.end}</strong> in ${steps} step${steps !== 1 ? 's' : ''}.</p>
        <p style="margin-top: 12px; font-style: italic;">${description}</p>
    `;
    aboutContentEl.innerHTML = aboutText;
}

// Show clue hint for a specific ladder step
function showClueHint(index) {
    const clueIndex = index - 1; // First rung after start word is clue[0]
    
    // If hint already revealed for this step, auto-complete and move to next
    if (revealedHintIndex === index) {
        const correctWord = currentPuzzle.solution[index];
        userSolution[index] = correctWord;
        
        // Track that this word used a hint
        if (!hintsUsed.includes(index)) {
            hintsUsed.push(index);
            incrementStat('totalHints', 1);
        }
        
        // Update input
        const input = document.querySelector(`input[data-index="${index}"]`);
        if (input) {
            input.value = correctWord;
        }
        
        // Mark clue as used and clear revealed state
        const clue = currentPuzzle.clues[clueIndex];
        if (!usedClues.includes(clue)) {
            usedClues.push(clue);
        }
        revealedHintIndex = null;
        
        // Save the updated state
        saveGameState();
        
        setTimeout(() => {
            renderClues(); // Re-render to move clue to used section
            renderLadder();
            // Focus next input
            const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
            if (nextInput) {
                nextInput.focus();
            }
        }, 150);
        return;
    }
    
    // First click: show confirmation modal
    if (hintModal) {
        hintModal.style.display = 'flex';
        hintModal.dataset.targetIndex = index;
        // Focus the modal to enable keyboard shortcuts
        setTimeout(() => hintModal.focus(), 0);
    } else {
        console.error('hintModal element not found!');
    }
}

// Handle hint reveal confirmation
function confirmHintReveal() {
    const index = parseInt(hintModal.dataset.targetIndex);
    const clueIndex = index - 1;
    
    if (clueIndex >= 0 && clueIndex < currentPuzzle.clues.length) {
        const clue = currentPuzzle.clues[clueIndex];
        
        // Highlight the clue in the clues section using data attribute
        const clueElements = document.querySelectorAll('.clue');
        clueElements.forEach(clueEl => {
            if (clueEl.dataset.originalClue === clue) {
                clueEl.classList.add('clue-highlighted');
            } else {
                clueEl.classList.remove('clue-highlighted');
            }
        });
        
        // Mark this hint as revealed
        revealedHintIndex = index;
    }
    
    hintModal.style.display = 'none';
    
    // Return focus to the input
    setTimeout(() => {
        const input = document.querySelector(`input[data-index="${index}"]`);
        if (input) {
            input.focus();
        }
    }, 0);
}

// Cancel hint reveal
function cancelHintReveal() {
    const index = parseInt(hintModal.dataset.targetIndex);
    hintModal.style.display = 'none';
    
    // Return focus to the input
    setTimeout(() => {
        const input = document.querySelector(`input[data-index="${index}"]`);
        if (input) {
            input.focus();
        }
    }, 0);
}

// Handle input
function handleInput(e) {
    const index = parseInt(e.target.dataset.index);
    const wordLength = currentPuzzle.solution[index].length;
    userSolution[index] = e.target.value.toUpperCase();
    e.target.value = e.target.value.toUpperCase();
    
    // If word is complete, mark clue as used and re-render
    if (e.target.value.length === wordLength) {
        const clueIndex = index - 1;
        
        if (clueIndex >= 0 && clueIndex < currentPuzzle.clues.length) {
            const clue = currentPuzzle.clues[clueIndex];
            
            if (!usedClues.includes(clue)) {
                usedClues.push(clue);
            }
            
            // Clear highlighted state
            revealedHintIndex = null;
        }
        
        // Save state after updating usedClues
        saveGameState();
        
        // Lock this word permanently
        lockedWords.add(index);
        
        // Make this input read-only after completion
        e.target.readOnly = true;
        e.target.classList.add('completed');
        
        // Small delay to let user see their completed word before re-render
        setTimeout(() => {
            renderClues(); // Re-render clues to move to used section
            renderLadder();
            
            // Check if all words are now filled
            let allFilled = true;
            for (let i = 1; i < userSolution.length - 1; i++) {
                if (!userSolution[i] || userSolution[i].trim() === '') {
                    allFilled = false;
                    break;
                }
            }
            
            // If all filled, auto-check the solution
            if (allFilled) {
                setTimeout(() => {
                    checkSolution();
                }, 300);
            } else {
                // Focus next available input
                for (let i = index + 1; i < currentPuzzle.solution.length - 1; i++) {
                    const nextInput = document.querySelector(`input[data-index="${i}"]`);
                    if (nextInput && !nextInput.disabled) {
                        nextInput.focus();
                        break;
                    }
                }
            }
        }, 150);
    }
}

// Handle keyboard navigation
function handleKeyDown(e) {
    const index = parseInt(e.target.dataset.index);
    
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        // Find next available (enabled) input
        for (let i = index + 1; i < currentPuzzle.solution.length - 1; i++) {
            const nextInput = document.querySelector(`input[data-index="${i}"]`);
            if (nextInput && !nextInput.disabled) {
                nextInput.focus();
                break;
            }
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        // Find previous available (enabled) input
        for (let i = index - 1; i >= 1; i--) {
            const prevInput = document.querySelector(`input[data-index="${i}"]`);
            if (prevInput && !prevInput.disabled) {
                prevInput.focus();
                break;
            }
        }
    }
}

// Handle input focus - show letter count indicator
function handleInputFocus(e) {
    const index = parseInt(e.target.dataset.index);
    const wordLength = currentPuzzle.solution[index].length;
    
    // Get the position of the input relative to the ladder
    const inputRect = e.target.getBoundingClientRect();
    const ladderRect = ladderEl.getBoundingClientRect();
    const relativeTop = inputRect.top - ladderRect.top + ladderEl.scrollTop;
    
    // Position and show the indicator
    letterCountIndicator.textContent = `(${wordLength})`;
    letterCountIndicator.style.top = `${relativeTop + (inputRect.height / 2) - 10}px`;
    letterCountIndicator.style.display = 'block';
}

// Handle input blur - hide letter count indicator
function handleInputBlur(e) {
    // Small delay to allow focus to move to another input
    setTimeout(() => {
        const focusedInput = document.activeElement;
        if (!focusedInput || !focusedInput.classList.contains('ladder-input')) {
            letterCountIndicator.style.display = 'none';
        }
    }, 0);
}

// Check solution
function checkSolution() {
    let allCorrect = true;
    const inputs = document.querySelectorAll('.ladder-input');
    
    inputs.forEach(input => {
        const index = parseInt(input.dataset.index);
        const userWord = userSolution[index];
        const correctWord = currentPuzzle.solution[index];
        
        input.classList.remove('correct', 'incorrect');
        const hintEl = input.parentElement.querySelector('.step-hint');
        if (hintEl) hintEl.textContent = '';
        
        if (!userWord) {
            allCorrect = false;
            return;
        }
        
        // Check if matches correct answer (case-insensitive)
        if (userWord.toUpperCase() === correctWord.toUpperCase()) {
            input.classList.add('correct');
            input.parentElement.style.background = 'rgba(76, 175, 80, 0.4)';
        } else {
            input.classList.add('incorrect');
            input.parentElement.style.background = 'rgba(244, 67, 54, 0.3)';
            if (hintEl) hintEl.textContent = 'Incorrect word';
            allCorrect = false;
        }
    });
    
    if (allCorrect) {
        showResult(true);
    } else {
        showResult(false);
    }
}

// Reveal answer
function revealAnswer() {
    const inputs = document.querySelectorAll('.ladder-input');
    
    inputs.forEach(input => {
        const index = parseInt(input.dataset.index);
        input.value = currentPuzzle.solution[index];
        userSolution[index] = currentPuzzle.solution[index];
        input.classList.add('correct');
        input.disabled = true;
        input.parentElement.style.background = 'rgba(76, 175, 80, 0.4)';
    });
    
    // Show victory section after revealing
    showResult(true);
}

// Show result modal
function showResult(success) {
    if (success) {
        // Track completion
        markPuzzleCompleted(currentPuzzleIndex, hintsUsed.length);
        incrementStat('totalHints', hintsUsed.length);
        
        // Calculate completion percentage (hints used / total middle words)
        const totalMiddleWords = currentPuzzle.solution.length - 2;
        const percentNoHints = Math.round(((totalMiddleWords - hintsUsed.length) / totalMiddleWords) * 100);
        
        // Build path visualization
        let pathEmojis = '🟢'; // Start
        for (let i = 1; i < currentPuzzle.solution.length - 1; i++) {
            if (hintsUsed.includes(i)) {
                pathEmojis += '💡'; // Hint used
            } else {
                pathEmojis += '👁️'; // Solved without hint
            }
        }
        pathEmojis += '🟢'; // End
        
        victoryContent.innerHTML = `
            <div style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">
                Time to 💨 skeedaddle (${percentNoHints}%)
            </div>
            <div style="font-size: 16px; margin-bottom: 16px; word-break: break-all; letter-spacing: 0.1em;">
                ${currentPuzzle.start} ${pathEmojis} ${currentPuzzle.end}
            </div>
            <button onclick="copyResults()" style="padding: 10px 20px; background: rgba(100,150,200,0.3); border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; color: #fff; cursor: pointer; font-size: 15px; font-weight: 600; transition: all 0.2s;">
                📋 Copy results to clipboard
            </button>
        `;
        victorySection.style.display = 'block';
    } else {
        victoryContent.innerHTML = `
            <div style="text-align: center;">
                <span style="font-size: 32px;">💭</span>
                <div style="font-size: 18px; font-weight: 600; margin-top: 8px;">Not quite right...</div>
                <div style="font-size: 14px; color: rgba(255,255,255,0.7); margin-top: 4px;">Keep trying or reveal the answer!</div>
            </div>
        `;
        victorySection.style.display = 'block';
        
        // Auto-hide error message after 3 seconds
        setTimeout(() => {
            victorySection.style.display = 'none';
        }, 3000);
    }
}

// Copy results to clipboard
function copyResults() {
    const totalMiddleWords = currentPuzzle.solution.length - 2;
    const percentNoHints = Math.round(((totalMiddleWords - hintsUsed.length) / totalMiddleWords) * 100);
    
    let pathEmojis = '🟢';
    for (let i = 1; i < currentPuzzle.solution.length - 1; i++) {
        if (hintsUsed.includes(i)) {
            pathEmojis += '💡';
        } else {
            pathEmojis += '👁️';
        }
    }
    pathEmojis += '🟢';
    
    const text = `Time to 💨 skeedaddle (${percentNoHints}%)\n${currentPuzzle.start} ${pathEmojis} ${currentPuzzle.end}\n\nCAT·CLIMBER - ${currentPuzzle.theme}`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Clear all inputs
function clearAll() {
    const inputs = document.querySelectorAll('.ladder-input:not(:disabled)');
    inputs.forEach((input) => {
        input.value = '';
        const dataIndex = parseInt(input.dataset.index);
        userSolution[dataIndex] = '';
        input.classList.remove('correct', 'incorrect');
        input.parentElement.style.background = 'rgba(100, 100, 150, 0.2)';
        const hintEl = input.parentElement.querySelector('.step-hint');
        if (hintEl) hintEl.textContent = '';
    });
    
    // Clear revealed hint and used clues
    revealedHintIndex = null;
    usedClues = [];
    lockedWords.clear(); // Clear locked words
    renderClues();
    renderLadder();
    
    // Hide victory section
    victorySection.style.display = 'none';
    
    // Focus first input after clearing
    focusFirstAvailableInput();
    
    // Save state after clearing
    saveGameState();
}

// New puzzle
function newPuzzle() {
    currentPuzzleIndex = (currentPuzzleIndex + 1) % PUZZLES.length;
    loadPuzzle(currentPuzzleIndex);
}

// Previous puzzle
function prevPuzzle() {
    currentPuzzleIndex = (currentPuzzleIndex - 1 + PUZZLES.length) % PUZZLES.length;
    userSolution = []; // Force reset for new puzzle
    loadPuzzle(currentPuzzleIndex);
}

// Next puzzle
function nextPuzzle() {
    currentPuzzleIndex = (currentPuzzleIndex + 1) % PUZZLES.length;
    userSolution = []; // Force reset for new puzzle
    loadPuzzle(currentPuzzleIndex);
}

// Event listeners
checkBtn.addEventListener('click', checkSolution);
revealBtn.addEventListener('click', revealAnswer);
clearBtn.addEventListener('click', clearAll);
prevPuzzleBtn.addEventListener('click', prevPuzzle);
nextPuzzleBtn.addEventListener('click', nextPuzzle);
closeModal.addEventListener('click', () => {
    resultModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === resultModal) {
        resultModal.style.display = 'none';
    }
    if (e.target === adminModal) {
        adminModal.style.display = 'none';
    }
});

// Admin Modal
const adminBtn = document.getElementById('admin-btn');
const adminModal = document.getElementById('admin-modal');
const closeAdminModal = document.querySelector('.close-admin');
const scrapeStartDateInput = document.getElementById('scrape-start-date');
const scrapeDaysInput = document.getElementById('scrape-days');
const scrapeCommandEl = document.getElementById('scrape-command');
const copyCommandBtn = document.getElementById('copy-command-btn');
const collectionStatsEl = document.getElementById('collection-stats');
const showImportBtn = document.getElementById('show-import-btn');

// How to Play Modal
const helpBtn = document.getElementById('help-btn');
const howToPlayModal = document.getElementById('how-to-play-modal');
const closeHowToPlay = document.querySelector('.close-how-to-play');

// Update scrape command when inputs change
function updateScrapeCommand() {
    const startDate = scrapeStartDateInput.value;
    const days = scrapeDaysInput.value;
    scrapeCommandEl.textContent = `node scraper.js batch ${days} ${startDate}`;
}

scrapeStartDateInput.addEventListener('input', updateScrapeCommand);
scrapeDaysInput.addEventListener('input', updateScrapeCommand);

// Open admin modal
adminBtn.addEventListener('click', () => {
    adminModal.style.display = 'flex';
    loadCollectionStats();
});

// Close admin modal
closeAdminModal.addEventListener('click', () => {
    adminModal.style.display = 'none';
});

// Copy command to clipboard
copyCommandBtn.addEventListener('click', async () => {
    const command = scrapeCommandEl.textContent;
    try {
        await navigator.clipboard.writeText(command);
        copyCommandBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyCommandBtn.textContent = 'Copy';
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = command;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        copyCommandBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyCommandBtn.textContent = 'Copy';
        }, 2000);
    }
});

// Load collection stats
async function loadCollectionStats() {
    try {
        const response = await fetch('collected-puzzles.json');
        if (!response.ok) {
            throw new Error('File not found');
        }
        const data = await response.json();
        
        const dates = data.puzzles.map(p => p.date).filter(Boolean);
        const uniqueDates = [...new Set(dates)];
        
        collectionStatsEl.innerHTML = `
            <p><strong>Total Puzzles:</strong> ${data.count || 0}</p>
            <p><strong>Unique Dates:</strong> ${uniqueDates.length}</p>
            <p><strong>Last Updated:</strong> ${new Date(data.collected).toLocaleString()}</p>
            <p><strong>Date Range:</strong></p>
            <p style="margin-left: 20px;">Oldest: ${dates[dates.length - 1] || 'N/A'}</p>
            <p style="margin-left: 20px;">Newest: ${dates[0] || 'N/A'}</p>
        `;
    } catch (error) {
        collectionStatsEl.innerHTML = `
            <p style="color: #ff9999;">No collected-puzzles.json found</p>
            <p style="font-size: 13px; margin-top: 8px;">Run the scraper to collect puzzles from raddle.quest</p>
        `;
    }
}

// Show import instructions
showImportBtn.addEventListener('click', () => {
    const instructions = `
To import collected puzzles:

1. Open collected-puzzles.json
2. Copy the puzzles array
3. Open script.js
4. Replace or extend the PUZZLES array with the collected data
5. Rebuild the container:
   podman stop chanjinxamagig && podman rm chanjinxamagig && \\
   podman build -t chanjinxamagig . && \\
   podman run -d -p 3992:80 --name chanjinxamagig chanjinxamagig
    `.trim();
    
    alert(instructions);
});

// Export Database as JSON
const exportDbBtn = document.getElementById('export-db-btn');
if (exportDbBtn) {
    exportDbBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('collected-puzzles.json');
            const data = await response.json();
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cat-climber-puzzles-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            exportDbBtn.textContent = '✓ Exported!';
            setTimeout(() => {
                exportDbBtn.textContent = '📥 Export Database (JSON)';
            }, 2000);
        } catch (error) {
            alert('Error exporting database: ' + error.message);
        }
    });
}

// Export Database as CSV
const exportCsvBtn = document.getElementById('export-csv-btn');
if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('collected-puzzles.json');
            const data = await response.json();
            
            // Create CSV header
            let csv = 'Date,Start,End,Theme,Solution,Steps,Clue Count,Source\n';
            
            // Add each puzzle
            data.puzzles.forEach(p => {
                const solution = (p.solution || []).join(' → ');
                const clueCount = (p.clues || []).length;
                const source = p.custom ? 'Custom' : 'Scraped';
                const theme = (p.theme || '').replace(/,/g, ';'); // Escape commas
                
                csv += `"${p.date}","${p.start}","${p.end}","${theme}","${solution}",${p.solution.length},${clueCount},${source}\n`;
            });
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cat-climber-puzzles-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            exportCsvBtn.textContent = '✓ Exported!';
            setTimeout(() => {
                exportCsvBtn.textContent = '📊 Export as CSV';
            }, 2000);
        } catch (error) {
            alert('Error exporting CSV: ' + error.message);
        }
    });
}

// Import Database
const importFileInput = document.getElementById('import-file-input');
if (importFileInput) {
    importFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            if (!importedData.puzzles || !Array.isArray(importedData.puzzles)) {
                throw new Error('Invalid file format. Expected {puzzles: [...]} structure.');
            }
            
            // Fetch current database
            const response = await fetch('collected-puzzles.json');
            const currentData = await response.json();
            
            // Merge puzzles (avoid duplicates by date+start+end)
            const existingKeys = new Set(
                currentData.puzzles.map(p => `${p.date}-${p.start}-${p.end}`)
            );
            
            const newPuzzles = importedData.puzzles.filter(p => {
                const key = `${p.date}-${p.start}-${p.end}`;
                return !existingKeys.has(key);
            });
            
            if (newPuzzles.length === 0) {
                alert('No new puzzles to import. All puzzles already exist.');
                importFileInput.value = '';
                return;
            }
            
            // Show merge results
            const confirmMsg = `Found ${newPuzzles.length} new puzzle(s) to import.\n\n` +
                `Current database: ${currentData.count} puzzles\n` +
                `After import: ${currentData.count + newPuzzles.length} puzzles\n\n` +
                `Note: This only previews the merge. The actual database file is read-only.\n` +
                `To permanently add these puzzles, you need to update the collected-puzzles.json file on the server.`;
            
            alert(confirmMsg);
            
            // Generate merged JSON for download
            const mergedData = {
                count: currentData.count + newPuzzles.length,
                collected: new Date().toISOString(),
                puzzles: [...newPuzzles, ...currentData.puzzles].sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                )
            };
            
            // Download merged file
            const blob = new Blob([JSON.stringify(mergedData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `merged-puzzles-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            alert('Error importing file: ' + error.message);
        }
        
        // Reset input
        importFileInput.value = '';
    });
}

// Hint Modal event listeners
hintOkBtn.addEventListener('click', confirmHintReveal);
hintCancelBtn.addEventListener('click', cancelHintReveal);

window.addEventListener('click', (e) => {
    if (e.target === hintModal) {
        hintModal.style.display = 'none';
    }
});

// How to Play Modal event listeners
helpBtn.addEventListener('click', () => {
    howToPlayModal.style.display = 'flex';
});

closeHowToPlay.addEventListener('click', () => {
    howToPlayModal.style.display = 'none';
});

// Stats Modal event listeners
statsBtn.addEventListener('click', displayStats);

closeStats.addEventListener('click', () => {
    statsModal.style.display = 'none';
});

resetStatsBtn.addEventListener('click', resetStats);

window.addEventListener('click', (e) => {
    if (e.target === statsModal) {
        statsModal.style.display = 'none';
    }
});

window.addEventListener('click', (e) => {
    if (e.target === howToPlayModal) {
        howToPlayModal.style.display = 'none';
    }
});

// Welcome Modal functions
function checkFirstVisit() {
    const hasVisited = localStorage.getItem('cat-climber-visited');
    if (!hasVisited) {
        // Show welcome modal on first visit
        setTimeout(() => {
            welcomeModal.style.display = 'flex';
        }, 500);
    }
}

function closeWelcomeModal() {
    const dontShow = dontShowWelcomeCheckbox.checked;
    if (dontShow) {
        localStorage.setItem('cat-climber-visited', 'true');
    }
    welcomeModal.style.display = 'none';
}

// Welcome Modal event listeners
startPlayingBtn.addEventListener('click', closeWelcomeModal);

closeWelcome.addEventListener('click', closeWelcomeModal);

window.addEventListener('click', (e) => {
    if (e.target === welcomeModal) {
        closeWelcomeModal();
    }
});

// Theme button event listener
themeBtn.addEventListener('click', cycleTheme);

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key to close welcome modal
    if (e.key === 'Escape' && welcomeModal.style.display === 'flex') {
        e.preventDefault();
        closeWelcomeModal();
        return;
    }
    
    // H key to open hint for currently focused input
    if (e.key === 'h' || e.key === 'H') {
        const focusedInput = document.activeElement;
        if (focusedInput && focusedInput.classList.contains('ladder-input')) {
            const index = parseInt(focusedInput.dataset.index);
            const hintBtn = focusedInput.parentElement.querySelector('.hint-btn');
            if (hintBtn) {
                e.preventDefault();
                showClueHint(index);
            }
        }
    }
});

// Hint modal keyboard shortcuts
hintModal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
        cancelHintReveal();
    } else if (e.key === 'Enter' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        confirmHintReveal();
    }
});

// Start the game
(async () => {
    await initGame();
})();
