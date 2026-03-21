# SpaceShips Turbo Pascal -> HTML5/JS Migration

## 1. Objetivo del proyecto
Migrar la versión original de SpaceShips en Turbo Pascal 7 (con BGI) a HTML5/JavaScript, manteniendo estética retro 640x480 VGA y controles originales.

## 2. Arquitectura actual
- `index.html`: canvas 640x480 + carga de scripts.
- `style.css`: fondo negro y centrado de canvas.
- `renderer.js`: clase `Renderer` que emula BGI (line, circle, arc, ellipse, bar, pieSlice, floodFill, outTextXY, setTextStyle, etc.).
- `game.js`: lógica de juego, estado, menú, typewriter, dibujo de naves y enemigos.

## 3. Emulación BGI completada (renderer.js)
### 3.1. Colores y paleta
- Paleta 16 colores BGI 0-15.
- `_resolveColor()` para pasar nombres o índices.

### 3.2. Métodos gráficos
- `line`, `circle`, `arc`, `ellipse` con conversión de ángulos (inverso para imitar BGI).
- `bar`: rectángulo relleno.
- `pieSlice` con `fillStyle` (relleno/contorno).
- `floodFill`: implementación con `getImageData`, stack, límites y color de frontera.

### 3.3. Texto
- `setTextStyle(font,direction,size)` con 6 fuentes y outline opcional.
- `outTextXY(x,y,text)` con soporte horizontal y vertical (usando canvas rotate/translate).

## 4. Lógica de juego (game.js)
### 4.1. Estados
- `MENU`, `GAME`, `HIGHSCORES`.
- `gameLoop()` con `requestAnimationFrame`.

### 4.2. Menú principal
- `drawMenu()` con fondo, títulos, subtítulos, lista de opciones y flecha de selección.
- Variables: `selectedOption`, `players`, `speed`, `difficulty`.
- Controles: flechas/WASD/numpad + Enter.
- `leave` (Salir) recarga la página.

### 4.3. TypeWriter no bloqueante
- Refactor a estado (`typeWriterState`) en lugar de async/await vs `isTyping`.
- `startTypeWriter()`, `updateTypeWriter()` se ejecutan por frame.
- `drawMenu()` inicializa una única vez; luego solo actualiza y borra porciones necesarias.

### 4.4. Dibujo de sprites (lógica Pascal -> JS)
- `drawPlayer(x,y,player)` (naves jugador) : líneas, elipses, arcos.
- `drawEnemy(c,f,codigo)` (4 tipos): elipses, líneas, círculos, floodFill.
- `drawEnemyShip(nx,ny,npant)` (3 variantes de naves grandes).

### 4.5. Gestión de redibujado incremental
- `menuInitialized` para evitar dibujar completo cada frame.
- Solo actualiza flecha y datos modificados (`players`, `speed`, `difficulty`).
- `setFillStyle(0,1)` para apagado sólido; limpia con `bar()` el texto viejo sin borrar título.

## 5. Pendientes clave
1. Movimiento jugador en `GAME` (ASDW/numpad, física).
2. Lógica de disparo/colisión (Disparar y choques).
3. Puntuación, energía y `MostrarEnergia`/`EscribirPuntaje` de Pascal.
4. Pantalla `HIGHSCORES` con listado básico.
5. Mejoras en IA de enemigos y animación de frames.

---

### Nota de uso
Este documento es la base para retomar rápidamente la migración. Continúa agregando secciones conforme avances en el motor de juego y reglas de juego.
