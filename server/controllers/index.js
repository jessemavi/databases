var models = require('../models');
var mysql = require('mysql');

module.exports = {
  messages: {
    get: function (req, res) {
      var status = 200;
      var response = {};
      response.results = [];

      var tempMessage = {
        text: 'Random message',
        username: 'Jesse', 
        roomname: 'lobby'
      };
      response.results.push(tempMessage);

      // Respond with a placeholder message

      res.setHeader('Last-Modified', (new Date()).toUTCString()); // get 304 without this line
      res.status(status).send(response); // don't have to stringify?
    }, // a function which handles a get request for all messages
    post: function (req, res) {
      var status = 201;

      // TODO refactor out of this function
      var dbConnection;

      dbConnection = mysql.createConnection({
        user: 'root',
        password: '1234',
        database: 'chat'
      });
      dbConnection.connect();


      var username = req.body.username;
      var text = req.body.text;
      var roomname = req.body.roomname;
      console.log('REQUEST BODY ' + JSON.stringify(req.body));

      var selectUsers = 'SELECT DISTINCT ID FROM users WHERE username="' + username + '"';
      var selectRoom = 'SELECT DISTINCT ID FROM rooms WHERE roomname="' + roomname + '"';
      var insertUsers = 'INSERT INTO users (username) VALUES ("' + username + '")';
      var insertRoom = 'INSERT INTO rooms (roomname) VALUES ("' + roomname + '")';
      var queryArgs = [];

      dbConnection.query(selectUsers, queryArgs, function(err, results) {
        var userId;
        if (results.length > 0) {
          userId = results[0].ID;
        }

        if (userId) {
          dbConnection.query(selectRoom, queryArgs, function(err, results) {
            var roomId;
            if (results.length > 0) {
              roomId = results[0].ID;
            }

            if (roomId) {
              var insertMessage = 'INSERT INTO messages (text, user_id, room_id) VALUES ("' + text + '", ' + userId + ', ' + roomId + ')';
              dbConnection.query(insertMessage, queryArgs, function(err, results) {
                dbConnection.end();
              });
            } else {
              dbConnection.query(insertRoom, queryArgs, function(err, results) {
                var roomId = results.insertId;
                
                var insertMessage = 'INSERT INTO messages (text, user_id, room_id) VALUES ("' + text + '", ' + userId + ', ' + roomId + ')';
                dbConnection.query(insertMessage, queryArgs, function(err, results) {
                  dbConnection.end();
                });
              });
            }
          });
        } else {
          dbConnection.query(insertUsers, queryArgs, function(err, results) {
            var userId = results.insertId;

            dbConnection.query(selectRoom, queryArgs, function(err, results) {
              var roomId;
              if (results.length > 0) {
                roomId = results[0].ID;
              }

              if (roomId) {
                var insertMessage = 'INSERT INTO messages (text, user_id, room_id) VALUES ("' + text + '", ' + userId + ', ' + roomId + ')';
                dbConnection.query(insertMessage, queryArgs, function(err, results) {
                  dbConnection.end();
                });
              } else {
                dbConnection.query(insertRoom, queryArgs, function(err, results) {
                  var roomId = results.insertId;

                  var insertMessage = 'INSERT INTO messages (text, user_id, room_id) VALUES ("' + text + '", ' + userId + ', ' + roomId + ')';
                  dbConnection.query(insertMessage, queryArgs, function(err, results) {
                    dbConnection.end();
                  });
                });
              }
            });
          });
        }
      });   

      // dbConnection.query(insertUsers, queryArgs, function(err, results) {
      //   var userId = results.insertId;
      //   dbConnection.query(insertRoom, queryArgs, function(err, results) {
      //     console.log(JSON.stringify(err));
      //     console.log(JSON.stringify(results));
      //     var roomId = results.insertId;
      //     var insertMessage = 'INSERT INTO messages (text, user_id, room_id) VALUES ("' + text + '", ' + userId + ', ' + roomId + ')';
      //     console.log('insertMesssage is ' + insertMessage);
      //     dbConnection.query(insertMessage, queryArgs, function(err, results) {
      //       console.log('inserted message');
      //       dbConnection.end();
      //     });   
      //   });
      // });


      res.setHeader('Last-Modified', (new Date()).toUTCString()); // get 304 without this line
      var postReq = req.body;
      res.status(status).end(JSON.stringify({}));
    } // a function which handles posting a message to the database
  },

  users: {
    // Ditto as above
    get: function (req, res) {},
    post: function (req, res) {}
  }
};

