/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();
var SCREEN_NAME = "";

// all environments
//app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({cookie:{path:'/', httpOnly:true, maxAge:null }}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.session({ secret: "very secret" }));
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/future', routes.index);
app.get('/', routes.splash);
app.get('/mentionmanagement', routes.mentionmanagement);
app.get('/dashboard', routes.dashboard);
app.get('/realtime', routes.realtime);
app.get('/verify', routes.verify);
app.get('/downloadtemplates', routes.downloadtemplates);
app.get('/updatetemplate', routes.updatetemplate);
app.get('/logout' , routes.logout);
app.get('/realfavorites', routes.realfavorites);
app.get('/realdms', routes.realdms);
app.get('/realfollowers', routes.realfollowers);
app.get('/realrts', routes.realrts);
app.get('/openstreams', routes.openstreams);
app.get('/downloadallreplies', routes.downloadallreplies);
app.get('/getnewreplies', routes.getnewreplies);
app.post('/posttweet', function(req, res)
{

    console.log("request is "+req)

    var name = req.body.name;
    var message = req.body.message;
    var replytoid = req.body.replytoid;

    console.log("name is "+req.body.name);
    console.log("message is "+req.body.message);
    console.log("reply to id "+req.body.replytoid);

    //extract data like whom to post the tweet from req header
   

     var twit = new twitter({
                        consumer_key: "sEORAkR5366d5o9wTfMtmQ",
                        consumer_secret: "xwlDEXXpim7yEK69KtRo0C4zh5TR3sQCjBOaCEfwpcQ",
                        access_token_key: req.session.oauth.access_token,
                        access_token_secret: req.session.oauth.access_token_secret
                    });

    // res.send("success");

     twit

            .updateStatus(name+" "+message, { in_reply_to_status_id: replytoid }, function (err, data)
             {
                 if (err) res.send(err, 500)
                 else res.send(data)
             });

});
//app.get('/users', user.list);

// http.createServer(app).listen(app.get('port'), function () {
//     console.log('Express server listening on port ' + app.get('port'));
// });

exports.app = app;

var util = require('util');
var OAuth= require('oauth').OAuth;

var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    "sEORAkR5366d5o9wTfMtmQ",
    "xwlDEXXpim7yEK69KtRo0C4zh5TR3sQCjBOaCEfwpcQ",
    "1.0",
    "http://pro.tweetaly.st/auth/twitter/callback",
    "HMAC-SHA1"
);
app.get('/auth/twitter', function(req, res){
    oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
        if (error) {
            console.log(error);
            res.send("yeah no. didn't work.")
        }
        else {
            req.session.oauth = {};
            req.session.oauth.token = oauth_token;
            console.log('oauth.token: ' + req.session.oauth.token);
            req.session.oauth.token_secret = oauth_token_secret;
            console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
        }
    });
});

var twitter = require('ntwitter');
app.get('/auth/twitter/callback', function(req, res, next){
    if (req.session.oauth) {
        req.session.oauth.verifier = req.query.oauth_verifier;
        var oauth = req.session.oauth;

        oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier,
            function(error, oauth_access_token, oauth_access_token_secret, results){
                if (error){
                    console.log(error);
                    res.send("yeah something broke.");
                } else {
                    req.session.oauth.access_token = oauth_access_token;
                    req.session.oauth.access_token_secret = oauth_access_token_secret;
                    console.log(results);
                    //console.log(req);
                    var twit = new twitter({
                        consumer_key: "sEORAkR5366d5o9wTfMtmQ",
                        consumer_secret: "xwlDEXXpim7yEK69KtRo0C4zh5TR3sQCjBOaCEfwpcQ",
                        access_token_key: req.session.oauth.access_token,
                        access_token_secret: req.session.oauth.access_token_secret
                    });


                    twit
                        .verifyCredentials(function (err, data) {
                            console.log(err,data);
                            console.log("In app.js ");
                    });

                    res.redirect('/openstreams');
                       

                }
            }
        );
    } else
        next(new Error("you're not supposed to be here."))
});