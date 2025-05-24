let port;
let writer;
let connected = false;
let duracion = 0;
let intervalo;

async function conectarArduino() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        writer = port.writable.getWriter();
        connected = true;
        console.log("Arduino conectado");
    } catch (err) {
        console.error("Error al conectar con Arduino:", err);
    }
}

async function enviarComando(comando) {
    if (connected && writer) {
        const data = new TextEncoder().encode(comando + "\n");
        await writer.write(data);
        console.log(`Enviado: ${comando}`);
    } else {
        console.log("Arduino no conectado");
    }
}

function iniciarTerapia() {
    let terapia = document.getElementById("terapia").value;
    let modo = document.getElementById("modo").value;
    
    if (duracion === 0) {
        alert("Selecciona una duración antes de iniciar la terapia.");
        return;
    }
    
    let comando = `inicio:${terapia},${modo},${duracion}`;
    enviarComando(comando);
    
    document.getElementById("estado").innerText = "Estado: En terapia";
    iniciarContador(duracion);
}

function detenerTerapia() {
    enviarComando("stop");
    document.getElementById("estado").innerText = "Estado: Inactivo";
    detenerContador();
}

function setDuracion(minutos) {
    duracion = minutos;
    console.log(`Duración establecida: ${duracion} minutos`);
}

function iniciarContador(minutos) {
    let segundosTotales = minutos * 60;
    let contador = document.getElementById("contador");
    let progressBar = document.getElementById("progress-bar");
    
    intervalo = setInterval(() => {
        let minutosRestantes = Math.floor(segundosTotales / 60);
        let segundosRestantes = segundosTotales % 60;
        
        contador.innerText = `Tiempo restante: ${minutosRestantes}:${segundosRestantes < 10 ? "0" : ""}${segundosRestantes}`;
        let progreso = ((minutos * 60 - segundosTotales) / (minutos * 60)) * 100;
        progressBar.style.width = progreso + "%";
        
        if (segundosTotales <= 0) {
            clearInterval(intervalo);
            document.getElementById("estado").innerText = "Estado: Inactivo";
        }
        
        segundosTotales--;
    }, 1000);
}

function detenerContador() {
    clearInterval(intervalo);
    document.getElementById("contador").innerText = "Tiempo restante: 00:00";
    document.getElementById("progress-bar").style.width = "0%";
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-conectar").addEventListener("click", conectarArduino);
});