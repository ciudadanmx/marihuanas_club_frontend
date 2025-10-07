var database, horses, weeds, minds_eye;

/* Sigue tu objeto de estado en español */
var current_guess = {
  horse: '',
  weed: '',
  mind: '',
  remaining: 3
};

/* Mensajes traducidos para “ojo de la mente” */
var minds_eye_messages = [
  "fue fabricado dentro del ojo de mi mente.",
  "fue encontrado en lo profundo del ojo de mi mente.",
  "fue traído a ti por el ojo de mi mente.",
  "fue producido completamente por el ojo de mi mente.",
  "no fue ninguna de las anteriores, fue el ojo de mi mente.",
  "existe solo dentro del ojo de mi mente.",
  "fue una visión vista solo por el ojo de mi mente.",
  "fue construido en la fundición de mi ojo de la mente.",
  "todo estuvo en mi ojo de la mente, amigo.",
  "solo puede encontrarse dentro de mi ojo de la mente.",
  "fue una falsificación de mi ojo de la mente."
];

$(document).ready(function() {
  $.mobile.loading().hide();
  initialize(uglyHardcodedDatabase());
});

function initialize(raw_database) {
  database = parseCSV(raw_database);

  if (database.length > 0) {
    // Carga tus listas, quitando el encabezado
    horses = database[0].slice(1);
    weeds = database[4].slice(1);
    minds_eye = database[8].slice(1);

    presentOptions();

    $('#restart').on('tap click', function() {
      window.location.reload(false);
    });
  } else {
    dbErrorFallback();
  }
}

function dbErrorFallback() {
  $('.wrapper').append("La base de datos está ocupada. Recargando…");
  setTimeout(function() {
    window.location.reload(false);
  }, 3000);
}

function presentOptions() {
  var triple = shuffle(getTriple());
  triple.forEach(function(item) {
    $('#choices').prepend(
      "<tr height=100 hidden>" +
        "<td class='candidate' data-category='" + item.category + "' width=200 align=center>" +
          item.label +
        "</td>" +
      "</tr>"
    );
  });

  $('tr').append("<td align=center hidden><button class='horse guess'></button><div class='guesshelp' hidden>CABALLO</div></td>");
  $('tr').append("<td align=center hidden><button class='weed guess'></button><div class='guesshelp' hidden>MALA HIERBA</div></td>");
  $('tr').append("<td align=center hidden><button class='mind guess'></button><div class='guesshelp' hidden>OJO DE MI MENTE</div></td>");

  $('.guess')
    .on('tap click',      function(){ makeGuess($(this)); })
    .on('mouseenter',     function(){ $(this).siblings('.guesshelp').finish().slideDown(100); })
    .on('mouseleave',     function(){ $(this).siblings('.guesshelp').slideUp(500); });

  fadeCandidates();
}

function fadeCandidates() {
  var next = $('tr:hidden:first');
  if (next.length > 0) {
    next.fadeIn(800, fadeCandidates);
  } else {
    fadeGuesses();
  }
}

function fadeGuesses() {
  $('.guess').parent(':hidden').fadeIn(600).promise().done(function() {
    $(this).animate({ width: '66px' }, 600);
    $('#choices').animate({ left: '-=15%' }, 600, fadeTagline);
  });
}

function fadeTagline() {
  var tagline = $('#tagline');
  tagline.append(randElement(minds_eye_messages));
  tagline.append(" Elige tu opción.");
  tagline.fadeIn(1500, function(){ $('#footnote').fadeIn(1500); });
}

function makeGuess(button) {
  var candidate = button.parent().siblings('.candidate').text();
  var category  = button.parent().siblings('.candidate').data('category');

  $('.guesshelp').slideUp(200);
  button.parent().siblings(':not(.candidate)').fadeOut(200);

  if (button.hasClass('horse')) {
    current_guess.horse = candidate;
    $('.horse').fadeOut(200);
  } else if (button.hasClass('weed')) {
    current_guess.weed = candidate;
    $('.weed').fadeOut(200);
  } else if (button.hasClass('mind')) {
    current_guess.mind = candidate;
    $('.mind').fadeOut(200);
  }

  $('.guess').promise().done(function() {
    current_guess.remaining--;
    console.log(" Remaining:", current_guess.remaining);
    if (current_guess.remaining === 0) {
      validateGuesses();
    }
   
  });
}

function validateGuesses() {
  if ($.inArray(current_guess.horse, horses) !== -1) correctGuess('horse');
  else wrongGuess('horse');
  if ($.inArray(current_guess.weed, weeds) !== -1)   correctGuess('weed');
  else wrongGuess('weed');
  if ($.inArray(current_guess.mind, minds_eye) !== -1) correctGuess('mind');
  else wrongGuess('mind');

  postGuess();
  $('#restartwrapper').fadeIn(2000);
}

function correctGuess(guess) {
  var item, message;
  switch (guess) {
    case 'horse':
      item = current_guess.horse;
      message = "fue, por supuesto, un caballo.";
      break;
    case 'weed':
      item = current_guess.weed;
      message = "fue, efectivamente, una mala hierba.";
      break;
    case 'mind':
      item = current_guess.mind;
      message = randElement(minds_eye_messages);
      break;
  }
  var row = $('tr:contains(' + item + ')');
  row.append("<td class='correct' align=left hidden> " + message + "</td>");
  row.children('.correct').fadeIn(2000);
  buildChart(row, item);
}

function wrongGuess(guess) {
  var item, message, actual;
  switch (guess) {
    case 'horse':
      item = current_guess.horse;
      message = "no fue un caballo,";
      break;
    case 'weed':
      item = current_guess.weed;
      message = "no fue una mala hierba,";
      break;
    case 'mind':
      item = current_guess.mind;
      message = "no provino de mi ojo de la mente,";
      break;
  }
  actual = getCategory(item);
  switch (actual) {
    case 'horse': message += " en realidad era un caballo."; break;
    case 'weed':  message += " de hecho era una mala hierba."; break;
    case 'mind':  message += " en realidad fue creado por mi ojo de la mente."; break;
  }
  var row = $('tr:contains(' + item + ')');
  row.append("<td class='wrong' align=left hidden> " + message + "</td>");
  row.children('.wrong').fadeIn(2000);
  buildChart(row, item);
}

function buildChart(row, candidate) {
  var width = 400, height = 150, radius = 40, textOffset = 7;
  var colors = ['#0072aa','#c7990b','#960570'];
  var category = getCategory(candidate), index, offset;
  switch (category) {
    case 'horse': index = $.inArray(candidate, horses)+1; offset = 0; break;
    case 'weed':  index = $.inArray(candidate, weeds)+1;  offset = 4; break;
    case 'mind':  index = $.inArray(candidate, minds_eye)+1; offset = 8; break;
  }
  var statVals = [
    +database[offset+1][index],
    +database[offset+2][index],
    +database[offset+3][index]
  ];
  var totalVal = statVals[0] + statVals[1] + statVals[2];
  if (totalVal === 0) return;
  var stats = [
    { label:"CABALLO",        value:statVals[0], percent:statVals[0]/totalVal },
    { label:"MALA HIERBA",    value:statVals[1], percent:statVals[1]/totalVal },
    { label:"OJO DE MI MENTE",value:statVals[2], percent:statVals[2]/totalVal }
  ];
  var cell = row.children('.candidate');
  var arc = d3.svg.arc().outerRadius(radius).innerRadius(0);
  var pie = d3.layout.pie().sort(null).value(d=>d.value);
  var svg = d3.selectAll(cell.toArray())
    .append('svg:svg').data([stats])
    .attr('width', width).attr('height', height)
    .append('svg:g').attr('transform','translate('+width/2+','+height/2+')');
  var slices = svg.selectAll('g.slice').data(pie).enter().append('svg:g').attr('class','slice');
  slices.append('svg:path').attr('fill',(d,i)=>colors[i]).attr('d',arc);
  slices.append('svg:text')
    .attr('transform', d=>{
      var r = radius + textOffset;
      return 'translate('+
        (r*Math.cos((d.startAngle+d.endAngle-Math.PI)/2))+','+
        (r*Math.sin((d.startAngle+d.endAngle-Math.PI)/2))+')';
    })
    .attr('text-anchor', d=>((d.startAngle+d.endAngle)/2<Math.PI?'start':'end'))
    .text((d,i)=>(stats[i].value>0? stats[i].label+" - "+Math.round(stats[i].percent*100)+"%":''))
    .attr('class','slicelabel');
  $('.slicelabel').hide();
  $('.slice').children('path')
    .on('mouseenter', function(){ $(this).siblings('.slicelabel').fadeIn(100); })
    .on('mouseleave', function(){ $(this).siblings('.slicelabel').fadeOut(500); });
  cell.children('svg').css({
    top:  cell.position().top  - radius/2,
    left: cell.position().left - (3*width/4)
  }).hide().fadeIn(2000);
}

function getCategory(candidate) {
  if ($.inArray(candidate, horses)!==-1) return 'horse';
  if ($.inArray(candidate, weeds)!==-1)  return 'weed';
  if ($.inArray(candidate, minds_eye)!==-1) return 'mind';
}

// ---- ESTA ES LA LÓGICA ORIGINAL EN INGLÉS DE getTriple() ----
function getTriple() {
  // selecciona UNO de cada lista, tal cual el ejemplo inglés
  return [
    { label: randElement(horses),    category: 'horse' },
    { label: randElement(weeds),     category: 'weed'  },
    { label: randElement(minds_eye), category: 'mind'  }
  ];
}

function parseCSV(raw) {
  return $.csv.toArrays(raw);
}

function postGuess() { /* sin cambios */ }

function randElement(array) {
  var el = '';
  while (!el) el = array[Math.floor(Math.random()*array.length)];
  return el;
}

function shuffle(array) {
  for (var i=array.length, t, j; i>0; ) {
    j = Math.floor(Math.random()*i--);
    t = array[i]; array[i] = array[j]; array[j] = t;
  }
  return array;
}

function uglyHardcodedDatabase() {
  return [
    "Horse Names,Caballo A,Caballo B,Caballo C",
    "H-Guess,1,0,2",
    "W-Guess,0,1,1",
    "ME-Guess,2,1,0",
    "Weed Names,Hierba X,Hierba Y,Hierba Z",
    "H-Guess,0,2,0",
    "W-Guess,1,0,1",
    "ME-Guess,1,1,1",
    "Mind's Eye,Visión 1,Visión 2,Visión 3",
    "H-Guess,0,0,1",
    "W-Guess,1,1,0",
    "ME-Guess,1,0,1"
  ].join('\n');
}
