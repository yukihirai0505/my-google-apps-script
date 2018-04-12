var ACCESS_TOKEN = "[your access token]"

function requestMediaId(shortCode) {
  var apiUrl = "https://api.instagram.com/v1/media/shortcode/" + shortCode + "?access_token=" + ACCESS_TOKEN,
    response = UrlFetchApp.fetch(apiUrl),
    json = JSON.parse(response.getContentText());
  return json.data.id;
}

function requestLikes(apiUrl) {
  var response = UrlFetchApp.fetch(apiUrl),
    json = JSON.parse(response.getContentText());
  return json.data;
}

function getLikes() {
  // only 120件
  // https://stackoverflow.com/questions/28013658/get-a-list-of-users-who-have-liked-specific-media-on-instagram
  var shortCode = "[the short code]",
    mediaId = requestMediaId(shortCode),
    likes = requestLikes("https://api.instagram.com/v1/media/" + mediaId + "/likes?access_token=" + ACCESS_TOKEN),
    to = "[your mail address]",
    body = likes.map(function (e) {
      return e.username;
    });
  MailApp.sendEmail(to, "https://www.instagram.com/p/" + shortCode + "/ likes", body);
}


  
