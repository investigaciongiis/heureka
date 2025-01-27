$(document).ready( () => {

    const plantillaFeedback = $("#plantilla-feedback").html();
    const plantillaFeedbackCompilada = Handlebars.compile(plantillaFeedback);
    var contexto = {
        "acertadas" : getParameterByName('acertadas'),
        "total" : getParameterByName('total'),
        "tiempo" : getParameterByName('tiempo'),
    };

    $(".feedback").html(plantillaFeedbackCompilada(contexto));

    $("#boton-jugar").click(clicNuevaPartida);


    postNewFinalResults(getParameterByName('tiempo2'), getParameterByName('acertadas'), getParameterByName('total'), getParameterByName('vidas'));
})

function clicNuevaPartida(){
    if(!window.localStorage.getItem('heureka_device_id')){
        window.localStorage.setItem('heureka_device_id', randomString(30));
    }
    postNewEvent(0, function(){location.href = 'game.html';});
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}