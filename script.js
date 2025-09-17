let score = 0, timeLeft = 60, timer, moleTimer, gameRunning = false;
let level = 1, gamePaused = false, hits = 0;

let gameSettings = {
  playerName: '',
  gameDuration: 60,
  soundEnabled: true,
  capybaraImage: 'capybara1'
};

const capybaraImages = {
  capybara1: "bakpao capybara.png",
  capybara2: "Hi capybara.png",
  capybara3: "sleep capybara.png",
  capybara4: "streching capybara.png"
};

const grid = document.getElementById('grid');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const levelDisplay = document.getElementById('level');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalScoreDisplay = document.getElementById('finalScore');
const finalLevelDisplay = document.getElementById('finalLevel');

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
    hole.appendChild(img);
    grid.appendChild(hole);

    hole.addEventListener('click', () => handleHoleClick(hole, img));
  }
}

function handleHoleClick(hole, img) {
  if (!gameRunning || gamePaused || !img.classList.contains('show')) return;

  if (img.dataset.type === 'capybara') {
    score += 10;
    hits++;
    scoreDisplay.textContent = score;

    if (hits % 5 === 0 && level < 5) {
      level++;
      levelDisplay.textContent = level;
    }

    img.classList.remove('show');
    if (gameSettings.soundEnabled) document.getElementById('hitSound').play();
  } else if (img.dataset.type === 'bomb') {
    if (gameSettings.soundEnabled) document.getElementById('bombSound').play();
    endGame(true);
  }
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

  setTimeout(() => randomHole.classList.remove('show'), getLevelTimeout() + 500);
}

function getCurrentCapybaraImage() {
  return capybaraImages[gameSettings.capybaraImage];
}

function createBombImage() {
  return 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="60" r="30" fill="#333"/>
      <text x="50" y="75" text-anchor="middle" font-size="20" fill="white">💣</text>
    </svg>
  `);
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

  moleTimer = setInterval(showRandomMole, getLevelTimeout());
}

function resetGame() {
  score = 0;
  level = 1;
  hits = 0;
  timeLeft = 60;
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
    moleTimer = setInterval(showRandomMole, getLevelTimeout());
  } else {
    gamePaused = true;
    pauseBtn.textContent = '▶️ Resume';
    clearInterval(moleTimer);
  }
}

function endGame(hitBomb = false, manualEnd = false) {
  gameRunning = false;
  clearTimers();

  document.querySelectorAll('.mole').forEach(m => m.classList.remove('show'));

  saveScore(score);

  let message;
  if (hitBomb) {
    message = '💥 Kena Bom!';
  } else if (manualEnd) {
    message = '🏁 Permainan Selesai!';
  } else {
    message = '⏰ Waktu Habis!';
  }

  gameOverMessage.innerHTML = message;
  finalScoreDisplay.textContent = score;
  finalLevelDisplay.textContent = level;
  showPage('gameOver');
}

function getLevelTimeout() {
  const timeouts = {
    1: 2000,
    2: 1500,
    3: 1200,
    4: 1000,
    5: 800
  };
  return timeouts[level] || 2000;
}

function saveScore(newScore) {
  let scores = JSON.parse(localStorage.getItem('capybaraScores')) || [];
  scores.push({ score: newScore, level, player: gameSettings.playerName || 'Pemain', date: new Date().toLocaleDateString() });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10);
  localStorage.setItem('capybaraScores', JSON.stringify(scores));
  updatePlayerInfo();
}

function showLeaderboard() {
  showPage('leaderboard');
  const scores = JSON.parse(localStorage.getItem('capybaraScores')) || [];
  const list = document.getElementById('scoreList');
  list.innerHTML = '';

  if (scores.length === 0) {
    list.innerHTML = '<li class="score-item"><span>Belum ada skor</span></li>';
    return;
  }

  scores.forEach((entry, index) => {
    const li = document.createElement('li');
    li.className = 'score-item';
    li.innerHTML = `
      <span class="rank">#${index + 1}</span>
      <div>
        <div><strong>${entry.player}</strong></div>
        <div>Skor: ${entry.score} | Level: ${entry.level}</div>
        <div><small>${entry.date}</small></div>
      </div>`;
    list.appendChild(li);
  });
}

function showSettings() {
  showPage('settings');
  document.getElementById('playerNameInput').value = '';
  document.getElementById('soundSetting').value = gameSettings.soundEnabled ? 'on' : 'off';
  updatePresetSelection();
}

function saveSettings() {
  gameSettings.playerName = document.getElementById('playerNameInput').value || 'Pemain';
  gameSettings.soundEnabled = document.getElementById('soundSetting').value === 'on';
  showSuccessPopup();
  localStorage.setItem('capybaraSettings', JSON.stringify(gameSettings));
  updatePlayerInfo();
}

function loadSettings() {
  const saved = JSON.parse(localStorage.getItem('capybaraSettings'));
  if (saved) gameSettings = saved;
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
  document.getElementById('playerName').textContent = gameSettings.playerName || 'Pemain';
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

