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
  $scope.users = userManager.getAllUsers(currentAuth.uid);
  $scope.me = userManager.getUser(currentAuth.uid);

  $scope.inc = function(user, canType) {
    // Adding to current
    user.current[canType] += 1;
    // Adding to total
    user.total[canType] += 1;
    // Add to stat
    statsManager.addToStat($scope.currentAuth.uid, canType);
    // Save
    $scope.users.$save(user);
  };

  $scope.reset = function(user, canType) {
    user.current[canType] = 0;
    // Save
    $scope.users.$save(user);
  };

  var stats = {
    'all': {
      'today': {},
      'curr_month': {},
      'curr_year': {}
    },
    'me': {
      'today': {},
      'curr_month': {},
      'curr_year': {}
    }
  };

  $scope.today = {
    'all': {'labels':[], 'data':[]},
    'me': {'labels':[], 'data': []}
  };

  var todayStats = statsManager.getTodayStats();
  todayStats.$watch(function(event) {
    // Update only on child_added event
    if (event.event == 'child_added') {
      var n_rec = todayStats.$getRecord(event.key);
      var s_a_today = stats.all.today;
      var s_m_today = stats.me.today;

      // The record belong to the current user.
      if (n_rec.user == $scope.me.$id) {
        // Increment the counter for this type of can.
        s_m_today[n_rec.canType] = s_m_today[n_rec.canType] + 1 || 1;
      }
      // Update the stats for this type of can
      s_a_today[n_rec.canType] = s_a_today[n_rec.canType] + 1 || 1;

      // Update the "me" and "all" scopes variables
      $scope.today.me.labels = _.keys(s_m_today);
      $scope.today.me.data = _.values(s_m_today);

      $scope.today.all.labels = _.keys(s_a_today);
      $scope.today.all.data = _.values(s_a_today);
    }
  });

  $scope.curr_month = {
    'all': {'labels':[], 'series':[], 'data':[]},
    'me': {'labels':[], 'series':[], 'data':[]}
  };

  function getDayOfMonth(ts) {
    var d = new Date(ts);
    return d.getDate();
  }

  var currentMonthStats = statsManager.getCurrentMonthStats();
  currentMonthStats.$watch(function(event){
    if (event.event == 'child_added') {
      var n_rec = currentMonthStats.$getRecord(event.key),
          s_a_curr_month = stats.all.curr_month,
          s_m_curr_month = stats.me.curr_month,
          day = getDayOfMonth(n_rec['time']);

      // This record belongs to the current user
      if (n_rec.user == $scope.me.$id) {
        s_m_curr_month[day] = s_m_curr_month[day] || {};
        s_m_curr_month[day][n_rec['canType']] = s_m_curr_month[day][n_rec['canType']] + 1 || 1;

        // Add the this type of can to the all stats
        if (!(_.contains($scope.curr_month.me.series, n_rec['canType']))) {
          $scope.curr_month.me.series.push(n_rec['canType']);
        }

        // Update "me" scope variables
        $scope.curr_month.me.labels = _.keys(s_m_curr_month);
        $scope.curr_month.me.data = [];
        _.each($scope.curr_month.me.series, function(s_el){
          var arr_series_data = [];
          _.each($scope.curr_month.me.labels, function(l_el){
            val = s_m_curr_month[l_el][s_el] || 0;
            arr_series_data.push(val);
          });
          $scope.curr_month.me.data.push(arr_series_data);
        });
      }

      // For Global Stats
      s_a_curr_month[day] = s_a_curr_month[day] || {};
      s_a_curr_month[day][n_rec['canType']] = s_a_curr_month[day][n_rec['canType']] + 1 || 1;

      // Add the this type of can to the all stats
      if (!(_.contains($scope.curr_month.all.series, n_rec['canType']))) {
        $scope.curr_month.all.series.push(n_rec['canType']);
      }
      // console.log(s_m_curr_month);
      // console.log(s_a_curr_month);

      // Update "all" scope variables
      $scope.curr_month.all.labels = _.keys(s_a_curr_month);
      $scope.curr_month.all.data = [];
      _.each($scope.curr_month.all.series, function(s_el){
        var arr_series_data = [];
        _.each($scope.curr_month.all.labels, function(l_el){
          val = s_a_curr_month[l_el][s_el] || 0;
          arr_series_data.push(val);
        });
        $scope.curr_month.all.data.push(arr_series_data);
      });
    }
  });
});
