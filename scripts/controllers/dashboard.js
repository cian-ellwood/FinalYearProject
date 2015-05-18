'use strict';

app.controller('DashboardController', function($scope, Dashboard, Auth) {

	$scope.taskMechanic = [];
	$scope.taskPoster = [];

	var uid = Auth.user.uid;

	Dashboard.getTasksForUser(uid).then(function(tasks) {

		for(var i = 0; i < tasks.length; i++) {
			tasks[i].type? $scope.taskPoster.push(tasks[i]) : $scope.taskMechanic.push(tasks[i]) 
		}

		$scope.numPoster = $scope.taskPoster.length;
		$scope.numMechanic = $scope.taskMechanic.length;
	});
	
});