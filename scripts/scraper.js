// Raddle.quest puzzle scraper using puppeteer
// This will load the page with a headless browser and extract puzzle data

const https = require('https');

async function scrapeWithPuppeteer() {
    try {
        const puppeteer = require('puppeteer');
        
        console.log('Launching browser...');
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({ width: 1280, height: 800 });
        
        console.log('Loading raddle.quest...');
        await page.goto('https://raddle.quest', { 
            waitUntil: 'networkidle0', 
            timeout: 30000 
        });
        
        // Wait longer for SPA to fully render
        console.log('Waiting for content to load...');
        await page.waitForFunction(() => document.body.textContent.length > 1000, { timeout: 10000 });
        await new Promise(resolve => setTimeout(resolve, 3000)); // Additional wait
        
        // Take a screenshot for debugging
        await page.screenshot({ path: 'raddle-screenshot.png' });
        console.log('Screenshot saved to raddle-screenshot.png');
        
        // Get the full text content
        const fullText = await page.evaluate(() => document.body.textContent);
        console.log('\n=== Page Text Content (first 2000 chars) ===\n');
        console.log(fullText.substring(0, 2000));
        console.log('\n=== End Preview ===\n');
        
        // Extract puzzle data with better parsing
        const puzzleData = await page.evaluate(() => {
            const data = {
                start: '',
                end: '',
                clues: [],
                solution: [],
                theme: '',
                date: '',
                ladderLength: 0
            };
            
            const fullText = document.body.textContent;
            
            // Find "From WORD to WORD" pattern
            const fromToMatch = fullText.match(/From\s+([A-Z]{2,})\s+to\s+([A-Z]{2,})/);
            if (fromToMatch) {
                data.start = fromToMatch[1];
                data.end = fromToMatch[2];
            }
            
            // Extract date
            const dateMatch = fullText.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[^,]*,\s*\w+\s+\d+,\s*\d{4}/);
            if (dateMatch) data.date = dateMatch[0];
            
            // Extract theme from Raddle number
            const themeMatch = fullText.match(/Raddle #\d+\s+([^\n]+)/);
            if (themeMatch) data.theme = themeMatch[1].trim();
            
            // Count ladder steps from box patterns
            const boxMatches = fullText.match(/◻️+\s*\(\d+\)/g);
            if (boxMatches) {
                data.ladderLength = boxMatches.length;
                data.solution = boxMatches;
            }
            
            // Extract clues - they're in "Clues, out of order" section
            // The clues appear to have "MARTY" or the start word as placeholder
            const cluesMatch = fullText.match(/Clues, out of order\s+([\s\S]*?)(?=About this|$)/i);
            if (cluesMatch) {
                const clueText = cluesMatch[1];
                // Split by multiple spaces or the pattern that separates clues
                const clueLines = clueText.split(/\s{2,}/)
                    .map(line => line.trim())
                    .filter(line => {
                        return line.length > 20 && 
                               !line.match(/^(Clues|out of order|About|Switch to)/i) &&
                               line.includes(data.start); // Clues contain the start word
                    });
                data.clues = clueLines;
            }
            
            return data;
        });
        
        console.log('\n=== Extracted Puzzle Data ===');
        console.log(JSON.stringify(puzzleData, null, 2));
        
        await browser.close();
        return puzzleData;
        
    } catch (error) {
        console.error('Puppeteer error:', error.message);
        return null;
    }
}

async function scrapeArchive() {
    try {
        const puppeteer = require('puppeteer');
        
        console.log('Launching browser...');
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        console.log('Loading archive page...');
        await page.goto('https://raddle.quest/archive', { waitUntil: 'networkidle0', timeout: 30000 });
        
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for SPA to render
        
        // Extract archive links
        const links = await page.evaluate(() => {
            const anchors = document.querySelectorAll('a[href*="/202"]');
            return Array.from(anchors).map(a => ({
                url: a.href,
                text: a.textContent.trim()
            }));
        });
        
        console.log('Found archive links:', links.length);
        console.log(JSON.stringify(links.slice(0, 10), null, 2));
        
        await browser.close();
        return links;
        
    } catch (error) {
        console.error('Archive scrape error:', error.message);
        return null;
    }
}

async function scrapePuzzleByDate(dateStr) {
    try {
        const puppeteer = require('puppeteer');
        
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        
        const url = `https://raddle.quest/${dateStr}`;
        console.log(`\nScraping ${url}...`);
        
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Try to click "Show full ladder" or reveal button to get the solution
        try {
            console.log('  Looking for reveal button...');
            
            // Wait for and click the "Show full ladder" button
            const clicked = await page.evaluate(() => {
                // Find all buttons and links
                const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], span'));
                for (const el of elements) {
                    const text = el.textContent.toLowerCase();
                    if (text.includes('show full ladder') || 
                        text.includes('reveal') || 
                        text.includes('show answer') ||
                        text.includes('solution')) {
                        el.click();
                        return true;
                    }
                }
                return false;
            });
            
            if (clicked) {
                console.log('  Clicked reveal button, waiting for solution...');
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait longer for solution to appear
            } else {
                console.log('  No reveal button found');
            }
        } catch (e) {
            console.log(`  Error clicking reveal: ${e.message}`);
        }
        
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
            
            // Extract start and end words (allow spaces and apostrophes for multi-word phrases)
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
            
            // Extract solution ladder - look for filled inputs or revealed words
            // First try to find input elements with values
            const inputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])'));
            const solutionWords = [];
            
            inputs.forEach(input => {
                const value = input.value.trim().toUpperCase();
                if (value && value.length >= 2 && /^[A-Z\s']+$/.test(value)) {
                    solutionWords.push(value);
                }
            });
            
            // If we got solution words from inputs, use them
            if (solutionWords.length >= 2) {
                data.solution = solutionWords;
            } else {
                // Try to extract from page text - look for ladder structure
                // The ladder appears as words in sequence after clicking reveal
                const textContent = document.body.textContent;
                
                // Look for pattern like "WORD1 WORD2 WORD3" between start and end
                if (data.start && data.end) {
                    // Extract words that appear in ladder context
                    const ladderSection = textContent.match(new RegExp(
                        data.start + '[\\s\\S]{0,500}?' + data.end, 'i'
                    ));
                    
                    if (ladderSection) {
                        // Find all uppercase words in this section
                        const words = ladderSection[0].match(/\b[A-Z]{2,}[A-Z\s']*\b/g) || [];
                        const uniqueWords = [...new Set(words)].filter(w => 
                            w.length >= data.start.length && 
                            w !== 'BATTLE' || words.indexOf(w) === words.lastIndexOf(w) // Keep if not duplicate or is start/end
                        );
                        
                        if (uniqueWords.length >= 2) {
                            data.solution = uniqueWords;
                        }
                    }
                }
                
                // If still no solution, create empty array with proper length
                if (data.solution.length === 0) {
                    // Look for ladder length indicator like "(6)"
                    const lengthMatch = textContent.match(/\((\d+)\)/);
                    if (lengthMatch) {
                        const steps = parseInt(lengthMatch[1]);
                        data.solution = new Array(steps + 1).fill('');
                        if (data.start) data.solution[0] = data.start;
                        if (data.end) data.solution[steps] = data.end;
                    }
                }
            }
            
            // Extract clues - they contain the start word as placeholder
            const cluesSection = fullText.match(/Clues, out of order\s+([\s\S]*?)(?=About this|$)/i);
            if (cluesSection && data.start) {
                // The clues are separated by multiple spaces
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
        
        // Mark as scraped and add source
        puzzleData.source = 'scraped';
        
        await browser.close();
        return puzzleData;
        
    } catch (error) {
        console.error(`Error scraping ${dateStr}:`, error.message);
        return null;
    }
}

async function batchScrapePuzzles(startDate, numDays = 10) {
    const fs = require('fs');
    const puzzles = [];
    
    console.log(`\n=== Batch Scraping ${numDays} Puzzles ===\n`);
    console.log(`Starting from ${startDate}, stopping at 2025-02-25 (first puzzle date)\n`);
    
    const date = new Date(startDate);
    const stopDate = new Date('2025-02-25');
    
    for (let i = 0; i < numDays; i++) {
        // Safety check: stop if we've reached the earliest known puzzle date
        if (date < stopDate) {
            console.log(`\n⚠️  Reached earliest puzzle date (Feb 25, 2025). Stopping scraper.`);
            console.log(`   Scraped ${i} puzzles before reaching the limit.\n`);
            break;
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}/${month}/${day}`;
        
        const puzzle = await scrapePuzzleByDate(dateStr);
        if (puzzle && puzzle.start && puzzle.end) {
            puzzles.push(puzzle);
            const solStatus = puzzle.solution && puzzle.solution.length > 0 ? `✓ ${puzzle.solution.length} steps` : '✗ no solution';
            console.log(`✓ ${puzzle.start} → ${puzzle.end} (${puzzle.clues.length} clues, ${solStatus})`);
        } else {
            console.log(`✗ Failed to scrape ${dateStr}`);
        }
        
        // Move to previous day
        date.setDate(date.getDate() - 1);
        
        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Load existing puzzles and merge
    let existingPuzzles = [];
    if (fs.existsSync('collected-puzzles.json')) {
        try {
            const existingData = JSON.parse(fs.readFileSync('collected-puzzles.json', 'utf8'));
            existingPuzzles = existingData.puzzles || [];
            console.log(`\n📚 Found ${existingPuzzles.length} existing puzzles`);
        } catch (e) {
            console.log(`\n⚠️  Could not read existing puzzles: ${e.message}`);
        }
    }
    
    // Merge puzzles, avoiding duplicates
    const mergedPuzzles = [...existingPuzzles];
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const newPuzzle of puzzles) {
        const isDuplicate = existingPuzzles.some(p => 
            p.start === newPuzzle.start && 
            p.end === newPuzzle.end && 
            p.date === newPuzzle.date
        );
        
        if (!isDuplicate) {
            mergedPuzzles.push(newPuzzle);
            addedCount++;
        } else {
            skippedCount++;
        }
    }
    
    // Sort by date (newest first)
    mergedPuzzles.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(b.date) - new Date(a.date);
    });
    
    // Save merged data
    const output = {
        collected: new Date().toISOString(),
        count: mergedPuzzles.length,
        puzzles: mergedPuzzles
    };
    
    fs.writeFileSync('collected-puzzles.json', JSON.stringify(output, null, 2));
    console.log(`\n=== ✅ Merged Collection ===`);
    console.log(`Total puzzles: ${mergedPuzzles.length}`);
    console.log(`Added: ${addedCount} | Skipped duplicates: ${skippedCount}\n`);
    
    return puzzles;
}

// Check if puppeteer is installed
(async () => {
    try {
        require('puppeteer');
        console.log('Puppeteer is installed\n');
        
        // Check command line arguments
        const args = process.argv.slice(2);
        
        if (args[0] === 'batch') {
            // Batch mode: scrape multiple puzzles
            const numDays = parseInt(args[1]) || 10;
            const startDate = args[2] || '2026-03-13';
            await batchScrapePuzzles(startDate, numDays);
        } else {
            // Single puzzle mode
            const puzzle = await scrapeWithPuppeteer();
            if (puzzle && puzzle.start && puzzle.end) {
                console.log('\n✓ Successfully scraped puzzle');
                console.log(`  ${puzzle.start} → ${puzzle.end}`);
                console.log(`  ${puzzle.clues.length} clues extracted`);
                
                // Save single puzzle
                const fs = require('fs');
                fs.writeFileSync('puzzle.json', JSON.stringify(puzzle, null, 2));
                console.log('\nSaved to puzzle.json');
            }
        }
        
    } catch (error) {
        console.error('\nPuppeteer is not installed.');
        console.error('Install it with: npm install puppeteer');
    }
})();
