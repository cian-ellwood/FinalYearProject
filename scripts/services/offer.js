'use strict';

app.factory('Offer', function(FURL, $firebase, $q, Auth, Task) {
	var ref = new Firebase(FURL);
	var user = Auth.user;

	var Offer = {
		offers: function(taskId) {
			return $firebase(ref.child('offers').child(taskId)).$asArray();
		},

		makeOffer: function(taskId, offer) {
			var task_offers = this.offers(taskId);

			if(task_offers) {
				return task_offers.$add(offer);
			}
		},

		// This is to stop the suer making multiple offer requests
		isOfferred: function(taskId) {

			if(user && user.provider) {
				var d = $q.defer();

				$firebase(ref.child('offers').child(taskId).orderByChild("uid")
					.equalTo(user.uid))
					.$asArray()
					.$loaded().then(function(data) {						
						d.resolve(data.length > 0);
					}, function() {
						d.reject(false);
					});

				return d.promise;
			}
			
		},

		isMaker: function(offer) {
			return (user && user.provider && user.uid === offer.uid);
		},

		getOffer: function(taskId, offerId) {
			return $firebase(ref.child('offers').child(taskId).child(offerId));
		},

		cancelOffer: function(taskId, offerId) {
			return this.getOffer(taskId, offerId).$remove();			
		},

		//-----------------------------------------------//

		acceptOffer: function(taskId, offerId, mechanicId) {
			// Add the accepted button when the poster accepts the offer
			var o = this.getOffer(taskId, offerId);
			return o.$update({accepted: true})
				.then(function() {				
						
					// Assign the task to the mechanic and give it the status "assigned"
					var t = Task.getTask(taskId);			
					return t.$update({status: "assigned", mechanic: mechanicId});	
				})
				.then(function() {					

					//  Add task to users dashboard
					return Task.createUserTasks(taskId);
				});
		},

		notifyMechanic: function(taskId, mechanicId) {
			// Get mechanic's profile
			Auth.getProfile(mechanicId).$loaded().then(function(mechanic) {
				var n = {
					taskId: taskId,
					email: mechanic.email,
					name: mechanic.name
				};

				// Creates notifications for Zapier and Mandrill to mail out
				var notification = $firebase(ref.child('notifications')).$asArray();
				return notification.$add(n);	
			});
		}

	};

	return Offer;

})