var mongo = require('mongodb');
var MONK = require('monk');
var DB = MONK('localhost:27017/protes');
var planscollection = DB.get('plans');


exports.setCollectionNames = function(unique, callback)
{
  planscollection = DB.get(unique+'plans');
  callback({status:"success"});
}


exports.configplans = function()
{
	var gold_plan =  	{				
							"plan":"Gold Package",
							"templates":10,
							"max_reply_count":3000,
						};


	var silver_plan =	{
							"plan":"Silver Package",
							"templates":5,
							"max_reply_count":1500,

						};
    var bronze_plan =		{
							"plan":"Bronze Package",
							"templates":2,
							"max_reply_count":500,
						};

	var free_plan = 	{
							"plan":"Free Package",
							"templates":1,
							"max_reply_count":200,

						};

	planscollection.ensureIndex( { "plan": 1 }, { unique: true } );
	planscollection.insert(gold_plan,function (err, doc) 
	{

	});
	planscollection.insert(silver_plan,function (err, doc)
	{

	});
	planscollection.insert(bronze_plan,function (err, doc)
	{

	});

	planscollection.insert(free_plan,function (err, doc)
	{

	});

}

exports.gettemplatelimit = function(userplan, callback)
{
	console.log("userplan is "+userplan);
	planscollection.findOne({"plan":userplan},{templates:1}, function(err, doc)
	{
		if(!err)
		{
			console.log(doc);
			console.log(doc.templates);
			callback(doc.templates);

		}
		

	});

};

exports.getreplycountlimit = function(userplan, callback)
{
	console.log("userplan is "+userplan);
	planscollection.findOne({"plan":userplan},{max_reply_count:1}, function(err, doc)
	{
		if(!err)
		{
			console.log(doc);
			console.log(doc.max_reply_count);
			callback(doc.max_reply_count);

		}
		

	});

}