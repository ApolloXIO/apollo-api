var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
	name :  { type : String, required : true },
	loc : {
		address : { type : String },
		lat : { type : Number, required : true },
		lng : { type : Number, required : true }
	},
	users : [{ type: Schema.Types.ObjectId, ref: 'Users' }]
});

module.exports = mongoose.model('Groups', GroupSchema);