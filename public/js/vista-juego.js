import {Controlador} from './controlador.js';

let controlador = null;

$(document).ready( () => {

    // Deshabilitar botón por defecto
    $("#boton-accion").prop("disabled", true);
    
    $("#boton-ayuda").click(clicAyuda);

    // Obtener tarjetas de juego y definiciones de heuristicas
    $('#cargando').show();

    if(!window.localStorage.getItem('heureka_device_id')){
        window.localStorage.setItem('heureka_device_id', randomString(30));
    }

    $("#boton-jugar").click(clicNuevaPartida);


    $.ajax({
        url: '/configuracion-juego',
        type: 'GET',
        async: true,
        success: function(result, status, xhr) {
            $('#cargando').hide();
            let mazoTarjetas = result.tarjetas;
            let infoHeuristicas = result.heuristicas;
            controlador = new Controlador(mazoTarjetas, infoHeuristicas);
            setupPartida();
        },
        error: function(xhr, status, error) {
            $.ajax({
                url: '/error500.html',
                type: 'GET',
                async: true,
                success: function(result, status, xhr) {
                },
                error: function(xhr, status, error) {
                    window.location.href = "error500.html";
                }
            });
        }
    });
})

function clicNuevaPartida(){
    postNewEvent(0, function(){location.href = 'game.html';});
}

function randomString (len) {
    var charSet = 'ABCDEFGHJKMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz23456789';
    var randomStringValue = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomStringValue += charSet.substring(randomPoz,randomPoz + 1);
    }
    return randomStringValue;
};

function setupPartida() {
    mostrarNuevaPregunta();
    actualizarCronometro();
    actualizarVidas();
    setInterval(actualizarCronometro, 500);
}

function actualizarVidas() {
    const plantillaVidas = $("#plantilla-vidas").html();
    const plantillaVidasCompilada = Handlebars.compile(plantillaVidas);

    let cadenaVidas = "";
    switch(controlador.getNumVidasActuales()) {
        case 0: cadenaVidas = "<span id=\"ultima-vida\">💀</span>💀💀"; break;
        case 1: cadenaVidas = "❤️<span id=\"ultima-vida\">💀</span>💀"; break;
        case 2: cadenaVidas = "❤️❤️<span id=\"ultima-vida\">💀</span>"; break;
        case 3: cadenaVidas = "❤️❤️❤️"; break;
    }

    var contexto = {
        "vidas" : cadenaVidas
    };

    $("#vidas").html(plantillaVidasCompilada(contexto));
}

function actualizarCronometro() {
    const plantillaCronometro = $("#plantilla-cronometro").html();
    const plantillaCronometroCompilada = Handlebars.compile(plantillaCronometro);
   
    var contexto = {
        "cronometro" : cronometroToString(controlador.leerValorCronometro())
    };

    $("#cronometro").html(plantillaCronometroCompilada(contexto));
}

function mostrarNuevaPregunta() {

    // Iniciar cronómetro
    controlador.iniciarCronometro();

    // Generar nueva pregunta
    const preguntaActual = controlador.nuevaPregunta();
    const plantillaHeuristica = $("#plantilla-heuristica").html();
    const plantillaAyuda = $("#plantilla-ayuda").html();
    const plantillaRespuestas = $("#plantilla-respuestas").html();
    const plantillaHeuristicaCompilada = Handlebars.compile(plantillaHeuristica);
    const plantillaRespuestasCompilada = Handlebars.compile(plantillaRespuestas);
    const plantillaAyudaCompilada = Handlebars.compile(plantillaAyuda);

    var contexto = {
        "numPregunta" : controlador.getNumPreguntadas(),
        "cumpla": preguntaActual.esBuenEjemplo? "cumpla" : "",
        "incumpla": preguntaActual.esBuenEjemplo? "" : "👎INCUMPLA",
        "numHeuristica" : preguntaActual.numHeuristica,
        "nombreHeuristica" : preguntaActual.nombreHeuristica,
        "tarjetas" : preguntaActual.tarjetasRespuesta,
        "ayuda" : preguntaActual.definicionHeuristica
    };

    // Actualizar interfaz con pregunta
    new Promise((resolve, reject) => {
        $("#heuristica").html(plantillaHeuristicaCompilada(contexto));
        resolve();
    }).then(() => {
        $("#mal-ejemplo").addClass("animar");
    });
    $("#tarjetas").html(plantillaRespuestasCompilada(contexto));
    $("#ayuda").html(plantillaAyudaCompilada(contexto));

    // Manejar selección de respuesta
    $(".tarjeta").click(clicTarjeta);
    $(".tarjeta").keyup((e) => {
        var code = e.keyCode || e.which;
        if(code == 13) { // Enter
            clicTarjeta(e);
        }
    });

    // Manejar clic en "confirmar" respuesta
    $("#boton-accion").click(mostrarCorreccion);

    $("#boton-accion").removeClass("animar");
}

function mostrarCorreccion() {

    postNewEvent(1);
    // Pausar cronómetro
    controlador.pausarCronometro();

    // Inhabilitar selección de nuevas tarjetas
    $(".tarjeta").off("click");

    // Cambiar botón "Confirmar" a "Terminar partida" o "Siguiente pregunta"
    if (controlador.haTerminadoPartida()) {
        let haGanado = true;
        setBotonTerminarPartida(haGanado);
    } else {
        setBotonSiguientePregunta();
    }

    // Marcar en rojo respuesta seleccionada
    $(".tarjeta.active").css("border-color", "red");
    $(".tarjeta.active").css("background-color", "rgba(255,0,0, .1)");
    let idTarjetaSeleccionada = $(".tarjeta.active").attr("id");
    $(`#etiqueta-correccion-${idTarjetaSeleccionada}`).html("Respuesta incorrecta.");

    // Marcar en verde respuesta correcta
    // (si es la seleccionada sobreescribe el rojo)
    let idCorrecta = controlador.getPreguntaActual().idTarjetaCorrecta;
    let correcta = $("#tarjetas").find(`#${idCorrecta}`);
    correcta.css("border-color", "green");
    correcta.css("background-color", "rgba(51, 170, 51, .1)");
    $(`#etiqueta-correccion-${idCorrecta}`).html("Respuesta correcta.");

    // Animar tick en respuesta correcta
    $(".tick-contenedor").removeClass("animar");
    $(`#tick-contenedor-${idCorrecta}`).addClass("animar");

    // Si la respuesta es incorrecta, animar cruz y restar vida
    if (!controlador.esRespuestaCorrecta(idTarjetaSeleccionada)) {

        // Sonido respuesta incorrecta
        $("#audio-respuesta-incorrecta")[0].volume = 0.3;
        $("#audio-respuesta-incorrecta")[0].play();

        $(`#cruz-contenedor-${idTarjetaSeleccionada}`).addClass("animar");

        controlador.restarVida();

        if (controlador.getNumVidasActuales() == 0) {
            actualizarVidas();
            let haGanado = false;
            setBotonTerminarPartida(haGanado);
        } else {
            actualizarCronometro();
            actualizarVidas();
        }
        // Animación restar vida
        $("#ultima-vida").addClass("animar");
    } else {
        // Sonido respuesta correcta
        $("#audio-respuesta-correcta")[0].volume = 0.3;
        $("#audio-respuesta-correcta")[0].play();
    }

    sendResultQuestion();
}

function sendResultQuestion(){
    let idCorrecta = controlador.getPreguntaActual().idTarjetaCorrecta;
    let idTarjetaSeleccionada = $(".tarjeta.active").attr("id");
    let numHeuristica = controlador.getPreguntaActual().numHeuristica;
    let valorCronometro = cronometroToTime(controlador.leerValorCronometro());
    let vidas_restantes = controlador.getNumVidasActuales();
    postNewQuestionResults(valorCronometro, numHeuristica, idCorrecta, idTarjetaSeleccionada, vidas_restantes)
}

function clicAyuda() {
    $(".audio-boton-auxiliar")[0].volume = 0.3;
    $(".audio-boton-auxiliar")[0].play();
    if (!$("#ayuda").hasClass("animar")) {
        $("#ayuda").attr("role", "alert");
        $("#ayuda").addClass("animar");
        $("#boton-ayuda").val("Ver definición ➖");
    } else {
        $("#ayuda").removeAttr("role");
        $("#ayuda").removeClass("animar");
        $("#boton-ayuda").val("Ver definición ➕");
    }
    postNewEvent(2);
}

function terminarPartida(haGanado) {
    let queryString = 
        `?acertadas=${encodeURIComponent(controlador.getNumAcertadas())}`
        +`&total=${encodeURIComponent(controlador.getNumPreguntadas())}`
        + `&tiempo2=${encodeURIComponent(cronometroToTime(controlador.leerValorCronometro()))}`
        + `&tiempo=${encodeURIComponent(cronometroToString(controlador.leerValorCronometro()))}`
        + `&vidas=${encodeURIComponent(controlador.getNumVidasActuales())}`;

    if (haGanado) {
        window.location.href = "has-ganado.html" + queryString;
    } else {
        window.location.href = "has-perdido.html" + queryString;
    }
}

function setBotonTerminarPartida(haGanado) {
    $("#boton-accion").val('Terminar partida');
    $("#boton-accion").off('click');
    $("#boton-accion").click(() => {
        postNewEvent(4);
        terminarPartida(haGanado);
    });
}

function setBotonSiguientePregunta() {
    $("#boton-accion").val('Siguiente pregunta');
    $("#boton-accion").off('click');
    $("#boton-accion").click(clicBotonSiguiente);
}

function setBotonConfirmar() {
    // Cambiar texto del botón
    $("#boton-accion").val('Confirmar respuesta');

    // Cambiar manejador
    $("#boton-accion").off('click');
    $("#boton-accion").click(mostrarCorreccion);

    // Deshabilitar por defecto
    $("#boton-accion").prop("disabled", true);
}

function clicBotonSiguiente() {
    postNewEvent(5);
    $(".audio-boton-auxiliar")[0].volume = 0.3;
    $(".audio-boton-auxiliar")[0].play();
    mostrarNuevaPregunta();
    setBotonConfirmar();
}

function cronometroToString(HHMMSS) {

    let cadenaCronometro = "";

    if (HHMMSS.horas > 0) {
        cadenaCronometro += `${HHMMSS.horas} h `
    }
    if (HHMMSS.minutos > 0) {
        cadenaCronometro += `${HHMMSS.minutos} min `
    }
    if (HHMMSS.segundos > 0) {
        cadenaCronometro += `${HHMMSS.segundos} s`
    }

    return cadenaCronometro;
}

function cronometroToTime(HHMMSS) {

    let cadenaCronometro = "";

    if (HHMMSS.horas > 0) {
        cadenaCronometro += (HHMMSS.segundos < 10 ? '0' : '') + `${HHMMSS.horas}:`
    } else {
        cadenaCronometro += `00:`
    }
    if (HHMMSS.minutos > 0) {
        cadenaCronometro += (HHMMSS.segundos < 10 ? '0' : '') + `${HHMMSS.minutos}:`
    } else {
        cadenaCronometro += `00:`
    }
    if (HHMMSS.segundos > 0) {
        cadenaCronometro += (HHMMSS.segundos < 10 ? '0' : '') + `${HHMMSS.segundos}`
    } else {
        cadenaCronometro += `00`
    }

    return cadenaCronometro;
}

function clicTarjeta(event) {
    postNewEvent(3);
    // Efecto de sonido
    $("#audio-clic-tarjeta")[0].volume = 0.3;
    $("#audio-clic-tarjeta")[0].play();

    if($(event.currentTarget).hasClass("active")) {
        // Animar deselección
        $(event.currentTarget).removeClass("active");

        // Deshabilitar botón "confirmar"
        $("#boton-accion").prop("disabled", true);
        $("#boton-accion").removeClass("animar");
    }
    else {
        // Animar selección
        $(".tarjeta").removeClass("active");
        $(event.currentTarget).addClass("active");

        // Habilitar botón "confirmar"
        $("#boton-accion").prop("disabled", false);
        $("#boton-accion").addClass("animar");
    }
}