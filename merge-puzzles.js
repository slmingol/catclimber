#!/usr/bin/env node
/**
 * Merge local and upstream puzzles intelligently
 * Priority: upstream puzzles (raddle.quest) override local puzzles for the same date
 * Local puzzles fill gaps in the upstream data
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
    const upstreamData = loadJSON('collected-puzzles.json');
    const localData = loadJSON('custom-puzzles.json');
    
    console.log(`Loaded ${upstreamData.puzzles?.length || 0} upstream puzzles`);
    console.log(`Loaded ${localData.puzzles?.length || 0} local puzzles`);
    
    // Create a map for quick lookups
   const puzzlesByDate = new Map();
    
    // Add local puzzles first (lower priority)
    if (localData.puzzles) {
        localData.puzzles.forEach(puzzle => {
            const normalized = normalizeDate(puzzle.date);
            puzzlesByDate.set(normalized, {
                ...puzzle,
                source: 'local'
            });
        });
    }
    
    // Add upstream puzzles (higher priority - will override local)
    if (upstreamData.puzzles) {
        upstreamData.puzzles.forEach(puzzle => {
            const normalized = normalizeDate(puzzle.date);
            // Normalize old source values
            let source = puzzle.source || 'upstream';
            if (source === 'scraped') source = 'upstream';
            if (source === 'custom') source = 'local';
            
            puzzlesByDate.set(normalized, {
                ...puzzle,
                source: source
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
    
    const upstreamCount = allPuzzles.filter(p => p.source === 'upstream' || !p.source).length;
    const localCount = allPuzzles.filter(p => p.source === 'local').length;
    
    console.log(`\nMerge complete:`);
    console.log(`  Total puzzles: ${result.count}`);
    console.log(`  Upstream (raddle.quest): ${upstreamCount}`);
    console.log(`  Local (custom): ${localCount}`);
    console.log(`  Saved to collected-puzzles.json`);
}

main();
