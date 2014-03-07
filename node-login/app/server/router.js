
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');

module.exports = function(app) {

// main login page //

	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/home');
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			    req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, {domain:'.tweetaly.st' , maxAge: 900000});
					res.cookie('pass', o.pass, {domain:'.tweetaly.st' , maxAge: 900000});
				}
				// share these cookie values
					res.cookie('u', o.user, {domain:'.tweetaly.st' , maxAge: 900000});
					res.cookie('p', o.pass, {domain:'.tweetaly.st' , maxAge: 900000});

				res.send(o, 200);
			}
		});
	});
	
// logged-in user homepage //
	
	app.get('/home', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/');
	    }   else
	    	{
			// res.render('home', {
			// 	title : 'Control Panel',
			// 	countries : CT,
			// 	udata : req.session.user
			// });
				res.redirect("http://tweetaly.st/pro")
	    }
	});
	
	app.post('/home', function(req, res){
		if (req.param('user') != undefined) {
			AM.updateAccount({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, {domain:'.tweetaly.st' , maxAge: 900000});
						res.cookie('pass', o.pass, {domain:'.tweetaly.st' , maxAge: 900000});	
					}
					res.send('ok', 200);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('user',{ path:'/', domain:'.tweetaly.st'});
			res.clearCookie('pass',{ path:'/', domain:'.tweetaly.st'});
			res.clearCookie('u', { path:'/', domain:'.tweetaly.st'});
   			res.clearCookie('p', { path:'/', domain:'.tweetaly.st'});
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) 
	{
		console.log("ref id is "+req.session.referral);

		if(req.query.pack == "bronze")
		res.render('signup', {  title: 'Signup', countries : [{short:"BP" , name:"Bronze Package"} ]});
		else if(req.query.pack == "silver")
		res.render('signup', { title: 'Signup', countries : [{short:"SP" , name:"Silver Package"} ]});
		else if(req.query.pack == "gold")
		res.render('signup', { title: 'Signup', countries : [{short:"GP" , name:"Gold Package"} ]});
	    else
	    res.render('signup', { title: 'Signup', countries : CT });
	});


	app.get('/plans', function(req, res)
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
        	console.log(req.session.referral);
        	req.session.save();
    	}

		res.render('plans', { title: 'Hello - Here are the available plans' });
	})
	
	app.post('/signup', function(req, res)
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
								name 	: req.param('name'),
								email 	: req.param('email'),
								user 	: req.param('user'),
								pass	: req.param('pass'),
								country : req.param('country'),
								useragent: req.headers["user-agent"],
								replycounter:0,
								referral: referralName,
								affiliate: affiliateName,
								referralid: req.session.referral.id,
								affiliateid: req.session.affiliate.id
							}, function(e){
								if (e){
									res.send(e, 400);
								}	else{
									res.send('ok', 200);
								}
							});





				});


		});


		


	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/admin', function(req, res) 
	{

		if(!req.session.hasOwnProperty("user")){ res.render('404', { title: 'Page Not Found'}); }
		else
		{
		AM.getAdminAccountByEmail(req.session.user.email, function(o){
			if (o)
			{
				AM.getAllRecords( function(e, accounts){
				res.render('print', { title : 'Account List', accts : accounts });
			})
			}
			else
			{
				res.render('404', { title: 'Page Not Found'});
				//res.render('print', { title : 'Access Denied', accts: {name:"" , country:"", user: "", date:"", useragent:"", replycounter:""}});
			}
		});
	    }

	});

	app.get('/admin/affiliates', function(req, res) 
	{

		if(!req.session.hasOwnProperty("user")){ res.render('404', { title: 'Page Not Found'}); }
		else
		{
		AM.getAdminAccountByEmail(req.session.user.email, function(o){
			if (o)
			{
				AM.getAllAffiliateRecords( function(e, accounts){
				res.render('affiliatesprint', { title : 'Affilates List', accts : accounts });
			})
			}
			else
			{
				res.render('404', { title: 'Page Not Found'});
				//res.render('print', { title : 'Access Denied', accts: {name:"" , country:"", user: "", date:"", useragent:"", replycounter:""}});
			}
		});
	    }

	});


	app.get('/admin/affiliates/signup', function(req, res) 
	{

	    res.render('affiliatessignup', { title: 'Signup', countries : CT });
	});


	app.get('/admin/referrals/signup', function(req, res) 
	{

	    res.render('referralsignup', { title: 'Signup', countries : CT });
	});


	app.post('/admin/affiliates/signup', function(req, res){
		AM.addNewAffiliateAccount({
			name 	: req.param('name'),
			organization 	: req.param('organization'),
			code 	: req.param('code')
		}, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});

	 app.post('/admin/referrals/signup', function(req, res){
		AM.addNewReferralAccount({
			name 	: req.param('name'),
			organization 	: req.param('organization'),
			code 	: req.param('code')
		}, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});


	app.get('/admin/referrals', function(req, res) 
	{

		if(!req.session.hasOwnProperty("user")){ res.render('404', { title: 'Page Not Found'}); }
		else
		{
		AM.getAdminAccountByEmail(req.session.user.email, function(o){
			if (o)
			{
				AM.getAllReferralRecords( function(e, accounts){
				res.render('referralsprint', { title : 'Referrals List', accts : accounts });
			})
			}
			else
			{
				res.render('404', { title: 'Page Not Found'});
				//res.render('print', { title : 'Access Denied', accts: {name:"" , country:"", user: "", date:"", useragent:"", replycounter:""}});
			}
		});
	    }

	});





	
	app.post('/delete', function(req, res){


		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};