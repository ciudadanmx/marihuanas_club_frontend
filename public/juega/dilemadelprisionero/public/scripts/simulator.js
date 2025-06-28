// public/scripts/simulator.js

// Pagos por combinación de jugadas
const payoff = {
  'C,C': [3, 3],
  'C,T': [0, 5],
  'T,C': [5, 0],
  'T,T': [1, 1]
};

/**
 * Simula una partida iterada entre dos estrategias.
 */
function playIterated(stratA, stratB, maxRounds = 20, endProb = 0.05) {
    console.log('iniciando torneo')
  const historyA = [], historyB = [];
  let scoreA = 0, scoreB = 0;

  for (let round = 1; round <= maxRounds; round++) {
    if (Math.random() < endProb) break;
    const ctxA = { round, myScore: scoreA, opponentScore: scoreB, opponentHistory: historyB, ultimoMovimientoOponente: historyB.slice(-1)[0] || null };
    const ctxB = { round, myScore: scoreB, opponentScore: scoreA, opponentHistory: historyA, ultimoMovimientoOponente: historyA.slice(-1)[0] || null };
    const moveA = window.decideMove(stratA, ctxA);
    const moveB = window.decideMove(stratB, ctxB);
    historyA.push(moveA);
    historyB.push(moveB);
    const key = `${moveA},${moveB}`;
    const [pA, pB] = payoff[key];
    scoreA += pA;
    scoreB += pB;
  }
  return { historyA, historyB, scoreA, scoreB };
}

/**
 * Ejecuta un torneo tipo round-robin entre un array de estrategias.
 */
function runTournament(strategies) {
  const results = [];
  for (let i = 0; i < strategies.length; i++) {
    for (let j = i + 1; j < strategies.length; j++) {
      const res = playIterated(strategies[i], strategies[j]);
      results.push({ a: i, b: j, ...res });
    }
  }
  return results;
}

/**
 * Dibuja un gráfico de líneas de puntajes acumulados.
 */
function renderScoresChart(canvasCtx, rounds, scoresA, scoresB) {
  new Chart(canvasCtx, {
    type: 'line',
    data: {
      labels: rounds,
      datasets: [
        { label: 'Jugador A', data: scoresA, fill: false },
        { label: 'Jugador B', data: scoresB, fill: false }
      ]
    },
    options: { responsive: true }
  });
}


function playWithSteps(stratA, stratB, maxRounds = 200, endProb = 0.05) {
  const steps = [];
  let scoreA = 0, scoreB = 0;
  const historyA = [], historyB = [];

  for (let round = 1; round <= maxRounds; round++) {
    if (Math.random() < endProb) break;
    const ctxA = { round, myScore: scoreA, opponentScore: scoreB, opponentHistory: historyB, ultimoMovimientoOponente: historyB.slice(-1)[0] || null };
    const ctxB = { round, myScore: scoreB, opponentScore: scoreA, opponentHistory: historyA, ultimoMovimientoOponente: historyA.slice(-1)[0] || null };
    const moveA = window.decideMove(stratA, ctxA);
    const moveB = window.decideMove(stratB, ctxB);
    const [pA,pB] = payoff[`${moveA},${moveB}`];
    scoreA += pA; scoreB += pB;
    steps.push({ round, moveA, moveB, pA, pB, totalA: scoreA, totalB: scoreB });
    historyA.push(moveA); historyB.push(moveB);
  }
  return steps;
}


// Exponer en window
window.playIterated   = playIterated;
window.runTournament  = runTournament;
window.renderScoresChart = renderScoresChart;
window.playWithSteps = playWithSteps;
