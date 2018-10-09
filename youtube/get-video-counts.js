function setYoutubeData() {
  var keyQuery = '&key=' + YOUTUBE_DATA_API_KEY,
    flgRange = YOUTUBE_SHEET.getRange(1, 1, 2, 1).getValues(),
    prFlg = flgRange[0][0],
    top3Flg = flgRange[1][0];

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

  function filterPR(videoList) {
    return videoList.filter(function (video) {
      if (video.snippet.description.match(/提供/)) {
        return video;
      }
    });
  }

  function getTop3ViewCountVideos(videoList) {
    var sortedVideo = videoList.sort(function (a, b) {
      return b.statistics.viewCount - a.statistics.viewCount;
    });
    return sortedVideo.slice(0, 3);
  }

  function filterVideoByDate(videoList, date, isLessThan) {
    return videoList.filter(function (video) {
      if (!isLessThan) {
        if (new Date(video.snippet.publishedAt).getTime() >= date.getTime()) {
          return video;
        }
      } else {
        if (new Date(video.snippet.publishedAt).getTime() <= date.getTime()) {
          return video;
        }
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
      if (videoList.length - _videosWithinMonth.length < 35 && nextPageToken) {
        getVideos(nextPageToken);
      }
    }

    getVideos();
    if (prFlg) {
      videosWithinMonth = filterPR(videosWithinMonth);
      videoList = filterPR(videoList);
    }
    if (top3Flg) {
      videosWithinMonth = getTop3ViewCountVideos(videosWithinMonth);
      videoList = getTop3ViewCountVideos(videoList);
    }
    return {
      title: videos[0].snippet.channelTitle,
      withinMonth: videosWithinMonth.slice(0, 15),
      beforeMonth: filterVideoByDate(videoList, ONE_MONTH_AGO, true).slice(0, 15)
    };
  }

  var range = YOUTUBE_SHEET.getRange(4, 1, YOUTUBE_SHEET.getLastRow(), 12);
  var data = range.getValues().map(function (e, i) {
    var channelUrl = e[0],
      cellNum = i + 4,
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
          e[10] = video.withinMonth.map(function (video) {
            return 'https://youtu.be/' + video.id;
          }).join('\n');
          e[11] = video.beforeMonth.map(function (video) {
            return 'https://youtu.be/' + video.id;
          }).join('\n');
        }
      } catch (err) {
        e[8] = err.message;
      }
    }
    return e;
  });
  range.setValues(data);
}
