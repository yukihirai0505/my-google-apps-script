var OWNER = 'yukihirai0505',
  REPO = 'github-w-maker',
  // GitHub access token from https://github.com/settings/tokens
  GITHUB_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('GITHUB_ACCESS_TOKEN'),
  GITHUB_BASE_API_URL = 'https://api.github.com',
  REPOSITORY_CONTENTS_URL = GITHUB_BASE_API_URL + '/repos/' + OWNER + '/' + REPO + '/contents/' + '?access_token=' + GITHUB_ACCESS_TOKEN,
  FILE_PATH_PLACEHOLDER = ':path',
  FILE_URL = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + FILE_PATH_PLACEHOLDER + '?access_token=' + GITHUB_ACCESS_TOKEN;

// Create a file => https://developer.github.com/v3/repos/contents/#create-a-file
function createFile() {
  var message = 'create file randomly',
    params = {
      message: message,
      committer: {
        name: 'yukihirai0505',
        email: 'hogehoge@gmail.com'
      },
      content: Utilities.base64Encode(message)
    },
    data = fetchJson(FILE_URL.replace(FILE_PATH_PLACEHOLDER, getRandomString()), 'PUT', params);
  Logger.log(data);
}

function deleteRandomFile() {
  var files = fetchJson(REPOSITORY_CONTENTS_URL, 'GET'),
    file = files[0],
    params = {
      message: 'delete file randomly',
      committer: {
        name: 'yukihirai0505',
        email: 'hogehoge@gmail.com'
      },
      sha: file.sha
    },
    data = fetchJson(FILE_URL.replace(FILE_PATH_PLACEHOLDER, file.name), 'DELETE', params);
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