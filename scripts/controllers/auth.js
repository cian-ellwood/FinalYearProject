'use strict';

app.controller('AuthController', function($scope, $location, toaster, Auth) {

  if(Auth.user.provider) {
    $location.path('/');
  }

	$scope.register = function(user) {    	    
    Auth.register(user)
      .then(function() {
        toaster.pop('success', "Registered successfully");
        $location.path('/');
      }, function(err) {
        toaster.pop('error', "Oops! Something went wrong.");
         errMessage(err);
      });
	};

	$scope.login = function(user) {
    
    Auth.login(user)
      .then(function() {
        toaster.pop('success', "Logged in successfully");
        $location.path('/');
      }, function(err) {        
        toaster.pop('error', "Oops! Something went wrong.");
         errMessage(err);
      });   
	};

	$scope.changePassword = function(user) {
    
    Auth.changePassword(user)
      .then(function() {                        
        
        // Reset form
        $scope.user.email = '';
        $scope.user.oldPass = '';
        $scope.user.newPass = '';

        toaster.pop('success', "Password changed successfully");
      }, function(err) {
        toaster.pop('error', "Oops! Something went wrong.");
         errMessage(err);
      });        
  };

     //Utilising the function to extend the error messages in toaster
  
	 function errMessage(err) {

     var msg = "Unknown Error...";

     if(err && err.code) {
       switch (err.code) {
         case "EMAIL_TAKEN": 
           msg = "This email has already been registered"; break;          
        case "INVALID_EMAIL": 
          msg = "This email isn't valid please try another email"; break;          
         case "NETWORK_ERROR": 
          msg = "There is a network issue please try again"; break;          
         case "INVALID_PASSWORD": 
           msg = "This password is incorrect please try again!"; break;          
         case "INVALID_USER":
           msg = "This username does not exist have you registered?"; break;                  
       } 
     }   

     toaster.pop('error', msg);
   };


});