const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);

// Estados de juego
let gameState = 'MENU';

// Variables para optimizar dibujo del menú
let menuInitialized = false;
let previousSelectedOption = -1;

// Opciones del menú
let selectedOption = 0; // 0: Jugar, 1: Velocidad, 2: Dificultad, 3: Puntajes, 4: Salir
let players = 'Uno'; // 'Uno' o 'Dos'
let speed = 'Normal'; // 'Lento', 'Normal', 'Rápido'
let difficulty = 'Media'; // 'Fácil', 'Media', 'Difícil'

// Estado de jugadores
const player1 = { score: 0, lives: 4, energy: 3, x: 200, y: 443, bullets: 0, shots: [false, false, false, false], bulletX: [-10, -10, -10, -10], bulletY: [-10, -10, -10, -10] };
const player2 = { score: 0, lives: 4, energy: 3, x: 200, y: 443, bullets: 0, shots: [false, false, false, false], bulletX: [-10, -10, -10, -10], bulletY: [-10, -10, -10, -10] };

// Energía inicial del juego
let initialEnergy = 3;
let pill = 5; // Posibilidad de pastilla según dificultad
const menuOptions = ['Jugar', 'Velocidad', 'Dificultad', 'Puntajes', 'Salir'];

// Estado de controles del juego
let keysPressed = {};
let escapePressed = false;
let confirmingExit = false;

function write(text, x, y) {
    renderer.setColor(9);
    renderer.outTextXY(x, y, text);
		renderer.setColor(4);
    renderer.outTextXY(x+1, y, text);
    renderer.setColor(12);
    renderer.outTextXY(x - 1, y - 1, text);
}

function drawMenu() {
	if (!menuInitialized) {
		// Primera vez: dibujar fondo, título, subtítulo, opciones iniciales, créditos
		renderer.setFillStyle(0, 1); // patrón sólido, color 1 = azul oscuro
		renderer.bar(0, 0, canvas.width, canvas.height);

		// Título grande en estilo 'Space Ships'
		renderer.setTextStyle(4, 0, 10);
		renderer.setColor(9);
		renderer.outTextXY(106, 0, 'Space');
		renderer.setColor(15);
		renderer.outTextXY(100, 2, 'Space');
		renderer.setColor(11);
		renderer.outTextXY(104, 4, 'Space');
		renderer.setTextStyle(4, 0, 9);
		renderer.setColor(9);
		renderer.outTextXY(130, 106, 'Ships');
		renderer.setColor(15);
		renderer.outTextXY(132, 110, 'Ships');
		renderer.setColor(11);
		renderer.outTextXY(136, 108, 'Ships');

		renderer.setTextStyle(2, 1, 3);
		renderer.setColor(15);
		renderer.outTextXY(460, 200, 'Adventure!');

		// Subtítulo
		renderer.setTextStyle(0, 0, 1);
		renderer.setColor(14);
		renderer.outTextXY(canvas.width-120, 10, 'Edición Especial');

		// Créditos
		renderer.setTextStyle(2, 0, 1.5);
		renderer.setColor(11);
		renderer.outTextXY(500, canvas.height - 35, 'Lucas Capalbo');
		renderer.setTextStyle(5, 0, 1.4);
		renderer.setColor(12);
		renderer.outTextXY(525, canvas.height - 25, 'Producciones');

		// Instrucciones del menú
		renderer.setTextStyle(2, 0, 1);
		renderer.setColor(7);
		renderer.outTextXY(20, canvas.height - 25, 'Arriba/Abajo: seleccionar   Izquierda/Derecha: cambiar   Enter: aceptar');

		menuInitialized = true;
		previousSelectedOption = selectedOption;
	}

	// Actualizar opciones si cambiaron
	renderer.setFillStyle(0, 1);
	renderer.bar(200, 230, 500, 250 + menuOptions.length * 30);
	
	// Dibujar opciones actuales
	renderer.setTextStyle(0, 0, 2);
	for (let i = 0; i < menuOptions.length; i++) {
		const y = 250 + i * 30;
		const x = 170;
		let color = (i === selectedOption) ? 12 : 4;
		renderer.setColor(color);
		let text = menuOptions[i];
		if (i === 0) text += ': ' + players;
		if (i === 1) text += ': ' + speed;
		if (i === 2) text += ': ' + difficulty;
		write(text, x + 30, y);
	}

	// Borrar flecha anterior si cambió
	if (previousSelectedOption !== selectedOption && previousSelectedOption !== -1) {
		renderer.setFillStyle(0, 1);
		renderer.bar(160, 230, 200, 250 + menuOptions.length * 30);
	}

	// Dibujar flecha actual
	if (selectedOption >= 0 && selectedOption < menuOptions.length) {
		const y = 250 + selectedOption * 30;
		drawMenuArrow(170, y + 5, 14);
	}

	previousSelectedOption = selectedOption;
}

function drawMenuArrow(x, y, color) {
	renderer.setColor(color);
	renderer.line(x, y, x + 10, y);
	renderer.line(x, y, x, y + 10);
	renderer.line(x + 10, y, x + 10, y - 10);
	renderer.line(x, y + 10, x + 10, y + 10);
	renderer.line(x + 10, y + 10, x + 10, y + 20);
	renderer.line(x + 10, y + 20, x + 25, y + 5);
	renderer.line(x + 10, y - 10, x + 25, y + 5);
}

function setupGameScreen() {
	// Inicializar valores según dificultad
	let difficultyLevel = 1;
	if (difficulty === 'Media') difficultyLevel = 2;
	else if (difficulty === 'Difícil') difficultyLevel = 3;

	switch (difficultyLevel) {
		case 1:
			initialEnergy = 4;
			player1.lives = 4;
			player2.lives = 4;
			pill = 8;
			break;
		case 2:
			initialEnergy = 3;
			player1.lives = 4;
			player2.lives = 4;
			pill = 12;
			break;
		case 3:
			initialEnergy = 3;
			player1.lives = 3;
			player2.lives = 3;
			pill = 18;
			break;
	}

	player1.energy = initialEnergy;
	player2.energy = initialEnergy;

	// Inicializar posiciones según cantidad de jugadores
	if (players === 'Uno') {
		player1.x = 200;
		player1.y = 443;
	} else {
		player1.x = 300;
		player1.y = 443;
		player2.x = 100;
		player2.y = 443;
	}
	// Inicializar estado de balas
	player1.bullets = 0;
	player1.shots = [false, false, false, false];
	player1.bulletX = [-10, -10, -10, -10];
	player1.bulletY = [-10, -10, -10, -10];
	player2.bullets = 0;
	player2.shots = [false, false, false, false];
	player2.bulletX = [-10, -10, -10, -10];
	player2.bulletY = [-10, -10, -10, -10];

	// Area de juego izquierdo
	renderer.setFillStyle(0, 0); // fondo sólido negro
	renderer.bar(0, 0, 400, canvas.height);

	// Panel derecho
	renderer.setFillStyle(1, 1); // fondo sólido azul
	renderer.bar(400, 0, canvas.width, canvas.height);

	// Bordes del panel
	renderer.setColor(12);
	renderer.rectangle(400, 0, canvas.width, canvas.height);

	// Cabecera del panel
	let y_base = players === 'Dos' ? 154 : 268;
	renderer.setTextStyle(4, 0, 5);
	renderer.setColor(9);
	renderer.outTextXY(423, y_base, 'Space');
	renderer.setColor(15);
	renderer.outTextXY(420, y_base + 2, 'Space');
	renderer.setColor(11);
	renderer.outTextXY(421, y_base + 2, 'Space');
	renderer.setTextStyle(4, 0, 4);
	renderer.setColor(9);
	renderer.outTextXY(447, y_base + 50, 'Ships');
	renderer.setColor(15);
	renderer.outTextXY(448, y_base + 51, 'Ships');
	renderer.setColor(11);
	renderer.outTextXY(449, y_base + 51, 'Ships');
	renderer.setColor(15);
	renderer.setTextStyle(2, 1, 1.7);
	renderer.outTextXY(605, y_base + 96, 'Adventure!');

	// Textos fijos y líneas para Jugador 1
	renderer.setTextStyle(0, 0, 1);
	renderer.setColor(4);
	renderer.outTextXY(579, 23, 'Puntaje');
	renderer.setColor(12);
	renderer.outTextXY(580, 24, 'Puntaje');
	renderer.setColor(4);
	renderer.outTextXY(594, 53, 'Vidas');
	renderer.setColor(12);
	renderer.outTextXY(595, 54, 'Vidas');
	renderer.setColor(4);
	renderer.outTextXY(579, 103, 'Energía');
	renderer.setColor(12);
	renderer.outTextXY(580, 104, 'Energía');
	renderer.setColor(14);
	renderer.line(403, 35, 636, 35);
	renderer.line(403, 65, 636, 65);
	renderer.line(403, 115, 636, 115);

	// Textos fijos y líneas para Jugador 2 si activo
	if (players === 'Dos') {
		renderer.setColor(4);
		renderer.outTextXY(579, 333, 'Puntaje');
		renderer.setColor(12);
		renderer.outTextXY(580, 334, 'Puntaje');
		renderer.setColor(4);
		renderer.outTextXY(594, 363, 'Vidas');
		renderer.setColor(12);
		renderer.outTextXY(595, 364, 'Vidas');
		renderer.setColor(4);
		renderer.outTextXY(579, 413, 'Energía');
		renderer.setColor(12);
		renderer.outTextXY(580, 414, 'Energía');
		renderer.setColor(14);
		renderer.line(403, 345, 636, 345);
		renderer.line(403, 375, 636, 375);
		renderer.line(403, 425, 636, 425);
	}

	// Dibujar vidas iniciales
	for (let i = 1; i <= player1.lives; i++) {
		drawPlayer(650 - (30 * i), 90, 1);
	}
	if (players === 'Dos') {
		for (let i = 1; i <= player2.lives; i++) {
			drawPlayer(650 - (30 * i), 400, 2);
		}
	}

	// Mostrar energía inicial
	showEnergy(player1.energy, 1);
	if (players === 'Dos') showEnergy(player2.energy, 2);

	// Dibujar naves de jugadores en posiciones iniciales
	drawPlayer(player1.x, player1.y, 1);
	if (players === 'Dos') drawPlayer(player2.x, player2.y, 2);
}

function writeScore(score, player) {
	const y = player === 1 ? 40 : 350;
	const scoreStr = score.toString().padStart(5, '0');
	renderer.setTextStyle(1, 0, 1);
	renderer.setColor(1);
	renderer.outTextXY(590, y, '█████');

	renderer.setTextStyle(0, 0, 1);
	renderer.setColor(14);
	renderer.outTextXY(590, y, scoreStr);
}

function showEnergy(energy, player) {
	const baseY = player === 1 ? 129 : 439;
	for (let i = 1; i <= initialEnergy; i++) {
		const x1 = 643 - (i * 20);
		const x2 = 640 - (i * 20);
		if (i <= energy) {
			// Energía disponible: dos pieSlice
			renderer.setFillStyle(1, 2);
      renderer.pieSlice(x1, baseY, 20, 340, 8);
      renderer.setColor(14);
      renderer.setFillStyle(0);
			renderer.pieSlice(x1, baseY, 20, 340, 8);
			renderer.setFillStyle(1, 12);
			renderer.pieSlice(x2, baseY, 110, 250, 5);
		} else {
			// Energía consumida: pieSlice completo
			renderer.setFillStyle(1, 1);
			renderer.pieSlice(x1, baseY, 0, 360, 8);
		}
	}
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
					window.gameStarted = false;
					menuInitialized = false; // Reset para próxima vez que entre al menú
					keysPressed = {};
					confirmingExit = false;

				} else if (selectedOption === 3) {
					gameState = 'HIGHSCORES';
				} else if (selectedOption === 4) {
					location.reload();
				}
				break;
		}
	} else if (gameState === 'GAME') {
		// Rastrear teclas presionadas
		keysPressed[event.key.toLowerCase()] = true;
		keysPressed[event.key.toUpperCase()] = true;
		
		// Manejo de Escape para salir
		if (event.key === 'Escape') {
			if (!confirmingExit) {
				confirmingExit = true;
			} else {
				// Si ya estábamos confirmando, salir
				gameState = 'MENU';
				confirmingExit = false;
				escapePressed = false;
				keysPressed = {};
				menuInitialized = false;
				window.gameStarted = false;
			}
		} else if (confirmingExit) {
			// Si presiona cualquier otra tecla mientras confirma salida, cancela
			confirmingExit = false;
		}
	}
});

document.addEventListener('keyup', (event) => {
	if (gameState === 'GAME') {
		keysPressed[event.key.toLowerCase()] = false;
		keysPressed[event.key.toUpperCase()] = false;
	}
});

function updatePlayerMovement() {
	const moveSpeed = 5; // Píxeles por frame
	const gameAreaWidth = 400;

	// Player 1: Flechas
	if (keysPressed['arrowup']) {
		player1.y = Math.max(0, player1.y - moveSpeed);
	}
	if (keysPressed['arrowdown']) {
		player1.y = Math.min(canvas.height - 20, player1.y + moveSpeed);
	}
	if (keysPressed['arrowleft']) {
		player1.x = Math.max(0, player1.x - moveSpeed);
	}
	if (keysPressed['arrowright']) {
		player1.x = Math.min(gameAreaWidth - 20, player1.x + moveSpeed);
	}

	// Player 2: AWSD (solo en modo dos jugadores)
	if (players === 'Dos') {
		if (keysPressed['w']) {
			player2.y = Math.max(0, player2.y - moveSpeed);
		}
		if (keysPressed['s']) {
			player2.y = Math.min(canvas.height - 20, player2.y + moveSpeed);
		}
		if (keysPressed['a']) {
			player2.x = Math.max(0, player2.x - moveSpeed);
		}
		if (keysPressed['d']) {
			player2.x = Math.min(gameAreaWidth - 20, player2.x + moveSpeed);
		}
	}

	// Disparo Player 1: Espacio
	if (keysPressed[' ']) {
		// Iniciador disparo (la lógica completa será implementada después)
		if (player1.shots.some(shot => !shot)) {
			const shotIndex = player1.shots.findIndex(shot => !shot);
			if (shotIndex !== -1) {
				player1.shots[shotIndex] = true;
				player1.bulletX[shotIndex] = player1.x;
				player1.bulletY[shotIndex] = player1.y - 20;
				player1.bullets++;
			}
		}
	}

	// Disparo Player 2: Tab (solo en modo dos jugadores)
	if (players === 'Dos' && keysPressed['\t']) {
		if (player2.shots.some(shot => !shot)) {
			const shotIndex = player2.shots.findIndex(shot => !shot);
			if (shotIndex !== -1) {
				player2.shots[shotIndex] = true;
				player2.bulletX[shotIndex] = player2.x;
				player2.bulletY[shotIndex] = player2.y - 20;
				player2.bullets++;
			}
		}
	}
}

function drawGameplayUI() {
	// Mostrar indicador de confirmación de salida si está activo
	if (confirmingExit) {
		renderer.setFillStyle(1, 1);
		renderer.bar(60, 200, 340, 230);
		renderer.setColor(12);
		renderer.rectangle(60, 200, 340, 230);
		
		// Mostrar mensaje de confirmación
		renderer.setTextStyle(2, 0, 1);
		renderer.setColor(14);
		renderer.outTextXY(75, 210, 'Presione ESC nuevamente para salir');
	}
}


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

function drawEnemy(c, f, enemyCode) {
	if (enemyCode === 1) {
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
	} else if (enemyCode === 2) {
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
	} else if (enemyCode === 3 || enemyCode === 4) {
		renderer.setColor(11);
		renderer.ellipse(c, f + 17, 0, 360, 15, 5);
		renderer.circle(c, f + 19, 4);

		renderer.setColor(10);
		renderer.line(c - 7, f + 15, c - 15, f + (enemyCode === 3 ? 8 : 5));
		renderer.line(c - 15, f + (enemyCode === 3 ? 8 : 5), c - 7, f + (enemyCode === 3 ? 3 : -5));
		renderer.line(c - 15, f + (enemyCode === 3 ? 8 : 5), c + 7, f + 15);
		renderer.line(c + 15, f + (enemyCode === 3 ? 8 : 5), c - 7, f + 15);
		renderer.line(c + 7, f + 15, c + 15, f + (enemyCode === 3 ? 8 : 5));
		renderer.line(c + 15, f + (enemyCode === 3 ? 8 : 5), c + 7, f + (enemyCode === 3 ? 3 : -5));

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

function drawEnemyShip(nx, ny, screenNumber) {
	let cod = 0;
	if (screenNumber === 3) {
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

	switch (screenNumber) {
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
			// Primera vez: inicializar pantalla de juego
			if (!window.gameStarted) {
				setupGameScreen();
				writeScore(player1.score, 1);
				if (players === 'Dos') writeScore(player2.score, 2);
				window.gameStarted = true;
			}

			// Actualizar movimiento de jugadores
			updatePlayerMovement();

			// Redibujar área de juego
			renderer.setFillStyle(0, 0);
			renderer.bar(0, 0, 400, canvas.height);

			// Dibujar naves de jugadores en sus posiciones actuales
			drawPlayer(player1.x, player1.y, 1);
			if (players === 'Dos') drawPlayer(player2.x, player2.y, 2);

			// Mostrar UI de juego (confirmación de salida, etc.)
			drawGameplayUI();
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
