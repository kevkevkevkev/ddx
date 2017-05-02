"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

// create a schema
var userSchema = new mongoose.Schema({
    email_address: {	// Email address / login for the user
    type: String,
    unique: true,
    required: true
  	},
    first_name: {	// First name of the user.
    type: String,
    required: true
  	},
    last_name: {	// Last name of the user.
    type: String,
    required: true
  	},
    description: String,  // A brief user description
  	hash: String,	// The password of the use
  	salt: String,
    date_time: {type: Date, default: Date.now}, // The date and time when the user was added to the database
    groups: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the groups in which the user is a member
    group_invitations: [mongoose.Schema.Types.ObjectId] // IDs of the groups to which the user has been invited to join
});

userSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

userSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000),
  }, "MY_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

// Create a model for the userSchema
var User = mongoose.model('User', userSchema);

// Make the userSchema available to users in the application
module.exports = User;
