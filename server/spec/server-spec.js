/* You'll need to have MySQL running and your Node server running
 * for these tests to pass. */

var mysql = require('mysql');
var request = require('request'); // You might need to npm install the request module!
var expect = require('chai').expect;

describe('Persistent Node Chat Server', function() {
  var dbConnection;

  beforeEach(function(done) {
    dbConnection = mysql.createConnection({
      user: 'root',
      password: '1234',
      database: 'chat'
    });
    dbConnection.connect();

    var tablename = 'messages'; // TODO: fill this out

    /* Empty the db table before each test so that multiple tests
     * (or repeated runs of the tests) won't screw each other up: */
    dbConnection.query('truncate ' + tablename, done);
  });

  afterEach(function() {
    dbConnection.end();
  });

  it('Should insert posted messages to the DB', function(done) {
    // Post a message to the node chat server:
    request({
      method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Valjean',
        text: 'In mercy\'s name, three days is all I need.',
        roomname: 'Hello'
      }
    }, function () {
      // Now if we look in the database, we should find the
      // posted message there.

      // TODO: You might have to change this test to get all the data from
      // your message table, since this is schema-dependent.
      var queryString = 'SELECT * FROM messages';
      var queryArgs = [];

      dbConnection.query(queryString, queryArgs, function(err, results) {
        // Should have one result:
        expect(results.length).to.equal(1);

        // TODO: If you don't have a column named text, change this test.
        expect(results[0].text).to.equal('In mercy\'s name, three days is all I need.');

        done();
      });
    });
  });

  it('Should output all messages from the DB', function(done) {
    // Let's insert a message into the db
    var text = 'Men like you can never change!';
    var roomname = 'main';
    var userId = 1;
    var queryArgs = [];

    var selectRoom = 'SELECT DISTINCT ID FROM rooms WHERE roomname="' + roomname + '"';
    var insertRoom = 'INSERT INTO rooms (roomname) VALUES ("' + roomname + '")';
    dbConnection.query(selectRoom, queryArgs, function(err, results) {
      var roomId;
      if (results.length > 0) {
        roomId = results[0].ID;
      }

      if (roomId) {
        var insertMessage = 'INSERT INTO messages (text, user_id, room_id) VALUES ("' + text + '", ' + userId + ', ' + roomId + ')';
        dbConnection.query(insertMessage, queryArgs, function(err, results) {

          request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
            var messageLog = JSON.parse(body);
            expect(messageLog.results[0].text).to.equal('Men like you can never change!');
            expect(messageLog.results[0].roomname).to.equal('main');
            done();
          });
        });
      } else {
        dbConnection.query(insertRoom, queryArgs, function(err, results) {
          var roomId = results.insertId;
          

          var insertMessage = 'INSERT INTO messages (text, user_id, room_id) VALUES ("' + text + '", ' + userId + ', ' + roomId + ')';
          dbConnection.query(insertMessage, queryArgs, function(err, results) {

            request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
              var messageLog = JSON.parse(body);
              expect(messageLog.results[0].text).to.equal('Men like you can never change!');
              expect(messageLog.results[0].roomname).to.equal('main');
              done();
            });
          });
        });
      }
    });
  });
});
