# CAT·CLIMBER - Word Ladder Puzzle Game

<p align="center">
  <img src="public/cat-climber-logo.png" alt="CAT·CLIMBER Logo" width="480">
</p>

![Version](https://img.shields.io/badge/Version-v1.1.131-blue?style=flat)
![Build](https://img.shields.io/github/actions/workflow/status/slmingol/cat-climber/docker-build.yml?branch=main&style=flat&label=Build)
![HTML5](https://img.shields.io/badge/HTML5-%23E34F26.svg?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-%231572B6.svg?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-%23F7DF1E.svg?style=flat&logo=javascript&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![Caddy](https://img.shields.io/badge/Caddy-%231F88C0.svg?style=flat&logo=caddy&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)

A word ladder puzzle game inspired by Raddle.quest where you transform one word into another by changing one letter at a time.

## 🎮 How to Play

1. **Start and End**: You're given a starting word and an ending word
2. **Transform**: Change one letter at a time to create new valid words
3. **Connect**: Each step must be a valid word that differs by exactly one letter from the previous word
4. **Use Clues**: Clues are provided out of order to help you find the path
5. **Win**: Successfully transform the start word into the end word!

## ✨ Features

- **16 Built-in Puzzles** with varying difficulty levels and themes
- **Shuffled Clues** to increase the challenge
- **Real-time Validation** checks if words differ by one letter
- **Visual Feedback** shows correct and incorrect entries
- **Keyboard Navigation** use arrow keys to move between inputs
- **Reveal Answer** option if you get stuck
- **Responsive Design** works on desktop and mobile

## 🎯 Example

```text
From SAVE to PLAN:
1. SAVE (start)
2. SAGE (change V to G)
3. PAGE (change S to P)
4. PALE (change G to L)
5. PALS (change E to S)
6. PLAN (change S to N - end!)
```

## 🚀 Getting Started

### Local Development

Simply open the `public/index.html` file in your web browser:

```bash
open public/index.html
```

Or use a local server:

```bash
cd public && python3 -m http.server 8000
# Then visit http://localhost:8000
```

### Docker Deployment

Run with Docker Compose (recommended):

```bash
docker-compose up -d
# Visit http://localhost:3992
```

Or run with Docker directly:

```bash
docker pull ghcr.io/slmingol/cat-climber:main
docker run -d -p 3992:80 ghcr.io/slmingol/cat-climber:main
```

Build locally:

```bash
docker build -t cat-climber .
docker run -d -p 3992:80 cat-climber
```

## � CI/CD and Versioning

### Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backwards compatible manner  
- **PATCH** version for backwards compatible bug fixes

Current version is tracked in the `VERSION` file.

### Automated Builds

GitHub Actions automatically builds and publishes Docker images when changes are pushed to `main`:

1. **On Push to Main**: Builds image and tags as `latest` and version from `VERSION` file
2. **On Version Tag**: Creates release-specific image tags (e.g., `v1.1.0`, `v1.1`, `v1`)

Docker images are published to GitHub Container Registry:
```bash
docker pull ghcr.io/slmingol/chanjinxamagig:latest
docker pull ghcr.io/slmingol/chanjinxamagig:v1.1.0
```

### Version Display

The application version is displayed in the lower right corner of the web UI (translucent, becomes more visible on hover).

### Releasing a New Version

1. Update `VERSION` file with new version number
2. Commit changes: `git commit -am "Bump version to X.Y.Z"`
3. Tag the release: `git tag v X.Y.Z`
4. Push with tags: `git push && git push --tags`
5. GitHub Actions will automatically build and publish

## �📁 Project Structure

```text
cat-climber/
├── .github/
│   └── workflows/
│       └── docker-build.yml     # Docker build & publish CI/CD
├── data/
│   ├── collected-puzzles.json   # Scraped puzzle database
│   └── custom-puzzles.json      # Custom puzzles
├── public/
│   ├── archive.html             # Archive page
│   ├── archive-script.js        # Archive logic
│   ├── archive-styles.css       # Archive styling
│   ├── cat-climber-logo.png     # Logo image
│   ├── index.html               # Main HTML structure
│   ├── script.js                # Game logic
│   └── styles.css               # Styling and animations
├── scripts/
│   ├── daily-scraper.js         # Automated puzzle collection
│   ├── merge-puzzles.js         # Puzzle merge utility
│   └── scraper.js               # Batch puzzle scraper
├── Caddyfile                    # Caddy web server config
├── Dockerfile                   # Docker container definition
├── docker-compose.yml           # Docker Compose configuration
├── package.json                 # Node.js dependencies
├── PUZZLE-MANAGEMENT.md         # Puzzle management guide
├── README.md                    # This file
└── VERSION                      # Semantic version tracking
```

## 🎨 Customization

### Adding New Puzzles

Edit the `PUZZLES` array in `public/script.js`:

```javascript
{
    start: "WORD",
    end: "GAME",
    solution: ["WORD", "WORE", "GORE", "GONE", "GAME"],
    clues: [
        "Hint for WORE",
        "Hint for GORE",
        "Hint for GONE",
        // ... etc
    ],
    theme: "Your Theme",
    date: "Today's Date"
}
```

## � Puzzle Scraper (Educational Purpose)

A web scraper is included for educational analysis of word ladder puzzles from raddle.quest. This tool is for **research and learning purposes only**.

### Setup

Install dependencies:

```bash
npm install puppeteer
```

### Usage

**Scrape a single puzzle:**

```bash
node scripts/scraper.js
```

This scrapes today's puzzle and saves it to `puzzle.json`.

**Batch scrape multiple puzzles:**

```bash
node scripts/scraper.js batch <number> <start-date>
```

Examples:

```bash
# Collect 10 puzzles starting from March 13, 2026
node scraper.js batch 10 2026-03-13

# Collect 200 puzzles (goes backwards in time)
node scraper.js batch 200 2026-03-13
```

Results are saved to `collected-puzzles.json`.

### How It Works

1. **Puppeteer** launches a headless Chrome browser
2. Navigates to the raddle.quest puzzle page for the specified date
3. Waits for the Single Page Application (SPA) to fully render
4. Extracts puzzle data from the DOM:
   - Start and end words from the "From X to Y" pattern
   - Theme from the Raddle number line
   - Date from the page header
   - Clues from the "Clues, out of order" section
5. Replaces the start word in clues with placeholders (`____`)
6. Saves structured JSON data with metadata

### Extracted Data Format

```json
{
  "start": "WORD",
  "end": "GAME",
  "clues": ["Clue with ____ placeholder", "..."],
  "theme": "Puzzle Theme",
  "date": "Day, Month DD, YYYY",
  "url": "https://raddle.quest/YYYY/MM/DD"
}
```

### Technical Details

- Uses Puppeteer for JavaScript rendering (SPA support)
- 2-second delay between requests (respectful scraping)
- Handles dynamic content with `networkidle0` wait strategy
- Parses text content using regex patterns
- Includes error handling for failed scrapes

### Limitations

- Does not extract solution paths (not revealed on the page)
- Some puzzles may fail to scrape due to page structure changes
- Requires active internet connection

**Note:** The scraped data is copyrighted by The Mystery League. This tool is provided for educational analysis only.

## �🛠️ Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling with gradients and animations
- **JavaScript** - Game logic and interactivity
- **No frameworks** - Pure vanilla JavaScript

## 🎯 Game Rules

1. Each word must be the same length as the start word
2. Each word must differ from the previous word by exactly ONE letter
3. All intermediate words must be valid English words
4. The first and last words are provided and cannot be changed

## 📝 Credits

Inspired by [Raddle.quest](https://raddle.quest) - A daily word ladder puzzle by The Mystery League

## 📄 License

MIT License - Feel free to use and modify as you wish!

---

Made with 💜 for word puzzle enthusiasts
