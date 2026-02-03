var tweet_array;

function parseTweets(runkeeper_tweets) {
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	addEventHandlerForSearch();
	updateSearchAndTable();
}

function updateSearchAndTable() {
	var searchBox = document.getElementById('textFilter');
	var query = (searchBox && searchBox.value) ? searchBox.value.trim() : '';
	var searchTextSpan = document.getElementById('searchText');
	var searchCountSpan = document.getElementById('searchCount');
	var tableBody = document.getElementById('tweetTable');

	if (!searchTextSpan || !searchCountSpan || !tableBody || !tweet_array) return;

	searchTextSpan.innerText = query === '' ? '???' : query;

	var lowerQuery = query.toLowerCase();
	var matching = [];
	for (var index = 0; index < tweet_array.length; index++) {
		if (tweet_array[index].text.toLowerCase().indexOf(lowerQuery) >= 0) {
			matching.push({ index: index + 1, tweet: tweet_array[index] });
		}
	}

	searchCountSpan.innerText = matching.length;

	tableBody.innerHTML = '';
	for (var row = 0; row < matching.length; row++) {
		var item = matching[row];
		var tr = document.createElement('tr');
		var tdNumber = document.createElement('td');
		var tdActivity = document.createElement('td');
		var tdTweet = document.createElement('td');
		tdNumber.innerText = item.index;
		tdActivity.innerText = item.tweet.activityType || 'unknown';
		tdTweet.innerText = item.tweet.text;
		tr.appendChild(tdNumber);
		tr.appendChild(tdActivity);
		tr.appendChild(tdTweet);
		tableBody.appendChild(tr);
	}
}

function addEventHandlerForSearch() {
	var searchBox = document.getElementById('textFilter');
	if (!searchBox) return;
	searchBox.addEventListener('input', function() {
		updateSearchAndTable();
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});