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
angular.module( 'ngCannatel.each', [
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
  $stateProvider.state( 'each', {
    // parent: 'requireAuth',
    url: '/each',
    views: {
      "main": {
        controller: 'EachCtrl',
        templateUrl: 'each/each.tpl.html'
      }
    },
    resolve: {
      currentAuth: ['Auth', function(Auth) {
        return Auth.$requireAuth();
      }]
    },
    data:{ pageTitle: 'Each', roles: ['User'] }
  });
})

/**
 * And of course we define a controller for our route.
 */
.controller( 'EachCtrl', function EachController( $scope, currentAuth, userManager, statsManager) {

  $scope.currentAuth = currentAuth;
  $scope.users = userManager.getAllUsers();

  var stats = {};
  $scope.curr_month = {};

  function getDayOfMonth(ts) {
    var d = new Date(ts);
    return d.getDate();
  }

  var currentMonthStats = statsManager.getCurrentMonthStats();
  currentMonthStats.$watch(function(event){
    if (event.event == 'child_added') {
      var n_rec = currentMonthStats.$getRecord(event.key),
          day = getDayOfMonth(n_rec['time']);

      stats[n_rec.user] = stats[n_rec.user] || {'curr_month': {}};
      stats[n_rec.user]['curr_month'][day] = stats[n_rec.user]['curr_month'][day] || {};
      stats[n_rec.user]['curr_month'][day][n_rec.canType] = stats[n_rec.user]['curr_month'][day][n_rec.canType] + 1 || 1;
      $scope.curr_month[n_rec.user] = $scope.curr_month[n_rec.user] || {'labels':[], 'series':[], 'data':[]};

      // Add the this type of can to the all stats
      if (!(_.contains($scope.curr_month[n_rec.user].series, n_rec['canType']))) {
        $scope.curr_month[n_rec.user].series.push(n_rec['canType']);
      }

      // Update "me" scope variables
      $scope.curr_month[n_rec.user].labels = _.keys(stats[n_rec.user]['curr_month']);
      $scope.curr_month[n_rec.user].data = [];
      _.each($scope.curr_month[n_rec.user].series, function(s_el){
        var arr_series_data = [];
        _.each($scope.curr_month[n_rec.user].labels, function(l_el){
          val = stats[n_rec.user]['curr_month'][l_el][s_el] || 0;
          arr_series_data.push(val);
        });
        $scope.curr_month[n_rec.user].data.push(arr_series_data);
      });
      // console.log($scope.curr_month);
      // // For Global Stats
      // s_a_curr_month[day] = s_a_curr_month[day] || {};
      // s_a_curr_month[day][n_rec['canType']] = s_a_curr_month[day][n_rec['canType']] + 1 || 1;
      //
      // // Add the this type of can to the all stats
      // if (!(_.contains($scope.curr_month.all.series, n_rec['canType']))) {
      //   $scope.curr_month.all.series.push(n_rec['canType']);
      // }
      // // console.log(s_m_curr_month);
      // // console.log(s_a_curr_month);
      //
      // // Update "all" scope variables
      // $scope.curr_month.all.labels = _.keys(s_a_curr_month);
      // $scope.curr_month.all.data = [];
      // _.each($scope.curr_month.all.series, function(s_el){
      //   var arr_series_data = [];
      //   _.each($scope.curr_month.all.labels, function(l_el){
      //     val = s_a_curr_month[l_el][s_el] || 0;
      //     arr_series_data.push(val);
      //   });
      //   $scope.curr_month.all.data.push(arr_series_data);
      // });
    }
  });
});
