google-rambler
==============

...a.k.a. "ottokomplete"

Google Rambler attempts to construct a body of text that makes sense from a single seed word, based off of common search queries recommended by Google, which seem to be popular search queries from its users.

Check it out [here](http://googlerambler.herokuapp.com/).

Wait, what?
====================
So, say you're typing in a Google search and start off with the word "house".  Google's Autocomplete feature might recommend something like "houses for sale in Boston".  Rambler keeps the recommendation, takes the last word, and then puts that back into Google's autocomplete "api" (it's not documented, but it's open).  From supplying "boston", it might get back something like "boston red sox suck".  Then it'll lookup the word "suck" and so on and so forth.

Rambler tries to improve the quality of the text generated by doing a bit of lexical analysis on it, or sometimes just picking the longest recommendation.

Why?
=============
I wanted to see if this would be an effective way to generate sensible text.  I thought it might be better than feeding in a book of text into a [Markov chain](http://en.wikipedia.org/wiki/Markov_chain) because it uses Google's dataset of popular search queries, which add a human element to it.

Running it locally
==================

Just install dependencies (sockets.io mostly) with `npm install` and then run server.js.

	npm i
	node server.js