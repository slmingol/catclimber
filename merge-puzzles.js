#!/usr/bin/env node
/**
 * Merge custom and scraped puzzles intelligently
 * Priority: scraped puzzles override custom puzzles for the same date
 * Custom puzzles fill gaps in the scraped data
 */

const fs = require('fs');

function loadJSON(file) {
    if (!fs.existsSync(file)) {
        return { puzzles: [] };
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizeDate(dateStr) {
    // Convert to YYYY-MM-DD for easier comparison
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        return dateStr;
    }
    return date.toISOString().split('T')[0];
}

function main() {
    const scrapedData = loadJSON('collected-puzzles.json');
    const customData = loadJSON('custom-puzzles.json');
    
    console.log(`Loaded ${scrapedData.puzzles?.length || 0} scraped puzzles`);
    console.log(`Loaded ${customData.puzzles?.length || 0} custom puzzles`);
    
    // Create a map for quick lookups
   const puzzlesByDate = new Map();
    
    // Add custom puzzles first (lower priority)
    if (customData.puzzles) {
        customData.puzzles.forEach(puzzle => {
            const normalized = normalizeDate(puzzle.date);
            puzzlesByDate.set(normalized, {
                ...puzzle,
                source: 'custom'
            });
        });
    }
    
    // Add scraped puzzles (higher priority - will override customs)
    if (scrapedData.puzzles) {
        scrapedData.puzzles.forEach(puzzle => {
            const normalized = normalizeDate(puzzle.date);
            puzzlesByDate.set(normalized, {
                ...puzzle,
                source: puzzle.source || 'scraped'
            });
        });
    }
    
    // Convert back to array and sort by date
    const allPuzzles = Array.from(puzzlesByDate.values()).sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });
    
    const result = {
        count: allPuzzles.length,
        collected: new Date().toISOString(),
        puzzles: allPuzzles
    };
    
    fs.writeFileSync('collected-puzzles.json', JSON.stringify(result, null, 2));
    
    const scrapedCount = allPuzzles.filter(p => p.source === 'scraped' || !p.source).length;
    const customCount = allPuzzles.filter(p => p.source === 'custom').length;
    
    console.log(`\nMerge complete:`);
    console.log(`  Total puzzles: ${result.count}`);
    console.log(`  Scraped: ${scrapedCount}`);
    console.log(`  Custom: ${customCount}`);
    console.log(`  Saved to collected-puzzles.json`);
}

main();
