var express = require('express');
var app = express();

app
.use(express.vhost('accounts.tweetaly.st', require('./node-login/app.js').app))
.use(express.vhost('tweetaly.st', require('./tweetalystpro/app.js').app))

.listen(80);
