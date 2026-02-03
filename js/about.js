function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Find earliest and latest tweet dates
	var earliestDate = tweet_array[0].time;
	var latestDate = tweet_array[0].time;
	for (var i = 1; i < tweet_array.length; i++) {
		if (tweet_array[i].time < earliestDate) {
			earliestDate = tweet_array[i].time;
		}
		if (tweet_array[i].time > latestDate) {
			latestDate = tweet_array[i].time;
		}
	}
	var dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	document.getElementById('firstDate').innerText = earliestDate.toLocaleDateString('en-US', dateOptions);
	document.getElementById('lastDate').innerText = latestDate.toLocaleDateString('en-US', dateOptions);

	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});