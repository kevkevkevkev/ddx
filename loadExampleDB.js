/*
 * Copyright (c) Kevin O'Connell
 * All Rights Reserved
 *
 * Written with: mongoose@4.7.7
 * Documentation: http://mongoosejs.com/docs/guide.html
 * A Mongoose script connecting to a MongoDB database given a MongoDB Connection URI.
 */
var mongoose = require('mongoose');    
var User = require('./schema/user.js');

const uri = process.env.MONGODB_URI;

mongoose.Promise = global.Promise

mongoose.connect(uri);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback () {

  console.log("Running loadExampleDB.js");

  var kevin = new User({
    email_address: 'kevino@stanford.edu', // Email Address / Login
    first_name: 'Kevin', // First name of the user.
    last_name: 'O\'Connell',  // Last name of the user.
    description: 'Student',  // A brief user description
    password: 'weak' // The password of the user
  });

  User.create(kevin);

  // Create song schema
  var songSchema = mongoose.Schema({
    decade: String,
    artist: String,
    song: String,
    weeksAtOne: Number
  });

  // Store song documents in a collection called "songs"
  var Song = mongoose.model('songs', songSchema);

  // Create seed data
  var seventies = new Song({
    decade: '1970s',
    artist: 'Debby Boone',
    song: 'You Light Up My Life',
    weeksAtOne: 10
  });

  var eighties = new Song({
    decade: '1980s',
    artist: 'Olivia Newton-John',
    song: 'Physical',
    weeksAtOne: 10
  });

  var nineties = new Song({
    decade: '1990s',
    artist: 'Mariah Carey',
    song: 'One Sweet Day',
    weeksAtOne: 16
  });

  /*
   * First we'll add a few songs. Nothing is required to create the 
   * songs collection; it is created automatically when we insert.
   */
  var list = [seventies, eighties, nineties]
  Song.insertMany(list);

  /*
   * Then we need to give Boyz II Men credit for their contribution
   * to the hit "One Sweet Day".
   */
  Song.update({ song: 'One Sweet Day'}, { $set: { artist: 'Mariah Carey ft. Boyz II Men'} }, 
    function (err, numberAffected, raw) {

      if (err) return handleError(err);

      /*
       * Finally we run a query which returns all the hits that spend 10 or
       * more weeks at number 1.
       */
      Song.find({ weeksAtOne: { $gte: 10} }).sort({ decade: 1}).exec(function (err, docs){

        if(err) throw err;

        docs.forEach(function (doc) {
          console.log(
            'In the ' + doc['decade'] + ', ' + doc['song'] + ' by ' + doc['artist'] + 
            ' topped the charts for ' + doc['weeksAtOne'] + ' straight weeks.'
          );
        });

        // Since this is an example, we'll clean up after ourselves.
        // mongoose.connection.db.collection('songs').drop(function (err) {
        //   if(err) throw err;

          // Only close the connection when your app is terminating
          mongoose.connection.db.close(function (err) {
            console.log("loadExampleDB: Closing connection");
            if(err) throw err;
          });
        //});
      });
    }
  )
});