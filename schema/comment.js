"use strict";
/*
 * Defined the Mongoose Schema and return a Model for a User
 */
/* jshint node: true */

var mongoose = require('mongoose');

// create a schema
var commentSchema = new mongoose.Schema({
    text: String, // Text of the comment
    user_author_name: String, // Name of the user who wrote the comment
    user_author_id: mongoose.Schema.Types.ObjectId, // Reference to the ID of the user who wrote the comment
    proposal_id: mongoose.Schema.Types.ObjectId, // Reference to the ID of the proposal to which the comment responds
    users_who_upvoted: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who upvoted the comment
    users_who_downvoted: [mongoose.Schema.Types.ObjectId], // Reference array of the IDs of the users who downvoted the comment
    is_comment: Boolean // Boolean to determine whether this is a comment. NOTE: Always set to true
});

var Comment = mongoose.model('Comment', commentSchema);

// make this available to our users in our Node applications
module.exports = Comment;
