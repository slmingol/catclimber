# Puzzle Management System

This project combines **scraped puzzles** from raddle.quest with **custom puzzles** you create.

**For overlapping dates: BOTH puzzles are included!** Players can choose which variant to play.

## Files

- `custom-puzzles.json` - Your handcrafted custom puzzles (15 puzzles)
- `collected-puzzles.json` - Merged collection of scraped + custom puzzles
- `merge-puzzles.js` - Merge script (keeps both for duplicate dates)
- `daily-scraper.js` - Daily cron job that scrapes and merges

## How It Works

1. **No Override**: Both scraped and custom puzzles are kept for the same date
2. **Ordering**: Scraped puzzles appear first, followed by custom variants
3. **Automatic Merging**: Daily scraper runs merge automatically after adding new puzzles

## Current Status

- **Total puzzles**: 393
- **Scraped** (from raddle.quest): 378
- **Custom** (your puzzles): 15 active
- **Dates with both variants**: 6 dates have multiple puzzle options

### Dates with Multiple Variants

Dates where players can choose between scraped and custom puzzles.

- March 11, 2026: MEAT → tACO (Food)
- March 14, 2026: BLUE → PINK (Colors)  
- March 15, 2026: MOON → STAR (Astronomy)
- March 16, 2026: FIRE → SAFE (Safety)

## Adding New Custom Puzzles

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
