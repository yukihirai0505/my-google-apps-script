// SlackApp Library Key => M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO
var SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
var OWNER= "yukihirai0505";
var REPO = "my-google-apps-script";
// GitHub access token from https://github.com/settings/tokens
var GITHUB_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('GITHUB_ACCESS_TOKEN');
var CREATE_ISSUE_URL = "https://api.github.com/repos/"+OWNER+"/"+REPO+"/issues?access_token="+GITHUB_ACCESS_TOKEN;

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

function postToSlack(data) {
  var slackApp = SlackApp.create(SLACK_ACCESS_TOKEN);
  var options = {
    username: "Irre･Gula",
    link_names: 1,
    icon_url: "https://cpimages.s3.amazonaws.com/uploads/questionnaire_detail_image/s3_image/18241/large_rahu2.jpg"
  };
  slackApp.postMessage(data.channelId, data.message, options);
}

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

function getText(text) {
  return text ? text: "";
}

function doGet(e) {
  return postToSlack( makeResponse(e) );
}

function doPost(e) {
  return postToSlack( makeResponse(e) );
}