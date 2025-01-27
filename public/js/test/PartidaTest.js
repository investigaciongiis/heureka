QUnit.module('Partida');

import { Partida } from '/js/model/Partida.js';

let mazoTarjetas, infoHeuristicas;

QUnit.begin( () => {
  // Obtener tarjetas de juego y definiciones de heuristicas
  $.ajax({
    url: '/configuracion-juego',
    type: 'GET',
    async: false,
    success: function(result, status, xhr) {
        mazoTarjetas = result.tarjetas;
        infoHeuristicas = result.heuristicas;
    },
    error: function(xhr, status, error) {
        mazoTarjetas = [];
        infoHeuristicas = [];
    }
  });
});

QUnit.test('No se repiten enunciados en partidas de 10 preguntas o menos', assert => {
  
  let p = new Partida(mazoTarjetas, infoHeuristicas);

  let enunciados = [];

  for(let i = 0; i < 10; i++) {

    let pregunta = p.nuevaPregunta();
    let enunciado = {
      heuristica: pregunta.numHeuristica, 
      esBuenEjemplo: pregunta.esBuenEjemplo
    };

    enunciados.push(enunciado);
  }

  let enunciadosSinDuplicados = new Set(enunciados);
  enunciadosSinDuplicados = Array.from(enunciadosSinDuplicados); 

  assert.equal(JSON.stringify(enunciados), JSON.stringify(enunciadosSinDuplicados),
    'Array enunciados y conjunto enunciadosSinDuplicados contienen los mismos elementos');
});

QUnit.test('La respuesta correcta satisface el enunciado de la pregunta', assert => {
  let p = new Partida(mazoTarjetas, infoHeuristicas);

  let pregunta = p.nuevaPregunta();

  let enunciado = {
    heuristica: pregunta.numHeuristica, 
    esBuenEjemplo: pregunta.esBuenEjemplo
  };

  let correcta = pregunta.tarjetasRespuesta.find(r => r.id == pregunta.idTarjetaCorrecta);

  let enunciadoCorrecta = {
    heuristica: correcta.heuristica,
    esBuenEjemplo: correcta.esBuenEjemplo
  }

  assert.equal(JSON.stringify(enunciado), JSON.stringify(enunciadoCorrecta), 
    'Objeto enunciado y objeto enunciadoCorrecta son iguales');
});

QUnit.test('Las respuestas incorrectas son distintas de la correcta', assert => {
  let p = new Partida(mazoTarjetas, infoHeuristicas);

  let pregunta = p.nuevaPregunta();

  let correcta = pregunta.tarjetasRespuesta.find(r => r.id == pregunta.idTarjetaCorrecta);
  let incorrectas = pregunta.tarjetasRespuesta.filter(r => r.id != pregunta.idTarjetaCorrecta);

  assert.notOk(incorrectas.includes(correcta), 
    'Array incorrectas no contiene elemento correcta');
});

QUnit.test('Las respuestas incorrectas son distintas entre sí', assert => {
  let p = new Partida(mazoTarjetas, infoHeuristicas);

  let pregunta = p.nuevaPregunta();

  let incorrectas = pregunta.tarjetasRespuesta.filter(r => r.id != pregunta.idTarjetaCorrecta);

  let incorrectasSinDuplicados = new Set(incorrectas);
  incorrectasSinDuplicados = Array.from(incorrectasSinDuplicados); 

  assert.equal(JSON.stringify(incorrectas), JSON.stringify(incorrectasSinDuplicados),
    'Array incorrectas y conjunto incorrectasSinDuplicados contienen los mismos elementos');
});

QUnit.test('Restar vida cuando hay 1 o más decrementa las vidas en 1', assert => {
  let p = new Partida([], []);
  assert.equal(p.numVidasActuales, 3, 'El número inicial de vidas es 3');
  p.restarVida();
  assert.equal(p.numVidasActuales, 2, 'Restar 1 vida a 3 vidas resulta en 2 vidas');
});

QUnit.test('Restar vida cuando hay 0 mantiene las vidas en 0', assert => {
  let p = new Partida([], []);
  assert.equal(p.numVidasActuales, 3, 'El número inicial de vidas es 3');
  p.restarVida();
  p.restarVida();
  p.restarVida();
  assert.equal(p.numVidasActuales, 0, 'Restar 3 vidas a 3 vidas resulta en 0 vidas');
  p.restarVida();
  assert.equal(p.numVidasActuales, 0, 'Restar 1 vidas a 0 vidas resulta en 0 vidas');
});