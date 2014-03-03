var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'protes';


var mongo = require('mongodb');
var MONK = require('monk');
var DB = MONK('localhost:27017/protes');
var collection = DB.get('replies');
var tweetscollection = DB.get('tweets');
var unattendedcollection = DB.get('unattended')

/* establish the database connection */


exports.setCollectionNames = function(unique, callback)
{
  collection =DB.get(unique+'replies');
  tweetscollection = DB.get(unique+'tweets');
  unattendedcollection = DB.get(unique+'unattended');
  callback({status:"success"});
}


exports.getNextSetReplies = function(_time, callback)
{
	
  var options = {
    "limit": 20,
    "sort": {"time":-1}
  }

  console.log("rec.. "+_time);

  collection.find( {time: {"$lt": _time}}, options, function(err,docs) 
  {

  	  if(err)
  	  {
  	  		  console.log("its over");
  	  		  callback(null);
  	  }
  	  else
  	  {
		      console.log(docs);
		      for(var a in docs)
		      {
		        console.log("wow");
		        
		      }
		      callback(docs);
  	  }
    
  });
}



exports.getNextUnattended = function(_time, callback)
{
  
  var options = {
    "limit": 10,
    "sort": {"time":-1}
  }

  console.log("rec.. "+_time);
  
  unattendedcollection.find( {time: {"$lt": _time}}, options, function(err,docs) 
  {

      if(err)
      {
            console.log("its over");
            callback(null);
      }
      else
      {
          console.log(docs);
          for(var a in docs)
          {
            console.log("wow");
            
          }
          callback(docs);
      }
    
  });
}

exports.isRepliesCollectionEmpty = function(callback)
{
  collection.find({}, {"limit":1,"sort":{"time":-1}}, function(err, docs)
  {
    if(docs.length==0) callback(null)
    else callback(docs);
  });
}


exports.isTweetsCollectionEmpty = function(callback)
{
  tweetscollection.find({}, {"limit":1,"sort":{"time":-1}}, function(err, docs)
  {
    if(docs.length==0) callback(null)
    else callback(docs);
  });
}



exports.storeReplies = function(data, callback)
{

  collection.ensureIndex( { "id_str": 1 }, { unique: true } );
  for(d in data)
  {
  data[d].time = +new Date(data[d].created_at);
  data[d].time = ""+data[d].time;
 }
  collection.insert(data, function (err, doc) 
                       {
                         if (err) {

                              callback(null);
                                // If it failed, return error
                                 //  res.send("There was a problem adding the information to the database.");
                            }
                        else {

                            callback("success inserting");

                        }
                      });
                // If it worked, set t
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

exports.markAsAttended = function(tweetid, callback)
{

  unattendedcollection.ensureIndex( {"id_str":1}, {unique: true} );
  var query = { id_str:tweetid};
  unattendedcollection.remove(query, function(err, doc)
    {

      if(err) { console.log("Couldn't removed"); callback(null);}
      else { console.log("remove"); callback(doc);}

    });


}

exports.markAsUnattended = function(data, callback)
{

    data.time = +new Date(data.created_at);
    data.time = ""+data.time;
    unattendedcollection.ensureIndex( {"id_str":1}, {unique: true} );
    unattendedcollection.insert(data, function (err, doc) 
                       {
                         if (err) {

                              callback(null);
                                // If it failed, return error
                                 //  res.send("There was a problem adding the information to the database.");
                            }
                        else {

                            callback("success inserting");

                        }
                      });

}