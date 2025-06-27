// public/scripts/builder.js

document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTOS DEL DOM ---
  const rulesContainer   = document.getElementById('rules-container');
  const addRuleBtn       = document.getElementById('add-rule');
  const defaultSelect    = document.getElementById('default-action');
  const runSimBtn        = document.getElementById('run-simulation');
  const runTourBtn       = document.getElementById('run-tournament');
  const outputPre        = document.getElementById('output');
  const tournamentOutput = document.getElementById('tournamentOutput');
  const stepContainer    = document.getElementById('step-by-step');
  const chartCanvas      = document.getElementById('scoreChart');
  const chartCtx         = chartCanvas.getContext('2d');

  // --- CONFIGURACIÓN ---
  const variables = ['round', 'ultimoMovimientoOponente', 'oppDefectRatio', 'myScore', 'opponentScore'];
  const varLabels = {
    round: 'Ronda',
    ultimoMovimientoOponente: 'Último Movimiento Oponente',
    oppDefectRatio: 'Porcentaje Traiciones Oponente',
    myScore: 'Mi Puntuación',
    opponentScore: 'Puntuación Oponente'
  };
  const operators = ['==', '!=', '<', '>', '<=', '>='];
  const actions   = [
    { label: 'Cooperar',   value: 'C' },
    { label: 'Traicionar', value: 'T' },
    { label: 'Aleatorio',  value: 'R' }
  ];

  // --- ESTADO ---
  let userStrategy = { rules: [], defaultAction: 'C' };

  let currentChart = null;

  // --- MOTOR DE REGLAS ---
  const operations = {
    '==': (a, b) => a == b,
    '!=': (a, b) => a != b,
    '<':  (a, b) => a < b,
    '>':  (a, b) => a > b,
    '<=': (a, b) => a <= b,
    '>=': (a, b) => a >= b
  };

  function evaluateCondition(cond, context) {
    let left;
    switch (cond.varName) {
      case 'round': left = context.round; break;
      case 'ultimoMovimientoOponente': left = context.ultimoMovimientoOponente; break;
      case 'myScore': left = context.myScore; break;
      case 'opponentScore': left = context.opponentScore; break;
      case 'oppDefectRatio':
        const hist = context.opponentHistory || [];
        left = hist.length === 0 ? 0 : hist.filter(m => m === 'T').length / hist.length;
        break;
      default:
        throw new Error(`Variable desconocida: ${cond.varName}`);
    }
    const fn = operations[cond.operator];
    if (!fn) throw new Error(`Operador no soportado: ${cond.operator}`);
    return fn(left, cond.value);
  }

  function decideMove(strategy, context) {
    // asegurarnos de que rule.conditions es siempre un array
    for (const rule of strategy.rules) {
      const conds = rule.conditions || [];
      if (conds.every(c => evaluateCondition(c, context))) {
        return rule.action === 'R'
          ? (Math.random() < 0.5 ? 'C' : 'T')
          : rule.action;
      }
    }
    return strategy.defaultAction === 'R'
      ? (Math.random() < 0.5 ? 'C' : 'T')
      : strategy.defaultAction;
  }
  window.decideMove = decideMove;

  // --- UI DE REGLAS ---
  function createConditionElement(rIdx, cIdx) {
    const cond = userStrategy.rules[rIdx].conditions[cIdx];
    const div = document.createElement('div');
    div.className = 'condition';

    // Variable
    const varSel = document.createElement('select');
    variables.forEach(v => {
      const opt = new Option(varLabels[v], v);
      if (v === cond.varName) opt.selected = true;
      varSel.add(opt);
    });

    // Operador dinámico
    function createOpSel() {
  const sel = document.createElement('select');
  // Lista de variables que usan todos los operadores
  const numericVars = ['round', 'oppDefectRatio', 'opponentScore', 'myScore'];
  // Si la variable seleccionada está en numericVars, usar todos los operators
  const ops = numericVars.includes(varSel.value) ? operators : ['=='];
  ops.forEach(o => {
    const option = new Option(o, o);
    if (o === cond.operator) option.selected = true;
    sel.add(option);
  });
  return sel;
}
    let opSel = createOpSel();

    // Valor dinámico
    function createValEl() {
      if (['round','oppDefectRatio', 'opponentScore', 'myScore'].includes(varSel.value)) {
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.value = cond.value;
        return inp;
      }
      const sel = document.createElement('select');
      actions.slice(0,2).forEach(a => {
        const option = new Option(a.label, a.value);
        if (a.value === cond.value) option.selected = true;
        sel.add(option);
      });
      return sel;
    }
    let valEl = createValEl();

    // Al cambiar variable
    varSel.onchange = () => {
      const newOp = createOpSel();
      div.replaceChild(newOp, opSel);
      opSel = newOp;

      const newVal = createValEl();
      div.replaceChild(newVal, valEl);
      valEl = newVal;
    };

    // Borrar condición
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = '– Condición';
    delBtn.onclick = () => {
      userStrategy.rules[rIdx].conditions.splice(cIdx,1);
      renderRules();
    };

    div.append(varSel, opSel, valEl, delBtn);
    return div;
  }

  function createRuleElement(idx) {
    const rule = userStrategy.rules[idx];
    const div = document.createElement('div');
    div.className = 'rule';

    rule.conditions.forEach((_,ci) =>
      div.appendChild(createConditionElement(idx,ci))
    );

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = '+ Condición';
    addBtn.onclick = () => {
      rule.conditions.push({varName:'round',operator:'>=',value:1});
      renderRules();
    };

    const actSel = document.createElement('select');
    actSel.className = 'action-select';
    actions.forEach(a => {
      const option = new Option(a.label, a.value);
      if (a.value === rule.action) option.selected = true;
      actSel.add(option);
    });

    const delRuleBtn = document.createElement('button');
    delRuleBtn.type = 'button';
    delRuleBtn.textContent = '❌ Regla';
    delRuleBtn.onclick = () => {
      userStrategy.rules.splice(idx,1);
      renderRules();
    };

    div.append(addBtn, actSel, delRuleBtn);
    return div;
  }

  function renderRules() {
    rulesContainer.innerHTML = '';
    userStrategy.rules.forEach((_,i) =>
      rulesContainer.appendChild(createRuleElement(i))
    );
  }

  addRuleBtn.onclick = () => {
    userStrategy.rules.push({
      conditions: [{varName:'round',operator:'>=',value:1}],
      action: 'C'
    });
    renderRules();
  };

  defaultSelect.value = userStrategy.defaultAction;
  defaultSelect.onchange = e => {
    userStrategy.defaultAction = e.target.value;
  };

  renderRules();
  window.getCurrentStrategy = () => JSON.parse(JSON.stringify(userStrategy));

  // --- SIMULACIÓN ---
  const payoff = {
    'C,C': [3,3],
    'C,T': [0,5],
    'T,C': [5,0],
    'T,T': [1,1]
  };

  function playWithSteps(stratA, stratB, maxRounds = 10) {
    const steps = [];
    let scoreA = 0, scoreB = 0;
    const historyA = [], historyB = [];

    for (let r = 1; r <= maxRounds; r++) {
      const ctxA = {
        round: r,
        myScore: scoreA,
        opponentScore: scoreB,
        opponentHistory: [...historyB],
        ultimoMovimientoOponente: historyB.slice(-1)[0] || null
      };
      const ctxB = {
        round: r,
        myScore: scoreB,
        opponentScore: scoreA,
        opponentHistory: [...historyA],
        ultimoMovimientoOponente: historyA.slice(-1)[0] || null
      };
      const mA = decideMove(stratA, ctxA);
      const mB = decideMove(stratB, ctxB);

      historyA.push(mA);
      historyB.push(mB);

      const [pA, pB] = payoff[`${mA},${mB}`];
      scoreA += pA;
      scoreB += pB;

      steps.push({ round: r, moveA: mA, moveB: mB, pA, pB, totalA: scoreA, totalB: scoreB });
    }
    return steps;
  }

  function runTournament(strats) {
    return strats.slice(1).map(op => ({
      a: strats[0].name,
      b: op.name,
      steps: playWithSteps(strats[0].strat, op.strat)
    }));
  }

  // --- GRAFICA MULTI-LÍNEA ---
  function renderScoresChart(ctx, results) {
    const datasets = [];
    const userHue = 210;

    results.forEach((m,i) => {
      const light = Math.max(30, 80 - i * 10);
      datasets.push({
        label: `Usuario vs ${m.b} (Usuario)`,
        data: m.steps.map(s => s.totalA),
        fill: false,
        borderColor: `hsl(${userHue},70%,${light}%)`
      });
      const oppHue = (i * 60 + 30) % 360;
      datasets.push({
        label: `Usuario vs ${m.b} (${m.b})`,
        data: m.steps.map(s => s.totalB),
        fill: false,
        borderColor: `hsl(${oppHue},70%,50%)`
      });
    });

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: results[0].steps.map(s => s.round),
        datasets
      },
      options: { responsive: true }
    });
  }

  runSimBtn.onclick = () => {
    document.querySelectorAll('.rule').forEach((d,i) => {
      userStrategy.rules[i].action = d.querySelector('select.action-select').value;
      d.querySelectorAll('.condition').forEach((cd,j) => {
        const [vs, os, inp] = cd.querySelectorAll('select,input');
        userStrategy.rules[i].conditions[j] = {
          varName: vs.value,
          operator: os.value,
          value: isNaN(inp.value) ? inp.value : Number(inp.value)
        };
      });
    });
    userStrategy.defaultAction = defaultSelect.value;
    const results = playWithSteps(userStrategy, window.Strategies.AlwaysDefect, 10);
    outputPre.textContent = results
      .map(s => `R${s.round}: Tú=${s.moveA}(${s.pA}) vs O=${s.moveB}(${s.pB})`)
      .join('\n') +
      `\nTotal: Tú=${results.slice(-1)[0].totalA}, O=${results.slice(-1)[0].totalB}`;
  };

  runTourBtn.onclick = () => {
    const userStrat = window.getCurrentStrategy();
    const strats = [
  { name: 'Usuario', strat: userStrat },

  { name: 'RandomStrategy', strat: window.Strategies.RandomStrategy },
  { name: 'TitForTat', strat: window.Strategies.TitForTat },
  { name: 'GrimTrigger', strat: window.Strategies.GrimTrigger },
  { name: 'APAVLOV', strat: window.Strategies.APAVLOV },
{ name: 'APAVLO2', strat: window.Strategies.APAVLO2 },
{ name: 'ARAB', strat: window.Strategies.ARAB },
{ name: 'ARAB1', strat: window.Strategies.ARAB1 },
{ name: 'AXELROD2', strat: window.Strategies.AXELROD2 },
{ name: 'BBS_CC', strat: window.Strategies.BBS_CC },
{ name: 'BBS_CD', strat: window.Strategies.BBS_CD },
{ name: 'BBS_DC', strat: window.Strategies.BBS_DC },
{ name: 'FREDA_2', strat: window.Strategies.FREDA_2 },
{ name: 'FRED1', strat: window.Strategies.FRED1 },
{ name: 'FRED2', strat: window.Strategies.FRED2 },
{ name: 'FRED3', strat: window.Strategies.FRED3 },
{ name: 'FRED4', strat: window.Strategies.FRED4 },
{ name: 'FRED5', strat: window.Strategies.FRED5 },
{ name: 'FRED6', strat: window.Strategies.FRED6 },
{ name: 'FRED7', strat: window.Strategies.FRED7 },
{ name: 'FRED8', strat: window.Strategies.FRED8 },
{ name: 'FRED9', strat: window.Strategies.FRED9 },
{ name: 'FRED10', strat: window.Strategies.FRED10 },
{ name: 'GREM', strat: window.Strategies.GREM },
{ name: 'HARDMAJOR', strat: window.Strategies.HARDMAJOR },
{ name: 'JOSS', strat: window.Strategies.JOSS },
{ name: 'K', strat: window.Strategies.K },
{ name: 'LUCKY', strat: window.Strategies.LUCKY },
{ name: 'MACHIAVELLI', strat: window.Strategies.MACHIAVELLI },
{ name: 'MATHGEEK', strat: window.Strategies.MATHGEEK },
{ name: 'NASTY', strat: window.Strategies.NASTY },
{ name: 'NICE', strat: window.Strategies.NICE },
{ name: 'OCOTA', strat: window.Strategies.OCOTA },
{ name: 'OCOTA1', strat: window.Strategies.OCOTA1 },
{ name: 'PAVLOV', strat: window.Strategies.PAVLOV },
{ name: 'PAVLOV1', strat: window.Strategies.PAVLOV1 },
{ name: 'RANDOM', strat: window.Strategies.RANDOM },
{ name: 'RANDF', strat: window.Strategies.RANDF },
{ name: 'REMORSE', strat: window.Strategies.REMORSE },
{ name: 'REVENGE', strat: window.Strategies.REVENGE },
{ name: 'SIMPLETON', strat: window.Strategies.SIMPLETON },
{ name: 'SMOKE', strat: window.Strategies.SMOKE },
{ name: 'SNEAKY', strat: window.Strategies.SNEAKY },
{ name: 'SOFTMAJOR', strat: window.Strategies.SOFTMAJOR },
{ name: 'STRATEGY1', strat: window.Strategies.STRATEGY1 },
{ name: 'STRATEGY2', strat: window.Strategies.STRATEGY2 },
{ name: 'STRATEGY3', strat: window.Strategies.STRATEGY3 },
{ name: 'STRATEGY4', strat: window.Strategies.STRATEGY4 },
{ name: 'STRATEGY5', strat: window.Strategies.STRATEGY5 },
{ name: 'TFT', strat: window.Strategies.TFT },
{ name: 'TFTT', strat: window.Strategies.TFTT },
{ name: 'TESTER', strat: window.Strategies.TESTER },
{ name: 'TESTER1', strat: window.Strategies.TESTER1 },
{ name: 'TRIGGER', strat: window.Strategies.TRIGGER },
];
    const results = runTournament(strats);
    tournamentOutput.textContent = results
      .map(r => {
        const last = r.steps.slice(-1)[0];
        return `✅ ${r.a} vs ${r.b} ➜ ${last.totalA}-${last.totalB}`;
      })
      .join('\n');
    renderScoresChart(chartCtx, results);
    stepContainer.innerHTML = results[0].steps
      .map(s => `R${s.round}: A=${s.moveA}(${s.pA}) vs B=${s.moveB}(${s.pB})`)
      .join('<br>');
  };
});
