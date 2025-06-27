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
  const variables = ['round','ultimoMovimientoOponente','oppDefectRatio','myScore','opponentScore'];
  const varLabels = {
    'round': 'Ronda',
    'ultimoMovimientoOponente': 'Último Movimiento Oponente',
    'oppDefectRatio': 'Porcentaje Traiciones Oponente',
    'myScore': 'Mi Puntuación',
    'opponentScore': 'Puntuación Oponente'
  };
  const operators = ['==','!=','<','>','<=','>='];
  const actions   = [
    { label:'Cooperar',  value:'C' },
    { label:'Traicionar',value:'T' },
    { label:'Aleatorio', value:'R' }
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
    switch(cond.varName) {
      case 'round': left = context.round; break;
      case 'ultimoMovimientoOponente': left = context.ultimoMovimientoOponente; break;
      case 'myScore': left = context.myScore; break;
      case 'opponentScore': left = context.opponentScore; break;
      case 'oppDefectRatio': {
        const hist = context.opponentHistory || [];
        left = hist.length === 0 ? 0 : hist.filter(m => m === 'T').length / hist.length;
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
      const conds = rule.conditions || [];
      if (conds.every(c => evaluateCondition(c, context))) {
        return rule.action === 'R' ? (Math.random()<0.5?'C':'T') : rule.action;
      }
    }
    return strategy.defaultAction === 'R' ? (Math.random()<0.5?'C':'T') : strategy.defaultAction;
  }
  window.decideMove = decideMove;

  // --- GENERACIÓN UI DE REGLAS ---
  function createConditionElement(rIdx, cIdx) {
    const cond = userStrategy.rules[rIdx].conditions[cIdx];
    const div = document.createElement('div');
    div.className = 'condition';

    // Select de variable
    const varSel = document.createElement('select');
    variables.forEach(v => {
      const o = new Option(varLabels[v] || v, v);
      if (v === cond.varName) o.selected = true;
      varSel.add(o);
    });

    // Operador select dinámico
    function createOpSel() {
      const sel = document.createElement('select');
      const ops = (varSel.value === 'round' || varSel.value === 'oppDefectRatio')
        ? operators
        : ['=='];
      ops.forEach(op => {
        const o = new Option(op, op);
        if (op === cond.operator) o.selected = true;
        sel.add(o);
      });
      return sel;
    }
    let opSel = createOpSel();

    // Valor dinámico
    function createValEl() {
      if (varSel.value === 'round' || varSel.value === 'oppDefectRatio') {
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.value = cond.value;
        return inp;
      } else {
        const sel = document.createElement('select');
        actions.slice(0,2).forEach(opt => { // solo C y T
          const o = new Option(opt.label, opt.value);
          if (opt.value === cond.value) o.selected = true;
          sel.add(o);
        });
        return sel;
      }
    }
    let valEl = createValEl();

    // Al cambiar variable: rehacer operador y valor
    varSel.onchange = () => {
      const newOpSel = createOpSel();
      div.replaceChild(newOpSel, opSel);
      opSel = newOpSel;
      const newValEl = createValEl();
      div.replaceChild(newValEl, valEl);
      valEl = newValEl;
    };

    // Botón eliminar condición
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = '– Condición';
    delBtn.onclick = () => {
      userStrategy.rules[rIdx].conditions.splice(cIdx, 1);
      renderRules();
    };

    div.append(varSel, opSel, valEl, delBtn);
    return div;
  }

  function createRuleElement(idx) {
    const rule = userStrategy.rules[idx];
    const div = document.createElement('div');
    div.className = 'rule';
    rule.conditions.forEach((_, ci) => div.appendChild(createConditionElement(idx, ci)));
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = '+ Condición';
    addBtn.onclick = () => {
      rule.conditions.push({ varName: 'round', operator: '>=', value: 1 });
      renderRules();
    };
    const actSel = document.createElement('select');
    actSel.className = 'action-select';
    actions.forEach(a => {
      const o = new Option(a.label, a.value);
      if (a.value === rule.action) o.selected = true;
      actSel.add(o);
    });
    const delRuleBtn = document.createElement('button');
    delRuleBtn.type = 'button';
    delRuleBtn.textContent = '❌ Regla';
    delRuleBtn.onclick = () => {
      userStrategy.rules.splice(idx, 1);
      renderRules();
    };
    div.append(addBtn, actSel, delRuleBtn);
    return div;
  }

  function renderRules() {
    rulesContainer.innerHTML = '';
    userStrategy.rules.forEach((_, i) => rulesContainer.appendChild(createRuleElement(i)));
  }

  addRuleBtn.onclick = () => {
    userStrategy.rules.push({ conditions: [{ varName: 'round', operator: '>=', value: 1 }], action: 'C' });
    renderRules();
  };

  defaultSelect.value = userStrategy.defaultAction;
  defaultSelect.onchange = e => userStrategy.defaultAction = e.target.value;

  renderRules();
  window.getCurrentStrategy = () => JSON.parse(JSON.stringify(userStrategy));

  // --- SIMULACIÓN INDIVIDUAL ---
  const payoff = { 'C,C':[3,3], 'C,T':[0,5], 'T,C':[5,0], 'T,T':[1,1] };
  function playWithSteps(stratA, stratB, maxRounds = 10) {
    const steps = [];
    let scoreA = 0, scoreB = 0, historyA = [], historyB = [];
    for (let r = 1; r <= maxRounds; r++) {
      const ctxA = { round: r, myScore: scoreA, opponentScore: scoreB, opponentHistory: [...historyB], ultimoMovimientoOponente: historyB.slice(-1)[0]||null };
      const ctxB = { round: r, myScore: scoreB, opponentScore: scoreA, opponentHistory: [...historyA], ultimoMovimientoOponente: historyA.slice(-1)[0]||null };
      const mA = decideMove(stratA, ctxA), mB = decideMove(stratB, ctxB);
      historyA.push(mA); historyB.push(mB);
      const [pA, pB] = payoff[`${mA},${mB}`];
      scoreA += pA; scoreB += pB;
      steps.push({ round: r, moveA: mA, moveB: mB, pA, pB, totalA: scoreA, totalB: scoreB });
    }
    return steps;
  }

  // --- RUN TORNEO ---
  function runTournament(strats) {
    return strats.slice(1).map(op => {
      const steps = playWithSteps(strats[0].strat, op.strat, 10);
      return { a: strats[0].name, b: op.name, steps };
    });
  }

  function renderScoresChart(ctx, results) {
    const datasets = [];
    results.forEach((m, i) => {
      datasets.push({ label: `Usuario vs ${m.b} (Usuario)`, data: m.steps.map(s => s.totalA), fill: false, borderColor: '#0077FF' });
      datasets.push({ label: `Usuario vs ${m.b} (${m.b})`, data: m.steps.map(s => s.totalB), fill: false, borderColor: `hsl(${i*60},70%,50%)` });
    });
    new Chart(ctx, { type: 'line', data: { labels: results[0].steps.map(s => s.round), datasets }, options: { responsive: true } });
  }

  runSimBtn.onclick = () => {
    document.querySelectorAll('.rule').forEach((d, i) => {
      userStrategy.rules[i].action = d.querySelector('select.action-select').value;
      d.querySelectorAll('.condition').forEach((cd, j) => {
        const [vs, os, inp] = cd.querySelectorAll('select,input');
        userStrategy.rules[i].conditions[j] = { varName: vs.value, operator: os.value, value: isNaN(inp.value) ? inp.value : Number(inp.value) };
      });
    });
    userStrategy.defaultAction = defaultSelect.value;
    const results = playWithSteps(userStrategy, window.Strategies.AlwaysDefect, 10);
    outputPre.textContent = results.map(s => `R${s.round}: Tú=${s.moveA}(${s.pA}) vs O=${s.moveB}(${s.pB})`).join('\n')
      + `\nTotal: Tú=${results.slice(-1)[0].totalA}, O=${results.slice(-1)[0].totalB}`;
  };

  runTourBtn.onclick = () => {
    const userStrat = window.getCurrentStrategy();
    const strats = [
      { name: 'Usuario', strat: userStrat },
      { name: 'AlwaysDefect', strat: window.Strategies.AlwaysDefect },
      { name: 'TitForTat', strat: window.Strategies.TitForTat }
    ];
    const results = runTournament(strats);
    tournamentOutput.textContent = results.map(r => {
      const last = r.steps.slice(-1)[0];
      return `✅ ${r.a} vs ${r.b} ➜ ${last.totalA}-${last.totalB}`;
    }).join('\n');
    renderScoresChart(chartCtx, results);
    stepContainer.innerHTML = results[0].steps.map(s => `R${s.round}: A=${s.moveA}(${s.pA}) vs B=${s.moveB}(${s.pB})`).join('<br>');
  };
});
