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
    getMIDfromToken("toto", function(error, response){
        configApplication.forEach(element => {
        if (response === element.mid)
        {
            res.json(element.appAvailable);
        }
    });
    });
    //res.json( 'ERROR' );
};

function getMIDfromToken(token, callback)
{
    configApplication.forEach(element => {
        const options = {
            hostname: element.domain + '.auth.marketingcloudapis.com',
            path: '/v2/userinfo',
            method: 'GET',
            headers : {'Content-Type': "application/json",'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjEiLCJ2ZXIiOiIxIiwidHlwIjoiSldUIn0.eyJhY2Nlc3NfdG9rZW4iOiJYc3JpUUc5SUxyQjZtb2RJQWoydjJ3WkgiLCJjbGllbnRfaWQiOiI3NWx0cGxhb3Z5Z2tyaHF6cmtiaTI3eWoiLCJlaWQiOjUwMDAwODQyOCwic3RhY2tfa2V5IjoiUzUwIiwicGxhdGZvcm1fdmVyc2lvbiI6MiwiY2xpZW50X3R5cGUiOiJTZXJ2ZXJUb1NlcnZlciJ9.ruPq-lMcNK0gULC2e7d_Dh6cD1hIdwpIP00EULBDaeE.ZS98W_XIQg966hDlVxD7d12qywRNDmBF2kUgSfHXc9eF6QZ6SsDpmlqMF3x60rpyJy05tBt7wVfONoCvp_keo3Y4X24JgC2dwTGqwPbkywiLrSHDnr68CievqxM_OfJhbnQGQXJMaaYAm_Lp0ABg6mt4JPnXWgW3fFVGWdQZXYg_SVGB3om"}
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
                    callback(null, 500008428);
                }
                console.log(responseString);
                if (res.statusCode === 200)
                {
                    responseObject = JSON.parse(responseString);
                    callback(null, responseObject.organization.enterprise_id);
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