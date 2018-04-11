var BK = SpreadsheetApp.getActiveSpreadsheet(),
  YOUTUBE_CHANNEL_SHEET = BK.getSheetByName('Youtube'),
  YOUTUBE_API_KEY = PropertiesService.getScriptProperties().getProperty('YOUTUBE_API_KEY');

function onOpen() {
  function showMenu() {
    var menu = [
      {name: 'Get Youtube subscriberCount', functionName: 'setYoutubeData'}
    ];
    BK.addMenu('Custom Menu', menu);
  }
  
  showMenu();
}

function setYoutubeData() {
  var range = YOUTUBE_CHANNEL_SHEET.getRange(2, 1, YOUTUBE_CHANNEL_SHEET.getLastRow(), 4);
  var data = range.getValues().map(function (e) {
    var channelId = e[0];
    if (channelId) {
      try {
        var url = 'https://www.googleapis.com/youtube/v3/channels?part=statistics&id=' + channelId + '&key=' + YOUTUBE_API_KEY;
        var json = JSON.parse(UrlFetchApp.fetch(url).getContentText('UTF-8'));
        var itemData = json.items[0];
        e[2] = itemData.statistics.subscriberCount;
      } catch (err) {
        e[2] = err.message;
      }
      e[3] = "https://www.youtube.com/channel/" + channelId;
    }
    return e;
  });
  range.setValues(data);
}