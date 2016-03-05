var express = require('express');
var apiKeys = require ('./keys');
var TwitPackage = require('twit');
var WatsonPackage = require('watson-developer-cloud');

var OxfordPackage = require('project-oxford'),
    oxford = new OxfordPackage.Client(apiKeys.projectOxford.primaryKey);

var twitter = new TwitPackage ({
    consumer_key: apiKeys.twitter.consumerKey,
    consumer_secret: apiKeys.twitter.consumerSecret,
    access_token: apiKeys.twitter.accessToken,
    access_token_secret: apiKeys.twitter.accessTokenSecret
})

var watson = WatsonPackage.authorization ({
    username: apiKeys.watsonToneAnalyzer.username,
    password: apiKeys.watsonToneAnalyzer.password,
    version: 'v1'
})

var app = express();
app.use('/', express.static(__dirname + '/public'));

app.get('/go', function (req, res) {
  var twitterUsername = req.query.un;
  var responseJSON = {};

/* DO SHIT */

  res.send(responseJSON);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
