var natural = require('natural');
var classifier = new natural.BayesClassifier();

module.exports = {
	
	getTags : function(message, callback) {
		natural.BayesClassifier.load('classifierModels/classifier.json', null, function(err, classifier) {
			var tag = classifier.classify(message);
			callback(tag);
		});
	},

	trainClassifier : function(message, tag, errCallback) {
		classifier.addDocument(message, tag);
		classifier.train();
		classifier.save('classifierModels/classifier.json', function(err, classifier) {
			errCallback(err);
		});
	}

}