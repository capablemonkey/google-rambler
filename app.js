autocomplete = require('./autocomplete');
emit = require("events").EventEmitter;
async = require('async');
s = require('./string.metrics')

function Query(string) {
	console.log('lol')
	this.seed = string;
	this.history = [];
	this.current = this.seed;
	that = this

	var ee = new emit();

	autocomplete.getQuerySuggestions(this.seed, function(err, suggestions) {
		best = suggestions[0].suggestion
		that.history.push(best)
		that.current = best

		ee.emit("finishedLookup");
	})

	this.complete = function(callback) {
		ee.on("finishedLookup", function () {
		    callback()
		});
	}
}

// find best suggestion
function findBestSuggestion (current, queries, cb) {
	results = []
	async.waterfall([
		// get suggestions for all queries
		function(callback) {
			queries.forEach(function (query) {
				autocomplete.getQuerySuggestions(query, function(err, suggestions) {
					results.push(suggestions)
					if (results.length == queries.length) callback()
				})
			})
		},
		// calculate score for each query
		function(callback) {
			// [{query: "", score: 900, suggestion: ""}]
			flat = results.reduce(function(a, b) {
				return a.concat(b)
			})

			k = new SuggestionSet(current, flat)
			callback(null, k.findBest())
		}
		], 
		function(err, result) {
			cb(result)
		}
	)
}

function calculateDifference(str1, str2) {
	return s.metrics.levenshteinDistance(str1, str2)
}

function SuggestionSet(current, suggestions) {
	this.items = suggestions.map(function(item) {
		foo = item
		foo['length'] = item.suggestion.length;
		foo['difference'] = calculateDifference(item.suggestion, current);
		foo['score'] = (foo['difference'] + foo['length']) * Math.random();
		return foo;
	})

	this.findBest = function() {
		return this.items.sort(function(a, b) {
			return b.score - a.score
		})[0]
	}
}

// developmentally challenged + developmentally challenged youth basketball association = developmentally challenged youth basketball association
// "factset investor relations" + "relationship advice for women" = "factset investor relationship advice for women"

// compare end of string to beginning of next string
// as you iterate, if string is equal, truncat

Query.prototype.getNext = function(callback) {
	that = this

	// split into possible queries
	queries = this.current.split(" ").map(function(el, index, arr){return arr.slice(index, arr.length).join(" ")})
	queries = this.current.split(" ").slice(-1)
	console.log(" possible nexts: ", queries)

	// determine which query would yield the most suggestions with the longest lengths
	findBestSuggestion(this.current, queries, function(suggestion) {
		if (!suggestion) return callback("no results :(")
		best = suggestion.suggestion
		console.log("  best: ", best)

		old = that.current.split(" ")
		n = best.split(" ")

		// old = "developmentally challenged".split(" ")
		// n = "developmentally challenged youth basketball association".split(" ")

		// remove carried over chunks of words

		index = -1;

		for (var i = 1; i <= old.length; i++) {
			if(n.slice(0, i).join(" ") == old.slice(-(i)).join(" ")) n = n.slice(i);
		}

		result = n.join(" ")

		// remove similar words from history

		for (var i = 1; i <= old.length; i++) {
			if(n.slice(0, i).join(" ").indexOf(old.slice(-(i)).join(" ")) != -1) {
				last = that.history.slice(-1)[0].split(" ")
				that.history[that.history.length - 1] = last.slice(0, last.length - i).join(" ")
			}
		}

		console.log("  result: ", result)

		that.current = result
		that.history.push(result)
		callback(null, result)
	});
}

// deciding which suggestion to keep
// deciding what is next to query

Query.prototype.mergeHistory = function() {
	//[kayak explore', 'explorer of the seas', 'seasons 52' ]
	history = this.history

	// remove words that are auto-completed
	return history.reduce(function(prev, curr) {
		return prev.concat(curr.split(" "))
	}, []).filter(function(val, index, arr) {
		if (arr[index + 1] && (arr[index + 1].indexOf(val) != -1)) return false;
		return true;
	}).join(" ")
}

var start = function(callback) {
	console.log(l.mergeHistory())
	l.getNext(callback)
}

var again = function(err, callback) {
	console.log(l.mergeHistory())
	console.log(l.history)
	l.getNext(callback)
}

exports.Query = Query 

// l.complete(function() {
// 	todo = [start]
// 	for (var x=0; x < 10; x++) {todo.push(again)}

// 	async.waterfall(todo, function(err, result) {
// 		console.log("done!")
// 	})
// })
