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
        await page.screenshot({ path: 'docs/images/raddle-screenshot.png' });
        console.log('Screenshot saved to docs/images/raddle-screenshot.png');
        
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
        
        // Try to click "Show full ladder" button using proper Puppeteer methods
        try {
            console.log('  Looking for reveal button...');
            
            // Method 1: Try to find button by text content using XPath
            const buttons = await page.$x("//button[contains(text(), 'Show full ladder')] | //a[contains(text(), 'Show full ladder')] | //div[contains(text(), 'Show full ladder')]");
            
            if (buttons.length > 0) {
                console.log(`  Found ${buttons.length} potential reveal buttons`);
                await buttons[0].click();
                console.log('  Clicked reveal button, waiting for solution...');
                await new Promise(resolve => setTimeout(resolve, 4000));
            } else {
                console.log('  No "Show full ladder" button found, trying alternate methods...');
                
                // Method 2: Try clicking any element with relevant text
                const clicked = await page.evaluate(() => {
                    const elements = Array.from(document.querySelectorAll('*'));
                    for (const el of elements) {
                        const text = el.textContent;
                        if (text && (text.includes('Show full ladder') || text.includes('Reveal answer'))) {
                            // Try to find the clickable parent
                            let clickable = el;
                            while (clickable && clickable.tagName !== 'BUTTON' && clickable.tagName !== 'A') {
                                clickable = clickable.parentElement;
                                if (!clickable) clickable = el;
                            }
                            clickable.click();
                            return true;
                        }
                    }
                    return false;
                });
                
                if (clicked) {
                    console.log('  Clicked via fallback method, waiting...');
                    await new Promise(resolve => setTimeout(resolve, 4000));
                } else {
                    console.log('  Could not find any reveal button');
                }
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
            
            // Extract solution ladder - comprehensive extraction
            const inputs = Array.from(document.querySelectorAll('input[type="text"], input:not([type])'));
            const solutionWords = [];
            
            // Method 1: Extract from input values
            inputs.forEach(input => {
                const value = input.value.trim().toUpperCase();
                if (value && value.length >= 2 && /^[A-Z\s']+$/.test(value)) {
                    solutionWords.push(value);
                }
            });
            
            // Method 2: Extract from input placeholders (revealed state)
            if (solutionWords.length < 2) {
                inputs.forEach(input => {
                    const placeholder = input.placeholder?.trim().toUpperCase();
                    if (placeholder && placeholder.length >= 2 && /^[A-Z\s']+$/.test(placeholder)) {
                        solutionWords.push(placeholder);
                    }
                });
            }
            
            // Method 3: Look for divs/spans containing ladder words (revealed state)
            if (solutionWords.length < 2) {
                const allText = document.body.textContent;
                // Find the ladder section (between start and end words with other words in between)
                if (data.start && data.end) {
                    // Look for pattern: START WORD1 WORD2 ... END
                    const escapedStart = data.start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const escapedEnd = data.end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const ladderPattern = new RegExp(
                        escapedStart + '\\s+([A-Z][A-Z\\s\']*?)\\s+' + escapedEnd,
                        'gi'
                    );
                    const matches = allText.match(ladderPattern);
                    if (matches && matches[0]) {
                        // Extract words from the match
                        const words = matches[0]
                            .split(/\s+/)
                            .map(w => w.trim().toUpperCase())
                            .filter(w => w.length >= 2 && /^[A-Z\s']+$/.test(w));
                        
                        if (words.length >= 2) {
                            solutionWords.push(...words);
                        }
                    }
                }
            }
            
            // Method 4: Extract from any visible text elements that look like ladder words
            if (solutionWords.length < 2) {
                const elements = Array.from(document.querySelectorAll('div, span, p'));
                elements.forEach(el => {
                    const text = el.textContent?.trim().toUpperCase();
                    if (text && 
                        text.length >= data.start?.length && 
                        text.length <= (data.start?.length || 0) + 5 &&
                        /^[A-Z\s']+$/.test(text) &&
                        text !== data.start && 
                        text !== data.end) {
                        // Check if it's a single word (not a sentence)
                        if (!text.includes('.') && !text.includes(',') && text.split(/\s+/).length <= 3) {
                            solutionWords.push(text);
                        }
                    }
                });
            }
            
            // Clean up and deduplicate
            if (solutionWords.length >= 2) {
                // Remove duplicates while preserving order
                const seen = new Set();
                data.solution = solutionWords.filter(word => {
                    if (seen.has(word)) return false;
                    seen.add(word);
                    return true;
                });
            } else {
                // Create empty solution array with proper length from ladder indicator
                const lengthMatch = fullText.match(/\((\d+)\)/);
                if (lengthMatch) {
                    const steps = parseInt(lengthMatch[1]);
                    data.solution = new Array(steps + 1).fill('');
                    if (data.start) data.solution[0] = data.start;
                    if (data.end) data.solution[steps] = data.end;
                } else {
                    data.solution = [];
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
