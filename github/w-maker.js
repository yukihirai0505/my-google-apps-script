var OWNER = "yukihirai0505",
  REPO = "github-w-maker",
  // GitHub access token from https://github.com/settings/tokens
  GITHUB_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('GITHUB_ACCESS_TOKEN'),
  CREATE_COMMIT_URL = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/git/commits?access_token=" + GITHUB_ACCESS_TOKEN,
  CREATE_FILE_URL = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/:path?access_token=" + GITHUB_ACCESS_TOKEN;

// Create a file api => https://developer.github.com/v3/repos/contents/#create-a-file
function createFile() {
  var message = 'w maker bot',
    payload = JSON.stringify({
      message: message,
      committer: {
        name: 'GitHub w Maker bot',
        email: 'example@ex.com'
      },
      content: Utilities.base64Encode(message)
    }),
    options = {
      "method": "PUT",
      "payload": payload
    };
  const data = JSON.parse(UrlFetchApp.fetch(CREATE_FILE_URL.replace(':path', getRandomString()), options).getContentText());
  Logger.log(data);
}

function getRandomString() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}