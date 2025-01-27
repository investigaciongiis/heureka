
const eventsToSend = ['Nueva partida', 'Mostrar correccion', 'Ayuda', 'Tarjeta', 'Terminar partida', 'Siguiente pregunta']

function postNewEvent(indexEvent, callback){
    $.ajax({
        url: '/newEvent',
        type: 'POST',
        Accept: "application/json",
        contentType: "application/json",
        'content-type': "application/json",
        data: JSON.stringify({device_id: window.localStorage.getItem('heureka_device_id'), event: eventsToSend[indexEvent]}),
        async: true,
        success: function(result, status, xhr) {
            //console.log(result);
            if(callback){
                callback();
            }
        },
        error: function(xhr, status, error) {
            console.log(error);
        }
    });
}

function postNewQuestionResults(time, num_heuristic, correct_id, selected_id, lives){

	let body = {
		device_id: window.localStorage.getItem('heureka_device_id'),
		time: time,
		num_heuristic: num_heuristic,
		correct_id: correct_id,
		selected_id: selected_id,
		lives: lives
	};

    $.ajax({
        url: '/newQuestionResults',
        type: 'POST',
        Accept: "application/json",
        contentType: "application/json",
        'content-type': "application/json",
        data: JSON.stringify(body),
        async: true,
        success: function(result, status, xhr) {
            //console.log(result);
        },
        error: function(xhr, status, error) {
            console.log(error);
        }
    });
}

function postNewFinalResults(time, corrects_num, total_num, lives){
	let body = {
		device_id: window.localStorage.getItem('heureka_device_id'),
		time: time,
		corrects_num: corrects_num,
		total_num: total_num,
		lives: lives
	};

    $.ajax({
        url: '/newFinalResults',
        type: 'POST',
        Accept: "application/json",
        contentType: "application/json",
        'content-type': "application/json",
        data: JSON.stringify(body),
        async: true,
        success: function(result, status, xhr) {
            //console.log(result);
        },
        error: function(xhr, status, error) {
            console.log(error);
        }
    });
}
