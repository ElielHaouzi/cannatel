angular.module('fbAuth', [
  'firebase'
])

// let's create a re-usable factory that generates the $firebaseAuth instance
.factory("Auth", ["$firebaseAuth", function($firebaseAuth) {
  var ref = new Firebase("https://cannatel.firebaseio.com/");
  return $firebaseAuth(ref);
}]);
