var BK = SpreadsheetApp.getActiveSpreadsheet(),
  HASH_TAG_SHEET = BK.getSheetByName("該当ハッシュタグ群"),
  POST_SHEET = BK.getSheetByName("該当投稿群");

function onOpen() {
  function showMenu() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var menu = [
      {name: "投稿データ取得", functionName: "setPostData"}
    ];
    ss.addMenu("Instagram管理用メニュー", menu);
  }

  showMenu();
}

function setTagCount(url) {
  var tagJson = getJson(url);
  var tagData = tagJson.entry_data.TagPage[0].tag;
  return tagData.media.count;
}

function setPostData() {
  function setTagData(hashTags) {
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    var tags = hashTags.filter(onlyUnique).map(function (tag) {
      var tagUrl = encodeURI("https://www.instagram.com/explore/tags/" + tag.replace("#", ""));
      return [
        tag, '=setTagCount("' + tagUrl + '")', tagUrl
      ];
    });
    HASH_TAG_SHEET.getRange(2, 1, HASH_TAG_SHEET.getLastRow(), 3).clear();
    if (tags.length > 0) {
      HASH_TAG_SHEET.getRange(2, 1, tags.length, 3).setValues(tags);
    }
  }

  function getTags(text) {
    var tags = text.match(/#[a-zA-Z0-9_\u3041-\u3094\u3099-\u309C\u30A1-\u30FA\u3400-\uD7FF\uFF10-\uFF19\uFF20-\uFF3A\uFF41-\uFF5A\uFF66-\uFF9E][\w-]*/ig);
    return tags ? tags : [];
  }

  var posts = POST_SHEET.getRange(3, 2, POST_SHEET.getLastRow(), 7);
  var hashTags = [];
  var data = posts.getValues().map(function (post) {
    var postUrl = post[0];
    if (postUrl) {
      try {
        var postData = getJson(postUrl).entry_data.PostPage[0].graphql.shortcode_media;
        if (postData) {
          var caption = postData.edge_media_to_caption.edges[0].node.text,
            tags = getTags(caption),
            imageUrl = postData.display_url;
          hashTags = hashTags.concat(tags);
          post[1] = postData.id;
          post[2] = tags.join(" ");
          post[3] = new Date(postData.taken_at_timestamp * 1000);
          post[4] = '=IMAGE("' + imageUrl + '")';
          post[5] = imageUrl;
        }
      } catch (e) {
        post[6] = e.message;
      }
    }
    return post;
  });
  posts.setValues(data);
  setTagData(hashTags);
}

function getJson(url) {
  var response = UrlFetchApp.fetch(url);
  var rs = response.getContentText().match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
  return JSON.parse(rs[1]);
}
