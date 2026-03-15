// Archive page JavaScript

// Theme Management (copied from main script)
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

// Initialize theme
setTheme(getThemePreference());

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getThemePreference() === 'system') {
        setTheme('system');
    }
});

// Theme button event
document.getElementById('theme-btn').addEventListener('click', cycleTheme);

// Archive functionality
let allPuzzles = [];
let filteredPuzzles = [];

// Theme slug to display name mapping
const THEME_MAP = {
    'oscars_2025': '2025 Best Picture nominees',
    'anniversary': 'Raddle\'s 1st Anniversary',
    'mystery_6': 'Mystery Theme #6',
    'winter_olympics': 'Winter Olympics',
    'groundhog': 'Groundhog Day',
    'wingspan': 'Wingspan Birds',
    'mlk': 'Martin Luther King, Jr.',
    'mit': 'MIT Mystery Hunt',
    'mystery_5': 'Mystery Theme #5',
    'guest_recs': 'Guest Recommendations',
    'raddle_300': 'Raddle 300',
    'hanukkah': 'Hanukkah',
    'board_games': 'Board Game Gift Guide',
    'mystery_4': 'Mystery Theme #4',
    'thanksgiving': 'Thanksgiving 2025',
    'x_to_y': 'X to Y',
    '7x7': '7x7',
    'block_party': 'Block Party',
    'halloween': 'Halloween Whodunit',
    'crime': 'Crime Fiction',
    'catan': 'Settlers of Catan',
    'noise': 'Make Some Noise',
    'midwest': 'Midwest Crossword Tournament',
    'mystery_2': 'Mystery Theme #2',
    'fall': 'Fall',
    'chicago': 'Chicago',
    'mystery_1': 'Mystery Theme #1',
    'horror': 'Horror Movie Villains',
    'stones': 'Rolling Stones',
    'ice_cream': 'Ice Cream',
    'shakespeare': 'Shakespearean Phrases',
    'dog_days': 'Dog Days of Summer',
    'emmy': 'Emmy Nominations 2025',
    'severance': 'Severance',
    'superman': 'Superman',
    'tour_de_france': 'Tour de France',
    '250_year': '250-Year-Old Creations',
    'summer_produce': 'Summer Produce',
    'juneteenth': 'Juneteenth',
    'daddle': 'Daddle',
    'pride': 'Pride Month',
    'eurovision': 'Eurovision',
    'memorial': 'Memorial Day',
    'clocktower': 'Blood on the Clocktower',
    'tony': 'Tony Nominations',
    'mothers': 'Mother\'s Day',
    'habemus': 'Habemus Papam',
    'paul': 'Paul Ruddle',
    'flowers': 'Flowers',
    'prince': 'Blue Prince',
    'passover': 'Passover',
    'bands': 'Some of My Favorite Bands',
    'big_ears': 'Big Ears 2025',
    'enigmarch': 'Enigmarch 2025',
    'first': 'My First Raddles',
    'oscars': 'Best Picture nominees'
};

function getThemeDisplayName(themeSlug) {
    if (!themeSlug) return 'Uncategorized';
    return THEME_MAP[themeSlug] || themeSlug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

async function loadPuzzles() {
    try {
        console.log('Loading puzzles...');
        const response = await fetch('/collected-puzzles.json');
        const data = await response.json();
        allPuzzles = data.puzzles || [];
        console.log(`Loaded ${allPuzzles.length} puzzles`);
        
        updateStats();
        applyFilters();
    } catch (error) {
        console.error('Error loading puzzles:', error);
        document.getElementById('loading').textContent = 'Error loading puzzles. Please refresh the page.';
    }
}

function updateStats() {
    const scrapedCount = allPuzzles.filter(p => p.source === 'scraped' || !p.source).length;
    const customCount = allPuzzles.filter(p => p.source === 'custom').length;
    
    document.getElementById('total-count').textContent = allPuzzles.length;
    document.getElementById('scraped-count').textContent = scrapedCount;
    document.getElementById('custom-count').textContent = customCount;
}

function applyFilters() {
    const sourceFilter = document.getElementById('source-filter').value;
    const sortOrder = document.getElementById('sort-order').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    // Apply source filter
    filteredPuzzles = allPuzzles.filter(puzzle => {
        if (sourceFilter === 'all') return true;
        if (sourceFilter === 'scraped') return puzzle.source === 'scraped' || !puzzle.source;
        if (sourceFilter === 'custom') return puzzle.source === 'custom';
        return true;
    });
    
    // Apply search filter
    if (searchTerm) {
        filteredPuzzles = filteredPuzzles.filter(puzzle => {
            return (
                puzzle.theme?.toLowerCase().includes(searchTerm) ||
                puzzle.start?.toLowerCase().includes(searchTerm) ||
                puzzle.end?.toLowerCase().includes(searchTerm) ||
                puzzle.date?.toLowerCase().includes(searchTerm)
            );
        });
    }
    
    // Apply sort order
    filteredPuzzles.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    renderPuzzles();
}

function renderPuzzles() {
    const grid = document.getElementById('archive-grid');
    const loading = document.getElementById('loading');
    const noResults = document.getElementById('no-results');
    
    loading.style.display = 'none';
    
    if (filteredPuzzles.length === 0) {
        grid.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    // Group puzzles by theme
    const puzzlesByTheme = {};
    filteredPuzzles.forEach((puzzle, index) => {
        const themeKey = getThemeDisplayName(puzzle.theme) || 'Uncategorized';
        if (!puzzlesByTheme[themeKey]) {
            puzzlesByTheme[themeKey] = [];
        }
        puzzlesByTheme[themeKey].push({ puzzle, index });
    });
    
    console.log('Themes found:', Object.keys(puzzlesByTheme));
    console.log('Puzzle counts by theme:', Object.fromEntries(
        Object.entries(puzzlesByTheme).map(([k, v]) => [k, v.length])
    ));
    
    // Define category order matching raddle.quest archive (all h2 headers)
    const categoryOrder = [
        '2025 Best Picture nominees',
        'Raddle\'s 1st Anniversary',
        'Mystery Theme #6',
        'Winter Olympics',
        'Groundhog Day',
        'Wingspan Birds',
        'Martin Luther King, Jr.',
        'MIT Mystery Hunt',
        'Mystery Theme #5',
        'Guest Recommendations',
        'Raddle 300',
        'Hanukkah',
        'Board Game Gift Guide',
        'Mystery Theme #4',
        'Thanksgiving 2025',
        'X to Y',
        '7x7',
        'Block Party',
        'Halloween Whodunit',
        'Crime Fiction',
        'Settlers of Catan',
        'Make Some Noise',
        'Midwest Crossword Tournament',
        'Mystery Theme #2',
        'Fall',
        'Chicago',
        'Mystery Theme #1',
        'Horror Movie Villains',
        'Rolling Stones',
        'Ice Cream',
        'Shakespearean Phrases',
        'Dog Days of Summer',
        'Emmy Nominations 2025',
        'Severance',
        'Superman',
        'Tour de France',
        '250-Year-Old Creations',
        'Summer Produce',
        'Juneteenth',
        'Daddle',
        'Pride Month',
        'Eurovision',
        'Memorial Day',
        'Blood on the Clocktower',
        'Tony Nominations',
        'Mother\'s Day',
        'Habemus Papam',
        'Paul Ruddle',
        'Flowers',
        'Blue Prince',
        'Passover',
        'Some of My Favorite Bands',
        'Big Ears 2025',
        'Enigmarch 2025',
        'My First Raddles',
        'Best Picture nominees',
        'Uncategorized'
    ];
    
    // Sort themes by predefined order, then alphabetically for any new themes
    const sortedThemes = Object.keys(puzzlesByTheme).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        
        // If both are in the order list, use that order
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }
        // If only A is in the list, it comes first
        if (indexA !== -1) return -1;
        // If only B is in the list, it comes first
        if (indexB !== -1) return 1;
        // Neither in list, sort alphabetically
        return a.localeCompare(b);
    });
    
    // Render with theme headers
    let html = '';
    sortedThemes.forEach(themeKey => {
        const puzzlesInTheme = puzzlesByTheme[themeKey];
        
        html += `
            <div class="month-section">
                <h2 class="month-header">${themeKey}</h2>
                <div class="puzzle-list">
        `;
        
        puzzlesInTheme.forEach(({ puzzle, index }) => {
            const source = puzzle.source || 'scraped';
            const clueCount = puzzle.clues?.length || 0;
            const ladderLength = puzzle.solution?.length || 0;
            const displayDate = puzzle.date || puzzle.scrapedDate || '';
            
            html += `
                <div class="puzzle-row" onclick="openPuzzle(${index})">
                    <div class="puzzle-date">${formatDate(displayDate)}</div>
                    <div class="puzzle-transform">
                        <span class="puzzle-start">${puzzle.start}</span>
                        <span class="puzzle-arrow">→</span>
                        <span class="puzzle-end">${puzzle.end}</span>
                    </div>
                    <div class="puzzle-meta">
                        ${clueCount > 0 ? `<span class="puzzle-stat">📝 ${clueCount}</span>` : ''}
                        ${ladderLength > 0 ? `<span class="puzzle-stat">🪜 ${ladderLength}</span>` : ''}
                        <span class="puzzle-source ${source}">${source}</span>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    grid.innerHTML = html;
}

function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return dateStr;
        }
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    } catch {
        return dateStr;
    }
}

function openPuzzle(index) {
    // Get the puzzle from filtered list
    const puzzle = filteredPuzzles[index];
    
    // Find the puzzle index in the original allPuzzles array
    const originalIndex = allPuzzles.findIndex(p => 
        p.start === puzzle.start && 
        p.end === puzzle.end && 
        (p.theme === puzzle.theme || (!p.theme && !puzzle.theme))
    );
    
    if (originalIndex === -1) {
        console.error('Could not find puzzle in original array');
        return;
    }
    
    // Redirect to main page with puzzle index
    window.location.href = `index.html?puzzle=${originalIndex}`;
}

// Event listeners for filters
document.getElementById('source-filter').addEventListener('change', applyFilters);
document.getElementById('sort-order').addEventListener('change', applyFilters);
document.getElementById('search-input').addEventListener('input', applyFilters);

// Load puzzles on page load
loadPuzzles();
