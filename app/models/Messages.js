// Messages Schema
// State : False -> Incomplete

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
	msg : { type : String, required : true },
	priority : { type : Number, required : true, default : 2 },
	groupID : { type : Schema.Types.ObjectId, ref: 'Groups', required : true },
	fromUserID : { type : Schema.Types.ObjectId, ref : 'Users', required : true },
	tags : { type : String },
	locs : [{
		name : { type : String },
		address : { type : String },
		lat : { type : Number },
		lng : { type : Number }
	}],
	dateCreated : { type : Date, required : true },
	dateFinished : { type : Date },
	state : { type : Boolean, default : false }
});

module.exports = mongoose.model('Messages', MessageSchema);