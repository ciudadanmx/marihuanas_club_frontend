// public/scripts/ruleEngine.js

// Operadores permitidos
const operators = {
  '==': (a, b) => a == b,
  '!=': (a, b) => a != b,
  '<':  (a, b) => a < b,
  '>':  (a, b) => a > b,
  '<=': (a, b) => a <= b,
  '>=': (a, b) => a >= b,
};

/**
 * Evalúa una sola condición sobre el contexto dado.
 */
function evaluateCondition(cond, context) {
  let left;
  switch (cond.varName) {
    case 'round':                   left = context.round; break;
    case 'ultimoMovimientoOponente': left = context.ultimoMovimientoOponente; break;
    case 'myScore':                 left = context.myScore; break;
    case 'opponentScore':           left = context.opponentScore; break;
    case 'oppDefectRatio': {
      const hist = context.opponentHistory || [];
      left = hist.length === 0
        ? 0
        : hist.filter(m => m === 'T').length / hist.length;
      break;
    }
    default:
      throw new Error(`Variable desconocida: ${cond.varName}`);
  }
  const fn = operators[cond.operator];
  if (!fn) throw new Error(`Operador no soportado: ${cond.operator}`);
  return fn(left, cond.value);
}

/**
 * Decide el movimiento basándose en las reglas de la estrategia.
 * Soporta reglas con una sola condición (rule.condition) o varias (rule.conditions).
 */
function decideMove(strategy, context) {
  for (const rule of strategy.rules) {
    // Compatibilidad: si rule.conditions no existe, envolver rule.condition en array
    const conditions = rule.conditions ?? (rule.condition ? [rule.condition] : []);
    // Evaluar todas las condiciones (AND)
    const match = conditions.every(cond => evaluateCondition(cond, context));
    if (match) {
      if (rule.action === 'R') {
        return Math.random() < 0.5 ? 'C' : 'T';
      }
      return rule.action;
    }
  }
  // Si ninguna regla matchea, aplicar acción por defecto
  if (strategy.defaultAction === 'R') {
    return Math.random() < 0.5 ? 'C' : 'T';
  }
  return strategy.defaultAction;
}

// Exponer globalmente
window.decideMove = decideMove;


