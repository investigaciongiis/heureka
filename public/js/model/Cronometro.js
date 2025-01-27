export class Cronometro {

    constructor() {
        this.segundosTranscurridos = 0;
        this.intervalo = null;
    }

    iniciar() {
        this.intervalo = setInterval(() => this.segundosTranscurridos++, 1000);
    }

    pausar() {
        clearInterval(this.intervalo);
    }

    leerValor() {
        return this.segundosToHHMMSS(this.segundosTranscurridos);
    }

    segundosToHHMMSS(segundos) { 
        let horas = Math.trunc(segundos / 3600);
        segundos %= 3600;
        let minutos = Math.trunc(segundos / 60);
        segundos %= 60;

        return { horas: horas, minutos: minutos, segundos: segundos };
    }
}