define([ 'jquery',
         'lodash',
         'backbone',
         'defaults',
         'models/user' ],
  function( $,
            _,
            Backbone,
            defaults,
            User ) {

  var UserCollection = Backbone.Model.extend({
    url: defaults.urlRoot + 'users/',
    model: User
  });

  return UserCollection;
});