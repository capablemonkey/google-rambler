autocomplete = require('./autocomplete');
emit = require("events").EventEmitter;
async = require('async');
s = require('./string.metrics')
_ = require('underscore')

function Query(string) {
	this.seed = string;
	this.history = [];
	this.current = this.seed;
	that = this

	var ee = new emit();

	autocomplete.getQuerySuggestions(this.seed, function(err, suggestions) {
		if (suggestions.length === 0) return 0;
		best = _.last(suggestions).suggestion || null;
		that.history.push(best)
		that.current = best

		console.log("typeof best: ", typeof(best))

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
			flat = _.flatten(results) 

			k = new SuggestionSet(current, flat)
			callback(null, k.findBest())
		}
		], 
		function(err, result) {
			cb(result)
		}
	)
}

function SuggestionSet(current, suggestions) {
	this.items = suggestions.map(function(item) {
		foo = item
		foo['length'] = item.suggestion.length;
		foo['difference'] = s.metrics.levenshteinDistance(item.suggestion, current);
		foo['score'] = (foo['difference'] + foo['length']) * Math.random();
		return foo;
	})

	this.findBest = function() {
		return _.max(this.items, function(item) {return item.score})
	}
}

// developmentally challenged + developmentally challenged youth basketball association = developmentally challenged youth basketball association
// "factset investor relations" + "relationship advice for women" = "factset investor relationship advice for women"

// compare end of string to beginning of next string
// as you iterate, if string is equal, truncat

Query.prototype.getNext = function(callback) {
	that = this

	// split into possible queries
	queries = this.current.split(" ").map(function(el, index, arr){return arr.slice(index, arr.length).join(" ") + " "})
	//queries = this.current.split(" ").slice(-1)
	console.log(" possible nexts: ", queries)

	findBestSuggestion(this.current, queries, function(suggestion) {
		if (!suggestion) return callback("no results :(")
		best = suggestion.suggestion
		console.log("  best: ", best)

		old = that.current.split(" ")
		n = best.split(" ")

		// old = "developmentally challenged".split(" ")
		// n = "developmentally challenged youth basketball association".split(" ")

		// remove carried over chunks of words

		result = _.difference(n, old).join(" ")

		// p ="factset investor relations"
		// k = "relationship advice for women"

		// // remove similar words from history
		// last = reverseChunkify(_.last(that.history))
		// current = chunkify(n)
		// that.history = _.intersection(last, current)

		for (var i = 1; i <= old.length; i++) {
			if(n.slice(0, i).join(" ").indexOf(old.slice(-(i)).join(" ")) != -1) {
				last = _.last(that.history).split(" ")
				that.history[that.history.length - 1] = last.slice(0, last.length - i).join(" ")
			}
		}

		that.current = result
		that.history.push(result)
		callback(null, result)
	});
}

function reverseChunkify(phrase) {
	return phrase.split(" ").map(function(el, index, arr){return arr.slice(index, arr.length).join(" ")})
}

function chunkify(phrase) {
	return phrase.split(" ").map(function(el, index, arr){return arr.slice(0, index+1).join(" ")})
}

// deciding which suggestion to keep
// deciding what is next to query

Query.prototype.mergeHistory = function() {
	//[kayak explore', 'explorer of the seas', 'seasons 52' ]
	history = this.history

	// remove words that are autocompleted by the next word
	return history.reduce(function(prev, curr) {
		return prev.concat(curr.split(" "))
	}, []).filter(function(val, index, arr) {
		if (arr[index + 1] && (arr[index + 1].indexOf(val) != -1)) return false;
		return true;
	}).join(" ")
}

exports.Query = Query 

// l.complete(function() {
// 	todo = [start]
// 	for (var x=0; x < 10; x++) {todo.push(again)}

// 	async.waterfall(todo, function(err, result) {
// 		console.log("done!")
// 	})
// })
