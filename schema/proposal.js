"use strict";
/*
 * Defined the Mongoose Schema and returns a model for a Proposal
 */
/* jshint node: true */

var mongoose = require('mongoose');
var moment = require('moment');

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
    amendments: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the amendments on this proposal
    group: mongoose.Schema.Types.ObjectId, // Reference to the ID of the group that this proposal was submitted to
    group_name: String, // Name of the group that this proposal is associated with
    date_time: {type: Date, default: Date.now}, // The date and time when the proposal was added to the database
    status: {type: Number, default: 0}, // Status of proposal: 0 = Under Discussion, 1 = On the Floor, 2 = Approved, 3 = Rejected
    floor_threshold_divisor: Number, // number of voters divided by this number will bring a proposal to the floor
    amendment_threshold_divisor: Number, // number of voters divided by this number will approve an amendment
    enactment_divisor: Number, // number of voters divided by this number will enact a proposal
    max_discussion_time: Date, // number of hours a proposal has to reach the floor before its rejected
    min_discussion_time: Date, // number of hours a proposal must wait before moving to the floor
    voting_time: Number, // number of hours a proposal appears on the floor
    voting_closes: Date, // time when voting on a proposal closes
    voting_members: [mongoose.Schema.Types.ObjectId] // IDs of the members authorized to vote on this proposal
});

proposalSchema.methods.setMaxDiscussionTime = function(hours) {
    console.log("***** setMaxDiscussionTime() called *****");
    var date_time_moment = moment(this.date_time);
    console.log("Adding to this.date_time,", date_time_moment, ", hours,", hours);
    this.max_discussion_time = date_time_moment.add(hours, 'h').toDate();
    console.log("this.max_discussion_time = ", this.max_discussion_time);
};

proposalSchema.methods.setVotingCloses = function() {
    console.log("***** setVotingCloses() called *****");
    var date_time_moment = moment(Date.now());
    console.log("Adding to this.date_time,", date_time_moment, ", hours,", this.voting_time);
    this.voting_closes = date_time_moment.add(this.voting_time, 'h').toDate();
    console.log("this.max_discussion_time = ", this.voting_closes);
};

// Create a model using the schema
var Proposal = mongoose.model('Proposal', proposalSchema);

// make this available to our users in our Node applications
module.exports = Proposal;
