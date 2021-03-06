// ===============================================================================
// LOAD DATA
// We are linking our routes to a series of "data" sources. 
// These data sources hold arrays of information on table-data, waitinglist, etc.
// ===============================================================================

var friendsData 	= require('../data/friends.js');
var path 			= require('path');

var compatibilityArray =[];


// ===============================================================================
// ROUTING
// ===============================================================================

module.exports = function(app){

	app.post('/api/survey', function(req, res){
		
		friendsData.push(req.body);
		userScores = req.body.scores;
		// console.log("friendsData.length= %s",friendsData.length);
		//console.log("userScores: "+userScores);
		compatibilityArray = [];
		//-1 to eliminate the user's data because the user was just pushed into friendsData Array
		for(friendNum=0;friendNum<friendsData.length-1;++friendNum){
			var compatibilityScore=0;
			var scoreDiff=0;
			
			for(i=0;i<userScores.length;++i){
				// console.log("userScores[i]: " + userScores[i]);
				// console.log("friendsData.score[i]:"+friendsData[friendNum].scores[i]);
				//using absolute value so that no scoreDiff is negative.
				scoreDiff=Math.abs(userScores[i]-friendsData[friendNum].scores[i]);
				// console.log("scoreDiff="+scoreDiff);
				compatibilityScore = compatibilityScore + scoreDiff;
				// console.log("compatibilityScore="+compatibilityScore);
			}
			//this array represents the score and *also* the position of the best friend in the friendsData array.
			// console.log("friendNum=",friendNum);
			//console.log(friendsData[friendNum].friendName + " compatibility Score= "+compatibilityScore);
			compatibilityArray.push(compatibilityScore);
		}
		
		// console.log("compatibility array: "+compatibilityArray);
		//find the best friend match.
		//Compatibility array is now used to find the best match ( smallest discripancy between user and friends )
		var bestFriendScore = compatibilityArray[0];
		// console.log("compatibilityArray.length=%s",compatibilityArray.length);
		for(i=1;i<compatibilityArray.length;++i){
			// console.log("compatibilityArray["+i+"]="+compatibilityArray[i]);
			if(compatibilityArray[i]<bestFriendScore){
				//bestFriendIndex = i;
				bestFriendScore = compatibilityArray[i];
			}
		}
		//Now go through again looking for ties and then make a random choice among the ties.
		//Any ties are pushed into ties[].  each element represents the positon in the friendsData array.
		var ties = [];

		for (i=0;i<compatibilityArray.length;++i){
			if (bestFriendScore == compatibilityArray[i]){
				ties.push(i);
			}
		}
		var max = ties.length-1;
		var min = 0;
		
		// console.log("ties array=%s",ties);
		// console.log("ties.length=%s",ties.length);
		//we now determine randomly, the position of a friend among all the ties.
		//var min=0 left in for clarity sake when examining random generator code.
		var randomIndexAmongTies = (Math.floor(Math.random() * (max - min + 1)) + min);		
		//console.log("randomIndexAmongTies %s",randomIndexAmongTies);
		//the random choice among all the ties is the index of the best friend choice.
		var bestFriendIndex = ties[randomIndexAmongTies];
		
		// console.log("bestFriendIndex=%s",bestFriendIndex);
		// console.log("friendsData stringify'd: "+JSON.stringify(friendsData));
		
		var bestFriendName = friendsData[bestFriendIndex].friendName;
		//alertText set up to notify user about any ties.
		if (ties.length>1){
			var alertText="Chosen randomly among "+ ties.length + " matches";
			}else{
				var alertText = "There were no ties!";
			}
		
		var bestFriendPhotoLink = friendsData[bestFriendIndex].friendPhoto;
		//this case occurs when the user is the first and only data.
		if(bestFriendIndex==friendsData.length-1){
			bestFriendName = "You are your own best friend!";
			alertText = "You are the first to use FriendFinder!";
			bestFriendPhotoLink = friendsData[0].friendPhoto;
		}
		// console.log(compatibilityArray);
		// console.log("bestFriendIndex: "+ bestFriendIndex);
		// console.log("bestFriendScore: "+ bestFriendScore);
		// console.log("Name:%s",bestFriendName);
		// console.log("PhotoLink: ",bestFriendPhotoLink);
		//respond to client side with result (best match)
		res.json({
			'name':bestFriendName,
			'alert':alertText,
			'photo':bestFriendPhotoLink
		});

	});

}