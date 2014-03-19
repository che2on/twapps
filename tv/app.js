/**
 * Module dependencies.
 */

var express = require('express');


var app = express();
exports.app = app;
var httpProxy = require('http-proxy');
var apiProxy = httpProxy.createProxyServer();


app.get("/*", function(req, res, next){ 
  console.log("proxy starts")  ;
  apiProxy.web(req, res, { target: 'http://tv.tweetaly.st:2368' });
  console.log("proxy ends")  ;
});
app.post("/*", function(req, res, next){ 
  apiProxy.web(req, res, { target: 'http://tv.tweetaly.st:2368' });
});
app.delete("/*", function(req, res, next){ 
  apiProxy.web(req, res, { target: 'http://tv.tweetaly.st:2368' });
});
app.put('/*', function(req, res, next) {
        apiProxy.web(req, res, { target: 'http://tv.tweetaly.st:2368'});
    });

app.use(express.urlencoded());
app.use(express.json());
