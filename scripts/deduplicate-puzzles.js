#!/usr/bin/env node
// Deduplicate puzzles in collected-puzzles.json

const fs = require('fs');
const path = require('path');

const collectedPath = path.join(__dirname, '../data/collected-puzzles.json');
const data = JSON.parse(fs.readFileSync(collectedPath, 'utf8'));

console.log(`Starting with ${data.puzzles.length} puzzles`);

// Create a map to track unique puzzles by start+end+date
const uniqueMap = new Map();

data.puzzles.forEach(puzzle => {
    const key = `${puzzle.start}|${puzzle.end}|${puzzle.date}`;
    
    if (!uniqueMap.has(key)) {
        uniqueMap.set(key, puzzle);
    } else {
        // If duplicate, prefer custom over scraped
        const existing = uniqueMap.get(key);
        if (puzzle.source === 'custom' && existing.source === 'scraped') {
            uniqueMap.set(key, puzzle);
        }
        // If both custom or both scraped, keep the first one
    }
});

// Convert map back to array
data.puzzles = Array.from(uniqueMap.values());
data.count = data.puzzles.length;
data.collected = new Date().toISOString();

fs.writeFileSync(collectedPath, JSON.stringify(data, null, 2));

// Also copy to public
const publicPath = path.join(__dirname, '../public/collected-puzzles.json');
fs.writeFileSync(publicPath, JSON.stringify(data, null, 2));

console.log(`Deduplicated to ${data.puzzles.length} unique puzzles`);
console.log('✓ Saved to data/collected-puzzles.json');
console.log('✓ Copied to public/collected-puzzles.json');
