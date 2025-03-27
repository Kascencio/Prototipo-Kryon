let duracion = 4;
let intervalId = null; 
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
}

function detenerTerapia() {
    if (!terapiaActiva) return;
    terapiaActiva = false;

    resetLEDs();
    detenerRuidoBlanco();
    clearInterval(intervalId);
    document.getElementById("estado").textContent = "Estado: Inactivo";
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