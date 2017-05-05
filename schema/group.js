"use strict";
/*
 * Defines the Mongoose Schema and return a Model for a Group
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a schema
var groupSchema = new mongoose.Schema({
    name: String, // Name of the group
    description: String, // Description of the group
    members: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who are in the group
    administrators: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the administrators of this group
    invited_members: [String], // Array of the email_address of the Users invited to join this group
    /* Group Rules: */
    // 0: Direct Democracy - All members can propose, upvote, and vote
    // 1: Republic - Administrators can propose, all members can vote
    // 2: Oligarchy - Administrators can submit proposals directly to the floor
    // Etc.
    government_form: Number, 
    floor_threshold_divisor: {type: Number, default: 3}, // number of voters divided by this number will bring a proposal to the floor
    amendment_threshold_divisor: {type: Number, default: 4}, // number of voters divided by this number will approve an amendment
    enactment_divisor: {type: Number, default: 2}, // number of voters divided by this number will enact a proposal
    max_discussion_time: {type: Number, default: 168}, // number of hours a proposal has to reach the floor before its rejected
    min_discussion_time: {type: Number, default: 48 }, // number of hours a proposal must wait before moving to the floor
    voting_time: {type: Number, default: 96} // number of hours a proposal appears on the floor
});

// Create a model using Group
var Group = mongoose.model('Group', groupSchema);

// make this available to our users in our Node applications
module.exports = Group;
