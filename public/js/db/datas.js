const when = require("when"),
    mysql = require("mysql2");

const getDatas = function(datefrom){
    var d = when.defer();
    //2020-11-03 00:00:00
    var query = "SELECT id, device_id, TIME_TO_SEC(time) as seconds, num_heuristic FROM question_results WHERE date>=?";
    var table = [datefrom];
    query = mysql.format(query,table);
    console.log(query);
    global.poll.getConnection(function(err, connection){
        connection.query(query, function(err,rows){
            if(err) {
                console.log(err);
            } else {
                d.resolve(rows);
            }
            if(connection !== null){connection.release();}
        });
    });
    return d.promise;
};

const getNumAciertos = function(datefrom){
    var d = when.defer();
    var query = "SELECT num_heuristic, COUNT(num_heuristic) as num_aciertos FROM `question_results` WHERE correct_id=selected_id AND date>=? GROUP BY num_heuristic HAVING COUNT(id)";
    var table = [datefrom];
    query = mysql.format(query,table);
    console.log(query);
    global.poll.getConnection(function(err, connection){
        connection.query(query, function(err,rows){
            if(err) {
                console.log(err);
            } else {
                d.resolve(rows);
            }
            if(connection !== null){connection.release();}
        });
    });
    return d.promise;
};

const getNumRespuestas = function(datefrom){
    var d = when.defer();
    var query = "SELECT num_heuristic, COUNT(num_heuristic) as num_respuestas FROM `question_results` WHERE date>=? GROUP BY num_heuristic HAVING COUNT(id)";
    var table = [datefrom];
    query = mysql.format(query,table);
    console.log(query);
    global.poll.getConnection(function(err, connection){
        connection.query(query, function(err,rows){
            if(err) {
                console.log(err);
            } else {
                d.resolve(rows);
            }
            if(connection !== null){connection.release();}
        });
    });
    return d.promise;
};

module.exports = {
    getDatas,
    getNumAciertos,
    getNumRespuestas
}
