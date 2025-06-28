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

const APAVLOV = makeStrategy([
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'C' }, action: 'C' }
], 'C');

const APAVLO2 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 2 }, action: 'C' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' },
], 'C');

const ARAB = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 3 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>', value: 0.5 }, action: 'T' }
], 'C');

const ARAB1 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 5 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.3 }, action: 'T' }
], 'C');

const AXELROD2 = makeStrategy([
  { condition: { varName: 'round', operator: '==', value: 1 }, action: 'C' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' },
], 'C');

const BBS_CC = makeStrategy([
  { condition: { varName: 'round', operator: '>=', value: 1 }, action: 'C' }
], 'C');

const BBS_CD = makeStrategy([
  { condition: { varName: 'round', operator: '==', value: 1 }, action: 'C' },
  { condition: { varName: 'round', operator: '>=', value: 2 }, action: 'T' },
], 'C');

const BBS_DC = makeStrategy([
  { condition: { varName: 'round', operator: '==', value: 1 }, action: 'T' },
  { condition: { varName: 'round', operator: '>=', value: 2 }, action: 'C' },
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

const FREDA_2 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 2 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>', value: 0.3 }, action: 'T' }
], 'C');

const FRED1 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 3 }, action: 'C' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' }
], 'C');

const FRED2 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 5 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.2 }, action: 'T' }
], 'C');

const FRED3 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 4 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>', value: 0.4 }, action: 'T' }
], 'C');

const FRED4 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 3 }, action: 'C' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.5 }, action: 'T' }
], 'C');

const FRED5 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 2 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.25 }, action: 'T' }
], 'C');

const FRED6 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 6 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>', value: 0.3 }, action: 'T' }
], 'C');

const FRED7 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 3 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.4 }, action: 'T' }
], 'C');

const FRED8 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 5 }, action: 'C' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' }
], 'C');

const FRED9 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 4 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>', value: 0.35 }, action: 'T' }
], 'C');

const FRED10 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 2 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.3 }, action: 'T' }
], 'C');


const GREM = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 2 }, action: 'C' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' }
], 'C');

const HARDMAJOR = makeStrategy([
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.3 }, action: 'T' }
], 'T');

const JOSS = makeStrategy([
  { condition: { varName: 'round', operator: '==', value: 1 }, action: 'C' },
  {
    condition: {
      varName: 'ultimoMovimientoOponente',
      operator: '==',
      value: 'C'
    },
    action: Math.random() < 0.9 ? 'C' : 'T' // 90% cooperar, 10% traicionar tras C
  },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' }
], 'C');

const K = makeStrategy([
  { condition: { varName: 'round', operator: '==', value: 1 }, action: 'T' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'C' }, action: 'C' }
], 'C');

const LUCKY = makeStrategy([
  { condition: { varName: 'round', operator: '==', value: 1 }, action: 'C' },
  { condition: { varName: 'round', operator: '==', value: 2 }, action: Math.random() < 0.5 ? 'C' : 'T' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' }
], 'C');

const MACHIAVELLI = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 3 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.2 }, action: 'T' }
], 'T');

const MATHGEEK = makeStrategy([
  { condition: { varName: 'round', operator: '==', value: 1 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.5 }, action: 'T' }
], 'C');

const NASTY = makeStrategy([], 'T'); // Always Defect alias

const NICE = makeStrategy([], 'C'); // Always Cooperate alias

const OCOTA = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 2 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.4 }, action: 'T' }
], 'C');

const OCOTA1 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 3 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.3 }, action: 'T' }
], 'C');

const PAVLOV = makeStrategy([
  {
    condition: { varName: 'lastRoundResult', operator: '==', value: 'CC' },
    action: 'C'
  },
  {
    condition: { varName: 'lastRoundResult', operator: '==', value: 'TT' },
    action: 'C'
  },
  { action: 'T' }
], 'C');

const PAVLOV1 = makeStrategy([
  {
    condition: { varName: 'lastRoundResult', operator: '==', value: 'CC' },
    action: 'C'
  },
  {
    condition: { varName: 'lastRoundResult', operator: '==', value: 'CT' },
    action: 'T'
  },
  {
    condition: { varName: 'lastRoundResult', operator: '==', value: 'TC' },
    action: 'T'
  },
  {
    condition: { varName: 'lastRoundResult', operator: '==', value: 'TT' },
    action: 'C'
  }
], 'C');

const RANDOM = makeStrategy([], 'R'); // Movimiento aleatorio en cada turno

const RANDF = makeStrategy([
  { condition: { varName: 'round', operator: '==', value: 1 }, action: Math.random() < 0.5 ? 'C' : 'T' },
  { condition: { varName: 'round', operator: '>=', value: 2 }, action: 'C' }
], 'C');

const REMORSE = makeStrategy([
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' },
  { action: 'C' }
], 'T');

const REVENGE = makeStrategy([
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.25 }, action: 'T' },
], 'C');

const SIMPLETON = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 1 }, action: 'C' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' },
  { action: 'C' }
], 'C');

const SMOKE = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 1 }, action: 'T' },
  { action: 'C' }
], 'T');

const SNEAKY = makeStrategy([
  { condition: { varName: 'round', operator: '==', value: 1 }, action: 'C' },
  { condition: { varName: 'round', operator: '==', value: 2 }, action: 'T' },
  { action: 'C' }
], 'C');

const SOFTMAJOR = makeStrategy([
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.5 }, action: 'T' }
], 'C');

const STRATEGY1 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 3 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.4 }, action: 'T' }
], 'C');

const STRATEGY2 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 2 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.3 }, action: 'T' }
], 'C');

const STRATEGY3 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 4 }, action: 'C' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' }
], 'C');

const STRATEGY4 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 5 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.2 }, action: 'T' }
], 'C');

const STRATEGY5 = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 2 }, action: 'C' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' }
], 'C');

const TFT = makeStrategy([
  { condition: { varName: 'round', operator: '>=', value: 2 }, action: 'C' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' }
], 'C');

const TFTT = makeStrategy([
  { condition: { varName: 'lastTwoOpponentMoves', operator: '==', value: 'TT' }, action: 'T' }
], 'C');

const TESTER = makeStrategy([
  { condition: { varName: 'round', operator: '==', value: 1 }, action: 'T' },
  { condition: { varName: 'round', operator: '==', value: 2 }, action: 'C' },
  { condition: { varName: 'oppDefectRatio', operator: '>=', value: 0.5 }, action: 'T' }
], 'C');

const TESTER1 = makeStrategy([
  { condition: { varName: 'round', operator: '==', value: 1 }, action: 'T' },
  { condition: { varName: 'round', operator: '==', value: 2 }, action: 'C' },
  { condition: { varName: 'round', operator: '>=', value: 3 }, action: 'T' }
], 'C');

const TRIGGER = makeStrategy([
  { condition: { varName: 'round', operator: '<=', value: 1 }, action: 'C' },
  { condition: { varName: 'ultimoMovimientoOponente', operator: '==', value: 'T' }, action: 'T' }
], 'C');

// Exponer en window
window.Strategies = {
  AlwaysCooperate,
  AlwaysDefect,
  RandomStrategy,
  TitForTat,
  GrimTrigger,
   APAVLOV,
  APAVLO2,
  ARAB,
  ARAB1,
  AXELROD2,
  BBS_CC,
  BBS_CD,
  BBS_DC,
  FREDA_2,
  FRED1,
  FRED2,
  FRED3,
  FRED4,
  FRED5,
  FRED6,
  FRED7,
  FRED8,
  FRED9,
  FRED10,
   GREM,
  HARDMAJOR,
  JOSS,
  K,
  LUCKY,
  MACHIAVELLI,
  MATHGEEK,
  NASTY,
  NICE,
  OCOTA,
  OCOTA1,
  PAVLOV,
  PAVLOV1,
  RANDOM,
  RANDF,
  REMORSE,
  REVENGE,
  SIMPLETON,
  SMOKE,
   SNEAKY,
  SOFTMAJOR,
  STRATEGY1,
  STRATEGY2,
  STRATEGY3,
  STRATEGY4,
  STRATEGY5,
  TFT,
  TFTT,
  TESTER,
  TESTER1,
  TRIGGER,
};
window.step = step;