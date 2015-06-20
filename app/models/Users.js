var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UsersSchema = new Schema({
	fname : { type : String, required : true },
	lname : { type : String, required : true },
	email : { type : String, required : true },
	googleid : { type : String, required : true , unique : true }
});

module.exports = mongoose.model('Users', UsersSchema);