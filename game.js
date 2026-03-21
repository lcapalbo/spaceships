const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);

function drawPlayer(x, y, player) {
  if (player === 1) {
    renderer.setColor(12);
  } else {
    renderer.setColor(11);
  }

  renderer.line(x - 2, y, x, y - 20);
  renderer.line(x + 2, y, x, y - 20);

  if (y % 2 === 0) {
    renderer.setColor(14);
  } else {
    renderer.setColor(12);
  }

  renderer.ellipse(x - 5, y, 180, 0, 3, 5);
  renderer.ellipse(x + 5, y, 180, 0, 3, 5);

  if (y % 2 === 0) {
    renderer.setColor(12);
  } else {
    renderer.setColor(14);
  }

  renderer.ellipse(x - 5, y, 180, 0, 1, 5);
  renderer.ellipse(x + 5, y, 180, 0, 1, 5);

  if (player === 1) {
    renderer.setColor(14);
  } else {
    renderer.setColor(13);
  }

  renderer.arc(x, y, 0, 180, 8);
  renderer.arc(x, y, 0, 180, 6);

  if (player === 1) {
    renderer.setColor(11);
  } else {
    renderer.setColor(12);
  }

  renderer.line(x, y - 20, x + 10, y);
  renderer.line(x, y - 20, x - 10, y);
  renderer.line(x - 10, y, x + 10, y);

  renderer.line(x - 10, y - 2, x - 10, y - 9);
  renderer.line(x - 8, y - 2, x - 10, y - 9);
  renderer.line(x + 10, y - 2, x + 10, y - 9);
  renderer.line(x + 8, y - 2, x + 10, y - 9);
}

function gameLoop() {
  renderer.clearScreen();

  // Dibujar ejemplo de jugador 1 y 2
  drawPlayer(200, 240, 1);
  drawPlayer(440, 240, 2);

  requestAnimationFrame(gameLoop);
}

gameLoop();
