// Di handleHoleClick() saat hit capybara:
playSound('hit');

// Di handleHoleClick() saat hit bomb:
playSound('bomb');

// Saat level naik:
playSound('levelUp');

// Di startGame():
playSound('bgMusic');

// Di endGame():
stopSound('bgMusic');
playSound('gameOver');

// Saat countdown warning (timeLeft <= 10):
playSound('tick');

// Di saveSettings():
playSound('success');
