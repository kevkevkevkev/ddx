"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a Group
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a schema
var groupSchema = new mongoose.Schema({
    name: String, // Name of the group
    description: String, // Description of the group
    members: [mongoose.Schema.Types.ObjectId] // Reference array of the IDs of the users who are in the group
});

// Create a model using Group
var Group = mongoose.model('Group', groupSchema);

// make this available to our users in our Node applications
module.exports = Group;
