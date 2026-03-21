const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function clearScreen() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
  clearScreen();
  requestAnimationFrame(gameLoop);
}

gameLoop();
