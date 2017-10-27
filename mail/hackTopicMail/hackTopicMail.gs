var BK = SpreadsheetApp.getActiveSpreadsheet(),
  REPLY_LIST = BK.getSheetByName("Reply Message List"),
  TARGET_MAIL_ADDRESS = "yukihirai0505@gmail.com",
// SlackApp Library Key => M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO
  SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');

/***
 * Send reply message automatically
 */
function replyToicMail() {
  var slackApp = SlackApp.create(SLACK_ACCESS_TOKEN);
  // Make query
  var query = 'to:(' + TARGET_MAIL_ADDRESS + ') -{cc:' + TARGET_MAIL_ADDRESS + '} is:unread -subject:Re -再送';
  var threads = GmailApp.search(query);
  for (var i = 0, t = threads.length; i < t; i++) {
    var thread = threads[i];
    var messages = thread.getMessages();
    for (var j = 0, m = messages.length; j < m; j++) {
      var message = messages[j];
      // Mark read first
      message.markRead();
      // Make body
      var body = getReplyMessage() + "\n\n\n\n" + message.getDate() + ' ' + message.getFrom() + '\n> ' + message.getPlainBody().replace(/\n/g, '\n> ');
      message.replyAll(body);
      postToSlack(slackApp);
    }
  }
}

/***
 * Get random reply message
 * @returns {*}
 */
function getReplyMessage() {
  // Get reply messages
  var lastRow = REPLY_LIST.getLastRow();
  var replyList = REPLY_LIST.getRange(2, 1, lastRow, 2).getValues().filter(function (e) {
    return e && e[0];
  });
  var notUsedReplyList = replyList.filter(function (e) {
    return !e[1];
  });
  // If empty, init SHEET
  if (notUsedReplyList.length === 0) {
    var initArr = [];
    var arrNum = lastRow - 1;
    for (var i = 0; i < arrNum; i++) {
      initArr[i] = [""];
    }
    REPLY_LIST.getRange(2, 2, arrNum, 1).setValues(initArr);
    return "Congratulations!!";
  }
  var randomReply = notUsedReplyList[Math.floor(Math.random() * notUsedReplyList.length)][0];
  var randomIndex = "";
  replyList.filter(function (e, i) {
    if (e[0] === randomReply) {
      randomIndex = i;
    }
  });
  REPLY_LIST.getRange(2 + randomIndex, 2).setValue("Sent");
  return randomReply;
}

/***
 * Post to slack
 * @param slackApp
 */
function postToSlack(slackApp) {
  var channelId = "@hirai_yuki";
  var message = "Sent reply message automatically";
  var options = {
    link_names: 1
  };
  slackApp.postMessage(channelId, message, options);
}
