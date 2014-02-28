/*
 * GET home page.
 */
var AM = require('./modules/sharedLogin');
var CONSUMER_KEY = "sEORAkR5366d5o9wTfMtmQ";
var CONSUMER_SECRET = "xwlDEXXpim7yEK69KtRo0C4zh5TR3sQCjBOaCEfwpcQ";
var SCREEN_NAME = "";
var mongo = require('mongodb');
var monk  = require('monk');
var db = monk('localhost:27017/protes');
var collection; // = db.get('collection');


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

                console.log(err, data);
                SCREEN_NAME = data.screen_name;
                collection = db.get(SCREEN_NAME);
                if (err) res.send(err, 500)
                else res.send(data)
            });
        }
            
}
exports.index = function (req, res)
 {
    req.session.destroy();
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
    collection = db.get(req.query.screen_name);
    collection.find( {}, function(err,docs) 
    {
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


                  res.send(default_templates);

        });


      }
      else
      {
        res.send(result);
      }
     
     // console.log("pushed");
     // res.redirect("/timegraph");
    
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


exports.dashboard = function ( req, res) 
{

   // if(req.query.route=="redirect") { console.log( "it is redirected "); io = require('socket.io').listen(3001, {log: false}); };

    res.render('dashboard' , {});
  //  if (req.session.oauth) 


}



exports.openstreams = function (req, res) 
{

        {
        var twit = new twitter({
            consumer_key: CONSUMER_KEY,
            consumer_secret: CONSUMER_SECRET,
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });

        // twit
        //     .verifyCredentials(function (err, data) {
        //         console.log(err, data);
        //         SCREEN_NAME = data.screen_name;
        //     });
            


        // twit.stream(
        //     'statuses/filter',
        //     {track: ['vodafoneIN', 'vodafone india', 'vodafone karnataka', 'vodafone', ]},
        //     function (stream)
        //      {
        //         console.log("stream is"+stream);

        //         stream.on('data', function (data) {
        //             //console.log(data);
        //             //console.log(data.user.screen_name + " : " + data.text);
        //             io.sockets.emit('newTwitt', data);
        //             // throw  new Exception('end');
        //         });
        //     }
        // );


        var count = 0;

       // io.sockets.clients().forEach(function (socket) { console.log("socket found!!!!!! "); socket.destroy });

        twit

            .stream('user',{}, 
            function (stream) 
            {

               // twit.currentTwitStream = stream;
                //stream.destroy;
                stream.on('data', function (data)
                 {

                     count++;
                     console.log("stream number is "+count);

                    //console.log(data);
                    //console.log(data.user.screen_name + " : " + data.text);
                    processRealtime(data);
                    if(data.hasOwnProperty("entities"))
                    if(data.entities.hasOwnProperty("user_mentions"))
                    {
                    console.log("data.entities.user_mentions.screen_name "+data.entities.user_mentions);
                //    console.log("no 1... is "+data.entities.user_mentions[0].screen_name);
                   // console.log("no 1... is "+)

                    var found = 0;
                    console.log("actual screen name is "+SCREEN_NAME);

                    for(var i=0; i<data.entities.user_mentions.length; i++)
                    {
                        console.log("mentioned name is "+data.entities.user_mentions[i].screen_name);
                        if(data.entities.user_mentions[i].screen_name == SCREEN_NAME)
                        found=1;
                      
                    }

                    if(found==1) io.sockets.emit('newTwitt', data);

                    }

                     io.sockets.clients().forEach(function (socket) { console.log("socket found!!!!!! ") }); //socket.destroy });
                    // throw  new Exception('end');
                });

                  stream.on('end', function (response) {
    // Handle a disconnection
  });
  stream.on('destroy', function (response) {
    // Handle a 'silent' disconnection from Twitter, no end/error event fired
  });


        //setTimeout(stream.destroy, 55000);

            }
            );


        // twit
        //     .getMentions('', function(err, data)
        //  {
        //     console.log(err);
        //     console.log(data);
        //     console.log("inside mentions");
        //     for(var key in data)
        //     {
        //                         console.log(data[key]+"data...........................");
        //                         var attrName = key;
        //                         var attrValue = data[key];
        //                         info = { "text":attrValue.text , user:{"screen_name":attrValue.user.screen_name} };
        //                         io.sockets.emit('newTwitt', info); //rest
        //                       //  console.log(attrValue);

        //     }
        // });
    }


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
     if (req.cookies.u == undefined || req.cookies.p == undefined){

            console.log("You are not an authenticated user");
           // res.render('login', { title: 'Hello - Please Login To Your Account' });
        }   else{
                console.log("user is "+req.cookies.u);
    // attempt automatic login //
            AM.autoLogin(req.cookies.u, req.cookies.p, function(o){
                if (o != null){
                    req.session.user = o;
                    console.log("You are the man.. here is proof "+o.email);
                   // res.redirect('/home');
                }   else{
                    console.log("Good try .. didnt work! ");
                    //res.render('login', { title: 'Hello - Please Login To Your Account' });
                }
            });
        }

   // console.log("session is "+req.session.user);
    {
        res.render('splash' , {});
    }
};


exports.logout = function(req, res) {

    res.clearCookie('u', { path:'/', domain:'.tweetaly.st'});
    res.clearCookie('p', { path:'/', domain:'.tweetaly.st'});
    req.session.destroy();
    res.redirect('/');
};


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


