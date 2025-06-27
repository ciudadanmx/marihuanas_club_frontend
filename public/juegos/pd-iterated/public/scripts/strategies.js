// public/scripts/strategies.js

function makeStrategy(rules, defaultAction = 'C') {
  return { rules, defaultAction };
}

const AlwaysCooperate = makeStrategy([], 'C');
const AlwaysDefect    = makeStrategy([], 'T');
const RandomStrategy  = makeStrategy([], 'R');

const TitForTat = makeStrategy([
  {
    condition: { varName: 'round', operator: '>=', value: 2 },
    action: 'C'
  },
  {
    condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'C' },
    action: 'C'
  }
], 'C');

const GrimTrigger = makeStrategy([
  { condition: { varName: 'oppDefectRatio', operator: '>', value: 0 }, action: 'T' }
], 'C');

function step(strategyA, historyA, strategyB, historyB, context) {
  const moveA = window.decideMove(strategyA, {
    ...context,
    opponentHistory: historyB,
    ultimoMovimientoOponente: historyB.slice(-1)[0] || null
  });
  const moveB = window.decideMove(strategyB, {
    ...context,
    opponentHistory: historyA,
    ultimoMovimientoOponente: historyA.slice(-1)[0] || null
  });
  return { moveA, moveB };
}

// Exponer en window
window.Strategies = {
  AlwaysCooperate,
  AlwaysDefect,
  RandomStrategy,
  TitForTat,
  GrimTrigger
};
window.step = step;