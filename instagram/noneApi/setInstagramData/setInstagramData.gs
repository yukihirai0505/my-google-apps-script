var BK = SpreadsheetApp.getActiveSpreadsheet(),
  SHEETS = BK.getSheets(),
  SHEET = SHEETS[0],
  TODAY = new Date();

/***
 * Hook open spreadsheet
 */
function onOpen() {
  showMenu();
}

/***
 * show custom menu
 */
function showMenu() {
  var menu = [
    {name: "Set Instagram Data", functionName: "setInstagramData"}
  ];
  BK.addMenu("Custom Menu", menu);
}

/***
 * Set Instagram data
 */
function setInstagramData() {
  var postRange = SHEET.getRange(3, 2, SHEET.getLastRow(), 13);
  var data = postRange.getValues().map(function (e) {
    return getPostData(e);
  });
  postRange.setValues(data);
}

/***
 * Get Instagram data
 * @param post
 * @returns {*}
 */
function getPostData(post) {
  var postUrl = post[0],
    orgImageUrl = post[1],
    orgPostDate = post[6];
  post[2] = "=IMAGE(\"" + orgImageUrl + "\")";
  if (!postUrl) {
    return post;
  }
  if (orgPostDate) {
    var diff = (TODAY.getTime() - orgPostDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 7) {
      return post;
    }
  }

  try {
    var postObj = requestJson(postUrl);
    var postData = postObj.entry_data.PostPage[0].graphql.shortcode_media,
      ownerData = postObj.entry_data.PostPage[0].graphql.shortcode_media.owner,
      videoViewCount = postData.video_view_count,
      imageUrl = postData.display_url,
      userName = ownerData.full_name,
      userAccountName = ownerData.username;

    var userObj = requestJson('https://www.instagram.com/' + userAccountName + '/').entry_data.ProfilePage[0].graphql.user,
      followerNum = userObj.edge_followed_by.count,
      postDate = new Date(postData.taken_at_timestamp * 1000),
      likeNum = postData.edge_media_preview_like.count,
      commentNum = postData.edge_media_to_comment.count,
      text = postData.edge_media_to_caption.edges[0].node.text,
      hashTag = text.match(/#[a-zA-Z0-9_\u3041-\u3094\u3099-\u309C\u30A1-\u30FA\u3400-\uD7FF\uFF10-\uFF19\uFF20-\uFF3A\uFF41-\uFF5A\uFF66-\uFF9E][\w-]*/ig),
      comments = postData.edge_media_to_comment.edges.map(function (e, i, arr) {
        return e.node.owner.username + ": " + e.node.text;
      }).join("\n");
    return [
      postUrl, imageUrl, "=IMAGE(\"" + imageUrl + "\")", userName, userAccountName, followerNum, postDate, likeNum, commentNum, videoViewCount, text, hashTag ? hashTag.join("\n") : hashTag, comments
    ];
  } catch (err) {
    post[2] = err.message;
    return post;
  }
}

function requestJson(url) {
  Utilities.sleep(1500);
  var rs = UrlFetchApp.fetch(url, {muteHttpExceptions: true}).getContentText().match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
  return JSON.parse(rs[1]);
}