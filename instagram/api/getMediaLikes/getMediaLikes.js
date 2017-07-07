var accessToken = "[your access token]"

function requestMediaId(shortCode) {
  var apiUrl = "https://api.instagram.com/v1/media/shortcode/" + shortCode + "?access_token=" + accessToken;
  var response = UrlFetchApp.fetch(apiUrl);
  var json = JSON.parse(response.getContentText());
  return json.data.id;
}

function requestLikes(apiUrl) {
  var response = UrlFetchApp.fetch(apiUrl);
  var json = JSON.parse(response.getContentText());
  return json.data;
}

function getLikes() {
  // only 120件
  // https://stackoverflow.com/questions/28013658/get-a-list-of-users-who-have-liked-specific-media-on-instagram
  var shortCode = "[the short code]";
  var mediaId = requestMediaId(shortCode);
  var likes = requestLikes("https://api.instagram.com/v1/media/" + mediaId + "/likes?access_token=" + accessToken);
  var to = "[your mail address]";
  var body = likes.map(function (e) {
    return e.username;
  });
  MailApp.sendEmail(to, "https://www.instagram.com/p/" + shortCode + "/ likes", body);
}


  
