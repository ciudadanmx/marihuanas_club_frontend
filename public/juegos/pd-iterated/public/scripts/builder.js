// public/scripts/builder.js

document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTOS DEL DOM ---
  const rulesContainer = document.getElementById('rules-container');
  const addRuleBtn     = document.getElementById('add-rule');
  const defaultSelect  = document.getElementById('default-action');
  const runSimBtn      = document.getElementById('run-simulation');
  const runTourBtn     = document.getElementById('run-tournament');
  const outputPre      = document.getElementById('output');
  const tourOutputPre  = document.getElementById('tournamentOutput');
  const stepContainer  = document.getElementById('step-by-step');
  const chartCtx       = document.getElementById('scoreChart').getContext('2d');

  // --- CONFIGURACIÓN ---
  const variables = ['round','ultimoMovimientoOponente','oppDefectRatio','myScore','opponentScore'];
  const operators = ['==','!=','<','>','<=','>='];
  const actions   = [
    { label: 'Cooperar',  value: 'C' },
    { label: 'Traicionar',value: 'T' },
    { label: 'Aleatorio', value: 'R' }
  ];

  // --- ESTADO ---
  let userStrategy = { rules: [], defaultAction: 'C' };

  // --- MOTOR DE REGLAS ---
  const operations = {
    '==': (a,b) => a == b,
    '!=': (a,b) => a != b,
    '<':  (a,b) => a < b,
    '>':  (a,b) => a > b,
    '<=': (a,b) => a <= b,
    '>=': (a,b) => a >= b
  };

  function evaluateCondition(cond, context) {
  let left;
  switch (cond.varName) {
    case 'round': left = context.round; break;
    case 'ultimoMovimientoOponente': left = context.ultimoMovimientoOponente; break;
    case 'myScore': left = context.myScore; break;
    case 'opponentScore': left = context.opponentScore; break;
    case 'oppDefectRatio': {
      const hist = context.opponentHistory || [];
      const all = hist.concat(context.ultimoMovimientoOponente ? [context.ultimoMovimientoOponente] : []);
      left = all.length === 0 ? 0 : all.filter(m => m === 'T').length / all.length;
      break;
    }
    default:
      throw new Error(`Variable desconocida: ${cond.varName}`);
  }
  const fn = operations[cond.operator];
  if (!fn) throw new Error(`Operador no soportado: ${cond.operator}`);
  return fn(left, cond.value);
}

  function decideMove(strategy, context) {
    for (const rule of strategy.rules) {
      const conditions = rule.conditions || (rule.condition ? [rule.condition] : []);
      const matched = conditions.every(cond => evaluateCondition(cond, context));
      console.log('Evaluando regla:', rule, '=>', matched);
      if (matched) {
        console.log('Regla coincide, acción:', rule.action);
        if (rule.action === 'R') return Math.random() < 0.5 ? 'C' : 'T';
        return rule.action;
      }
    }
    console.log('Ninguna regla aplicable, acción por defecto:', strategy.defaultAction);
    if (strategy.defaultAction === 'R') return Math.random() < 0.5 ? 'C' : 'T';
    return strategy.defaultAction;
  }

  // Exponer decideMove globalmente
  window.decideMove = decideMove;

  // --- GENERACIÓN DE UI DE REGLAS ---
  function createConditionElement(ruleIdx, condIdx) {
    const cond = userStrategy.rules[ruleIdx].conditions[condIdx];
    const div = document.createElement('div'); div.className = 'condition';

    const varSel = document.createElement('select');
    variables.forEach(v => {
      const opt = new Option(v, v);
      if (v === cond.varName) opt.selected = true;
      varSel.add(opt);
    });

    const opSel = document.createElement('select');
    operators.forEach(op => {
      const opt = new Option(op, op);
      if (op === cond.operator) opt.selected = true;
      opSel.add(opt);
    });

    const valInput = document.createElement('input');
    valInput.type = 'text';
    valInput.value = cond.value;

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = '– Condición';
    delBtn.onclick = () => {
      userStrategy.rules[ruleIdx].conditions.splice(condIdx, 1);
      renderRules();
    };

    div.append(varSel, opSel, valInput, delBtn);
    return div;
  }

  function createRuleElement(idx) {
    const rule = userStrategy.rules[idx];
    const div = document.createElement('div'); div.className = 'rule';

    // Condiciones
    rule.conditions.forEach((_, cidx) => {
      div.appendChild(createConditionElement(idx, cidx));
    });

    // Botón Añadir Condición
    const addCond = document.createElement('button');
    addCond.type = 'button';
    addCond.textContent = '+ Condición';
    addCond.onclick = () => {
      rule.conditions.push({ varName: 'round', operator: '>=', value: 1 });
      renderRules();
    };

    // Selector Acción
    const actSel = document.createElement('select'); actSel.className = 'action-select';
    actions.forEach(a => {
      const opt = new Option(a.label, a.value);
      if (a.value === rule.action) opt.selected = true;
      actSel.add(opt);
    });
    //

    // Botón Eliminar Regla
    const delRule = document.createElement('button');
    delRule.type = 'button';
    delRule.textContent = '❌ Regla';
    delRule.onclick = () => {
      userStrategy.rules.splice(idx, 1);
      renderRules();
    };

    div.append(addCond, actSel, delRule);
    return div;
  }

  function renderRules() {
    rulesContainer.innerHTML = '';
    userStrategy.rules.forEach((_, i) => {
      rulesContainer.appendChild(createRuleElement(i));
    });
  }

  addRuleBtn.onclick = () => {
    userStrategy.rules.push({ conditions: [{ varName: 'round', operator: '>=', value: 1 }], action: 'C' });
    renderRules();
  };

  defaultSelect.value = userStrategy.defaultAction;
  defaultSelect.onchange = e => userStrategy.defaultAction = e.target.value;

  renderRules();

  // Exponer userStrategy
  window.getCurrentStrategy = () => JSON.parse(JSON.stringify(userStrategy));

  // --- SIMULACIÓN Y TORNEO ---
  const payoff = { 'C,C': [3, 3], 'C,T': [0, 5], 'T,C': [5, 0], 'T,T': [1, 1] };

  function playIterated(stratA, stratB, maxRounds = 10, endProb = 0) {
    const historyA = [], historyB = [];
    let scoreA = 0, scoreB = 0;
    for (let round = 1; round <= maxRounds; round++) {
      const ctxA = { round, myScore: scoreA, opponentScore: scoreB, opponentHistory: historyB, ultimoMovimientoOponente: historyB.slice(-1)[0] || null };
      const ctxB = { round, myScore: scoreB, opponentScore: scoreA, opponentHistory: historyA, ultimoMovimientoOponente: historyA.slice(-1)[0] || null };
      const moveA = decideMove(stratA, ctxA);
      const moveB = decideMove(stratB, ctxB);
      historyA.push(moveA);
      historyB.push(moveB);
      const [pA, pB] = payoff[`${moveA},${moveB}`];
      scoreA += pA;
      scoreB += pB;
      console.log(`Ronda ${round}: A=${moveA}(${pA}) vs B=${moveB}(${pB})`);
    }
    console.log(`Resultado final → A=${scoreA}, B=${scoreB}`);
    return { historyA, historyB, scoreA, scoreB };
  }

  function runTournament(strategies) {
    const results = [];
    for (let i = 0; i < strategies.length; i++) {
      for (let j = i + 1; j < strategies.length; j++) {
        const res = playIterated(strategies[i].strat, strategies[j].strat);
        results.push({ a: strategies[i].name, b: strategies[j].name, ...res });
      }
    }
    return results;
  }

  function renderScoresChart(ctx, rounds, scoresA, scoresB) {
    new Chart(ctx, {
      type: 'line',
      data: { labels: rounds, datasets: [{ label: 'A', data: scoresA }, { label: 'B', data: scoresB }] },
      options: { responsive: true }
    });
  }

  // --- BOTÓN PROBAR ESTRATEGIA ---
  runSimBtn.onclick = () => {
    // Actualizar estrategia desde DOM
    document.querySelectorAll('.rule').forEach((div, i) => {
      userStrategy.rules[i].action = div.querySelector('select.action-select').value;
      div.querySelectorAll('.condition').forEach((cd, j) => {
        const [vs, os, inp] = cd.querySelectorAll('select, input');
        userStrategy.rules[i].conditions[j] = { varName: vs.value, operator: os.value, value: isNaN(inp.value) ? inp.value : Number(inp.value) };
      });
    });
    userStrategy.defaultAction = defaultSelect.value;
    console.log('🧠 Estrategia:', userStrategy);

    // Simular vs AlwaysDefect
    const opponent = { name: 'AlwaysDefect', strat: window.Strategies.AlwaysDefect };
    const me       = { name: 'Usuario', strat: userStrategy };
    const { historyA, historyB, scoreA, scoreB } = playIterated(me.strat, opponent.strat);

    let outText = '';
    historyA.forEach((mA, idx) => {
      const mB = historyB[idx];
      const [pA, pB] = payoff[`${mA},${mB}`];
      outText += `R${idx+1}: Tú=${mA}(${pA}) vs O=${mB}(${pB})\n`;
    });
    outText += `Total Tú=${scoreA}, O=${scoreB}`;

    console.log('Simulación completa:', outText);
    outputPre.textContent = outText;
  };

  // --- BOTÓN EJECUTAR TORNEO ---
  runTourBtn.onclick = () => {
    const me      = { name: 'Usuario', strat: userStrategy };
    const list    = [me, { name: 'TitForTat', strat: window.Strategies.TitForTat }, { name: 'AlwaysDefect', strat: window.Strategies.AlwaysDefect }];
    const results = runTournament(list);

    let textOut = '';
    results.forEach(r => textOut += `E ${r.a} vs ${r.b}: A=${r.scoreA}, B=${r.scoreB}\n`);
    console.log('Torneo completo:', textOut);
    tourOutputPre.textContent = textOut;

    // Gráfica primera partida
    const first = results[0];
    const rounds = first.historyA.map((_, i) => i + 1);
    const cumA = [], cumB = [];
    first.historyA.forEach((mA, i) => {
      const [pA, pB] = payoff[`${mA},${first.historyB[i]}`];
      cumA.push((cumA[i-1]||0) + pA);
      cumB.push((cumB[i-1]||0) + pB);
    });
    renderScoresChart(chartCtx, rounds, cumA, cumB);

    // Detalle paso a paso
    const steps = first.historyA.map((mA, i) => ({
      round: i+1,
      moveA: mA,
      moveB: first.historyB[i],
      pA: payoff[`${mA},${first.historyB[i]}`][0],
      pB: payoff[`${mA},${first.historyB[i]}`][1],
      totalA: cumA[i],
      totalB: cumB[i]
    }));
    stepContainer.innerHTML = steps.map(s =>
      `R${s.round}: A=${s.moveA}(${s.pA}) vs B=${s.moveB}(${s.pB}) ➔ Tot A=${s.totalA}, B=${s.totalB}`
    ).join('<br>');
  };
});
