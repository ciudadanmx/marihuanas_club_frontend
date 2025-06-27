// engine/ruleEngine.js

// Lista de operadores soportados y sus funciones
const operators = {
  '==': (a, b) => a == b,
  '!=': (a, b) => a != b,
  '<':  (a, b) => a < b,
  '>':  (a, b) => a > b,
  '<=': (a, b) => a <= b,
  '>=': (a, b) => a >= b,
};

/**
 * Evalúa una condición simple.
 * @param {{varName: string, operator: string, value: any}} cond
 * @param {object} context  // { round, myHistory, opponentHistory, lastOpponentMove, ... }
 * @returns {boolean}
 */
function evaluateCondition(cond, context) {
  const { varName, operator, value } = cond;
  let left;

  switch (varName) {
    case 'round':
      left = context.round;
      break;
    case 'ultimoMovimientoOponente':
      left = context.lastOpponentMove;
      break;
    case 'myScore':
      left = context.myScore;
      break;
    case 'opponentScore':
      left = context.opponentScore;
      break;
    // Ejemplo: porcentaje de traiciones en history
    case 'oppDefectRatio': {
      const hist = context.opponentHistory;
      left = hist.length === 0 ? 0 : hist.filter(m => m === 'T').length / hist.length;
      break;
    }
    // Agrega más variables aquí según necesidades...
    default:
      throw new Error(`Variable desconocida: ${varName}`);
  }

  const fn = operators[operator];
  if (!fn) throw new Error(`Operador no soportado: ${operator}`);
  return fn(left, value);
}

/**
 * Decide la jugada según la estrategia visual.
 * @param {{rules: Array, defaultAction: 'C'|'T'|'R'}} strategy
 * @param {object} context
 * @returns {'C'|'T'}
 */
export function decideMove(strategy, context) {
  for (const rule of strategy.rules) {
    if (evaluateCondition(rule.condition, context)) {
      // regla coincide → devolver acción mapeada
      if (rule.action === 'R') {
        return Math.random() < 0.5 ? 'C' : 'T';
      }
      return rule.action;
    }
  }
  // Ninguna regla coincide → acción por defecto
  return strategy.defaultAction === 'R'
    ? (Math.random() < 0.5 ? 'C' : 'T')
    : strategy.defaultAction;
}

// Si se necesita prueba rápida en consola
if (typeof window !== 'undefined') {
  window.decideMove = decideMove;
}