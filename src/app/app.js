angular.module( 'ngCannatel', [
  'templates-app',
  'templates-common',
  'ngCannatel.dal',
  'ngCannatel.home',
  'ngCannatel.about',
  'ngCannatel.signin',
  'ui.router',
  'fbAuth'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/' );

  // $stateProvider.state('requireAuth', {
  //   'abstract': true,
  //   resolve: {
  //     currentAuth: ['Auth', function(Auth) {
  //       console.log(Auth.$requireAuth());
  //       return Auth.$requireAuth();
  //     }]
  //   }
  // });

})

.run( function run ($rootScope, $state, $stateParams) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    console.log(error);
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $state.go("signin");
    }

  });
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, Auth ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | Cannatel' ;
    }
  });

  $scope.isIdentified = function() {
    $scope.authData = Auth.$getAuth();
    return $scope.authData == null;
  };
});
