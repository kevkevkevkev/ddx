"use strict";
/*
 * Defined the Mongoose Schema and returns a model for the Draft of a proposal
 */
/* jshint node: true */

var mongoose = require('mongoose');
var moment = require('moment');

// create a schema
var draftSchema = new mongoose.Schema({
    title: String, // Proposal draft title
    text: String, // Text of the proposal draft
    description: String, // The proponent's description of the proposal draft
    user_author_id: mongoose.Schema.Types.ObjectId, // Reference to the ID of the user who authored the proposal draft
    group: mongoose.Schema.Types.ObjectId, // Reference to the ID of the group that this proposal will be submitted to
    group_name: String, // Name of the group that this proposal draft is associated with
    date_time: {type: Date, default: Date.now} // The date and time when the draft was added to the database
});

// Create a model using the schema
var Draft = mongoose.model('Draft', draftSchema);

// make this available to our users in our Node applications
module.exports = Draft;
