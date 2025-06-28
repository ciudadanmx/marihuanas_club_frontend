document.addEventListener('DOMContentLoaded', () => {

  const overlay = document.createElement('div');
overlay.id = 'overlay-spinner';
overlay.className = 'overlay hidden';
overlay.innerHTML = '<div class="spinner-large"></div>';
document.body.appendChild(overlay);

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
  const saveBtn          = document.getElementById('save-strategy');
  const loadBtn          = document.getElementById('load-strategy');

  // --- SPINNERS ---
  [runSimBtn, runTourBtn, saveBtn, loadBtn].forEach(btn => {
    const spinner = document.createElement('span');
    spinner.className = 'spinner hidden';
    btn.parentNode.insertBefore(spinner, btn.nextSibling);
    btn._spinner = spinner;
  });

  // --- POBLAR DROPDOWNS DE ESTRATEGIAS ---
  const selA = document.getElementById('strategyA');
  const selB = document.getElementById('strategyB');
  const selC = document.getElementById('strategyC');
  const blacklist = ['AlwaysCooperate', 'AlwaysDefect', 'RandomStrategy'];

  Object.keys(window.Strategies).forEach(name => {
    // Estrategias completas para A y B
    selA.add(new Option(name, name));
    selB.add(new Option(name, name));

    // En el visor (C) filtramos las blacklisted
    if (!blacklist.includes(name)) {
      selC.add(new Option(name, name));
    }
  }); // ← aquí cierra el poblado de selects

  // --- DIV DONDE MOSTRAR DETALLES DE strategyC ---
  const viewDetailsDiv = document.getElementById('view-rule-details');

  // --- FUNCIÓN PARA RENDERIZAR DETALLES DE strategyC ---
  function renderStrategyDetails(stratName) {
    const strat = window.Strategies[stratName];
    if (!strat) {
      viewDetailsDiv.innerHTML = '<p>Estrategia no encontrada.</p>';
      return;
    }

    const actLabels = { C: 'Cooperar', T: 'Traicionar', R: 'Aleatorio' };
    const varLabels = {
      round: 'Ronda',
      ultimoMovimientoOponente: 'Último Movimiento Oponente',
      lastTwoOpponentMoves: 'Últimos Dos Movimientos Oponente',
      oppDefectRatio: 'Porcentaje Traiciones Oponente',
      myScore: 'Mi Puntuación',
      opponentScore: 'Puntuación Oponente'
    };

    let html = `<h3>Detalles de ${stratName}</h3>`;

    // Si es función preprogramada
    if (typeof strat === 'function') {
      html += '<p><em>Esta estrategia es preprogramada y no tiene reglas configurables.</em></p>';
    
    // Si es objeto con reglas configurables
    } else if (Array.isArray(strat.rules) && strat.rules.length > 0) {
      html += '<ul>';
      strat.rules.forEach((rule, idx) => {
        const conditionsArray = rule.conditions
          ? rule.conditions
          : rule.condition
            ? [rule.condition]
            : [];

        const condsText = conditionsArray
          .map(c => {
            const label = varLabels[c.varName] || c.varName;
            return `${label} ${c.operator} ${c.value}`;
          })
          .join(' y ');

        html += `<li><strong>Regla ${idx + 1}:</strong> Si ${condsText} entonces ${actLabels[rule.action]}</li>`;
      });
      html += '</ul>';
      html += `<p><strong>Acción por defecto:</strong> ${actLabels[strat.defaultAction] || strat.defaultAction}</p>`;

    // Si es objeto pero sin reglas
    } else {
      html += '<p><em>No hay reglas configurables para esta estrategia.</em></p>';
    }

    viewDetailsDiv.innerHTML = html;
  }

  // listener
  selC.addEventListener('change', e => renderStrategyDetails(e.target.value));
  if (selC.value) renderStrategyDetails(selC.value);

  // --- Nuevo select de Oponente para el constructor visual ---
  const visualOpponentSelect = document.createElement('select');
  visualOpponentSelect.id = 'visual-opponent';
  Object.keys(window.Strategies).forEach(name => {
    visualOpponentSelect.add(new Option(name, name));
  });
  const visualLabel = document.createElement('label');
  visualLabel.classList.add('amarillo'); // Aquí agregas la clase
  visualLabel.textContent = 'Estrategia Oponente (para Pruebas): ';
  visualLabel.appendChild(visualOpponentSelect);
  const visualTitle = document.querySelector('h2');
  visualTitle.parentNode.insertBefore(visualLabel, visualTitle.nextSibling);

  // --- CONFIGURACIÓN DE VARIABLES/OPERADORES/ACCIONES ---
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

  // --- ESTADO DEL USUARIO ---
  let userStrategy = { rules: [], defaultAction: 'C' };

  // --- MOTOR DE REGLAS ---
  const operations = {
    '==': (a,b)=>a==b,
    '!=': (a,b)=>a!=b,
    '<':  (a,b)=>a<b,
    '>':  (a,b)=>a>b,
    '<=': (a,b)=>a<=b,
    '>=': (a,b)=>a>=b
  };
  function evaluateCondition(cond, context) {
    let left;
    switch(cond.varName) {
      case 'round': left = context.round; break;
      case 'ultimoMovimientoOponente': left = context.ultimoMovimientoOponente; break;
      case 'myScore': left = context.myScore; break;
      case 'opponentScore': left = context.opponentScore; break;
      case 'oppDefectRatio':
        const hist = context.opponentHistory || [];
        left = (hist.length === 0 
          ? 0 
          : hist.filter(m => m==='T').length / hist.length
        ) * 100;
        break;
      default:
        throw new Error(`Variable desconocida: ${cond.varName}`);
    }
    const fn = operations[cond.operator];
    if (!fn) throw new Error(`Operador no soportado: ${cond.operator}`);
    return fn(left, cond.value);
  }
  function decideMove(strategy, context) {
    for (const rule of strategy.rules) {
      if ((rule.conditions||[]).every(c => evaluateCondition(c, context))) {
        return rule.action==='R'
          ? (Math.random()<0.5?'C':'T')
          : rule.action;
      }
    }
    return strategy.defaultAction==='R'
      ? (Math.random()<0.5?'C':'T')
      : strategy.defaultAction;
  }
  window.decideMove = decideMove;

  // --- UI DE REGLAS ---
  function createConditionElement(rIdx, cIdx) {
    const cond = userStrategy.rules[rIdx].conditions[cIdx];
    const div = document.createElement('div');
    div.className = 'condition';

    const varSel = document.createElement('select');
    variables.forEach(v => {
      const o = new Option(varLabels[v], v);
      if (v===cond.varName) o.selected = true;
      varSel.add(o);
    });
    function createOpSel() {
      const sel = document.createElement('select');
      const numeric = ['round','oppDefectRatio','opponentScore','myScore'];
      const ops = numeric.includes(varSel.value) ? operators : ['=='];
      ops.forEach(o => {
        const opt = new Option(o,o);
        if (o===cond.operator) opt.selected = true;
        sel.add(opt);
      });
      return sel;
    }
    let opSel = createOpSel();
    function createValEl() {
      if (['round', 'porcentajeTraicion'].includes(varSel.value)) {
        const n = document.createElement('input');
        n.type = 'number';
        n.value = cond.value;
        return n;
      } else {
        const sel = document.createElement('select');
        [
          { label: 'Cooperar', value: 'C' },
          { label: 'Traicionar', value: 'T' }
        ].forEach(opt => {
          const o = new Option(opt.label, opt.value);
          if (opt.value === cond.value) o.selected = true;
          sel.add(o);
        });
        return sel;
      }
    }
    let valEl = createValEl();
    const delBtn = document.createElement('button');
    delBtn.type='button'; delBtn.textContent='– Condición';
    delBtn.onclick = () => { userStrategy.rules[rIdx].conditions.splice(cIdx,1); renderRules(); };
    div.append(varSel, opSel, valEl, delBtn);
    varSel.onchange = () => {
      const newOp = createOpSel();
      div.replaceChild(newOp, opSel); opSel=newOp;
      const newVal = createValEl();
      div.replaceChild(newVal, valEl); valEl=newVal;
    };
    return div;
  }
  function createRuleElement(idx) {
    const rule = userStrategy.rules[idx];
    const div = document.createElement('div');
    div.className='rule';
    rule.conditions.forEach((_,ci)=>div.appendChild(createConditionElement(idx,ci)));
    const addBtn = document.createElement('button');
    addBtn.type='button'; addBtn.textContent='+ Condición';
    addBtn.onclick = ()=>{ rule.conditions.push({ varName:'round',operator:'>=',value:1 }); renderRules(); };
    const actSel = document.createElement('select');
    actSel.className='action-select';
    actions.forEach(a=>{
      const opt=new Option(a.label,a.value);
      if(a.value===rule.action) opt.selected=true;
      actSel.add(opt);
    });
    const delRuleBtn = document.createElement('button');
    delRuleBtn.type='button'; delRuleBtn.textContent='❌ Regla';
    delRuleBtn.onclick=()=>{ userStrategy.rules.splice(idx,1); renderRules(); };
    div.append(addBtn, actSel, delRuleBtn);
    return div;
  }
  function renderRules(){
    rulesContainer.innerHTML='';
    userStrategy.rules.forEach((_,i)=>rulesContainer.appendChild(createRuleElement(i)));
  }
  addRuleBtn.onclick = () => {
    userStrategy.rules.push({ conditions:[{ varName:'round',operator:'/>=/',value:1 }], action:'C' });
    renderRules();
  };
  defaultSelect.value = userStrategy.defaultAction;
  defaultSelect.onchange = e=>{ userStrategy.defaultAction=e.target.value; };
  renderRules();
  window.getCurrentStrategy = ()=>JSON.parse(JSON.stringify(userStrategy));

  // --- SIMULACIÓN VISUAL ---
  function playWithSteps(stratA, stratB, maxRounds=10) {
    const steps=[]; let scoreA=0, scoreB=0; const historyA=[], historyB=[];
    for(let r=1;r<=maxRounds;r++){
      const ctxA={ round:r, myScore:scoreA, opponentScore:scoreB, opponentHistory:[...historyB], ultimoMovimientoOponente:historyB.slice(-1)[0]||null };
      const ctxB={ round:r, myScore:scoreB, opponentScore:scoreA, opponentHistory:[...historyA], ultimoMovimientoOponente:historyA.slice(-1)[0]||null };
      const mA=decideMove(stratA,ctxA);
      const mB=decideMove(stratB,ctxB);
      historyA.push(mA); historyB.push(mB);
      const payoff={'C,C':[3,3],'C,T':[0,5],'T,C':[5,0],'T,T':[1,1]};
      const [pA,pB]=payoff[`${mA},${mB}`];
      scoreA+=pA; scoreB+=pB;
      steps.push({ round:r, moveA:mA,moveB:mB,pA,pB,totalA:scoreA,totalB:scoreB });
    }
    return steps;
  }
  runSimBtn.onclick = () => {
    runSimBtn.disabled = true;
    runSimBtn._spinner.classList.remove('hidden');

    document.querySelectorAll('.rule').forEach((d,i)=>{
      userStrategy.rules[i].action = d.querySelector('select.action-select').value;
      d.querySelectorAll('.condition').forEach((cd,j)=>{
        const [vs,os,inp] = cd.querySelectorAll('select,input');
        userStrategy.rules[i].conditions[j] = {
          varName: vs.value,
          operator: os.value,
          value: isNaN(inp.value)?inp.value:Number(inp.value)
        };
      });
    });
    userStrategy.defaultAction = defaultSelect.value;
    const opponentName = visualOpponentSelect.value;
    const opponentStrat = window.Strategies[opponentName];
    const results = playWithSteps(userStrategy, opponentStrat, 10);
    outputPre.textContent = results
      .map(s=>`R${s.round}: Tú=${s.moveA}(${s.pA}) vs ${opponentName}=${s.moveB}(${s.pB})`)
      .join('\n') + `\nTotal: Tú=${results.slice(-1)[0].totalA}, ${opponentName}=${results.slice(-1)[0].totalB}`;

    runSimBtn._spinner.classList.add('hidden');
    runSimBtn.disabled = false;
  };

  // --- SIMULAR 2 ESTRATEGIAS SELECCIONADAS ---
  const runCustomBtn = document.getElementById('runCustom');
  runCustomBtn.onclick = () => {
    runCustomBtn.disabled = true;
    runCustomBtn._spinner = document.createElement('span');
    runCustomBtn._spinner.className = 'spinner hidden';
    runCustomBtn.parentNode.insertBefore(runCustomBtn._spinner, runCustomBtn.nextSibling);
    runCustomBtn._spinner.classList.remove('hidden');

    const nameA = selA.value;
    const nameB = selB.value;
    const stratA = window.Strategies[nameA];
    const stratB = window.Strategies[nameB];
    const results = playWithSteps(stratA, stratB, 10);
    outputPre.textContent = results
      .map(s => `R${s.round}: ${nameA}=${s.moveA}(${s.pA}) vs ${nameB}=${s.moveB}(${s.pB})`)
      .join('\n')
      + `\nTotal: ${nameA}=${results.slice(-1)[0].totalA}, ${nameB}=${results.slice(-1)[0].totalB}`;

    runCustomBtn._spinner.classList.add('hidden');
    runCustomBtn.disabled = false;
  };

  // --- TORNEO ---
  function runTournament(strats) {
    const ROUNDS = Math.floor(Math.random() * (220 - 180 + 1)) + 180;  // número de rondas deseado
    return strats.slice(1).map(op => ({
      a: strats[0].name,
      b: op.name,
      steps: playWithSteps(strats[0].strat, op.strat, ROUNDS)
    }));
  }

  function renderScoresChart(ctx, results) {
    runTourBtn._spinner.classList.remove('hidden');
    const datasets=[]; const userHue=210;
    results.forEach((m,i)=>{
      const light=Math.max(30,80 - i*10);
      datasets.push({
        label: `Usuario vs ${m.b} (Usuario)`,
        data: m.steps.map(s=>s.totalA),
        fill:false, borderColor:`hsl(${userHue},70%,${light}%)`
      });
      const oppHue=(i*60+30)%360;
      datasets.push({
        label: `Usuario vs ${m.b} (${m.b})`,
        data: m.steps.map(s=>s.totalB),
        fill:false, borderColor:`hsl(${oppHue},70%,50%)`
      });
    });
    new Chart(ctx, {
      type:'line',
      data:{ labels:results[0].steps.map(s=>s.round), datasets },
      options:{ responsive:true }
    });
  }

  runTourBtn.onclick = () => {
    
    runTourBtn.disabled = true;
    runTourBtn._spinner.classList.remove('hidden');

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

    stepContainer.innerHTML = '';
    const tabsNav = document.createElement('div');
    tabsNav.className = 'tabs-nav';
    const tabsContent = document.createElement('div');
    tabsContent.className = 'tabs-content';

    results.forEach((match, idx) => {
      const tabBtn = document.createElement('button');
      tabBtn.textContent = match.b;
      tabBtn.className = idx === 0 ? 'active' : '';
      tabBtn.onclick = () => {
        tabsNav.querySelectorAll('button').forEach((btn, i) => {
          btn.className = i === idx ? 'active' : '';
          tabsContent.querySelectorAll('.tab-panel')[i].style.display =
            i === idx ? 'block' : 'none';
        });
      };
      tabsNav.appendChild(tabBtn);

      const panel = document.createElement('div');
      panel.className = 'tab-panel';
      panel.style.display = idx === 0 ? 'block' : 'none';
      panel.innerHTML = match.steps
        .map(
          s =>
            `<p>R${s.round}: Tú=${s.moveA}(${s.pA}) vs ${match.b}=${s.moveB}(${s.pB}) — Totales: ${s.totalA}-${s.totalB}</p>`
        )
        .join('');
      tabsContent.appendChild(panel);
    });

    stepContainer.appendChild(tabsNav);
    stepContainer.appendChild(tabsContent);

    runTourBtn._spinner.classList.add('hidden');
  };

  // ————————————————————————————————
  // Exportar estrategia a JSON y forzar descarga
  saveBtn.onclick = () => {
    saveBtn.disabled = true;
    saveBtn._spinner.classList.remove('hidden');
    const dataStr = JSON.stringify(userStrategy, null, 2);
    const blob    = new Blob([dataStr], { type: 'application/json' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = 'estrategia.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    saveBtn._spinner.classList.add('hidden');
    saveBtn.disabled = false;
  };

  // ————————————————————————————————
  // Cargar estrategia desde JSON elegido por el usuario
  loadBtn.onclick = () => {
    loadBtn.disabled = true;
    loadBtn._spinner.classList.remove('hidden');
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept= '.json';
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const obj = JSON.parse(e.target.result);
          if (obj.rules && Array.isArray(obj.rules) && obj.defaultAction) {
            userStrategy = obj;
            defaultSelect.value = userStrategy.defaultAction;
            renderRules();
          } else {
            alert('JSON inválido: formato de estrategia no reconocido.');
          }
        } catch {
          alert('Error al parsear JSON.');
        }
        loadBtn._spinner.classList.add('hidden');
        loadBtn.disabled = false;
      };
      reader.readAsText(file);
    };
    input.click();
  };

});
