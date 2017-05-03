"use strict";
/*
 * Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a schema
var amendmentSchema = new mongoose.Schema({
    amendment_text: String, // Text of the proposed amendment
    original_proposal_text: String, // Original text of the proposal to be amended    
    amendment_description: String, // Description of the amendment
    user_author_name: String, // Name of the user who proposed the amendment
    user_author_id: mongoose.Schema.Types.ObjectId, // Reference to the ID of the user who proposed the amendment
    proposal_id: mongoose.Schema.Types.ObjectId, // Reference to the ID of the proposal to be amended
    users_who_upvoted: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who upvoted the amendment
    users_who_downvoted: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who downvoted the amendment
    is_enacted: Boolean, // Boolean to determine whether this amendment has been enacted
    is_amendment: {type: Boolean, default: false}, // Boolean to determine whether this is an amendment. NOTE: Always set to true
    date_time: {type: Date, default: Date.now}, // The date and time when the amendment was added to the database
    time_enacted: Date // The Date when the amendment was enacted
});

var Amendment = mongoose.model('Amendment', amendmentSchema);

// make this available to our users in our Node applications
module.exports = Amendment;
