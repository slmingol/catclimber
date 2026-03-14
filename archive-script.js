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

async function loadPuzzles() {
    try {
        const response = await fetch('/collected-puzzles.json');
        const data = await response.json();
        allPuzzles = data.puzzles || [];
        
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
    
    // Group puzzles by date first, then by month for section headers
    const puzzlesByMonth = {};
    const puzzlesByDate = {};
    
    filteredPuzzles.forEach((puzzle, index) => {
        const date = new Date(puzzle.date);
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        const dateKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        if (!puzzlesByMonth[monthKey]) {
            puzzlesByMonth[monthKey] = [];
        }
        if (!puzzlesByDate[dateKey]) {
            puzzlesByDate[dateKey] = [];
        }
        
        puzzlesByMonth[monthKey].push(dateKey);
        puzzlesByDate[dateKey].push({ puzzle, index });
    });
    
    // Render with month and date headers
    let html = '';
    Object.keys(puzzlesByMonth).forEach(monthKey => {
        const uniqueDates = [...new Set(puzzlesByMonth[monthKey])];
        
        html += `
            <div class="month-section">
                <h2 class="month-header">${monthKey}</h2>
        `;
        
        uniqueDates.forEach(dateKey => {
            const puzzlesOnDate = puzzlesByDate[dateKey];
            
            html += `
                <div class="date-section">
                    <h3 class="date-header">${dateKey}</h3>
                    <div class="date-grid">
            `;
            
            puzzlesOnDate.forEach(({ puzzle, index }) => {
                const source = puzzle.source || 'scraped';
                const clueCount = puzzle.clues?.length || 0;
                const ladderLength = puzzle.solution?.length || 0;
                
                html += `
                    <div class="puzzle-card" onclick="openPuzzle(${index})">
                        <div class="puzzle-card-header">
                            <div class="puzzle-source ${source}">${source}</div>
                        </div>
                        <div class="puzzle-words">
                            <div class="puzzle-transform">
                                <span>${puzzle.start}</span>
                                <span class="puzzle-arrow">→</span>
                                <span>${puzzle.end}</span>
                            </div>
                        </div>
                        ${puzzle.theme ? `<div class="puzzle-theme">${puzzle.theme}</div>` : ''}
                        <div class="puzzle-stats">
                            ${clueCount > 0 ? `<div class="puzzle-stat">📝 ${clueCount} clues</div>` : ''}
                            ${ladderLength > 0 ? `<div class="puzzle-stat">🪜 ${ladderLength} steps</div>` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        html += `
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
    // Find the puzzle index in the original allPuzzles array
    const puzzle = filteredPuzzles[index];
    const originalIndex = allPuzzles.findIndex(p => 
        p.start === puzzle.start && 
        p.end === puzzle.end && 
        p.date === puzzle.date
    );
    
    // Redirect to main page with puzzle index
    window.location.href = `index.html?puzzle=${originalIndex}`;
}

// Event listeners for filters
document.getElementById('source-filter').addEventListener('change', applyFilters);
document.getElementById('sort-order').addEventListener('change', applyFilters);
document.getElementById('search-input').addEventListener('input', applyFilters);

// Load puzzles on page load
loadPuzzles();
