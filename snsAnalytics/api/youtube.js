var YOUTUBE_API_KEY = PropertiesService.getScriptProperties().getProperty('YOUTUBE_API_KEY');

// Request YouTube Data API
function getYoutubeData(part, channelId) {
  var url = 'https://www.googleapis.com/youtube/v3/channels?part=' + part + '&id=' + channelId + '&key=' + YOUTUBE_API_KEY;
  return UrlFetchApp.fetch(url);
}

// YouTube API
function doGet(e) {
  var part = e.parameter.part;
  var id = e.parameter.id;
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  if(part && id){
    var response = getYoutubeData(part, id);
    output.setContent(response.getContentText('UTF-8'));
  }else{
    output.setContent('not found part or id parameter');
  }
  return output;
}