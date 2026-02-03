var written_tweets;
var search_index;

function escapeHtml(text) {
	return String(text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function parseTweets(runkeeper_tweets) {
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	var tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	written_tweets = [];
	for (var index = 0; index < tweet_array.length; index++) {
		if (tweet_array[index].written) {
			written_tweets.push(tweet_array[index]);
		}
	}

	search_index = [];
	for (var index = 0; index < written_tweets.length; index++) {
		var tweet = written_tweets[index];
		search_index.push({
			lowerText: tweet.text.toLowerCase(),
			activityEscaped: escapeHtml(tweet.activityType),
			tweetCellHtml: tweet.getTweetTextWithClickableLinks()
		});
	}

	addEventHandlerForSearch();
	updateSearchAndTable();
}

function updateSearchAndTable() {
	var searchBox = document.getElementById('textFilter');
	var query = (searchBox && searchBox.value) ? searchBox.value.trim() : '';
	var searchTextSpan = document.getElementById('searchText');
	var searchCountSpan = document.getElementById('searchCount');
	var tableBody = document.getElementById('tweetTable');

	if (!searchTextSpan || !searchCountSpan || !tableBody) return;

	searchTextSpan.innerText = query === '' ? '???' : query;

	var matching = [];
	if (search_index && query !== '') {
		var lowerQuery = query.toLowerCase();
		for (var index = 0; index < search_index.length; index++) {
			if (search_index[index].lowerText.indexOf(lowerQuery) >= 0) {
				matching.push(search_index[index]);
			}
		}
	}

	searchCountSpan.innerText = matching.length;

	var html = '';
	for (var row = 0; row < matching.length; row++) {
		var item = matching[row];
		html += '<tr><td>' + (row + 1) + '</td><td>' + item.activityEscaped + '</td><td>' + item.tweetCellHtml + '</td></tr>';
	}
	tableBody.innerHTML = html;
}

function addEventHandlerForSearch() {
	var searchBox = document.getElementById('textFilter');
	if (!searchBox) return;
	var debounceMs = 80;
	var timeoutId = null;
	searchBox.addEventListener('input', function() {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(function() {
			timeoutId = null;
			updateSearchAndTable();
		}, debounceMs);
	});
}

document.addEventListener('DOMContentLoaded', function () {
	loadSavedRunkeeperTweets().then(parseTweets);
});
