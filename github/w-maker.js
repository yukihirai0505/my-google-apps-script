var OWNER = 'yukihirai0505',
  REPO = 'github-w-maker',
  // GitHub access token from https://github.com/settings/tokens
  GITHUB_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('GITHUB_ACCESS_TOKEN'),
  CREATE_FILE_URL = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/:path?access_token=' + GITHUB_ACCESS_TOKEN;

// Create a file => https://developer.github.com/v3/repos/contents/#create-a-file
function createFile() {
  var message = 'w maker bot',
    params = {
      message: message,
      committer: {
        name: 'GitHub w Maker bot',
        email: 'example@ex.com'
      },
      content: Utilities.base64Encode(message)
    },
    data = fetchJson(CREATE_FILE_URL.replace(':path', getRandomString()), 'PUT', params);
  Logger.log(data);
}

function fetchJson(url, method, params) {
  var options = {
    method: method,
    payload: JSON.stringify(params)
  };
  return JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
}

function getRandomString() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}