var express = require('express');
var apiKeys = require ('./keys');
var TwitPackage = require('twit');
var WatsonPackage = require('watson-developer-cloud');
var unirest = require('unirest');

var OxfordPackage = require('project-oxford'),
    emotionAPI = new OxfordPackage.Client(apiKeys.projectOxford.emotionAPI.primaryKey),
    faceAPI = new OxfordPackage.Client(apiKeys.projectOxford.faceAPI.primaryKey);

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
app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get('/verifyUser', function(req, res){
    var twitterUsername = req.query.un;

    twitter.get('users/lookup', {screen_name: twitterUsername}, function(err,data,response) {
        if(err){
            res.send("False");
        }
        else {
            res.send("True");
        }
    })
})

app.get('/go', function (req, res) {
  console.log(req.query.un);
  var twitterUsername = req.query.un;
  var responseJSON = {
    images:[]
  };

  twitter.get('statuses/user_timeline', { screen_name: twitterUsername, count: 200 }, function(err, data, response) {
    if(err){
      res.send(err);
      return;
    }

    var textData = data.map(function(tweet){
        if(tweet.entities.media){
          tweet.entities.media.forEach(function(media){
            responseJSON.images.push({url:media.media_url_https,time:tweet.created_at});
          });
        }
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

    var total = 0;
    var avgSadness = 0;
    var relativeAvgDeviation = 0;
    Promise.all(watsonData).then(function(data){
        responseJSON.data = data;

        for(var i = 0; i < data.length; i++){
            total += data[i].sadness;
        }

        avgSadness = total / data.length;
        total = 0;
        for(var i = 0; i < data.length; i++){
            total += Math.abs(data[i].sadness - avgSadness);
        }

        relativeAvgDeviation = (avgSadness / total) * 100;

        console.log(avgSadness);
        console.log(relativeAvgDeviation);

        res.send(responseJSON);
    })

    console.log(avgSadness);

  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.get('/identify', function(req, res){
  var url = req.query.url;
  var rec = req.query.rec;
  var images = (typeof req.query.images == "string") ? JSON.parse(req.query.images) : req.query.images;

  var targetFaceId = "";
  var faceIDs = [];
  var faceRects = {};
  var faceIdToImage = {};

  if(!url){
    res.send([]);
  }

  faceAPI.face.detect({
    url: url,
    analyzesAge: true,
    analyzesGender: true,
    returnFaceId: true
  }).then(function (response) {
    for (var i = 0; i < response.length; i++) {
      if(overlap(response[i].faceRectangle, rec) > 90){
        targetFaceId = response[i].faceId;
        break;
      }
    }

    var count = 0;
    return Promise.all(images.map(function(imageObj){
      count++;
      if(count >= 18) return 0;
      return faceAPI.face.detect({
        url: imageObj.url,
        analyzesAge: true,
        analyzesGender: true,
        returnFaceId: true
      }).then(function(res){
        res.forEach(function(face){
          faceIDs.push(face.faceId);
          faceRects[face.faceId] = face.faceRectangle;
          faceIdToImage[face.faceId] = imageObj;
        });
      });
    })).then(function(){
      return faceAPI.face.similar(
        targetFaceId, {
          candidateFaces: faceIDs
        });
    }).then(function(res){
      return Promise.all(res.map(function(face){
        var str = faceRects[face.faceId].left + ", " + faceRects[face.faceId].top + ", " + faceRects[face.faceId].width + ", " + faceRects[face.faceId].height;

        return new Promise(function(resolve,reject){
          unirest.post('https://api.projectoxford.ai/emotion/v1.0/recognize?faceRectangles=' + str)
          .header('Ocp-Apim-Subscription-Key', apiKeys.projectOxford.emotionAPI.primaryKey)
          .header('Content-Type', 'application/json')
          .send({ "url": faceIdToImage[face.faceId].url })
          .end(function(response){
            response.body[0].time = faceIdToImage[face.faceId].time;
            resolve(response.body[0]);
          });
        });
      }));
    }).then(function(result){
        res.send(result);

    }).catch(function(err){
      console.log(err);
    });
  });
});

function overlap(rec1, rec2){
  return 91;
}


app.get('/check', function(req, res){
    console.log(req.query.url);
    faceAPI.face.detect({
    url: req.query.url,
    analyzesAge: true,
    analyzesGender: true,
    returnFaceId: true
  }).then(function(response){
     res.send(response);
  }).catch(function(err){
    console.log(err);
  });
});
