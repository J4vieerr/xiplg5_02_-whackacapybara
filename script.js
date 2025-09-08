let gameSettings = {
  playerName: 'Pemain',
  gameDuration: 30,
  difficulty: 'medium',
  soundEnabled: true,
  capybaraImage: 'capybara1'
};

const capybaraImages = {
  capybara1: "bakpao capybara.png",
  capybara2: "Hi capybara.png",
  capybara3: "sleep capybara.png",
  capybara4: "streching capybara.png"
};

let score = 0;
let level = 1;
let timeLeft = gameSettings.gameDuration;
let timer, moleTimer;
let gameRunning = false;
let gamePaused = false;

const grid = document.getElementById('grid');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const levelDisplay = document.getElementById('level');

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  createGrid();
  updatePlayerInfo();
});

function createGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const hole = document.createElement('div');
    hole.classList.add('hole');
    hole.dataset.index = i;

    const img = document.createElement('img');
    img.classList.add('mole');
    img.alt = 'Capybara';
    img.src = getCurrentCapybaraImage();
    hole.appendChild(img);
    grid.appendChild(hole);

    hole.addEventListener('click', () => handleHoleClick(hole, img));
  }
}

function getCurrentCapybaraImage() {
  return capybaraImages[gameSettings.capybaraImage];
}

function showRandomMole() {
  if (!gameRunning || gamePaused) return;

  const holes = document.querySelectorAll('.mole');
  holes.forEach(m => m.classList.remove('show'));

  const randomHole = holes[Math.floor(Math.random() * holes.length)];
  const isBomb = Math.random() < 0.2;

  if (isBomb) {
    randomHole.src = createBombImage();
    randomHole.dataset.type = 'bomb';
  } else {
    randomHole.src = getCurrentCapybaraImage();
    randomHole.dataset.type = 'capybara';
  }

  randomHole.classList.add('show');
  setTimeout(() => randomHole.classList.remove('show'), getDifficultyTimeout() + 500);
}

function createBombImage() {
  return 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="60" r="30" fill="#333"/>
      <text x="50" y="75" text-anchor="middle" font-size="20" fill="white">💣</text>
    </svg>
  `);
}

function handleHoleClick(hole, img) {
  if (!gameRunning || gamePaused || !img.classList.contains('show')) return;

  if (img.dataset.type === 'capybara') {
    score += 10;
    scoreDisplay.textContent = score;

    if (score > 0 && score % 50 === 0) {
      level++;
      levelDisplay.textContent = level;
    }

    img.classList.remove('show');
  } else if (img.dataset.type === 'bomb') {
    endGame(true);
  }
}

function startGame() {
  showPage('game');
  resetGame();
  gameRunning = true;

  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;
  levelDisplay.textContent = level;

  timer = setInterval(() => {
    if (!gamePaused) {
      timeLeft--;
      timeDisplay.textContent = timeLeft;
      if (timeLeft <= 0) endGame();
    }
  }, 1000);

  moleTimer = setInterval(showRandomMole, getDifficultyTimeout());
}

function resetGame() {
  score = 0;
  level = 1;
  timeLeft = gameSettings.gameDuration;
  clearTimers();
}

function clearTimers() {
  clearInterval(timer);
  clearInterval(moleTimer);
}

function pauseGame() {
  const pauseBtn = document.getElementById('pauseBtn');
  if (gamePaused) {
    gamePaused = false;
    pauseBtn.textContent = '⏸️ Pause';
    moleTimer = setInterval(showRandomMole, getDifficultyTimeout());
  } else {
    gamePaused = true;
    pauseBtn.textContent = '▶️ Resume';
    clearInterval(moleTimer);
  }
}

function endGame(hitBomb = false) {
  gameRunning = false;
  clearTimers();

  document.querySelectorAll('.mole').forEach(m => m.classList.remove('show'));

  saveScore(score);

  let message = hitBomb ? `💥 Kena Bom! Skor: ${score}` : `⏰ Waktu habis! Skor: ${score} | Level: ${level}`;
  alert(message);
  showHome();
}

function getDifficultyTimeout() {
  const map = { easy: 2000, medium: 1500, hard: 1000 };
  return map[gameSettings.difficulty] || 1500;
}

// Leaderboard
function saveScore(newScore) {
  let scores = JSON.parse(localStorage.getItem('capybaraScores')) || [];
  scores.push({ score: newScore, level, player: gameSettings.playerName, date: new Date().toLocaleDateString(), difficulty: gameSettings.difficulty });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10);
  localStorage.setItem('capybaraScores', JSON.stringify(scores));

  let history = JSON.parse(localStorage.getItem('capybaraHistory')) || [];
  history.unshift({ score: newScore, level, player: gameSettings.playerName, date: new Date().toLocaleString(), difficulty: gameSettings.difficulty });
  history = history.slice(0, 10);
  localStorage.setItem('capybaraHistory', JSON.stringify(history));

  updatePlayerInfo();
}

function showLeaderboard() {
  showPage('leaderboard');

  const scores = JSON.parse(localStorage.getItem('capybaraScores')) || [];
  const list = document.getElementById('scoreList');
  list.innerHTML = scores.length === 0
    ? '<li class="score-item"><span>Belum ada skor</span></li>'
    : scores.map((entry, i) => `
      <li class="score-item">
        <span class="rank">#${i + 1}</span>
        <div>
          <div><strong>${entry.player}</strong></div>
          <div>Skor: ${entry.score} | Level: ${entry.level}</div>
          <div><small>${entry.date} | ${entry.difficulty}</small></div>
        </div>
      </li>
    `).join('');

  const history = JSON.parse(localStorage.getItem('capybaraHistory')) || [];
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = history.length === 0
    ? '<li class="score-item"><span>Belum ada riwayat</span></li>'
    : history.map((entry, i) => `
      <li class="score-item">
        <span class="rank">${i + 1}</span>
        <div>
          <div><strong>${entry.player}</strong></div>
          <div>Skor: ${entry.score} | Level: ${entry.level}</div>
          <div><small>${entry.date} | ${entry.difficulty}</small></div>
        </div>
      </li>
    `).join('');
}

// Settings
function showSettings() {
  showPage('settings');
  document.getElementById('playerNameInput').value = gameSettings.playerName;
  document.getElementById('soundSetting').value = gameSettings.soundEnabled ? 'on' : 'off';
  document.getElementById('durationSetting').value = gameSettings.gameDuration;
  updatePresetSelection();
}

function saveSettings() {
  gameSettings.playerName = document.getElementById('playerNameInput').value || 'Pemain';
  gameSettings.soundEnabled = document.getElementById('soundSetting').value === 'on';
  gameSettings.gameDuration = parseInt(document.getElementById('durationSetting').value);
  localStorage.setItem('capybaraSettings', JSON.stringify(gameSettings));
  document.getElementById('playerName').textContent = gameSettings.playerName;
  updatePresetSelection();
  showSuccessPopup();
}

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem('capybaraSettings'));
  if (saved) gameSettings = saved;
  document.getElementById('playerNameInput').value = gameSettings.playerName;
  document.getElementById('playerName').textContent = gameSettings.playerName;
  document.getElementById('soundSetting').value = gameSettings.soundEnabled ? 'on' : 'off';
  document.getElementById('durationSetting').value = gameSettings.gameDuration;
  updatePresetSelection();
}

function resetSettings() {
  gameSettings = {
    playerName: 'Pemain',
    gameDuration: 30,
    difficulty: 'medium',
    soundEnabled: true,
    capybaraImage: 'capybara1'
  };
  localStorage.setItem('capybaraSettings', JSON.stringify(gameSettings));
  document.getElementById('playerNameInput').value = gameSettings.playerName;
  document.getElementById('playerName').textContent = gameSettings.playerName;
  document.getElementById('soundSetting').value = 'on';
  document.getElementById('durationSetting').value = 30;
  updatePresetSelection();
  showSuccessPopup();
}

function updatePresetSelection() {
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.querySelector(`[data-image="${gameSettings.capybaraImage}"]`);
  if (activeBtn) activeBtn.classList.add('active');
}

function selectPresetImage(key) {
  gameSettings.capybaraImage = key;
  updatePresetSelection();
}

function updatePlayerInfo() {
  document.getElementById('playerName').textContent = gameSettings.playerName;
  const scores = JSON.parse(localStorage.getItem('capybaraScores')) || [];
  document.getElementById('highScore').textContent = scores.length > 0 ? scores[0].score : 0;
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showHome() {
  showPage('home');
}

function showSuccessPopup() {
  const popup = document.getElementById('successPopup');
  popup.classList.add('show');
  setTimeout(() => popup.classList.remove('show'), 2000);
}

function clearLeaderboardConfirm() {
  document.getElementById('confirmPopup').classList.add('show');
}

function hideConfirmPopup() {
  document.getElementById('confirmPopup').classList.remove('show');
}

function confirmClearLeaderboard() {
  localStorage.removeItem('capybaraScores');
  localStorage.removeItem('capybaraHistory');
  hideConfirmPopup();
  showLeaderboard();
  document.getElementById('deleteSuccessPopup').classList.add('show');
  setTimeout(() => document.getElementById('deleteSuccessPopup').classList.remove('show'), 2000);
}
