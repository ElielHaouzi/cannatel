angular.module( 'ngCannatel', [
  'templates-app',
  'templates-common',
  'ngCannatel.home',
  'ngCannatel.about',
  'ngCannatel.signin',
  'ui.router',
  'ehAuth'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/signin' );

  $stateProvider.state('site', {
    'abstract': true,
    resolve: {
      authorize: ['authorization',
        function(authorization) {
          return authorization.authorize(true);
        }
      ]
    }
  });
})

.run( function run ($rootScope, $state, $stateParams, authorization, principal) {
  $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams, fromState, fromParams, error) {
    $rootScope.toState = toState;
    $rootScope.toStateParams = toStateParams;

    if (principal.isIdentityResolved()) {
      authorization.authorize();
    }
  });
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, principal ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | Cannatel' ;
    }

    $scope.principal = principal;
  });

});
