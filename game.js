const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);

function gameLoop() {
  renderer.clearScreen();

  // Ejemplo de uso (puedes comentar/descomentar según lo necesites):
  renderer.setColor(15);
  renderer.line(10, 10, 630, 10);
  renderer.circle(320, 240, 50);
  renderer.ellipse(320, 240, 0, 360, 80, 40);
  renderer.setColor(14);
  renderer.bar(20, 430, 120, 470);
  renderer.setColor(12);
  renderer.setFillStyle(1, 12);
  renderer.pieSlice(540, 100, 0, 120, 30);
  renderer.setColor(7);
  renderer.outTextXY(10, 460, 'SpaceShips Retro - API BGI simplificada');

  requestAnimationFrame(gameLoop);
}

gameLoop();
