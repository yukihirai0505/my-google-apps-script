// Using TwitterWebService Project Key: 1rgo8rXsxi1DxI_5Xgo_t3irTw1Y5cxl2mGSkbozKsSXf2E_KBBPC3xTF
var TWITTER_WEB_SERVICE = TwitterWebService.getInstance(
  PropertiesService.getScriptProperties().getProperty('TWITTER_API_KEY'),
  PropertiesService.getScriptProperties().getProperty('TWITTER_API_SECRET')
  ).getService,
  METHOD_TYPES = {
    get: 'get',
    post: 'post'
  };

// After execute authorize method, see log and copy and paste the url.
// After call the url, you can authorize your app
function authorize() {
  TWITTER_WEB_SERVICE.authorize();
}

// Remove authorized app
function reset() {
  TWITTER_WEB_SERVICE.reset();
}

// Callback for authorize
function authCallback(request) {
  return TWITTER_WEB_SERVICE.authCallback(request);
}

function fetchJson(url, method, params) {
  var response;
  if (method === METHOD_TYPES.get) {
    response = TWITTER_WEB_SERVICE.fetch(url, {
      method: 'get'
    });
  } else if (method === METHOD_TYPES.post) {
    response = TWITTER_WEB_SERVICE.fetch(url, {
      method: 'post',
      payload: params
    });
  }
  return JSON.parse(response.getContentText());
}

// Get user account info by userIds
function usersLookup(userIds) {
  var url = 'https://api.twitter.com/1.1/users/lookup.json';
  var params = {
    user_id: userIds.join(',')
  };
  return fetchJson(url, METHOD_TYPES.post, params);
}

// Get user's follower ids
function followersIds(accountName) {
  var url = 'https://api.twitter.com/1.1/followers/ids.json?screen_name=' + accountName;
  return fetchJson(url, METHOD_TYPES.get);
}

function test() {
  followersIds('yabaiwebyasan').ids.eachSlice(100).forEach(function (userIds) {
    Logger.log(userIds.length);
    Logger.log(usersLookup(userIds));
  });
}

Array.prototype.eachSlice = function (size) {
  this.arr = [];
  for (var i = 0, l = this.length; i < l; i += size) {
    this.arr.push(this.slice(i, i + size))
  }
  return this.arr
};