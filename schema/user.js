"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a schema
var userSchema = new mongoose.Schema({
    id: String,     // Unique ID identifying this user
    first_name: String, // First name of the user.
    last_name: String,  // Last name of the user.
    location: String,    // Location  of the user.
    description: String,  // A brief user description
    occupation: String,    // Occupation of the user.
    login_name: String,	// The login_name of the user.
    password: String,	// The password of the user
    photos_liked: [mongoose.Schema.Types.ObjectId], // An array of IDs of the photos liked by the user
    photos_favorited: [mongoose.Schema.Types.ObjectId] // An array of the IDs of the photos favorited by the user
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
