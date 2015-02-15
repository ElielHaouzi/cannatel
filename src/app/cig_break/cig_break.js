/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/home`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */
angular.module( 'ngCannatel.cig_break', [
  'ui.router',
  'ngCannatel.dal',
  'fbAuth',
  'chart.js'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
  $stateProvider.state( 'cig_break', {
    // parent: 'requireAuth',
    url: '/pause_clope',
    views: {
      "main": {
        controller: 'CigBreakCtrl',
        templateUrl: 'cig_break/cig_break.tpl.html'
      }
    },
    resolve: {
      currentAuth: ['Auth', function(Auth) {
        return Auth.$requireAuth();
      }]
    },
    data:{ pageTitle: 'Pause clope', roles: ['User'] }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'CigBreakCtrl', function EachController( $scope, currentAuth, userManager, statsManager) {

  $scope.currentAuth = currentAuth;
  $scope.users = userManager.getAllUsers(currentAuth.uid);
  $scope.me = userManager.getUser(currentAuth.uid);

  $scope.cig_break_text = {
    'false': "Pause Clope",
    'true': "Je travail :)"
  };

  $scope.me.$watch(function(event){
    if ($scope.me.name == 'Michael Cohen') {
      $scope.cig_break_text['true'] = 'Miko arrête de déconner ! Travail !! :)';
    }
  });
});
