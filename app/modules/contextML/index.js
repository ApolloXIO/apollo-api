var natural = require('natural'),
	classifier = new natural.BayesClassifier();
module.exports = {
	
	getTags : function(message, callback) {
		natural.BayesClassifier.load('app/modules/contextML/classifier.json', null, function(err, classifier) {
			if(err) {
				callback(err, "Error");
			}
			var tag = classifier.classify(message);
			callback(undefined, tag);
		});
	},

	trainClassifier : function(message, tag, errCallback) {
		classifier.addDocument(message, tag);
		classifier.train();
		classifier.save('app/modules/contextML/classifier.json', function(err, classifier) {
			errCallback(err);
		});
	}
}