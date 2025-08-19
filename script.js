// Game Constants: Define settings here for easy adjustment
const POP_INTERVAL = 2000; // Animals pop every 2 seconds (2000 ms)
const BOMB_CHANCE = 0.2; // 20% chance for a bomb to appear instead of capybara
const CAPYBARA_IMG = 'https://example.com/capybara.png'; // Replace with actual capybara image URL or local path
const BOMB_IMG = 'https://example.com/bomb.png'; // Replace with actual bomb image URL or local path

// Note: For images, you can use placeholders or find free cute capybara and bomb images online.
// Example capybara: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Capybara_%28Hydrochoerus_hydrochaeris%29.JPG/320px-Capybara_%28Hydrochoerus_hydrochaeris%29.JPG'
// Example bomb: Use a cartoon bomb image for cuteness.

// DOM Elements: Grab elements from HTML for manipulation
const homePage = document.getElementById('home-page');
const gamePage = document.getElementById('game-page');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreElement = document.getElementById('score');
const leaderboardElement = document.getElementById('leaderboard');
const holes = document.querySelectorAll('.hole');

// Game Variables: Track game state
let score = 0;
let gameInterval;
let isGameOver = false;

// Leaderboard: Use localStorage to save high scores
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

// Function: Update Leaderboard Display
function updateLeaderboard() {
    leaderboardElement.innerHTML = ''; // Clear current list
    highScores.sort((a, b) => b - a); // Sort high to low
    highScores.slice(0, 5).forEach((score, index) => { // Show top 5
        const li = document.createElement('li');
        li.textContent = `#${index + 1}: ${score} points`;
        leaderboardElement.appendChild(li);
    });
}

// Function: Start the Game
function startGame() {
    homePage.style.display = 'none'; // Hide home
    gamePage.style.display = 'block'; // Show game
    score = 0;
    scoreElement.textContent = score;
    isGameOver = false;
    restartButton.style.display = 'none';

    // Initialize holes with images (hidden initially)
    holes.forEach(hole => {
        const img = document.createElement('img');
        hole.appendChild(img);
        img.addEventListener('click', () => whack(hole)); // Add click event
    });

    // Start popping interval
    gameInterval = setInterval(popAnimal, POP_INTERVAL);
}

// Function: Pop an Animal or Bomb
function popAnimal() {
    if (isGameOver) return; // Stop if game over

    // Choose random hole
    const randomHole = holes[Math.floor(Math.random() * holes.length)];

    // Decide if bomb or capybara
    const isBomb = Math.random() < BOMB_CHANCE;
    const img = randomHole.querySelector('img');
    img.src = isBomb ? BOMB_IMG : CAPYBARA_IMG;
    img.alt = isBomb ? 'Bomb' : 'Capybara';
    randomHole.classList.add('active'); // Show image

    // Hide after 1 second (faster than pop interval to avoid overlap)
    setTimeout(() => {
        randomHole.classList.remove('active');
    }, 1000);
}

// Function: Whack Action (on click)
function whack(hole) {
    if (isGameOver || !hole.classList.contains('active')) return; // Ignore if not active or game over

    const img = hole.querySelector('img');
    if (img.alt === 'Bomb') {
        // Hit bomb: Game Over
        gameOver();
    } else {
        // Hit capybara: Increase score
        score++;
        scoreElement.textContent = score;
    }
    hole.classList.remove('active'); // Hide immediately after whack
}

// Function: Game Over
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval); // Stop popping
    restartButton.style.display = 'block'; // Show restart button

    // Save score to leaderboard
    highScores.push(score);
    localStorage.setItem('highScores', JSON.stringify(highScores));
    updateLeaderboard();
}

// Event Listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', () => {
    gamePage.style.display = 'none';
    homePage.style.display = 'block';
    updateLeaderboard(); // Refresh leaderboard on return
});

// Initial Leaderboard Update
updateLeaderboard();