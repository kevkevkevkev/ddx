"use strict";

/* jshint node: true */

/*
 * This webserver listens, alternatively, to port 3000 for testing on LOCALHOST:3000
 * or to process.env.PORT, the environment variable generated by Heroku for the port 
 * for this instance of the server.
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 */


/*************************
 * Module Initialization *
 *************************/

var mongoose = require('mongoose');
var async = require('async');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
var fs = require("fs");


/**************************
 * Database Configuration *
 **************************/

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Proposal = require('./schema/proposal.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

/* Connect to mLab Mongoose using the secret environment variable generated by 
 * Heroku for this instance. */
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost/myapp";
mongoose.connect(mongoURI);


/*************************
 * Session Configuration *
 *************************/

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
// For the session we give it the key, and other parameters that it needs to know
// in order for the program to start using it. Session is used for maintaining 
// session state across different request handlers, so you can know whether or not
// a user is logged in.
app.use(session({
    secret: 'secretKey', 
    //secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));

// bodyParser is used in photo uploads. 
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * URL /session - Returns whether there is an active session
 */
app.get('/session', function(request, response) {

    if (request.session.login_name) {
        response.end(JSON.stringify(true));
    } else {
        response.end(JSON.stringify(false));
    }
});

/*
 * URL /current-session - Returns the current session, to be saved
 * in local storage for purposes of restoring the session
 */
app.get('/get-current-session', function(request, response) {

    console.log("returning current session", JSON.stringify(request.session));
    response.end(JSON.stringify(request.session));
});

/*
 * URL /restore-session - Returns the current session from the session
 * saved in local storage and returns the user associated with that session's
 * user.
 */
 // TODO: Speak with an experienced developer about how to improve security here. Salting passwords? 
 // TODO: What are the risks associated with keeping session data stored on local machine?
app.post('/restore-session', function(request, response) {

    var email_address = request.body.email_address;
    console.log("Restoring session for user with email_address:", email_address);

    User.findOne({email_address: email_address}, function (err, user) {    
        if (err) {
            // Query returned an error.
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (!user) {
            // If no user found, report an error.
            response.status(400).send('Missing user');
            return;
        }
        if (user.length === 0) {
            // Query didn't return an error but didn't find the SchemaInfo object
            console.log("user.length === 0");
            response.status(400).send('Missing user');
            return;
        }

        // Create new session, which will be part of the request, so we have access on all routes
        request.session.email_address = email_address;
        request.session.user_id = user._id;
        request.session.user = user;

        // Send session back
        console.log('user', user);
        //response.send(session);
        response.end(JSON.stringify(user));
    }); 
});


/***********************************
 * Login and Registration Handling *
 ***********************************/

/* If a user has entered a valid login_name and password combination,
 * logs in as that account. 
 */
app.post('/admin/login', function (request, response) {

    var email_address = request.body.email_address;
    var password = request.body.password;

    // Try to find a user with that login_name
    User.findOne({email_address: email_address, password: password}, function (err, user) {
        if (err) {
            // Query returned an error.
            response.status(400).send(JSON.stringify(err));
            return;
        }
        // If no user found, report an error.
        if (!user) {
            response.status(400).send('Missing user');
            return;
        }
        if (user.length === 0) {
            // Query didn't return an error but didn't find the SchemaInfo object - This
            // is also an internal error return.
            console.log("user.length === 0");
            response.status(400).send('Missing user');
            return;
        }

        // Create new session, which will be part of the request, so we have access on all routes
        request.session.email_address = email_address;
        request.session.user_id = user._id;
        request.session.user = user;

        // Send session back
        console.log('user', user);
        //response.send(session);
        response.end(JSON.stringify(user));
    }); 
});

// Logout from the current account
app.post('/admin/logout', function (request, response) {

    if (!request.session.email_address) {
        response.status(401).send("No user logged in");
        return;
    } else {
        request.session.destroy(function (err) {
            if (err) {
                response.status(500).send(err);
                return;
            }
            response.send("Logout success");
        });
    }
});

// Register a new user
app.post('/admin/register', function (request, response) {

    console.log("app.post: registering a new user");

    // If a user with the entered login name already exists, return an error
    User.findOne({email_address: request.body.email_address}, function (err, user) {
        if (user) {
            response.status(400).send('That user already exists');
            return;
        }
    });

    var user_attributes = {
        email_address: request.body.email_address, // Email Address / Login
        first_name: request.body.first_name, // First name of the user.
        last_name: request.body.last_name,  // Last name of the user.
        description: request.body.description,  // A brief user description
        password: request.body.password, // The password of the user
    };

    User.create(user_attributes, doneCallback);

    function doneCallback(err, newUser) {
        console.log("Created userObject with ID", newUser._id);
        response.end(JSON.stringify(newUser));
    };
});


/**********************************************
 * Proposal Submission and Retrieval Handling *
 **********************************************/

/*
 * URL /proposals/new - Enter a new proposal in the database
 */
app.post('/proposals/new', function (request, response) {

    console.log("Server received proposal upload request");

    if (!request.session.email_address) {
        response.status(401).send("No user logged in");
        return;
    }

    var proposal_attributes = {
        title: request.body.title, // Proposal title
        text: request.body.text, // Text of the proposal
        description: request.body.description, // The proponent's description of the proposal
        user_author_id: request.session.user_id, // Reference to the ID of the user who submitted the proposal
        user_author_name: request.session.user.first_name + " " + request.session.user.last_name,
        // TODO: Implement this with group
        //group: mongoose.Scheme.Types.ObjectId // Reference to the ID of the group that this proposal was submitted to
    };

    function doneCallback(err, newProposal) {
        console.log("Created proposal object with ID", newProposal._id);
        response.end(JSON.stringify(newProposal));
    }

    Proposal.create(proposal_attributes, doneCallback);
});

/*
 * URL /proposals/retrieve - Retrieve the active proposals associated with a group
 */
app.get('/proposals/retrieve', function (request, response) {

    console.log("Server received proposal retrieval request");

    if (!request.session.email_address) {
        response.status(401).send("No user logged in");
        return;
    }

    // Retrieve all proposals with TODO: add group / active query qualifiers
    Proposal.find().exec(function (err, proposals) {
        if (err) {
            // Query returned an error.
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (proposals.length === 0) {
            // Query didn't return an error but didn't find the SchemaInfo object - This
            // is also an internal error return.
            response.status(200).send('Missing proposals');
            return;
        }

        // We got the object - create an array version of it in JSON
        var proposalsArray = JSON.parse(JSON.stringify(proposals));
        console.log('proposals', proposals);
        response.end(JSON.stringify(proposals));
    });
});    


/*****************************************
 * Proposal Upvote and Downvote Handling *
 *****************************************/

/*
 * URL /proposals/upvote/:id - Adds an upvote to the proposal specified by :id
 * and records that the session user upvoted that proposal
 */
app.post('/proposals/upvote/:proposal_id', function (request, response) {

    if (!request.session.email_address) {
        response.status(401).send("No user logged in");
        return;
    }

    console.log("Server received request to upvote proposal with id", request.params.proposal_id);
    var proposal_id = request.params.proposal_id;
    var user_id = request.session.user_id;

    // Find the proposal with proposal_id
    Proposal.findOne({_id: proposal_id}).exec(function (err, proposal) {
        if (err) {
            // Query returned an error.
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (proposal === null) {
            // Query didn't return an error but didn't find the SchemaInfo object
            response.status(500).send('Proposal does not exist');
            return;
        }

        var upvoteUserIndex = proposal.users_who_upvoted.indexOf(user_id);
        var downvoteUserIndex = proposal.users_who_downvoted.indexOf(user_id);
        if (upvoteUserIndex >-1) {
           console.log("User has already upvoted this proposal");
        } else {
           console.log("User has not yet upvoted this proposal");
           proposal.users_who_upvoted.push(user_id);
           console.log("proposal.users_who_upvoted = ", proposal.users_who_upvoted);
           // If user had previously downvoted, remove from downvote array
           if (downvoteUserIndex >-1) {
                proposal.users_who_downvoted.splice(downvoteUserIndex, 1);
           }
        }

        proposal.save();
        response.send(JSON.stringify(proposal));
    });
});

/*
 * URL /proposals/downvote/:id - Adds downvote to the proposal specified by :id
 * and records that the session user downvoted that proposal
 */
app.post('/proposals/downvote/:proposal_id', function (request, response) {

    if (!request.session.email_address) {
        response.status(401).send("No user logged in");
        return;
    }

    console.log("Server received request to downvote proposal with id", request.params.proposal_id);
    var proposal_id = request.params.proposal_id;
    var user_id = request.session.user_id;

    // Find the proposal with proposal_id
    Proposal.findOne({_id: proposal_id}).exec(function (err, proposal) {
        if (err) {
            // Query returned an error.
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (proposal === null) {
            // Query didn't return an error but didn't find the SchemaInfo object
            response.status(500).send('Proposal does not exist');
            return;
        }

        var upvoteUserIndex = proposal.users_who_upvoted.indexOf(user_id);
        var downvoteUserIndex = proposal.users_who_downvoted.indexOf(user_id);
        if (downvoteUserIndex >-1) {
           console.log("User has already downvoted this proposal");
        } else {
           console.log("User has not yet downvoted this proposal");
           proposal.users_who_downvoted.push(user_id);
           console.log("proposal.users_who_downvoted = ", proposal.users_who_downvoted);
           // If user had previously upvoted, remove from upvote array
           if (upvoteUserIndex >-1) {
                proposal.users_who_upvoted.splice(upvoteUserIndex, 1);
           }
        }

        proposal.save();
        response.send(JSON.stringify(proposal));
    });
});


/************************
 * Server Configuartion *
 ************************/

var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log('Listening at port' + port + ' exporting the directory ' + __dirname);
});


