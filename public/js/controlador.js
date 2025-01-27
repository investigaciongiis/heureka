import { Partida } from './model/Partida.js';

export class Controlador {

    constructor(mazoTarjetas, infoHeuristicas) {
        this.partidaActual = new Partida(mazoTarjetas, infoHeuristicas);
    }

    nuevaPregunta() {
        return this.partidaActual.nuevaPregunta();
    }

    esRespuestaCorrecta(idTarjetaSeleccionada) {
        return this.partidaActual.esRespuestaCorrecta(idTarjetaSeleccionada);
    }

    getPreguntaActual() {
        return this.partidaActual.preguntaActual;
    }

    getNumVidasActuales() {
        return this.partidaActual.numVidasActuales;
    }

    restarVida() {
        this.partidaActual.restarVida();
    }

    haTerminadoPartida() {
        return this.partidaActual.haTerminadoPartida();
    }

    getNumAcertadas() {
        return this.partidaActual.numAcertadas;
    }

    getNumPreguntadas() {
        return this.partidaActual.getNumPreguntadas();
    }

    iniciarCronometro() {
        this.partidaActual.iniciarCronometro();
    }

    pausarCronometro() {
        this.partidaActual.pausarCronometro();
    }

    leerValorCronometro() {
        return this.partidaActual.leerValorCronometro();
    }
}