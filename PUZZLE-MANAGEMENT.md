# Puzzle Management System

This project combines **upstream puzzles** from raddle.quest with **local puzzles** you create.

## Files

- `custom-puzzles.json` - Your handcrafted local puzzles (15 puzzles)
- `collected-puzzles.json` - Merged collection of upstream + local puzzles
- `merge-puzzles.js` - Intelligent merge script
- `daily-scraper.js` - Daily cron job that scrapes upstream and merges

## How It Works

1. **Priority System**: Upstream puzzles (raddle.quest) take priority over local puzzles for the same date
2. **Gap Filling**: Local puzzles fill dates where no upstream puzzle exists
3. **Automatic Merging**: Daily scraper runs merge automatically after adding new puzzles

## Current Status

- **Total puzzles**: 382
- **Upstream** (from raddle.quest): 378
- **Local** (your custom puzzles): 4 active (11 overridden by upstream data)

### Local Puzzles in Use

- March 11, 2026: MEAT → tACO (Food)
- March 14, 2026: BLUE → PINK (Colors)  
- March 15, 2026: MOON → STAR (Astronomy)
- March 16, 2026: FIRE → SAFE (Safety)

## Adding New Local Puzzles

1. **Edit `custom-puzzles.json`** - Add your puzzle to the `puzzles` array
2. **Run merge**: `node merge-puzzles.js`
3. **Rebuild container**: Standard deployment process

## Manual Merge

```bash
# Backup current collection
cp collected-puzzles.json collected-puzzles.json.backup

# Run merge
node merge-puzzles.js

# Result shows count breakdown
```

## Removing the Original 15 from script.js

The original 15 puzzles are still embedded in `script.js` (lines 57-283). You can safely remove them now since they're extracted to `custom-puzzles.json`. The game loads from `collected-puzzles.json`, not from the embedded array.

To clean up:
1. Remove the `const PUZZLES = [...]` array from script.js
2. The game already loads from fetch('/collected-puzzles.json')
