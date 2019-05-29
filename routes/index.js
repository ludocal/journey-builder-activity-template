'use strict';

// Deps
var activity = require('./activity');
var https = require('https');

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

exports.getApplicationList = function( req, res ) {
    console.log('getApplicationList');
    console.log( 'req.body: ', req.body );
    var mid = getMIDfromToken("", "toto");
    res.json( configApplication.appAvailable );
};

function getMIDfromToken(url, token)
{
    const options = {
        hostname: 'mcwd-d2pprjfdcksy88llpp9dv-4.auth.marketingcloudapis.com',
        path: '/v2/userinfo',
        method: 'GET',
        headers : {'Content-Type': "application/json",'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjEiLCJ2ZXIiOiIxIiwidHlwIjoiSldUIn0.eyJhY2Nlc3NfdG9rZW4iOiJYVWVWSGpOTzduaHZmV2o3dTZDWDZneUUiLCJjbGllbnRfaWQiOiI3NWx0cGxhb3Z5Z2tyaHF6cmtiaTI3eWoiLCJlaWQiOjUwMDAwODQyOCwic3RhY2tfa2V5IjoiUzUwIiwicGxhdGZvcm1fdmVyc2lvbiI6MiwiY2xpZW50X3R5cGUiOiJTZXJ2ZXJUb1NlcnZlciJ9.meLLIm3M3KhFhV6vMd96eelugNWgRU6Oo3Cd4go-04I.xrJ-NiucC5qgLSEtDHscBrSjcVBYhs3q99P1mAvCWSsXqZDzF0PQOjUCZ8cSEKL7jrfGOMFQ0D_klD5Xp3KO3tP2FmLrKe9w0jcaVh8G1-cx-gpT_CFpx9hRDoMEeJPCc4n0HPo_D2TIVWWKNXog3rxXJqxnO-GyjE6KmhprbFmkV-KVEbv"}
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
            console.log(responseString);
            if (res.statusCode === 200)
            {
                responseObject = JSON.parse(responseString);
                return responseObject.organization.enterprise_id;
            }
          });
      });
      
      req.on('error', (e) => {
        console.error(e);
      });
      req.end();
    return  "500008428";
}



exports.login = function( req, res ) {
    console.log( 'req.body: ', req.body );
    res.redirect( '/' );
};

exports.logout = function( req, res ) {
    req.session.token = '';
};