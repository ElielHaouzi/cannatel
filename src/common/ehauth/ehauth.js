angular.module('ehAuth', [
  'ui.router',
  'ui.bootstrap',
  'firebase'
])

// principal is a service that tracks the user's identity.
// calling identity() returns a promise while it does what you need it to do
// to look up the signed-in user's identity info. for example, it could make an
// HTTP request to a rest endpoint which returns the user's name, roles, etc.
// after validating an auth token in a cookie. it will only do this identity lookup
// once, when the application first runs. you can force re-request it by calling identity(true)
.factory('principal', function($q, $http, $timeout, $firebase) {
  var _identity,
    _authenticated = false;

  return {
    isIdentityResolved: function() {
      return angular.isDefined(_identity);
    },
    isAuthenticated: function() {
      return _authenticated;
    },
    isInRole: function(role) {
      if (!_authenticated || !_identity.roles) {
        return false;
      }

      return _identity.roles.indexOf(role) != -1;
    },
    isInAnyRole: function(roles) {
      if (!_authenticated || !_identity.roles) {
        return false;
      }

      for (var i = 0; i < roles.length; i++) {
        if (this.isInRole(roles[i])) {
          return true;
        }
      }

      return false;
    },
    authenticate: function() {
      var ref = new Firebase('https://cannatel.firebaseio.com/');
      ref.authWithOAuthPopup("facebook", function(error, authData) {
        if (error) {
          console.log("Login Failed!", error);
          _identity = null;
          _authenticated = false;
        } else {
          console.log("Authenticated successfully with payload:", authData);
          _identity = data;
          _authenticated = true;
        }
      }, {remember: "sessionOnly", scope: "email"});
    },
    identity: function(force) {

      var deferred = $q.defer();

      if (force === true) {
        _identity = undefined;
        this.authenticate();
      }

      // check and see if we have retrieved the identity data from the server. if we have, reuse it by immediately resolving
      if (angular.isDefined(_identity)) {
        deferred.resolve(_identity);
      }
      else {
        deferred.resolve(null);
      }

      return deferred.promise;
    }
  };
})

// authorization service's purpose is to wrap up authorize functionality
// it basically just checks to see if the principal is authenticated and checks the root state
// to see if there is a state that needs to be authorized. if so, it does a role check.
// this is used by the state resolver to make sure when you refresh, hard navigate, or drop onto a
// route, the app resolves your identity before it does an authorize check. after that,
// authorize is called from $stateChangeStart to make sure the principal is allowed to change to
// the desired state
.factory('authorization', ['$rootScope', '$state', 'principal',
  function($rootScope, $state, principal) {
    return {
      authorize: function() {
        return principal.identity().then(function() {

          var isAuthenticated = principal.isAuthenticated();

          if ($rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0 &&
              !principal.isInAnyRole($rootScope.toState.data.roles)) {

            if (isAuthenticated) {
              $state.go('accessdenied'); // user is signed in but not authorized for desired state
            }
            else {
              // user is not authenticated. stow the state they wanted before you
              // send them to the signin state, so you can return them when you're done
              $rootScope.returnToState = $rootScope.toState;
              $rootScope.returnToStateParams = $rootScope.toStateParams;

              // now, send them to the signin state so they can log in
              $state.go('signin');
            }
          }
        });
      }
    };
  }
]);
