const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);

// Estados de juego
let gameState = 'MENU';

// Opciones del menú
let selectedOption = 0; // 0: Jugar, 1: Velocidad, 2: Dificultad, 3: Puntajes, 4: Salir
let players = 'Uno'; // 'Uno' o 'Dos'
let speed = 'Normal'; // 'Lento', 'Normal', 'Rápido'
let difficulty = 'Media'; // 'Fácil', 'Media', 'Difícil'

const menuOptions = ['Jugar', 'Velocidad', 'Dificultad', 'Puntajes', 'Salir'];

function drawMenu() {
  renderer.clearScreen();

  // Fondo azul retro
  renderer.setFillStyle(1, 1); // color 1 = azul oscuro aproximado
  renderer.bar(0, 0, canvas.width, canvas.height);

  // Título grande en estilo 'Space Ships' - TriplexFont size 4
  renderer.setTextStyle(1, 0, 4); // TriplexFont, horizontal, size 4
  renderer.setColor(11); // cian
  renderer.outTextXY(140, 40, 'Space');
  renderer.outTextXY(140, 70, 'Ships');
  renderer.setColor(15);
  renderer.outTextXY(500, 40, 'Adventure');

  // Subtítulo - DefaultFont size 1
  renderer.setTextStyle(0, 0, 1);
  renderer.setColor(14); // amarillo para subtítulo
  renderer.outTextXY(380, 20, 'Edición Especial');

  // Opciones de menú - DefaultFont size 2
  renderer.setTextStyle(0, 0, 2);
  for (let i = 0; i < menuOptions.length; i++) {
    const y = 180 + i * 40;
    let color = (i === selectedOption) ? 12 : 4; // selección rojo claro
    renderer.setColor(color);
    let text = menuOptions[i];
    if (i === 0) text += ': ' + players;
    if (i === 1) text += ': ' + speed;
    if (i === 2) text += ': ' + difficulty;
    renderer.outTextXY(260, y, text);
    if (i === selectedOption) {
      renderer.setColor(14);
      renderer.outTextXY(230, y, '->');
    }
  }

  // Footer con marca - SmallFont size 1
  renderer.setTextStyle(2, 0, 1);
  renderer.setColor(12);
  renderer.outTextXY(20, canvas.height - 30, 'Lucas Capalbo Producciones');

  renderer.setColor(7);
  renderer.outTextXY(210, canvas.height - 60, 'Arriba/Abajo: seleccionar  Izquierda/Derecha: cambiar  Enter: aceptar');
}

// Manejo de teclado
document.addEventListener('keydown', (event) => {
  if (gameState === 'MENU') {
    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
      case '8': // numpad
        selectedOption = (selectedOption - 1 + menuOptions.length) % menuOptions.length;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
      case '2': // numpad
        selectedOption = (selectedOption + 1) % menuOptions.length;
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
      case '4': // numpad
        if (selectedOption === 0) {
          players = players === 'Uno' ? 'Dos' : 'Uno';
        } else if (selectedOption === 1) {
          if (speed === 'Normal') speed = 'Lento';
          else if (speed === 'Rápido') speed = 'Normal';
        } else if (selectedOption === 2) {
          if (difficulty === 'Media') difficulty = 'Fácil';
          else if (difficulty === 'Difícil') difficulty = 'Media';
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
      case '6': // numpad
        if (selectedOption === 0) {
          players = players === 'Uno' ? 'Dos' : 'Uno';
        } else if (selectedOption === 1) {
          if (speed === 'Lento') speed = 'Normal';
          else if (speed === 'Normal') speed = 'Rápido';
        } else if (selectedOption === 2) {
          if (difficulty === 'Fácil') difficulty = 'Media';
          else if (difficulty === 'Media') difficulty = 'Difícil';
        }
        break;
      case 'Enter':
        if (selectedOption === 0) {
          gameState = 'GAME';
        } else if (selectedOption === 3) {
          gameState = 'HIGHSCORES';
        } else if (selectedOption === 4) {
          // Salir, pero en web, quizás no hacer nada o alert
          alert('Salir - Cierra la pestaña');
        }
        break;
    }
  }
});

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
  switch (gameState) {
    case 'MENU':
      drawMenu();
      break;
    case 'GAME':
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
      break;
    case 'HIGHSCORES':
      renderer.clearScreen();
      renderer.setColor(15);
      renderer.outTextXY(250, 240, 'Puntajes en desarrollo...');
      break;
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
