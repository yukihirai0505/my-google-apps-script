// SlackApp Library Key => M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO
var SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
var OWNER= "yukihirai0505";
var REPO = "my-google-apps-script";
// GitHub access token from https://github.com/settings/tokens
var GITHUB_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('GITHUB_ACCESS_TOKEN');
var CREATE_ISSUE_URL = "https://api.github.com/repos/"+OWNER+"/"+REPO+"/issues?access_token="+GITHUB_ACCESS_TOKEN;

/***
 * request to GitHub api to create a new Issue
 * @param title
 * @param body
 * @param owner
 */
function sendGitHubRequest(title, body, owner) {
  var payload = JSON.stringify({
    "title": "【Help】" + title,
    "body" : "## Summary\n\n" + body +"\n\nMade by: "+ owner
  });
  var options = {
    "method" : "POST",
    "payload" : payload
  };
  return JSON.parse(UrlFetchApp.fetch(CREATE_ISSUE_URL, options).getContentText());
}

/***
 * post the result to slack
 * @param data
 */
function postToSlack(data) {
  var slackApp = SlackApp.create(SLACK_ACCESS_TOKEN);
  var options = {
    username: "Irre･Gula",
    link_names: 1,
    icon_url: "https://cpimages.s3.amazonaws.com/uploads/questionnaire_detail_image/s3_image/18241/large_rahu2.jpg"
  };
  slackApp.postMessage(data.channelId, data.message, options);
}

/***
 * make json from slack out going api parameters and GitHub response
 * @param e
 * @returns {{message: string, channelId: *}}
 */
function makeResponse(e){
  var param = e.parameter;
  var channelId = param.channel_id;
  var owner = param.user_name;
  var texts = param.text.split(" ");
  var title = getText(texts[1]);
  var body = getText(texts[2]);
  var mention = getText(texts[3]);
  var response = sendGitHubRequest(title, body, owner);
  return {
    "message": mention + "\nI'm always thankful for the help:sparkles:\n\nPlease check this following url:four_leaf_clover:\n" + response.html_url,
    "channelId": channelId
  };
}

/***
 * if the text is empty, undefined, null, it will be empty string.
 * @param text
 * @returns {string}
 */
function getText(text) {
  return text ? text: "";
}

/***
 * slack out-going api will use this method.
 * And get slack out-going api parameters and create pretending to work message,
 * then post the message to slack as user.
 * @param e
 */
function doGet(e) {
  return postToSlack( makeResponse(e) );
}

/***
 * slack out-going api will use this method.
 * And get slack out-going api parameters and create pretending to work message,
 * then post the message to slack as user.
 * @param e
 */
function doPost(e) {
  return postToSlack( makeResponse(e) );
}