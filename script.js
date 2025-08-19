// Canvas and Context Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game State Variables
let gameStarted = false;
let gameTime = 0;
let score = 0;
let keys = {};

// Player Object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 200,
    width: 50,
    height: 50,
    vx: 0,           // velocity x
    vy: 0,           // velocity y
    grounded: false,
    speed: 5,
    jumpPower: 15,
    gravity: 0.8
};

// Game Objects Arrays
const platforms = [];
const coins = [];
const clouds = [];

// Initialize Game Objects
function initializePlatforms() {
    platforms.length = 0;
    
    // Ground platforms
    for (let i = 0; i < canvas.width; i += 150) {
        platforms.push({
            x: i,
            y: canvas.height - 50,
            width: 120,
            height: 30,
            type: 'grass'
        });
    }

    // Floating platforms at various heights
    const platformPositions = [
        {x: 100, y: canvas.height - 150},
        {x: 300, y: canvas.height - 200},
        {x: 500, y: canvas.height - 250},
        {x: 700, y: canvas.height - 180},
        {x: 200, y: canvas.height - 300},
        {x: 450, y: canvas.height - 350},
        {x: 650, y: canvas.height - 400},
        {x: 150, y: canvas.height - 450}
    ];

    platformPositions.forEach(pos => {
        if (pos.x < canvas.width - 120) {
            platforms.push({
                x: pos.x,
                y: pos.y,
                width: 120,
                height: 30,
                type: 'grass'
            });
        }
    });
}

function initializeClouds() {
    clouds.length = 0;
    for (let i = 0; i < 6; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height - 200),
            width: 100 + Math.random() * 50,
            height: 30 + Math.random() * 20,
            speed: 0.3 + Math.random() * 0.7,
            bounce: Math.random() * Math.PI * 2
        });
    }
}

function initializeCoins() {
    coins.length = 0;
    
    // Place coins near platforms (skip ground platforms mostly)
    platforms.forEach((platform, index) => {
        if (index > 0 && Math.random() > 0.3) {
            coins.push({
                x: platform.x + platform.width / 2 - 10,
                y: platform.y - 40,
                width: 20,
                height: 20,
                collected: false,
                bounce: 0
            });
        }
    });
}

// Drawing Functions
function drawPlayer() {
    ctx.save();
    
    // Chibi shark character
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    // Main body (rounded shark shape)
    ctx.fillStyle = '#8B9DC3'; // Gray-blue shark color
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 22, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Belly (cream colored)
    ctx.fillStyle = '#F5F5DC';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 5, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Dorsal fin (top fin)
    ctx.fillStyle = '#708090';
    ctx.beginPath();
    ctx.moveTo(centerX - 2, centerY - 18);
    ctx.lineTo(centerX + 2, centerY - 18);
    ctx.lineTo(centerX + 8, centerY - 8);
    ctx.lineTo(centerX - 8, centerY - 8);
    ctx.closePath();
    ctx.fill();
    
    // Side fins
    ctx.fillStyle = '#708090';
    ctx.beginPath();
    ctx.ellipse(centerX - 18, centerY + 2, 8, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 18, centerY + 2, 8, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Tail fin
    ctx.fillStyle = '#708090';
    ctx.beginPath();
    ctx.moveTo(centerX - 22, centerY);
    ctx.lineTo(centerX - 35, centerY - 10);
    ctx.lineTo(centerX - 35, centerY + 10);
    ctx.closePath();
    ctx.fill();
    
    // Eyes (cute big eyes)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX - 6, centerY - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 6, centerY - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX - 6, centerY - 6, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 6, centerY - 6, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Cute small mouth
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 2, 4, 0, Math.PI);
    ctx.stroke();
    
    // Blush marks (kawaii style)
    ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
    ctx.beginPath();
    ctx.arc(centerX - 12, centerY + 1, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 12, centerY + 1, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawPlatforms() {
    platforms.forEach(platform => {
        // Platform base (brown stone)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Grass top
        ctx.fillStyle = '#228B22';
        ctx.fillRect(platform.x, platform.y - 5, platform.width, 8);
        
        // Stone texture lines
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(platform.x, platform.y + (i * 10));
            ctx.lineTo(platform.x + platform.width, platform.y + (i * 10));
            ctx.stroke();
        }
    });
}

function drawClouds() {
    clouds.forEach(cloud => {
        // Draw ocean waves instead of clouds
        ctx.fillStyle = 'rgba(65, 105, 225, 0.7)'; // Ocean blue
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; // White foam
        ctx.lineWidth = 2;
        
        // Wave base
        ctx.beginPath();
        const waveHeight = 15;
        const waveWidth = cloud.width;
        const startX = cloud.x;
        const startY = cloud.y;
        
        // Create wave shape using curves
        ctx.moveTo(startX, startY + waveHeight);
        
        // First wave curve
        ctx.quadraticCurveTo(
            startX + waveWidth * 0.15, startY - waveHeight * 0.8,
            startX + waveWidth * 0.3, startY
        );
        
        // Second wave curve
        ctx.quadraticCurveTo(
            startX + waveWidth * 0.45, startY + waveHeight * 0.8,
            startX + waveWidth * 0.6, startY
        );
        
        // Third wave curve
        ctx.quadraticCurveTo(
            startX + waveWidth * 0.75, startY - waveHeight * 0.6,
            startX + waveWidth * 0.9, startY + waveHeight * 0.3
        );
        
        // Complete the wave
        ctx.lineTo(startX + waveWidth, startY + waveHeight);
        ctx.lineTo(startX, startY + waveHeight);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        // Add wave foam/bubbles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 3; i++) {
            const bubbleX = startX + (waveWidth * (0.2 + i * 0.3));
            const bubbleY = startY + Math.sin(cloud.bounce + i) * 3;
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, 2 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Update wave animation
        cloud.bounce = (cloud.bounce || 0) + 0.05;
    });
}

function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            // Bouncing animation
            coin.bounce += 0.1;
            const bounceY = coin.y + Math.sin(coin.bounce) * 3;
            
            // Outer circle (gold)
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, bounceY + coin.height/2, coin.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner circle (orange)
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(coin.x + coin.width/2, bounceY + coin.height/2, coin.width/3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// Collision Detection
function checkPlatformCollisions() {
    player.grounded = false;
    
    platforms.forEach(platform => {
        // Check if player intersects with platform
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {
            
            // Landing on top of platform
            if (player.vy > 0 && player.y < platform.y) {
                player.y = platform.y - player.height;
                player.vy = 0;
                player.grounded = true;
            }
        }
    });
}

function checkCoinCollisions() {
    coins.forEach(coin => {
        if (!coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            
            coin.collected = true;
            score += 10;
            document.getElementById('score').textContent = `Score: ${score}`;
        }
    });
}

// Update Functions
function updatePlayer() {
    // Horizontal movement
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.vx = -player.speed;
    } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.vx = player.speed;
    } else {
        player.vx *= 0.8; // Apply friction
    }
    
    // Jumping
    if ((keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' ']) && player.grounded) {
        player.vy = -player.jumpPower;
        player.grounded = false;
    }
    
    // Apply gravity
    player.vy += player.gravity;
    
    // Update position
    player.x += player.vx;
    player.y += player.vy;
    
    // Keep player within screen bounds horizontally
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    
    // Check if player fell off screen
    if (player.y > canvas.height) {
        endGame();
    }
}

function updateClouds() {
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        // Reset cloud position when it moves off screen
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width;
            cloud.y = Math.random() * (canvas.height - 200);
        }
    });
}

function updateTimer() {
    if (gameStarted) {
        gameTime += 1/60; // Assuming 60 FPS
        const minutes = Math.floor(gameTime / 60);
        const seconds = Math.floor(gameTime % 60);
        document.getElementById('timer').textContent = 
            `Time ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Game Loop
function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameStarted) {
        updatePlayer();
        updateClouds();
        updateTimer();
        checkPlatformCollisions();
        checkCoinCollisions();
        
        // Increase score over time
        if (Math.floor(gameTime * 10) % 30 === 0) {
            score += 1;
            document.getElementById('score').textContent = `Score: ${score}`;
        }
    }
    
    // Draw all game objects
    drawClouds();
    drawPlatforms();
    drawCoins();
    drawPlayer();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Game Control Functions
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        document.getElementById('instructions').style.display = 'none';
    }
}

function endGame() {
    gameStarted = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    gameStarted = false;
    gameTime = 0;
    score = 0;
    
    // Reset player position and physics
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 200;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
    
    // Reset UI elements
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('timer').textContent = 'Time';
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
    
    // Reinitialize game objects
    initializeCoins();
}

// Event Listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    startGame();
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initializePlatforms();
    initializeClouds();
    initializeCoins();
});

// Initialize and Start Game
initializePlatforms();
initializeClouds();
initializeCoins();
gameLoop();