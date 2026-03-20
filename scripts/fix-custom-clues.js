#!/usr/bin/env node
// Fix custom puzzles to remove answer revelations from clues

const fs = require('fs');
const path = require('path');

const customPath = path.join(__dirname, '../data/custom-puzzles.json');
const data = JSON.parse(fs.readFileSync(customPath, 'utf8'));

data.puzzles.forEach(puzzle => {
    puzzle.clues = puzzle.clues.map((clue, index) => {
        // Replace "Change one letter in WORD" with "Change one letter in ^"
        // The ^ placeholder will be replaced by the game with the actual word or ____
        const prevWord = puzzle.solution[index];
        let fixed = clue.replace(new RegExp(`\\b${prevWord}\\b`, 'g'), '^');
        
        // Remove the "→ ANSWER" part if present
        fixed = fixed.replace(/\s*→\s*[A-Z]+\s*$/, '');
        
        return fixed;
    });
});

fs.writeFileSync(customPath, JSON.stringify(data, null, 2));
console.log('✓ Fixed custom puzzles - removed answer revelations from clues');
console.log(`Updated ${data.puzzles.length} puzzles`);
