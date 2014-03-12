var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'protes';


var mongo = require('mongodb');
var MONK = require('monk');
var DB = MONK('localhost:27017/protes');

var tweetscollection;
var scoreboardcollection;
var tweetscollection_orth;
var scoreboardcollection_orth;



/* establish the database connection */
var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
  db.open(function(e, d){
  if (e) {
    console.log(e);
  } else{
    console.log('connected to database :: ' + dbName);
  }
});
var score = db.collection('accounts');


exports.setCollectionNames = function(unique, callback)
{
  tweetscollection = DB.get(unique+'_score_tweets');
  scoreboardcollection = DB.get(unique+'_score_board');
  tweetscollection_orth = db.collection(unique+'_score_tweets');
  scoreboardcollection_orth = db.collection(unique+'_score_board');
  callback({status:"success"});
}

exports.storeTweets = function(data, callback)
{

  tweetscollection.ensureIndex( { "id_str": 1 }, { unique: true } );
  for(d in data)
  {
  data[d].time = +new Date(data[d].created_at);
  data[d].time = ""+data[d].time;
  }
  tweetscollection.insert(data, function (err, doc) 
                        {
                         if (err) {

                              callback(null);
                                // If it failed, return error
                                 //  res.send("There was a problem adding the information to the database.");
                            }
                        else {

                            callback("success inserting all tweets");

                        }
                      });

}


exports.findScore = function(callback)
{


	tweetscollection_orth.aggregate([ { 
    $group: { 
        _id: null, 
        total_retweet_count: { 
            $sum: "$retweet_count" 
        } ,
        total_favorite_count: {
        	$sum: "$user.favourites_count"
        },

        total_statuses_count: {
        	$sum: "$user.statuses_count"
        }

    } 
} ], function(e,o)
{
	console.log(o);
} )

}