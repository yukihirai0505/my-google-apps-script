var BK = SpreadsheetApp.getActiveSpreadsheet(),
  URL_PARAMS_SHEEAT = BK.getSheetByName('url_params'),
  COMMENTS_SHEET = BK.getSheetByName('comments');

function onOpen() {
  function showMenu() {
    var menu = [
      {name: 'Get Reddit Comments', functionName: 'getRedditComments'}
    ];
    BK.addMenu('Custom Management', menu);
  }

  showMenu();
}

function getRedditComments() {
  function getReplies(e, replies) {
    if (!e.data.body) {
      return replies;
    }

    replies.push([e.data.body]);

    if (e.data.replies.data) {
      e.data.replies.data.children.forEach(function (reply) {
        return getReplies(reply, replies);
      });
    }
    return replies;
  }

  var topic,
    comments = [],
    json = getCommentsJson();
  json.forEach(function (e) {
    return e.data.children.forEach(function (e) {
      if (e.kind === "t3") {
        topic = e.data.selftext;
      } else if (e.kind === "t1") {
        comments = comments.concat(getReplies(e, []))
      }
    });
  });
  comments.unshift([topic]);
  COMMENTS_SHEET.getRange(1, 1).setValue('cleaning now...');
  COMMENTS_SHEET.getRange(1, 1, COMMENTS_SHEET.getLastRow(), 1).clear();
  COMMENTS_SHEET.getRange(1, 1, comments.length, 1).setValues(comments);
}

function getCommentsJson() {
  var params = URL_PARAMS_SHEEAT.getRange(2, 1, 1, 2).getValues(),
    subreddit = params[0][0],
    articleId = params[0][1];
  var response = UrlFetchApp.fetch(
    'https://www.reddit.com/r/' + subreddit + '/comments/' + articleId + '.json',
    {
      muteHttpExceptions: true
    }
  );
  return JSON.parse(response)
}