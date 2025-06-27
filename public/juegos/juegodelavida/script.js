// Referencias al DOM
const canvas        = document.getElementById('gameCanvas');
const ctx           = canvas.getContext('2d');
const modal         = document.getElementById('instructionsModal');
const closeModalBtn = document.getElementById('closeModal');
const replayBtn     = document.getElementById('replay');
const downloadBtn   = document.getElementById('download');
const loadBtn       = document.getElementById('load');
const startBtn      = document.getElementById('start');
const stopBtn       = document.getElementById('stop');
const clearBtn      = document.getElementById('clear');
const randomBtn     = document.getElementById('random');
const genCounter    = document.getElementById('genCounter');

// Parámetros del tablero
const cellSize = 10, cols = 80, rows = 50;
canvas.width  = cols * cellSize;
canvas.height = rows * cellSize;

// Estado del juego
let grid           = createGrid(),
    initialPattern = null,
    running        = false,
    interval       = null,
    replayState    = 0,   // 0=inicial, 1=restaurado, 2=en reproducción
    generation     = 0;

// Compara dos grids para ver si están idénticos
function gridsEqual(a, b) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (a[y][x] !== b[y][x]) return false;
    }
  }
  return true;
}

// Crear cuadrícula
function createGrid(random = false) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (random ? Math.round(Math.random()) : 0))
  );
}

// Dibujar cuadrícula
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = grid[y][x] ? '#0f0' : '#222';
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

// Contar vecinos
function countNeighbors(x, y) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        count += grid[ny][nx];
      }
    }
  }
  return count;
}

// Actualizar estado y contador
function updateGrid() {
  const newGrid = createGrid(false);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const n = countNeighbors(x, y);
      newGrid[y][x] = grid[y][x]
        ? (n === 2 || n === 3 ? 1 : 0)
        : (n === 3 ? 1 : 0);
    }
  }
  grid = newGrid;
  generation++;
  genCounter.textContent = `Generación: ${generation}`;
}

// Descargar JSON del patrón inicial
function downloadJSON() {
  if (!initialPattern) return;
  const blob = new Blob([JSON.stringify(initialPattern)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'initialPattern.json';
  a.click();
  URL.revokeObjectURL(url);
}
downloadBtn.addEventListener('click', downloadJSON);

// Tu lógica de carga intacta
const fileInput = document.createElement('input');
fileInput.type    = 'file';
fileInput.accept  = 'application/json';
fileInput.style.display = 'none';
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (Array.isArray(data) && data.length === rows && data.every(r => Array.isArray(r) && r.length === cols)) {
        grid           = data.map(r => r.slice());
        initialPattern = data.map(r => r.slice());
        generation     = 0;
        genCounter.textContent = `Generación: ${generation}`;
        drawGrid();
        downloadBtn.disabled = false;
        loadBtn.disabled     = false;
        setReplayState(1);
      } else {
        alert(`JSON inválido: debe ser un array ${rows}×${cols}`);
      }
    } catch {
      alert('Error al parsear JSON.');
    }
  };
  reader.readAsText(file);
});
document.body.appendChild(fileInput);
loadBtn.addEventListener('click', () => fileInput.click());

// Bucle principal con detección de fin de simulación
function loop() {
  const prevGrid = grid.map(r => r.slice());

  updateGrid();
  drawGrid();

  const noLive = !grid.some(r => r.some(c => c === 1));
  const stable = gridsEqual(prevGrid, grid);

  if (noLive || stable) {
    clearInterval(interval);
    running         = false;
    stopBtn.disabled  = true;
    startBtn.disabled = false;
    startBtn.textContent = 'Iniciar';
    setReplayState(0);
  }
}

// Alternar celdas con clic
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);
  grid[y][x] = grid[y][x] ? 0 : 1;
  drawGrid();

  initialPattern = grid.map(row => row.slice());
  downloadBtn.disabled = false;
});

// Iniciar / Reanudar
startBtn.addEventListener('click', () => {
  if (!running) {
    running = true;
    // Si es primer inicio, guardamos patrón inicial
    if (!initialPattern) {
      initialPattern = grid.map(row => row.slice());
      downloadBtn.disabled = false;
    }
    // Ajustar labels & estados
    startBtn.disabled = true;
    stopBtn.disabled  = false;
    startBtn.textContent = 'Iniciar'; // siempre al correr muestra "Iniciar"

    // No reiniciamos generation si es reanudación
    genCounter.textContent = `Generación: ${generation}`;
    interval = setInterval(loop, 250);
    setReplayState(0);
  }
});

// Detener y cambiar label a "Reanudar"
stopBtn.addEventListener('click', () => {
  if (running) {
    running = false;
    clearInterval(interval);

    stopBtn.disabled  = true;
    startBtn.disabled = false;
    startBtn.textContent = 'Reanudar';
  }
});

// Limpiar tablero
clearBtn.addEventListener('click', () => {
  grid           = createGrid(false);
  initialPattern = null;
  downloadBtn.disabled = true;
  startBtn.disabled    = false;
  stopBtn.disabled     = true;
  generation = 0;
  genCounter.textContent = `Generación: ${generation}`;
  drawGrid();
  setReplayState(0);
});

// Generar patrón aleatorio
randomBtn.addEventListener('click', () => {
  grid           = createGrid(true);
  initialPattern = grid.map(row => row.slice());
  downloadBtn.disabled = false;
  startBtn.disabled    = false;
  stopBtn.disabled     = true;
  generation = 0;
  genCounter.textContent = `Generación: ${generation}`;
  drawGrid();
  setReplayState(0);
});

// Lógica de Replay
replayBtn.addEventListener('click', () => {
  if (!initialPattern) return;
  if (replayState === 0) {
    grid = initialPattern.map(row => row.slice());
    generation = 0;
    genCounter.textContent = `Generación: ${generation}`;
    drawGrid();
    setReplayState(1);
    if (running) {
      running = false;
      clearInterval(interval);
      startBtn.disabled = false;
      stopBtn.disabled  = true;
      startBtn.textContent = 'Reanudar';
    }
  } else if (replayState === 1) {
    running = true;
    startBtn.disabled = true;
    stopBtn.disabled  = false;
    startBtn.textContent = 'Iniciar';
    interval = setInterval(loop, 250);
    setReplayState(2);
  }
});

function setReplayState(s) {
  replayState = s;
  replayBtn.className = '';
  replayBtn.classList.add(`replay-state${s}`);
}

// Cerrar el modal de instrucciones
closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Dibujo inicial
drawGrid();
