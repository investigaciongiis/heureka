const express = require('express');
const path = require('path');
const mysql = require("mysql2");
const bodyParser  = require("body-parser");
const tarjetas = require('./tarjetas.json');
const heuristicas = require('./heuristicas.json');
const logDb = require('./public/js/db/log.js');
const datasDb = require('./public/js/db/datas.js');
const fs = require('fs');
const https = require('https');
const constants = require('constants');
const DEBUG = false;
const PASS_TO_DOWNLOAD_DATAS = '*';

const app = express();

app.use(bodyParser.json({limit: '10mb', extended: true}));

const PORT = process.env.PORT || 8080;

if(!DEBUG){
  var options = {};
}

var pollConfig = {
    waitForConnections : true,
    queueLimit : 0,
    connectionLimit : 500,
    host: 'localhost',
    user: '*',
    password: '*',
    database: '*',
    debug:  false,
    multipleStatements: true,
    port: 3306
};
global.poll = mysql.createPool(pollConfig);
	
app.get('/configuracion-juego', function(req, res) {
  res.send({ tarjetas: tarjetas, heuristicas: heuristicas });
})

app.get('/tests.html', function(req, res) {
  if (process.env.NODE_ENV  === "dev") {
    res.sendFile(path.join(__dirname, '/public/html/tests.html'));
  } else {
    filePath = path.join(__dirname, '/public/html/error403.html');

    fs.readFile(filePath, {encoding: "utf-8"}, function(err, data) {
      if (!err) {
        res.setHeader('content-type', 'text/html');
        res.status(403).send(data);
      } else {
        res.status(500);
      }
    });
  }
});

app.get('/error500.html', function(req, res) {
  filePath = path.join(__dirname, '/public/html/error500.html');

  fs.readFile(filePath, {encoding: "utf-8"}, function(err, data) {
    if (!err) {
      res.setHeader('content-type', 'text/html');
      res.status(500).send(data);
    } else {
      res.status(500);
    }
  });
});

const getIpAddress = function(req){
   try {
        return req.connection.remoteAddress.split(':').pop();
    } catch (e) {
        return "";
    }
};

app.get('/', function(req, res, next) {
  console.log('New access: ' + req.url);
  logDb.addNewAccess(getIpAddress(req), req.url);
  next();
});

app.get('/index.html', function(req, res, next) {
  console.log('New access: ' + req.url);
  logDb.addNewAccess(getIpAddress(req), req.url);
  next();
});

app.get('/game.html', function(req, res, next) {
  console.log('New access: ' + req.url);
  logDb.addNewAccess(getIpAddress(req), req.url);
  next();
});

app.get('/fuentes.html', function(req, res, next) {
  console.log('New access: ' + req.url);
  logDb.addNewAccess(getIpAddress(req), req.url);
  next();
});

app.post('/newEvent', function(req, res, next) {
  logDb.addNewEvent(req.body.event, getIpAddress(req), req.body.device_id);
  res.send('ok');
});

app.post('/newQuestionResults', function(req, res, next) {
  logDb.addNewQuestionResults(req.body.device_id, req.body.time, req.body.num_heuristic, req.body.correct_id, req.body.selected_id, req.body.lives, getIpAddress(req));
  res.send('ok');
});

app.post('/newFinalResults', function(req, res, next) {
  logDb.addNewFinalResults(req.body.device_id, req.body.time, req.body.corrects_num, req.body.total_num, req.body.lives, getIpAddress(req));
  res.send('ok');
});


app.get('/datas1/:datefrom/:pass', function(req, res, next) {
  if(req.params.pass === PASS_TO_DOWNLOAD_DATAS){
    datasDb.getDatas(req.params.datefrom).then(function(result){
      res.send(result);
    });
  } else {
    res.send({});
  }
});

app.get('/datas2/:datefrom/:pass', function(req, res, next) {
  if(req.params.pass === PASS_TO_DOWNLOAD_DATAS){
    datasDb.getDatas(req.params.datefrom).then(function(result){
      var values = [];
      for(var i=0; i<result.length; i++){
        if(i === 0 || result[i].device_id !== result[i-1].device_id || (result[i].seconds - result[i-1].seconds < 0)){
          values.push({id: result[i].id, device_id: result[i].device_id, num_heuristic: result[i].num_heuristic, seconds: result[i].seconds});
        } else {
          values.push({id: result[i].id, device_id: result[i].device_id, num_heuristic: result[i].num_heuristic, seconds: (result[i].seconds - result[i-1].seconds)});
        }
      }
      res.send(values);
    });
  } else {
    res.send({});
  }
});

app.get('/averages/:datefrom/:pass', function(req, res, next) {
  if(req.params.pass === PASS_TO_DOWNLOAD_DATAS){
    datasDb.getDatas(req.params.datefrom).then(function(result){
      var values = [];
      for(var i=0; i<result.length; i++){
        if(i === 0 || result[i].device_id !== result[i-1].device_id || (result[i].seconds - result[i-1].seconds < 0)){
          values.push({id: result[i].id, device_id: result[i].device_id, num_heuristic: result[i].num_heuristic, seconds: result[i].seconds});
        } else {
          values.push({id: result[i].id, device_id: result[i].device_id, num_heuristic: result[i].num_heuristic, seconds: (result[i].seconds - result[i-1].seconds)});
        }
      }
      var mediums = [];
      for(var i=0; i<result.length; i++){
        let found = false;
        for(var j=0; j<mediums.length; j++){
          if(result[i].num_heuristic === mediums[j].num_heuristic){
            mediums[j].seconds += result[i].seconds;
            mediums[j].count++;
            mediums[j].medium = mediums[j].seconds/mediums[j].count;
            found = true;
            break;
          }
        }
        if(!found){
          mediums.push({num_heuristic: result[i].num_heuristic, count: 1, seconds: result[i].seconds, medium: result[i].seconds});
        }
      }
      res.send(mediums);
    });
  } else {
    res.send({});
  }
});

app.get('/num_hits/:datefrom/:pass', function(req, res, next) {
  if(req.params.pass === PASS_TO_DOWNLOAD_DATAS){
    datasDb.getNumAciertos(req.params.datefrom).then(function(result){
      res.send(result);
    });
  } else {
    res.send({});
  }
});

app.get('/num_responses/:datefrom/:pass', function(req, res, next) {
  if(req.params.pass === PASS_TO_DOWNLOAD_DATAS){
    datasDb.getNumRespuestas(req.params.datefrom).then(function(result){
      res.send(result);
    });
  } else {
    res.send({});
  }
});

// Serve all client-side files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/html')));
app.use(express.static(path.join(__dirname, 'public/js')));
app.use(express.static(path.join(__dirname, 'public/stylesheets')));

// Catch 404 and forward to error handler
app.use(function(req, res, next) {

  filePath = path.join(__dirname, '/public/html/error404.html');

  fs.readFile(filePath, {encoding: "utf-8"}, function(err, data) {
      if (!err) {
        res.status(404).send(data);
      } else {
        res.status(500).send("Error del servidor");
      }
  });
});

if(!DEBUG){
  const httpsServer = https.createServer(options, app);

  httpsServer.listen(PORT, () => {
    console.log(`Heureka listening on port ${PORT}!`)
  });
} else {
  app.listen(PORT, () => {
    console.log(`Heureka listening on port ${PORT}!`)
  });
}
