const appDefaults = {
  sound: 'click',
  soundEnabled: true,
  theme: 'dark',
  wallpaper: 'default',
  buttonShape: 'rounded',
  musicVolume: 0.7,
  timerRingtone: 'ringtone-091',
};

const timerRingtoneLibrary = {
  'italian-brainrot-ringtone': 'italian-brainrot-ringtone.mp3',
  'mobile-ringtone': 'mobile-ringtone-542006.mp3',
  'phone-ringtone': 'phone-ringtone-439034.mp3',
  'ringtone-091': 'ringtone-091.mp3',
};

let appSettings = { ...appDefaults };
let totalSeconds = 25 * 60;
let timerInterval = null;
let lapCount = 0;
let timerDoneAudio = null;

function getTimerRingtoneSource(ringtoneName) {
  return timerRingtoneLibrary[ringtoneName] || timerRingtoneLibrary['ringtone-091'];
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', function() {
    appSettings = loadSettings();
    applyBackgroundTheme(appSettings.theme);
    applyWallpaper(appSettings.wallpaper);
    applyButtonShape(appSettings.buttonShape);
    setupSidebarToggle();
    setupTimer();
    setupSettings();
    setupMusicPlayer();
  });
}

if (typeof module !== 'undefined') {
  module.exports = {
    getTimerRingtoneSource,
  };
}

function setupSidebarToggle() {
  const toggle = document.getElementById('sidebar-toggle');
  const nav = document.querySelector('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function() {
    nav.classList.toggle('closed');
  });
}

function setupTimer() {
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const resetBtn = document.getElementById('reset-btn');
  if (!startBtn || !pauseBtn || !resetBtn) return;

  const addLapBtn = document.getElementById('add-lap-btn');
  const resetLapsBtn = document.getElementById('reset-laps-btn');

  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', stopTimer);
  resetBtn.addEventListener('click', resetTimer);

  if (addLapBtn) addLapBtn.addEventListener('click', addLap);
  if (resetLapsBtn) resetLapsBtn.addEventListener('click', resetLaps);

  updateDisplay();
}

function setupSettings() {
  const soundSelect = document.getElementById('sound-select');
  if (!soundSelect) return;

  const themeSelect = document.getElementById('theme-select');
  const wallpaperSelect = document.getElementById('wallpaper-select');
  const shapeSelect = document.getElementById('button-shape-select');
  const soundEnabledCheckbox = document.getElementById('sound-enabled-checkbox');
  const musicVolumeSlider = document.getElementById('music-volume-slider');
  const ringtoneSelect = document.getElementById('timer-ringtone-select');
  const previewButton = document.getElementById('preview-button');
  const settingsNotice = document.getElementById('settings-save-notice');

  soundSelect.value = appSettings.sound;
  if (themeSelect) themeSelect.value = appSettings.theme;
  if (wallpaperSelect) wallpaperSelect.value = appSettings.wallpaper;
  if (shapeSelect) shapeSelect.value = appSettings.buttonShape;
  if (ringtoneSelect) ringtoneSelect.value = appSettings.timerRingtone || 'ringtone-091';
  if (soundEnabledCheckbox) soundEnabledCheckbox.checked = appSettings.soundEnabled;
  if (musicVolumeSlider) {
    const savedMusicVolume = Number(appSettings.musicVolume);
    musicVolumeSlider.value = String(!Number.isNaN(savedMusicVolume) ? savedMusicVolume : 0.7);
  }

  if (settingsNotice) {
    settingsNotice.textContent = 'Your choices are saved automatically.';
  }

  soundSelect.addEventListener('change', function() {
    updateSetting('sound', this.value);
  });

  if (themeSelect) {
    themeSelect.addEventListener('change', function() {
      updateSetting('theme', this.value);
    });
  }

  if (wallpaperSelect) {
    wallpaperSelect.addEventListener('change', function() {
      updateSetting('wallpaper', this.value);
    });
  }

  if (shapeSelect) {
    shapeSelect.addEventListener('change', function() {
      updateSetting('buttonShape', this.value);
    });
  }

  if (ringtoneSelect) {
    ringtoneSelect.addEventListener('change', function() {
      updateSetting('timerRingtone', this.value);
    });
  }

  if (soundEnabledCheckbox) {
    soundEnabledCheckbox.addEventListener('change', function() {
      updateSetting('soundEnabled', this.checked);
    });
  }

  if (musicVolumeSlider) {
    musicVolumeSlider.addEventListener('input', function() {
      updateSetting('musicVolume', parseFloat(this.value));
    });
  }

  if (previewButton) {
    previewButton.addEventListener('click', function() {
      if (!appSettings.soundEnabled) {
        previewButton.textContent = 'Preview (Muted)';
        return;
      }

      previewButton.textContent = 'Playing...';
      playTimerPreview();
      setTimeout(function() {
        applySettingsPreview();
      }, 1200);
    });
  }

  applySettingsPreview();
}

function updateSetting(key, value) {
  appSettings[key] = value;
  saveSettings();

  if (key === 'theme') {
    applyBackgroundTheme(value);
  }

  if (key === 'wallpaper') {
    applyWallpaper(value);
  }

  if (key === 'buttonShape') {
    applyButtonShape(value);
  }

  if (key === 'musicVolume') {
    applyMusicVolumeSetting();
  }

  applySettingsPreview();
}

function setupMusicPlayer() {
  const bottomPlayerBar = document.querySelector('.bottom-player-bar');
  const isMusicPage = Boolean(document.querySelector('main.music-page'));

  const tracks = [
    {
      title: 'Beach Waves',
      artist: 'Pacific Coast Sounds',
      file: 'freesound_community-1-hour-waves-on-the-beach-pacific-coast-nayarit-mexico-25122.mp3'
    },
    {
      title: 'Night Rain & Thunder',
      artist: 'MindMist',
      file: 'mindmist-night-rain-with-distant-thunder-321446.mp3',
      loopEnabled: true,
      loopDuration: 60 * 60 * 1000 // play for 1 hour
    }
  ];

  let currentTrackIndex = 0;
  let loopTimerId = null;
  let loopRemainingMs = 0;
  let loopCountdownStart = 0;
  const audio = document.getElementById('music-player');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const stopBtn = document.getElementById('stop-btn');
  const playlist = document.getElementById('playlist');
  const trackTitle = document.getElementById('track-title');
  const trackArtist = document.getElementById('track-artist');
  const volumeSlider = document.getElementById('volume-slider');
  const currentTimeLabel = document.getElementById('current-time');
  const durationLabel = document.getElementById('track-duration');
  const trackProgress = document.getElementById('track-progress');

  if (!audio || !playPauseBtn || !prevBtn || !nextBtn || !stopBtn || !currentTimeLabel || !durationLabel || !trackProgress) return;

  const savedTrackIndex = Number(localStorage.getItem('relaxMusicTrackIndex'));
  if (!Number.isNaN(savedTrackIndex) && savedTrackIndex >= 0 && savedTrackIndex < tracks.length) {
    currentTrackIndex = savedTrackIndex;
  }
  const savedPlaying = localStorage.getItem('relaxMusicPlaying') === 'true';

  function setTrack(index) {
    if (index < 0 || index >= tracks.length) return;
    currentTrackIndex = index;
    const track = tracks[currentTrackIndex];
    audio.src = track.file;
    audio.loop = !!track.loopEnabled;
    audio.load();
    resetLoopCountdown(track);
    if (trackTitle) trackTitle.textContent = track.title;
    if (trackArtist) trackArtist.textContent = track.artist;
    updatePlaylistActive();
    updateControls();
    localStorage.setItem('relaxMusicTrackIndex', String(currentTrackIndex));
  }

  function showBottomBar() {
    if (bottomPlayerBar) {
      bottomPlayerBar.classList.remove('hidden');
    }
  }

  function hideBottomBar() {
    if (bottomPlayerBar) {
      bottomPlayerBar.classList.add('hidden');
    }
  }

  function resetLoopCountdown(track) {
    if (loopTimerId !== null) {
      clearTimeout(loopTimerId);
      loopTimerId = null;
    }
    loopRemainingMs = track && typeof track.loopDuration === 'number' ? track.loopDuration : 0;
    loopCountdownStart = 0;
  }

  function pauseLoopCountdown() {
    if (loopTimerId === null || loopCountdownStart === 0) return;
    clearTimeout(loopTimerId);
    loopTimerId = null;
    const elapsed = Date.now() - loopCountdownStart;
    loopRemainingMs = Math.max(0, loopRemainingMs - elapsed);
    loopCountdownStart = 0;
  }

  function startLoopCountdown() {
    if (loopTimerId !== null || loopRemainingMs <= 0) return;
    loopCountdownStart = Date.now();
    loopTimerId = setTimeout(function() {
      stopAudio();
      loopTimerId = null;
    }, loopRemainingMs);
  }

  function updatePlaylistActive() {
    if (!playlist) return;
    const items = playlist.querySelectorAll('.playlist-item');
    items.forEach(function(item, idx) {
      item.classList.toggle('active', idx === currentTrackIndex);
    });
  }

  function renderPlaylist() {
    if (!playlist) return;
    playlist.innerHTML = '';
    tracks.forEach(function(track, index) {
      const item = document.createElement('li');
      item.className = 'playlist-item';
      item.textContent = track.title + ' — ' + track.artist;
      item.tabIndex = 0;
      if (index === currentTrackIndex) {
        item.classList.add('active');
      }
      item.addEventListener('click', function() {
        setTrack(index);
        playAudio();
      });
      item.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setTrack(index);
          playAudio();
        }
      });
      playlist.appendChild(item);
    });
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '00:00';
    }
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  function updateTrackTime() {
    const current = audio.currentTime;
    const duration = audio.duration || 0;

    currentTimeLabel.textContent = formatTime(current);
    durationLabel.textContent = formatTime(duration);

    if (trackProgress && duration > 0) {
      trackProgress.value = String((current / duration) * 100);
    }
    localStorage.setItem('relaxMusicCurrentTime', String(current));
  }

  function updateControls() {
    playPauseBtn.textContent = audio.paused ? 'Play' : 'Pause';
  }

  function playAudio() {
    audio.play().catch(function(error) {
      console.warn('Unable to play audio:', error);
    });
    startLoopCountdown();
    localStorage.setItem('relaxMusicPlaying', 'true');
    showBottomBar();
  }

  function pauseAudio() {
    audio.pause();
    pauseLoopCountdown();
    localStorage.setItem('relaxMusicPlaying', 'false');
    if (!isMusicPage) {
      hideBottomBar();
    }
  }

  function stopAudio() {
    audio.pause();
    audio.currentTime = 0;
    updateControls();
    resetLoopCountdown(tracks[currentTrackIndex]);
    updateTrackTime();
    localStorage.setItem('relaxMusicPlaying', 'false');
    if (!isMusicPage) {
      hideBottomBar();
    }
  }

  function playNext() {
    setTrack((currentTrackIndex + 1) % tracks.length);
    playAudio();
  }

  function playPrevious() {
    setTrack((currentTrackIndex + tracks.length - 1) % tracks.length);
    playAudio();
  }

  prevBtn.addEventListener('click', function() {
    playPrevious();
    playClickSound();
  });

  nextBtn.addEventListener('click', function() {
    playNext();
    playClickSound();
  });

  stopBtn.addEventListener('click', function() {
    stopAudio();
    playClickSound();
  });

  playPauseBtn.addEventListener('click', function() {
    if (audio.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
    playClickSound();
    updateControls();
  });

  if (volumeSlider) {
    volumeSlider.addEventListener('input', function() {
      audio.volume = parseFloat(this.value);
      updateSetting('musicVolume', parseFloat(this.value));
    });
  }

  if (trackProgress) {
    trackProgress.addEventListener('input', function() {
      if (audio.duration > 0) {
        audio.currentTime = (parseFloat(this.value) / 100) * audio.duration;
        updateTrackTime();
      }
    });
  }
  const savedTime = Number(localStorage.getItem('relaxMusicCurrentTime'));
  if (Number.isFinite(savedTime) && savedTime > 0) {
    audio.currentTime = savedTime;
  }

  audio.addEventListener('timeupdate', updateTrackTime);
  audio.addEventListener('loadedmetadata', updateTrackTime);
  audio.addEventListener('play', updateControls);
  audio.addEventListener('pause', updateControls);
  audio.addEventListener('ended', function() {
    playNext();
  });

  if (bottomPlayerBar && !isMusicPage) {
    hideBottomBar();
  }

  if (playlist) {
    renderPlaylist();
  }
  setTrack(currentTrackIndex);
  const initialVolume = Number(appSettings.musicVolume);
  const normalizedVolume = !Number.isNaN(initialVolume) ? initialVolume : 0.7;
  volumeSlider.value = String(normalizedVolume);
  audio.volume = normalizedVolume;
}

function applyMusicVolumeSetting() {
  const audio = document.getElementById('music-player');
  const volumeSlider = document.getElementById('volume-slider');
  const volumeValue = typeof appSettings.musicVolume === 'number' ? appSettings.musicVolume : Number(appSettings.musicVolume) || 0.7;
  if (audio) audio.volume = volumeValue;
  if (volumeSlider) volumeSlider.value = String(volumeValue);
}

function saveSettings() {
  localStorage.setItem('relaxAppSettings', JSON.stringify(appSettings));
}

function loadSettings() {
  const saved = localStorage.getItem('relaxAppSettings');
  if (!saved) {
    return { ...appDefaults };
  }

  try {
    const parsed = JSON.parse(saved);
    const loaded = { ...appDefaults, ...parsed };
    const parsedVolume = Number(parsed.musicVolume);
    loaded.musicVolume = !Number.isNaN(parsedVolume) ? parsedVolume : appDefaults.musicVolume;
    return loaded;
  } catch (error) {
    console.warn('Unable to load saved settings:', error);
    return { ...appDefaults };
  }
}

function applyBackgroundTheme(theme) {
  const root = document.documentElement;
  const themes = {
    dark: {
      '--app-bg': '#1e2127',
      '--app-card': 'rgba(21, 23, 28, 0.92)',
      '--app-text': '#D4D4D4',
      '--button-bg': '#2b2f38',
      '--button-hover': '#3a3f4f',
      '--accent-color': '#7c87f7',
    },
    blue: {
      '--app-bg': 'linear-gradient(180deg, #091524 0%, #1f3d5a 100%)',
      '--app-card': 'rgba(18, 42, 70, 0.90)',
      '--app-text': '#e8eefb',
      '--button-bg': '#2f5b8b',
      '--button-hover': '#4e78af',
      '--accent-color': '#76c7ff',
    },
    warm: {
      '--app-bg': 'linear-gradient(180deg, #351c13 0%, #7e4b31 100%)',
      '--app-card': 'rgba(56, 30, 20, 0.95)',
      '--app-text': '#f3e7db',
      '--button-bg': '#8a5a3f',
      '--button-hover': '#af7a60',
      '--accent-color': '#ffbc7f',
    },
  };

  const themeValues = themes[theme] || themes.dark;
  Object.entries(themeValues).forEach(function([property, value]) {
    root.style.setProperty(property, value);
  });
}

function applyWallpaper(wallpaper) {
  const root = document.documentElement;
  const wallpapers = {
    none: 'none',
    default: 'none',
    'solid-red': 'linear-gradient(180deg, #550000 0%, #990000 100%)',
    'solid-blue': 'linear-gradient(180deg, #001f3f 0%, #003366 100%)',
    'solid-green': 'linear-gradient(180deg, #003300 0%, #006600 100%)',
    'pexels-bella-white-201200-635279': "url('pexels-bella-white-201200-635279.jpg')",
    'pexels-kienvirak-36928654': "url('pexels-kienvirak-36928654.jpg')",
    'pexels-oskar-gross-1074333632-34302403': "url('pexels-oskar-gross-1074333632-34302403.jpg')",
    'pexels-sebastian-189349': "url('pexels-sebastian-189349.jpg')",
  };

  const imageWallpapers = [
    'pexels-bella-white-201200-635279',
    'pexels-kienvirak-36928654',
    'pexels-oskar-gross-1074333632-34302403',
    'pexels-sebastian-189349',
  ];

  const topTextColor = imageWallpapers.includes(wallpaper) ? '#1d1d1d' : '#ffffff';
  const topSubtextColor = imageWallpapers.includes(wallpaper) ? '#3c3c3c' : '#f0f0f0';

  root.style.setProperty('--app-bg-image', wallpapers[wallpaper] || wallpapers.none);
  root.style.setProperty('--top-text', topTextColor);
  root.style.setProperty('--top-subtext', topSubtextColor);
}

function applyButtonShape(shape) {
  const root = document.documentElement;
  const radius = shape === 'sharp' ? '8px' : '24px';
  root.style.setProperty('--button-radius', radius);
}

function applySettingsPreview() {
  const previewButton = document.getElementById('preview-button');
  if (!previewButton) return;

  if (!appSettings.soundEnabled) {
    previewButton.textContent = 'Preview (Muted)';
  } else {
    const toneLabel = appSettings.timerRingtone || 'ringtone-091';
    previewButton.textContent = 'Preview ' + toneLabel.replace(/-/g, ' ');
  }
}

function playTimerPreview() {
  const ringtoneSource = getTimerRingtoneSource(appSettings.timerRingtone || 'ringtone-091');
  const previewAudio = new Audio(ringtoneSource);
  previewAudio.volume = 0.7;
  previewAudio.play().catch(function(error) {
    console.warn('Timer ringtone preview failed to play:', error);
  });
}

function playClickSound() {
  if (!appSettings.soundEnabled || appSettings.sound === 'none') {
    return;
  }

  if (appSettings.sound === 'beep') {
    playBeepSound();
    return;
  }

  const sound = new Audio('click.mp3');
  sound.play().catch(function(error) {
    console.warn('Sound failed to play:', error);
  });
}

function playBeepSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return;
  }

  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = 440;
  gainNode.gain.value = 0.16;

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.12);
}

function updateDisplay() {
  const display = document.getElementById('timer-display');
  if (!display) return;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  display.textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function ensureTimerNotification() {
  let notification = document.getElementById('timer-complete-notification');
  if (notification) return notification;

  notification = document.createElement('div');
  notification.id = 'timer-complete-notification';
  notification.className = 'timer-complete-notification hidden';
  notification.innerHTML = [
    '<div class="timer-complete-card">',
    '  <h2>Timer done</h2>',
    '  <p>Your timer is finished.</p>',
    '  <button type="button" class="timer-complete-dismiss">Dismiss</button>',
    '</div>'
  ].join('');

  const dismissButton = notification.querySelector('.timer-complete-dismiss');
  if (dismissButton) {
    dismissButton.addEventListener('click', function() {
      dismissTimerNotification();
    });
  }

  document.body.appendChild(notification);
  return notification;
}

function dismissTimerNotification() {
  const notification = document.getElementById('timer-complete-notification');
  if (notification) {
    notification.classList.add('hidden');
  }

  if (timerDoneAudio) {
    timerDoneAudio.pause();
    timerDoneAudio.currentTime = 0;
    timerDoneAudio = null;
  }
}

function showTimerNotification() {
  const notification = ensureTimerNotification();
  notification.classList.remove('hidden');

  if (!appSettings.soundEnabled) {
    return;
  }

  const ringtoneSource = getTimerRingtoneSource(appSettings.timerRingtone || 'ringtone-091');
  timerDoneAudio = new Audio(ringtoneSource);
  timerDoneAudio.loop = true;
  timerDoneAudio.volume = 0.8;
  timerDoneAudio.play().catch(function(error) {
    console.warn('Timer completion ringtone failed to play:', error);
  });
}

function startTimer() {
  playClickSound();
  if (timerInterval !== null) return;

  timerInterval = setInterval(function() {
    totalSeconds -= 1;
    updateDisplay();

    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      showTimerNotification();
    }
  }, 1000);
}

function stopTimer() {
  playClickSound();
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  playClickSound();
  dismissTimerNotification();
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  totalSeconds = 25 * 60;
  updateDisplay();
}

function addLap() {
  playClickSound();
  lapCount += 1;

  const lapCountElement = document.getElementById('lap-count');
  if (lapCountElement) {
    lapCountElement.textContent = lapCount;
  }

  const lapList = document.getElementById('lap-list');
  const timerDisplay = document.getElementById('timer-display');
  if (!lapList || !timerDisplay) return;

  const newLapItem = document.createElement('li');
  newLapItem.textContent = 'Lap ' + lapCount + ' - ' + timerDisplay.textContent;
  lapList.appendChild(newLapItem);
}

function resetLaps() {
  playClickSound();
  lapCount = 0;

  const lapCountElement = document.getElementById('lap-count');
  if (lapCountElement) {
    lapCountElement.textContent = lapCount;
  }

  const lapList = document.getElementById('lap-list');
  if (lapList) {
    lapList.innerHTML = '';
  }
}
