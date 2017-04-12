"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a schema
var proposalSchema = new mongoose.Schema({
    title: String, // Proposal title
    text: String, // Text of the proposal
    description: String, // The proponent's description of the proposal
    user_author_id: mongoose.Schema.Types.ObjectId, // Reference to the ID of the user who submitted the proposal
    // TODO: Revisit whether separating users into upvoting and downvoting is the best schema
    users_who_upvoted: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who upvoted the proposal
    users_who_downvoted: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who downvoted the proposal
    comments: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the comments on this proposal
    group: mongoose.Schema.Types.ObjectId // Reference to the ID of the group that this proposal was submitted to
});

// the schema is useless so far
// we need to create a model using it
var Proposal = mongoose.model('Proposal', proposalSchema);

// make this available to our users in our Node applications
module.exports = Proposal;