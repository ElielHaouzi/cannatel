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
angular.module( 'ngCannatel.home', [
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
  $stateProvider.state( 'home', {
    // parent: 'requireAuth',
    url: '/',
    views: {
      "main": {
        controller: 'HomeCtrl',
        templateUrl: 'home/home.tpl.html'
      }
    },
    resolve: {
      currentAuth: ['Auth', function(Auth) {
        return Auth.$requireAuth();
      }]
    },
    data:{ pageTitle: 'Home', roles: ['User'] }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'HomeCtrl', function HomeController( $scope, currentAuth, userManager, statsManager) {

  $scope.currentAuth = currentAuth;
  $scope.users = userManager.getAllUsers();
  $scope.me = userManager.getUser(currentAuth.uid);

  // // var ref = new Firebase('https://cannatel.firebaseio.com/');
  //
  // // create an AngularFire reference to the data
  // var sync = $firebase(ref);
  //
  // // download the data into a local object
  // var syncObject = sync.$asObject();
  //
  // // synchronize the object with a three-way data binding
  // // click on `index.html` above to see it used in the DOM!
  // syncObject.$bindTo($scope, "data");

  // $scope.me = new User(currentAuth.uid);
  // console.log($scope.me);

  $scope.inc = function(user, canType) {
    // Adding to current
    user.current[canType] += 1;
    // Adding to total
    user.total[canType] += 1;

    // add to stat
    statsManager.addToStat($scope.currentAuth.uid, canType);

    // Save
    $scope.users.$save(user);
  };

  $scope.dec = function(user, canType) {
    // Adding to current
    if (user.current[canType] == 1 || user.current[canType] === 0) {
      user.current[canType] = 0;
    }
    else {
      user.current[canType] -= 1;
    }

    // Save
    $scope.users.$save(user);
  };

  $scope.reset = function(user, canType) {
    user.current[canType] = 0;

    // Save
    $scope.users.$save(user);
  };

  $scope.todayStats = statsManager.getTodayStats();
  $scope.stats = {};

  $scope.todayStats.$watch(function(event){
    if (event.event == 'child_added') {

      stat = $scope.todayStats.$getRecord(event.key);
      $scope.stats[stat.canType] = ($scope.stats[stat.canType] === undefined)?1:$scope.stats[stat.canType]+1;

      if (stat.user == $scope.me.$id) {
        $scope.meTodayLabels = _.keys($scope.stats);
        $scope.meTodayData = _.values($scope.stats);
      }

      $scope.todayLabels = _.keys($scope.stats);
      $scope.todayData = _.values($scope.stats);
    }
  });


});
