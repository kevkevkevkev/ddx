"use strict";
/*
 *  Defined the Mongoose Schema and return a Model for a Proposal
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a schema
var proposalSchema = new mongoose.Schema({
    title: String, // Proposal title
    text: String, // Text of the proposal
    description: String, // The proponent's description of the proposal
    user_author_id: mongoose.Schema.Types.ObjectId, // Reference to the ID of the user who submitted the proposal
    user_author_name: String, // Name of the user who submitted the proposal
    users_who_upvoted: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who upvoted the proposal
    users_who_downvoted: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who downvoted the proposal
    users_who_voted_yes: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who voted yes on the proposal
    users_who_voted_no: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who voted no on the proposal
    comments: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the comments on this proposal
    group: mongoose.Schema.Types.ObjectId // Reference to the ID of the group that this proposal was submitted to
});

// the schema is useless so far
// we need to create a model using it
var Proposal = mongoose.model('Proposal', proposalSchema);

// make this available to our users in our Node applications
module.exports = Proposal;
