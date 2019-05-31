'use strict';

// Deps
var activity = require('./activity');
var https = require('https');

var configApplication = [{
    apiRestToken: 'dcee600f7a7be131481e28ddb40ae1b0',
    domain: 'mcwd-d2pprjfdcksy88llpp9dv-4',
    mid: 500008428,
    appAvailable:[
    {
        name:'Batch STORE IOS',
        id: '5CDD1B576095D88F6FE92DA49189D2'
    },
    {
        name: 'BATCH STORE ANDROID',
        id: '5CDD1B576095D88F6FE92DA49189D2'
    }]
}];

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

exports.getApplicationList = function( req, res ) {
    console.log('getApplicationList');
    console.log( 'req.body: ', req.body );
    getMIDfromToken("X2QFnllyq6PyWK2beszxSWyP", "https://www-mc-s50.exacttargetapis.com",function(error, response){
        configApplication.forEach(element => {
        if (response === element.mid)
        {
            res.json(element.appAvailable);
        }
    });
    });
    //res.json( 'ERROR' );
};

function getMIDfromToken(token, endpoint, callback)
{
    configApplication.forEach(element => {
        const options = {
            hostname: endpoint,
            path: '/platform/v1/tokenContext',
            method: 'GET',
            headers : {'Content-Type': "application/json",'Authorization': "Bearer " + token}
          };
          var responseString = "";
          var responseObject;
          const req = https.request(options, (res) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
            var str;
            res.on('data', (d) => {
                responseString +=d;
            });
            res.on('end', (d) => {
                if (res.statusCode >= 400){
                    callback(null, 0);
                }
                console.log(responseString);
                if (res.statusCode === 200)
                {
                    responseObject = JSON.parse(responseString);
                    callback(null, responseObject.organization.id);
                }
              });
          });
          
          req.on('error', (e) => {
            console.error(e);
          });
          req.end();
    });
}



exports.login = function( req, res ) {
    console.log( 'req.body: ', req.body );
    res.redirect( '/' );
};

exports.logout = function( req, res ) {
    req.session.token = '';
};