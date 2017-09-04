var bk = SpreadsheetApp.getActiveSpreadsheet();
// sheet name
var igFollowerSheet = bk.getSheetByName("Instagram Follwer Daily Count");

function onOpen() {
  function showMenu() {
    var menu = [
      {name: "Get Instagram Follower Daily Count", functionName: "setIgFollowerData"}
    ];
    bk.addMenu("Custom Management", menu);
  }

  showMenu();
}

function setIgFollowerData() {
  function getRange(columnNumber) {
    var startRow = 2;
    return igFollowerSheet.getRange(startRow, columnNumber, igFollowerSheet.getLastRow(), 1);
  }

  function getFollowerNumber(accountUrl) {
    // Set 1 seconds interval
    Utilities.sleep(1000);
    var response = UrlFetchApp.fetch(encodeURI(accountUrl));
    var rs = response.getContentText().match(/<script type="text\/javascript">window\._sharedData =([\s\S]*?);<\/script>/i);
    var json = JSON.parse(rs[1]);
    return json.entry_data.ProfilePage[0].user.followed_by.count;
  }

  function getTodayColumn() {
    function dateFormat(date) {
      var formatType = 'yyyy/MM/dd';
      return Utilities.formatDate(date, 'JST', formatType);
    }

    var today = dateFormat(new Date());
    var row = 1;
    var startColumn = 2;
    var lastColumn = igFollowerSheet.getLastColumn();
    var values = igFollowerSheet.getRange(row, startColumn, row, lastColumn);
    var dateIndex = "";
    values.getValues()[0].filter(function (e, i) {
      if (e && dateFormat(e) === today) {
        dateIndex = i
      }
    });
    if (dateIndex !== "") {
      return igFollowerSheet.getRange(row, startColumn + dateIndex);
    } else {
      return igFollowerSheet.getRange(row, lastColumn + 1).setValue(today)
    }
  }

  var dateColumn = getTodayColumn(),
    accounts = getRange(1).getValues(),
    data = [];
  for (var i = 0; i < accounts.length; i++) {
    var account = accounts[i];
    var accountName = account[0];
    var accountUrl = "https://www.instagram.com/" + accountName + "/";
    if (!accountName) {
      data[i] = account;
      continue;
    }
    try {
      data[i] = [getFollowerNumber(accountUrl)];
    } catch (e) {
      data[i] = ['could\'t get'];
    }
  }
  getRange(dateColumn.getColumn()).setValues(data);
}


