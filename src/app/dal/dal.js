angular.module('ngCannatel.dal', [
  'firebase'
])

// .factory("User", function($firebase) {
//   return function(authUid) {
//     // create a reference to the user's profile
//     var ref = new Firebase("https://cannatel.firebaseio.com/users/").child(authUid);
//     // return it as a synchronized object
//     return $firebase(ref).$asObject();
//   };
// })

.service('userManager', function($firebase){

   this.getAllUsers = function() {
     var usersRef = new Firebase("https://cannatel.firebaseio.com/users/");
     // return it as a synchronized object
     return $firebase(usersRef).$asObject();
   };

   this.createUser = function(authData) {
     if (!this._isUserExist(authData.uid)) {
       userObject = {
         name: authData.facebook.displayName,
         current: {coca: 0, xl: 0, zero: 0, blue: 0, fanta: 0},
         total: {coca: 0, xl: 0, zero: 0, blue: 0, fanta: 0}
       };

       var users = this.getAllUsers();
       users[authData.uid] = userObject;
       users.$save().then(function(ref){}, function(erro){});
     }
   };

   this.getUser = function(authUid) {
     var usersRef = new Firebase("https://cannatel.firebaseio.com/users/").child(authUid);
     return $firebase(usersRef).$asObject();
   };

   this._isUserExist = function(authUid) {
     userObject = this.getUser(authUid);
     return userObject.$value != null;
   };
})

.service('statsManager', function($firebase) {
  this.addToStat = function(authUid, canType) {
    var statsRef = new Firebase("https://cannatel.firebaseio.com/stats/");
    var sync = $firebase(statsRef).$asArray();

    sync.$add({time: Firebase.ServerValue.TIMESTAMP, user: authUid, canType: canType});
  };

  this.getTodayStats = function() {
    var d = new Date();
    d.setHours(0,0,0,0);

    var statsRef = new Firebase("https://cannatel.firebaseio.com/stats/").orderByChild("time").startAt(d.getTime());
    return $firebase(statsRef).$asArray();
  };
});
