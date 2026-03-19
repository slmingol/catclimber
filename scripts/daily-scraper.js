#!/usr/bin/env node
// Daily puzzle scraper - runs automatically via cron to fetch today's puzzle

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function getTodaysPuzzle() {
    try {
        console.log(`[${new Date().toISOString()}] Starting daily puzzle scrape...`);
        
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        
        // Get today's date in YYYY/MM/DD format
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${year}/${month}/${day}`;
        
        const url = `https://raddle.quest/${dateStr}`;
        console.log(`Fetching ${url}...`);
        
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
                url: window.location.href
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
            
            // Extract "About this Raddle" note
            const noteMatch = fullText.match(/About this Raddle\s+([\s\S]*?)(?=About this theme|©|$)/i);
            if (noteMatch) {
                data.note = noteMatch[1].trim()
                    .replace(/\s+/g, ' ')
                    .replace(/^\s*\n+|\n+\s*$/g, '')
                    .substring(0, 1000); // Limit to 1000 chars
            }
            
            return data;
        });
        
        await browser.close();
        
        if (!puzzleData.start || !puzzleData.end) {
            console.log('No puzzle found for today');
            return null;
        }
        
        // Merge with existing collection
        // Use container path if running in container, else use local data directory
        const isContainer = fs.existsSync('/usr/share/caddy/');
        const collectionPath = isContainer 
            ? '/usr/share/caddy/collected-puzzles.json'
            : path.join(__dirname, '../data/collected-puzzles.json');
        
        console.log(`Using collection path: ${collectionPath}`);
        let collection = { collected: new Date().toISOString(), count: 0, puzzles: [] };
        
        if (fs.existsSync(collectionPath)) {
            collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
        }
        
        // Check if this puzzle already exists
        const exists = collection.puzzles.some(p => 
            p.start === puzzleData.start && p.end === puzzleData.end && p.date === puzzleData.date
        );
        
        if (exists) {
            console.log(`Puzzle already exists: ${puzzleData.start} → ${puzzleData.end}`);
            return null;
        }
        
        // Add to beginning of array (newest first)
        collection.puzzles.unshift(puzzleData);
        collection.count = collection.puzzles.length;
        collection.collected = new Date().toISOString();
        
        // Save
        fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
        console.log(`✓ Added puzzle: ${puzzleData.start} → ${puzzleData.end} (${puzzleData.clues.length} clues)`);
        console.log(`Total puzzles: ${collection.count}`);
        
        return puzzleData;
        
    } catch (error) {
        console.error('Error fetching daily puzzle:', error.message);
        return null;
    }
}

// Run if called directly
if (require.main === module) {
    getTodaysPuzzle().then((puzzleData) => {
        console.log('Daily scrape complete');
        
        // Merge with custom puzzles
        if (puzzleData) {
            console.log('Running merge with custom puzzles...');
            const { execSync } = require('child_process');
            try {
                const mergeScript = path.join(__dirname, 'merge-puzzles.js');
                execSync(`node "${mergeScript}"`, { cwd: __dirname, stdio: 'inherit' });
            } catch (err) {
                console.error('Warning: Merge script failed:', err.message);
            }
        }
        
        process.exit(0);
    }).catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
}

module.exports = { getTodaysPuzzle };
