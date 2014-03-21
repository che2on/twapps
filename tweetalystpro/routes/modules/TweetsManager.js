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
var unattendedcollection = DB.get('unattended');
var prioritycollection = DB.get('priority');
var newusertweetscollection = DB.get('newusers');
var dismisscollection = DB.get('dismiss');
var _ = require('underscore')._;


/* establish the database connection */
var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
  db.open(function(e, d){
  if (e) {
    console.log(e);
  } else{
    console.log('connected to database :: ' + dbName);
  }
});
var accounts = db.collection('accounts');
var _refdismisscollection = db.collection('dismiss');
var ignored_all_collection = DB.get('ignored_all');
var ignored_priority_collection = DB.get('ignored_priority');
var ignored_new_collection = DB.get('ignored_new');


exports.setCollectionNames = function(unique, callback)
{
  collection =DB.get(unique+'replies');
  tweetscollection = DB.get(unique+'tweets');
  unattendedcollection = DB.get(unique+'unattended_testing');
  prioritycollection = DB.get(unique+'priority');
  newusertweetscollection = DB.get(unique+'newusers');
  _refdismisscollection = db.collection(unique+'dismiss');
  dismisscollection = DB.get(unique+'dismiss');
  var _refdismisscollection = db.collection('dismiss');
  ignored_all_collection = DB.get(unique+'ignored_all');
  ignored_priority_collection = DB.get(unique+'ignored_priority');
  ignored_new_collection = DB.get(unique+'ignored_new');
  callback({status:"success"});
}


exports.updateReplyCounter = function(newData, callback)
{
  accounts.findOne({user:newData.user}, function(e, o){
      o.replycounter = o.replycounter+1;
      accounts.save(o, {safe: true}, function(err) {
        if (err) callback(err);
        else callback(null, o);
      });
   
  });
}

exports.getReplyCounter = function(newData, callback)
{
  accounts.findOne({user:newData.user}, function(e,o) {
    

  })
}


exports.isDismissed = function(id, sec, callback)
{


  if(sec=="all")
  ignored_all_collection.findOne({ id_str: id }, function (err,doc) { callback(doc)});

  if(sec=="priority")
  ignored_priority_collection.findOne({ id_str: id }, function (err,doc) { callback(doc)});

  if(sec=="new")
  ignored_new_collection.findOne({ id_str: id }, function (err,doc) { callback(doc)});


}

exports.updatePlan = function(newData, planname, callback)
{
    accounts.findOne({user:newData.user}, function(e, o){
      o.country = newData.country;
      accounts.save(o, {safe: true}, function(err) {
        if (err) callback(err);
        else callback(null, o);
      });
   
  });


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


function getAllDismissed(callback)
{
  dismisscollection.find({},function(err, docs)
  {
    callback(docs);

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

      var senddata = [];

      if(err)
      {
            console.log("its over");
            callback(null);
      }
      else
      {
         // console.log(docs);
          for(var a in docs)
          {
            console.log("wow"); 
          }

           callback(docs);

      }
    
  });
}


exports.getNextPriority = function(_time, callback)
{
  
  var options = {
    "limit": 10,
    "sort": {"time":-1}
  }

  console.log("rec.. "+_time);
  
  prioritycollection.find( {time: {"$lt": _time}}, options, function(err,docs) 
  {

      if(err)
      {
            console.log("its over");
            callback(null);
      }
      else
      {
         // console.log(docs);
          for(var a in docs)
          {
            console.log("wow");
            
          }
          callback(docs);
      }
    
  });
}


exports.getNextNewUsers = function(_time, callback)
{
  
  var options = {
    "limit": 10,
    "sort": {"time":-1}
  }

  console.log("rec.. "+_time);
  
  newusertweetscollection.find( {time: {"$lt": _time}}, options, function(err,docs) 
  {

      if(err)
      {
            console.log("its over");
            callback(null);
      }
      else
      {
         // console.log(docs);
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


exports.markAsAttended_priority = function(tweetid, callback)
{

  prioritycollection.ensureIndex( {"id_str":1}, {unique: true} );
  var query = { id_str:tweetid};
  prioritycollection.remove(query, function(err, doc)
    {

      if(err) { console.log("Couldn't removed"); callback(null);}
      else { console.log("remove"); callback(doc);}


    });

}


exports.markAsAttended_new = function(tweetid, callback)
{

  newusertweetscollection.ensureIndex( {"id_str":1}, {unique: true} );
  var query = { id_str:tweetid};
  newusertweetscollection.remove(query, function(err, doc)
    {

      if(err) { console.log("Couldn't removed"); callback(null);}
      else { console.log("remove"); callback(doc);}


    });

}






exports.markAsDismissed = function(tweetid, sec,  callback)
{


  if(sec=="all")
  {
  ignored_all_collection.ensureIndex({"id_str":1}, {unique: true});
  ignored_all_collection.insert({"id_str":tweetid}, function (err, doc) 
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
  else if(sec=="priority")
  {
      ignored_priority_collection.ensureIndex({"id_str":1}, {unique: true});
      ignored_priority_collection.insert({"id_str":tweetid}, function (err, doc) 
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
  else if(sec=="new")
  {
          ignored_new_collection.ensureIndex({"id_str":1}, {unique: true});
          ignored_new_collection.insert({"id_str":tweetid}, function (err, doc) 
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

exports.markAsPriority = function(data, callback)
{

    data.time = +new Date(data.created_at);
    data.time = ""+data.time;
    prioritycollection.ensureIndex( {"id_str":1}, {unique: true} );
    prioritycollection.insert(data, function (err, doc) 
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


exports.markAsNewUser = function(data, callback)
{

    data.time = +new Date(data.created_at);
    data.time = ""+data.time;
    newusertweetscollection.ensureIndex( {"id_str":1}, {unique: true} );
    newusertweetscollection.insert(data, function (err, doc) 
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