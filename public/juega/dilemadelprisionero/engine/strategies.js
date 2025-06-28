// engine/strategies.js
import { decideMove } from './RuleEngine.js';

// Definición genérica de una estrategia visual vacía
function makeStrategy(rules, defaultAction = 'C') {
  return { rules, defaultAction };
}

export const AlwaysCooperate = makeStrategy([], 'C');
export const AlwaysDefect    = makeStrategy([], 'T');

export const TitForTat = makeStrategy([
  { condition: { varName: 'round', operator: '>=', value: 2 }, action: 'C',
    // Nota: en este caso especial, usamos lastOpponentMove
    //condition: { varName: 'lastOpponentMove', operator: '==', value: 'C' }
  }
], 'C');

export const GrimTrigger = makeStrategy([
  { condition: { varName: 'oppDefectRatio', operator: '>', value: 0 }, action: 'T' }
], 'C');

export const RandomStrategy = makeStrategy([], 'R');

// Función para simular un paso contra un oponente dado
export function step(strategyA, historyA, strategyB, historyB, context) {
  const moveA = decideMove(strategyA, { ...context, opponentHistory: historyB, lastOpponentMove: historyB.slice(-1)[0] });
  const moveB = decideMove(strategyB, { ...context, opponentHistory: historyA, lastOpponentMove: historyA.slice(-1)[0] });
  return { moveA, moveB };
}