const ICONS = [
  'apple', 'apricot', 'banana', 'big_win', 'cherry', 'grapes', 'lemon',
  'lucky_seven', 'orange', 'pear', 'strawberry', 'watermelon',
];

const BASE_SPINNING_DURATION = 2.7;
const COLUMN_SPINNING_DURATION = 0.3;

let cols;
let puntos = 0;

window.addEventListener('DOMContentLoaded', function () {
  cols = document.querySelectorAll('.col');
  setInitialItems();

  // Mostrar puntos iniciales
  document.getElementById('score').textContent = "Puntos Ganados: " + puntos;

  // Aviso si está en orientación vertical
  if (window.innerHeight > window.innerWidth) {
    const aviso = document.createElement("div");
    aviso.textContent = "🔄 Gira tu dispositivo para jugar mejor";
    aviso.style.position = "fixed";
    aviso.style.top = "20px";
    aviso.style.left = "50%";
    aviso.style.transform = "translateX(-50%)";
    aviso.style.backgroundColor = "#1b1b1b";
    aviso.style.color = "#aaff00";
    aviso.style.padding = "10px 20px";
    aviso.style.borderRadius = "12px";
    aviso.style.zIndex = "9999";
    aviso.style.fontFamily = "'Segoe UI', sans-serif";
    aviso.style.fontSize = "15px";
    aviso.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    aviso.style.border = "2px solid #333";
    aviso.style.textAlign = "center";
    aviso.style.maxWidth = "90%";

    document.body.appendChild(aviso);
    setTimeout(() => aviso.remove(), 5000);
  }
});

window.addEventListener("resize", () => location.reload());

function setInitialItems() {
  const baseItemAmount = 40;

  for (let i = 0; i < cols.length; ++i) {
    const col = cols[i];
    const amountOfItems = baseItemAmount + (i * 3);
    let elms = '';
    let firstThreeElms = '';

    for (let x = 0; x < amountOfItems; x++) {
      const icon = getRandomIcon();
      const item = `<div class="icon" data-item="${icon}"><img src="items/${icon}.png"></div>`;
      elms += item;
      if (x < 3) firstThreeElms += item;
    }

    col.innerHTML = elms + firstThreeElms;
  }
}

function spin(elem) {
  let duration = BASE_SPINNING_DURATION + randomDuration();

  for (const col of cols) {
    duration += COLUMN_SPINNING_DURATION + randomDuration();
    col.style.animationDuration = duration + "s";
  }

  elem.setAttribute('disabled', true);
  document.getElementById('container').classList.add('spinning');

  setTimeout(setResult, BASE_SPINNING_DURATION * 1000 / 2);

  setTimeout(() => {
    document.getElementById('container').classList.remove('spinning');
    elem.removeAttribute('disabled');
  }, duration * 1000);
}

function setResult() {
  let resultadoFinal = [];

  for (const col of cols) {
    const results = [
      getRandomIcon(),
      getRandomIcon(),
      getRandomIcon()
    ];

    resultadoFinal.push(results[1]); // ícono central de cada columna

    const icons = col.querySelectorAll('.icon img');
    for (let x = 0; x < 3; x++) {
      icons[x].setAttribute('src', `items/${results[x]}.png`);
      icons[(icons.length - 3) + x].setAttribute('src', `items/${results[x]}.png`);
    }
  }

  const allEqual = resultadoFinal.every(icon => icon === resultadoFinal[0]);

  const mensaje = document.createElement('div');
  mensaje.style.position = "fixed";
  mensaje.style.top = "50%";
  mensaje.style.left = "50%";
  mensaje.style.transform = "translate(-50%, -50%)";
  mensaje.style.padding = "20px 30px";
  mensaje.style.background = allEqual ? "#00c853" : "#b71c1c";
  mensaje.style.color = "#fff";
  mensaje.style.fontSize = "24px";
  mensaje.style.fontFamily = "sans-serif";
  mensaje.style.borderRadius = "12px";
  mensaje.style.boxShadow = "0 0 10px rgba(0,0,0,0.4)";
  mensaje.style.zIndex = "9999";
  mensaje.textContent = allEqual ? "🎉 ¡GANASTE! 🎰" : "💨 Sigue intentando...";
  document.body.appendChild(mensaje);

  // Si ganó, sumar puntos
  if (allEqual) {
    puntos += 100;
    document.getElementById('score').textContent = "Puntos Ganados: " + puntos;
  }

  setTimeout(() => mensaje.remove(), 3000);
}

function getRandomIcon() {
  return ICONS[Math.floor(Math.random() * ICONS.length)];
}

function randomDuration() {
  return Math.floor(Math.random() * 10) / 100;
}
