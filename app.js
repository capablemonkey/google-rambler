autocomplete = require('./autocomplete');
emit = require("events").EventEmitter;
var async = require('async')

function Query(string) {
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

Query.prototype.getNext = function(callback) {
	that = this

	// determine next query
	if (this.current.indexOf(" ") != -1) {
		next = this.current.split(" ").slice(-1)[0]
	}
	else {
		next = this.current
	}

	console.log("  next: ", next)

	autocomplete.getQuerySuggestions(next, function(err, suggestions) {
		if (err) callback(err)
		best = suggestions[0].suggestion
		console.log("  best: ", best)

		// if next is part of first word, do not cut.
		if (best.split(" ")[0].indexOf(next) != -1) {
			result = best
			if (best.split(" ")[0] == next) result = best.split(' ').slice(1).join(' ')
		}
		else result = best.slice(best.indexOf(next) + next.length)

		console.log("  result: ", result)

		that.current = result
		that.history.push(result)
		callback(null, result)
	})
}

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

l = new Query("kayak")
l.complete(function() {
	async.waterfall([
		function(callback) {
			console.log(l.mergeHistory())
			l.getNext(callback)
		},
		function(err, callback) {
			console.log(l.mergeHistory())
			l.getNext(callback)
		},
		function(err, callback) {
			console.log(l.mergeHistory())
			l.getNext(callback)
		},
		function(err, callback) {
			console.log(l.mergeHistory())
			l.getNext(callback)
		},
		function(err, callback) {
			console.log(l.mergeHistory())
			l.getNext(callback)
		},
	], function(err, result) {
		console.log(result)
})
	}
)

// l = new Query("sleepy").complete(function() {
// 	console.log(l.seed)
// 	// l.getNext(function(err, result) {
// 	// 	console.log(l.seed)
// 	// 	console.log(l.current)
// 	// })
// })


// var getNext = function(current, callback) {


// 	autocomplete.getQuerySuggestions(current, function(err, suggestions) {
// 		if (err) callback(err)
// 		best = suggestions[0].suggestion
// 		result = best.slice(best.indexOf(current) + current.length)
// 		callback(null, result)
// 	})
// }

// var start = function(string, callback) {
// 	autocomplete.getQuerySuggestions(string, function(err, suggestions) {
// 		if (err) callback(err)
// 		best = suggestions[0].suggestion
// 		callback(null, best)
// 	})
// }

// start("sleepy", function(err, result) {
// 	console.log(result)

// 	if (result.indexOf(" ") != -1) {
// 		next = result.split().slice(-1)[0]
// 	}
// 	else {
// 		next = result
// 	}
	
// 	getNext(next, function(err, result) {
// 		console.log(result)
// 	})
// })

// get results
// choose suggestion
// decide next query

// l = Query("house")
// >> house cards with snow
// l.getNextWithLastWord()
// >> in the late winter
// l.seed
// >> "house"
// l.history
// >> ["cards with snow", "in the late winter"]
// l.current
// >> "in the late winter"
// l.getNextWithLastWord()
// >> "is so damn cold"