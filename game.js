const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);

const GAME_STATES = {
	MENU: 'MENU',
	GAME_START: 'GAME_START',
	GAME: 'GAME',
	BOSS_EXPLOSION: 'BOSS_EXPLOSION',
	STATS_SCREEN: 'STATS_SCREEN',
	HIGHSCORE_ENTRY: 'HIGHSCORE_ENTRY',
	LIFE_LOST: 'LIFE_LOST',
	GAME_OVER: 'GAME_OVER',
	HIGHSCORES: 'HIGHSCORES',
	CONFIRM_EXIT: 'CONFIRM_EXIT',
	HELP: 'HELP'
};
const movementKeysPlayer1Set = new Set(['arrowdown', 'arrowup', 'arrowright', 'arrowleft']);
const movementKeysPlayer2Set = new Set(['s', 'w', 'd', 'a']);

// Current game state
let gameState = GAME_STATES.MENU;
let menuInitialized = false;
let previousSelectedOption = -1;
let confirmExitStartTime = 0;
let initialEnergy = 3;

let pill = 5; // Pill drop chance by difficulty
// Constants for pill types
const PILL_TYPES = {
	POINTS_100: 1,      // Sky blue - 100 points
	ENERGY_FULL: 2,     // Green - full energy
	CONTROLS_CHANGE: 3, // Red - controls swap
	SPEED_BOOST: 4,     // White - speed boost
	ANGULAR_SHOT: 5,    // Purple - angular shot
	LASER: 6,           // Yellow - laser
	SHIELD: 7           // Pink - shield
};

// Menu options
const menuOptions = ['Jugar', 'Velocidad', 'Dificultad', 'Puntajes', 'Salir'];
let selectedOption = 0; // 0: Jugar
let players = 'Uno'; // 'Uno' or 'Dos'
let speed = 'Normal'; // 'Lento', 'Normal', 'Rápido'
let timeFactor = 1;
let difficulty = 'Media'; // 'Fácil', 'Media', 'Difícil'


function getSpeedMultiplier() {
	if (speed === 'Lento') return 0.6;
	if (speed === 'Rápido') return 1.2;
	return 1; // Normal
}

// Player state
const player1 = {
	x: 200, y: 443,
	score: 0, lives: 4, energy: 3,
	bullets: 0,
	shots: [false, false, false, false],
	bulletX: [-10, -10, -10, -10],
	bulletY: [-10, -10, -10, -10],
	enemiesKilled: 0, enemiesCrashed: 0,
	// Pill effects
	shield: false, shieldCounter: 0,
	laser: false, angularShot: false,
	// Angular shot positions (-10 = inactive)
	angularShotY: -10, angularShotXLeft: -10, angularShotXRight: -10,
	effectDuration: 0,
	speedBoost: false,
	controlsChanged: false
};
const player2 = {
	x: 200, y: 443,
	score: 0, lives: 4, energy: 3,
	bullets: 0,
	shots: [false, false, false, false],
	bulletX: [-10, -10, -10, -10],
	bulletY: [-10, -10, -10, -10],
	enemiesKilled: 0, enemiesCrashed: 0,
	// Pill effects
	shield: false, shieldCounter: 0,
	laser: false, angularShot: false,
	// Angular shot positions (-10 = inactive)
	angularShotY: -10, angularShotXLeft: -10, angularShotXRight: -10,
	effectDuration: 0,
	speedBoost: false,
	controlsChanged: false
};

// Global enemy state
let currentScreen = 1; // Current screen (1, 2, 3)
let totalEnemies = 2; // Initial enemy count
let maxPlayerShots = 1; // Max simultaneous shots per player
let lastProgressionCheck = 0; // To avoid repeated checks
let finalBossActive = false; // If the final boss is active
let totalKilled = 0; // Total enemies killed for boss trigger
let bossEnergy = 0; // Boss energy
let bossNX = 200; // Boss X position
let bossNY = -110; // Boss Y position
let bossControl = false; // To control oscillating movement
let bossExplosionState = {
	active: false,
	x: 0,
	y: 0,
	suma: 1,
	repeats: 0,
	rx: 0,
	timer: 0,
	targetPlayer: 1
};

let statsState = {
	active: false,
	targetPlayer: 1,
	player1Kills: 0,
	player1Crashes: 0,
	player1Efficiency: 0,
	player2Kills: 0,
	player2Crashes: 0,
	player2Efficiency: 0,
	// State for highscore entry and display
	highscoreChecked: false,      // Whether highscores have been checked after finishing
	highscoreEntryActive: false,  // Whether highscore name entry is active
	pendingHighscores: [],        // {player, score} pending entry
	currentHighIndex: 0,          // index in pendingHighscores
	nameBuffer: '',               // buffer for name entry
	maxHighscores: 5,             // top N
};

let pillDrop = {
	active: false,
	x: -10,
	y: -10,
	type: 0
};

// Enemy arrays (max 5 per screen)
const enemies = [
	{ x: 0, y: -20, code: 1, firing: false, shotX: -10, shotY: -10, control: false },
	{ x: 0, y: -20, code: 1, firing: false, shotX: -10, shotY: -10, control: false },
	{ x: 0, y: -20, code: 1, firing: false, shotX: -10, shotY: -10, control: false },
	{ x: 0, y: -20, code: 1, firing: false, shotX: -10, shotY: -10, control: false },
	{ x: 0, y: -20, code: 1, firing: false, shotX: -10, shotY: -10, control: false }
];

const spriteCache = {};
const spriteSpecs = {
	player1: { width: 24, height: 32, anchorX: 12, anchorY: 20 },
	player1_shield: { width: 24, height: 32, anchorX: 12, anchorY: 20 },
	player2: { width: 24, height: 32, anchorX: 12, anchorY: 20 },
	player2_shield: { width: 24, height: 32, anchorX: 12, anchorY: 20 },
	enemy1: { width: 32, height: 30, anchorX: 16, anchorY: 5 },
	enemy2: { width: 30, height: 30, anchorX: 15, anchorY: 6 },
	enemy3: { width: 30, height: 22, anchorX: 15, anchorY: -2 },
	enemy4: { width: 30, height: 30, anchorX: 15, anchorY: 5 },
	boss1: { width: 120, height: 100, anchorX: 60, anchorY: 0 },
	boss2: { width: 120, height: 120, anchorX: 60, anchorY: 30 },
	boss3_1: { width: 120, height: 85, anchorX: 60, anchorY: 0 },
	boss3_2: { width: 120, height: 95, anchorX: 60, anchorY: 10 }
};

function createSpriteCanvas(width, height) {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	return canvas;
}

function buildSpriteCanvas(spec, drawFn) {
	const canvas = createSpriteCanvas(spec.width, spec.height);
	const previousCtx = renderer.ctx;
	renderer.ctx = canvas.getContext('2d');
	renderer.clearScreen(true);
	drawFn();
	renderer.ctx = previousCtx;
	return canvas;
}

function buildSpriteCache() {
	if (spriteCache.player1_even) return;

	spriteCache.player1_even = {
		image: buildSpriteCanvas(spriteSpecs.player1, () => drawPlayerSprite(renderer, spriteSpecs.player1.anchorX, spriteSpecs.player1.anchorY, 1, false, false)),
		anchorX: spriteSpecs.player1.anchorX,
		anchorY: spriteSpecs.player1.anchorY
	};
	spriteCache.player1_odd = {
		image: buildSpriteCanvas(spriteSpecs.player1, () => drawPlayerSprite(renderer, spriteSpecs.player1.anchorX, spriteSpecs.player1.anchorY + 1, 1, false, false)),
		anchorX: spriteSpecs.player1.anchorX,
		anchorY: spriteSpecs.player1.anchorY
	};
	spriteCache.player1_even_shield = {
		image: buildSpriteCanvas(spriteSpecs.player1_shield, () => drawPlayerSprite(renderer, spriteSpecs.player1.anchorX, spriteSpecs.player1.anchorY, 1, true, true)),
		anchorX: spriteSpecs.player1_shield.anchorX,
		anchorY: spriteSpecs.player1_shield.anchorY
	};
	spriteCache.player1_odd_shield = {
		image: buildSpriteCanvas(spriteSpecs.player1_shield, () => drawPlayerSprite(renderer, spriteSpecs.player1.anchorX, spriteSpecs.player1.anchorY + 1, 1, true, true)),
		anchorX: spriteSpecs.player1_shield.anchorX,
		anchorY: spriteSpecs.player1_shield.anchorY
	};

	spriteCache.player2_even = {
		image: buildSpriteCanvas(spriteSpecs.player2, () => drawPlayerSprite(renderer, spriteSpecs.player2.anchorX, spriteSpecs.player2.anchorY, 2, false, false)),
		anchorX: spriteSpecs.player2.anchorX,
		anchorY: spriteSpecs.player2.anchorY
	};
	spriteCache.player2_odd = {
		image: buildSpriteCanvas(spriteSpecs.player2, () => drawPlayerSprite(renderer, spriteSpecs.player2.anchorX, spriteSpecs.player2.anchorY + 1, 2, false, false)),
		anchorX: spriteSpecs.player2.anchorX,
		anchorY: spriteSpecs.player2.anchorY
	};
	spriteCache.player2_even_shield = {
		image: buildSpriteCanvas(spriteSpecs.player2_shield, () => drawPlayerSprite(renderer, spriteSpecs.player2.anchorX, spriteSpecs.player2.anchorY, 2, true, true)),
		anchorX: spriteSpecs.player2_shield.anchorX,
		anchorY: spriteSpecs.player2_shield.anchorY
	};
	spriteCache.player2_odd_shield = {
		image: buildSpriteCanvas(spriteSpecs.player2_shield, () => drawPlayerSprite(renderer, spriteSpecs.player2.anchorX, spriteSpecs.player2.anchorY + 1, 2, true, true)),
		anchorX: spriteSpecs.player2_shield.anchorX,
		anchorY: spriteSpecs.player2_shield.anchorY
	};

	spriteCache.enemy1 = {
		image: buildSpriteCanvas(spriteSpecs.enemy1, () => drawEnemySprite(renderer, spriteSpecs.enemy1.anchorX, spriteSpecs.enemy1.anchorY, 1)),
		anchorX: spriteSpecs.enemy1.anchorX,
		anchorY: spriteSpecs.enemy1.anchorY
	};
	spriteCache.enemy2 = {
		image: buildSpriteCanvas(spriteSpecs.enemy2, () => drawEnemySprite(renderer, spriteSpecs.enemy2.anchorX, spriteSpecs.enemy2.anchorY, 2)),
		anchorX: spriteSpecs.enemy2.anchorX,
		anchorY: spriteSpecs.enemy2.anchorY
	};
	spriteCache.enemy3 = {
		image: buildSpriteCanvas(spriteSpecs.enemy3, () => drawEnemySprite(renderer, spriteSpecs.enemy3.anchorX, spriteSpecs.enemy3.anchorY, 3)),
		anchorX: spriteSpecs.enemy3.anchorX,
		anchorY: spriteSpecs.enemy3.anchorY
	};
	spriteCache.enemy4 = {
		image: buildSpriteCanvas(spriteSpecs.enemy4, () => drawEnemySprite(renderer, spriteSpecs.enemy4.anchorX, spriteSpecs.enemy4.anchorY, 4)),
		anchorX: spriteSpecs.enemy4.anchorX,
		anchorY: spriteSpecs.enemy4.anchorY
	};

	spriteCache.boss1 = {
		image: buildSpriteCanvas(spriteSpecs.boss1, () => drawEnemyBossSprite(renderer, spriteSpecs.boss1.anchorX, spriteSpecs.boss1.anchorY, 1, 0)),
		anchorX: spriteSpecs.boss1.anchorX,
		anchorY: spriteSpecs.boss1.anchorY
	};
	spriteCache.boss2 = {
		image: buildSpriteCanvas(spriteSpecs.boss2, () => drawEnemyBossSprite(renderer, spriteSpecs.boss2.anchorX, spriteSpecs.boss2.anchorY, 2, 0)),
		anchorX: spriteSpecs.boss2.anchorX,
		anchorY: spriteSpecs.boss2.anchorY
	};
	spriteCache.boss3_1 = {
		image: buildSpriteCanvas(spriteSpecs.boss3_1, () => drawEnemyBossSprite(renderer, spriteSpecs.boss3_1.anchorX, spriteSpecs.boss3_1.anchorY, 3, 1)),
		anchorX: spriteSpecs.boss3_1.anchorX,
		anchorY: spriteSpecs.boss3_1.anchorY
	};
	spriteCache.boss3_2 = {
		image: buildSpriteCanvas(spriteSpecs.boss3_2, () => drawEnemyBossSprite(renderer, spriteSpecs.boss3_2.anchorX, spriteSpecs.boss3_2.anchorY, 3, 2)),
		anchorX: spriteSpecs.boss3_2.anchorX,
		anchorY: spriteSpecs.boss3_2.anchorY
	};
}

function initSpriteCache() {
	buildSpriteCache();
}

function drawSprite(object, x, y) {
	renderer.drawImage(object.image, x - object.anchorX, y - object.anchorY);
}

function getPlayerSprite(player, showShield) {
	const parity = Math.random() < 0.5 ? 'even' : 'odd';
	const shieldSuffix = showShield ? '_shield' : '';
	return spriteCache[`player${player}_${parity}${shieldSuffix}`];
}

function getEnemySprite(code) {
	return spriteCache[`enemy${code}`];
}

function getBossSprite(screenNumber, cod) {
	if (screenNumber === 1) return spriteCache.boss1;
	if (screenNumber === 2) return spriteCache.boss2;
	if (screenNumber === 3) return spriteCache[`boss3_${cod === 2 ? 2 : 1}`];
	return null;
}

function drawPlayer(x, y, player, showShield = true) {
	const sprite = getPlayerSprite(player, showShield && (player === 1 ? player1.shield : player2.shield));
	if (sprite) {
		drawSprite(sprite, x, y);
		return;
	}
	drawPlayerSprite(renderer, x, y, player, showShield);
}

function drawEnemy(x, y, enemyCode) {
	const sprite = getEnemySprite(enemyCode);
	if (sprite) {
		drawSprite(sprite, x, y);
		return;
	}
	drawEnemySprite(renderer, x, y, enemyCode);
}

function drawEnemyBossShip(nx, ny, screenNumber) {
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

	const sprite = getBossSprite(screenNumber, cod);
	if (sprite) {
		drawSprite(sprite, nx, ny);
		return ny;
	}

	drawEnemyBossSprite(renderer, nx, ny, screenNumber, cod);
	return ny;
}

function drawPlayerSprite(targetRenderer, x, y, player, showShield = true, shieldActive = null) {
	const hasShield = showShield && (shieldActive !== null ? shieldActive : (player === 1 ? player1.shield : player2.shield));
	if (player === 1) {
		targetRenderer.setColor(12);
	} else {
		targetRenderer.setColor(11);
	}

	targetRenderer.line(x - 2, y, x, y - 20);
	targetRenderer.line(x + 2, y, x, y - 20);

	if (y % 2 === 0) {
		targetRenderer.setColor(14);
	} else {
		targetRenderer.setColor(12);
	}

	targetRenderer.ellipse(x - 5, y, 180, 0, 3, 5);
	targetRenderer.ellipse(x + 5, y, 180, 0, 3, 5);

	if (y % 2 === 0) {
		targetRenderer.setColor(12);
	} else {
		targetRenderer.setColor(14);
	}

	targetRenderer.ellipse(x - 5, y, 180, 0, 1, 5);
	targetRenderer.ellipse(x + 5, y, 180, 0, 1, 5);

	if (player === 1) {
		targetRenderer.setColor(14);
	} else {
		targetRenderer.setColor(13);
	}

	targetRenderer.arc(x, y, 0, 180, 8);
	targetRenderer.arc(x, y, 0, 180, 6);

	if (hasShield) {
		targetRenderer.setColor(10);
		targetRenderer.ellipse(x, y - 5, 0, 360, 11, 15);
	}

	if (player === 1) {
		targetRenderer.setColor(11);
	} else {
		targetRenderer.setColor(12);
	}

	targetRenderer.line(x, y - 20, x + 10, y);
	targetRenderer.line(x, y - 20, x - 10, y);
	targetRenderer.line(x - 10, y, x + 10, y);

	targetRenderer.line(x - 10, y - 2, x - 10, y - 9);
	targetRenderer.line(x - 8, y - 2, x - 10, y - 9);
	targetRenderer.line(x + 10, y - 2, x + 10, y - 9);
	targetRenderer.line(x + 8, y - 2, x + 10, y - 9);
}

function drawEnemySprite(targetRenderer, x, y, enemyCode) {
	if (enemyCode === 1) {
		targetRenderer.setColor(2);
		targetRenderer.ellipse(x, y, 150, 30, 5, 10);
		targetRenderer.ellipse(x, y, 150, 30, 4, 9);
		targetRenderer.ellipse(x, y, 150, 30, 3, 8);

		targetRenderer.setColor(11);
		targetRenderer.ellipse(x, y + 20, 0, 360, 2, 3);

		targetRenderer.setColor(8);
		targetRenderer.ellipse(x - 9, y + 3, 0, 360, 2, 3);
		targetRenderer.ellipse(x + 9, y + 3, 0, 360, 2, 3);
		targetRenderer.ellipse(x - 9, y + 3, 0, 360, 1, 2);
		targetRenderer.ellipse(x + 9, y + 3, 0, 360, 1, 2);

		targetRenderer.setColor(10);
		targetRenderer.line(x + 2, y, x, y + 20);
		targetRenderer.line(x - 2, y, x, y + 20);
		targetRenderer.line(x - 10, y - 5, x + 10, y - 5);
		targetRenderer.line(x + 10, y - 5, x + 15, y + 3);
		targetRenderer.line(x - 10, y - 5, x - 15, y + 3);
		targetRenderer.line(x - 14, y + 3, x - 11, y + 15);
		targetRenderer.line(x - 11, y + 15, x - 4, y + 5);
		targetRenderer.line(x + 14, y + 3, x + 11, y + 15);
		targetRenderer.line(x + 11, y + 15, x + 4, y + 5);

		targetRenderer.setColor(14);
		targetRenderer.line(x - 15, y + 3, x - 12, y + 15);
		targetRenderer.line(x - 12, y + 15, x - 5, y + 5);
		targetRenderer.line(x + 15, y + 3, x + 12, y + 15);
		targetRenderer.line(x + 12, y + 15, x + 5, y + 5);
	} else if (enemyCode === 2) {
		targetRenderer.setColor(12);
		targetRenderer.ellipse(x, y + 5, 0, 180, 15, 10);
		targetRenderer.line(x - 15, y + 5, x - 5, y + 12);
		targetRenderer.line(x + 15, y + 5, x + 5, y + 12);
		targetRenderer.line(x - 5, y + 11, x + 5, y + 11);

		targetRenderer.setColor(3);
		targetRenderer.ellipse(x, y + 15, 160, 15, 5, 8);
		targetRenderer.ellipse(x, y + 15, 145, 25, 3, 6);

		targetRenderer.setColor(5);
		targetRenderer.line(x - 12, y + 8, x - 15, y + 18);
		targetRenderer.line(x + 12, y + 8, x + 15, y + 18);
		targetRenderer.line(x - 5, y + 10, x - 15, y + 18);
		targetRenderer.line(x + 5, y + 10, x + 15, y + 18);

		targetRenderer.setFillStyle(9, 4);
		targetRenderer.floodFill(x, y, 12);

		targetRenderer.setColor(3);
		targetRenderer.circle(x, y + 15, 3);
		targetRenderer.circle(x, y + 15, 2);

		targetRenderer.setColor(11);
		targetRenderer.circle(x, y + 15, 1);
	} else if (enemyCode === 3 || enemyCode === 4) {
		targetRenderer.setColor(11);
		targetRenderer.ellipse(x, y + 17, 0, 360, 15, 5);
		targetRenderer.circle(x, y + 19, 4);

		targetRenderer.setColor(10);
		targetRenderer.line(x - 7, y + 15, x - 15, y + (enemyCode === 3 ? 8 : 5));
		targetRenderer.line(x - 15, y + (enemyCode === 3 ? 8 : 5), x - 7, y + (enemyCode === 3 ? 3 : -5));
		targetRenderer.line(x - 15, y + (enemyCode === 3 ? 8 : 5), x + 7, y + 15);
		targetRenderer.line(x + 15, y + (enemyCode === 3 ? 8 : 5), x - 7, y + 15);
		targetRenderer.line(x + 7, y + 15, x + 15, y + (enemyCode === 3 ? 8 : 5));
		targetRenderer.line(x + 15, y + (enemyCode === 3 ? 8 : 5), x + 7, y + (enemyCode === 3 ? 3 : -5));

		targetRenderer.setColor(11);
		targetRenderer.circle(x, y + 20, 3);

		targetRenderer.setColor(6);
		targetRenderer.line(x - 1, y + 20, x - 1, y + 13);
		targetRenderer.circle(x, y + 20, 2);
		targetRenderer.line(x + 1, y + 20, x + 1, y + 13);

		targetRenderer.setColor(12);
		targetRenderer.line(x, y + 20, x, y + 10);

		targetRenderer.setFillStyle(1, 12);
		targetRenderer.floodFill(x - 8, y + 12, 10);
		targetRenderer.floodFill(x + 8, y + 12, 10);
	}
}

function drawEnemyBossSprite(targetRenderer, nx, ny, screenNumber, cod = 0) {
	switch (screenNumber) {
		case 1:
			targetRenderer.setColor(10);
			targetRenderer.line(nx - 10, ny + 10, nx + 10, ny + 10);
			targetRenderer.line(nx - 15, ny, nx - 10, ny + 10);
			targetRenderer.line(nx + 15, ny, nx + 10, ny + 10);
			targetRenderer.line(nx - 15, ny, nx - 18, ny + 5);
			targetRenderer.line(nx + 15, ny, nx + 18, ny + 5);
			targetRenderer.line(nx - 18, ny + 5, nx - 30, ny + 8);
			targetRenderer.line(nx + 18, ny + 5, nx + 30, ny + 8);
			targetRenderer.line(nx - 30, ny + 8, nx - 60, ny + 40);
			targetRenderer.line(nx + 30, ny + 8, nx + 60, ny + 40);
			targetRenderer.line(nx - 53, ny + 60, nx - 30, ny + 50);
			targetRenderer.line(nx + 53, ny + 60, nx + 30, ny + 50);
			targetRenderer.line(nx - 30, ny + 8, nx - 30, ny + 50);
			targetRenderer.line(nx + 30, ny + 8, nx + 30, ny + 50);
			targetRenderer.line(nx - 30, ny + 50, nx - 20, ny + 50);
			targetRenderer.line(nx + 30, ny + 50, nx + 20, ny + 50);
			targetRenderer.setColor(2);
			targetRenderer.line(nx - 18, ny + 5, nx - 18, ny + 30);
			targetRenderer.line(nx + 18, ny + 5, nx + 18, ny + 30);
			targetRenderer.line(nx - 18, ny + 30, nx - 5, ny + 30);
			targetRenderer.line(nx + 18, ny + 30, nx + 5, ny + 30);
			targetRenderer.setColor(14);
			targetRenderer.line(nx - 60, ny + 40, nx - 53, ny + 60);
			targetRenderer.line(nx + 60, ny + 40, nx + 53, ny + 60);
			targetRenderer.line(nx - 59, ny + 44, nx - 59, ny + 75);
			targetRenderer.line(nx + 59, ny + 44, nx + 59, ny + 75);
			targetRenderer.line(nx - 59, ny + 75, nx - 53, ny + 55);
			targetRenderer.line(nx + 59, ny + 75, nx + 53, ny + 55);
			targetRenderer.setColor(12);
			targetRenderer.ellipse(nx, ny + 45, 0, 180, 5, 20);
			targetRenderer.ellipse(nx, ny + 55, 0, 70, 10, 10);
			targetRenderer.ellipse(nx, ny + 55, 110, 180, 10, 10);
			targetRenderer.ellipse(nx, ny + 50, 180, 360, 25, 7);
			targetRenderer.ellipse(nx, ny + 58, 180, 360, 7, 10);
			targetRenderer.ellipse(nx, ny + 90, 0, 360, 4, 8);
			targetRenderer.ellipse(nx, ny + 90, 180, 360, 5, 9);
			targetRenderer.line(nx - 3, ny + 67, nx - 2, ny + 82);
			targetRenderer.line(nx + 3, ny + 67, nx + 2, ny + 82);
			targetRenderer.setFillStyle(1, 4);
			targetRenderer.floodFill(nx, ny + 70, 12);
			targetRenderer.setFillStyle(1, 12);
			targetRenderer.floodFill(nx, ny + 60, 12);
			break;
		case 2:
			targetRenderer.setColor(11);
			targetRenderer.ellipse(nx, ny + 55, 160, 17, 20, 32);
			targetRenderer.ellipse(nx, ny + 55, 150, 25, 12, 24);
			targetRenderer.setColor(5);
			targetRenderer.line(nx - 48, ny + 18, nx - 60, ny + 72);
			targetRenderer.line(nx + 48, ny + 18, nx + 60, ny + 72);
			targetRenderer.line(nx - 20, ny + 40, nx - 60, ny + 72);
			targetRenderer.line(nx + 20, ny + 40, nx + 60, ny + 72);
			targetRenderer.setColor(12);
			targetRenderer.ellipse(nx, ny + 5, 0, 180, 60, 35);
			targetRenderer.ellipse(nx, ny + 5, 0, 180, 60, 30);
			targetRenderer.ellipse(nx, ny + 5, 0, 180, 60, 20);
			targetRenderer.ellipse(nx, ny + 5, 0, 180, 60, 10);
			targetRenderer.ellipse(nx, ny + 5, 0, 180, 50, 35);
			targetRenderer.ellipse(nx, ny + 5, 0, 180, 40, 35);
			targetRenderer.ellipse(nx, ny + 5, 0, 180, 30, 35);
			targetRenderer.ellipse(nx, ny + 5, 0, 180, 30, 35);
			targetRenderer.ellipse(nx, ny + 5, 0, 180, 20, 35);
			targetRenderer.ellipse(nx, ny + 5, 0, 180, 10, 35);
			targetRenderer.line(nx - 60, ny + 5, nx + 60, ny + 5);
			targetRenderer.line(nx - 60, ny + 5, nx - 20, ny + 44);
			targetRenderer.line(nx + 60, ny + 5, nx + 20, ny + 44);
			targetRenderer.line(nx - 20, ny + 44, nx + 20, ny + 44);
			targetRenderer.setColor(3);
			targetRenderer.circle(nx, ny + 60, 3);
			targetRenderer.circle(nx, ny + 60, 2);
			targetRenderer.setColor(11);
			targetRenderer.circle(nx, ny + 60, 1);
			break;
		case 3:
			targetRenderer.setColor(11);
			targetRenderer.ellipse(nx, ny + 67, 110, 70, 50, 18);
			targetRenderer.ellipse(nx, ny + 65, 110, 70, 30, 20);
			targetRenderer.ellipse(nx, ny + 65, 110, 70, 29, 19);
			targetRenderer.setColor(12);
			targetRenderer.ellipse(nx, ny + 40, 0, 360, 10, 40);
			targetRenderer.setColor(10);
			if (cod === 1) {
				targetRenderer.line(nx - 25, ny + 55, nx - 60, ny + 30);
				targetRenderer.line(nx + 25, ny + 55, nx + 60, ny + 30);
				targetRenderer.line(nx - 11, ny + 40, nx - 60, ny + 30);
				targetRenderer.line(nx + 11, ny + 40, nx + 60, ny + 30);
				targetRenderer.line(nx - 60, ny + 30, nx - 15, ny + 10);
				targetRenderer.line(nx + 60, ny + 30, nx + 15, ny + 10);
				targetRenderer.line(nx - 15, ny + 10, nx - 55, ny + 35);
				targetRenderer.line(nx + 15, ny + 10, nx + 55, ny + 35);
			} else if (cod === 2) {
				targetRenderer.line(nx - 25, ny + 55, nx - 60, ny + 20);
				targetRenderer.line(nx + 25, ny + 55, nx + 60, ny + 20);
				targetRenderer.line(nx - 11, ny + 40, nx - 60, ny + 20);
				targetRenderer.line(nx + 11, ny + 40, nx + 60, ny + 20);
				targetRenderer.line(nx - 60, ny + 20, nx - 15, ny - 10);
				targetRenderer.line(nx + 60, ny + 20, nx + 15, ny - 10);
				targetRenderer.line(nx - 15, ny - 10, nx - 55, ny + 25);
				targetRenderer.line(nx + 15, ny - 10, nx + 55, ny + 25);
			}
			break;
	}
}

function write(text, x, y) {
	renderer.setColor(9);
	renderer.outTextXY(x, y, text);
	renderer.setColor(4);
	renderer.outTextXY(x + 1, y, text);
	renderer.setColor(12);
	renderer.outTextXY(x - 1, y - 1, text);
}

// --- Highscores (local storage) ---
function loadHighScores() {
	try {
		const raw = localStorage.getItem('spaceships_highscores');
		if (!raw) return [];
		const list = JSON.parse(raw);
		if (!Array.isArray(list)) return [];
		return list;
	} catch (e) {
		return [];
	}
}

function saveHighScores(list) {
	try {
		localStorage.setItem('spaceships_highscores', JSON.stringify(list));
	} catch (e) {
		// ignore
	}
}

function getRankPosition(score) {
	const list = loadHighScores();
	// descending order by score
	list.sort((a, b) => b.score - a.score);
	for (let i = 0; i < list.length; i++) {
		// Pascal used strict greater for insertion
		if (score > list[i].score) return i;
	}
	if (list.length < statsState.maxHighscores) return list.length;
	return -1;
}

function addHighScore(name, score, player, efficiency) {
	const list = loadHighScores();
	list.push({ name: name.substring(0, 8), score: score, player: player, efficiency: efficiency });
	list.sort((a, b) => b.score - a.score);
	const trimmed = list.slice(0, statsState.maxHighscores);
	saveHighScores(trimmed);
}

function ensureHighscoreCheck() {
	if (statsState.highscoreChecked) return;
	statsState.highscoreChecked = true;
	statsState.pendingHighscores = [];
	// Check player1
	const pos1 = getRankPosition(player1.score);
	if (pos1 !== -1) statsState.pendingHighscores.push({ player: 1, score: player1.score, efficiency: statsState.player1Efficiency });
	// Check player2 only if active
	if (players === 'Dos') {
		const pos2 = getRankPosition(player2.score);
		if (pos2 !== -1) statsState.pendingHighscores.push({ player: 2, score: player2.score, efficiency: statsState.player2Efficiency });
	}
	if (statsState.pendingHighscores.length > 0) {
		statsState.highscoreEntryActive = true;
		statsState.currentHighIndex = 0;
		statsState.nameBuffer = '';
	}
}

function drawHighscoreEntry() {
	if (!statsState.highscoreEntryActive) return;
	const entry = statsState.pendingHighscores[statsState.currentHighIndex];
	if (!entry) return;

	renderer.setFillStyle(10, 0);
	renderer.bar(0, 0, 640, 480);

	// Draw a box similar to Pascal's input area; position depends on player (1 or 2)
	const baseY = entry.player === 1 ? 175 : 225;
	const baseX = 150;

	renderer.setFillStyle(1, 1);
	renderer.bar(baseX, baseY, baseX + 340, baseY + 80);
	renderer.setColor(12);
	renderer.rectangle(baseX, baseY, baseX + 340, baseY + 80);
	renderer.setColor(15);
	renderer.setTextStyle(2, 0, 1.2);
	renderer.outTextXY(baseX + 20, baseY + 10, 'Jugador ' + entry.player + '  Puntaje: ' + entry.score);
	renderer.setTextStyle(2, 0, 1.4);
	renderer.outTextXY(baseX + 20, baseY + 30, 'Nombre: ');
	renderer.setColor(14);
	renderer.outTextXY(baseX + 85, baseY + 30, statsState.nameBuffer + (Date.now() % 1000 < 500 ? '█' : ''));
	renderer.setTextStyle(2, 0, 1.2);
	renderer.setColor(11);
	renderer.outTextXY(baseX + 20, baseY + 60, 'ENTER para guardar, BACKSPACE para borrar');
}

function drawRankingScreen() {
	renderer.clearScreen();

	// Blue background and inner black frame
	renderer.setFillStyle(1, 1);
	renderer.bar(0, 0, canvas.width, canvas.height);
	renderer.setFillStyle(0, 1);
	renderer.bar(72, 182, 608, 403);
	renderer.setColor(1);
	renderer.rectangle(70, 180, 610, 405);

	// Column header
	renderer.setTextStyle(11, 0, 1);
	renderer.setColor(4);
	renderer.outTextXY(109, 186, 'Nombre                Puntaje        Jugador    Eficiencia');
	renderer.setColor(12);
	renderer.outTextXY(110, 185, 'Nombre                Puntaje        Jugador    Eficiencia');

	// Main Space Ships title
	renderer.setTextStyle(4, 0, 5);
	renderer.setColor(9);
	renderer.outTextXY(33, 32, 'Space');
	renderer.setColor(15);
	renderer.outTextXY(30, 34, 'Space');
	renderer.setColor(11);
	renderer.outTextXY(31, 34, 'Space');

	renderer.setTextStyle(4, 0, 4);
	renderer.setColor(9);
	renderer.outTextXY(77, 90, 'Ships');
	renderer.setColor(15);
	renderer.outTextXY(78, 91, 'Ships');
	renderer.setColor(11);
	renderer.outTextXY(79, 91, 'Ships');

	// Adventure subtitle
	renderer.setTextStyle(2, 1, 1.6);
	renderer.setColor(15);
	renderer.outTextXY(215, 140, 'Adventure!');

	// Ranking title with layered effect
	renderer.setTextStyle(0, 0, 7.3);
	renderer.setColor(12);
	renderer.outTextXY(255, 50, 'Ranking');
	renderer.setFillStyle(6, 4);
	renderer.floodFill(267, 60, 12); //R
	renderer.floodFill(350, 90, 12); //A
	renderer.floodFill(370, 90, 12); //N
	renderer.floodFill(427, 90, 12); //K
	renderer.floodFill(495, 90, 12); //I
	renderer.floodFill(495, 55, 12); //.
	renderer.floodFill(532, 90, 12); //N
	renderer.floodFill(580, 90, 12); //G
	renderer.setColor(4);
	renderer.outTextXY(256, 50, 'Ranking');
	renderer.setColor(9);
	renderer.outTextXY(255, 52, 'Ranking');
	renderer.setColor(12);
	renderer.outTextXY(254, 50, 'Ranking');
	renderer.setColor(4);
	renderer.outTextXY(256, 49, 'Ranking');
	renderer.setColor(9);
	renderer.outTextXY(256, 51, 'Ranking');

	// Credits
	renderer.setTextStyle(2, 0, 1.5);
	renderer.setColor(11);
	renderer.outTextXY(370, 122, 'Lucas Capalbo');
	renderer.setTextStyle(5, 0, 1.4);
	renderer.setColor(12);
	renderer.outTextXY(395, 130, 'Producciones');

	// Starfleet terminal style borders and lines
	renderer.setColor(10);
	renderer.line(0, 170, 600, 170);
	renderer.line(0, 180, 610, 180);
	renderer.line(0, 415, 600, 415);
	renderer.line(0, 405, 610, 405);

	renderer.setFillStyle(1, 2);
	renderer.pieSlice(600, 179, 0, 90, 10);
	renderer.pieSlice(600, 406, 270, 360, 10);
	renderer.bar(0, 171, 600, 179);
	renderer.bar(0, 406, 600, 414);

	renderer.setColor(10);
	renderer.rectangle(550, 184, 610, 401);
	renderer.rectangle(0, 184, 70, 401);
	renderer.setFillStyle(7, 2);
	renderer.bar(551, 185, 609, 400);
	renderer.setFillStyle(7, 3);
	renderer.bar(1, 185, 69, 400);

	// Ranking entries
	const list = loadHighScores();
	for (let i = 0; i < statsState.maxHighscores; i++) {
		const entry = list[i];
		const y = 210 + i * 40;
		renderer.setTextStyle(0, 0, 2.2);
		renderer.setColor(15);
		if (entry) {
			renderer.outTextXY(90, y, entry.name.substring(0, 8));
			renderer.outTextXY(260, y, entry.score.toString());
			renderer.outTextXY(470, y, entry.efficiency !== undefined ? (entry.efficiency + '%') : '');
			drawPlayer(400, y + 15, entry.player);
		} else {
			renderer.outTextXY(90, y, "???");
		}
	}

	renderer.setColor(11);
	renderer.setTextStyle(2, 0, 1);
	renderer.outTextXY(200, 425, 'Presione cualquier tecla para volver');
}


function drawMenu() {
	if (!menuInitialized) {
		// First time: draw background, title, subtitle, initial options, credits
		renderer.setFillStyle(0, 1); // solid pattern, color 1 = dark blue
		renderer.bar(0, 0, canvas.width, canvas.height);

		// Stylish big title 'Space Ships'
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

		// Subtitle
		renderer.setTextStyle(0, 0, 1);
		renderer.setColor(14);
		renderer.outTextXY(canvas.width - 120, 10, 'Edición Especial');

		// Credits
		renderer.setTextStyle(2, 0, 1.5);
		renderer.setColor(11);
		renderer.outTextXY(500, canvas.height - 35, 'Lucas Capalbo');
		renderer.setTextStyle(5, 0, 1.4);
		renderer.setColor(12);
		renderer.outTextXY(525, canvas.height - 25, 'Producciones');

		// Menu instructions
		renderer.setTextStyle(2, 0, 1);
		renderer.setColor(7);
		renderer.outTextXY(20, canvas.height - 25, 'Arriba/Abajo: seleccionar   Izquierda/Derecha: cambiar   Enter: aceptar');

		menuInitialized = true;
		previousSelectedOption = selectedOption;
	}

	// Update options if changed
	renderer.setFillStyle(0, 1);
	renderer.bar(200, 230, 500, 250 + menuOptions.length * 30);

	// Draw current options
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

	// Clear previous arrow if changed
	if (previousSelectedOption !== selectedOption && previousSelectedOption !== -1) {
		renderer.setFillStyle(0, 1);
		renderer.bar(160, 230, 200, 250 + menuOptions.length * 30);
	}

	// Draw current arrow
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
	currentScreen = 1;
	maxPlayerShots = 1;

	// Initialize values by difficulty
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

	player1.score = 0;
	player2.score = 0;
	player1.energy = initialEnergy;
	player2.energy = initialEnergy;

	// Reset highscore flags for new game
	statsState.highscoreChecked = false;
	statsState.highscoreEntryActive = false;
	statsState.pendingHighscores = [];
	statsState.currentHighIndex = 0;
	statsState.nameBuffer = '';

	// Reset enemy statistics
	player1.enemiesKilled = 0;
	player1.enemiesCrashed = 0;
	player2.enemiesKilled = 0;
	player2.enemiesCrashed = 0;

	// Reset pill effects
	resetPlayerEffects(player1);
	resetPlayerEffects(player2);
	// Clear any visible pill before starting a new game
	cancelPillDrop();

	// Initialize positions based on player count
	if (players === 'Uno') {
		player1.y = 443;
		player1.x = 200;
	} else {
		player1.x = 300;
		player1.y = 443;
		player2.x = 100;
		player2.y = 443;
	}
	// Initialize player shots
	resetPlayerShots(player1);
	resetPlayerShots(player2);

	// Left game area
	renderer.setFillStyle(0, 0); // solid black background
	renderer.bar(0, 0, 400, canvas.height);

	// Right panel
	renderer.setFillStyle(1, 1); // solid blue background
	renderer.bar(400, 0, canvas.width, canvas.height);

	// Panel borders
	renderer.setColor(12);
	renderer.rectangle(400, 0, canvas.width, canvas.height);

	// Header of the panel
	drawSidePanelLogo();

	// Fixed text and lines for Player 1
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

	// Fixed text and lines for Player 2 if active
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

	// Draw initial lives
	for (let i = 1; i <= player1.lives; i++) {
		drawPlayer(650 - (30 * i), 90, 1, false);
	}
	if (players === 'Dos') {
		for (let i = 1; i <= player2.lives; i++) {
			drawPlayer(650 - (30 * i), 400, 2, false);
		}
	}

	// Show initial energy
	showEnergy(player1.energy, 1);
	if (players === 'Dos') showEnergy(player2.energy, 2);

	// Draw player ships in initial positions
	drawPlayer(player1.x, player1.y, 1);
	if (players === 'Dos') drawPlayer(player2.x, player2.y, 2);

	// Initialize enemies
	totalEnemies = 2; // Start with 2 enemies
	initEnemies(currentScreen, 5);
	totalKilled = 0;
	finalBossActive = false;
	bossEnergy = 0;
	bossNX = 200;
	bossNY = -110;
}

function drawSidePanelLogo() {
	let y_base = players === 'Dos' ? 180 : 300;

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

// --- Game progression function ---
function updateGameProgression() {
	if (totalKilled === 1) {
		totalEnemies = 3;
	}
	if (totalKilled === 10) {
		maxPlayerShots = 2;
	}
	if (totalKilled === 20) {
		totalEnemies = 4;
	}
	if (totalKilled === 30) {
		totalEnemies = 5;
		maxPlayerShots = 3;
	}
	if (totalKilled === 40) {
		maxPlayerShots = 4;
	}
}

// --- Enemy functions ---
function initEnemies(screenNumber, enemiesToInitialize) {
	for (let i = 0; i < enemiesToInitialize; i++) {
		enemies[i].x = Math.floor(Math.random() * 380);
		enemies[i].y = -Math.floor(Math.random() * 90);
		enemies[i].code = screenNumber; // Default enemy type
		enemies[i].firing = false;
		enemies[i].shotX = -10;
		enemies[i].shotY = -10;
		enemies[i].control = false;
	}
	// Remaining inactive enemies
	for (let i = enemiesToInitialize; i < 5; i++) {
		enemies[i].y = -20;
		enemies[i].firing = false;
	}
}

function updateEnemies(screenNumber) {
	for (let i = 0; i < totalEnemies; i++) {
		// Movement based on screen
		switch (screenNumber) {
			case 1:
				// Move horizontally toward the player
				if (Math.random() < 0.5) {
					const step = (Math.random() * 3 + 1) * timeFactor;
					if (enemies[i].x > player1.x) {
						enemies[i].x -= step;
					} else {
						enemies[i].x += step;
					}
				} else {
					const step = (Math.random() * 3 + 1) * timeFactor;
					if (enemies[i].x < player1.x) {
						enemies[i].x -= step;
					} else {
						enemies[i].x += step;
					}
				}
				break;
			case 2:
				// Oscillating movement
				if (Math.floor(enemies[i].y) % 150 === 0) {
					enemies[i].control = !enemies[i].control;
				}
				if (enemies[i].control) {
					enemies[i].x += timeFactor;
				} else {
					enemies[i].x -= timeFactor;
				}
				break;
			case 3:
				// Special vertical movement
				if (Math.floor(enemies[i].y) % 18 === 0) {
					enemies[i].y += 19 * timeFactor;
				} else if (Math.random() < 0.5) {
					enemies[i].y += timeFactor;
				}
				break;
		}

		// Limit horizontally
		if (enemies[i].x < 30) enemies[i].x = 30;
		if (enemies[i].x > 380) enemies[i].x = 380;

		// Vertical movement (except for screenNumber=3)
		if (screenNumber !== 3) {
			enemies[i].y += timeFactor;
		}

		// Reset if it exits below
		if (enemies[i].y > 480) {
			totalKilled++; // Count as escape
			enemies[i].y = -50;
			enemies[i].x = Math.floor(Math.random() * 440);
		}
	}
}

function updateEnemyShots(screenNumber) {
	let difficultyValue = 200;
	if (difficulty === 'Media') difficultyValue = 100;
	else if (difficulty === 'Difícil') difficultyValue = 10;

	if (finalBossActive) {
		difficultyValue = difficultyValue / 2;
	}

	for (let i = 0; i < totalEnemies; i++) {
		// Generate enemy shot
		if (!enemies[i].firing && (Math.floor(Math.random() * difficultyValue) === 3)) {
			enemies[i].firing = true;
			if (finalBossActive) {
				enemies[i].shotX = bossNX + ((i % 2 == 0) ? -60 : 60);
				enemies[i].shotY = bossNY + 80;
			} else {
				enemies[i].shotX = enemies[i].x;
				enemies[i].shotY = enemies[i].y;
			}
		}

		// Update enemy shot
		if (enemies[i].firing) {
			updateEnemyShot(i, screenNumber);
		}
	}
}

function updateEnemyShot(enemyIndex, screenNumber) {
	const e = enemies[enemyIndex];

	// Move shot based on screen
	if (screenNumber === 1) {
		e.shotY += 2 * timeFactor; // Vertical
	} else if (screenNumber === 2 || screenNumber === 3) {
		if (finalBossActive && screenNumber !== 3) {
			e.shotY += 5 * timeFactor; // Faster when boss is active
		} else {
			e.shotY += 3 * timeFactor;
		}
	}

	// Random horizontal movement toward the nearest alive player on screens 1 and 3
	if (screenNumber === 1 || screenNumber === 3) {
		let playerX = player1.x;
		if (players === 'Dos') {
			const player1Alive = player1.lives > 0;
			const player2Alive = player2.lives > 0;
			if (!player1Alive && player2Alive) {
				playerX = player2.x;
			} else if (player1Alive && !player2Alive) {
				playerX = player1.x;
			} else if (player1Alive && player2Alive) {
				const dist1 = Math.abs(e.shotX - player1.x);
				const dist2 = Math.abs(e.shotX - player2.x);
				playerX = dist1 <= dist2 ? player1.x : player2.x;
			}
		}
		if (Math.random() < 0.5) {
			if (e.shotX > playerX) {
				e.shotX -= Math.random() * 7 * timeFactor;
			} else {
				e.shotX += Math.random() * 7 * timeFactor;
			}
		} else {
			if (e.shotX < playerX) {
				e.shotX -= Math.random() * 4 * timeFactor;
			} else {
				e.shotX += Math.random() * 4 * timeFactor;
			}
		}
	}

	// Limit X
	if (e.shotX > 396) e.shotX = 396;

	// Draw enemy shot
	renderer.setColor(12);
	renderer.circle(e.shotX, e.shotY, 3);
	renderer.circle(e.shotX, e.shotY, 2);
	renderer.setColor(14);
	renderer.circle(e.shotX, e.shotY, 1);

	// Deactivate if off-screen
	if (e.shotY > 479) {
		e.firing = false;
	}
}

function drawEnemies(screenNumber) {
	for (let i = 0; i < totalEnemies; i++) {
		if (!finalBossActive) {
			// If not screen 3, draw according to assigned enemy code.
			// On screen 3 the original Pascal alternates between variants 3 and 4
			// based on the Y position
			if (screenNumber !== 3) {
				drawEnemy(enemies[i].x, enemies[i].y, enemies[i].code);
			} else {
				const code = (enemies[i].y % 18 > 12) ? 4 : 3;
				drawEnemy(enemies[i].x, enemies[i].y, code);
			}
		}
	}
}

function checkPlayerShotCollisions(playerNum) {
	if (finalBossActive) return;

	const player = playerNum === 1 ? player1 : player2;
	const missileHitboxX = 16;
	const missileHitboxYTop = -6;
	const missileHitboxYBottom = 20;

	// Check collisions with normal shots
	for (let d = 0; d < player.shots.length; d++) {
		if (!player.shots[d]) continue;

		for (let e = 0; e < totalEnemies; e++) {
			// Hitbox check
			if (player.bulletY[d] < enemies[e].y + missileHitboxYBottom &&
				player.bulletY[d] > enemies[e].y + missileHitboxYTop &&
				player.bulletX[d] > enemies[e].x - missileHitboxX &&
				player.bulletX[d] < enemies[e].x + missileHitboxX) {
				// Collision!
				if (!player.laser) {
					player.shots[d] = false;
					player.bulletX[d] = -10;
					player.bulletY[d] = -10;
				}
				spawnPillDrop(enemies[e].x, enemies[e].y);
				// Reset enemy
				enemies[e].y = -80;
				enemies[e].x = Math.floor(Math.random() * 380);
				totalKilled++;
				player.score += 5;
				player.enemiesKilled++;
			}
		}

		// Check collisions with angular shots
		if (player.angularShot) {
			const angularShotXRight = player.angularShotXRight;
			const angularShotXLeft = player.angularShotXLeft;
			const angularShotY = player.angularShotY;

			for (let e = 0; e < totalEnemies; e++) {
				// Right ball
				if (angularShotXRight !== -10 && angularShotY !== -10) {
					if (angularShotY < enemies[e].y + missileHitboxYBottom &&
						angularShotY > enemies[e].y + missileHitboxYTop &&
						angularShotXRight > enemies[e].x - missileHitboxX &&
						angularShotXRight < enemies[e].x + missileHitboxX) {
						spawnPillDrop(enemies[e].x, enemies[e].y);
						enemies[e].y = -80;
						enemies[e].x = Math.floor(Math.random() * 380);
						totalKilled++;
						player.score += 5;
						player.enemiesKilled++;
					}
				}
				// Left ball
				if (angularShotXLeft !== -10 && angularShotY !== -10) {
					if (angularShotY < enemies[e].y + missileHitboxYBottom &&
						angularShotY > enemies[e].y + missileHitboxYTop &&
						angularShotXLeft > enemies[e].x - missileHitboxX &&
						angularShotXLeft < enemies[e].x + missileHitboxX) {
						spawnPillDrop(enemies[e].x, enemies[e].y);
						enemies[e].y = -80;
						enemies[e].x = Math.floor(Math.random() * 380);
						totalKilled++;
						player.score += 5;
						player.enemiesKilled++;
					}
				}
			}
		}
	}
}

function handleFinalBoss() {
	if (totalKilled % 50 === 0 && totalKilled !== 0 && !finalBossActive) {
		finalBossActive = true;
		bossEnergy = 0;
		bossNX = 200;
		bossNY = -110;
	}

	if (!finalBossActive) return;

	const addBossEnergyFromShot = () => {
		return currentScreen === 1 ? 15 : 10;
	};

	const resolveBossDefeat = (player, playerNum) => {
		totalKilled++;
		player.score += 50;
		player.enemiesKilled++;
		bossExplosionState.active = true;
		bossExplosionState.x = playerNum === 1 ? Math.min(bossNX, 300) : bossNX;
		bossExplosionState.y = bossNY;
		bossExplosionState.suma = 1;
		bossExplosionState.repeats = 0;
		bossExplosionState.rx = 0;
		bossExplosionState.timer = 0;
		bossExplosionState.targetPlayer = playerNum;
		gameState = GAME_STATES.BOSS_EXPLOSION;
	};

	const processNormalShotsToBoss = (player, playerNum) => {
		for (let d = 0; d < player.shots.length; d++) {
			if (!player.shots[d]) continue;

			if (player.bulletY[d] < bossNY + 100 && player.bulletY[d] > bossNY &&
				player.bulletX[d] > bossNX - 25 && player.bulletX[d] < bossNX + 25) {
				bossEnergy += addBossEnergyFromShot();
				player.shots[d] = false;
				player.bulletX[d] = -10;
				player.bulletY[d] = -10;

				if (bossEnergy >= 360) {
					resolveBossDefeat(player, playerNum);
					return true;
				}
			}
		}

		return false;
	};

	const processAngularShotsToBoss = (player, playerNum) => {
		if (!player.angularShot || player.angularShotY === -10) return false;

		const rightX = player.angularShotXRight;
		const leftX = player.angularShotXLeft;
		const shotY = player.angularShotY;

		// Angular shots deal 20 energy
		if (rightX !== -10 && shotY < bossNY + 100 && shotY > bossNY && rightX > bossNX - 25 && rightX < bossNX + 25) {
			bossEnergy += 20;
			player.angularShotXRight = -10;

			if (bossEnergy >= 360) {
				resolveBossDefeat(player, playerNum);
				return true;
			}
		}

		if (leftX !== -10 && shotY < bossNY + 100 && shotY > bossNY && leftX > bossNX - 25 && leftX < bossNX + 25) {
			bossEnergy += 20;
			player.angularShotXLeft = -10;

			if (bossEnergy >= 360) {
				resolveBossDefeat(player, playerNum);
				return true;
			}
		}

		if (player.angularShotXRight === -10 && player.angularShotXLeft === -10) {
			player.angularShotY = -10;
		}

		return false;
	};

	// Boss movement by screen
	switch (currentScreen) {
		case 1:
			if (Math.random() < 0.5 && bossNX < 320) {
				bossNX += Math.floor(Math.random() * 5) + 1;
			} else if (bossNX > 80) {
				bossNX -= Math.floor(Math.random() * 5) + 1;
			}
			break;
		case 2:
		case 3:
			// Controlled oscillation
			if ((bossNX % 330 <= 1 || bossNX < 70) || (bossNX % 35 === 1 && Math.random() < 0.5)) {
				bossControl = !bossControl;
			}
			if (bossControl) {
				bossNX += 4 - currentScreen;
			} else {
				bossNX -= 4 - currentScreen;
			}
			break;
	}

	if (bossNY < 100) {
		bossNY += Math.floor(Math.random() * 5) + 1;
	} else {
		bossNY -= Math.floor(Math.random() * 5) + 1;
	}

	// Clear previous boss energy indicator (or game logo when 2 players are playing)
	renderer.setFillStyle(1, 1);
	renderer.bar(405, 165, canvas.width - 5, 295);

	const bossWasDefeated = processNormalShotsToBoss(player1, 1)
		|| processAngularShotsToBoss(player1, 1)
		|| (players === 'Dos'
			&& (
				processNormalShotsToBoss(player2, 2)
				|| processAngularShotsToBoss(player2, 2)
			)
		);

	if (bossEnergy < 360) {
		let color = 12;
		let fillColor = 12;
		if (currentScreen === 2) {
			color = 11;
			fillColor = 3;
		}
		if (currentScreen === 3) {
			color = 10;
			fillColor = 2;
		}
		renderer.setColor(color);
		renderer.setFillStyle(6, fillColor);
		renderer.pieSlice(530, 230, bossEnergy, 360, 60);
		renderer.setFillStyle(0, fillColor);
		renderer.pieSlice(530, 230, bossEnergy, 360, 60);
	} else {
		// Restore game logo in case it's a 2-players game
		drawSidePanelLogo();
	}

	// Draw boss
	drawEnemyBossShip(bossNX, bossNY, currentScreen);
}

function nextScreen(playerNum) {
	// Advance screen (wrap to 1..3)
	currentScreen = currentScreen === 3 ? 1 : currentScreen + 1;
	// Reinitialize enemies for the next screen and reset boss
	initEnemies(currentScreen, totalEnemies);
	finalBossActive = false;
	bossEnergy = 0;
	bossNX = 200;
	bossNY = -110;
}

function showEnergy(energy, player) {
	const baseY = player === 1 ? 129 : 439;
	for (let i = 1; i <= initialEnergy; i++) {
		const x1 = 643 - (initialEnergy - i + 1) * 20;
		const x2 = 640 - (initialEnergy - i + 1) * 20;
		if (i <= energy) {
			// Available energy: two pie slices
			renderer.setFillStyle(1, 2);
			renderer.pieSlice(x1, baseY, 20, 340, 8);
			renderer.setColor(14);
			renderer.setFillStyle(0);
			renderer.pieSlice(x1, baseY, 20, 340, 8);
			renderer.setFillStyle(1, 12);
			renderer.pieSlice(x2, baseY, 110, 250, 5);
		} else {
			// Consumed energy: full pie slice
			renderer.setFillStyle(1, 1);
			renderer.pieSlice(x1, baseY, 0, 360, 8);
			renderer.setColor(12);
			renderer.setFillStyle(0);
			renderer.pieSlice(x1, baseY, 0, 360, 8);
		}
	}
}

function drawEffectDurationBar(player, playerNum) {
	const baseY = playerNum === 1 ? 129 : 439;
	const x0 = 414;
	const x1 = 516;
	const y0 = baseY - 1;
	const y1 = baseY + 3;

	// Clear the right panel bar area even if no effect is active
	renderer.setFillStyle(1, 1);
	renderer.bar(x0 - 1, y0 - 1, x1 + 1, y1 + 1);

	if (player.effectDuration <= 0) return;

	// Max effect duration is fixed at 800 frames
	const maxDuration = 800;
	const width = Math.max(0, Math.min(100, Math.floor((player.effectDuration / maxDuration) * 100)));

	renderer.setColor(11);
	renderer.rectangle(x0, y0, x1, y1);
	renderer.setFillStyle(1, 12);
	renderer.bar(x0 + 1, y0 + 1, x0 + width, y1 - 1);
}

function eraseLifeIcon(playerNum, lifeIndex) {
	const y = playerNum === 1 ? 90 : 400;
	const x = 650 - (30 * lifeIndex);
	renderer.setFillStyle(1, 1);
	renderer.bar(x - 14, y - 22, x + 14, y + 12);
}

function resetPlayerEffects(player) {
	player.shield = false;
	player.shieldCounter = 0;
	player.laser = false;
	player.angularShot = false;
	player.angularShotY = -10;
	player.angularShotXLeft = -10;
	player.angularShotXRight = -10;
	player.speedBoost = false;
	player.controlsChanged = false;
	player.effectDuration = 0;
}

function resetPlayerShots(player) {
	player.shots = [false, false, false, false];
	player.bulletX = [-10, -10, -10, -10];
	player.bulletY = [-10, -10, -10, -10];
	player.bullets = 0;
}

function losePlayerLife(player, playerNum) {
	if (player.lives <= 0) return;

	eraseLifeIcon(playerNum, player.lives);
	player.lives = Math.max(0, player.lives - 1);
	resetPlayerEffects(player);
	player.x = playerNum == 2 ? 100 : players === 'Uno' ? 200 : 300;
	player.y = 443;
	player.energy = initialEnergy;
	showEnergy(player.energy, playerNum);

	if (player.lives > 0) {
		gameState = GAME_STATES.LIFE_LOST;
		keysPressed = {};
	} else {
		const otherPlayerDead = playerNum === 1 ? player2.lives === 0 : player1.lives === 0;
		if (players === 'Uno' || otherPlayerDead) {
			prepareStatsScreen(null);
			gameState = GAME_STATES.STATS_SCREEN;
		} else {
			gameState = GAME_STATES.LIFE_LOST;
			keysPressed = {};
		}
	}
}

function handleEnemyBulletHit(player, playerNum) {
	if (player.lives <= 0) return;

	if (player.shield) {
		player.shieldCounter++;
		if (player.shieldCounter >= 5) {
			player.shield = false;
			player.shieldCounter = 0;
		}
		return;
	}

	player.energy = Math.max(0, player.energy - 1);
	showEnergy(player.energy, playerNum);

	if (currentScreen === 3) {
		player.y = Math.min(canvas.height - 8, player.y + 30);
	}

	if (player.energy === 0) {
		losePlayerLife(player, playerNum);
	}
}

function checkEnemyShotCollisions() {
	for (let i = 0; i < totalEnemies; i++) {
		const enemy = enemies[i];
		if (!enemy.firing) continue;

		const playersToCheck = [
			{ player: player1, num: 1 }
		];
		if (players === 'Dos') {
			playersToCheck.push({ player: player2, num: 2 });
		}

		for (const entry of playersToCheck) {
			const player = entry.player;
			const playerNum = entry.num;
			if (player.lives <= 0) continue;

			if (enemy.shotY > player.y - 20 && enemy.shotY < player.y + 5 &&
				enemy.shotX > player.x - 13 && enemy.shotX < player.x + 13) {
				enemy.firing = false;
				enemy.shotX = -10;
				enemy.shotY = -10;
				handleEnemyBulletHit(player, playerNum);
				break;
			}
		}
	}
}

function getCrashPoints(isBoss) {
	return isBoss ? 10 : 1;
}

function checkPlayerEnemyCollisions() {
	const playersToCheck = [
		{ player: player1, num: 1 }
	];
	if (players === 'Dos') {
		playersToCheck.push({ player: player2, num: 2 });
	}

	for (const entry of playersToCheck) {
		const player = entry.player;
		const playerNum = entry.num;
		if (player.lives <= 0) continue;

		if (!finalBossActive) {
			for (let i = 0; i < totalEnemies; i++) {
				const enemy = enemies[i];
				if (enemy.y < -20 || enemy.y > 480) continue;

				const enemyHit = player.x > enemy.x - 15 && player.x < enemy.x + 15 &&
					player.y > enemy.y - 5 && player.y < enemy.y + 25;
				if (!enemyHit) continue;

				player.score += getCrashPoints(false);
				player.enemiesCrashed++;
				totalKilled++;
				enemy.y = -80;
				enemy.x = Math.floor(Math.random() * 380);
				losePlayerLife(player, playerNum);
				break;
			}
		} else if (bossNY < 480) {
			const bossHit = player.x > bossNX - 60 && player.x < bossNX + 60 &&
				player.y > bossNY - 10 && player.y < bossNY + 90;
			if (bossHit) {
				player.score += getCrashPoints(true);
				player.enemiesCrashed++;
				losePlayerLife(player, playerNum);
			}
		}
	}
}

function finishBossExplosion() {
	bossExplosionState.active = false;
	bossExplosionState.timer = 0;
	prepareStatsScreen(bossExplosionState.targetPlayer);
	gameState = GAME_STATES.STATS_SCREEN;
	keysPressed = {};
}

function updateBossExplosion(deltaTime) {
	if (!bossExplosionState.active) return;
	bossExplosionState.timer += deltaTime;
	if (bossExplosionState.timer < 30) return;
	bossExplosionState.timer -= 30;
	bossExplosionState.rx = Math.random() * 60;
	bossExplosionState.suma++;
	if (bossExplosionState.suma > 30) {
		bossExplosionState.suma = 1;
		bossExplosionState.repeats++;
	}
	if (bossExplosionState.repeats >= 3) {
		finishBossExplosion();
	}
}

function renderBossExplosion() {
	const x = bossExplosionState.x;
	const y = bossExplosionState.y;
	const suma = bossExplosionState.suma;
	const rx = bossExplosionState.rx;

	renderer.setColor(12);
	renderer.circle(x + rx, y, 5 + suma);
	renderer.setColor(4);
	renderer.circle(x + rx - 3, y + 3, 30 - suma);
	renderer.setColor(6);
	renderer.circle(x + rx + 6, y + 5, Math.floor(suma / 3));
	renderer.setColor(14);
	renderer.circle(x + rx - (suma + 5), y, Math.floor((suma * 2) / 3));
}

function calculateEfficiency(kills, crashes) {
	const efficiency = ((kills - crashes) / totalKilled) * 100;
	return Math.max(0, Math.round(efficiency));
}

function prepareStatsScreen(targetPlayer) {
	statsState.active = true;
	statsState.targetPlayer = targetPlayer;
	statsState.isGameOver = targetPlayer === null;
	statsState.player1Kills = player1.enemiesKilled;
	statsState.player1Crashes = player1.enemiesCrashed;
	statsState.player1Efficiency = calculateEfficiency(player1.enemiesKilled, player1.enemiesCrashed);
	statsState.player2Kills = player2.enemiesKilled;
	statsState.player2Crashes = player2.enemiesCrashed;
	statsState.player2Efficiency = calculateEfficiency(player2.enemiesKilled, player2.enemiesCrashed);
}

function drawStatsScreen() {
	const top = players === 'Uno' ? 50 : 10;
	const bottom = players === 'Uno' ? 350 : 470;

	renderer.setFillStyle(1, 0);
	renderer.bar(50, top, 350, bottom);
	renderer.setFillStyle(10, 4);
	renderer.setColor(12);
	renderer.bar3d(50, top, 350, bottom, 4, true);

	if (players === 'Uno') {
		renderer.line(51, 325, 350, 325);
		renderer.setColor(11);
		renderer.setTextStyle(3, 0, 3);
		renderer.outTextXY(200, 80, 'x');
		renderer.setColor(12);
		renderer.outTextXY(230, 80, statsState.player1Kills.toString());
		renderer.outTextXY(80, 140, statsState.player1Crashes + ' Choques');
		renderer.outTextXY(75, 200, ': EFICIENCIA :');
		renderer.setTextStyle(10, 0, 4);
		renderer.outTextXY(160, 260, statsState.player1Efficiency + '%');
		renderer.setTextStyle(11, 0, 1);
		renderer.setColor(11);
		renderer.outTextXY(100, 333, 'Presione ENTER Para Continuar');
		drawEnemy(160, 90, currentScreen);
	} else {
		renderer.line(51, 445, 350, 445);
		renderer.line(51, 230, 350, 230);
		renderer.setColor(11);
		renderer.setTextStyle(3, 0, 3);
		renderer.outTextXY(200, 20, 'x');
		renderer.outTextXY(200, 240, 'x');
		renderer.setColor(12);
		renderer.outTextXY(230, 20, statsState.player1Kills.toString());
		renderer.outTextXY(230, 240, statsState.player2Kills.toString());
		renderer.setTextStyle(3, 0, 3);
		renderer.outTextXY(80, 70, statsState.player1Crashes + ' Choques');
		renderer.outTextXY(80, 290, statsState.player2Crashes + ' Choques');
		renderer.outTextXY(75, 130, ': EFICIENCIA :');
		renderer.outTextXY(75, 350, ': EFICIENCIA :');
		renderer.setTextStyle(10, 0, 4);
		renderer.outTextXY(160, 170, statsState.player1Efficiency + '%');
		renderer.outTextXY(160, 390, statsState.player2Efficiency + '%');
		renderer.setTextStyle(11, 0, 1);
		renderer.setColor(11);
		renderer.outTextXY(100, 453, 'Presione ENTER Para Continuar');
		drawEnemy(160, 30, currentScreen);
		drawEnemy(160, 250, currentScreen);
	}
}

// Object drawing functions for the game
function drawPill(x, y, pillType) {
	// Map pill types to Pascal BGI colors
	let color;
	switch (pillType) {
		case PILL_TYPES.POINTS_100: color = 11; break;
		case PILL_TYPES.ENERGY_FULL: color = 2; break;
		case PILL_TYPES.CONTROLS_CHANGE: color = 12; break;
		case PILL_TYPES.SPEED_BOOST: color = 15; break;
		case PILL_TYPES.ANGULAR_SHOT: color = 5; break;
		case PILL_TYPES.LASER: color = 14; break;
		case PILL_TYPES.SHIELD: color = 13; break;
		default: color = 0; break;
	}

	// Draw outer arcs
	renderer.setColor(color);
	renderer.arc(x, y, 0, 90, 5);
	renderer.arc(x, y, 0, 90, 6);
	renderer.arc(x, y, 180, 270, 5);
	renderer.arc(x, y, 180, 270, 6);

	// Draw concentric circles
	renderer.setColor(12); // Red for border
	renderer.circle(x, y, 3);
	renderer.setColor(4);  // Dark red for inner border
	renderer.circle(x, y, 2);
	renderer.setColor(14); // Yellow for center
	renderer.circle(x, y, 1);
}

function clearPill(x, y) {
	// Erase pill by drawing a black rectangle over it
	renderer.setFillStyle(0, 0); // Solid black
	renderer.bar(x - 6, y - 7, x + 6, y + 7);
}

function cancelPillDrop() {
	pillDrop.active = false;
	pillDrop.x = -10;
	pillDrop.y = -10;
	pillDrop.type = 0;
}

function spawnPillDrop(x, y) {
	if (pillDrop.active) return;
	if (Math.floor(Math.random() * pill) !== 3) return;
	pillDrop.active = true;
	pillDrop.x = x;
	pillDrop.y = y;
	pillDrop.type = Math.floor(Math.random() * 7) + 1;
}

function applyPillEffect(player, playerNum, pillType) {
	switch (pillType) {
		case PILL_TYPES.POINTS_100:
			player.score += 100;
			break;
		case PILL_TYPES.ENERGY_FULL:
			player.energy = initialEnergy;
			showEnergy(player.energy, playerNum);
			break;
		case PILL_TYPES.CONTROLS_CHANGE:
			player.controlsChanged = true;
			player.effectDuration = 800;
			break;
		case PILL_TYPES.SPEED_BOOST:
			player.speedBoost = true;
			player.effectDuration = 800;
			break;
		case PILL_TYPES.ANGULAR_SHOT:
			player.angularShot = true;
			break;
		case PILL_TYPES.LASER:
			player.laser = true;
			break;
		case PILL_TYPES.SHIELD:
			player.shield = true;
			player.shieldCounter = 0;
			break;
		default:
			break;
	}
	player.score += 5;
}

function updatePlayerEffects(player) {
	if (player.effectDuration > 0) {
		player.effectDuration -= timeFactor;
		if (player.effectDuration <= 0) {
			player.effectDuration = 0;
			player.speedBoost = false;
			player.controlsChanged = false;
		}
	}
}

function checkPillPickup(player, playerNum) {
	if (!pillDrop.active) return false;
	if (pillDrop.x > player.x - 20 && pillDrop.x < player.x + 20 &&
		pillDrop.y > player.y - 25 && pillDrop.y < player.y + 10) {
		applyPillEffect(player, playerNum, pillDrop.type);
		cancelPillDrop();
		return true;
	}
	return false;
}

function updatePillDrop() {
	if (!pillDrop.active) return;
	pillDrop.y += timeFactor;
	if (pillDrop.y > 480) {
		cancelPillDrop();
		return;
	}
	if (player1.lives > 0 && checkPillPickup(player1, 1)) return;
	if (players === 'Dos' && player2.lives > 0) checkPillPickup(player2, 2);
}

// --- Shots: missiles, lasers and angular shots (both players)
function drawMissile(x, y, color) {
	renderer.setColor(color);
	// Projectile bodies
	renderer.line(x - 5, y, x - 5, y - 7);
	renderer.line(x + 5, y, x + 5, y - 7);
	// Semicircular tips
	// Center the arcs on the same Y coordinate as in the original Pascal
	renderer.arc(x - 5, y, 0, 180, 3);
	renderer.arc(x + 5, y, 0, 180, 3);
}

function drawLaser(x, y, color) {
	// Draw laser as two fast projectiles (left and right)
	// Draw several vertical lines to give thickness and color variation
	// Left
	renderer.setColor(2);
	renderer.line(x - 7, y, x - 7, y - 7);
	renderer.line(x - 6, y, x - 6, y - 7);
	renderer.setColor(4);
	renderer.line(x - 4, y, x - 4, y - 7);
	renderer.line(x - 3, y, x - 3, y - 7);
	renderer.setColor(color);
	renderer.line(x - 5, y, x - 5, y - 7);
	// Right (mirror)
	renderer.setColor(2);
	renderer.line(x + 7, y, x + 7, y - 7);
	renderer.line(x + 6, y, x + 6, y - 7);
	renderer.setColor(4);
	renderer.line(x + 4, y, x + 4, y - 7);
	renderer.line(x + 3, y, x + 3, y - 7);
	renderer.setColor(color);
	renderer.line(x + 5, y, x + 5, y - 7);
}

function updateShots() {
	const missileSpeed = 5;
	// Player 1
	for (let i = 0; i < player1.shots.length; i++) {
		if (!player1.shots[i]) continue;
		// Move bullet and draw: if it's a laser we draw the laser version at the bullet's position
		player1.bulletY[i] -= missileSpeed * timeFactor;
		if (player1.laser) {
			drawLaser(player1.bulletX[i], player1.bulletY[i], 14);
		} else {
			drawMissile(player1.bulletX[i], player1.bulletY[i], 14);
		}
		// Out of screen -> deactivate
		if (player1.bulletY[i] < -20 || player1.bulletX[i] < -50 || player1.bulletX[i] > 450) {
			player1.shots[i] = false;
			player1.bullets = Math.max(0, player1.bullets - 1);
		}
	}

	// Player 2
	for (let i = 0; i < player2.shots.length; i++) {
		if (!player2.shots[i]) continue;
		player2.bulletY[i] -= missileSpeed * timeFactor;
		if (player2.laser) {
			drawLaser(player2.bulletX[i], player2.bulletY[i], 11);
		} else {
			drawMissile(player2.bulletX[i], player2.bulletY[i], 11);
		}
		if (player2.bulletY[i] < -20 || player2.bulletX[i] < -50 || player2.bulletX[i] > 450) {
			player2.shots[i] = false;
			player2.bullets = Math.max(0, player2.bullets - 1);
		}
	}
}

function updateAngularShots() {
	// Bounds to avoid drawing into the right panel
	const leftBound = 6;
	const rightBound = 389;
	const topBound = 4;

	const updatePlayerAngularShots = (player) => {
		if (!player.angularShot) return;

		// If inactive, all values are -10
		if (player.angularShotXLeft === -10 && player.angularShotXRight === -10 && player.angularShotY === -10) {
			return;
		}

		// Move angular shots and deactivate when out of bounds
		if (player.angularShotXRight !== -10) {
			player.angularShotXRight = player.angularShotXRight > rightBound ? -10 : player.angularShotXRight + 3 * timeFactor;
		}
		if (player.angularShotXLeft !== -10) {
			player.angularShotXLeft = player.angularShotXLeft < leftBound ? -10 : player.angularShotXLeft - 3 * timeFactor;
		}
		if (player.angularShotY !== -10) {
			player.angularShotY = player.angularShotY < topBound ? -10 : player.angularShotY - 3 * timeFactor;
		}

		// Draw if within left game area
		renderer.setColor(10);
		if (player.angularShotXRight !== -10 && player.angularShotY !== -10 && player.angularShotXRight < 400) {
			renderer.circle(player.angularShotXRight, player.angularShotY, 2);
			renderer.circle(player.angularShotXRight, player.angularShotY, 1);
		}
		if (player.angularShotXLeft !== -10 && player.angularShotY !== -10 && player.angularShotXLeft < 400) {
			renderer.circle(player.angularShotXLeft, player.angularShotY, 2);
			renderer.circle(player.angularShotXLeft, player.angularShotY, 1);
		}
	};

	updatePlayerAngularShots(player1);
	updatePlayerAngularShots(player2);
}


// Game control state
let keysPressed = {};

// Keyboard handling
document.addEventListener('keydown', (event) => {
	if (gameState === GAME_STATES.MENU) {
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
					gameState = GAME_STATES.GAME_START;
					menuInitialized = false; // Reset for next time entering the menu
					keysPressed = {};
				} else if (selectedOption === 3) {
					gameState = GAME_STATES.HIGHSCORES;
				} else if (selectedOption === 4) {
					location.reload();
				}
				break;
		}
	} else if (gameState === GAME_STATES.GAME_START) {
		// Any key starts the game
		gameState = GAME_STATES.GAME;
		keysPressed = {};
	} else if (gameState === GAME_STATES.GAME) {
		const lowerCaseKey = event.key.toLowerCase();
		if (movementKeysPlayer1Set.has(lowerCaseKey)) {
			movementKeysPlayer1Set.forEach((key) => keysPressed[key] = false);
		} else if (movementKeysPlayer2Set.has(lowerCaseKey)) {
			movementKeysPlayer2Set.forEach((key) => keysPressed[key] = false);
		}

		// Track pressed keys
		keysPressed[lowerCaseKey] = true;

		// Escape handling to exit
		if (event.key === 'Escape') {
			gameState = GAME_STATES.CONFIRM_EXIT;
			confirmExitStartTime = Date.now();
		} else if (event.key === ';' || event.key === 'F1' || event.key === '?') {
			gameState = GAME_STATES.HELP;
		}
	} else if (gameState === GAME_STATES.CONFIRM_EXIT) {
		// Only process keyboard after half a second to avoid accidental cancellation
		if (Date.now() - confirmExitStartTime >= 500) {
			if (event.key === 'Escape') {
				// Confirm exit to menu
				gameState = GAME_STATES.MENU;
				keysPressed = {};
				menuInitialized = false;
			} else {
				// Any other key cancels confirmation and returns to the game
				gameState = GAME_STATES.GAME;
				keysPressed = {};
			}
		}
	} else if (gameState === GAME_STATES.HELP) {
		if (event.key === 'Escape') {
			gameState = GAME_STATES.GAME;
		}
	} else if (gameState === GAME_STATES.LIFE_LOST) {
		if (event.key === ' ' || event.key === '1') {
			renderer.setTextStyle(1, 0, 1);
			renderer.setColor(1);
			renderer.outTextXY(460, 145, '███████████████');
			renderer.outTextXY(425, 153, '███████████████████████████████');
			gameState = GAME_STATES.GAME;
			keysPressed = {};
		}
	} else if (gameState === GAME_STATES.STATS_SCREEN) {
		if (event.key === 'Enter') {
			statsState.active = false;
			if (statsState.isGameOver) {
				if (statsState.pendingHighscores.length > 0) {
					statsState.highscoreEntryActive = true;
					statsState.currentHighIndex = 0;
					statsState.nameBuffer = '';
					gameState = GAME_STATES.HIGHSCORE_ENTRY;
				} else {
					gameState = GAME_STATES.MENU;
					menuInitialized = false;
					keysPressed = {};
				}
			} else {
				nextScreen(statsState.targetPlayer);
				gameState = GAME_STATES.GAME;
				keysPressed = {};
			}
		}
	} else if (gameState === GAME_STATES.HIGHSCORE_ENTRY) {
		if (event.key === 'Backspace') {
			event.preventDefault();
			statsState.nameBuffer = statsState.nameBuffer.slice(0, -1);
		} else if (event.key === 'Enter') {
			const entry = statsState.pendingHighscores[statsState.currentHighIndex];
			const name = statsState.nameBuffer.trim() || 'ANON';
			if (entry) addHighScore(name, entry.score, entry.player, entry.efficiency);
			statsState.currentHighIndex++;
			statsState.nameBuffer = '';
			if (statsState.currentHighIndex >= statsState.pendingHighscores.length) {
				statsState.highscoreEntryActive = false;
				gameState = GAME_STATES.MENU;
				menuInitialized = false;
				keysPressed = {};
			}
		} else if (event.key.length === 1 && statsState.nameBuffer.length < 8) {
			// Accept printable characters matching Pascal range ASCII 32..122
			const ch = event.key;
			const code = ch.charCodeAt(0);
			if (code >= 32 && code <= 122) {
				statsState.nameBuffer += ch;
			}
		}
	} else if (gameState === GAME_STATES.HIGHSCORES) {
		// Any key returns to the menu
		gameState = GAME_STATES.MENU;
		menuInitialized = false;
		keysPressed = {};
	}
});

document.addEventListener('keyup', (event) => {
	if (gameState === GAME_STATES.GAME) {
		if (!movementKeysPlayer1Set.has(event.key.toLowerCase())
			&& !movementKeysPlayer2Set.has(event.key.toLowerCase())
		) {
			keysPressed[event.key.toLowerCase()] = false;
		}
	}
});

function updatePlayerMovement() {
	const moveSpeed = 2; // Pixels per frame at normal speed
	const gameAreaWidth = 400;

	updatePlayerEffects(player1);
	updatePlayerEffects(player2);

	const player1Speed = (player1.speedBoost ? moveSpeed + 3 : moveSpeed) * timeFactor;
	const player2Speed = (player2.speedBoost ? moveSpeed + 3 : moveSpeed) * timeFactor;

	const p1Up = player1.controlsChanged ? 'arrowdown' : 'arrowup';
	const p1Down = player1.controlsChanged ? 'arrowup' : 'arrowdown';
	const p1Left = player1.controlsChanged ? 'arrowright' : 'arrowleft';
	const p1Right = player1.controlsChanged ? 'arrowleft' : 'arrowright';

	// Player 1: Arrows and space
	if (player1.lives > 0) {
		if (keysPressed[p1Up]) {
			player1.y = Math.max(20, player1.y - player1Speed);
		} else if (keysPressed[p1Down]) {
			player1.y = Math.min(canvas.height - 8, player1.y + player1Speed);
		} else if (keysPressed[p1Left]) {
			player1.x = Math.max(11, player1.x - player1Speed);
		} else if (keysPressed[p1Right]) {
			player1.x = Math.min(gameAreaWidth - 12, player1.x + player1Speed);
		}

		// Player 1 shot: Space
		if (keysPressed[' ']) {
			keysPressed[' '] = false;
			if (player1.shots.filter(shot => shot).length < maxPlayerShots) {
				const shotIndex = player1.shots.findIndex(shot => !shot);
				if (shotIndex !== -1) {
					player1.shots[shotIndex] = true;
					player1.bulletX[shotIndex] = player1.x;
					player1.bulletY[shotIndex] = player1.y - 20;
					player1.bullets++;
				}
			}
			// Start additional angular shot if active and none is in progress
			if (player1.angularShot && ((player1.angularShotXLeft === -10 && player1.angularShotXRight === -10) || player1.angularShotY === -10)) {
				player1.angularShotXLeft = player1.x;
				player1.angularShotXRight = player1.x;
				player1.angularShotY = player1.y;
			}
		}
	}

	const p2Up = player2.controlsChanged ? 's' : 'w';
	const p2Down = player2.controlsChanged ? 'w' : 's';
	const p2Left = player2.controlsChanged ? 'd' : 'a';
	const p2Right = player2.controlsChanged ? 'a' : 'd';

	// Player 2: AWSD and 1 (two-player mode only)
	if (players === 'Dos' && player2.lives > 0) {
		if (keysPressed[p2Up]) {
			player2.y = Math.max(20, player2.y - player2Speed);
		} else if (keysPressed[p2Down]) {
			player2.y = Math.min(canvas.height - 8, player2.y + player2Speed);
		} else if (keysPressed[p2Left]) {
			player2.x = Math.max(11, player2.x - player2Speed);
		} else if (keysPressed[p2Right]) {
			player2.x = Math.min(gameAreaWidth - 12, player2.x + player2Speed);
		}

		// Player 2 shot: 1
		if (keysPressed['1']) {
			keysPressed['1'] = false;
			if (player2.shots.filter(shot => shot).length < maxPlayerShots) {
				const shotIndex = player2.shots.findIndex(shot => !shot);
				if (shotIndex !== -1) {
					player2.shots[shotIndex] = true;
					player2.bulletX[shotIndex] = player2.x;
					player2.bulletY[shotIndex] = player2.y - 20;
					player2.bullets++;
				}
			}
			// Start additional angular shot if active and none is in progress
			if (player2.angularShot && ((player2.angularShotXLeft === -10 && player2.angularShotXRight === -10) || player2.angularShotY === -10)) {
				player2.angularShotXLeft = player2.x;
				player2.angularShotXRight = player2.x;
				player2.angularShotY = player2.y;
			}
		}
	}
}

function drawConfirmExitScreen() {
	renderer.setFillStyle(1, 1);
	renderer.bar(60, 200, 340, 230);
	renderer.setColor(12);
	renderer.rectangle(60, 200, 340, 230);

	// Show confirmation message
	renderer.setTextStyle(2, 0, 1);
	renderer.setColor(14);
	renderer.outTextXY(75, 210, 'Presione ESC nuevamente para salir');
}

function drawHelpScreen() {
	// Draw help window
	renderer.setFillStyle(1, 0);
	renderer.bar(100, 100, 350, 405);
	renderer.setFillStyle(6, 8); // \ pattern, grey color
	renderer.setColor(12); // Red for boder
	renderer.bar3d(100, 100, 350, 405, 4, true);

	// Titles
	renderer.setTextStyle(0, 0, 1.2);
	renderer.setColor(11); // Cyan
	renderer.outTextXY(115, 110, 'Lucas Capalbo Producciones');
	renderer.setColor(10); // Green
	renderer.outTextXY(130, 125, 'Space Ships Adventure');

	// Show examples of pills with descriptions
	renderer.setTextStyle(0, 0, 1);
	renderer.setColor(14); // Yellow

	// Pill 1: 100 points
	drawPill(170, 150, PILL_TYPES.POINTS_100);
	renderer.outTextXY(185, 148, '100 Puntos');

	// Pill 2: full energy
	drawPill(170, 170, PILL_TYPES.ENERGY_FULL);
	renderer.outTextXY(185, 168, 'Energía');

	// Pill 3: controls swap
	drawPill(170, 190, PILL_TYPES.CONTROLS_CHANGE);
	renderer.outTextXY(185, 188, 'Cambio De Controles');

	// Pill 4: speed boost
	drawPill(170, 210, PILL_TYPES.SPEED_BOOST);
	renderer.outTextXY(185, 208, 'Velocidad');

	// Pill 5: angular shot
	drawPill(170, 230, PILL_TYPES.ANGULAR_SHOT);
	renderer.outTextXY(185, 228, 'Disparo En Ángulo');

	// Pill 6: laser
	drawPill(170, 250, PILL_TYPES.LASER);
	renderer.outTextXY(185, 248, 'Laser');

	// Pill 7: shield
	drawPill(170, 270, PILL_TYPES.SHIELD);
	renderer.outTextXY(185, 268, 'Escudo x 5');

	// Additional information
	renderer.outTextXY(120, 290, 'Pastillas: 5 Puntos');
	renderer.outTextXY(120, 304, 'Enemigos: 5 Puntos');
	renderer.outTextXY(120, 318, 'Monstruos: 50 Puntos');
	renderer.outTextXY(120, 332, 'Choque A Enemigo: 1 Punto');
	renderer.outTextXY(120, 346, 'Choque A Monstruo: 10 Puntos');

	// Fecha y instrucción de salida
	renderer.setColor(12); // Rojo
	renderer.outTextXY(145, 370, 'Junio de 2026, Argentina');
	renderer.setColor(11); // Cyan
	renderer.outTextXY(132, 385, 'Presione Escape Para Cerrar');
}


function gameLoop() {
	switch (gameState) {
		case GAME_STATES.MENU:
			drawMenu();
			break;
		case GAME_STATES.GAME_START:
			timeFactor = getSpeedMultiplier();
			// Initialize game screen and show message
			setupGameScreen();
			renderer.setTextStyle(2, 0, 1.5);
			renderer.setColor(12);
			renderer.outTextXY(50, 200, 'Presione una tecla para comenzar');
			renderer.setTextStyle(2, 0, 1.3);
			renderer.outTextXY(50, 240, 'F1/? - Ayuda');
			renderer.outTextXY(50, 260, 'Esc - Volver a menu');
			renderer.outTextXY(50, 280, '↑←↓→ - Jugador 1   Espacio - Disparo');
			if (players === 'Dos') {
				renderer.outTextXY(50, 300, 'WASD - Jugador 2   1 - Disparo');
			}
			break;
		case GAME_STATES.GAME:
			writeScore(player1.score, 1);
			if (players === 'Dos') writeScore(player2.score, 2);

			updatePlayerMovement();

			// Redraw game area
			renderer.setFillStyle(0, 0);
			renderer.bar(0, 0, 400, canvas.height);

			// Draw player ships in current positions
			if (player1.lives > 0) {
				drawPlayer(player1.x, player1.y, 1);
			}
			if (players === 'Dos' && player2.lives > 0) {
				drawPlayer(player2.x, player2.y, 2);
			}

			// Update and draw angular shots and projectiles
			updateAngularShots();
			updateShots();
			// Update and draw enemies only when the final boss is not active
			if (!finalBossActive) {
				updateEnemies(currentScreen);
				drawEnemies(currentScreen);
			}
			// Always update enemy shots (even during the final boss)
			updateEnemyShots(currentScreen);
			handleFinalBoss();

			updatePillDrop();
			if (pillDrop.active) drawPill(pillDrop.x, pillDrop.y, pillDrop.type);
			// Draw pill duration bar
			drawEffectDurationBar(player1, 1);
			if (players === 'Dos') drawEffectDurationBar(player2, 2);

			// Check collisions with enemy shots
			checkEnemyShotCollisions();
			checkPlayerEnemyCollisions();

			// Check collisions with player shots
			checkPlayerShotCollisions(1);
			if (players === 'Dos') checkPlayerShotCollisions(2);
			// Update game progression based on totalKilled
			updateGameProgression();
			break;
		case GAME_STATES.BOSS_EXPLOSION:
			writeScore(player1.score, 1);
			if (players === 'Dos') writeScore(player2.score, 2);

			renderer.setFillStyle(0, 0);
			renderer.bar(0, 0, 400, canvas.height);
			if (player1.lives > 0) drawPlayer(player1.x, player1.y, 1);
			if (players === 'Dos' && player2.lives > 0) drawPlayer(player2.x, player2.y, 2);
			updateBossExplosion(16);
			renderBossExplosion();
			break;
		case GAME_STATES.STATS_SCREEN:
			drawStatsScreen();
			if (statsState.isGameOver) ensureHighscoreCheck();
			break;
		case GAME_STATES.HIGHSCORE_ENTRY:
			drawHighscoreEntry();
			break;
		case GAME_STATES.CONFIRM_EXIT:
			// Show frozen screen with confirmation message
			drawConfirmExitScreen();
			break;
		case GAME_STATES.HELP:
			drawHelpScreen();
			break;
		case GAME_STATES.HIGHSCORES:
			drawRankingScreen();
			break;
		case GAME_STATES.LIFE_LOST:
			renderer.setTextStyle(2, 0, 1);
			renderer.setColor(15);
			renderer.outTextXY(460, 145, 'Una Vida Menos');
			renderer.setColor(11);
			renderer.outTextXY(425, 153, 'Dispare Para Continuar');
			break;
	}
	requestAnimationFrame(gameLoop);
}


function startGame() {
	// Reset game state for new game
	gameState = GAME_STATES.MENU;
	menuInitialized = false;

	// Initialize sprite cache if not already done
	if (!spriteCache.player1_even) {
		initSpriteCache();
	}

	// Start the game loop
	requestAnimationFrame(gameLoop);
}

// Prepare sprite cache but don't start game yet
initSpriteCache();
