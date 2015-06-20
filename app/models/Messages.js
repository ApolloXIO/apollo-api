var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
	msg : { type : String, required : true },
	priority : { type : Number, required : true, default : 2 },
	houseID : { type : Schema.Types.ObjectId, ref: 'Groups', required : true },
	fromUserID : { type : Schema.Types.ObjectId, ref : 'Users', required : true },
	tags : [{ type : String }],
	locations : [{
		name : { type : String },
		address : { type : String },
		lat : { type : Number, required : true },
		lng : { type : Number, required : true }
	}],
	dateCreated : { type : Date, required : true },
	dateFinished : { type : Date, required : true }
});

module.exports = mongoose.model('Messages', MessageSchema);