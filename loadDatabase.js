"use strict";

/* jshint node: true */
/* global Promise */

/*
 * This script loads the data into the MongoDB database named 'cs142project6'.  In loads
 * into collections named User and Photos. The Comments are added in the Photos of the
 * comments. Any previous objects in those collections is discarded.
 *
 * NOTE: This scripts uses Promise abstraction for handling the async calls to
 * the database. We are not teaching Promises in CS142 so strongly suggest you don't
 * use them in your solution.
 *
 */

// We use the Mongoose to define the schema stored in MongoDB.
var mongoose = require('mongoose');

// TODO: Insert MLab URL here
//mongoose.connect('mongodb://localhost/cs142project6');
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI);

// Load the Mongoose schema for Use and Photo
var User = require('./schema/user.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var versionString = '1.0';

// We start by removing anything that existing in the collections.
var removePromises = [User.remove({}), SchemaInfo.remove({})];

Promise.all(removePromises).then(function () {
    allPromises.then(function () {
        mongoose.disconnect();
    });
});
