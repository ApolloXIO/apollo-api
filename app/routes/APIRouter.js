var express = require('express');
var router = express.Router();
var request = require('request');

var Users = require('../models/Users');
var Groups = require('../models/Groups');
var Messages = require('../models/Messages');

var contextML = require('../modules/contextML');
var Auth = require('../config/auth');

router.get('/', function (req, res) {
	res.send('You Made It!');
});

router.use(function (req, res, next) {
	if(req.query.token && req.query.fbid) {
		var FB_URL = "https://graph.facebook.com/me?";
		request.get(FB_URL + 'access_token=' + req.query.token, function (error, response, body) {
			if(error) {
				res.send({ status : 500, err : err});
			}
			var responseData = JSON.parse(body);
			if(responseData.id != req.query.fbid) {
				res.send({ status : 400, err : "Not Authorized"});
			}
			Users.count({ 'facebook.id' : responseData.id }, function(err, count) {
				if(error) {
					res.send({ status : 500, err : err}); return;
				}
				console.log(count);
				if(count == 1) {
					next();
					return;
				} else {
					var user = new Users();
						user.fname = responseData.first_name;
						user.lname = responseData.last_name;
						user.facebook.id = responseData.id;

					user.save(function (err) {
						if(err) {
							res.send({ status : 500, err : err}); return;
						}
						next();
						return;
					});
				}
			});
		});
	} else {
		res.send({ status : 400, err : "No Access Token or User ID Passed"});
	}
});
// ===========
// User Routes
// ===========
router.route('/users')
	.get(function (req, res) {
		Users.find({}, 'fname lname email', function(err, users) {
			if(err) { 
				res.send({ status : 500, err : err });
			}
			res.json({ status : 200, response : users });
		});
	});

router.route('/user/:user_id')
	.get(function(req, res) {
		Users.findById(req.params.user_id, 'fname lname email', function(err, user) {
			if(err) { 
				res.send({ status : 500, err : err });
			}
			res.json({ status : 200, response : user });
		});
	});

// ===========
// ME ENDPOINT
// ===========

router.route('/me')
	.get(function(req, res) {
		Users.findById(req.body.user_id)
			.exec(function(err, me){
				if(err) {
					res.send({ status : 500, err : err });
				}
				res.json({ status : 200, response : me });
			});
	});

// ============
// Group Routes
// ============

router.route('/groups/create')
	.post(function(req, res) {
		var group = new Group();
			group.name = req.body.name;
			group.users = [];
			group.users.push(req.body.user_id);
			group.loc = req.body.loc;

		group.save(function(err) {
			if(err) {
				res.send({ status : 500, err : err });
			}
			res.json({ status : 200, response : group, msg : "New Group Created" });
		})
	});

router.route('/group/:group_id')
	.get(function(req, res) {
		Groups.findById(req.params.group_id)
			.populate('users', '_id fname lname email')
			.exec(function(err, group) {
				if(err) {
					res.send({ status : 500, err : err });
				}
				res.json({ status : 200, response : group });
			});
	});

router.route('/group/:group_id/add')
	.put(function(req, res) {
		Groups.findById(req.params.group_id)
			.populate('users', '_id fname lname email')
			.exec(function(err, group) {
				if(err) {
					res.send({ status : 500, err : err });
				}
				group.users.push(req.body.user_id);
				group.save(function(err) {
					if(err) {
						res.send({ status : 500, err : err });
					}
					res.json({ status : 200, response : group, msg : "New User Added" });
				})
			});
	});


// ===============
// Messages Routes
// ===============

router.route('/messages/:group_id/create')
	.post(function(req, res) {
		var newMsg = new Messages();
			newMsg.msg = req.body.msg;
			newMsg.priority = req.body.priority || 2;
			newMsg.groupID = req.params.group_id;
			newMsg.fromUserID = req.body.user_id;
			newMsg.tags = req.body.tags;
			newMsg.locs = req.body.locs;
			newMsg.dateCreated = Date.now();
			newMsg.state = false;

		newMsg.save(function(err) {
			if(err) {
				res.send({ status : 500, err : err });
			} else {
				res.json({ status : 200, response : newMsg });
			}
		})
	});

router.route('/messages/:group_id')
	.get(function(req, res) {
		Messages.find({ groupID : req.params.group_id, state : false })
			.populate('groupID')
			.populate('fromUserID', 'fname lname _id email')
			.exec(function(err, msgs) {
				if(err) {
					res.send({ status : 500, err : err });
				}
				res.json({ status : 200, response : msgs });
			});
	});

router.route('/messages/archive/:group_id')
	.get(function(req, res) {
		Messages.find({ groupID : req.params.group_id, state : true })
			.populate('groupID')
			.populate('fromUserID', 'fname lname _id email')
			.exec(function(err, msgs) {
				if(err) {
					res.send({ status : 500, err : err });
				}
				res.json({ status : 200, response : msgs });
			});
	});

router.route('/message/:msg_id')
	.get(function(req, res) {
		Messages.findById(req.params.msg_id)
			.populate('groupID')
			.populate('fromUserID', 'fname lname _id email')
			.exec(function(err, msg){
				if(err) {
					res.send({ status : 500, err : err});
				}
				res.json({ status : 200, response : msg });
			});
	});

router.route('/message/:msg_id/complete')
	.put(function(req, res) {
		Messages.findById(req.params.msg_id, function(err, msg){
			if(err) {
				res.send({ status : 500, err : err});
			}
			msg.state = true;
			msg.dateFinished = Date.now();

			msg.save(function(err) {
				if(err) {
					res.send({ status : 500, err : err});
				}
				res.json({ status : 200, response : msg, msg : "Task Completed" });
			})
		});
	});

// ================
// ContextML Routes
// ================
// ?msg=milk
router.route('/contextml/tags')
	.get(function(req, res) {
		var message = req.param('msg');
		if(!message) {
			res.send({ status : 204, err : "No Content" });
		}
		contextML.getTags(message, function(err, tag) {
			if(err) {
				res.send({ status : 500, err : err });
			}
			res.json({ status : 200, response : tag });
		});
	})
	.put(function(req, res) {
		var message = req.body.msg;
		var tag = req.body.tag;
		contextML.trainClassifier(message, tag, function (err) {
			if(err) {
				res.send({ status : 500, err :err});
			}
			res.json({ status : 200, response : "Trained with new data" });
		})
	});

module.exports = router;