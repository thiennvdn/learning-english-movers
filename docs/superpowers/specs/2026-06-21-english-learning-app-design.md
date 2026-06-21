# English Learning App — Movers+ for Kids
**Date:** 2026-06-21  
**Status:** Approved  

---

## Overview

A static web application for children learning English at the Cambridge Movers+ level. The app runs entirely in the browser, stores all data in `localStorage`, and is deployed on GitHub Pages (free, internet-accessible). No backend required.

**Target users:** Children (Movers level), single profile per device, parent views progress on the same device.  
**Devices:** Fully responsive — mobile, tablet, desktop.  
**Audio:** Web Speech API (TTS) — no audio files needed.

---

## Architecture

### Tech Stack
- **Pure static site:** HTML + CSS + JavaScript (ES Modules, no build step)
- **Storage:** `localStorage` keyed by `movers_<profileName>`
- **Audio:** Web Speech API (`SpeechSynthesis`)
- **Hosting:** GitHub Pages at `https://<username>.github.io/<repo>/`
- **Font:** Nunito (Google Fonts CDN)

### File Structure
```
/
├── index.html                  # Profile selection / welcome screen
├── app.html                    # Main app shell (all screens rendered here)
├── css/
│   ├── main.css                # Design system: colors, typography, spacing
│   ├── components.css          # Cards, buttons, badges, tabs
│   └── animations.css          # Confetti, shake, XP fly-up effects
├── js/
│   ├── app.js                  # Router, screen switching, state bootstrap
│   ├── data/
│   │   ├── vocabulary.js       # All Movers vocabulary by topic
│   │   ├── grammar.js          # Grammar exercises by point
│   │   └── listening.js        # Listening exercise scripts (TTS text)
│   ├── modules/
│   │   ├── vocabulary.js       # Flashcard, match, fill, spelling exercises
│   │   ├── writing.js          # Word order, sentence builder, copy+complete
│   │   ├── listening.js        # Listen+choose, listen+answer, dictation lite
│   │   ├── grammar.js          # Multiple choice, fill-in-blank, true/false
│   │   ├── daily.js            # Daily task generator and session tracker
│   │   └── progress.js         # XP, streak, badge, chart rendering
│   └── utils/
│       ├── storage.js          # localStorage get/set/clear helpers
│       ├── tts.js              # Web Speech API wrapper (speak, rate control)
│       └── gamification.js     # XP award logic, badge unlock logic
└── assets/
    ├── icons/                  # SVG UI icons
    └── sounds/                 # UI sound effects (correct ding, wrong buzz) — short base64 or tiny mp3
```

### Data Model (localStorage)
```json
{
  "movers_<name>": {
    "profile": { "name": "string", "avatar": "emoji", "level": 1, "totalXP": 0 },
    "streak": { "current": 0, "lastDate": "YYYY-MM-DD", "history": ["YYYY-MM-DD"] },
    "daily": {
      "date": "YYYY-MM-DD",
      "tasks": [...],
      "completedTasks": [...],
      "xpToday": 0
    },
    "progress": {
      "topics": {
        "animals": { "wordsLearned": [], "exercises": { "total": 0, "correct": 0 } }
      },
      "grammar": { "total": 0, "correct": 0 },
      "listening": { "total": 0, "correct": 0 },
      "writing": { "total": 0, "correct": 0 },
      "xpHistory": [{ "date": "YYYY-MM-DD", "xp": 0 }]
    },
    "badges": ["badge_id_1", "badge_id_2"]
  }
}
```

---

## Screens & Navigation

**Navigation:** Bottom tab bar (always visible) — 4 tabs: Home, Daily, Learn, Progress.  
On desktop: collapses into left sidebar.

### 1. index.html — Profile Screen
- List of saved profiles (name + avatar emoji)
- "Add new profile" button
- Click profile → load into `app.html`

### 2. Home Screen (`#home`)
- Greeting: "Hello, [Name]! 👋"
- Streak badge 🔥 + XP today + level chip
- **"Start Today's Lesson"** CTA button (large, prominent)
- Daily task completion status (e.g. "2/4 done today")
- Quick link to Learn screen

### 3. Daily Task Screen (`#daily`)
- Progress bar showing current position in the daily session
- Sequential modules: Vocabulary → Listening → Grammar → Writing
- Each module auto-advances when complete
- XP counter updates in real time
- End screen: total XP earned, badges unlocked, confetti animation

### 4. Learn Screen (`#learn`)
- 12 topic cards in a responsive grid
- Topics: Animals, Food, Sports, School, Family, Clothes, Places, Transport, Weather, Body, Colors, Numbers
- Each card shows: topic emoji, name, % completed
- Tap topic → topic detail screen with 4 module buttons (Vocabulary, Listening, Grammar, Writing)

### 5. Progress Screen (`#progress`)
- Streak calendar (current month, green = studied, grey = missed)
- 7-day XP bar chart (self-competition)
- Motivational message comparing today vs yesterday
- Badge collection grid (earned bright, locked greyed out)
- Per-topic completion percentages

### 6. Settings (`#settings`)
- Change name / avatar
- TTS speed (slow / normal / fast)
- Reset all data (with confirmation)

---

## Exercise Types

### Vocabulary Module
| Type | Description |
|---|---|
| Flashcard | Emoji + English word; TTS reads aloud; tap to flip for Vietnamese meaning |
| Match the word | Drag-and-drop (or tap-to-select) 4 word↔emoji pairs |
| Fill in the blank | TTS reads sentence with blank; type or choose missing word |
| Spelling | TTS reads word; player types it out letter by letter |

### Listening Module
| Type | Description |
|---|---|
| Listen & choose | TTS reads 1 description; choose correct emoji from 3 options |
| Listen & answer | TTS reads 3-4 sentence dialogue; answer multiple-choice question |
| Dictation lite | TTS reads short sentence; tap words in correct order |

### Writing Module
| Type | Description |
|---|---|
| Word order | Tap scrambled words to build the correct sentence |
| Sentence builder | Choose words from a word bank to complete a sentence |
| Copy & complete | See a model sentence; fill in the missing part |

### Grammar Module
Grammar points covered: present simple/continuous, past simple, comparatives, can/can't, there is/are, prepositions, articles.

| Type | Description |
|---|---|
| Multiple choice | Choose correct option from 3 |
| Fill in the blank | Type correct verb form / word |
| True / False | Read sentence, decide correct or not |

---

## Daily Task Generator

Runs at session start if `daily.date !== today`:

```
1. Find the 2 topics least recently practiced (from progress.topics)
2. Pull from those 2 topics:
   - 10 vocabulary words (5 from each topic)
   - 2 listening exercises (1 from each topic)
   - 1 grammar exercise (random grammar point)
   - 1 writing exercise (random type)
3. Estimate time: ~60 minutes total
4. If all topics fully completed → pick lowest-accuracy topics for review
5. Save generated task list to daily.tasks with today's date
```

---

## Gamification

### XP Awards
| Action | XP |
|---|---|
| Complete a flashcard | +2 |
| Correct answer (first try) | +10 |
| Correct answer (after retry) | +5 |
| Complete a module | +30 |
| Complete full Daily Task | +100 bonus |

**Levels:** Every 200 XP = +1 level  
Level names: Beginner (1) → Explorer (5) → Movers Star (10) → Champion (15)

### Streak
- At least 1 module completed per calendar day = streak maintained
- `streak.lastDate` checked on app open; if gap > 1 day, streak resets to 0

### Badges
| ID | Name | Condition |
|---|---|---|
| first_step | 🌟 First Step | Complete first daily lesson |
| on_fire_7 | 🔥 On Fire | 7-day streak |
| on_fire_30 | 🔥🔥 Unstoppable | 30-day streak |
| word_master | 📚 Word Master | Learn 100 vocabulary words |
| good_listener | 🎧 Good Listener | Complete 20 listening exercises |
| writer | ✍️ Writer | Complete 20 writing exercises |
| grammar_guru | 📝 Grammar Guru | Complete 20 grammar exercises |
| animals | 🦁 Animal Expert | 100% Animals topic |
| food | 🍎 Foodie | 100% Food topic |
| sports | ⚽ Sports Star | 100% Sports topic |
| *(one badge per topic, 12 total)* | | |

### Self-Competition
- 7-day XP bar chart on Progress screen
- Motivational message: "You earned 20 more XP than yesterday! 🎉" or "Keep going, you're almost at yesterday's score! 💪"

---

## Visual Design

### Color Palette
| Role | Color | Hex |
|---|---|---|
| Primary | Blue | `#4A90E2` |
| Secondary | Orange-yellow | `#FFB347` |
| Success | Green | `#5CB85C` |
| Error | Soft red | `#E74C3C` |
| Background | Cream white | `#FAFAF0` |
| Card bg | White | `#FFFFFF` |
| Text | Dark grey | `#333333` |

### Typography
- **Font:** Nunito (Google Fonts) — rounded, child-friendly
- Body: 18px minimum
- Headings: 24px+
- No ALL CAPS

### Icons & Images
- All topic illustrations: large emoji (48-64px font-size) — no image assets needed
- Each vocabulary word has an assigned emoji

### Feedback & Animations
- **Correct:** green highlight + confetti burst + "ding" sound + "Great! ⭐" text
- **Wrong:** red shake animation + "buzz" sound + reveal correct answer (no XP penalty)
- **Module complete:** 🎆 emoji animation + XP fly-up counter
- **Button interactions:** hover scale 1.05, click ripple

### Responsive Breakpoints
| Device | Layout |
|---|---|
| Mobile (<768px) | Bottom tab bar, single column, 18px font |
| Tablet (768–1024px) | Bottom tab bar, 2-column card grid |
| Desktop (>1024px) | Left sidebar nav, 3-column card grid, 20px font |

---

## Deployment

1. Initialize git repo: `git init`
2. Create GitHub repository (public)
3. Push code to `main` branch
4. Enable GitHub Pages: Settings → Pages → Source: `main` branch, `/ (root)`
5. App live at `https://<username>.github.io/<repo>/`

No CI/CD needed — every push to `main` auto-deploys via GitHub Pages.

---

## Content Data — Cambridge Movers Topics

12 topics, each with ~20 words:

| Topic | Example words |
|---|---|
| Animals | cat, dog, bird, fish, rabbit, elephant, giraffe, monkey, lion, snake... |
| Food | apple, bread, cake, egg, milk, rice, soup, pizza, burger, salad... |
| Sports | football, swimming, tennis, running, cycling, basketball, dancing, skiing... |
| School | book, pen, ruler, bag, teacher, class, desk, board, homework, test... |
| Family | mother, father, sister, brother, grandmother, grandfather, uncle, aunt... |
| Clothes | shirt, trousers, dress, shoes, hat, jacket, socks, skirt, boots, scarf... |
| Places | park, school, hospital, shop, restaurant, beach, mountain, zoo, library... |
| Transport | bus, car, train, plane, bike, boat, taxi, helicopter, scooter, truck... |
| Weather | sunny, rainy, cloudy, windy, snowy, hot, cold, storm, rainbow, fog... |
| Body | head, eyes, ears, nose, mouth, hand, arm, leg, foot, hair, teeth... |
| Colors | red, blue, green, yellow, orange, purple, pink, black, white, brown... |
| Numbers | one–twenty, first–tenth, hundred, thousand, half, quarter... |

---

## Constraints & Non-Goals

- **No backend, no database** — localStorage only
- **No user accounts / authentication** — profile is just a name + avatar
- **No social features** — no leaderboard vs other users
- **No paid content** — all content bundled in JS data files
- **No native app** — browser only (PWA manifest optional, not in scope for v1)
