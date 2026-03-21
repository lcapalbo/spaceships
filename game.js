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

function drawEnemy(c, f, codigo) {
  if (codigo === 1) {
    renderer.setColor(2);
    renderer.ellipse(c, f, 150, 30, 5, 10);
    renderer.ellipse(c, f, 150, 30, 4, 9);
    renderer.ellipse(c, f, 150, 30, 3, 8);

    renderer.setColor(11);
    renderer.ellipse(c, f + 20, 0, 360, 2, 3);

    renderer.setColor(8);
    renderer.ellipse(c - 9, f + 3, 0, 360, 2, 3);
    renderer.ellipse(c + 9, f + 3, 0, 360, 2, 3);
    renderer.ellipse(c - 9, f + 3, 0, 360, 1, 2);
    renderer.ellipse(c + 9, f + 3, 0, 360, 1, 2);

    renderer.setColor(10);
    renderer.line(c + 2, f, c, f + 20);
    renderer.line(c - 2, f, c, f + 20);
    renderer.line(c - 10, f - 5, c + 10, f - 5);
    renderer.line(c + 10, f - 5, c + 15, f + 3);
    renderer.line(c - 10, f - 5, c - 15, f + 3);
    renderer.line(c - 14, f + 3, c - 11, f + 15);
    renderer.line(c - 11, f + 15, c - 4, f + 5);
    renderer.line(c + 14, f + 3, c + 11, f + 15);
    renderer.line(c + 11, f + 15, c + 4, f + 5);

    renderer.setColor(14);
    renderer.line(c - 15, f + 3, c - 12, f + 15);
    renderer.line(c - 12, f + 15, c - 5, f + 5);
    renderer.line(c + 15, f + 3, c + 12, f + 15);
    renderer.line(c + 12, f + 15, c + 5, f + 5);
  } else if (codigo === 2) {
    renderer.setColor(12);
    renderer.ellipse(c, f + 5, 0, 180, 15, 10);
    renderer.line(c - 15, f + 5, c - 5, f + 12);
    renderer.line(c + 15, f + 5, c + 5, f + 12);
    renderer.line(c - 5, f + 11, c + 5, f + 11);
		
    renderer.setColor(3);
    renderer.ellipse(c, f + 15, 160, 15, 5, 8);
    renderer.ellipse(c, f + 15, 145, 25, 3, 6);
		
    renderer.setColor(5);
    renderer.line(c - 12, f + 8, c - 15, f + 18);
    renderer.line(c + 12, f + 8, c + 15, f + 18);
    renderer.line(c - 5, f + 10, c - 15, f + 18);
    renderer.line(c + 5, f + 10, c + 15, f + 18);
		
    renderer.setFillStyle(9, 4);
    renderer.floodFill(c, f, 12);
		
    renderer.setColor(3);
    renderer.circle(c, f + 15, 3);
    renderer.circle(c, f + 15, 2);

    renderer.setColor(11);
    renderer.circle(c, f + 15, 1);
  } else if (codigo === 3 || codigo === 4) {
    renderer.setColor(11);
    renderer.ellipse(c, f + 17, 0, 360, 15, 5);
    renderer.circle(c, f + 19, 4);

    renderer.setColor(10);
    renderer.line(c - 7, f + 15, c - 15, f + (codigo === 3 ? 8 : 5));
    renderer.line(c - 15, f + (codigo === 3 ? 8 : 5), c - 7, f + (codigo === 3 ? 3 : -5));
    renderer.line(c - 15, f + (codigo === 3 ? 8 : 5), c + 7, f + 15);
    renderer.line(c + 15, f + (codigo === 3 ? 8 : 5), c - 7, f + 15);
    renderer.line(c + 7, f + 15, c + 15, f + (codigo === 3 ? 8 : 5));
    renderer.line(c + 15, f + (codigo === 3 ? 8 : 5), c + 7, f + (codigo === 3 ? 3 : -5));

    renderer.setColor(11);
    renderer.circle(c, f + 20, 3);

    renderer.setColor(6);
    renderer.line(c - 1, f + 20, c - 1, f + 13);
    renderer.circle(c, f + 20, 2);
    renderer.line(c + 1, f + 20, c + 1, f + 13);

    renderer.setColor(12);
    renderer.line(c, f + 20, c, f + 10);

    renderer.setFillStyle(1, 12);
    renderer.floodFill(c - 8, f + 12, 10);
    renderer.floodFill(c + 8, f + 12, 10);
  }
}

function gameLoop() {
  renderer.clearScreen();

  // Dibujar ejemplo de jugador 1 y 2
  drawPlayer(200, 240, 1);
  drawPlayer(440, 240, 2);

  // Dibujar ejemplos de enemigos 1..4
  drawEnemy(100, 120, 1);
  drawEnemy(180, 120, 2);
  drawEnemy(260, 120, 3);
  drawEnemy(340, 120, 4);

  requestAnimationFrame(gameLoop);
}

gameLoop();
