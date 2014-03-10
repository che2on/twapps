var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'protes';

/* establish the database connection */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
	db.open(function(e, d){
	if (e) {
		console.log(e);
	}	else{
		console.log('connected to database :: ' + dbName);
	}
});
var accounts = db.collection('accounts');
var adminaccounts = db.collection('adminaccounts');

/* login validation methods */

exports.autoLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o){
			o.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}

exports.findExpiry = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e,o){
		if(o)
		{
			//moment().isAfter();

			var d1 = moment(o.expirydate, "MMMM Do YYYY, h:mm:ss a")
			var d2 = moment();
			if(d2.isAfter(d1))
			{
				console.log("Expired");
				callback('expired');
			}
			else
			{
				console.log("Not expired");
				callback("active")
			}
			
		
		}
	});
}


exports.updateExpiry = function(newData, callback)
{

		accounts.findOne({user:newData.user}, function(e, o){
		var expdate = moment().add('days', 30);
		o.expirydate =  moment(expdate).format("MMMM Do YYYY, h:mm:ss a");
		accounts.save(o, {safe: true}, function(err) {
					if (err) callback(err);
					else callback(null, o);
				});
			
	});


}
