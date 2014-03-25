/*
 * GET home page.
 */
var AM = require('./modules/sharedLogin');
var TM = require('./modules/TweetsManager');
var PM = require('./modules/PlanManager');
var SM = require('./modules/ScoreManager');
var CONSUMER_KEY = "sEORAkR5366d5o9wTfMtmQ";
var CONSUMER_SECRET = "xwlDEXXpim7yEK69KtRo0C4zh5TR3sQCjBOaCEfwpcQ";
var SCREEN_NAME = "";
var mongo = require('mongodb');
var monk  = require('monk');
var db = monk('localhost:27017/protes');
var collection; // = db.get('collection');
var _ = require('underscore')._;
var moment    = require('moment');
var test = 0;


var twitter = require('ntwitter');
var io = require('socket.io').listen(3001, {log: false});
var streamArray = [];

// io.set('authorization', function (handshakeData, accept) {

//   if (handshakeData.headers.cookie) {

//     handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);

//     handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], 'secret');

//     if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
//       return accept('Cookie is invalid.', false);
//     }

//   } else {
//     return accept('No cookie transmitted.', false);
//   } 

//   accept(null, true);
// });


exports.dismisstweet = function(req, res)
{
      if(req.query.id!=null)
      {
        if(req.query.sec == "all")
        {
          TM.markAsAttended(req.query.id, function(o)
          {
            TM.markAsDismissed(req.query.id,req.query.sec, function(o) { });
            if(o!=null)
            res.send("dismissed");


          });
        }
        else if(req.query.sec == "priority" )
        {

          TM.markAsAttended_priority(req.query.id, function(o)
          {
            TM.markAsDismissed(req.query.id,req.query.sec, function(o) { });
            if(o!=null)
            res.send("dismissed");

          });

        }
        else if(req.query.sec == "new" )
        {
           TM.markAsAttended_new(req.query.id, function(o)
          {
            TM.markAsDismissed(req.query.id,req.query.sec, function(o) { });
            if(o!=null)
            res.send("dismissed");

          });


        }

      }
}


exports.verify = function(req, res)
{
        if (req.session.oauth) {
        var twit = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });


        twit
            .verifyCredentials(function (err, data)
             {

               // console.log(err, data);
                SCREEN_NAME = data.screen_name;
                collection = db.get(SCREEN_NAME);
                if (err) res.send(err, 500)
                else res.send(data)
            });
        }   
}
exports.index = function (req, res)
 {
   // req.session.destroy();
    res.render('index', { title: 'Express' });
    if (req.session.oauth) {
        var twit = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });


        twit
            .verifyCredentials(function (err, data) {
                console.log(err, data);
                SCREEN_NAME = data.screen_name;
                collection = db.get(SCREEN_NAME);
            });
            
        


        // twit.stream(
        //     'statuses/filter',
        //     {track: ['amor', 'odio', 'love', 'hate']},
        //     function (stream) {
        //         stream.on('data', function (data) {
        //             //console.log(data);
        //             //console.log(data.user.screen_name + " : " + data.text);
        //             io.sockets.emit('newTwitt', data);
        //             // throw  new Exception('end');
        //         });
        //     }
        // );

        
            twit.stream('user',{}, 
            function (stream) {
                stream.on('data', function (data) {
                    //console.log(data);
                    //console.log(data.user.screen_name + " : " + data.text);
                    io.sockets.emit('newTwitt', data);
                    // throw  new Exception('end');
                });
            }
            );
    }
};





exports.downloadtemplates = function(req, res)
{
      console.log("Session is "+req.session);
      for(a in req.session)
      {
        console.log("sess break is "+a);
      }
       console.log("Session user  is "+req.session.user);
        console.log("Session user  is "+req.session.user);
    console.log("Session user email is "+req.session.user.email);

    PM.configplans();
    var templatelimit;
    // param country has to be plan
    PM.gettemplatelimit(req.session.user.country, function(o)
    { 
    templatelimit = o;
    collection = db.get(req.query.screen_name);
    collection.find( {},{limit:templatelimit, sort:{template_name:1}}, function(err,docs) 
    {
        console.log("Template limit is "+templatelimit);
      console.log("error is"+err);
      console.log(docs);
      var result = [];
      for(var a in docs)
      {
         console.log("wow"+docs[a].template_name);
         result.push({template_name:docs[a].template_name,  template_text:docs[a].template_text});
      }

      if(result.length == 0)
      {
        // Handle when database is empty

        var default_templates =
        [
        {template_name:"Template 1", template_text:"We apologize for the interruption."} ,
        {template_name:"Template 2", template_text:"Thank you for contacting us."} ,
        {template_name:"Template 3", template_text:"We will get back to you shortly."} ,
        {template_name:"Template 4", template_text:"Please DM your phone number."} ,
        {template_name:"Template 5", template_text:"Welcome. Have a good day!"} ,
        {template_name:"Template 6", template_text:"Kindly be patient we are looking into your issue."} ,
        ];
        collection.insert(default_templates, function(err, docs)
        {

                  for(var a in docs)
                  {
                        console.log("tttttttttttttttt"+docs[a]);
                        result.push({template_name:docs[a].template_name,  template_text:docs[a].template_text });
                  }


                 // res.send(default_templates);
                  res.send(_.first(default_templates, templatelimit));

        });


      }
      else
      {
        res.send(result);
      }
     
     // console.log("pushed");
     // res.redirect("/timegraph");
    
   });

});

}


exports.updatetemplate = function(req , res )
{
    collection = db.get(SCREEN_NAME);
    collection.update( { template_name: req.query.template_name},
                     { $set : { template_text: req.query.template_text } }, function(err,docs) 
                     {
                            console.log("docs is "+docs);
                            console.log("err is"+err);
                            res.send("success");

                     });
}



exports.pro = function(req , res)
{

       if (req.cookies.u == undefined || req.cookies.p == undefined) // if not signed up users...
       {

            console.log("You are not an authenticated user");
            res.render('splash' , {dashdata: {}});
           // res.render('login', { title: 'Hello - Please Login To Your Account' });
        }   
        else
        {

            AM.autoLogin(req.cookies.u, req.cookies.p, function(o)
            {
                if (o != null)
                {
                    req.session.user = o;
                    req.session.save();
                    res.render('pro' , {dashdata: {planStatus:"active", planName:req.session.user.country, userName: req.session.user.name}});
                }
                else
                {


                }
            });
        }


}


exports.tos = function ( req, res )
{
  res.render('tos' , { } );
}

exports.privacy = function ( req, res )
{
  res.render('privacy', { });
}


exports.dashboard = function ( req, res) 
{


         if (req.cookies.u == undefined || req.cookies.p == undefined) // if not signed up users...
         {

            console.log("You are not an authenticated user");
            res.render('splash' , {dashdata: {}});
           // res.render('login', { title: 'Hello - Please Login To Your Account' });
        }   else{
                console.log("user is "+req.cookies.u);
                 PM.configplans();
    // attempt automatic login //
            AM.autoLogin(req.cookies.u, req.cookies.p, function(o){
                if (o != null){
                    req.session.user = o;
                    req.session.save();
                    PM.gettemplatelimit(req.session.user.country, function(o)
                    { 
                        var templatelimit = o;
                        var max_replycount;
                        PM.getreplycountlimit(req.session.user.country, function(o)
                        {
                        max_replycount =o;
                        var remaining_replies = max_replycount - req.session.user.replycounter;
                        // if(remaining_replies == 0)
                        // {
                        //     // dont show them anything...
                        // }
                        if(req.session.user.country == "Free Package")
                        {

                                AM.findExpiry(req.session.user, function(o)
                                {

                                   console.log(" expiry status is "+o);

                                    if(o=="expired")
                                    {

                                      res.render('pro' , {dashdata: {planStatus:"expired", planName:req.session.user.country, userName: req.session.user.name}});

                                    }
                                    else
                                    {
                                      
                                      res.render('dashboard' , {dashdata: {planStatus:"free", planName:req.session.user.country, userName: req.session.user.name, repliesremaining:remaining_replies}});

                                    }

                                });

                        }
                        else
                        {
                                if(req.session.user.replycounter >= templatelimit)
                                res.render('dashboard' , {dashdata: {planStatus:"expired", planName:req.session.user.country, userName: req.session.user.name}});
                                else
                                res.render('dashboard' , {dashdata: {planStatus:"active", planName:req.session.user.country, userName: req.session.user.name}});
                        }


                        });


                    }); 
                }
                else
                {
                    res.render('splash' , {dashdata: {}});
                    console.log("Good try .. didnt work! ");
                    //res.render('login', { title: 'Hello - Please Login To Your Account' });
                }
            });
        }

   // if(req.query.route=="redirect") { console.log( "it is redirected "); io = require('socket.io').listen(3001, {log: false}); };

    
  //  if (req.session.oauth) 


}



exports.openstreams = function (req, res) 
{



  //       {
  //       var twit = new twitter({
  //           consumer_key: CONSUMER_KEY,
  //           consumer_secret: CONSUMER_SECRET,
  //           access_token_key: req.session.oauth.access_token,
  //           access_token_secret: req.session.oauth.access_token_secret
  //       });

  //       // twit
  //       //     .verifyCredentials(function (err, data) {
  //       //         console.log(err, data);
  //       //         SCREEN_NAME = data.screen_name;
  //       //     });
            


  //       // twit.stream(
  //       //     'statuses/filter',
  //       //     {track: ['vodafoneIN', 'vodafone india', 'vodafone karnataka', 'vodafone', ]},
  //       //     function (stream)
  //       //      {
  //       //         console.log("stream is"+stream);

  //       //         stream.on('data', function (data) {
  //       //             //console.log(data);
  //       //             //console.log(data.user.screen_name + " : " + data.text);
  //       //             io.sockets.emit('newTwitt', data);
  //       //             // throw  new Exception('end');
  //       //         });
  //       //     }
  //       // );


  //       var count = 0;

  //      // io.sockets.clients().forEach(function (socket) { console.log("socket found!!!!!! "); socket.destroy });

  //       twit

  //           .stream('user',{}, 
  //           function (stream) 
  //           {

  //              // twit.currentTwitStream = stream;
  //               //stream.destroy;
  //               stream.on('data', function (data)
  //                {

  //                    count++;
  //                    console.log("stream number is "+count);

  //                   //console.log(data);
  //                   //console.log(data.user.screen_name + " : " + data.text);
  //                   processRealtime(data);
  //                   if(data.hasOwnProperty("entities"))
  //                   if(data.entities.hasOwnProperty("user_mentions"))
  //                   {
  //                   console.log("data.entities.user_mentions.screen_name "+data.entities.user_mentions);
  //               //    console.log("no 1... is "+data.entities.user_mentions[0].screen_name);
  //                  // console.log("no 1... is "+)

  //                   var found = 0;
  //                   console.log("actual screen name is "+SCREEN_NAME);

  //                   for(var i=0; i<data.entities.user_mentions.length; i++)
  //                   {
  //                       console.log("mentioned name is "+data.entities.user_mentions[i].screen_name);
  //                       if(data.entities.user_mentions[i].screen_name == SCREEN_NAME)
  //                       found=1;
                      
  //                   }

  //                   if(found==1) io.sockets.emit('newTwitt', data);

  //                   }

  //                    io.sockets.clients().forEach(function (socket) { console.log("socket found!!!!!! ") }); //socket.destroy });
  //                   // throw  new Exception('end');
  //               });

  //                 stream.on('end', function (response) {
  //   // Handle a disconnection
  // });
  // stream.on('destroy', function (response) {
  //   // Handle a 'silent' disconnection from Twitter, no end/error event fired
  // });


  //       //setTimeout(stream.destroy, 55000);

  //           }
  //           );


  //       // twit
  //       //     .getMentions('', function(err, data)
  //       //  {
  //       //     console.log(err);
  //       //     console.log(data);
  //       //     console.log("inside mentions");
  //       //     for(var key in data)
  //       //     {
  //       //                         console.log(data[key]+"data...........................");
  //       //                         var attrName = key;
  //       //                         var attrValue = data[key];
  //       //                         info = { "text":attrValue.text , user:{"screen_name":attrValue.user.screen_name} };
  //       //                         io.sockets.emit('newTwitt', info); //rest
  //       //                       //  console.log(attrValue);

  //       //     }
  //       // });
  //   }


    res.redirect("/dashboard");

}


exports.realtime = function ( req, res) {
    res.render('realtime' , {});
     if(req.session.oauth)
     {
            var twit = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
     });


     twit.stream('user', {},
         function(stream) {
            stream.on('data', function(data) {
                console.log(data);
               
                if(data.event == "follow")
                {
                io.sockets.emit('followTwitt', data);
                console.log("someone is following you")
                }
                else
                if(data.event == "favorite")
                {
                io.sockets.emit('favTwitt', data);
                console.log("favorite tweet!")
                }
                else
                if(data.hasOwnProperty("direct_message"))
                {
                io.sockets.emit('directTwitt' , data)
                console.log("dm");
                }
                else
                {
                     io.sockets.emit('repTwitt', data);
                }

              //  io.sockets.emit('favTwitt', data);
              //  io.sockets.emit('directTwitt', data);
                // if data contains event for favorite

                // if data contains event for direct message

                // if data contains event for someone following account

                // if data contains event for someone unfollowing an account
            })
         })
    }

}

exports.mentionmanagement = function ( req, res) {
    //res.render('mentionmanagement' , {});
    if(req.session.oauth) {
            var twit = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });

    twit.getMentions('', function(err,data)
     {

         // data.on('data', function(d)
         //                        {
         //                             io.sockets.emit('menTwitt', d);
         //                        }
         //                        );

      // console.log(data);
        // for(var key in data)
        // {
        //                         var attrName = key;
        //                         var attrValue = data[key];
        //                         console.log(attrValue.user.screen_name);

        //                         // var scope = angular.element($("#mentionApp")).scope();
        //                         // scope.$apply(function(){
        //                         // scope.twitts = [{user: {screen_name: 'new'}, text: 'update'}];
        //                         // })
        //                         info = { "text":attrValue.text , user:{"screen_name":attrValue.user.screen_name} };

        //                         io.sockets.emit('menTwitt', info);

                               
        // }

        if (err) res.send(err, 500)
        else res.send(data)

    });

    }
}


exports.splash = function (req , res)
{
        var rid = 0;
        var aid = 0;
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

   // console.log("session is "+req.session.user);
    {
        res.render('splash' , {pageData: {screen_name : ['Tweetalyst']}, ref_id:rid, aff_id:aid, test_case:"b"});
    }
};


exports.logout = function(req, res) {

    res.clearCookie('u', { path:'/', domain:'.tweetaly.st'});
    res.clearCookie('p', { path:'/', domain:'.tweetaly.st'});
    res.clearCookie('user',{ path:'/', domain:'.tweetaly.st'});
    res.clearCookie('pass',{ path:'/', domain:'.tweetaly.st'});
    req.session.destroy();
    res.redirect('/');
};


exports.score_thinking = function(req, res)
{

  res.render('thinking' , {}); 
//  res.redirect('/scoreboard');


};


exports.score = function(req, res) {


    var unique = req.session.oauth.access_token;
    unique = unique.substring(unique.length-8, unique.length);



    SM.setCollectionNames(unique,function(o){});
    stoploop = 0;

    //reset
     max_id = 0;
     stoploop = 0;
     ORIGINAL_TWEETS_COUNT = 0;
     ALL_TWEETS_COUNT = 0;
     RETWEETED_COUNT = 0;
     FAVORITE_COUNT = 0;
     FOLLOWERS_COUNT = 0;
     FOLLOWING_COUNT = 0;
     ACTIVITY_FACTOR = 0;
     CELEBRITY_FACTOR = 0;
     IMPACT_FACTOR = 0;
     CELEBRITY_BUCKET = "";
     ACTIVITY_BUCKET = "";
     IMPACT_BUCKET = "";

    scorePullLoop(req, res);
   

}

var max_id = 0;
var stoploop = 0;
var ORIGINAL_TWEETS_COUNT = 0;
var ALL_TWEETS_COUNT = 0;
var RETWEETED_COUNT = 0;
var FAVORITE_COUNT = 0;
var FOLLOWERS_COUNT = 0;
var FOLLOWING_COUNT = 0;
var ACTIVITY_FACTOR = 0;
var CELEBRITY_FACTOR = 0;
var IMPACT_FACTOR = 0;
var CELEBRITY_BUCKET = "";
var ACTIVITY_BUCKET = "";
var IMPACT_BUCKET = "";

function scorePullLoop(req, res)
{

    if(req.session.oauth)
    {
            var twit = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
    });
    }




    var params;
    if(max_id == 0)
    params = {  "count":"200" };
    else
    params = { "max_id":max_id, "count":"200"};

    twit.getUserTimeline(params,function (err, data)
    {
            console.log("eror is "+err);


            var o_counter = 0;
            var last_obj;

            _.each(data, function(o)
            {

              var javascriptdate = parseTwitterDate(o.created_at);
              var d1 = moment(javascriptdate);
              var d2 = moment().subtract('days', 30);
              if(d1.isAfter(d2))
              {
                  o_counter++;
                  console.log("more tweets to come");                        
              }
              else
              {
                  stoploop =1;
                  console.log("all tweets fetched for 30 days.. breaking");

              }       
                  
            });


            var valid_tweets = _.first(data, o_counter);

            _.each(valid_tweets, function(o)
            {

              if(max_id == o.id_str)
              {
                  console.log("Ignoring matching max_id "+max_id);

              }
              else
              {
                  if(o.hasOwnProperty("retweeted_status"))
                  {
                    console.log("Retweed tweet found with "+o.retweet_count+" number of retweets ");
                  }
                  else
                  {
                    ORIGINAL_TWEETS_COUNT++;
                    RETWEETED_COUNT = RETWEETED_COUNT+ o.retweet_count;
                    FAVORITE_COUNT = FAVORITE_COUNT+o.favorite_count;
                  }

                  ALL_TWEETS_COUNT++;
                  FOLLOWERS_COUNT = o.user.followers_count;
                  FOLLOWING_COUNT = o.user.friends_count;

             }
            });

            console.log("o_counter is "+o_counter);
          
            if(stoploop == 0 )
            {

                              last_obj = _.last(data);
                              max_id = last_obj.id_str;
                              console.log("max_id is "+max_id);

                              scorePullLoop(req, res); 

            }
            else
            {


                           

                             calculateScores(function(err, o)
                             {
                             var scoredata = { user:req.session.user.name, followers:FOLLOWERS_COUNT, following:FOLLOWING_COUNT, cfactor:CELEBRITY_FACTOR, afactor:ACTIVITY_FACTOR, ifactor:IMPACT_FACTOR, cbucket:CELEBRITY_BUCKET, abucket:ACTIVITY_BUCKET, ibucket:IMPACT_BUCKET };
                             SM.addNewScoreRecord(scoredata, function(e)
                             {
                              if(e)
                              {

                              }
                              else
                              {


                              }

                               SM.getGlobalLeaderBoard( function(e, allscores)
                               {
                                  //res.render('print', { title : 'Account List', accts : accounts });
                                  res.render('score' , { leaderboard : allscores, dashdata: {planStatus:"active", planName:req.session.user.country, userName: req.session.user.name}, 
                                  score: {"followers":FOLLOWERS_COUNT , "following":FOLLOWING_COUNT, "alltweets":ALL_TWEETS_COUNT , "originaltweets":ORIGINAL_TWEETS_COUNT, "retweets":RETWEETED_COUNT, "favorites":FAVORITE_COUNT, "afactor":ACTIVITY_FACTOR, "ifactor":IMPACT_FACTOR, "cfactor":CELEBRITY_FACTOR, cbucket:CELEBRITY_BUCKET, abucket:ACTIVITY_BUCKET, ibucket:IMPACT_BUCKET}});


                                });




                             });

                            });
                            
                            // SM.findScore(function(o) { console.log("o is "+o)});

            }


    });

}



function calculateScores(callback)
{
    calculateAcitivityFactor();
    calculateCelebrityFactor();



    //Impact Factor!
    //Boundary condition
   if(FAVORITE_COUNT == 0) FAVORITE_COUNT =1;
   if(RETWEETED_COUNT == 0) RETWEETED_COUNT =1;

   var max_arr_var1;
   SM.getAllInfluentialScore( function(e, influencialscores)
   {
      var max_arr = _.max(influencialscores, function(o){return o.influence_var1;});
      console.log("max is "+max_arr.influence_var1);
      max_arr_var1 = max_arr.influence_var1;
      var var_1 = 0.2* log10(FAVORITE_COUNT) + 0.8*log10(RETWEETED_COUNT);
      IMPACT_FACTOR =  Math.round((10+var_1 - max_arr_var1) * 10);

   if(IMPACT_FACTOR >= 90 )  IMPACT_BUCKET = "Opinion Maker";
   if(IMPACT_FACTOR >= 80 && IMPACT_FACTOR < 90 )  IMPACT_BUCKET =  "Influential";
   if(IMPACT_FACTOR >= 70 && IMPACT_FACTOR < 80 )  IMPACT_BUCKET =  "Persuasive";
   if(IMPACT_FACTOR >= 60 && IMPACT_FACTOR < 70 )  IMPACT_BUCKET =  "Credible";
   if(IMPACT_FACTOR <= 50 && IMPACT_FACTOR < 60 )  IMPACT_BUCKET =  "Acceptable";
   if(IMPACT_FACTOR < 50 )  IMPACT_BUCKET =  "Honourable Mention";
   callback(null, "done");

   })
}


function calculateAcitivityFactor()
{
   ACTIVITY_FACTOR = Math.round(ALL_TWEETS_COUNT / 30 ) ; // 30 is no of days

   if(ACTIVITY_FACTOR >= 30 )  ACTIVITY_BUCKET = "Tireless Tweeter Bee";
   if(ACTIVITY_FACTOR >= 20 && ACTIVITY_FACTOR < 30 ) ACTIVITY_BUCKET =  "Spirited Tweeter";
   if(ACTIVITY_FACTOR >= 10 && ACTIVITY_FACTOR < 20 ) ACTIVITY_BUCKET =  "Active Tweeter";
   if(ACTIVITY_FACTOR >= 2 && ACTIVITY_FACTOR < 10 )  ACTIVITY_BUCKET =  "Breezy Tweeter";
   if(ACTIVITY_FACTOR <  2 )  ACTIVITY_BUCKET =  "Dormant Tweeter";

}


function log10(val) {
  return Math.log(val) / Math.LN10;
}


function calculateCelebrityFactor()
{

  //Boundary Condition
  if(FOLLOWERS_COUNT == 0) FOLLOWERS_COUNT =1;
 
  var celeb_threshold = 50000000;
  var var_1 = log10(celeb_threshold) - log10(FOLLOWERS_COUNT);
   console.log("followers count is "+FOLLOWERS_COUNT);

 console.log("var_1 is "+var_1);
  CELEBRITY_FACTOR = Math.round((10-var_1) * 10);
  if(CELEBRITY_FACTOR > 100)
  CELEBRITY_FACTOR =100;


   if(CELEBRITY_FACTOR >= 90 )  CELEBRITY_BUCKET = "Celebrity";
   if(CELEBRITY_FACTOR >= 80 && CELEBRITY_FACTOR < 90 )  CELEBRITY_BUCKET =  "Famous";
   if(CELEBRITY_FACTOR >= 70 && CELEBRITY_FACTOR < 80 )  CELEBRITY_BUCKET =  "Important";
   if(CELEBRITY_FACTOR >= 60 && CELEBRITY_FACTOR < 70 )  CELEBRITY_BUCKET =  "Reputable";
   if(CELEBRITY_FACTOR <   60 )  CELEBRITY_BUCKET =  "Honourable Mention";
   

}

function calculateImpactFactor()
{


}






function processRealtime(data)
{
                console.log("called once");
                if(data.event == "follow")
                {
                io.sockets.emit('followTwitt', data);
                console.log("someone is following you")
                }
                else
                if(data.event == "favorite")
                {
                io.sockets.emit('favTwitt', data);
                console.log("favorite tweet!")
                }
                else
                if(data.hasOwnProperty("direct_message"))
                {
                io.sockets.emit('directTwitt' , data)
                console.log("dm");
                }
                else
                {
                     io.sockets.emit('repTwitt', data);
                     console.log("emitted");
                }
}

function parseTwitterDate(aDate)
{ 
  console.log(aDate);
  return new Date(Date.parse(aDate.replace(/( \+)/, ' UTC$1')));
  //sample: Wed Mar 13 09:06:07 +0000 2013 
}

exports.downloadallreplies = function(req, res)
{
     var twit = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });

    var params = {  "count":"200" };
    

    twit.getMentions(params,function (err, data)
    {
       
        TM.storeReplies(data, function(o)
        {
            console.log(o);
            res.send(o);
        });

    });

}


exports.downloadallusertweets = function(req, res)
{

         var twit = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });

             var twit2 = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });

    var params = {  "count":"200" };


    twit.getUserTimeline(params,function (err, data)
    {

        var rep_ids = _.pluck(data, 'in_reply_to_status_id_str');
        console.log(rep_ids);
        twit2.getMentions(params,function (err, data)
        {

                for(d in data)
                { 
                    if(data[d].id_str!=null)
                    if(_.contains(rep_ids, data[d].id_str))
                    {
                        console.log("attended like  "+data[d].text);
                        TM.markAsAttended(data[d].id_str, function(o)
                        {

                        });
                    }
                    else
                    {
                        TM.markAsUnattended(data[d], function(o)
                        {

                        });

                      //  console.log("not attended");
                       // console.log(data[d].id_str+" is not found in "+rep_ids);
                    }
                    //if(data[d].id_str)
                }
       
                // TM.storeReplies(data, function(o)
                // {
                //     console.log(o);
                //     res.send(o);
                // });

        });



        TM.storeTweets(data, function(o)
        {
            console.log(o);
            res.send(o);
        });

    });
    


}


exports.setupunattendedtweets = function(req, res)
{

        var unique = req.session.oauth.access_token;
        unique = unique.substring(unique.length-8, unique.length);
     var twit = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });

             var twit2 = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });

              var twit3 = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });

        TM.setCollectionNames(unique,function(o){});


    var params = { "count":"200" };
    var params2 = { "count":"200"};

    twit.getUserTimeline(params,function (err, data)
    {


        //store tweets in db
        TM.storeTweets(data, function(o)
        {
                 //   console.log(o);
                    //res.send(o);
        });

        var rep_ids = _.pluck(data, 'in_reply_to_status_id_str');
       // console.log(rep_ids);
    

        twit2.getMentions(params2,function (err, data)
        {
                //store replies in db
                TM.storeReplies(data, function(o)
                {
                   // console.log(o);
                    //res.send(o);
                });



                var userids_concatenated = "";
                var c=0;

                _.each(data, function(obj)
                {
                     if(c<90)
                     userids_concatenated += obj.user.id_str+",";
                     c++;
                });


                userids_concatenated = userids_concatenated.substring(0, userids_concatenated.length - 1);
               // userids_concatenated += data[i].id_str+",";
                console.log("concatenated string is "+userids_concatenated);
                var par = userids_concatenated;
                //var par = ["443096220785860608","442674107490910208","436067326840950784"];
              //  var par = "443096220785860608,442674107490910208,436067326840950784";


                 var prioritylist = [];
                 var newuserslist = [];



                twit3.lookupFriendship( par , function( err, reldata)
                {

                  console.log("Par is "+par);
                  console.log("err is "+err);
                  console.log("data is "+data);

                  _.each(reldata, function(obj)
                  {


                    if(obj.connections.length > 0 )
                    {
                      for(var i=0; i<obj.connections.length; i++)
                      {
                        console.log(obj.connections[i]);
                        console.log("____________");

                        if(obj.connections[i] == "followed_by")
                        prioritylist.push(obj.id_str);

                        if(obj.connections[i] == "none")
                        newuserslist.push(obj.id_str);
                        
                      }
                    }


                     

                  });



                    for(d in data)
                    { 

                          if(_.contains(prioritylist, data[d].user.id_str))
                          {
                            data[d].priority =1;
                            TM.isDismissed(data[d].id_str, "priority", function(ooo)
                            {
                              if(ooo)
                              { 
                                TM.markAsPriority(data[d], function(o)
                                {

                                });
                              }

                            });
                          }

                          if(_.contains(newuserslist, data[d].user.id_str))
                          {
                            data[d].newuser =1;
                            TM.isDismissed(data[d].id_str, "new", function(ooo)
                            {
                              if(ooo)
                              { 
                                    TM.markAsNewUser(data[d], function(o)
                                    {
                                    });
                              }

                            });
                          }


                        if(data[d].id_str!=null)
                        if(_.contains(rep_ids, data[d].id_str))
                        {
                            console.log("attended like  "+data[d].text);
                            console.log("priority is "+data[d].priority);
                            TM.markAsAttended(data[d].id_str, function(o)
                            {

                            });
                        }
                        else
                        {

                            TM.isDismissed(data[d].id_str, "all", function(ooo)
                            {
                              if(ooo) 
                              {
                                                            TM.markAsUnattended(data[d], function(o)
                                                            {


                                                            });

                              }

                            });

                          //  console.log("not attended");
                           // console.log(data[d].id_str+" is not found in "+rep_ids);
                        }
                        //if(data[d].id_str)
                    }






                    res.send({status:"success"});



                });






               

        });


    });

}



exports.getnextunattendedtweets = function(req, res)
{

    TM.getNextUnattended(req.query.time, function(o)
    {

                   // console.log(o);
                    res.send(o);
    });
}


exports.getnextprioritytweets = function(req, res)
{

    TM.getNextPriority(req.query.time, function(o)
    {

                   // console.log(o);
                    res.send(o);
    });
}

exports.getnextnewusertweets = function(req, res)
{

    TM.getNextNewUsers(req.query.time, function(o)
    {

                   // console.log(o);
                    res.send(o);
    });
}





exports.getnewreplies = function(req, res)
{


    TM.getNextSetReplies(req.query.time, function(o)
    {

       // console.log(o);
        res.send(o);


    });

}


exports.realdms = function(req, res)
{
     if(req.session.oauth)
      {
            var twit = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });

    twit.getDirectMessages('', function(err,data)
     {
        if (err) res.send(err, 500)
        else res.send(data)
     });
    }


};

exports.realfavorites = function(req, res)
{

};

exports.realfollowers = function(req, res)
{
     if(req.session.oauth)
      {
            var twit = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });

    twit.getFollowers('', function(err,data)
     {
        if (err) res.send(err, 500)
        else res.send(data)
     });
    }

};

exports.realrts = function(req, res)
{
    if(req.session.oauth)
      {
            var twit = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });

    twit.getRetweetsOfMe('', function(err,data)
     {
        if (err) res.send(err, 500)
        else res.send(data)
     });
    }

};

exports.posttweet =  function(req, res)
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
                        consumer_key: CONSUMER_KEY,
                        consumer_secret: CONSUMER_SECRET,
                        access_token_key: req.session.oauth.access_token,
                        access_token_secret: req.session.oauth.access_token_secret
                    });

    // res.send("success");

     twit

            .updateStatus(name+" "+message, { in_reply_to_status_id: replytoid }, function (err, twtdata)
             {
                 if (err) res.send(err, 500);
                 else 
                 {
                 
                  TM.updateReplyCounter(req.session.user,function(err, data)
                  {
                    if(data) 
                        { 
                            console.log("counter incremented "+data.replycounter);
                             twtdata.replycounter = data.replycounter;
                             res.send(twtdata); 

                        };

                  });
                 }
             });


}


