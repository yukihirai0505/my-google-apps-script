function setYoutubeData() {
  var keyQuery = '&key=' + YOUTUBE_DATA_API_KEY;

  function average(arr, fn, withEqual) {
    if (arr.length > 0) {
      var formula = 'AVERAGE(' + arr.map(fn).join(',') + ')';
      return withEqual ? '=' + formula : formula;
    }
    return withEqual ? '=0' : 0;
  }

  function searchChannelVideos(_channelId, _pageToken) {
    var channelId = '&channelId=' + _channelId,
      pageToken = _pageToken ? '&pageToken=' + _pageToken : '',
      maxResults = '&maxResults=50',
      order = '&order=date',
      url = 'https://www.googleapis.com/youtube/v3/search?part=snippet'
        + channelId
        + pageToken
        + maxResults
        + keyQuery
        + order;
    return fetchJson(url);
  }

  function getVideoList(_videoIds, _pageToken) {
    var videoIds = '&id=' + _videoIds,
      pageToken = _pageToken ? '&pageToken=' + _pageToken : '',
      maxResults = '&maxResults=50',
      url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics'
        + videoIds
        + pageToken
        + maxResults
        + keyQuery;
    return fetchJson(url);
  }

  function getChannelId(_userId) {
    var userId = '&forUsername=' + _userId,
      url = 'https://www.googleapis.com/youtube/v3/channels?part=id'
        + userId
        + keyQuery;
    return fetchJson(url);
  }

  function filterVideoByDate(videoList, date) {
    return videoList.filter(function (video) {
      if (new Date(video.snippet.publishedAt).getTime() >= date.getTime()) {
        return video;
      }
    });
  }

  var range = YOUTUBE_SHEET.getRange(2, 1, YOUTUBE_SHEET.getLastRow(), 9);
  var data = range.getValues().map(function (e, i) {
    var channelUrl = e[0],
      cellNum = i + 2,
      channelId;
    if (channelUrl) {
      try {
        var channelMatch = channelUrl.match(/.*\/channel\/([^/]*)/);
        if (channelMatch) {
          channelId = channelMatch[1];
        } else {
          var userMatch = channelUrl.match(/.*\/user\/([^/]*)/),
            userId = userMatch[1];
          channelId = getChannelId(userId).items[0].id
        }
        if (channelId) {
          var videos = searchChannelVideos(channelId).items.filter(function (video) {
              if (video.id.kind === 'youtube#video') {
                return video;
              }
            }
            ),
            videoIds = videos.map(function (video) {
              return video.id.videoId;
            }).join(','),
            videoList = getVideoList(videoIds).items,
            videosWithinMonth = filterVideoByDate(videoList, ONE_MONTH_AGO).slice(0, 15),
            videosBeforeMonth = videoList.filter(function (video) {
              if (new Date(video.snippet.publishedAt).getTime() <= ONE_MONTH_AGO.getTime()) {
                return video;
              }
            }).slice(0, 15);
          e[1] = videos[0].snippet.channelTitle;
          e[2] = channelId;
          e[3] = average(videosWithinMonth.slice(0, 6), function (v) {
            return v.statistics.viewCount;
          }, true);
          e[4] = average(videosBeforeMonth, function (v) {
            return v.statistics.viewCount;
          }, true);
          e[5] = average(videosWithinMonth, function (v) {
            return v.statistics.likeCount;
          }, true);
          e[6] = average(videosWithinMonth, function (v) {
            return v.statistics.dislikeCount;
          }, true);
          e[7] = average(videosWithinMonth, function (v) {
            return v.statistics.commentCount;
          }, true);
          e[8] = '=(F' + cellNum + '+H' + cellNum + ')/' + average(videosWithinMonth, function (v) {
            return v.statistics.viewCount;
          }, false);

        }
      } catch (err) {
        e[8] = err.message;
      }
    }
    return e;
  });
  range.setValues(data);
}