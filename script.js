let duracion = 4;
let intervalId = null; 
let timerInterval = null;
let audioContext = null;
let noiseSource = null;
let terapiaActiva = false;

function setDuracion(minutos) {
    duracion = minutos;
    console.log(`Duración seleccionada: ${duracion} min`);
}

function iniciarTerapia() {
    if (terapiaActiva) return;
    terapiaActiva = true;

    let terapia = document.getElementById("terapia").value;
    let modo = document.getElementById("modo").value;
    let estado = document.getElementById("estado");

    estado.textContent = `Estado: Terapia en curso (${duracion} min)`;
    console.log(`Iniciando terapia: ${terapia}, Duración: ${duracion} min, Modo LED: ${modo}`);

    resetLEDs();
    generarRuidoBlanco(duracion);
    simularLEDs(modo, duracion);
    iniciarContador(duracion); // Inicia el contador y la barra de progreso
}

function detenerTerapia() {
    if (!terapiaActiva) return;
    terapiaActiva = false;

    resetLEDs();
    detenerRuidoBlanco();
    clearInterval(intervalId);
    clearInterval(timerInterval);
    document.getElementById("estado").textContent = "Estado: Inactivo";
    document.getElementById("contador").textContent = "Tiempo restante: 00:00";
    // Reinicia la barra de progreso al 0%
    document.getElementById("progress-bar").style.width = "0%";
    console.log("Terapia detenida");
}

function simularLEDs(modo, duracion) {
    let ledRojo = document.getElementById("led-rojo");
    let ledVerde = document.getElementById("led-verde");
    let ledAzul = document.getElementById("led-azul");

    if (intervalId) clearInterval(intervalId);

    if (modo === "intermitente") {
        let secuencia = [ledRojo, ledVerde, ledAzul];
        let index = 0;
        intervalId = setInterval(() => {
            if (!terapiaActiva) return;
            resetLEDs();
            secuencia[index].classList.add("encendido");
            index = (index + 1) % secuencia.length;
        }, 300); // 0.3 segundos entre cada LED
    } else if (modo === "pausado") {
        let colores = [ledRojo, ledVerde, ledAzul];
        let index = 0;
        intervalId = setInterval(() => {
            if (!terapiaActiva) return;
            resetLEDs();
            colores[index].classList.add("encendido");
            index = (index + 1) % colores.length;
        }, 1500); // 1.5 segundos entre cada LED
    } else {
        let led = modo === "rojo" ? ledRojo : modo === "verde" ? ledVerde : ledAzul;
        led.classList.add("encendido");
    }

    setTimeout(() => {
        detenerTerapia();
        console.log("Terapia finalizada");
    }, duracion * 60 * 1000);
}

function resetLEDs() {
    document.getElementById("led-rojo").classList.remove("encendido");
    document.getElementById("led-verde").classList.remove("encendido");
    document.getElementById("led-azul").classList.remove("encendido");
}

function generarRuidoBlanco(duracion) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    let bufferSize = audioContext.sampleRate * duracion * 60;
    let buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    let output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    noiseSource.connect(audioContext.destination);
    noiseSource.start();
}

function detenerRuidoBlanco() {
    if (noiseSource) {
        noiseSource.stop();
        noiseSource.disconnect();
        noiseSource = null;
    }
}

function iniciarContador(duracion) {
    let totalTime = duracion * 60; // tiempo total en segundos
    let tiempoRestante = totalTime;
    let contadorElemento = document.getElementById("contador");
    let progressBar = document.getElementById("progress-bar");

    // Inicializa la barra de progreso al 100%
    progressBar.style.width = "100%";
    contadorElemento.textContent = `Tiempo restante: ${formatTime(tiempoRestante)}`;

    timerInterval = setInterval(() => {
        tiempoRestante--;
        contadorElemento.textContent = `Tiempo restante: ${formatTime(tiempoRestante)}`;
        // Actualiza la barra de progreso (se vacía a medida que transcurre el tiempo)
        let porcentaje = (tiempoRestante / totalTime) * 100;
        progressBar.style.width = `${porcentaje}%`;
        if (tiempoRestante <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
