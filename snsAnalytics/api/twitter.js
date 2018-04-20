// Using TwitterWebService Project Key: 1rgo8rXsxi1DxI_5Xgo_t3irTw1Y5cxl2mGSkbozKsSXf2E_KBBPC3xTF

var TWITTER_API_KEY = PropertiesService.getScriptProperties().getProperty('TWITTER_API_KEY'),
  TWITTER_API_SECRET = PropertiesService.getScriptProperties().getProperty('TWITTER_API_SECRET');

var twitterWebService = TwitterWebService.getInstance(
  TWITTER_API_KEY,
  TWITTER_API_SECRET
);

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

// Post test tweet
function postUpdateStatus(message) {
  var service = twitterWebService.getService();
  var response = service.fetch('https://api.twitter.com/1.1/statuses/update.json', {
    method: 'post',
    payload: {status: message}
  });
}

// Search users by query
function usersSearch(accountName) {
  var service = twitterWebService.getService();
  return service.fetch('https://api.twitter.com/1.1/users/search.json?q=' + accountName, {
    method: 'get'
  });
}

// Twitter User Account Info API
function doGet(e) {
  var accountName = e.parameter.q;
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  if(accountName){
    var response = usersSearch(accountName);
    output.setContent(response.getContentText());
  }else{
    output.setContent('not found q parameter');
  }
  return output;
}

function doPost(e) {
  postUpdateStatus(e.parameter.message);
}