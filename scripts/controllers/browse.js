'use strict';

app.controller('BrowseController', function ($scope, $routeParams, toaster, Task, Auth, Comment, Offer) {

    $scope.searchTask = '';
    $scope.tasks = Task.all;
    
  //check if user is signedin
  
    $scope.user = Auth.user;
    $scope.signedIn = Auth.signedIn;

    $scope.listMode = true;

    if ($routeParams.taskId) {
        var task = Task.getTask($routeParams.taskId).$asObject();
        $scope.listMode = false;
        setSelectedTask(task);
    }

    function setSelectedTask(task) {
        $scope.selectedTask = task;

        if ($scope.signedIn()) {

            // Verify if the user has already made an offer on this task
            Offer.isOfferred(task.$id).then(function (data) {
                $scope.alreadyOffered = data;
            });

            // Check if current user has created the task they have selected
            $scope.isTaskCreator = Task.isCreator;

            // Verifies if this selected task is opened
            $scope.isOpen = Task.isOpen;

            // Show the estimate button on the modal
            $scope.block = false;

            // Display cancel estimate button if the user is the person who has made the estimate
            $scope.isOfferMaker = Offer.isMaker;


            //Verifies the current user is the tasks assignee
            $scope.isAssignee = Task.isAssignee;

            // Checks to see if the current task is completed
            $scope.isCompleted = Task.isCompleted;

        }

        // Get comments for the current task
        $scope.comments = Comment.comments(task.$id);

        // Get offer list for the task that is selected
        $scope.offers = Offer.offers(task.$id);
    };



    $scope.cancelTask = function (taskId) {
        Task.cancelTask(taskId).then(function () {
            toaster.pop('success', "This repair is cancelled successfully.");
        });
    };



    $scope.completeTask = function (taskId) {
        Task.completeTask(taskId).then(function () {
            toaster.pop('success', "Congratulation! You have completed this repair.");
        });
    };


    $scope.addComment = function () {
        var comment = {
            content: $scope.content,
            name: $scope.user.profile.name,
            gravatar: $scope.user.profile.gravatar
        };

        Comment.addComment($scope.selectedTask.$id, comment).then(function () {
            $scope.content = '';
        });
    };



    $scope.makeOffer = function () {
        var offer = {
            total: $scope.total,
            uid: $scope.user.uid,
            name: $scope.user.profile.name,
            gravatar: $scope.user.profile.gravatar
        };

        Offer.makeOffer($scope.selectedTask.$id, offer).then(function () {
            toaster.pop('success', "Your estimate has been placed.");

            // Show the user has already made an offer on the task
            $scope.alreadyOffered = true;

            // Reset estimate form
            $scope.total = '';

            // Hide the estimate button when user has made an offer
            $scope.block = true;
        });
    };

    $scope.cancelOffer = function (offerId) {
        Offer.cancelOffer($scope.selectedTask.$id, offerId).then(function () {
            toaster.pop('success', "Your estimate has been cancelled.");

            // Mark the user has cancelled the offer
            $scope.alreadyOffered = false;

            // When user cancels show the offer button again
            $scope.block = false;
        });
    };



    $scope.acceptOffer = function(offerId, mechanicId) {
        Offer.acceptOffer($scope.selectedTask.$id, offerId, mechanicId).then(function() {
            toaster.pop('success', "Estimate is accepted successfully!");



            // Notify assignee
            Offer.notifyMechanic($scope.selectedTask.$id, mechanicId);
        });
        };



    });