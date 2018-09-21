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

  function getSubscribeCount(_channelId) {
    var channelId = '&id=' + _channelId,
      url = 'https://www.googleapis.com/youtube/v3/channels?part=statistics'
        + channelId
        + keyQuery;
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

  function getVideo(channelId) {
    var videos = [],
      videoIds = '',
      videoList = [],
      videosWithinMonth = [];

    function getVideos(pageToken) {
      var result = searchChannelVideos(channelId, pageToken),
        _videos = result.items.filter(function (video) {
            if (video.id.kind === 'youtube#video') {
              return video;
            }
          }
        ),
        _videoIds = _videos.map(function (video) {
          return video.id.videoId;
        }).join(','),
        _videoList = getVideoList(_videoIds).items,
        _videosWithinMonth = filterVideoByDate(_videoList, ONE_MONTH_AGO);

      videos.push.apply(videos, _videos);
      videoIds += _videoIds;
      videoList.push.apply(videoList, _videoList);
      videosWithinMonth.push.apply(videosWithinMonth, _videosWithinMonth);

      var nextPageToken = result.nextPageToken;
      if (_videosWithinMonth.length > 35 && nextPageToken) {
        getVideos(nextPageToken);
      }
    }

    getVideos();
    return {
      title: videos[0].snippet.channelTitle,
      withinMonth: videosWithinMonth.slice(0, 15),
      beforeMonth: videoList.filter(function (video) {
        if (new Date(video.snippet.publishedAt).getTime() <= ONE_MONTH_AGO.getTime()) {
          return video;
        }
      }).slice(0, 15)
    };
  }

  var range = YOUTUBE_SHEET.getRange(2, 1, YOUTUBE_SHEET.getLastRow(), 10);
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
          var video = getVideo(channelId);
          e[1] = video.title;
          e[2] = channelId;
          e[3] = getSubscribeCount(channelId).items[0].statistics.subscriberCount;
          e[4] = average(video.withinMonth.slice(0, 6), function (v) {
            return v.statistics.viewCount;
          }, true);
          e[5] = average(video.beforeMonth, function (v) {
            return v.statistics.viewCount;
          }, true);
          e[6] = average(video.withinMonth, function (v) {
            return v.statistics.likeCount;
          }, true);
          e[7] = average(video.withinMonth, function (v) {
            return v.statistics.dislikeCount;
          }, true);
          e[8] = average(video.withinMonth, function (v) {
            return v.statistics.commentCount;
          }, true);
          e[9] = '=(G' + cellNum + '+I' + cellNum + ')/' + average(video.withinMonth, function (v) {
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
