var BK = SpreadsheetApp.getActiveSpreadsheet(),
  MEDIA_SHEET = BK.getSheetByName('media_insight'),
  FACEBOOK_PARAMS = MEDIA_SHEET.getRange(2, 2, 2, 1).getValues(),
  FACEBOOK_PAGE_ACCESS_TOKEN = FACEBOOK_PARAMS[0],
  INSTAGRAM_BUSINESS_ACCOUNT_ID = FACEBOOK_PARAMS[1],
  FACEBOOK_GRAPH_API = 'https://graph.facebook.com/',
  ACCESS_TOKEN_PARAM = '&access_token=' + FACEBOOK_PAGE_ACCESS_TOKEN,
  USER_MEDIA_PARAMS = '/media?fields=media_url,timestamp,like_count,comments_count,permalink&pretty=0',
  USER_MEDIA_URL = FACEBOOK_GRAPH_API + INSTAGRAM_BUSINESS_ACCOUNT_ID + USER_MEDIA_PARAMS + ACCESS_TOKEN_PARAM,
  MEDIA_INSIGHT_PARAMS = '/insights?metric=impressions,engagement,reach,saved';

function onOpen() {
  function showMenu() {
    var menu = [
      {name: 'Get User Media Data', functionName: 'setMediaData'}
    ];
    BK.addMenu('Custom Management', menu);
  }

  showMenu();
}

function setMediaData() {
  var mediaObj = requestJson(USER_MEDIA_URL),
    data = mediaObj.data.map(function (e) {
      return [new Date(e.timestamp), e.id, '=IMAGE("' + e.media_url + '", 1)', e.permalink, e.like_count, e.comments_count];
    }),
    mediaData = shiftArray(data);

  MEDIA_SHEET.getRange(6, 2, mediaData.length, data.length).setValues(mediaData);
  setMediaInsightData();
}

function setMediaInsightData() {
  var data = MEDIA_SHEET.getRange(7, 2, 1, MEDIA_SHEET.getLastColumn()).getValues()[0].filter(function (e) {
      if (e) {
        return e;
      }
    }).map(function (mediaId) {
      var mediaInsightUrl = FACEBOOK_GRAPH_API + mediaId + MEDIA_INSIGHT_PARAMS + ACCESS_TOKEN_PARAM;
      var mediaInsightObjects = requestJson(mediaInsightUrl).data;
      var impressions,
        reach,
        saved;
      mediaInsightObjects.forEach(function (mediaInsightObj) {
        var dataName = mediaInsightObj.name,
          dataValue = mediaInsightObj.values[0].value;
        if (dataName === 'impressions') {
          impressions = dataValue;
        }
        if (dataName === 'reach') {
          reach = dataValue;
        }
        if (dataName === 'saved') {
          saved = dataValue;
        }
      });
      return [saved, reach, impressions];
    }),
    mediaInsightData = shiftArray(data);

  MEDIA_SHEET.getRange(12, 2, mediaInsightData.length, data.length).setValues(mediaInsightData);
}

function shiftArray(data) {
  var mediaData = [],
    dataFieldLength = data[0].length;
  for (var i = 0; i < dataFieldLength; i++) {
    var fieldData = data.map(function (e) {
      return e[i];
    });
    mediaData.push(fieldData);
  }
  return mediaData;
}

function requestJson(url) {
  return JSON.parse(UrlFetchApp.fetch(url, {muteHttpExceptions: true}));
}