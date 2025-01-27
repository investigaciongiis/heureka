$(document).ready( () => {

    $("#boton-jugar").click(clicNuevaPartida);
})

function clicNuevaPartida(){
    if(!window.localStorage.getItem('heureka_device_id')){
        window.localStorage.setItem('heureka_device_id', randomString(30));
    }
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