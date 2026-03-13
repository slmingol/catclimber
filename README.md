# Chanjinxamagig - Word Ladder Puzzle Game

![Version](https://img.shields.io/badge/Version-v1.0.2-blue?style=flat)
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

- **6 Built-in Puzzles** with varying difficulty levels
- **Shuffled Clues** to increase the challenge
- **Real-time Validation** checks if words differ by one letter
- **Visual Feedback** shows correct and incorrect entries
- **Keyboard Navigation** use arrow keys to move between inputs
- **Reveal Answer** option if you get stuck
- **Responsive Design** works on desktop and mobile

## 🎯 Example

```
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

Simply open the `index.html` file in your web browser:

```bash
open index.html
```

Or use a local server:

```bash
python3 -m http.server 8000
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
docker pull ghcr.io/slmingol/chanjinxamagig:main
docker run -d -p 3992:80 ghcr.io/slmingol/chanjinxamagig:main
```

Build locally:

```bash
docker build -t chanjinxamagig .
docker run -d -p 3992:80 chanjinxamagig
```

## 📁 Project Structure

```
chanjinxamagig/
├── .github/
│   └── workflows/
│       ├── docker-publish.yml   # Docker build & publish CI/CD
│       └── version-bump.yml     # Auto versioning workflow
├── index.html                   # Main HTML structure
├── styles.css                   # Styling and animations
├── script.js                    # Game logic and puzzles
├── Dockerfile                   # Docker container definition
├── docker-compose.yml           # Docker Compose configuration
├── Caddyfile                    # Caddy web server config
├── .dockerignore               # Docker build exclusions
├── VERSION                      # Semantic version tracking
└── README.md                    # This file
```

## 🎨 Customization

### Adding New Puzzles

Edit the `PUZZLES` array in `script.js`:

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

## 🛠️ Technologies Used

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
