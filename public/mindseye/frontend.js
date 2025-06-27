var database, horses, weeds, minds_eye;

/* Rastrea la suposición del jugador a medida que se hace */
var current_guess = {
  horse: '',
  weed: '',
  mind: '',
  remaining: 3
};

/* Cadenas descriptivas relacionadas con el ojo de mi mente */
/* Tan quijótico como misterioso */
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
  console.log("document ready OK");
  $.mobile.loading().hide();
  initialize(uglyHardcodedDatabase());
});

/**
 * Inicialización antes del juego. Carga bases de datos y genera contenido.
 * @param {string} raw_database - CSV bruto en texto
 */
function initialize(raw_database) {
  console.log("raw_database preview:", raw_database.slice(0, 60), "…");
  database = parseCSV(raw_database);
  console.log("initialize: filas =", database.length, database);
  
  if (database.length < 9) {
    console.warn("CSV parseado con menos de 9 filas, usando fallback mínimo.");
  }
  
  horses    = (database[0] || []).slice(1);
  weeds     = (database[4] || []).slice(1);
  minds_eye = (database[8] || []).slice(1);
  
  console.log("horses:", horses, "weeds:", weeds, "minds_eye:", minds_eye);
  
  if (horses.length && weeds.length && minds_eye.length) {
    presentOptions();
    $('#restart').on('click', function() {
      console.log("click RESTART");
      window.location.reload(false);
    });
  } else {
    console.error("Datos insuficientes para iniciar.");
    dbErrorFallback();
  }
}

/**
 * Respaldo si falla la carga de la base de datos.
 */
function dbErrorFallback() {
  $('.wrapper').append("La base de datos está ocupada. Recargando…");
  setTimeout(function() {
    window.location.reload(false);
  }, 3000);
}

/**
 * Muestra y anima las opciones de suposición.
 */
function presentOptions() {
  console.log("presentOptions");
  var triple = shuffle(getTriple());
  console.log("Candidates:", triple);
  
  triple.forEach(function(item) {
    $('#choices').prepend(
      "<tr height=100 hidden>" +
        "<td class='candidate' width=200 align=center>" + item + "</td>" +
      "</tr>"
    );
  });
  $('tr').append("<td align=center hidden><button class='horse guess'></button><div class='guesshelp' hidden>CABALLO</div></td>");
  $('tr').append("<td align=center hidden><button class='weed guess'></button><div class='guesshelp' hidden>MALA HIERBA</div></td>");
  $('tr').append("<td align=center hidden><button class='mind guess'></button><div class='guesshelp' hidden>OJO DE MI MENTE</div></td>");
  
  $('.guess')
    .on('click',      function(){ makeGuess($(this)); })
    .on('mouseenter', function(){ $(this).siblings('.guesshelp').finish().slideDown(100); })
    .on('mouseleave', function(){ $(this).siblings('.guesshelp').slideUp(500); });
  
  fadeCandidates();
  
  function fadeCandidates() {
    var next = $('tr:hidden:first');
    if (next.length > 0) next.fadeIn(800, fadeCandidates);
    else fadeGuesses();
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
    tagline.fadeIn(1500, function(){
      $('#footnote').fadeIn(1500);
    });
  }
}

/**
 * Gestiona la suposición del jugador.
 */
function makeGuess(button) {
  console.log("makeGuess");
  var candidate = button.parent().siblings('.candidate').text();
  console.log(" Candidate:", candidate);
  
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
    if (current_guess.remaining === 1) {
      makeGuess($('.guess:visible:not(:animated):first'));
    } else if (current_guess.remaining === 0) {
      validateGuesses();
    }
  });
}

/**
 * Valida las suposiciones contra la base de datos.
 */
function validateGuesses() {
  console.log("validateGuesses", current_guess);
  if ($.inArray(current_guess.horse, horses) !== -1) correctGuess('horse');
  else wrongGuess('horse');
  if ($.inArray(current_guess.weed, weeds) !== -1)   correctGuess('weed');
  else wrongGuess('weed');
  if ($.inArray(current_guess.mind, minds_eye) !== -1) correctGuess('mind');
  else wrongGuess('mind');
  
  postGuess();
  $('#restartwrapper').fadeIn(2000);
}

/**
 * Resultado correcto.
 */
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

/**
 * Resultado incorrecto.
 */
function wrongGuess(guess) {
  var item, message, offset;
  switch (guess) {
    case 'horse':
      item = current_guess.horse; message = "no fue un caballo,"; offset = 1;
      break;
    case 'weed':
      item = current_guess.weed;  message = "no fue una mala hierba,"; offset = 2;
      break;
    case 'mind':
      item = current_guess.mind;  message = "no provino de mi ojo de la mente,"; offset = 3;
      break;
  }
  var row = $('tr:contains(' + item + ')');
  var actual = getCategory(item);
  switch (actual) {
    case 'horse': message += " en realidad era un caballo."; break;
    case 'weed':  message += " de hecho era una mala hierba."; break;
    case 'mind':  message += " en realidad fue creado por mi ojo de la mente."; break;
  }
  row.append("<td class='wrong' align=left hidden> " + message + "</td>");
  row.children('.wrong').fadeIn(2000);
  buildChart(row, item);
}

/**
 * Construye y muestra gráfico de pastel.
 */
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
    { label:"MALA HIERBA",     value:statVals[1], percent:statVals[1]/totalVal },
    { label:"OJO DE MI MENTE", value:statVals[2], percent:statVals[2]/totalVal }
  ];
  
  var cell = row.children('.candidate');
  var arc = d3.svg.arc().outerRadius(radius).innerRadius(0);
  var pie = d3.layout.pie().sort(null).value(function(d){ return d.value; });
  
  var svg = d3.selectAll(cell.toArray())
    .append('svg:svg').data([stats])
    .attr('width', width).attr('height', height)
    .append('svg:g').attr('transform','translate('+width/2+','+height/2+')');
  
  var slices = svg.selectAll('g.slice').data(pie).enter().append('svg:g').attr('class','slice');
  slices.append('svg:path').attr('fill',function(d,i){return colors[i];}).attr('d',arc);
  slices.append('svg:text')
    .attr('transform', function(d){
      var r = radius + textOffset;
      var x = r * Math.cos((d.startAngle + d.endAngle - Math.PI)/2);
      var y = r * Math.sin((d.startAngle + d.endAngle - Math.PI)/2);
      return 'translate('+x+','+y+')';
    })
    .attr('text-anchor', function(d){
      return ((d.startAngle + d.endAngle)/2 < Math.PI ? 'start' : 'end');
    })
    .text(function(d,i){
      var label = stats[i].label + " - " + Math.round(stats[i].percent*100) + "%";
      return stats[i].value > 0 ? label : '';
    })
    .attr('class','slicelabel');

  $('.slicelabel').hide();
  $('.slice').children('path')
    .on('mouseenter', function(){ $(this).siblings('.slicelabel').finish().fadeIn(100); })
    .on('mouseleave', function(){ $(this).siblings('.slicelabel').fadeOut(500); });

  cell.children('svg').css({
    top:  cell.position().top  - radius/2,
    left: cell.position().left - (3*width/4)
  }).hide().fadeIn(2000);
}

/** Devuelve 'horse', 'weed' o 'mind'. */
function getCategory(candidate) {
  if ($.inArray(candidate, horses) !== -1) return 'horse';
  if ($.inArray(candidate, weeds)  !== -1) return 'weed';
  if ($.inArray(candidate, minds_eye)!==-1) return 'mind';
}

/** Toma un elemento aleatorio de cada categoría. */
function getTriple() {
  return [ randElement(horses), randElement(weeds), randElement(minds_eye) ];
}

/** Parsea CSV o aplica fallback manual */
function parseCSV(raw) {
  if ($.csv && $.csv.toArrays) {
    try {
      var arr = $.csv.toArrays(raw);
      console.log("parseCSV (plugin): filas =", arr.length);
      return arr;
    } catch(e) {
      console.error("Error en $.csv.toArrays:", e);
    }
  }
  console.warn("parseCSV fallback manual");
  return raw.split(/\r?\n/).map(function(line){
    return line.split(',');
  });
}

/** (Opcional) Envía la suposición al servidor */
function postGuess() {
  // $.ajax({ type:'POST', url:'dbmod.py', data:current_guess });
}

/** Elige un elemento aleatorio de un array */
function randElement(array) {
  var el = '';
  while (!el) el = array[Math.floor(Math.random()*array.length)];
  return el;
}

/** Baraja un array */
function shuffle(array) {
  for (var counter = array.length, t, i; counter > 0; ) {
    i = Math.floor(Math.random() * counter--);
    t = array[counter]; array[counter] = array[i]; array[i] = t;
  }
  return array;
}

/** Base de datos hardcodeada para pruebas */
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
