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

var watson = WatsonPackage.tone_analyzer ({
    username: apiKeys.watsonToneAnalyzer.username,
    password: apiKeys.watsonToneAnalyzer.password,
    version: 'v3-beta',
    version_date: '2016-02-11'
})

var app = express();
app.use('/', express.static(__dirname + '/public'));

app.get('/go', function (req, res) {
  console.log(req.query.un);
  var twitterUsername = req.query.un;
  var responseJSON = {};

  twitter.get('statuses/user_timeline', { screen_name: twitterUsername, count: 200 }, function(err, data, response) {
    if(err){
      res.send(err);
      return;
    }

    var textData = data.map(function(tweet){
        var text = tweet.text;
        var time = tweet.created_at;

        return {
            text: text,
            time: time
        };
    })

    var watsonData = [];

    var getWatsonData = function(currWatsonData) {
        return new Promise(function(resolve, reject){
            watson.tone({text: currWatsonData.text}, function(err, tone) {
                var tones = tone.document_tone.tone_categories[0].tones;

                var pair = {
                    "sadness": {},
                    "time": {}
                }

                for(var i = 0; i < tones.length; i++) {
                    if(tones[i].tone_id == "sadness") {
                        pair = {
                            "sadness": tones[i].score,
                            "time": currWatsonData.time
                        }
                        break;
                    }
                }
                resolve(pair);
            })
        })
    }

    for(var i = 0; i < textData.length; i++) {
         var temp = getWatsonData(textData[i]);
         watsonData.push(temp);
    }

    Promise.all(watsonData).then(function(data){
        res.send(data);
    })

  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

