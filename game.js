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

function drawEnemyShip(nx, ny, npant) {
  let cod = 0;
  if (npant === 3) {
    if (nx % 50 > 25) {
      if (nx > 30) {
        ny--;
        cod = 1;
      }
    } else {
      if (ny < 400) {
        ny++;
        cod = 2;
      }
    }
  }

  switch (npant) {
    case 1:
      renderer.setColor(10);
      renderer.line(nx - 10, ny + 10, nx + 10, ny + 10);
      renderer.line(nx - 15, ny, nx - 10, ny + 10);
      renderer.line(nx + 15, ny, nx + 10, ny + 10);
      renderer.line(nx - 15, ny, nx - 18, ny + 5);
      renderer.line(nx + 15, ny, nx + 18, ny + 5);
      renderer.line(nx - 18, ny + 5, nx - 30, ny + 8);
      renderer.line(nx + 18, ny + 5, nx + 30, ny + 8);
      renderer.line(nx - 30, ny + 8, nx - 60, ny + 40);
      renderer.line(nx + 30, ny + 8, nx + 60, ny + 40);
      renderer.line(nx - 53, ny + 60, nx - 30, ny + 50);
      renderer.line(nx + 53, ny + 60, nx + 30, ny + 50);
      renderer.line(nx - 30, ny + 8, nx - 30, ny + 50);
      renderer.line(nx + 30, ny + 8, nx + 30, ny + 50);
      renderer.line(nx - 30, ny + 50, nx - 20, ny + 50);
      renderer.line(nx + 30, ny + 50, nx + 20, ny + 50);
      renderer.setColor(2);
      renderer.line(nx - 18, ny + 5, nx - 18, ny + 30);
      renderer.line(nx + 18, ny + 5, nx + 18, ny + 30);
      renderer.line(nx - 18, ny + 30, nx - 5, ny + 30);
      renderer.line(nx + 18, ny + 30, nx + 5, ny + 30);
      renderer.setColor(14);
      renderer.line(nx - 60, ny + 40, nx - 53, ny + 60);
      renderer.line(nx + 60, ny + 40, nx + 53, ny + 60);
      renderer.line(nx - 59, ny + 44, nx - 59, ny + 75);
      renderer.line(nx + 59, ny + 44, nx + 59, ny + 75);
      renderer.line(nx - 59, ny + 75, nx - 53, ny + 55);
      renderer.line(nx + 59, ny + 75, nx + 53, ny + 55);
      renderer.setColor(12);
      renderer.ellipse(nx, ny + 45, 0, 180, 5, 20);
      renderer.ellipse(nx, ny + 55, 0, 70, 10, 10);
      renderer.ellipse(nx, ny + 55, 110, 180, 10, 10);
      renderer.ellipse(nx, ny + 50, 180, 360, 25, 7);
      renderer.ellipse(nx, ny + 58, 180, 360, 7, 10);
      renderer.ellipse(nx, ny + 90, 0, 360, 4, 8);
      renderer.ellipse(nx, ny + 90, 180, 360, 5, 9);
      renderer.line(nx - 3, ny + 67, nx - 2, ny + 82);
      renderer.line(nx + 3, ny + 67, nx + 2, ny + 82);
      renderer.setFillStyle(1, 4);
      renderer.floodFill(nx, ny + 70, 12);
      renderer.setFillStyle(1, 12);
      renderer.floodFill(nx, ny + 60, 12);
      break;
    case 2:
      renderer.setColor(11);
      renderer.ellipse(nx, ny + 55, 160, 17, 20, 32);
      renderer.ellipse(nx, ny + 55, 150, 25, 12, 24);
      renderer.setColor(5);
      renderer.line(nx - 48, ny + 18, nx - 60, ny + 72);
      renderer.line(nx + 48, ny + 18, nx + 60, ny + 72);
      renderer.line(nx - 20, ny + 40, nx - 60, ny + 72);
      renderer.line(nx + 20, ny + 40, nx + 60, ny + 72);
      renderer.setColor(12);
      renderer.ellipse(nx, ny + 5, 0, 180, 60, 35);
      renderer.ellipse(nx, ny + 5, 0, 180, 60, 30);
      renderer.ellipse(nx, ny + 5, 0, 180, 60, 20);
      renderer.ellipse(nx, ny + 5, 0, 180, 60, 10);
      renderer.ellipse(nx, ny + 5, 0, 180, 50, 35);
      renderer.ellipse(nx, ny + 5, 0, 180, 40, 35);
      renderer.ellipse(nx, ny + 5, 0, 180, 30, 35);
      renderer.ellipse(nx, ny + 5, 0, 180, 30, 35);
      renderer.ellipse(nx, ny + 5, 0, 180, 20, 35);
      renderer.ellipse(nx, ny + 5, 0, 180, 10, 35);
      renderer.line(nx - 60, ny + 5, nx + 60, ny + 5);
      renderer.line(nx - 60, ny + 5, nx - 20, ny + 44);
      renderer.line(nx + 60, ny + 5, nx + 20, ny + 44);
      renderer.line(nx - 20, ny + 44, nx + 20, ny + 44);
      renderer.setColor(3);
      renderer.circle(nx, ny + 60, 3);
      renderer.circle(nx, ny + 60, 2);
      renderer.setColor(11);
      renderer.circle(nx, ny + 60, 1);
      break;
    case 3:
      renderer.setColor(11);
      renderer.ellipse(nx, ny + 67, 110, 70, 50, 18);
      renderer.ellipse(nx, ny + 65, 110, 70, 30, 20);
      renderer.ellipse(nx, ny + 65, 110, 70, 29, 19);
      renderer.setColor(12);
      renderer.ellipse(nx, ny + 40, 0, 360, 10, 40);
      renderer.setColor(10);
      if (cod === 1) {
        renderer.line(nx - 25, ny + 55, nx - 60, ny + 30);
        renderer.line(nx + 25, ny + 55, nx + 60, ny + 30);
        renderer.line(nx - 11, ny + 40, nx - 60, ny + 30);
        renderer.line(nx + 11, ny + 40, nx + 60, ny + 30);
        renderer.line(nx - 60, ny + 30, nx - 15, ny + 10);
        renderer.line(nx + 60, ny + 30, nx + 15, ny + 10);
        renderer.line(nx - 15, ny + 10, nx - 55, ny + 35);
        renderer.line(nx + 15, ny + 10, nx + 55, ny + 35);
      } else if (cod === 2) {
        renderer.line(nx - 25, ny + 55, nx - 60, ny + 20);
        renderer.line(nx + 25, ny + 55, nx + 60, ny + 20);
        renderer.line(nx - 11, ny + 40, nx - 60, ny + 20);
        renderer.line(nx + 11, ny + 40, nx + 60, ny + 20);
        renderer.line(nx - 60, ny + 20, nx - 15, ny - 10);
        renderer.line(nx + 60, ny + 20, nx + 15, ny - 10);
        renderer.line(nx - 15, ny - 10, nx - 55, ny + 25);
        renderer.line(nx + 15, ny - 10, nx + 55, ny + 25);
      }
      break;
  }
  return ny;
}

function gameLoop() {
  renderer.clearScreen();

  // Dibujar enemyships en la parte superior
  drawEnemyShip(100, 50, 1);
  drawEnemyShip(320, 50, 2);
  drawEnemyShip(540, 50, 3);

  // Dibujar ejemplos de enemigos pequeños
  drawEnemy(100, 220, 1);
  drawEnemy(180, 220, 2);
  drawEnemy(260, 220, 3);
  drawEnemy(340, 220, 4);

  // Dibujar jugadores al pie de pantalla
  drawPlayer(200, 400, 1);
  drawPlayer(440, 400, 2);

  requestAnimationFrame(gameLoop);
}

gameLoop();
