#!/usr/bin/env node
/**
 * Built-in scheduler for daily puzzle fetching
 * Runs checks multiple times per day and ensures last 7 days of puzzles are present
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CHECK_TIMES = [2, 8, 14, 20]; // Check at 2am, 8am, 2pm, 8pm
const CHECK_INTERVAL = 15 * 60 * 1000; // Check every 15 minutes if we should run
const BACKFILL_DAYS = 7; // Keep last 7 days of puzzles
const STATE_FILE = path.join(__dirname, '../data/scheduler-state.json');

// State tracking
let state = {
    lastRun: null,
    lastCheckDate: null,
    checksToday: 0,
    consecutiveErrors: 0,
    totalRuns: 0,
    totalErrors: 0,
    backfillStatus: {}
};

// Load state from disk
function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const loaded = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
            state = { ...state, ...loaded };
            console.log(`[Scheduler] Loaded state: last run ${state.lastRun || 'never'}`);
        }
    } catch (err) {
        console.error('[Scheduler] Error loading state:', err.message);
    }
}

// Save state to disk
function saveState() {
    try {
        const dir = path.dirname(STATE_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (err) {
        console.error('[Scheduler] Error saving state:', err.message);
    }
}

// Get list of dates we should have puzzles for (last N days)
function getRequiredDates() {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < BACKFILL_DAYS; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
}

// Check which dates are missing from our collection
function getMissingDates() {
    try {
        // Determine collection path
        const isContainer = fs.existsSync('/usr/share/caddy/');
        const collectionPath = isContainer 
            ? '/usr/share/caddy/collected-puzzles.json'
            : path.join(__dirname, '../data/collected-puzzles.json');
        
        if (!fs.existsSync(collectionPath)) {
            console.log('[Scheduler] No collection found, all dates need fetching');
            return getRequiredDates();
        }
        
        const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
        const puzzleDates = new Set();
        
        if (collection.puzzles && Array.isArray(collection.puzzles)) {
            collection.puzzles.forEach(p => {
                if (p.date) {
                    const normalized = new Date(p.date).toISOString().split('T')[0];
                    puzzleDates.add(normalized);
                }
            });
        }
        
        const required = getRequiredDates();
        const missing = required.filter(date => !puzzleDates.has(date));
        
        return missing;
        
    } catch (err) {
        console.error('[Scheduler] Error checking missing dates:', err.message);
        return [];
    }
}

// Fetch puzzle for a specific date
async function fetchPuzzleForDate(dateStr) {
    const puppeteer = require('puppeteer');
    
    try {
        console.log(`[Scheduler] Fetching puzzle for ${dateStr}...`);
        
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        
        const [year, month, day] = dateStr.split('-');
        const url = `https://raddle.quest/${year}/${month}/${day}`;
        
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const puzzleData = await page.evaluate(() => {
            const data = {
                start: '',
                end: '',
                clues: [],
                solution: [],
                theme: '',
                date: '',
                url: window.location.href,
                source: 'scraped',
                scrapedDate: new Date().toISOString()
            };
            
            const fullText = document.body.textContent;
            
            // Extract start and end words
            const fromToMatch = fullText.match(/From\s+([A-Z][A-Z\s']+?)\s+to\s+([A-Z][A-Z\s']+?)(?=\s+[^A-Z]|\s*$)/);
            if (fromToMatch) {
                data.start = fromToMatch[1];
                data.end = fromToMatch[2];
            }
            
            // Extract date
            const dateMatch = fullText.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[^,]*,\s*\w+\s+\d+,\s*\d{4}/);
            if (dateMatch) data.date = dateMatch[0];
            
            // Extract theme
            const themeMatch = fullText.match(/Raddle #\d+\s+([^\n]+?)(?:\s+From|$)/);
            if (themeMatch) data.theme = themeMatch[1].trim();
            
            // Extract clues
            const cluesSection = fullText.match(/Clues, out of order\s+([\s\S]*?)(?=About this|$)/i);
            if (cluesSection && data.start) {
                const clueText = cluesSection[1];
                const clueLines = clueText.split(/\s{3,}/)
                    .map(line => line.trim().replace(/\s+/g, ' '))
                    .filter(line => {
                        return line.length > 20 && 
                               line.includes(data.start) &&
                               !line.match(/^(Switch to|About|Raddle)/i);
                    })
                    .map(line => line.replace(new RegExp(data.start, 'g'), '____'));
                data.clues = clueLines;
            }
            
            return data;
        });
        
        await browser.close();
        
        return puzzleData;
        
    } catch (err) {
        console.error(`[Scheduler] Error fetching puzzle for ${dateStr}:`, err.message);
        return null;
    }
}

// Add puzzle to collection
function addPuzzleToCollection(puzzleData) {
    try {
        const isContainer = fs.existsSync('/usr/share/caddy/');
        const collectionPath = isContainer 
            ? '/usr/share/caddy/collected-puzzles.json'
            : path.join(__dirname, '../data/collected-puzzles.json');
        
        let collection = { collected: new Date().toISOString(), count: 0, puzzles: [] };
        
        if (fs.existsSync(collectionPath)) {
            collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
        }
        
        // Check if puzzle already exists
        const exists = collection.puzzles.some(p => 
            p.start === puzzleData.start && p.end === puzzleData.end
        );
        
        if (exists) {
            console.log(`[Scheduler] Puzzle already exists: ${puzzleData.start} → ${puzzleData.end}`);
            return false;
        }
        
        // Add to collection
        collection.puzzles.unshift(puzzleData);
        collection.count = collection.puzzles.length;
        collection.collected = new Date().toISOString();
        
        // Save
        fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
        console.log(`[Scheduler] ✓ Added puzzle: ${puzzleData.start} → ${puzzleData.end}`);
        
        return true;
        
    } catch (err) {
        console.error('[Scheduler] Error adding puzzle to collection:', err.message);
        return false;
    }
}

// Run merge script
function runMerge() {
    try {
        console.log('[Scheduler] Running merge with custom puzzles...');
        const { execSync } = require('child_process');
        const mergeScript = path.join(__dirname, 'merge-puzzles.js');
        execSync(`node "${mergeScript}"`, { stdio: 'inherit' });
    } catch (err) {
        console.error('[Scheduler] Error running merge:', err.message);
    }
}

// Check if we should run the scraper
function shouldRun() {
    const now = new Date();
    const hour = now.getHours();
    const today = now.toISOString().split('T')[0];
    
    // Reset daily check counter if it's a new day
    if (state.lastCheckDate !== today) {
        state.checksToday = 0;
        state.lastCheckDate = today;
        saveState();
    }
    
    // Check if current hour matches one of our check times
    const isCheckTime = CHECK_TIMES.includes(hour);
    
    // Don't run if we've already done enough checks today
    const maxChecksPerDay = CHECK_TIMES.length;
    const needsRun = state.checksToday < maxChecksPerDay;
    
    return isCheckTime && needsRun;
}

// Run the backfill and today's puzzle
async function runScraper() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    console.log(`\n[Scheduler] Running puzzle check at ${now.toISOString()}`);
    console.log('='.repeat(60));
    
    try {
        // Check for missing dates in the last 7 days
        const missing = getMissingDates();
        
        if (missing.length > 0) {
            console.log(`[Scheduler] Found ${missing.length} missing dates: ${missing.join(', ')}`);
            
            let fetchedCount = 0;
            for (const dateStr of missing) {
                const puzzleData = await fetchPuzzleForDate(dateStr);
                
                if (puzzleData && puzzleData.start && puzzleData.end) {
                    const added = addPuzzleToCollection(puzzleData);
                    if (added) {
                        fetchedCount++;
                        state.backfillStatus[dateStr] = 'success';
                    }
                } else {
                    console.log(`[Scheduler] Could not fetch puzzle for ${dateStr}`);
                    state.backfillStatus[dateStr] = 'failed';
                }
                
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            if (fetchedCount > 0) {
                console.log(`[Scheduler] ✓ Backfilled ${fetchedCount} puzzles`);
                runMerge();
            }
        } else {
            console.log('[Scheduler] ✓ All required dates present in collection');
        }
        
        state.checksToday++;
        state.lastRun = now.toISOString();
        state.consecutiveErrors = 0;
        state.totalRuns++;
        
        saveState();
        
    } catch (err) {
        console.error('[Scheduler] Error running scraper:', err.message);
        state.consecutiveErrors++;
        state.totalErrors++;
        saveState();
    }
    
    console.log('='.repeat(60));
}

// Main scheduler loop
async function schedulerLoop() {
    if (shouldRun()) {
        await runScraper();
    }
    
    // Schedule next check
    setTimeout(schedulerLoop, CHECK_INTERVAL);
}

// Status report
function logStatus() {
    const now = new Date();
    const hour = now.getHours();
    const nextCheckHour = CHECK_TIMES.find(h => h > hour) || CHECK_TIMES[0];
    const hoursUntil = nextCheckHour > hour ? nextCheckHour - hour : (24 - hour + nextCheckHour);
    
    console.log(`[Scheduler] Status check at ${now.toLocaleTimeString()}`);
    console.log(`  Check times: ${CHECK_TIMES.map(h => `${h}:00`).join(', ')}`);
    console.log(`  Next check in ~${hoursUntil} hours (${nextCheckHour}:00)`);
    console.log(`  Checks today: ${state.checksToday}/${CHECK_TIMES.length}`);
    console.log(`  Last run: ${state.lastRun ? new Date(state.lastRun).toLocaleString() : 'never'}`);
    console.log(`  Total runs: ${state.totalRuns}, Errors: ${state.totalErrors}`);
    
    // Show missing dates if any
    const missing = getMissingDates();
    if (missing.length > 0) {
        console.log(`  ⚠️  Missing ${missing.length} dates from last ${BACKFILL_DAYS} days`);
    } else {
        console.log(`  ✓ All dates from last ${BACKFILL_DAYS} days present`);
    }
}

// Graceful shutdown
function shutdown() {
    console.log('\n[Scheduler] Shutting down...');
    saveState();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Main
console.log('='.repeat(60));
console.log('Cat Climber Daily Puzzle Scheduler');
console.log('='.repeat(60));
console.log(`Check times: ${CHECK_TIMES.map(h => `${h}:00`).join(', ')}`);
console.log(`Check interval: ${CHECK_INTERVAL / 1000 / 60} minutes`);
console.log(`Backfill window: Last ${BACKFILL_DAYS} days`);
console.log('='.repeat(60));

loadState();
logStatus();

// Log status every 2 hours
setInterval(logStatus, 2 * 60 * 60 * 1000);

// Start the scheduler
console.log('[Scheduler] Starting...\n');
schedulerLoop().catch(err => {
    console.error('[Scheduler] Fatal error:', err);
    process.exit(1);
});
