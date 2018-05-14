// Using TwitterWebService Project Key: 1rgo8rXsxi1DxI_5Xgo_t3irTw1Y5cxl2mGSkbozKsSXf2E_KBBPC3xTF
var TWITTER_API_KEY = PropertiesService.getScriptProperties().getProperty('TWITTER_API_KEY'),
  TWITTER_API_SECRET = PropertiesService.getScriptProperties().getProperty('TWITTER_API_SECRET');

var twitterWebService = TwitterWebService.getInstance(
  TWITTER_API_KEY,
  TWITTER_API_SECRET
);

var METHOD_TYPES = {
    get: 'get',
    post: 'post'
  },
  BK = SpreadsheetApp.getActiveSpreadsheet(),
  FOLLOWERS_SHEET = BK.getSheetByName('FOLLOWERS'),
  FRIENDS_SHEET = BK.getSheetByName('FRIENDS');

// After execute authorize method, see log and copy and paste the url.
// After call the url, you can authorize your app
function authorize() {
  twitterWebService.authorize();
}

// Remove authorized app
function reset() {
  twitterWebService.reset();
}

// Callback for authorize
function authCallback(request) {
  return twitterWebService.authCallback(request);
}

function fetchJson(url, method, params) {
  var response;
  if (method === METHOD_TYPES.get) {
    response = twitterWebService.getService().fetch(url, {
      method: 'get'
    });
  } else if (method === METHOD_TYPES.post) {
    response = twitterWebService.getService().fetch(url, {
      method: 'post',
      payload: params
    });
  }
  return JSON.parse(response.getContentText());
}

// Get user account info by userIds
function usersLookup(userIds) {
  try {
    var url = 'https://api.twitter.com/1.1/users/lookup.json';
    var params = {
      user_id: userIds
    };
    return fetchJson(url, METHOD_TYPES.post, params);
  } catch (err) {
    return [{
      screen_name: userIds + ': ' + err.message
    }];
  }
}

function getFollowers() {
  // Get user's follower ids
  function followersIds(screenName) {
    var url = 'https://api.twitter.com/1.1/followers/ids.json?screen_name=' + screenName;
    return fetchJson(url, METHOD_TYPES.get);
  }

  var followerIds = followersIds('yabaiwebyasan');
  FOLLOWER_LIST_SHEET.getRange(1, 1, values.length, 1).setValues(values);
  // keys => ids, next_cursor, next_cursor_str, previous_cursor, previous_cursor_str
  /*
  var values = followerIds.ids.map(function (id) {
    return id.toString();
  }).eachSlice(100).map(function (userIds) {
    var lookupData = usersLookup(userIds)
      .map(function (account) {
        return [account.screen_name];
      });
    Logger.log(lookupData.length);
    return lookupData;
  }).flatten();
  FOLLOWER_LIST_SHEET.getRange(1, 1, values.length, 1).setValues(values)
  */
}

function getFriends() {
  function friendsIds(screenName) {
    var url = 'https://api.twitter.com/1.1/friends/ids.json?screen_name=' + screenName;
    return fetchJson(url, METHOD_TYPES.get);
  }

  var friends = friendsIds('yabaiwebyasan'),
    ids = friends.ids.map(function (id) {
      return [id];
    });
  FRIENDS_SHEET.getRange(1, 1, ids.length, 1).setValues(ids);
  Logger.log(friends.ids.length);
}

function setScreenNames() {
  var data = FRIENDS_SHEET.getRange(1, 1, FRIENDS_SHEET.getLastRow(), 1).getValues().map(function (id) {
    return usersLookup(id)
      .map(function (account) {
        return [account.screen_name];
      });
  }).flatten();
  Logger.log(data);
  FRIENDS_SHEET.getRange(1, 2, data.length, 1).setValues(data);
}

Array.prototype.eachSlice = function (size) {
  this.arr = [];
  for (var i = 0, l = this.length; i < l; i += size) {
    this.arr.push(this.slice(i, i + size))
  }
  return this.arr
};

Array.prototype.flatten = function () {
  return this.reduce(
    function (accumulator, currentValue) {
      return accumulator.concat(currentValue);
    },
    []
  );
};