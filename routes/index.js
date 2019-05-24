'use strict';

// Deps
var activity = require('./activity');

var configApplication = {
    apiRestToken: 'dcee600f7a7be131481e28ddb40ae1b0',
    appAvailable:[
    {
        name:'Batch STORE IOS',
        id: '5CDD1B576095D88F6FE92DA49189D2'
    },
    {
        name: 'BATCH STORE ANDROID',
        id: '5CDD1B576095D88F6FE92DA49189D2'
    }]
};

/*
 * GET home page.
 */
exports.index = function(req, res){
    console.log(req);
    if(req.session && !req.session.token ) {
        res.render( 'index', {
            title: 'Unauthenticated',
            errorMessage: 'This app may only be loaded via Salesforce Marketing Cloud',
            configVar: configApplication,
            configVarJson: JSON.stringify(configApplication)
        });
    } else {
        res.render( 'index', {
            title: 'Journey Builder Activity',
            results: activity.logExecuteData,
            configVar: configApplication,
            configVarJson: JSON.stringify(configApplication)
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