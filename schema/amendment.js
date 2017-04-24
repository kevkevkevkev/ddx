"use strict";
/*
 * Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a schema
var amendmentSchema = new mongoose.Schema({
    amendment_text: String, // Text of the proposed amendment    
    amendment_description: String, // Description of the amendment
    user_author_name: String, // Name of the user who proposed the amendment
    user_author_id: mongoose.Schema.Types.ObjectId, // Reference to the ID of the user who proposed the amendment
    proposal_id: mongoose.Schema.Types.ObjectId, // Reference to the ID of the proposal to be amended
    users_who_upvoted: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who upvoted the amendment
    users_who_downvoted: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who downvoted the amendment
    is_enacted: Boolean // Boolean to determine whether this amendment has been enacted
});

var Amendment = mongoose.model('Amendment', amendmentSchema);

// make this available to our users in our Node applications
module.exports = Amendment;
