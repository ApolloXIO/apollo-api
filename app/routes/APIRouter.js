var express = require('express');
var router = express.Router();

var Users = require('../models/Users');
var Groups = require('../models/Groups');
var Messages = require('../models/Messages');

router.get('/', function (req, res) {
	res.send('You Made It!');
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
		var tags = req.body.tags;

		var newMsg = new Messages();
			newMsg.msg = req.body.msg;
			newMsg.priority = req.body.priority || 2;
			newMsg.groupID = req.params.group_id;
			newMsg.fromUserID = req.body.user_id;
			newMsg.tags = tags.split(",");
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

module.exports = router;