// SlackApp Library Key => M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO
var SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN'),
  SLACK_VERIFY_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_VERIFY_TOKEN');

/***
 * slack out-going api will use this method.
 * And get slack out-going api parameters and create pretending to work message,
 * then post the message to slack as user.
 * @param e
 */
function doPost(e) {
  var param = e.parameter;
  // Verify slack post
  if (SLACK_VERIFY_TOKEN !== param.token) {
    throw new Error("invalid token.");
  }
  var text = param.text;
  var username = "@" + param.user_name;
  var slackApp = SlackApp.create(SLACK_ACCESS_TOKEN);
  var channelId = e.parameter.channel_id;
  var message = "";
  if (text.match(/良さそう|よさそう|よさげ/)) {
    message = username + "\n:muscle:";
  }
  if (text.match(/承知|かしこ/)) {
    message = username + "\n:sparkles:"
  }
  if (text.match(/すみません|ごめん|申し訳|pull|お願い/)) {
    message = username + "\n:ok_hand:"
  }
  if (text.match(/ありがとう|有難う/)) {
    message = username + "\nこちらこそ有難う御座います:sparkles:";
  }
  if (text.match(/超SPEED|超スピード/)) {
    message += "\n超SPEED!:bicyclist::bicyclist::bicyclist::bicyclist::bicyclist:";
  }
  if (text.match(/\?|？/)) {
    message = username + "\n調べてみるので、少々お時間頂きます:bow:\n\n>" + text;
  }
  if (text.match(/[なに|何|いつ|どこ|誰|だれ|どのくらい|なぜ|どう](.*)[？|?]/)) {
    message = "";
  }
  var options = {
    as_user: true,
    link_names: 1
  };
  if (message) {
    slackApp.postMessage(channelId, message, options);
  }
}