// SlackApp Library Key => M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO
var SLACK_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN'),
  FINISH_FLG_KEY = 'FINISH_FLG',
  FINISH_FLG = PropertiesService.getScriptProperties().getProperty(FINISH_FLG_KEY);

function checkSymbol() {
  var targetSymbol = 'VIPS',
    options = {
      muteHttpExceptions: true
    },
    response = UrlFetchApp.fetch('https://www.coinexchange.io/market/' + targetSymbol + '/BTC', options),
    statusCode = response.getResponseCode();
  if (!FINISH_FLG && statusCode === 200) {
    alertToSlack(targetSymbol);
    PropertiesService.getScriptProperties().setProperty(FINISH_FLG_KEY, true);
  }
}

function alertToSlack(symbol) {
  if (symbol) {
    var channelId = '@hogehoge',
      message = symbol + ' may list exchange!',
      options = {
        icon_url: 'https://iwiz-chie.c.yimg.jp/im_sigggNOJZoWpuOEEWhySVKfSbw---x320-y320-exp5m-n1/d/iwiz-chie/que-11165180776',
        link_names: 1,
        username: 'crypto currency alert'
      },
      slackApp = SlackApp.create(SLACK_ACCESS_TOKEN);

    slackApp.postMessage(channelId, message, options);
  } else {
    Logger.log('Not found symbol')
  }
}
