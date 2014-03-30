auto = Npm.require('../autocomplete')

if (Meteor.isClient) { 
  Template.forecast.prediction = function () {
    return Session.get('q');
  };

  Template.forecast.events({
      'submit form': function( event ){   // also tried just 'submit', both work for me!
        console.log( 'Submitting form!' );
        event.preventDefault();
        event.stopPropagation();

        Meteor.call("bar", document.getElementById("lol").value, function(err, val) {
          Session.set('q', val);
        })
        return false; 
      }
    });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  Meteor.methods({
    bar: function(seed) {
      l = Query(seed).complete(function() {
        return l.mergeHistory();
      })
      return seed
    }
  });

}