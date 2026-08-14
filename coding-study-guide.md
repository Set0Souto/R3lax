# Coding Study Guide for R3Lax Web App

Welcome! This project is a great way to learn the three main parts of web development:

- **HTML**: creates the structure
- **CSS**: changes the look and feel
- **JavaScript**: makes things interactive and stores user preferences

## Project Overview: R3Lax

R3Lax is a relaxation and productivity app with multiple pages and features:

- **Home page** ([index.html](index.html)): Shows the main landing page with links to all features
- **Pomodoro timer** ([pomodoro.html](pomodoro.html)): A focused work timer with lap tracking
- **Music player** ([music.html](music.html)): Stream relaxing background music
- **Chat** ([chat.html](chat.html)): Connect with others studying
- **Settings** ([settings.html](settings.html)): Customize themes, wallpapers, sounds, and more

All pages share the same navigation sidebar and use the same [script.js](script.js) and [style.css](style.css) files.

---

## 1. The Navigation Sidebar

Every page has a sidebar menu and a toggle button in the top-left corner.

### HTML: The sidebar button
Found in each HTML file:

```html
<button id="sidebar-toggle">☰</button>
<nav>
    <a href="index.html">Home</a>
    <a href="pomodoro.html">Pomodoro</a>
    <a href="music.html">Music</a>
    <a href="chat.html">Chat</a>
    <a href="settings.html">Settings</a>
</nav>
```

- `button id="sidebar-toggle"` creates the menu button
- `nav` contains all the navigation links
- Each `<a>` is a clickable link to a different page

### CSS: Styling the sidebar
In [style.css](style.css):

```css
#sidebar-toggle {
    position: fixed;
    top: 30px;
    left: 100px;
    width: 64px;
    height: 48px;
    border-radius: var(--button-radius);
    background: var(--button-bg);
    cursor: pointer;
}

nav {
    position: relative;
    width: 220px;
    height: 100vh;
    background: var(--app-card);
    transition: transform 0.3s ease;
}
```

- `position: fixed` keeps the button in the same place when scrolling
- `width` and `height` control button size
- `transition: transform 0.3s ease` smoothly animates the sidebar sliding
- CSS variables like `--button-radius` allow settings to change the look

### JavaScript: Making it work
In [script.js](script.js):

```js
function setupSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle');
  const nav = document.querySelector('nav');
  
  toggle.addEventListener('click', function() {
    nav.classList.toggle('closed');
  });
}
```

- `getElementById('sidebar-toggle')` finds the button
- `querySelector('nav')` finds the sidebar
- `addEventListener('click', ...)` runs code when clicked
- `classList.toggle('closed')` adds or removes the "closed" class to hide/show the sidebar

---

## 2. Settings: How User Choices Are Saved

The app remembers user preferences using browser storage. This is one of the most important features!

### The Settings Object (JavaScript)
At the top of [script.js](script.js):

```js
const appDefaults = {
  sound: 'click',
  soundEnabled: true,
  theme: 'dark',
  wallpaper: 'default',
  buttonShape: 'rounded',
  musicVolume: 0.7,
};

let appSettings = { ...appDefaults };
```

This defines what settings exist and their default values.

### Loading Settings
```js
window.addEventListener('DOMContentLoaded', function() {
  appSettings = loadSettings();
  applyBackgroundTheme(appSettings.theme);
  applyWallpaper(appSettings.wallpaper);
  applyButtonShape(appSettings.buttonShape);
  // ... more setup code
});
```

When the page loads, the app:
1. Loads saved settings from storage
2. Applies each setting to the page (theme, wallpaper, etc.)

### HTML: Settings Controls
In [settings.html](settings.html):

```html
<select id="theme-select">
    <option value="dark">Dark mode</option>
    <option value="blue">Blue gradient</option>
    <option value="warm">Warm glow</option>
</select>

<input type="checkbox" id="sound-enabled-checkbox">
Enable button sounds

<input type="range" id="volume-slider" min="0" max="1" step="0.1">
```

These controls let users choose their preferences.

### JavaScript: Saving Settings
```js
function updateSetting(key, value) {
  appSettings[key] = value;
  saveSettings();
  
  if (key === 'theme') {
    applyBackgroundTheme(value);
  }
  if (key === 'wallpaper') {
    applyWallpaper(value);
  }
}
```

When a user changes a setting:
1. Update the `appSettings` object
2. Save it to browser storage (via `saveSettings()`)
3. Immediately apply the change to the page

---

## 3. The Pomodoro Timer

The Pomodoro timer is found on [pomodoro.html](pomodoro.html).

### HTML: Timer controls
```html
<div class="timer-display" id="timer-display">25:00</div>
<button id="start-btn">Start</button>
<button id="pause-btn">Stop</button>
<button id="reset-btn">Reset</button>
<button id="add-lap-btn">Add Lap</button>
```

### JavaScript: Timer logic
```js
let totalSeconds = 25 * 60;
let timerInterval = null;

function startTimer() {
  if (timerInterval) return;
  timerInterval = setInterval(function() {
    totalSeconds--;
    updateDisplay();
    if (totalSeconds <= 0) {
      stopTimer();
    }
  }, 1000);
}

function updateDisplay() {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  document.getElementById('timer-display').textContent = 
    String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}
```

Key concepts:
- `setInterval(function, 1000)` runs code every 1000 milliseconds (1 second)
- `totalSeconds--` counts down
- `Math.floor()` converts decimals to whole numbers
- The display updates every second

---

## 4. The Music Player

Found on [music.html](music.html).

### HTML: Audio element
```html
<audio id="music-player"></audio>
<button id="play-pause-btn">Play</button>
<button id="next-btn">Next</button>
<button id="prev-btn">Previous</button>
<input type="range" id="volume-slider" min="0" max="1" step="0.01">
```

### JavaScript: Playing music
```js
const tracks = [
  { title: 'Beach Waves', artist: 'Pacific Coast Sounds', file: 'beach-waves.mp3' },
  { title: 'Night Rain', artist: 'MindMist', file: 'rain.mp3' }
];

function setTrack(index) {
  currentTrackIndex = index;
  const track = tracks[currentTrackIndex];
  audio.src = track.file;
  updateTrackInfo();
}

playPauseBtn.addEventListener('click', function() {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});
```

Key concepts:
- Arrays store multiple tracks
- `audio.play()` and `audio.pause()` control playback
- `audio.src` changes which file plays
- Event listeners respond to button clicks

---

## 5. Key JavaScript Concepts Used

### Event Listeners
```js
button.addEventListener('click', function() { /* code runs when clicked */ });
button.addEventListener('change', function() { /* code runs when changed */ });
input.addEventListener('input', function() { /* code runs while dragging */ });
```

### DOM Selection
```js
document.getElementById('button-id')      // Find by ID
document.querySelector('nav')              // Find by CSS selector
document.querySelectorAll('.button')       // Find multiple elements
```

### Local Storage (Saving Data)
```js
localStorage.setItem('key', value);        // Save data
localStorage.getItem('key');               // Load data
```

### CSS Classes
```js
element.classList.add('class-name');       // Add a class
element.classList.remove('class-name');    // Remove a class
element.classList.toggle('class-name');    // Toggle on/off
```

---

## 6. CSS Variables (The Theme System)

At the top of [style.css](style.css):

```css
:root {
    --app-bg: #1e2127;
    --app-text: #D4D4D4;
    --button-bg: #2b2f38;
    --accent-color: #7c87f7;
    --button-radius: 12px;
}
```

These variables are used throughout the CSS:
```css
body { background: var(--app-bg); }
button { background: var(--button-bg); }
```

JavaScript can change these to apply themes:
```js
document.documentElement.style.setProperty('--button-radius', '0px');
```

This is how changing the button shape setting works!

---

## 7. Practice Questions

1. What are the three main parts of web development?
2. How many pages does the R3Lax app have?
3. What does `addEventListener` do?
4. How are user settings saved in the app?
5. What does `classList.toggle()` do?
6. How does the Pomodoro timer count down?
7. What is a CSS variable and why use one?
8. What does `DOMContentLoaded` mean?
9. How do you find an HTML element in JavaScript?
10. What's the difference between `getElementById` and `querySelector`?

---

## 8. Small Coding Tasks to Try

1. **Change the default timer**: In [script.js](script.js), change `totalSeconds = 25 * 60` to a different number (like `10 * 60` for 10 minutes).

2. **Add a new theme color**: In [settings.html](settings.html), add a new option to the theme select box:
   ```html
   <option value="purple">Purple haze</option>
   ```
   Then in [script.js](script.js), add handling for the new theme.

3. **Change the sidebar width**: In [style.css](style.css), find `nav { width: 220px; }` and change it to a different number like `280px`.

4. **Add a new navigation link**: Add another `<a>` tag in the `<nav>` section pointing to a new page you create.

5. **Change button colors**: Update the `--button-bg` color in [style.css](style.css) `:root` section.

6. **Disable sound by default**: In [script.js](script.js), change `soundEnabled: true` to `soundEnabled: false` in `appDefaults`.

---

## 9. Next Steps to Learn More

- **Explore local storage**: Try using `localStorage` to save your own data
- **Learn about events**: Find all the different event types (click, hover, focus, etc.)
- **Understand animations**: Learn how CSS `transition` and JavaScript timing work together
- **Learn about arrays**: The music tracks use an array - explore how to add/remove items
- **Practice with APIs**: The chat feature could connect to a real messaging service
