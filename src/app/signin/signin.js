angular.module( 'ngCannatel.signin', [
  'ui.router',
  'firebase',
  'fbAuth',
  'ngCannatel.dal'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
  $stateProvider.state( 'signin', {
    url: '/signin',
    views: {
      "main": {
        controller: 'SigninCtrl',
        templateUrl: 'signin/signin.tpl.html'
      }
    },
    data:{ pageTitle: 'SignIn', roles: []}
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'SigninCtrl', function SigninController( $scope, $state, $firebase, Auth, userManager) {

  $scope.signin = function() {
    // principal.authenticate();
    Auth.$authWithOAuthPopup("facebook").then(function(authData) {
      console.log("Logged in as:", authData.uid);

      userManager.createUser(authData);

      $state.go('me');
    }); // {remember: "sessionOnly"}
  };

  Auth.$onAuth(function(authData) {
     $scope.authData = authData;
     $state.go('me');
  });
});
