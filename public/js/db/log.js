const mysql = require("mysql2");

const addNewAccess = function(ip, url){
    var query = "INSERT INTO access_history (ip, url) VALUES (?,?)";
    var table = [ip, url];
    query = mysql.format(query,table);
    console.log(query);
    global.poll.getConnection(function(err, connection){
        connection.query(query, function(err,rows){
            if(err) {
                console.log(err);
            } else {
                console.log('OK');
            }
            if(connection !== null){connection.release();}
        });
    });
};

const addNewEvent = function(event, ip, device_id){
    var query = "INSERT INTO events (event, ip, device_id) VALUES (?, ?, ?)";
    var table = [event, ip, device_id];
    query = mysql.format(query,table);
    console.log(query);
    global.poll.getConnection(function(err, connection){
        connection.query(query, function(err,rows){
            if(err) {
                console.log(err);
            } else {
                console.log('OK');
            }
            if(connection !== null){connection.release();}
        });
    });
};

const addNewQuestionResults = function(device_id, time, num_heuristic, correct_id, selected_id, lives, ip){
    var query = "INSERT INTO question_results (device_id, time, num_heuristic, correct_id, selected_id, lives, ip) VALUES (?, ?, ?, ?, ?, ?, ?)";
    var table = [device_id, time, num_heuristic, correct_id, selected_id, lives, ip];
    query = mysql.format(query,table);
    console.log(query);
    global.poll.getConnection(function(err, connection){
        connection.query(query, function(err,rows){
            if(err) {
                console.log(err);
            } else {
                console.log('OK');
            }
            if(connection !== null){connection.release();}
        });
    });
};

const addNewFinalResults = function(device_id, time, corrects_num, total_num, lives, ip){
    var query = "INSERT INTO final_results (device_id, time, corrects_num, total_num, lives, ip) VALUES (?, ?, ?, ?, ?, ?)";
    var table = [device_id, time, corrects_num, total_num, lives, ip];
    query = mysql.format(query,table);
    console.log(query);
    global.poll.getConnection(function(err, connection){
        connection.query(query, function(err,rows){
            if(err) {
                console.log(err);
            } else {
                console.log('OK');
            }
            if(connection !== null){connection.release();}
        });
    });
};

module.exports = {
    addNewAccess,
    addNewEvent,
    addNewQuestionResults,
    addNewFinalResults
}