export class Pregunta {

    constructor(numHeuristica, nombreHeuristica, definicionHeuristica, esBuenEjemplo, tarjetasRespuesta, idTarjetaCorrecta) {
        this.numHeuristica = numHeuristica;
        this.nombreHeuristica = nombreHeuristica;
        this.definicionHeuristica = definicionHeuristica;
        this.esBuenEjemplo = esBuenEjemplo;
        this.tarjetasRespuesta = tarjetasRespuesta;
        this.idTarjetaCorrecta = idTarjetaCorrecta;
    }

    esRespuestaCorrecta(idTarjetaSeleccionada) {
        return idTarjetaSeleccionada == this.idTarjetaCorrecta;
    }
}