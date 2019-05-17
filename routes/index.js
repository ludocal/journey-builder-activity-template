'use strict';

// Deps
var activity = require('./activity');

var appAvailable = [
    {
        name:'Batch STORE IOS',
        id: '001'
    },
    {
        name: 'BATCH STORE ANDROID',
        id: '002'
    }
];

/*
 * GET home page.
 */
exports.index = function(req, res){
    if(req.session && !req.session.token ) {
        res.render( 'index', {
            title: 'Unauthenticated',
            errorMessage: 'This app may only be loaded via Salesforce Marketing Cloud',
            configVar: 'TEST'
        });
    } else {
        res.render( 'index', {
            title: 'Journey Builder Activity',
            results: activity.logExecuteData,
            configVar: appAvailable,
        });
    }
};

exports.login = function( req, res ) {
    console.log( 'req.body: ', req.body );
    res.redirect( '/' );
};

exports.logout = function( req, res ) {
    req.session.token = '';
};