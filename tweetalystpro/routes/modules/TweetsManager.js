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

/* establish the database connection */


exports.getNextSetReplies = function(last_created_at, callback)
{
	
  var options = {
    "limit": 20,
    "sort": {"created_at":-1}
  }

  collection.find( {created_at: {$lt: last_created_at}}, options, function(err,docs) 
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

exports.storeReplies = function(data, callback)
{

  collection.ensureIndex( { "id_str": 1 }, { unique: true } );
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