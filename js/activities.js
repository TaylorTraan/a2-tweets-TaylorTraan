var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function cap(string) {
	return string && string.charAt(0).toUpperCase() + string.slice(1) || '';
}

function getCompletedTweets(tweetArray) {
	var completed = [];
	for (var index = 0; index < tweetArray.length; index++) {
		var tweet = tweetArray[index];
		if (tweet.source === 'completed_event' && tweet.activityType && tweet.activityType !== 'unknown') {
			completed.push(tweet);
		}
	}
	return completed;
}

function getCountByType(completedTweets) {
	var countByType = {};
	for (var index = 0; index < completedTweets.length; index++) {
		var activityType = completedTweets[index].activityType;
		countByType[activityType] = (countByType[activityType] || 0) + 1;
	}
	return countByType;
}

function getTop3Types(countByType) {
	var activityTypes = Object.keys(countByType);
	activityTypes.sort(function(firstType, secondType) {
		return countByType[secondType] - countByType[firstType];
	});
	return activityTypes.slice(0, 3);
}

function getMeanDistanceByType(completedTweets, topThreeTypes) {
	var sumByType = {}, countByType = {};
	for (var index = 0; index < topThreeTypes.length; index++) {
		sumByType[topThreeTypes[index]] = 0;
		countByType[topThreeTypes[index]] = 0;
	}
	for (var index = 0; index < completedTweets.length; index++) {
		var tweet = completedTweets[index];
		if (topThreeTypes.indexOf(tweet.activityType) >= 0 && tweet.distance > 0) {
			sumByType[tweet.activityType] += tweet.distance;
			countByType[tweet.activityType]++;
		}
	}
	var meanByType = {};
	for (var index = 0; index < topThreeTypes.length; index++) {
		var activityType = topThreeTypes[index];
		meanByType[activityType] = countByType[activityType] > 0
			? sumByType[activityType] / countByType[activityType] : 0;
	}
	return meanByType;
}

function getWeekdayOrWeekendLonger(completedTweets) {
	var weekdaySum = 0, weekdayCount = 0, weekendSum = 0, weekendCount = 0;
	for (var index = 0; index < completedTweets.length; index++) {
		var tweet = completedTweets[index];
		if (tweet.distance <= 0) continue;
		var dayOfWeek = tweet.time.getDay();
		if (dayOfWeek === 0 || dayOfWeek === 6) {
			weekendSum += tweet.distance;
			weekendCount++;
		} else {
			weekdaySum += tweet.distance;
			weekdayCount++;
		}
	}
	var weekdayAverage = weekdayCount > 0 ? weekdaySum / weekdayCount : 0;
	var weekendAverage = weekendCount > 0 ? weekendSum / weekendCount : 0;
	return weekdayAverage >= weekendAverage ? 'weekday' : 'weekend';
}

function buildActivityChartData(countByType) {
	var activityTypes = Object.keys(countByType);
	return activityTypes.map(function(activityType) {
		return { activityType: activityType, count: countByType[activityType] };
	});
}

function buildDistanceChartData(completedTweets, topThreeTypes) {
	var data = [];
	for (var index = 0; index < completedTweets.length; index++) {
		var tweet = completedTweets[index];
		if (topThreeTypes.indexOf(tweet.activityType) >= 0 && tweet.distance > 0) {
			data.push({
				activityType: tweet.activityType,
				dayOfWeek: DAY_NAMES[tweet.time.getDay()],
				distance: tweet.distance
			});
		}
	}
	return data;
}

function buildMeanDistanceByDayData(distanceChartData) {
	var groupedByActivityAndDay = {};
	for (var index = 0; index < distanceChartData.length; index++) {
		var row = distanceChartData[index];
		var groupKey = row.activityType + '|' + row.dayOfWeek;
		if (!groupedByActivityAndDay[groupKey]) {
			groupedByActivityAndDay[groupKey] = {
				activityType: row.activityType,
				dayOfWeek: row.dayOfWeek,
				sum: 0,
				count: 0
			};
		}
		groupedByActivityAndDay[groupKey].sum += row.distance;
		groupedByActivityAndDay[groupKey].count++;
	}
	var result = [];
	for (var groupKey in groupedByActivityAndDay) {
		var group = groupedByActivityAndDay[groupKey];
		result.push({
			activityType: group.activityType,
			dayOfWeek: group.dayOfWeek,
			meanDistance: group.count > 0 ? group.sum / group.count : 0
		});
	}
	return result;
}

function parseTweets(runkeeper_tweets) {
	if (runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	var completed = getCompletedTweets(tweet_array);
	var countByType = getCountByType(completed);
	var activityTypes = Object.keys(countByType);
	var topThreeTypes = getTop3Types(countByType);
	var meanByType = getMeanDistanceByType(completed, topThreeTypes);

	var sortedByMean = topThreeTypes.slice().sort(function(firstType, secondType) {
		return meanByType[secondType] - meanByType[firstType];
	});
	var longestActivityType = sortedByMean[0];
	var shortestActivityType = sortedByMean[sortedByMean.length - 1];
	var weekdayOrWeekend = getWeekdayOrWeekendLonger(completed);

	// Update DOM
	document.getElementById('numberActivities').innerText = activityTypes.length;
	document.getElementById('firstMost').innerText = cap(topThreeTypes[0]);
	document.getElementById('secondMost').innerText = cap(topThreeTypes[1]);
	document.getElementById('thirdMost').innerText = cap(topThreeTypes[2]);
	document.getElementById('longestActivityType').innerText = cap(longestActivityType);
	document.getElementById('shortestActivityType').innerText = cap(shortestActivityType);
	document.getElementById('weekdayOrWeekendLonger').innerText = weekdayOrWeekend;

	// Bar chart: count by activity type
	var activityChartData = buildActivityChartData(countByType);
	activity_vis_spec = {
		'$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
		'description': 'Number of tweets per activity type.',
		'data': { 'values': activityChartData },
		'mark': 'bar',
		'encoding': {
			'x': { 'field': 'activityType', 'type': 'nominal', 'sort': '-y', 'title': 'Activity type' },
			'y': { 'field': 'count', 'type': 'quantitative', 'title': 'Count' }
		}
	};
	vegaEmbed('#activityVis', activity_vis_spec, { actions: false });

	// Distance chart: one container, spec and data change when the aggregate button is pressed
	var distanceChartData = buildDistanceChartData(completed, topThreeTypes);
	var aggregatedData = buildMeanDistanceByDayData(distanceChartData);

	var distanceVisSpecPoints = {
		'$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
		'description': 'Distance by day of week for the three most tweeted activities.',
		'data': { 'values': distanceChartData },
		'mark': 'point',
		'encoding': {
			'x': { 'field': 'dayOfWeek', 'type': 'ordinal', 'sort': DAY_NAMES, 'title': 'Day of week' },
			'y': { 'field': 'distance', 'type': 'quantitative', 'title': 'Distance (mi)' },
			'color': { 'field': 'activityType', 'type': 'nominal', 'title': 'Activity type' }
		}
	};

	var distanceVisSpecMeans = {
		'$schema': 'https://vega.github.io/schema/vega-lite/v5.json',
		'description': 'Mean distance by day of week for the three most tweeted activities.',
		'data': { 'values': aggregatedData },
		'mark': 'point',
		'encoding': {
			'x': { 'field': 'dayOfWeek', 'type': 'ordinal', 'sort': DAY_NAMES, 'title': 'Day of week' },
			'y': { 'field': 'meanDistance', 'type': 'quantitative', 'title': 'Mean distance (mi)' },
			'color': { 'field': 'activityType', 'type': 'nominal', 'title': 'Activity type' }
		}
	};

	var showingMeans = false;
	var distanceVisContainer = document.getElementById('distanceVis');
	vegaEmbed('#distanceVis', distanceVisSpecPoints, { actions: false });

	document.getElementById('aggregate').addEventListener('click', function() {
		showingMeans = !showingMeans;
		distanceVisContainer.innerHTML = '';
		vegaEmbed(distanceVisContainer, showingMeans ? distanceVisSpecMeans : distanceVisSpecPoints, { actions: false });
		document.getElementById('aggregate').innerText = showingMeans ? 'Show all activities' : 'Show means';
	});
}

document.addEventListener('DOMContentLoaded', function() {
	loadSavedRunkeeperTweets().then(parseTweets);
});
