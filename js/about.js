function formatPct(count, total) {
	return math.format(100 * count / total, { notation: 'fixed', precision: 2 }) + '%';
}

function setAllByClass(className, value) {
	var els = document.getElementsByClassName(className);
	for (var i = 0; i < els.length; i++) els[i].innerText = value;
}

function parseTweets(runkeeper_tweets) {
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	var total = tweet_array.length;

	// Dates: earliest and latest
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

	// Category counts
	var completed = 0, live = 0, achievement = 0, misc = 0;
	for (var j = 0; j < total; j++) {
		var src = tweet_array[j].source;
		if (src === 'completed_event') {
			completed++;
		}
		else if (src === 'live_event') {
			live++;
		}
		else if (src === 'achievement') {
			achievement++;
		}
		else {
			misc++;
		}
	}

	// Update DOM
	// Date DOM
	document.getElementById('numberTweets').innerText = total;
	document.getElementById('firstDate').innerText = earliestDate.toLocaleDateString('en-US', dateOptions);
	document.getElementById('lastDate').innerText = latestDate.toLocaleDateString('en-US', dateOptions);

	//Categories
	setAllByClass('completedEvents', completed);
	setAllByClass('completedEventsPct', formatPct(completed, total));

	setAllByClass('liveEvents', live);
	setAllByClass('liveEventsPct', formatPct(live, total));
	
	setAllByClass('achievements', achievement);
	setAllByClass('achievementsPct', formatPct(achievement, total));

	setAllByClass('miscellaneous', misc);
	setAllByClass('miscellaneousPct', formatPct(misc, total));
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});