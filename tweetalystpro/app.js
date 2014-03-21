/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var AM = require('./supermodules/account-manager');

var app = express();
var SCREEN_NAME = "";

// all environments
//app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(path.join(__dirname, 'public/images/favicon.ico')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({cookie:{path:'/'}, secret: 'super-duper-secret-secret'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.session({ secret: "very secret" }));
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var httpProxy = require('http-proxy');

var apiProxy = httpProxy.createProxyServer();


exports.app = app;

app.get("/blog*", function(req, res, next){ 
  console.log("proxy starts")  ;
  apiProxy.web(req, res, { target: 'http://tweetaly.st/blog:2368' });
  console.log("proxy ends")  ;
});

app.post("/blog*", function(req, res, next){ 
  apiProxy.web(req, res, { target: 'http://tweetaly.st/blog:2368' });
});

app.delete("/blog*", function(req, res, next){ 
  apiProxy.web(req, res, { target: 'http://tweetaly.st/blog:2368' });
});

app.put('/blog*', function(req, res, next) {
        apiProxy.web(req, res, { target: 'http://tweetaly.st/blog:2368'});
    });

app.use(express.urlencoded());
app.use(express.json());

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
app.get('/downloadallusertweets', routes.downloadallusertweets);
app.get('/getnextunattendedtweets', routes.getnextunattendedtweets);
app.get('/getnextprioritytweets', routes.getnextprioritytweets);
app.get('/getnextnewusertweets', routes.getnextnewusertweets);
app.get('/setupunattendedtweets', routes.setupunattendedtweets);
app.get('/dismisstweet', routes.dismisstweet);
app.get('/getnewreplies', routes.getnewreplies);
app.post('/posttweet',routes.posttweet);
app.get('/pro', routes.pro);
app.get('/tos', routes.tos);
app.get('/privacy', routes.privacy);
app.get('/score', routes.score);



 
var util = require('util');
var OAuth= require('oauth').OAuth;

var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    "sEORAkR5366d5o9wTfMtmQ",
    "xwlDEXXpim7yEK69KtRo0C4zh5TR3sQCjBOaCEfwpcQ",
    "1.0",
    "http://tweetaly.st/auth/twitter/callback",
    "HMAC-SHA1"
);
app.get('/auth/twitter', function(req, res)
{
        var aid = 0;
        var rid = 0;

        if(req.query.aff_id!=null)
        {
            aid = req.query.aff_id;
            req.session.affiliate = { id: req.query.aff_id};
            req.session.save();
        }

        if(req.query.ref_id!=null)
        {
            rid = req.query.ref_id;
            req.session.referral = { id: req.query.ref_id};
            req.session.save();
        }

        if(req.query.check!=null)
        {
           // rid = req.query.check;
            req.session.scoresession = { };
            req.session.save();
        }


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


    // write some code for paid users........

    if (req.session.oauth) {
        req.session.oauth.verifier = req.query.oauth_verifier;
        var oauth = req.session.oauth;  

        oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier,
            function(error, oauth_access_token, oauth_access_token_secret, results){
                if (error){
                    console.log(error);
                    res.redirect("/");
                   // res.send("yeah something broke.");
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
                        .verifyCredentials(function (err, data) 
                        {
                            guestSignup(req, res, data.screen_name);
                           // console.log(err,data);
                            console.log("In app.js ");
                    });                       

                }
            }
        );
    } else
        next(new Error("you're not supposed to be here."))
});



function guestSignup(req, res, screen_name)
{

        var referralName = "Unknown";
        var affiliateName = "Unknown";

        AM.getAffiliateName(req.session.affiliate.id, function(e,o)
        {
            if(o)
            {
            console.log(o);
            affiliateName = o.name;
            }
            else
            {

            }
                AM.getReferralName(req.session.referral.id, function(e, o)
                {
                    if(o)
                    {
                    referralName = o.name;
                    }
                    else
                    {

                    }


                            AM.addNewAccount({
                                name    : screen_name,
                                email   : screen_name+"@tweetaly.st",
                                user    : "guest_"+screen_name,
                                pass    : "whateverittakes",
                                country : "Free Package",
                                useragent: req.headers["user-agent"],
                                replycounter:0,
                                referral: referralName,
                                affiliate: affiliateName,
                                referralid: req.session.referral.id,
                                affiliateid: req.session.affiliate.id
                            }, function(e){
                                if (e)
                                {

                                    guestLogin(req, res, screen_name);
                                   // res.send(e, 400);
                                }    
                                else
                                {
                                    guestLogin(req, res, screen_name);
                                   // res.send('ok', 200);
                                }
                            });





                });


        });




}



function guestLogin(req, res, screen_name)
{

        AM.manualLogin("guest_"+screen_name, "whateverittakes", function(e, o){
            if (!o){
                res.send(e, 400);
            }   else{
                req.session.user = o;
                if (req.param('remember-me') == 'true'){
                    res.cookie('user', o.user, {domain:'.tweetaly.st' , maxAge: 900000});
                    res.cookie('pass', o.pass, {domain:'.tweetaly.st' , maxAge: 900000});
                }
                // share these cookie values
                    res.cookie('u', o.user, {domain:'.tweetaly.st' , maxAge: 900000});
                    res.cookie('p', o.pass, {domain:'.tweetaly.st' , maxAge: 900000});
                    if(req.session.scoresession)
                    res.redirect('/score')
                    else
                    res.redirect('/openstreams');
                 //res.send(o, 200);
            }
        });
   
}