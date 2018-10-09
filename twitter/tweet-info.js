var TWITTER_SHEET = bk.getSheetByName('twitter');

// OAuth1 Library => 1CXDCY5sqT9ph64fFwSzVtXnbjpSfWdRymafDrtIZ7Z_hwysTY7IIhi7s
function setTweetsInfo() {
  function getTwitterService() {
    return OAuth1.createService('Twitter')
      .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
      .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
      .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
      .setConsumerKey(getScriptProperty('TWITTER_COMSUMER_KEY'))
      .setConsumerSecret(getScriptProperty('TWITTER_COMSUMER_SECRET'))
      .setAccessToken(getScriptProperty('TWITTER_ACCESS_TOKEN'), getScriptProperty('TWITTER_ACCESS_SECRET'));
  }

  function getTweetInfo(id) {
    var res = getTwitterService().fetch('https://api.twitter.com/1.1/statuses/show.json?id=' + id);
    return JSON.parse(res);
  }

  var range = TWITTER_SHEET.getRange(3, 2, TWITTER_SHEET.getLastRow(), 13),
    data = range.getValues().map(function (e) {
      var url = e[0];
      if (url) {
        var id = url.match(/status\/(\d*)/)[1],
          tweetInfo = getTweetInfo(id);
        e[1] = tweetInfo.user.screen_name;
        e[2] = tweetInfo.user.name;
        e[3] = new Date(tweetInfo.created_at);
        e[4] = tweetInfo.text;
      }
      return e;
    });
  range.setValues(data);
}

function getScriptProperty(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}
